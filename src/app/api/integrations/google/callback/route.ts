// GET /api/integrations/google/callback - Handle Google OAuth callback
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

    // Handle OAuth errors
    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(
        new URL(`/integrations/error?message=${encodeURIComponent(error)}`, req.url)
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
    const tokenData = await exchangeCodeForTokens('GOOGLE', code)

    // Calculate expiry
    const expiresAt = tokenData.expiresIn
      ? new Date(Date.now() + tokenData.expiresIn * 1000)
      : undefined

    // Store connection
    await createConnection(
      stateData.clientId,
      'GOOGLE',
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
      new URL(`${returnUrl}?connected=google`, req.url)
    )
  } catch (error) {
    console.error('Google OAuth callback error:', error)
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
