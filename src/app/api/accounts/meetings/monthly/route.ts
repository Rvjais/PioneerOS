import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import type { Prisma } from '@prisma/client'
import { safeJsonParse } from '@/shared/utils/safeJson'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createMonthlyReviewSchema = z.object({
  month: z.string().min(1),
  scheduledAt: z.string().optional(),
  participants: z.array(z.string()).optional(),
})

// GET /api/accounts/meetings/monthly - List all monthly reviews
export const GET = withAuth(async (req, { user, params }) => {
  try {
const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year')
    const status = searchParams.get('status')

    const where: Prisma.AccountsMonthlyReviewWhereInput = {}
    if (status) where.status = status
    if (year) {
      const startYear = new Date(`${year}-01-01`)
      const endYear = new Date(`${parseInt(year) + 1}-01-01`)
      where.month = { gte: startYear, lt: endYear }
    }

    const reviews = await prisma.accountsMonthlyReview.findMany({
      where,
      orderBy: { month: 'desc' }
    })

    return NextResponse.json({
      reviews: reviews.map(r => ({
        ...r,
        month: r.month.toISOString(),
        scheduledAt: r.scheduledAt?.toISOString(),
        conductedAt: r.conductedAt?.toISOString(),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        departmentROISummary: safeJsonParse(r.departmentROISummary, null),
        expenseByCategory: safeJsonParse(r.expenseByCategory, null),
        actionItems: safeJsonParse(r.actionItems, []),
        participants: safeJsonParse(r.participants, [])
      }))
    })
  } catch (error) {
    console.error('Failed to fetch monthly reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch monthly reviews' }, { status: 500 })
  }
})

// POST /api/accounts/meetings/monthly - Create/Initialize a monthly review
export const POST = withAuth(async (req, { user, params }) => {
  try {
const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const raw = await req.json()
    const parsed = createMonthlyReviewSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { month, scheduledAt, participants } = parsed.data

    const monthDate = new Date(`${month}-01`)

    // Check if review already exists
    const existing = await prisma.accountsMonthlyReview.findUnique({
      where: { month: monthDate }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Review for this month already exists' },
        { status: 409 }
      )
    }

    // Auto-calculate metrics from the month's data
    const nextMonth = new Date(monthDate)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    // Get payment data
    const payments = await prisma.paymentCollection.findMany({
      where: {
        retainerMonth: { gte: monthDate, lt: nextMonth },
        status: 'CONFIRMED'
      }
    })

    const totalCollected = payments.reduce((sum, p) => sum + p.grossAmount, 0)

    // Get active clients
    const clients = await prisma.client.findMany({
      where: { status: 'ACTIVE', deletedAt: null }
    })

    const activeClients = clients.length
    const totalExpectedRevenue = clients.reduce((sum, c) => sum + (c.monthlyFee || 0), 0)

    // Get new clients this month
    const newClients = await prisma.client.count({
      where: {
        createdAt: { gte: monthDate, lt: nextMonth },
        status: 'ACTIVE',
        deletedAt: null,
      }
    })

    // Get churned clients
    const churnedClients = await prisma.client.count({
      where: {
        updatedAt: { gte: monthDate, lt: nextMonth },
        status: 'LOST',
        deletedAt: null,
      }
    })

    // Get department ROI data
    const departmentExpenses = await prisma.departmentExpense.findMany({
      where: { month: monthDate }
    })

    const departmentROISummary = departmentExpenses.reduce((acc, e) => {
      acc[e.department] = {
        revenue: e.attributedRevenue,
        expense: e.totalExpense,
        roi: e.roi
      }
      return acc
    }, {} as Record<string, { revenue: number; expense: number; roi: number | null }>)

    // Calculate expense by category
    const expenseByCategory = departmentExpenses.reduce(
      (acc, e) => ({
        salary: acc.salary + e.totalSalaryComponent,
        tools: acc.tools + e.toolsExpense,
        freelancer: acc.freelancer + e.freelancerExpense,
        misc: acc.misc + e.miscExpense
      }),
      { salary: 0, tools: 0, freelancer: 0, misc: 0 }
    )

    // Calculate pending and overdue
    const totalPending = totalExpectedRevenue - totalCollected
    const overdueClients = await prisma.client.count({
      where: {
        status: 'ACTIVE',
        currentPaymentStatus: 'OVERDUE',
        deletedAt: null,
      }
    })

    // Estimate total overdue (simplified)
    const totalOverdue = overdueClients * (totalExpectedRevenue / Math.max(activeClients, 1))

    const collectionRate = totalExpectedRevenue > 0
      ? (totalCollected / totalExpectedRevenue) * 100
      : 0

    const review = await prisma.accountsMonthlyReview.create({
      data: {
        month: monthDate,
        totalExpectedRevenue,
        totalCollected,
        totalPending,
        totalOverdue,
        collectionRate,
        activeClients,
        newClients,
        churnedClients,
        departmentROISummary: JSON.stringify(departmentROISummary),
        expenseByCategory: JSON.stringify(expenseByCategory),
        status: 'SCHEDULED',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        participants: participants ? JSON.stringify(participants) : null
      }
    })

    return NextResponse.json({
      review: {
        ...review,
        month: review.month.toISOString(),
        scheduledAt: review.scheduledAt?.toISOString(),
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        departmentROISummary,
        expenseByCategory,
        actionItems: [],
        participants: participants || []
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create monthly review:', error)
    return NextResponse.json({ error: 'Failed to create monthly review' }, { status: 500 })
  }
})
