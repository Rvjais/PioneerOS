// Platform Integration Types

export type Platform = 'GOOGLE' | 'META' | 'LINKEDIN' | 'TWITTER'

export type GoogleService =
  | 'GOOGLE_ANALYTICS'
  | 'GOOGLE_SEARCH_CONSOLE'
  | 'GOOGLE_ADS'
  | 'GOOGLE_MY_BUSINESS'
  | 'GOOGLE_YOUTUBE'

export type MetaService =
  | 'META_PAGE'
  | 'META_AD_ACCOUNT'
  | 'META_INSTAGRAM'

export type PlatformService = GoogleService | MetaService | 'LINKEDIN_PAGE' | 'TWITTER_PROFILE'

export interface OAuthConfig {
  platform: Platform
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
  authUrl: string
  tokenUrl: string
}

export interface OAuthTokens {
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  tokenType: string
  scopes?: string[]
}

export interface PlatformAccountInfo {
  accountId: string
  accountName: string
  accountType: string
  platform: PlatformService
  metadata?: Record<string, unknown>
}

// Metric types for each platform
export type MetricType =
  // Universal
  | 'IMPRESSIONS'
  | 'CLICKS'
  | 'CTR'
  | 'ENGAGEMENT_RATE'
  // Social Media
  | 'FOLLOWERS'
  | 'FOLLOWER_GROWTH'
  | 'LIKES'
  | 'COMMENTS'
  | 'SHARES'
  | 'REACH'
  | 'POST_COUNT'
  // Analytics
  | 'SESSIONS'
  | 'USERS'
  | 'NEW_USERS'
  | 'PAGEVIEWS'
  | 'BOUNCE_RATE'
  | 'AVG_SESSION_DURATION'
  | 'PAGES_PER_SESSION'
  // Search Console
  | 'SEARCH_IMPRESSIONS'
  | 'SEARCH_CLICKS'
  | 'SEARCH_CTR'
  | 'AVERAGE_POSITION'
  // Ads
  | 'AD_SPEND'
  | 'AD_IMPRESSIONS'
  | 'AD_CLICKS'
  | 'CONVERSIONS'
  | 'CONVERSION_VALUE'
  | 'ROAS'
  | 'CPC'
  | 'CPM'
  | 'CPA'

export interface MetricData {
  metricType: MetricType
  value: number
  previousValue?: number
  changePercent?: number
  unit?: 'COUNT' | 'CURRENCY' | 'PERCENTAGE' | 'SECONDS'
}

export interface DailyMetrics {
  date: Date
  metrics: MetricData[]
  dimensions?: {
    name: string
    value: string
    metrics: MetricData[]
  }[]
}

// Sync job types
export interface SyncJobResult {
  success: boolean
  recordsProcessed: number
  recordsFailed: number
  errors?: string[]
}
