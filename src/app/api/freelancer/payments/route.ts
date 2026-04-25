import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { parseMoney } from '@/shared/utils/money'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const FreelancerPaymentSchema = z.object({
  freelancerProfileId: z.string().min(1, 'Freelancer profile ID is required'),
  amount: z.union([
    z.number().positive('Amount must be positive').max(10000000, 'Amount cannot exceed 10,000,000'),
    z.string().min(1, 'Amount is required'),
  ]),
  paymentDate: z.string().min(1, 'Payment date is required').refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid payment date format' }),
  paymentMethod: z.enum(['BANK_TRANSFER', 'UPI', 'CHEQUE', 'CASH', 'PAYPAL', 'OTHER']),
  transactionRef: z.string().max(200).optional().nullable(),
  invoiceNumber: z.string().max(100).optional().nullable(),
  invoiceUrl: z.string().url('Invalid invoice URL').max(500).optional().nullable(),
  periodStart: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid period start date' }).optional().nullable(),
  periodEnd: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid period end date' }).optional().nullable(),
  workReportIds: z.array(z.string()).optional().nullable(),
  notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional().nullable(),
})

// GET - List payments
export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const freelancerId = searchParams.get('freelancerId')

    const where: Record<string, unknown> = {}

    // If user is a freelancer, only show their payments
    if (user.role === 'FREELANCER') {
      const freelancerProfile = await prisma.freelancerProfile.findUnique({
        where: { userId: user.id },
      })
      if (!freelancerProfile) {
        return NextResponse.json({ error: 'Freelancer profile not found' }, { status: 404 })
      }
      where.freelancerProfileId = freelancerProfile.id
    } else {
      // SECURITY FIX: Non-freelancers must be admin/accounts to view payments
      const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS']
      if (!allowedRoles.includes(user.role || '')) {
        return NextResponse.json({ error: 'Forbidden - Payment data requires finance access' }, { status: 403 })
      }
      if (freelancerId) {
        where.freelancerProfileId = freelancerId
      }
    }

    if (status) where.status = status

    const payments = await prisma.freelancerPayment.findMany({
      where,
      include: {
        freelancerProfile: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    })

    // Map user details to top-level for API compatibility
    const paymentsWithUsers = payments.map((payment) => ({
      ...payment,
      user: payment.freelancerProfile.user,
    }))

    return NextResponse.json({ payments: paymentsWithUsers })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST - Create payment (Admin only)
export const POST = withAuth(async (req, { user, params }) => {
  try {
    // Only admin and accounts can create payments
    if (!['SUPER_ADMIN', 'ACCOUNTS', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await req.json()
    const parseResult = FreelancerPaymentSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const {
      freelancerProfileId,
      amount,
      paymentDate,
      paymentMethod,
      transactionRef,
      invoiceNumber,
      invoiceUrl,
      periodStart,
      periodEnd,
      workReportIds,
      notes,
    } = parseResult.data

    const payment = await prisma.freelancerPayment.create({
      data: {
        freelancerProfileId,
        amount: parseMoney(amount),
        paymentDate: new Date(paymentDate),
        paymentMethod,
        transactionRef,
        invoiceNumber,
        invoiceUrl,
        periodStart: periodStart ? new Date(periodStart) : new Date(),
        periodEnd: periodEnd ? new Date(periodEnd) : new Date(),
        workReportIds: workReportIds ? JSON.stringify(workReportIds) : null,
        notes,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PATCH - Update payment status (Admin only)
export const PATCH = withAuth(async (req, { user, params }) => {
  try {
    // Only admin and accounts can update payments
    if (!['SUPER_ADMIN', 'ACCOUNTS', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await req.json()
    const { paymentId, status, transactionRef, notes } = body

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }

    const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const payment = await prisma.freelancerPayment.update({
      where: { id: paymentId },
      data: {
        ...(status && { status }),
        ...(transactionRef && { transactionRef }),
        ...(notes && { notes }),
        ...(status === 'COMPLETED' && { processedAt: new Date(), processedBy: user.id }),
      },
    })

    // If payment is completed and has linked work reports, mark them as paid
    if (status === 'COMPLETED' && payment.workReportIds) {
      let reportIds: string[] = []
      try {
        const parsed = JSON.parse(payment.workReportIds as string)
        if (Array.isArray(parsed)) {
          reportIds = parsed.filter((id): id is string => typeof id === 'string' && id.length > 0)
        }
      } catch {
        console.error(`Invalid workReportIds JSON for payment ${payment.id}`)
      }

      if (reportIds.length > 0) {
        await prisma.freelancerWorkReport.updateMany({
          where: { id: { in: reportIds } },
          data: { status: 'PAID' },
        })

        // Update freelancer profile
        const totalPaid = await prisma.freelancerWorkReport.aggregate({
          where: { id: { in: reportIds } },
          _sum: { billableAmount: true },
        })

        if (totalPaid._sum.billableAmount) {
          await prisma.freelancerProfile.update({
            where: { id: payment.freelancerProfileId },
            data: {
              totalEarned: { increment: totalPaid._sum.billableAmount },
              pendingAmount: { decrement: totalPaid._sum.billableAmount },
            },
          })
        }
      }
    }

    return NextResponse.json({ payment })
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
