import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import type { Prisma } from '@prisma/client'
import { safeJsonParse } from '@/shared/utils/safeJson'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createQuarterlyReviewSchema = z.object({
  quarter: z.number().min(1).max(4),
  year: z.number().min(2020),
  scheduledAt: z.string().optional(),
  participants: z.array(z.string()).optional(),
})

const updateQuarterlyReviewSchema = z.object({
  id: z.string().optional(),
  quarter: z.number().optional(),
  year: z.number().optional(),
  nextQuarterForecast: z.number().optional(),
  badDebtAmount: z.number().optional(),
  strategicGoals: z.array(z.unknown()).optional(),
  actionItems: z.array(z.unknown()).optional(),
  meetingNotes: z.string().optional(),
  participants: z.array(z.string()).optional(),
  writeOffClients: z.array(z.unknown()).optional(),
  status: z.string().optional(),
  scheduledAt: z.string().nullable().optional(),
})

// GET /api/accounts/meetings/quarterly - List all quarterly reviews
export const GET = withAuth(async (req, { user, params }) => {
  try {
const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year')
    const quarter = searchParams.get('quarter')
    const status = searchParams.get('status')

    const where: Prisma.AccountsQuarterlyReviewWhereInput = {}
    if (year) where.year = parseInt(year)
    if (quarter) where.quarter = parseInt(quarter)
    if (status) where.status = status

    const reviews = await prisma.accountsQuarterlyReview.findMany({
      where,
      orderBy: [{ year: 'desc' }, { quarter: 'desc' }]
    })

    return NextResponse.json({
      reviews: reviews.map(r => ({
        ...r,
        scheduledAt: r.scheduledAt?.toISOString(),
        conductedAt: r.conductedAt?.toISOString(),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        writeOffClients: safeJsonParse(r.writeOffClients, []),
        strategicGoals: safeJsonParse(r.strategicGoals, []),
        actionItems: safeJsonParse(r.actionItems, []),
        participants: safeJsonParse(r.participants, [])
      }))
    })
  } catch (error) {
    console.error('Failed to fetch quarterly reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch quarterly reviews' }, { status: 500 })
  }
})

// POST /api/accounts/meetings/quarterly - Create/Initialize a quarterly review
export const POST = withAuth(async (req, { user, params }) => {
  try {
const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const raw = await req.json()
    const parsed = createQuarterlyReviewSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { quarter, year, scheduledAt, participants } = parsed.data

    // Check if review already exists
    const existing = await prisma.accountsQuarterlyReview.findUnique({
      where: { quarter_year: { quarter, year } }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Review for this quarter already exists' },
        { status: 409 }
      )
    }

    // Calculate quarter date range
    const quarterStartMonth = (quarter - 1) * 3
    const quarterStart = new Date(year, quarterStartMonth, 1)
    const quarterEnd = new Date(year, quarterStartMonth + 3, 1)

    // Previous quarter
    const prevQuarterStart = new Date(quarterStart)
    prevQuarterStart.setMonth(prevQuarterStart.getMonth() - 3)
    const prevQuarterEnd = new Date(quarterStart)

    // Get quarterly revenue (current)
    const currentPayments = await prisma.paymentCollection.findMany({
      where: {
        retainerMonth: { gte: quarterStart, lt: quarterEnd },
        status: 'CONFIRMED'
      }
    })
    const quarterlyRevenue = currentPayments.reduce((sum, p) => sum + p.grossAmount, 0)

    // Get previous quarter revenue
    const prevPayments = await prisma.paymentCollection.findMany({
      where: {
        retainerMonth: { gte: prevQuarterStart, lt: prevQuarterEnd },
        status: 'CONFIRMED'
      }
    })
    const previousQuarterRev = prevPayments.reduce((sum, p) => sum + p.grossAmount, 0)

    // Revenue growth
    const revenueGrowthPct = previousQuarterRev > 0
      ? ((quarterlyRevenue - previousQuarterRev) / previousQuarterRev) * 100
      : quarterlyRevenue > 0 ? 100 : 0

    // Cash flow (simplified - would need expense tracking)
    const cashInflow = quarterlyRevenue
    const cashOutflow = 0 // Would calculate from expenses
    const netCashFlow = cashInflow - cashOutflow

    // Get lost/churned clients (potential bad debt)
    const lostClients = await prisma.client.findMany({
      where: {
        updatedAt: { gte: quarterStart, lt: quarterEnd },
        status: 'LOST',
        pendingAmount: { gt: 0 },
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        pendingAmount: true,
        lostReason: true
      }
    })

    const badDebtAmount = lostClients.reduce((sum, c) => sum + (c.pendingAmount || 0), 0)
    const writeOffClients = lostClients.map(c => ({
      clientId: c.id,
      name: c.name,
      amount: c.pendingAmount,
      reason: c.lostReason
    }))

    // Client retention rate
    const activeClientsStart = await prisma.client.count({
      where: {
        createdAt: { lt: quarterStart },
        status: 'ACTIVE',
        deletedAt: null,
      }
    })

    const churnedThisQuarter = await prisma.client.count({
      where: {
        createdAt: { lt: quarterStart },
        updatedAt: { gte: quarterStart, lt: quarterEnd },
        status: 'LOST',
        deletedAt: null,
      }
    })

    const clientRetentionRate = activeClientsStart > 0
      ? ((activeClientsStart - churnedThisQuarter) / activeClientsStart) * 100
      : 100

    // Average collection days (simplified)
    const avgCollectionDays = 15 // Would calculate from actual invoice-to-payment dates

    const review = await prisma.accountsQuarterlyReview.create({
      data: {
        quarter,
        year,
        quarterlyRevenue,
        previousQuarterRev,
        revenueGrowthPct,
        cashInflow,
        cashOutflow,
        netCashFlow,
        badDebtAmount,
        writeOffClients: JSON.stringify(writeOffClients),
        avgCollectionDays,
        clientRetentionRate,
        status: 'SCHEDULED',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        participants: participants ? JSON.stringify(participants) : null
      }
    })

    return NextResponse.json({
      review: {
        ...review,
        scheduledAt: review.scheduledAt?.toISOString(),
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        writeOffClients,
        strategicGoals: [],
        actionItems: [],
        participants: participants || []
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create quarterly review:', error)
    return NextResponse.json({ error: 'Failed to create quarterly review' }, { status: 500 })
  }
})

// PUT /api/accounts/meetings/quarterly - Update a quarterly review
export const PUT = withAuth(async (req, { user, params }) => {
  try {
const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const raw = await req.json()
    const parsedBody = updateQuarterlyReviewSchema.safeParse(raw)
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsedBody.error.flatten() }, { status: 400 })
    }
    const body = parsedBody.data
    const { id, quarter, year } = body

    // Find by id or quarter+year
    let reviewId = id
    if (!reviewId && quarter && year) {
      const found = await prisma.accountsQuarterlyReview.findUnique({
        where: { quarter_year: { quarter, year } }
      })
      if (!found) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 })
      }
      reviewId = found.id
    }

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID or quarter+year required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}

    // Financial updates
    if (body.nextQuarterForecast !== undefined) updateData.nextQuarterForecast = body.nextQuarterForecast
    if (body.badDebtAmount !== undefined) updateData.badDebtAmount = body.badDebtAmount

    // Content updates
    if (body.strategicGoals !== undefined) updateData.strategicGoals = JSON.stringify(body.strategicGoals)
    if (body.actionItems !== undefined) updateData.actionItems = JSON.stringify(body.actionItems)
    if (body.meetingNotes !== undefined) updateData.meetingNotes = body.meetingNotes
    if (body.participants !== undefined) updateData.participants = JSON.stringify(body.participants)
    if (body.writeOffClients !== undefined) updateData.writeOffClients = JSON.stringify(body.writeOffClients)

    // Status updates
    if (body.status) {
      updateData.status = body.status
      if (body.status === 'COMPLETED') {
        updateData.conductedAt = new Date()
        updateData.conductedBy = user.id
      }
    }

    if (body.scheduledAt !== undefined) {
      updateData.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null
    }

    const review = await prisma.accountsQuarterlyReview.update({
      where: { id: reviewId },
      data: updateData
    })

    return NextResponse.json({
      review: {
        ...review,
        scheduledAt: review.scheduledAt?.toISOString(),
        conductedAt: review.conductedAt?.toISOString(),
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        writeOffClients: safeJsonParse(review.writeOffClients, []),
        strategicGoals: safeJsonParse(review.strategicGoals, []),
        actionItems: safeJsonParse(review.actionItems, []),
        participants: safeJsonParse(review.participants, [])
      }
    })
  } catch (error) {
    console.error('Failed to update quarterly review:', error)
    return NextResponse.json({ error: 'Failed to update quarterly review' }, { status: 500 })
  }
})
