/**
 * Client Portal Ads API
 * Returns aggregated ad performance metrics for the authenticated client.
 */

import { NextRequest, NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'
import { calculatePacingStatus, getSpendAlert } from '@/shared/utils/ads/budgetPacing'

export const GET = withClientAuth(async (req, { user }) => {
  const clientId = user.clientId

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const dayOfMonth = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  // Get all active ad accounts for this client
  const adAccounts = await prisma.clientPlatformAccount.findMany({
    where: {
      clientId,
      isActive: true,
      platform: { in: ['GOOGLE_ADS', 'META_ADS'] },
    },
    select: {
      id: true,
      platform: true,
      accountName: true,
      accountId: true,
      lastSyncAt: true,
      lastSyncStatus: true,
    },
  })

  const accountIds = adAccounts.map((a) => a.id)

  if (accountIds.length === 0) {
    return NextResponse.json({
      hasAdAccounts: false,
      totalSpend: 0,
      budget: 0,
      leadsThisMonth: 0,
      leadsLastMonth: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      pacing: null,
      alert: null,
      campaigns: [],
      dailySpend: [],
    })
  }

  // Aggregate metrics this month
  const metricsThisMonth = await prisma.platformMetricEntry.groupBy({
    by: ['metricType'],
    where: {
      accountId: { in: accountIds },
      date: { gte: startOfMonth },
    },
    _sum: { value: true },
  })

  // Aggregate metrics last month (for trend comparison)
  const metricsLastMonth = await prisma.platformMetricEntry.groupBy({
    by: ['metricType'],
    where: {
      accountId: { in: accountIds },
      date: { gte: startOfLastMonth, lt: startOfMonth },
    },
    _sum: { value: true },
  })

  // Daily spend data for last 30 days
  const dailySpendRaw = await prisma.platformMetricEntry.groupBy({
    by: ['date'],
    where: {
      accountId: { in: accountIds },
      metricType: 'cost',
      date: { gte: thirtyDaysAgo },
    },
    _sum: { value: true },
    orderBy: { date: 'asc' },
  })

  // Campaign-level breakdown (using dimension/dimensionValue for campaign data)
  const campaignMetrics = await prisma.platformMetricEntry.groupBy({
    by: ['dimensionValue', 'metricType'],
    where: {
      accountId: { in: accountIds },
      dimension: 'campaign',
      date: { gte: startOfMonth },
    },
    _sum: { value: true },
  })

  // Build campaign summary map
  const campaignMap = new Map<string, Record<string, number>>()
  for (const row of campaignMetrics) {
    if (!row.dimensionValue) continue
    if (!campaignMap.has(row.dimensionValue)) {
      campaignMap.set(row.dimensionValue, {})
    }
    const metrics = campaignMap.get(row.dimensionValue)!
    metrics[row.metricType] = row._sum.value || 0
  }

  const campaigns = Array.from(campaignMap.entries()).map(([campaignId, metrics]) => ({
    id: campaignId,
    impressions: metrics.impressions || 0,
    clicks: metrics.clicks || 0,
    cost: metrics.cost || 0,
    conversions: metrics.conversions || 0,
    leads: metrics.leads || 0,
    ctr: metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0,
    cpc: metrics.clicks > 0 ? metrics.cost / metrics.clicks : 0,
  }))

  // Sort by spend descending
  campaigns.sort((a, b) => b.cost - a.cost)

  // Helper to extract metric value
  const getMetricValue = (
    grouped: Array<{ metricType: string; _sum: { value: number | null } }>,
    type: string
  ) => {
    const entry = grouped.find((g) => g.metricType === type)
    return entry?._sum.value || 0
  }

  const totalSpend = getMetricValue(metricsThisMonth, 'cost')
  const impressions = getMetricValue(metricsThisMonth, 'impressions')
  const clicks = getMetricValue(metricsThisMonth, 'clicks')
  const conversions = getMetricValue(metricsThisMonth, 'conversions')
  const leadsThisMonth = getMetricValue(metricsThisMonth, 'leads')
  const leadsLastMonth = getMetricValue(metricsLastMonth, 'leads')

  // Get client's monthly fee as budget proxy
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { monthlyFee: true },
  })
  const budget = client?.monthlyFee || 0

  // Calculate pacing
  const pacing = budget > 0
    ? calculatePacingStatus(budget, totalSpend, dayOfMonth, daysInMonth)
    : null

  const alert = budget > 0 ? getSpendAlert(budget, totalSpend) : null

  // Format daily spend
  const dailySpend = dailySpendRaw.map((d) => ({
    date: d.date.toISOString().split('T')[0],
    spend: d._sum.value || 0,
  }))

  // ROAS = revenue / spend (not conversions / spend). Use conversion value as revenue proxy.
  const totalRevenue = getMetricValue(metricsThisMonth, 'conversion_value') || getMetricValue(metricsThisMonth, 'revenue')
  const roas = totalSpend > 0 && totalRevenue > 0 ? totalRevenue / totalSpend : 0
  const cpl = leadsThisMonth > 0 ? totalSpend / leadsThisMonth : 0

  return NextResponse.json({
    hasAdAccounts: true,
    totalSpend,
    budget,
    impressions,
    clicks,
    conversions,
    leadsThisMonth,
    leadsLastMonth,
    roas,
    cpl,
    pacing,
    alert,
    campaigns,
    dailySpend,
    accounts: adAccounts,
  })
}, { rateLimit: 'READ' })
