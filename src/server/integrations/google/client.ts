// Google API Client for Analytics, Search Console, and Ads
import { DailyMetrics, MetricData, PlatformAccountInfo } from '../types'

const ANALYTICS_API = 'https://analyticsdata.googleapis.com/v1beta'
const SEARCH_CONSOLE_API = 'https://searchconsole.googleapis.com/v1'
const ADS_API = 'https://googleads.googleapis.com/v14'

interface GoogleApiOptions {
  accessToken: string
}

/**
 * Google Analytics Data API Client
 */
export class GoogleAnalyticsClient {
  private accessToken: string

  constructor(options: GoogleApiOptions) {
    this.accessToken = options.accessToken
  }

  private async fetch(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Google Analytics API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  /**
   * List all GA4 properties accessible to the user
   */
  async listProperties(): Promise<PlatformAccountInfo[]> {
    // Use Admin API to list accounts and properties
    const response = await this.fetch(
      'https://analyticsadmin.googleapis.com/v1beta/accountSummaries'
    )

    const accounts: PlatformAccountInfo[] = []

    for (const accountSummary of response.accountSummaries || []) {
      for (const property of accountSummary.propertySummaries || []) {
        accounts.push({
          accountId: property.property, // e.g., "properties/123456789"
          accountName: property.displayName,
          accountType: 'GA4_PROPERTY',
          platform: 'GOOGLE_ANALYTICS',
          metadata: {
            accountId: accountSummary.account,
            accountName: accountSummary.displayName,
            propertyType: property.propertyType,
          },
        })
      }
    }

    return accounts
  }

  /**
   * Get metrics for a date range
   */
  async getMetrics(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<DailyMetrics[]> {
    const response = await this.fetch(
      `${ANALYTICS_API}/${propertyId}:runReport`,
      {
        method: 'POST',
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'date' }],
          metrics: [
            { name: 'sessions' },
            { name: 'totalUsers' },
            { name: 'newUsers' },
            { name: 'screenPageViews' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' },
            { name: 'screenPageViewsPerSession' },
            { name: 'engagementRate' },
          ],
        }),
      }
    )

    const results: DailyMetrics[] = []

    for (const row of response.rows || []) {
      const dateStr = row.dimensionValues?.[0]?.value ?? '' // YYYYMMDD format
      const date = new Date(
        `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
      )

      const metrics: MetricData[] = [
        {
          metricType: 'SESSIONS',
          value: parseFloat(row.metricValues?.[0]?.value ?? '0') || 0,
          unit: 'COUNT',
        },
        {
          metricType: 'USERS',
          value: parseFloat(row.metricValues?.[1]?.value ?? '0') || 0,
          unit: 'COUNT',
        },
        {
          metricType: 'NEW_USERS',
          value: parseFloat(row.metricValues?.[2]?.value ?? '0') || 0,
          unit: 'COUNT',
        },
        {
          metricType: 'PAGEVIEWS',
          value: parseFloat(row.metricValues?.[3]?.value ?? '0') || 0,
          unit: 'COUNT',
        },
        {
          metricType: 'BOUNCE_RATE',
          value: parseFloat(row.metricValues?.[4]?.value ?? '0') || 0,
          unit: 'PERCENTAGE',
        },
        {
          metricType: 'AVG_SESSION_DURATION',
          value: parseFloat(row.metricValues?.[5]?.value ?? '0') || 0,
          unit: 'SECONDS',
        },
        {
          metricType: 'PAGES_PER_SESSION',
          value: parseFloat(row.metricValues?.[6]?.value ?? '0') || 0,
          unit: 'COUNT',
        },
        {
          metricType: 'ENGAGEMENT_RATE',
          value: parseFloat(row.metricValues?.[7]?.value ?? '0') || 0,
          unit: 'PERCENTAGE',
        },
      ]

      results.push({ date, metrics })
    }

    return results
  }

  /**
   * Get traffic source breakdown
   */
  async getTrafficSources(
    propertyId: string,
    startDate: string,
    endDate: string
  ) {
    const response = await this.fetch(
      `${ANALYTICS_API}/${propertyId}:runReport`,
      {
        method: 'POST',
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
          metrics: [
            { name: 'sessions' },
            { name: 'totalUsers' },
            { name: 'conversions' },
          ],
          limit: 20,
        }),
      }
    )

    return (response.rows || []).map((row: any) => ({
      source: row.dimensionValues[0].value,
      medium: row.dimensionValues[1].value,
      sessions: parseFloat(row.metricValues[0].value) || 0,
      users: parseFloat(row.metricValues[1].value) || 0,
      conversions: parseFloat(row.metricValues[2].value) || 0,
    }))
  }

  /**
   * Get top pages
   */
  async getTopPages(
    propertyId: string,
    startDate: string,
    endDate: string,
    limit = 10
  ) {
    const response = await this.fetch(
      `${ANALYTICS_API}/${propertyId}:runReport`,
      {
        method: 'POST',
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'averageSessionDuration' },
          ],
          orderBys: [
            { metric: { metricName: 'screenPageViews' }, desc: true },
          ],
          limit,
        }),
      }
    )

    return (response.rows || []).map((row: any) => ({
      path: row.dimensionValues[0].value,
      title: row.dimensionValues[1].value,
      pageviews: parseFloat(row.metricValues[0].value) || 0,
      avgDuration: parseFloat(row.metricValues[1].value) || 0,
    }))
  }
}

/**
 * Google Search Console API Client
 */
export class GoogleSearchConsoleClient {
  private accessToken: string

  constructor(options: GoogleApiOptions) {
    this.accessToken = options.accessToken
  }

  private async fetch(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Search Console API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  /**
   * List all sites/properties
   */
  async listSites(): Promise<PlatformAccountInfo[]> {
    const response = await this.fetch(`${SEARCH_CONSOLE_API}/sites`)

    return (response.siteEntry || []).map((site: any) => ({
      accountId: site.siteUrl,
      accountName: site.siteUrl,
      accountType: site.permissionLevel,
      platform: 'GOOGLE_SEARCH_CONSOLE' as const,
      metadata: {
        permissionLevel: site.permissionLevel,
      },
    }))
  }

  /**
   * Get search analytics data
   */
  async getSearchAnalytics(
    siteUrl: string,
    startDate: string,
    endDate: string
  ): Promise<DailyMetrics[]> {
    const response = await this.fetch(
      `${SEARCH_CONSOLE_API}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['date'],
          rowLimit: 1000,
        }),
      }
    )

    return (response.rows || []).map((row: any) => ({
      date: new Date(row.keys[0]),
      metrics: [
        { metricType: 'SEARCH_CLICKS' as const, value: row.clicks, unit: 'COUNT' as const },
        { metricType: 'SEARCH_IMPRESSIONS' as const, value: row.impressions, unit: 'COUNT' as const },
        { metricType: 'SEARCH_CTR' as const, value: row.ctr * 100, unit: 'PERCENTAGE' as const },
        { metricType: 'AVERAGE_POSITION' as const, value: row.position, unit: 'COUNT' as const },
      ],
    }))
  }

  /**
   * Get top queries
   */
  async getTopQueries(
    siteUrl: string,
    startDate: string,
    endDate: string,
    limit = 20
  ) {
    const response = await this.fetch(
      `${SEARCH_CONSOLE_API}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['query'],
          rowLimit: limit,
        }),
      }
    )

    return (response.rows || []).map((row: any) => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr * 100,
      position: row.position,
    }))
  }

  /**
   * Get top pages
   */
  async getTopPages(
    siteUrl: string,
    startDate: string,
    endDate: string,
    limit = 20
  ) {
    const response = await this.fetch(
      `${SEARCH_CONSOLE_API}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['page'],
          rowLimit: limit,
        }),
      }
    )

    return (response.rows || []).map((row: any) => ({
      page: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr * 100,
      position: row.position,
    }))
  }
}

/**
 * YouTube Data & Analytics API Client
 */
export class GoogleYouTubeClient {
  private accessToken: string

  constructor(options: GoogleApiOptions) {
    this.accessToken = options.accessToken
  }

  private async fetch(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`YouTube API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  /**
   * List all YouTube channels accessible to the user
   */
  async listChannels(): Promise<PlatformAccountInfo[]> {
    const response = await this.fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true'
    )

    return (response.items || []).map((channel: any) => ({
      accountId: channel.id,
      accountName: channel.snippet.title,
      accountType: 'YOUTUBE_CHANNEL',
      platform: 'GOOGLE_YOUTUBE' as const,
      metadata: {
        description: channel.snippet.description,
        customUrl: channel.snippet.customUrl,
        publishedAt: channel.snippet.publishedAt,
        thumbnailUrl: channel.snippet.thumbnails?.default?.url,
        subscriberCount: channel.statistics?.subscriberCount,
        videoCount: channel.statistics?.videoCount,
        viewCount: channel.statistics?.viewCount,
      },
    }))
  }

  /**
   * Get channel statistics
   */
  async getChannelStats(channelId: string) {
    const response = await this.fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}`
    )

    const channel = response.items?.[0]
    if (!channel) {
      throw new Error('Channel not found')
    }

    return {
      subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
      videoCount: parseInt(channel.statistics.videoCount) || 0,
      viewCount: parseInt(channel.statistics.viewCount) || 0,
      hiddenSubscriberCount: channel.statistics.hiddenSubscriberCount || false,
    }
  }

  /**
   * Get recent videos
   */
  async getRecentVideos(channelId: string, limit = 10) {
    // First get uploads playlist
    const channelResponse = await this.fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}`
    )

    const uploadsPlaylistId =
      channelResponse.items?.[0]?.contentDetails?.relatedPlaylists?.uploads

    if (!uploadsPlaylistId) {
      return []
    }

    // Get videos from uploads playlist
    const videosResponse = await this.fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${limit}`
    )

    const videoIds = (videosResponse.items || [])
      .map((item: any) => item.snippet.resourceId.videoId)
      .join(',')

    if (!videoIds) {
      return []
    }

    // Get video statistics
    const statsResponse = await this.fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}`
    )

    return (statsResponse.items || []).map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      publishedAt: video.snippet.publishedAt,
      thumbnailUrl: video.snippet.thumbnails?.medium?.url,
      viewCount: parseInt(video.statistics.viewCount) || 0,
      likeCount: parseInt(video.statistics.likeCount) || 0,
      commentCount: parseInt(video.statistics.commentCount) || 0,
    }))
  }

  /**
   * Get YouTube Analytics data (requires yt-analytics.readonly scope)
   */
  async getAnalytics(
    channelId: string,
    startDate: string,
    endDate: string
  ): Promise<DailyMetrics[]> {
    const response = await this.fetch(
      `https://youtubeanalytics.googleapis.com/v2/reports?` +
        `ids=channel==${channelId}&` +
        `startDate=${startDate}&` +
        `endDate=${endDate}&` +
        `metrics=views,estimatedMinutesWatched,subscribersGained,subscribersLost,likes,comments&` +
        `dimensions=day`
    )

    return (response.rows || []).map((row: any) => ({
      date: new Date(row[0]),
      metrics: [
        { metricType: 'PAGEVIEWS' as const, value: row[1], unit: 'COUNT' as const },
        { metricType: 'AVG_SESSION_DURATION' as const, value: row[2] * 60, unit: 'SECONDS' as const }, // Minutes to seconds
        { metricType: 'FOLLOWER_GROWTH' as const, value: row[3] - row[4], unit: 'COUNT' as const },
        { metricType: 'LIKES' as const, value: row[5], unit: 'COUNT' as const },
        { metricType: 'COMMENTS' as const, value: row[6], unit: 'COUNT' as const },
      ],
    }))
  }
}

/**
 * Get user info from Google
 */
export async function getGoogleUserInfo(accessToken: string) {
  const response = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to get user info')
  }

  return response.json()
}
