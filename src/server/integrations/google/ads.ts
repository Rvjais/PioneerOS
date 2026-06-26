import { prisma } from '@/server/db/prisma'

export interface GoogleAdsCampaign {
  id: string
  name: string
  status: string
  campaignType: string
  dailyBudget: number
  impressions: number
  clicks: number
  conversions: number
  cost: number
  ctr: number
  cpc: number
}

export async function syncGoogleAdsCampaigns(
  accountId: string,
  credentials: { clientId: string; clientSecret: string; refreshToken: string }
): Promise<GoogleAdsCampaign[]> {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { clientId: accountId },
      include: {
        adSpendRecords: { orderBy: { date: 'desc' }, take: 1 },
      },
    })

    return campaigns.map((c) => {
      const latestMetrics = c.adSpendRecords[0]
      const impressions = latestMetrics?.impressions || 0
      const clicks = latestMetrics?.clicks || 0
      const conversions = latestMetrics?.conversions || 0
      const cost = latestMetrics?.amount || 0

      return {
        id: c.id,
        name: c.name,
        status: c.status,
        campaignType: c.campaignType || 'UNKNOWN',
        dailyBudget: c.dailyBudget || 0,
        impressions,
        clicks,
        conversions,
        cost,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        cpc: clicks > 0 ? cost / clicks : 0,
      }
    })
  } catch (error) {
    console.error(`[Google Ads] Failed to sync campaigns for account ${accountId}:`, error)
    return []
  }
}

export async function pullGoogleAdsMetrics(
  campaignId: string,
  dateRange: { from: Date; to: Date }
): Promise<any[]> {
  try {
    const metrics = await prisma.adSpend.findMany({
      where: {
        campaignId,
        date: { gte: dateRange.from, lte: dateRange.to },
      },
      orderBy: { date: 'asc' },
    })
    return metrics
  } catch (error) {
    console.error(`[Google Ads] Failed to pull metrics for campaign ${campaignId}:`, error)
    return []
  }
}

export async function getGoogleAdsSummary(
  accountId: string
): Promise<{ impressions: number; clicks: number; conversions: number; cost: number }> {
  try {
    const aggregate = await prisma.adSpend.aggregate({
      where: { campaign: { clientId: accountId } },
      _sum: { impressions: true, clicks: true, conversions: true, amount: true },
    })

    return {
      impressions: aggregate._sum.impressions || 0,
      clicks: aggregate._sum.clicks || 0,
      conversions: aggregate._sum.conversions || 0,
      cost: aggregate._sum.amount || 0,
    }
  } catch (error) {
    console.error(`[Google Ads] Failed to get summary for account ${accountId}:`, error)
    return { impressions: 0, clicks: 0, conversions: 0, cost: 0 }
  }
}
