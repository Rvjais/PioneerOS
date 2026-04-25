// LinkedIn API Client
import { DailyMetrics, MetricData, PlatformAccountInfo } from '../types'

const LINKEDIN_API = 'https://api.linkedin.com/v2'

interface LinkedInApiOptions {
  accessToken: string
}

/**
 * LinkedIn API Client
 */
export class LinkedInClient {
  private accessToken: string

  constructor(options: LinkedInApiOptions) {
    this.accessToken = options.accessToken
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${LINKEDIN_API}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`LinkedIn API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  /**
   * Get current user profile
   */
  async getUserProfile() {
    const response = await this.fetch('/me')
    return {
      id: response.id,
      firstName: response.localizedFirstName,
      lastName: response.localizedLastName,
      headline: response.localizedHeadline,
    }
  }

  /**
   * Get user email (requires r_emailaddress scope)
   */
  async getUserEmail(): Promise<string | null> {
    try {
      const response = await this.fetch(
        '/emailAddress?q=members&projection=(elements*(handle~))'
      )
      return response.elements?.[0]?.['handle~']?.emailAddress || null
    } catch {
      return null
    }
  }

  /**
   * List organization pages the user administers
   */
  async listOrganizations(): Promise<PlatformAccountInfo[]> {
    // Get organizations where user is an admin
    const response = await this.fetch(
      '/organizationalEntityAcls?q=roleAssignee&projection=(elements*(organizationalTarget,roleAssignee,state))'
    )

    const organizations: PlatformAccountInfo[] = []

    for (const element of response.elements || []) {
      if (element.state !== 'APPROVED') continue

      // Extract organization URN
      const orgUrn = element.organizationalTarget
      const orgId = orgUrn?.split(':').pop()

      if (!orgId) continue

      try {
        // Get organization details
        const orgDetails = await this.fetch(
          `/organizations/${orgId}?projection=(id,localizedName,vanityName,logoV2,description)`
        )

        organizations.push({
          accountId: orgId,
          accountName: orgDetails.localizedName || `Organization ${orgId}`,
          accountType: 'COMPANY_PAGE',
          platform: 'LINKEDIN_PAGE',
          metadata: {
            vanityName: orgDetails.vanityName,
            description: orgDetails.description?.localizedDescription,
            urn: orgUrn,
          },
        })
      } catch (error) {
        console.error(`Failed to get org details for ${orgId}:`, error)
      }
    }

    return organizations
  }

  /**
   * Get organization follower statistics
   */
  async getOrganizationFollowers(organizationId: string) {
    const response = await this.fetch(
      `/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:${organizationId}`
    )

    const stats = response.elements?.[0]
    return {
      totalFollowers: stats?.followerCounts?.organicFollowerCount || 0,
      paidFollowers: stats?.followerCounts?.paidFollowerCount || 0,
    }
  }

  /**
   * Get organization page statistics (engagement)
   */
  async getOrganizationStats(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DailyMetrics[]> {
    // Get share statistics
    const startTimestamp = startDate.getTime()
    const endTimestamp = endDate.getTime()

    const response = await this.fetch(
      `/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:${organizationId}&timeIntervals.timeGranularityType=DAY&timeIntervals.timeRange.start=${startTimestamp}&timeIntervals.timeRange.end=${endTimestamp}`
    )

    const dailyMetrics: DailyMetrics[] = []

    for (const element of response.elements || []) {
      const timeRange = element.timeRange
      if (!timeRange) continue

      const date = new Date(timeRange.start)
      const totalStats = element.totalShareStatistics || {}

      dailyMetrics.push({
        date,
        metrics: [
          {
            metricType: 'IMPRESSIONS',
            value: totalStats.impressionCount || 0,
            unit: 'COUNT',
          },
          {
            metricType: 'CLICKS',
            value: totalStats.clickCount || 0,
            unit: 'COUNT',
          },
          {
            metricType: 'LIKES',
            value: totalStats.likeCount || 0,
            unit: 'COUNT',
          },
          {
            metricType: 'COMMENTS',
            value: totalStats.commentCount || 0,
            unit: 'COUNT',
          },
          {
            metricType: 'SHARES',
            value: totalStats.shareCount || 0,
            unit: 'COUNT',
          },
          {
            metricType: 'ENGAGEMENT_RATE',
            value: totalStats.engagement || 0,
            unit: 'PERCENTAGE',
          },
        ],
      })
    }

    return dailyMetrics
  }

  /**
   * Get recent posts from an organization
   */
  async getOrganizationPosts(organizationId: string, limit = 10) {
    const response = await this.fetch(
      `/shares?q=owners&owners=urn:li:organization:${organizationId}&count=${limit}&sortBy=LAST_MODIFIED`
    )

    return (response.elements || []).map((share: any) => ({
      id: share.id,
      text: share.text?.text || '',
      created: new Date(share.created?.time || 0),
      activity: share.activity,
      distribution: share.distribution,
    }))
  }

  /**
   * Get ad accounts (requires r_ads scope)
   */
  async listAdAccounts(): Promise<PlatformAccountInfo[]> {
    try {
      const response = await this.fetch(
        '/adAccountsV2?q=search&search=(status:(values:List(ACTIVE)))'
      )

      return (response.elements || []).map((account: any) => ({
        accountId: account.id,
        accountName: account.name,
        accountType: 'AD_ACCOUNT',
        platform: 'LINKEDIN_PAGE' as const,
        metadata: {
          status: account.status,
          currency: account.currency,
          type: account.type,
        },
      }))
    } catch {
      // Ad accounts might not be available
      return []
    }
  }

  /**
   * Get ad campaign statistics
   */
  async getAdCampaignStats(
    adAccountId: string,
    startDate: string,
    endDate: string
  ) {
    try {
      const response = await this.fetch(
        `/adAnalyticsV2?q=analytics&pivot=CAMPAIGN&dateRange.start.day=${new Date(startDate).getDate()}&dateRange.start.month=${new Date(startDate).getMonth() + 1}&dateRange.start.year=${new Date(startDate).getFullYear()}&dateRange.end.day=${new Date(endDate).getDate()}&dateRange.end.month=${new Date(endDate).getMonth() + 1}&dateRange.end.year=${new Date(endDate).getFullYear()}&accounts=urn:li:sponsoredAccount:${adAccountId}&fields=impressions,clicks,costInLocalCurrency,conversions`
      )

      return (response.elements || []).map((row: any) => ({
        campaignId: row.pivotValue,
        impressions: row.impressions || 0,
        clicks: row.clicks || 0,
        spend: row.costInLocalCurrency || 0,
        conversions: row.conversions || 0,
      }))
    } catch {
      return []
    }
  }
}

/**
 * Get LinkedIn user info for display
 */
export async function getLinkedInUserInfo(accessToken: string) {
  const client = new LinkedInClient({ accessToken })

  const [profile, email] = await Promise.all([
    client.getUserProfile(),
    client.getUserEmail(),
  ])

  return {
    id: profile.id,
    name: `${profile.firstName} ${profile.lastName}`,
    email,
    headline: profile.headline,
  }
}
