// GET /api/integrations/meta/callback - Handle Meta OAuth callback
import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '@/server/integrations/oauth-config'
import { parseOAuthState } from '@/server/integrations/encryption'
import { createConnection } from '@/server/integrations/connection-service'
import { exchangeForLongLivedToken } from '@/server/integrations/meta/client'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorReason = searchParams.get('error_reason')

    // Handle OAuth errors
    if (error) {
      console.error('Meta OAuth error:', error, errorReason)
      return NextResponse.redirect(
        new URL(
          `/integrations/error?message=${encodeURIComponent(errorReason || error)}`,
          req.url
        )
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/integrations/error?message=Missing+code+or+state', req.url)
      )
    }

    // Parse and validate state
    const stateData = parseOAuthState(state)
    if (!stateData) {
      return NextResponse.redirect(
        new URL('/integrations/error?message=Invalid+or+expired+state', req.url)
      )
    }

    // Exchange code for tokens
    const tokenData = await exchangeCodeForTokens('META', code)

    // Exchange short-lived token for long-lived token (60 days)
    let accessToken = tokenData.accessToken
    let expiresAt: Date | undefined

    try {
      const longLivedToken = await exchangeForLongLivedToken(
        tokenData.accessToken,
        process.env.META_APP_ID || '',
        process.env.META_APP_SECRET || ''
      )
      accessToken = longLivedToken.accessToken
      expiresAt = new Date(Date.now() + longLivedToken.expiresIn * 1000)
    } catch (err) {
      console.warn('Could not get long-lived token, using short-lived:', err)
      // Fall back to short-lived token
      expiresAt = tokenData.expiresIn
        ? new Date(Date.now() + tokenData.expiresIn * 1000)
        : undefined
    }

    // Store connection
    await createConnection(
      stateData.clientId,
      'META',
      {
        accessToken,
        refreshToken: undefined, // Meta uses long-lived tokens instead
        expiresAt,
        tokenType: tokenData.tokenType,
        scopes: tokenData.scope?.split(','),
      },
      user.id
    )

    // Redirect to success page
    const returnUrl = stateData.returnUrl || `/clients/${stateData.clientId}/integrations`
    return NextResponse.redirect(
      new URL(`${returnUrl}?connected=meta`, req.url)
    )
  } catch (error) {
    console.error('Meta OAuth callback error:', error)
    return NextResponse.redirect(
      new URL(
        `/integrations/error?message=${encodeURIComponent(
          error instanceof Error ? error.message : 'Connection failed'
        )}`,
        req.url
      )
    )
  }
})
