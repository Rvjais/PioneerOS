import { NextRequest, NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'

// GET /api/client-portal/deliverables - Get deliverables for client
export const GET = withClientAuth(async (req: NextRequest, { user }) => {
  const clientId = user.clientId

  // Get query params
  const { searchParams } = new URL(req.url)
  const monthParam = searchParams.get('month')
  const category = searchParams.get('category')

  // Build filter
  const where: Record<string, unknown> = { clientId }

  if (monthParam) {
    const month = new Date(monthParam)
    month.setDate(1)
    month.setHours(0, 0, 0, 0)
    const nextMonth = new Date(month)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    where.month = {
      gte: month,
      lt: nextMonth,
    }
  }

  if (category) {
    where.category = category
  }

  // Fetch deliverables from ClientScope
  const deliverables = await prisma.clientScope.findMany({
    where,
    orderBy: [{ month: 'desc' }, { category: 'asc' }],
  })

  // Also fetch actual work entries with proof URLs
  const workEntriesWhere: Record<string, unknown> = {
    clientId,
    status: 'APPROVED', // Only show approved work
  }

  if (monthParam) {
    const month = new Date(monthParam)
    const year = month.getFullYear()
    const monthNum = month.getMonth() + 1
    workEntriesWhere.year = year
    workEntriesWhere.month = monthNum
  }

  if (category) {
    workEntriesWhere.category = category
  }

  const workEntries = await prisma.workEntry.findMany({
    where: workEntriesWhere,
    select: {
      id: true,
      category: true,
      deliverableType: true,
      quantity: true,
      deliverableUrl: true,
      qualityScore: true,
      description: true,
      date: true,
      hoursSpent: true,
      files: {
        select: {
          id: true,
          fileName: true,
          webViewLink: true,
          thumbnailUrl: true,
          fileCategory: true,
        },
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
          department: true,
        },
      },
    },
    orderBy: { date: 'desc' },
  })

  // Group by month
  const grouped = deliverables.reduce<Record<string, Array<{
    id: string
    category: string
    item: string
    quantity: number
    delivered: number
    status: string
    month: string
  }>>>((acc, d) => {
    const monthKey = d.month.toISOString().slice(0, 7) // YYYY-MM
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push({
      id: d.id,
      category: d.category,
      item: d.item,
      quantity: d.quantity,
      delivered: d.delivered,
      status: d.status,
      month: d.month.toISOString(),
    })
    return acc
  }, {})

  // Calculate totals
  const currentMonth = new Date()
  currentMonth.setDate(1)
  currentMonth.setHours(0, 0, 0, 0)

  const currentMonthDeliverables = deliverables.filter(d =>
    d.month.getTime() >= currentMonth.getTime()
  )

  const summary = {
    totalItems: currentMonthDeliverables.reduce((sum, d) => sum + d.quantity, 0),
    deliveredItems: currentMonthDeliverables.reduce((sum, d) => sum + d.delivered, 0),
    onTrackCount: currentMonthDeliverables.filter(d => d.status === 'ON_TRACK').length,
    overDeliveryCount: currentMonthDeliverables.filter(d => d.status === 'OVER_DELIVERY').length,
    underDeliveryCount: currentMonthDeliverables.filter(d => d.status === 'UNDER_DELIVERY').length,
  }

  // Group work entries by category for easy display
  const workByCategory = workEntries.reduce<Record<string, typeof workEntries>>((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = []
    }
    acc[entry.category].push(entry)
    return acc
  }, {})

  return NextResponse.json({
    deliverables: grouped,
    workEntries: workByCategory,
    summary: {
      ...summary,
      totalWorkEntries: workEntries.length,
      entriesWithProof: workEntries.filter(e => e.deliverableUrl || e.files.length > 0).length,
    },
    categories: [...new Set([
      ...deliverables.map(d => d.category),
      ...workEntries.map(e => e.category),
    ])],
  })
}, { rateLimit: 'READ' })
