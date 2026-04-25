import { NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'

// GET /api/client-portal/dashboard - Get aggregated dashboard data for client
export const GET = withClientAuth(async (req, { user }) => {
  const clientId = user.clientId

  // Fetch health data not included in the auth user object
  const clientDetails = await prisma.client.findUnique({
    where: { id: clientId },
    select: { healthScore: true, healthStatus: true },
  })

  const currentMonth = new Date()
  currentMonth.setDate(1)
  currentMonth.setHours(0, 0, 0, 0)

  const lastMonth = new Date(currentMonth)
  lastMonth.setMonth(lastMonth.getMonth() - 1)

  // Get deliverables for current month
  const deliverables = await prisma.clientScope.findMany({
    where: {
      clientId,
      month: {
        gte: currentMonth,
      },
    },
  })

  const totalDeliverables = deliverables.reduce((sum, d) => sum + d.quantity, 0)
  const deliveredCount = deliverables.reduce((sum, d) => sum + d.delivered, 0)
  const deliverablesOnTrack = totalDeliverables > 0
    ? Math.round((deliveredCount / totalDeliverables) * 100)
    : 0

  // Get leads generated for this client
  const leadsThisMonth = await prisma.lead.count({
    where: {
      clientId,
      deletedAt: null,
      createdAt: { gte: currentMonth },
    },
  })

  const leadsLastMonth = await prisma.lead.count({
    where: {
      clientId,
      deletedAt: null,
      createdAt: {
        gte: lastMonth,
        lt: currentMonth,
      },
    },
  })

  const leadsChange = leadsLastMonth > 0
    ? Math.round(((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100)
    : (leadsThisMonth > 0 ? 100 : 0)

  // Get recent communication logs (activity)
  const recentActivity = await prisma.communicationLog.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      user: {
        select: { firstName: true, lastName: true },
      },
    },
  })

  // Get upcoming meetings
  const upcomingMeetings = await prisma.meeting.findMany({
    where: {
      clientId,
      date: { gte: new Date() },
      status: 'SCHEDULED',
    },
    orderBy: { date: 'asc' },
    take: 5,
    select: {
      id: true,
      title: true,
      date: true,
      duration: true,
      type: true,
    },
  })

  // Get client feedback/NPS
  const latestFeedback = await prisma.clientFeedback.findFirst({
    where: { clientId },
    orderBy: { month: 'desc' },
  })

  // Format deliverables by category
  const deliverablesByCategory = deliverables.reduce<Record<string, { delivered: number; total: number }>>((acc, d) => {
    const key = d.item || d.category
    if (!acc[key]) {
      acc[key] = { delivered: 0, total: 0 }
    }
    acc[key].delivered += d.delivered
    acc[key].total += d.quantity
    return acc
  }, {})

  return NextResponse.json({
    client: {
      id: clientId,
      name: user.client.name,
      healthScore: clientDetails?.healthScore ?? null,
      healthStatus: clientDetails?.healthStatus ?? null,
    },
    stats: {
      websiteVisitors: 0, // Would need analytics integration
      websiteVisitorsChange: 0,
      leadsGenerated: leadsThisMonth,
      leadsChange,
      deliverablesOnTrack,
      campaignScore: latestFeedback?.overallSatisfaction ? latestFeedback.overallSatisfaction / 2 : null,
      npsScore: latestFeedback?.npsScore || null,
    },
    deliverables: Object.entries(deliverablesByCategory).map(([name, data]) => ({
      name,
      delivered: data.delivered,
      total: data.total,
    })),
    recentActivity: recentActivity.map(a => ({
      id: a.id,
      title: a.subject || `${a.type} communication`,
      description: a.content?.slice(0, 100) || '',
      type: a.type.toLowerCase(),
      time: a.createdAt.toISOString(),
      user: a.user ? `${a.user.firstName} ${a.user.lastName || ''}`.trim() : 'Team',
    })),
    upcomingMeetings: upcomingMeetings.map(m => ({
      id: m.id,
      title: m.title,
      date: m.date.toISOString(),
      duration: m.duration,
      type: m.type,
    })),
  })
}, { rateLimit: 'READ' })
