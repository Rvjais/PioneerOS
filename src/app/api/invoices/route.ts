import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { getPaginationParams, paginatedResponse } from '@/shared/utils/pagination'
import { z } from 'zod'
import { generateSimpleInvoiceNumber } from '@/server/db/sequence'
import { sendInvoiceEmail } from '@/server/email/email'

// Roles that can view/manage invoices
const INVOICE_ROLES = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'SALES']

// Validation schema for creating invoices
const createInvoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  tax: z.number().min(0).optional().default(0),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'dueDate must be a valid date string' }),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().int().positive(),
    rate: z.number().min(0),
  })).optional(),
  notes: z.string().max(2000).optional(),
})

// GET - List all invoices with pagination
export const GET = withAuth(async (req, { user }) => {
  // Permission check
  const canViewInvoices = INVOICE_ROLES.includes(user.role) ||
    user.department === 'ACCOUNTS'

  if (!canViewInvoices) {
    return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const clientId = searchParams.get('clientId')

  // Pagination
  const { skip, take, page, limit } = getPaginationParams(req)

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (clientId) where.clientId = clientId

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take,
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.invoice.count({ where }),
  ])

  return NextResponse.json(paginatedResponse(invoices, total, page, limit))
})

// POST - Create new invoice
export const POST = withAuth(async (req, { user }) => {
  // Permission check - stricter for creation
  const canCreateInvoice = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
    user.department === 'ACCOUNTS'

  if (!canCreateInvoice) {
    return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 })
  }

  const body = await req.json()

  // Validate request body
  const result = createInvoiceSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { clientId, amount, tax, dueDate, items, notes } = result.data
  const sendImmediately = body.sendImmediately === true

  // If items are provided, calculate amount from line items and use that
  let finalAmount = amount
  if (items && items.length > 0) {
    const calculatedAmount = items.reduce((sum: number, item: { quantity: number; rate: number }) => sum + (item.quantity * item.rate), 0)
    finalAmount = calculatedAmount
  }

  // Verify client exists
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true }
  })

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Generate invoice number atomically (prevents race conditions)
  const nextInvoiceNumber = await generateSimpleInvoiceNumber()
  const total = Math.round((finalAmount + tax) * 100) / 100

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: nextInvoiceNumber,
      clientId,
      amount: finalAmount,
      tax,
      total,
      dueDate: new Date(dueDate),
      items: items ? JSON.stringify(items) : null,
      notes,
      status: 'DRAFT'
    },
    include: {
      client: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  // If sendImmediately is true, send the invoice to the client via email
  if (sendImmediately && client) {
    try {
      const formattedAmount = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(total)

      const formattedDueDate = new Date(dueDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })

      const clientFull = await prisma.client.findUnique({
        where: { id: clientId },
        select: { contactEmail: true, contactName: true, name: true }
      })

      if (clientFull?.contactEmail) {
        const emailResult = await sendInvoiceEmail(clientFull.contactEmail, {
          clientName: clientFull.name,
          contactName: clientFull.contactName || clientFull.name,
          invoiceNumber: nextInvoiceNumber,
          amount: formattedAmount,
          dueDate: formattedDueDate,
          currency: 'INR',
          notes: notes || undefined,
        })

        if (emailResult.success) {
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: 'SENT' },
          })
        }
      }
    } catch (err) { console.error('[Invoices] Non-blocking email error:', err) }
  }

  return NextResponse.json(invoice, { status: 201 })
})
