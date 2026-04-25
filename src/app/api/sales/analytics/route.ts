import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { requireAuth, isAuthError, isAdminOrManager, type UserRole } from '@/server/auth/rbac'

const SALES_ROLES: UserRole[] = ['SUPER_ADMIN', 'MANAGER', 'SALES']

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth({ roles: SALES_ROLES })
    if (isAuthError(auth)) return auth.error

    const isManager = isAdminOrManager(auth.user.role)
    const userFilter = isManager ? {} : { assignedToId: auth.user.id }
    const dealUserFilter = isManager ? {} : { userId: auth.user.id }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const startOf3MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)

    const [allLeads, allDeals, activities, recentDeals] = await Promise.all([
      prisma.lead.findMany({
        where: { ...userFilter, deletedAt: null },
        select: {
          id: true, stage: true, value: true, source: true, pipeline: true,
          leadPriority: true, createdAt: true, wonAt: true, updatedAt: true,
          assignedToId: true,
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.salesDeal.findMany({
        where: dealUserFilter,
        select: {
          id: true, status: true, dealValue: true, closedAt: true,
          createdAt: true, userId: true, leadId: true, lossReason: true,
          servicesSold: true,
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.leadActivity.findMany({
        where: {
          ...(isManager ? {} : { userId: auth.user.id }),
          createdAt: { gte: startOf3MonthsAgo },
        },
        select: { id: true, type: true, createdAt: true, userId: true },
      }),
      prisma.salesDeal.findMany({
        where: {
          ...dealUserFilter,
          createdAt: { gte: startOf3MonthsAgo },
        },
        select: {
          id: true, status: true, dealValue: true, closedAt: true, createdAt: true,
          leadId: true, lossReason: true, userId: true,
          user: { select: { firstName: true, lastName: true } },
          lead: { select: { companyName: true, source: true, createdAt: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // --- PIPELINE METRICS ---
    const stages = ['LEAD_RECEIVED', 'RFP_SENT', 'RFP_COMPLETED', 'PROPOSAL_SHARED', 'FOLLOW_UP_ONGOING', 'MEETING_SCHEDULED', 'PROPOSAL_DISCUSSION', 'WON', 'LOST']
    const stageDistribution = stages.map(stage => ({
      stage,
      count: allLeads.filter(l => l.stage === stage).length,
      value: allLeads.filter(l => l.stage === stage).reduce((s, l) => s + (l.value || 0), 0),
    }))

    // --- CONVERSION RATES ---
    const totalLeads = allLeads.length
    const wonLeads = allLeads.filter(l => l.stage === 'WON')
    const lostLeads = allLeads.filter(l => l.stage === 'LOST')
    const overallConversionRate = totalLeads > 0 ? Math.round((wonLeads.length / totalLeads) * 100) : 0

    // Conversion by source
    const sources = [...new Set(allLeads.map(l => l.source).filter(Boolean))]
    const conversionBySource = sources.map(source => {
      const sourceLeads = allLeads.filter(l => l.source === source)
      const sourceWon = sourceLeads.filter(l => l.stage === 'WON')
      return {
        source: source || 'Unknown',
        total: sourceLeads.length,
        won: sourceWon.length,
        rate: sourceLeads.length > 0 ? Math.round((sourceWon.length / sourceLeads.length) * 100) : 0,
        value: sourceWon.reduce((s, l) => s + (l.value || 0), 0),
      }
    }).sort((a, b) => b.won - a.won)

    // --- SALES CYCLE ---
    // Average time from lead creation to deal close
    const wonDealsWithLeadData = recentDeals.filter(d => d.status === 'WON' && d.lead?.createdAt)
    const cycleDays = wonDealsWithLeadData.map(d => {
      const created = new Date(d.lead!.createdAt).getTime()
      const closed = new Date(d.closedAt || d.createdAt).getTime()
      return Math.round((closed - created) / (1000 * 60 * 60 * 24))
    })
    const avgCycleDays = cycleDays.length > 0 ? Math.round(cycleDays.reduce((s, d) => s + d, 0) / cycleDays.length) : 0

    // --- MONTHLY TREND (last 3 months) ---
    const months: Array<{ label: string; won: number; lost: number; revenue: number; leads: number }> = []
    for (let i = 2; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const mDeals = recentDeals.filter(d => new Date(d.createdAt) >= mStart && new Date(d.createdAt) < mEnd)
      const mLeads = allLeads.filter(l => new Date(l.createdAt) >= mStart && new Date(l.createdAt) < mEnd)
      months.push({
        label: mStart.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        won: mDeals.filter(d => d.status === 'WON').length,
        lost: mDeals.filter(d => d.status === 'LOST').length,
        revenue: mDeals.filter(d => d.status === 'WON').reduce((s, d) => s + (d.dealValue || 0), 0),
        leads: mLeads.length,
      })
    }

    // --- PIPELINE VALUE (weighted) ---
    const stageWeights: Record<string, number> = {
      LEAD_RECEIVED: 0.1, RFP_SENT: 0.2, RFP_COMPLETED: 0.3,
      PROPOSAL_SHARED: 0.5, FOLLOW_UP_ONGOING: 0.4, MEETING_SCHEDULED: 0.6,
      PROPOSAL_DISCUSSION: 0.7, WON: 1.0, LOST: 0,
    }
    const weightedPipelineValue = allLeads
      .filter(l => !['WON', 'LOST'].includes(l.stage))
      .reduce((sum, l) => sum + (l.value || 0) * (stageWeights[l.stage] || 0.1), 0)

    // --- LOSS REASONS ---
    const lossReasons = new Map<string, number>()
    for (const deal of allDeals.filter(d => d.status === 'LOST' && d.lossReason)) {
      const reason = deal.lossReason || 'Unknown'
      lossReasons.set(reason, (lossReasons.get(reason) || 0) + 1)
    }
    const topLossReasons = Array.from(lossReasons.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // --- REP PERFORMANCE ---
    const repMap = new Map<string, { name: string; won: number; lost: number; revenue: number; activities: number; leads: number }>()
    for (const deal of allDeals) {
      const uid = deal.userId
      const name = `${deal.user.firstName} ${deal.user.lastName || ''}`.trim()
      const existing = repMap.get(uid) || { name, won: 0, lost: 0, revenue: 0, activities: 0, leads: 0 }
      if (deal.status === 'WON') { existing.won++; existing.revenue += deal.dealValue || 0 }
      if (deal.status === 'LOST') existing.lost++
      repMap.set(uid, existing)
    }
    for (const act of activities) {
      const existing = repMap.get(act.userId)
      if (existing) existing.activities++
    }
    for (const lead of allLeads) {
      if (lead.assignedToId) {
        const existing = repMap.get(lead.assignedToId)
        if (existing) existing.leads++
      }
    }
    const repPerformance = Array.from(repMap.entries())
      .map(([id, data]) => ({
        id, ...data,
        winRate: (data.won + data.lost) > 0 ? Math.round((data.won / (data.won + data.lost)) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    // --- PRIORITY BREAKDOWN ---
    const priorityBreakdown = ['HOT', 'WARM', 'COLD'].map(p => ({
      priority: p,
      count: allLeads.filter(l => l.leadPriority === p && !['WON', 'LOST'].includes(l.stage)).length,
      value: allLeads.filter(l => l.leadPriority === p && !['WON', 'LOST'].includes(l.stage))
        .reduce((s, l) => s + (l.value || 0), 0),
    }))

    return NextResponse.json({
      summary: {
        totalLeads,
        activeLeads: allLeads.filter(l => !['WON', 'LOST'].includes(l.stage)).length,
        wonCount: wonLeads.length,
        lostCount: lostLeads.length,
        overallConversionRate,
        avgCycleDays,
        totalPipelineValue: allLeads.filter(l => !['WON', 'LOST'].includes(l.stage)).reduce((s, l) => s + (l.value || 0), 0),
        weightedPipelineValue: Math.round(weightedPipelineValue),
        totalRevenue: allDeals.filter(d => d.status === 'WON').reduce((s, d) => s + (d.dealValue || 0), 0),
      },
      stageDistribution,
      conversionBySource,
      monthlyTrend: months,
      topLossReasons,
      repPerformance,
      priorityBreakdown,
    })
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
