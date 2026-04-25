// GET /api/integrations/linkedin/callback - Handle LinkedIn OAuth callback
import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '@/server/integrations/oauth-config'
import { parseOAuthState } from '@/server/integrations/encryption'
import { createConnection } from '@/server/integrations/connection-service'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Handle OAuth errors
    if (error) {
      console.error('LinkedIn OAuth error:', error, errorDescription)
      return NextResponse.redirect(
        new URL(`/integrations/error?message=${encodeURIComponent(errorDescription || error)}`, req.url)
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
    const tokenData = await exchangeCodeForTokens('LINKEDIN', code)

    // LinkedIn tokens typically expire in 60 days for access and 365 days for refresh
    const expiresAt = tokenData.expiresIn
      ? new Date(Date.now() + tokenData.expiresIn * 1000)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // Default 60 days

    // Store connection
    await createConnection(
      stateData.clientId,
      'LINKEDIN',
      {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt,
        tokenType: tokenData.tokenType,
        scopes: tokenData.scope?.split(' '),
      },
      user.id
    )

    // Redirect to success page
    const returnUrl = stateData.returnUrl || `/clients/${stateData.clientId}/integrations`
    return NextResponse.redirect(
      new URL(`${returnUrl}?connected=linkedin`, req.url)
    )
  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error)
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
