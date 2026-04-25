// Meta (Facebook/Instagram) API Client
import { DailyMetrics, MetricData, PlatformAccountInfo } from '../types'

const GRAPH_API = 'https://graph.facebook.com/v18.0'

interface MetaApiOptions {
  accessToken: string
}

/**
 * Meta Graph API Client
 */
export class MetaClient {
  private accessToken: string

  constructor(options: MetaApiOptions) {
    this.accessToken = options.accessToken
  }

  private async fetch(endpoint: string, params: Record<string, string> = {}) {
    const url = new URL(`${GRAPH_API}${endpoint}`)
    url.searchParams.append('access_token', this.accessToken)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString())

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Meta API error: ${error.error?.message || response.statusText}`
      )
    }

    return response.json()
  }

  /**
   * Get user info and permissions
   */
  async getUserInfo() {
    return this.fetch('/me', {
      fields: 'id,name,email',
    })
  }

  /**
   * List all pages the user manages
   */
  async listPages(): Promise<PlatformAccountInfo[]> {
    const response = await this.fetch('/me/accounts', {
      fields: 'id,name,category,access_token,instagram_business_account',
    })

    const accounts: PlatformAccountInfo[] = []

    for (const page of response.data || []) {
      // Add Facebook Page
      accounts.push({
        accountId: page.id,
        accountName: page.name,
        accountType: 'PAGE',
        platform: 'META_PAGE',
        metadata: {
          category: page.category,
          pageAccessToken: page.access_token, // Page-specific token for insights
          hasInstagram: !!page.instagram_business_account,
        },
      })

      // Add Instagram account if linked
      if (page.instagram_business_account) {
        const igAccount = await this.fetch(
          `/${page.instagram_business_account.id}`,
          { fields: 'id,username,name,profile_picture_url' }
        )

        accounts.push({
          accountId: igAccount.id,
          accountName: igAccount.username || igAccount.name,
          accountType: 'INSTAGRAM_BUSINESS',
          platform: 'META_INSTAGRAM',
          metadata: {
            linkedPageId: page.id,
            linkedPageName: page.name,
            profilePicture: igAccount.profile_picture_url,
          },
        })
      }
    }

    return accounts
  }

  /**
   * List ad accounts
   */
  async listAdAccounts(): Promise<PlatformAccountInfo[]> {
    const response = await this.fetch('/me/adaccounts', {
      fields: 'id,name,account_status,currency,timezone_name',
    })

    return (response.data || []).map((account: any) => ({
      accountId: account.id,
      accountName: account.name,
      accountType: 'AD_ACCOUNT',
      platform: 'META_AD_ACCOUNT' as const,
      metadata: {
        status: account.account_status,
        currency: account.currency,
        timezone: account.timezone_name,
      },
    }))
  }

  /**
   * Get page insights (engagement metrics)
   */
  async getPageInsights(
    pageId: string,
    pageAccessToken: string,
    startDate: Date,
    endDate: Date
  ): Promise<DailyMetrics[]> {
    // Create a new client with page access token
    const pageClient = new MetaClient({ accessToken: pageAccessToken })

    const metrics = [
      'page_impressions',
      'page_impressions_unique',
      'page_engaged_users',
      'page_post_engagements',
      'page_fans',
    ]

    const response = await pageClient.fetch(`/${pageId}/insights`, {
      metric: metrics.join(','),
      period: 'day',
      since: Math.floor(startDate.getTime() / 1000).toString(),
      until: Math.floor(endDate.getTime() / 1000).toString(),
    })

    // Transform response into daily metrics
    const dailyData: Map<string, MetricData[]> = new Map()

    for (const metric of response.data || []) {
      for (const value of metric.values || []) {
        const dateKey = value.end_time.split('T')[0]

        if (!dailyData.has(dateKey)) {
          dailyData.set(dateKey, [])
        }

        const metricType = this.mapMetricName(metric.name)
        if (metricType) {
          dailyData.get(dateKey)!.push({
            metricType,
            value: value.value,
            unit: 'COUNT',
          })
        }
      }
    }

    return Array.from(dailyData.entries()).map(([dateStr, metrics]) => ({
      date: new Date(dateStr),
      metrics,
    }))
  }

  /**
   * Get Instagram insights
   */
  async getInstagramInsights(
    igAccountId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DailyMetrics[]> {
    const metrics = ['impressions', 'reach', 'profile_views', 'follower_count']

    const response = await this.fetch(`/${igAccountId}/insights`, {
      metric: metrics.join(','),
      period: 'day',
      since: Math.floor(startDate.getTime() / 1000).toString(),
      until: Math.floor(endDate.getTime() / 1000).toString(),
    })

    const dailyData: Map<string, MetricData[]> = new Map()

    for (const metric of response.data || []) {
      for (const value of metric.values || []) {
        const dateKey = value.end_time.split('T')[0]

        if (!dailyData.has(dateKey)) {
          dailyData.set(dateKey, [])
        }

        const metricType = this.mapInstagramMetricName(metric.name)
        if (metricType) {
          dailyData.get(dateKey)!.push({
            metricType,
            value: value.value,
            unit: 'COUNT',
          })
        }
      }
    }

    return Array.from(dailyData.entries()).map(([dateStr, metrics]) => ({
      date: new Date(dateStr),
      metrics,
    }))
  }

  /**
   * Get ad account insights
   */
  async getAdAccountInsights(
    adAccountId: string,
    startDate: string,
    endDate: string
  ) {
    const response = await this.fetch(`/${adAccountId}/insights`, {
      fields: [
        'spend',
        'impressions',
        'clicks',
        'cpc',
        'cpm',
        'ctr',
        'reach',
        'actions',
        'cost_per_action_type',
      ].join(','),
      time_range: JSON.stringify({
        since: startDate,
        until: endDate,
      }),
      time_increment: '1', // Daily breakdown
      level: 'account',
    })

    return (response.data || []).map((row: any) => {
      const conversions = (row.actions || []).find(
        (a: any) => a.action_type === 'lead' || a.action_type === 'purchase'
      )

      return {
        date: row.date_start,
        metrics: [
          { metricType: 'AD_SPEND', value: parseFloat(row.spend) || 0, unit: 'CURRENCY' },
          { metricType: 'AD_IMPRESSIONS', value: parseInt(row.impressions) || 0, unit: 'COUNT' },
          { metricType: 'AD_CLICKS', value: parseInt(row.clicks) || 0, unit: 'COUNT' },
          { metricType: 'REACH', value: parseInt(row.reach) || 0, unit: 'COUNT' },
          { metricType: 'CPC', value: parseFloat(row.cpc) || 0, unit: 'CURRENCY' },
          { metricType: 'CPM', value: parseFloat(row.cpm) || 0, unit: 'CURRENCY' },
          { metricType: 'CTR', value: parseFloat(row.ctr) || 0, unit: 'PERCENTAGE' },
          { metricType: 'CONVERSIONS', value: conversions?.value ? parseInt(conversions.value) : 0, unit: 'COUNT' },
        ],
      }
    })
  }

  private mapMetricName(fbMetric: string): MetricData['metricType'] | null {
    const mapping: Record<string, MetricData['metricType']> = {
      page_impressions: 'IMPRESSIONS',
      page_impressions_unique: 'REACH',
      page_engaged_users: 'ENGAGEMENT_RATE',
      page_post_engagements: 'LIKES',
      page_fans: 'FOLLOWERS',
    }
    return mapping[fbMetric] || null
  }

  private mapInstagramMetricName(igMetric: string): MetricData['metricType'] | null {
    const mapping: Record<string, MetricData['metricType']> = {
      impressions: 'IMPRESSIONS',
      reach: 'REACH',
      profile_views: 'CLICKS',
      follower_count: 'FOLLOWERS',
    }
    return mapping[igMetric] || null
  }
}

/**
 * Exchange short-lived token for long-lived token (60 days)
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string,
  appId: string,
  appSecret: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const url = new URL(`${GRAPH_API}/oauth/access_token`)
  url.searchParams.append('grant_type', 'fb_exchange_token')
  url.searchParams.append('client_id', appId)
  url.searchParams.append('client_secret', appSecret)
  url.searchParams.append('fb_exchange_token', shortLivedToken)

  const response = await fetch(url.toString())
  const data = await response.json()

  if (data.error) {
    throw new Error(data.error.message)
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in || 5184000, // Default 60 days
  }
}
