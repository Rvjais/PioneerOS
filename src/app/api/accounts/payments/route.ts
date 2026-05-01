import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import {
  TAX_CONFIG,
  RECONCILIATION_CONFIG,
  calculateTDS,
  calculateNetAmount
} from '@/shared/constants/config/accounts'
import { syncPaymentStatus } from '@/server/services/clientIntegrity'
import { sendPaymentReceivedEmail } from '@/server/email/email'
import { withAuth } from '@/server/auth/withAuth'
import { checkRateLimit } from '@/server/security/rateLimit'

// Validation schema for payment creation
const PaymentSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  invoiceId: z.string().optional().nullable(),
  grossAmount: z.number().positive('Gross amount must be positive').max(100000000, 'Amount exceeds maximum'),
  tdsDeducted: z.number().min(0).optional(),
  tdsPercentage: z.number().min(0).max(100).optional(),
  gstAmount: z.number().min(0).optional(),
  collectedAt: z.string().datetime().refine(
    (date) => new Date(date) <= new Date(),
    { message: 'Payment date cannot be in the future' }
  ).optional(),
  paymentMethod: z.enum(['CASH', 'CHEQUE', 'NEFT', 'RTGS', 'IMPS', 'UPI', 'CARD']).optional(),
  transactionRef: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  retainerMonth: z.string().optional(),
  serviceType: z.enum(['RETAINER', 'PROJECT', 'ONE_TIME', 'ADVANCE', 'OTHER']).optional(),
  description: z.string().optional(),
  entityType: z.enum(['BRANDING_PIONEERS', 'PIONEER_MEDIA']).optional(),
  notes: z.string().optional(),
  forceSave: z.boolean().optional(),
})

// GET /api/accounts/payments - List all payment collections
export const GET = withAuth(async (req, { user, params }) => {
  const financialRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'OPERATIONS_HEAD']
  if (!financialRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    // Rate limit: 30 requests per minute per user
    const rateLimitResult = await checkRateLimit(`accounts-payments:${user.id}`, {
      maxRequests: 30,
      windowMs: 60 * 1000,
    })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter || 60) } }
      )
    }

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const month = searchParams.get('month') // Format: YYYY-MM
    const entity = searchParams.get('entity')
    const limitParam = searchParams.get('limit')

    const where: Prisma.PaymentCollectionWhereInput = {}
    if (clientId) where.clientId = clientId
    if (entity) where.entityType = entity
    if (month) {
      const startDate = new Date(`${month}-01`)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      where.collectedAt = { gte: startDate, lt: endDate }
    }

    const payments = await prisma.paymentCollection.findMany({
      where,
      include: {
        client: {
          select: { id: true, name: true, tier: true }
        },
        invoice: {
          select: { id: true, invoiceNumber: true }
        }
      },
      orderBy: { collectedAt: 'desc' },
      take: limitParam ? Math.min(parseInt(limitParam) || 50, 200) : 50
    })

    // Calculate summary from ALL matching payments (not just the paginated subset)
    const [aggregates, totalCount] = await Promise.all([
      prisma.paymentCollection.aggregate({
        where,
        _sum: {
          grossAmount: true,
          tdsDeducted: true,
          gstAmount: true,
          netAmount: true,
        },
      }),
      prisma.paymentCollection.count({ where }),
    ])

    const summary = {
      totalGross: aggregates._sum.grossAmount ?? 0,
      totalTds: aggregates._sum.tdsDeducted ?? 0,
      totalGst: aggregates._sum.gstAmount ?? 0,
      totalNet: aggregates._sum.netAmount ?? 0,
      count: totalCount,
    }

    return NextResponse.json({
      payments: payments.map(p => ({
        ...p,
        collectedAt: p.collectedAt.toISOString(),
        retainerMonth: p.retainerMonth?.toISOString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      summary
    })
  } catch (error) {
    console.error('Failed to fetch payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
})

// POST /api/accounts/payments - Record a new payment
export const POST = withAuth(async (req, { user, params }) => {
  try {
    // Rate limit: 10 requests per minute per user for payment creation
    const rateLimitResult = await checkRateLimit(`accounts-payments-create:${user.id}`, {
      maxRequests: 10,
      windowMs: 60 * 1000,
    })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter || 60) } }
      )
    }

    // Check if user has accounts access
    const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role)
    if (!hasAccess && user.department !== 'ACCOUNTS') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    // Validate request body with Zod
    const parseResult = PaymentSchema.safeParse(body)
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]
      return NextResponse.json(
        { error: firstError?.message || 'Invalid payment data' },
        { status: 400 }
      )
    }

    const {
      clientId,
      invoiceId,
      grossAmount,
      tdsDeducted,
      tdsPercentage,
      gstAmount,
      collectedAt,
      paymentMethod,
      transactionRef,
      bankName,
      accountNumber,
      retainerMonth,
      serviceType,
      description,
      entityType,
      notes,
    } = parseResult.data

    // Check for duplicate payments
    const collectionDate = collectedAt ? new Date(collectedAt) : new Date()
    const duplicateCheckStart = new Date(collectionDate)
    duplicateCheckStart.setDate(duplicateCheckStart.getDate() - RECONCILIATION_CONFIG.DUPLICATE_DATE_RANGE_DAYS)
    const duplicateCheckEnd = new Date(collectionDate)
    duplicateCheckEnd.setDate(duplicateCheckEnd.getDate() + RECONCILIATION_CONFIG.DUPLICATE_DATE_RANGE_DAYS)

    const existingPayments = await prisma.paymentCollection.findMany({
      where: {
        clientId,
        collectedAt: { gte: duplicateCheckStart, lte: duplicateCheckEnd }
      },
      select: { id: true, grossAmount: true, collectedAt: true, transactionRef: true }
    })

    // Check if any existing payment is too similar
    const amountTolerance = grossAmount * RECONCILIATION_CONFIG.DUPLICATE_AMOUNT_TOLERANCE
    const potentialDuplicate = existingPayments.find(p => {
      const amountMatch = Math.abs(p.grossAmount - grossAmount) <= amountTolerance
      const refMatch = transactionRef && p.transactionRef === transactionRef
      return amountMatch || refMatch
    })

    if (potentialDuplicate && !body.forceSave) {
      return NextResponse.json({
        error: 'Potential duplicate payment detected',
        duplicate: {
          id: potentialDuplicate.id,
          grossAmount: potentialDuplicate.grossAmount,
          collectedAt: potentialDuplicate.collectedAt.toISOString(),
          transactionRef: potentialDuplicate.transactionRef
        },
        message: 'A similar payment exists. Set forceSave=true to save anyway.'
      }, { status: 409 })
    }

    // Calculate net amount using config
    const tdsPercent = tdsPercentage ?? TAX_CONFIG.TDS_DEFAULT_PERCENTAGE
    const tds = tdsDeducted ?? calculateTDS(grossAmount, tdsPercent)
    const netAmount = calculateNetAmount(grossAmount, tds)

    // SECURITY FIX: Use transaction to ensure all operations succeed or fail together
    const payment = await prisma.$transaction(async (tx) => {
      // If invoice is provided, verify the amount
      if (invoiceId) {
        const invoice = await tx.invoice.findUnique({
          where: { id: invoiceId },
          select: { total: true, status: true }
        })
        if (!invoice) {
          throw new Error('Invoice not found')
        }
        if (invoice.status === 'PAID') {
          throw new Error('Invoice is already paid')
        }
      }

      const newPayment = await tx.paymentCollection.create({
        data: {
          clientId,
          invoiceId: invoiceId || null,
          grossAmount,
          tdsDeducted: tds,
          tdsPercentage: tdsPercent,
          gstAmount: gstAmount || 0,
          netAmount,
          collectedAt: collectedAt ? new Date(collectedAt) : new Date(),
          collectedBy: user.id,
          paymentMethod: paymentMethod || 'NEFT',
          transactionRef,
          bankName,
          accountNumber,
          retainerMonth: retainerMonth ? new Date(retainerMonth) : null,
          serviceType: serviceType || 'RETAINER',
          description,
          entityType: entityType || 'BRANDING_PIONEERS',
          notes
        },
        include: {
          client: { select: { id: true, name: true } }
        }
      })

      // Get current client state for proper status calculation
      const client = await tx.client.findUnique({
        where: { id: clientId },
        select: { pendingAmount: true }
      })

      const currentPending = client?.pendingAmount || 0
      const newPending = Math.max(0, currentPending - grossAmount) // Prevent negative

      // Determine payment status based on remaining amount
      let newPaymentStatus: 'PAID' | 'PARTIAL' | 'PENDING' = 'PENDING'
      if (newPending === 0) {
        newPaymentStatus = 'PAID'
      } else if (grossAmount > 0) {
        newPaymentStatus = 'PARTIAL'
      }

      // Update client payment status
      await tx.client.update({
        where: { id: clientId },
        data: {
          paymentStatus: newPaymentStatus,
          pendingAmount: newPending
        }
      })

      // If linked to invoice, check if fully paid before updating status
      if (invoiceId) {
        const invoice = await tx.invoice.findUnique({
          where: { id: invoiceId },
          select: { total: true }
        })

        // Get total payments for this invoice
        const totalPayments = await tx.paymentCollection.aggregate({
          where: { invoiceId },
          _sum: { grossAmount: true }
        })

        const paidAmount = (totalPayments._sum.grossAmount || 0)
        const invoiceTotal = invoice?.total || 0

        // Only mark as PAID if fully settled, otherwise PARTIAL
        const invoiceStatus = paidAmount >= invoiceTotal ? 'PAID' : 'PARTIAL'

        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            status: invoiceStatus,
            paidAt: invoiceStatus === 'PAID' ? new Date() : null,
            paidAmount: paidAmount
          }
        })
      }

      return newPayment
    })

    // Sync payment status to ensure consistency (outside transaction)
    await syncPaymentStatus(clientId)

    // Auto-send payment confirmation email
    try {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { name: true, contactName: true, contactEmail: true }
      })
      if (client?.contactEmail) {
        const formattedAmount = new Intl.NumberFormat('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(grossAmount)

        await sendPaymentReceivedEmail(client.contactEmail, {
          clientName: client.name,
          contactName: client.contactName || undefined,
          amount: formattedAmount,
          invoiceNumber: invoiceId ? (await prisma.invoice.findUnique({ where: { id: invoiceId }, select: { invoiceNumber: true } }))?.invoiceNumber || '' : '',
          transactionRef: transactionRef || undefined,
          currency: 'INR',
        }).catch((err) => console.error('[Payments] Failed to send payment email:', err))
      }
    } catch (err) { console.error('[Payments] Non-blocking email error:', err) }

    return NextResponse.json({
      payment: {
        ...payment,
        collectedAt: payment.collectedAt.toISOString(),
        retainerMonth: payment.retainerMonth?.toISOString(),
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString(),
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to record payment:', error)
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
  }
})
