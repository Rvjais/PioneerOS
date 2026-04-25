import { NextRequest, NextResponse } from 'next/server'
import { withAuth, isManagerOrAbove } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'

// Helper: get client IDs the user is assigned to
async function getAssignedClientIds(userId: string): Promise<string[]> {
  const assignments = await prisma.clientTeamMember.findMany({
    where: { userId },
    select: { clientId: true },
  })
  return assignments.map((a) => a.clientId)
}

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const platform = searchParams.get('platform')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build filter for spend records
    const spendWhere: Record<string, unknown> = {}
    const campaignWhere: Record<string, unknown> = { status: { not: 'ARCHIVED' } }
    const conversionWhere: Record<string, unknown> = {}

    // Tenant isolation
    if (!isManagerOrAbove(user)) {
      const assignedClientIds = await getAssignedClientIds(user.id)
      if (clientId) {
        if (!assignedClientIds.includes(clientId)) {
          return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
        }
        spendWhere.clientId = clientId
        campaignWhere.clientId = clientId
        conversionWhere.clientId = clientId
      } else {
        spendWhere.clientId = { in: assignedClientIds }
        campaignWhere.clientId = { in: assignedClientIds }
        conversionWhere.clientId = { in: assignedClientIds }
      }
    } else if (clientId) {
      spendWhere.clientId = clientId
      campaignWhere.clientId = clientId
      conversionWhere.clientId = clientId
    }

    if (platform) {
      spendWhere.platform = platform
      campaignWhere.platform = platform
      conversionWhere.platform = platform
    }

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {}
      if (startDate) dateFilter.gte = new Date(startDate)
      if (endDate) dateFilter.lte = new Date(endDate)
      spendWhere.date = dateFilter
      conversionWhere.occurredAt = dateFilter
    }

    // Parallel queries for dashboard data
    const [
      spendAggregation,
      campaignStats,
      conversionAggregation,
      activeCampaigns,
      platformBreakdown,
      recentSpend,
      topCampaigns,
    ] = await Promise.all([
      // Total spend metrics
      prisma.adSpend.aggregate({
        where: spendWhere,
        _sum: { amount: true, impressions: true, clicks: true, conversions: true, leads: true },
      }),

      // Campaign counts by status
      prisma.campaign.groupBy({
        by: ['status'],
        where: campaignWhere,
        _count: true,
      }),

      // Conversion metrics
      prisma.conversionEvent.aggregate({
        where: conversionWhere,
        _count: true,
        _sum: { adSpend: true, revenue: true },
      }),

      // Active campaign count
      prisma.campaign.count({
        where: { ...campaignWhere, status: 'ACTIVE' },
      }),

      // Spend breakdown by platform
      prisma.adSpend.groupBy({
        by: ['platform'],
        where: spendWhere,
        _sum: { amount: true, impressions: true, clicks: true, conversions: true, leads: true },
      }),

      // Recent daily spend (last 30 days)
      prisma.adSpend.findMany({
        where: spendWhere,
        orderBy: { date: 'desc' },
        take: 30,
        select: {
          date: true,
          amount: true,
          impressions: true,
          clicks: true,
          conversions: true,
          leads: true,
          platform: true,
        },
      }),

      // Top performing campaigns by spend
      prisma.campaign.findMany({
        where: { ...campaignWhere, status: 'ACTIVE' },
        orderBy: { spend: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          platform: true,
          status: true,
          spend: true,
          impressions: true,
          clicks: true,
          conversions: true,
          leads: true,
          cpc: true,
          cpl: true,
          ctr: true,
          roas: true,
          client: { select: { id: true, name: true } },
        },
      }),
    ])

    const totalSpend = spendAggregation._sum.amount || 0
    const totalClicks = spendAggregation._sum.clicks || 0
    const totalImpressions = spendAggregation._sum.impressions || 0
    const totalConversions = spendAggregation._sum.conversions || 0
    const totalLeads = spendAggregation._sum.leads || 0
    const totalRevenue = conversionAggregation._sum.revenue || 0

    return NextResponse.json({
      overview: {
        totalSpend,
        totalImpressions,
        totalClicks,
        totalConversions,
        totalLeads,
        totalRevenue,
        activeCampaigns,
        avgCPC: totalClicks > 0 ? totalSpend / totalClicks : 0,
        avgCPL: totalLeads > 0 ? totalSpend / totalLeads : 0,
        avgCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        roas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
      },
      campaignsByStatus: campaignStats.map(s => ({
        status: s.status,
        count: s._count,
      })),
      platformBreakdown: platformBreakdown.map(p => ({
        platform: p.platform,
        spend: p._sum.amount || 0,
        impressions: p._sum.impressions || 0,
        clicks: p._sum.clicks || 0,
        conversions: p._sum.conversions || 0,
        leads: p._sum.leads || 0,
        cpc: (p._sum.clicks || 0) > 0 ? (p._sum.amount || 0) / (p._sum.clicks || 0) : 0,
        cpl: (p._sum.leads || 0) > 0 ? (p._sum.amount || 0) / (p._sum.leads || 0) : 0,
      })),
      recentSpend: aggregateDailySpend(recentSpend),
      topCampaigns,
    })
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

interface DailySpendRecord {
  date: Date
  amount: number
  impressions: number
  clicks: number
  conversions: number
  leads: number
  platform: string
}

function aggregateDailySpend(records: DailySpendRecord[]) {
  const byDate: Record<string, { date: string; amount: number; impressions: number; clicks: number; conversions: number; leads: number }> = {}

  for (const record of records) {
    const dateKey = new Date(record.date).toISOString().split('T')[0]
    if (!byDate[dateKey]) {
      byDate[dateKey] = { date: dateKey, amount: 0, impressions: 0, clicks: 0, conversions: 0, leads: 0 }
    }
    byDate[dateKey].amount += record.amount
    byDate[dateKey].impressions += record.impressions
    byDate[dateKey].clicks += record.clicks
    byDate[dateKey].conversions += record.conversions
    byDate[dateKey].leads += record.leads
  }

  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
}
