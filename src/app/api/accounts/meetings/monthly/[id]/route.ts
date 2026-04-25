import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { safeJsonParse } from '@/shared/utils/safeJson'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const updateMonthlyReviewSchema = z.object({
  keyHighlights: z.string().optional(),
  challenges: z.string().optional(),
  actionItems: z.array(z.unknown()).optional(),
  meetingNotes: z.string().optional(),
  participants: z.array(z.string()).optional(),
  status: z.string().optional(),
  scheduledAt: z.string().nullable().optional(),
})

// GET /api/accounts/meetings/monthly/[id] - Get a specific monthly review
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await routeParams!

    const review = await prisma.accountsMonthlyReview.findUnique({
      where: { id }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Get additional context data for the review
    const monthDate = review.month
    const nextMonth = new Date(monthDate)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    // Get client payment status breakdown
    const clientPaymentStatus = await prisma.client.groupBy({
      by: ['currentPaymentStatus'],
      where: { status: 'ACTIVE', deletedAt: null },
      _count: true
    })

    // Get top paying clients
    const topPayments = await prisma.paymentCollection.findMany({
      where: {
        retainerMonth: { gte: monthDate, lt: nextMonth },
        status: 'CONFIRMED'
      },
      include: {
        client: { select: { id: true, name: true } }
      },
      orderBy: { grossAmount: 'desc' },
      take: 10
    })

    // Get overdue clients list
    const overdueClients = await prisma.client.findMany({
      where: {
        status: 'ACTIVE',
        currentPaymentStatus: 'OVERDUE',
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        pendingAmount: true,
        paymentDueDay: true
      }
    })

    // Get department expense details
    const departmentExpenses = await prisma.departmentExpense.findMany({
      where: { month: monthDate }
    })

    // Parse JSON fields from review
    const participants = safeJsonParse<string[]>(review.participants, [])

    // Get participant user details if any
    let participantUsers: { id: string; firstName: string; lastName: string | null; department: string }[] = []
    if (participants.length > 0) {
      participantUsers = await prisma.user.findMany({
        where: { id: { in: participants }, deletedAt: null },
        select: { id: true, firstName: true, lastName: true, department: true }
      })
    }

    return NextResponse.json({
      review: {
        ...review,
        month: review.month.toISOString(),
        scheduledAt: review.scheduledAt?.toISOString(),
        conductedAt: review.conductedAt?.toISOString(),
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        departmentROISummary: safeJsonParse(review.departmentROISummary, null),
        expenseByCategory: safeJsonParse(review.expenseByCategory, null),
        actionItems: safeJsonParse(review.actionItems, []),
        participants: participantUsers
      },
      context: {
        clientPaymentStatus,
        topPayments: topPayments.map(p => ({
          ...p,
          collectedAt: p.collectedAt.toISOString(),
          retainerMonth: p.retainerMonth?.toISOString()
        })),
        overdueClients,
        departmentExpenses: departmentExpenses.map(e => ({
          ...e,
          month: e.month.toISOString()
        }))
      }
    })
  } catch (error) {
    console.error('Failed to fetch monthly review:', error)
    return NextResponse.json({ error: 'Failed to fetch monthly review' }, { status: 500 })
  }
})

// PUT /api/accounts/meetings/monthly/[id] - Update a monthly review
export const PUT = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await routeParams!
    const raw = await req.json()
    const parsed = updateMonthlyReviewSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const {
      keyHighlights,
      challenges,
      actionItems,
      meetingNotes,
      participants,
      status,
      scheduledAt
    } = parsed.data

    const updateData: Record<string, unknown> = {}

    if (keyHighlights !== undefined) updateData.keyHighlights = keyHighlights
    if (challenges !== undefined) updateData.challenges = challenges
    if (meetingNotes !== undefined) updateData.meetingNotes = meetingNotes

    if (actionItems !== undefined) {
      updateData.actionItems = JSON.stringify(actionItems)
    }

    if (participants !== undefined) {
      updateData.participants = JSON.stringify(participants)
    }

    if (status) {
      updateData.status = status
      if (status === 'IN_PROGRESS') {
        // Meeting started
      } else if (status === 'COMPLETED') {
        updateData.conductedAt = new Date()
        updateData.conductedBy = user.id
      }
    }

    if (scheduledAt !== undefined) {
      updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null
    }

    const review = await prisma.accountsMonthlyReview.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      review: {
        ...review,
        month: review.month.toISOString(),
        scheduledAt: review.scheduledAt?.toISOString(),
        conductedAt: review.conductedAt?.toISOString(),
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        departmentROISummary: safeJsonParse(review.departmentROISummary, null),
        expenseByCategory: safeJsonParse(review.expenseByCategory, null),
        actionItems: safeJsonParse(review.actionItems, []),
        participants: safeJsonParse(review.participants, [])
      }
    })
  } catch (error) {
    console.error('Failed to update monthly review:', error)
    return NextResponse.json({ error: 'Failed to update monthly review' }, { status: 500 })
  }
})

// PATCH /api/accounts/meetings/monthly/[id] - Refresh metrics for a review
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const hasAccess = ['SUPER_ADMIN', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await routeParams!

    const review = await prisma.accountsMonthlyReview.findUnique({
      where: { id }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Recalculate metrics
    const monthDate = review.month
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

    // Get new clients
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

    const expenseByCategory = departmentExpenses.reduce(
      (acc, e) => ({
        salary: acc.salary + e.totalSalaryComponent,
        tools: acc.tools + e.toolsExpense,
        freelancer: acc.freelancer + e.freelancerExpense,
        misc: acc.misc + e.miscExpense
      }),
      { salary: 0, tools: 0, freelancer: 0, misc: 0 }
    )

    const totalPending = totalExpectedRevenue - totalCollected
    const collectionRate = totalExpectedRevenue > 0
      ? (totalCollected / totalExpectedRevenue) * 100
      : 0

    const updatedReview = await prisma.accountsMonthlyReview.update({
      where: { id },
      data: {
        totalExpectedRevenue,
        totalCollected,
        totalPending,
        collectionRate,
        activeClients,
        newClients,
        churnedClients,
        departmentROISummary: JSON.stringify(departmentROISummary),
        expenseByCategory: JSON.stringify(expenseByCategory)
      }
    })

    return NextResponse.json({
      review: {
        ...updatedReview,
        month: updatedReview.month.toISOString(),
        scheduledAt: updatedReview.scheduledAt?.toISOString(),
        conductedAt: updatedReview.conductedAt?.toISOString(),
        createdAt: updatedReview.createdAt.toISOString(),
        updatedAt: updatedReview.updatedAt.toISOString(),
        departmentROISummary,
        expenseByCategory,
        actionItems: safeJsonParse(updatedReview.actionItems, []),
        participants: safeJsonParse(updatedReview.participants, [])
      },
      refreshedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to refresh monthly review:', error)
    return NextResponse.json({ error: 'Failed to refresh monthly review' }, { status: 500 })
  }
})
