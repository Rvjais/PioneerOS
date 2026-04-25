// OAuth Configuration for all platforms

import { OAuthConfig, Platform } from './types'
import { getCredentialsWithFallback } from '@/server/api-credentials'

// Google OAuth Scopes
export const GOOGLE_SCOPES = {
  ANALYTICS: [
    'https://www.googleapis.com/auth/analytics.readonly',
  ],
  SEARCH_CONSOLE: [
    'https://www.googleapis.com/auth/webmasters.readonly',
  ],
  ADS: [
    'https://www.googleapis.com/auth/adwords',
  ],
  MY_BUSINESS: [
    'https://www.googleapis.com/auth/business.manage',
  ],
  YOUTUBE: [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
  ],
  // Combined scope for full access
  ALL: [
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/adwords',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'openid',
    'email',
    'profile',
  ],
}

// Meta OAuth Scopes
export const META_SCOPES = {
  PAGES: [
    'pages_show_list',
    'pages_read_engagement',
    'pages_read_user_content',
    'read_insights',
  ],
  ADS: [
    'ads_read',
    'ads_management',
  ],
  INSTAGRAM: [
    'instagram_basic',
    'instagram_manage_insights',
  ],
  ALL: [
    'pages_show_list',
    'pages_read_engagement',
    'pages_read_user_content',
    'read_insights',
    'ads_read',
    'instagram_basic',
    'instagram_manage_insights',
    'business_management',
  ],
}

// LinkedIn OAuth Scopes
export const LINKEDIN_SCOPES = {
  PAGES: [
    'r_organization_social',
    'rw_organization_admin',
  ],
  ADS: [
    'r_ads',
    'r_ads_reporting',
  ],
  ALL: [
    'r_liteprofile',
    'r_organization_social',
    'rw_organization_admin',
    'r_ads',
    'r_ads_reporting',
  ],
}

/**
 * Get OAuth config - synchronous version using .env fallback
 * Use getOAuthConfigAsync for database-backed credentials
 */
export function getOAuthConfig(platform: Platform): OAuthConfig {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  switch (platform) {
    case 'GOOGLE':
      return {
        platform: 'GOOGLE',
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri: `${baseUrl}/api/integrations/google/callback`,
        scopes: GOOGLE_SCOPES.ALL,
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
      }

    case 'META':
      return {
        platform: 'META',
        clientId: process.env.META_APP_ID || '',
        clientSecret: process.env.META_APP_SECRET || '',
        redirectUri: `${baseUrl}/api/integrations/meta/callback`,
        scopes: META_SCOPES.ALL,
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      }

    case 'LINKEDIN':
      return {
        platform: 'LINKEDIN',
        clientId: process.env.LINKEDIN_CLIENT_ID || '',
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
        redirectUri: `${baseUrl}/api/integrations/linkedin/callback`,
        scopes: LINKEDIN_SCOPES.ALL,
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
      }

    case 'TWITTER':
      return {
        platform: 'TWITTER',
        clientId: process.env.TWITTER_CLIENT_ID || '',
        clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
        redirectUri: `${baseUrl}/api/integrations/twitter/callback`,
        scopes: ['tweet.read', 'users.read', 'offline.access'],
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
      }

    default:
      throw new Error(`Unknown platform: ${platform}`)
  }
}

/**
 * Get OAuth config with database-backed credentials (async version)
 * Falls back to .env if not found in database
 */
export async function getOAuthConfigAsync(platform: Platform): Promise<OAuthConfig> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const credentials = await getCredentialsWithFallback(platform)

  switch (platform) {
    case 'GOOGLE':
      return {
        platform: 'GOOGLE',
        clientId: credentials.clientId || '',
        clientSecret: credentials.clientSecret || '',
        redirectUri: `${baseUrl}/api/integrations/google/callback`,
        scopes: GOOGLE_SCOPES.ALL,
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
      }

    case 'META':
      return {
        platform: 'META',
        clientId: credentials.appId || '',
        clientSecret: credentials.appSecret || '',
        redirectUri: `${baseUrl}/api/integrations/meta/callback`,
        scopes: META_SCOPES.ALL,
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      }

    case 'LINKEDIN':
      return {
        platform: 'LINKEDIN',
        clientId: credentials.clientId || '',
        clientSecret: credentials.clientSecret || '',
        redirectUri: `${baseUrl}/api/integrations/linkedin/callback`,
        scopes: LINKEDIN_SCOPES.ALL,
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
      }

    case 'TWITTER':
      return {
        platform: 'TWITTER',
        clientId: credentials.clientId || '',
        clientSecret: credentials.clientSecret || '',
        redirectUri: `${baseUrl}/api/integrations/twitter/callback`,
        scopes: ['tweet.read', 'users.read', 'offline.access'],
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
      }

    default:
      throw new Error(`Unknown platform: ${platform}`)
  }
}

// Generate OAuth authorization URL
export function getAuthorizationUrl(
  platform: Platform,
  state: string,
  additionalScopes?: string[]
): string {
  const config = getOAuthConfig(platform)
  const scopes = additionalScopes
    ? [...config.scopes, ...additionalScopes]
    : config.scopes

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    state,
    access_type: 'offline', // For refresh tokens
    prompt: 'consent', // Force consent to get refresh token
  })

  return `${config.authUrl}?${params.toString()}`
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(
  platform: Platform,
  code: string
): Promise<{
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  tokenType: string
  scope?: string
}> {
  const config = getOAuthConfig(platform)

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  })

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }

  const data = await response.json()

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type || 'Bearer',
    scope: data.scope,
  }
}

// Refresh access token
export async function refreshAccessToken(
  platform: Platform,
  refreshToken: string
): Promise<{
  accessToken: string
  refreshToken?: string
  expiresIn?: number
}> {
  const config = getOAuthConfig(platform)

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token refresh failed: ${error}`)
  }

  const data = await response.json()

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token, // Some platforms return new refresh token
    expiresIn: data.expires_in,
  }
}
