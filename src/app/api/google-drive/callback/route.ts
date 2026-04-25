import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { createOAuth2Client, getTokensFromCode } from '@/server/integrations/google-drive'
import { encrypt } from '@/server/security/encryption'
import { oauth2_v2 } from '@googleapis/oauth2'

// GET: Handle OAuth callback from Google
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // userId passed through state
    const error = searchParams.get('error')

    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(new URL('/settings?error=google_auth_failed', (process.env.NEXTAUTH_URL || request.url)))
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/settings?error=invalid_callback', (process.env.NEXTAUTH_URL || request.url)))
    }

    const userId = state

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.redirect(new URL('/settings?error=user_not_found', (process.env.NEXTAUTH_URL || request.url)))
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(new URL('/settings?error=no_tokens', (process.env.NEXTAUTH_URL || request.url)))
    }

    // Get user's email from Google
    const oauth2Client = createOAuth2Client()
    oauth2Client.setCredentials(tokens)

    const oauth2 = new oauth2_v2.Oauth2({ auth: oauth2Client })
    const userInfo = await oauth2.userinfo.get()
    const email = userInfo.data.email || 'unknown'

    // Save encrypted tokens to database
    const encryptedAccessToken = encrypt(tokens.access_token)
    const encryptedRefreshToken = encrypt(tokens.refresh_token)

    await prisma.userGoogleDrive.upsert({
      where: { userId },
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry: new Date(tokens.expiry_date || Date.now() + 3600 * 1000),
        email,
        isConnected: true,
        lastSyncAt: new Date(),
      },
      create: {
        userId,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry: new Date(tokens.expiry_date || Date.now() + 3600 * 1000),
        email,
        isConnected: true,
      },
    })

    return NextResponse.redirect(new URL('/settings?success=google_connected', (process.env.NEXTAUTH_URL || request.url)))
  } catch (error) {
    console.error('Error handling Google OAuth callback:', error)
    return NextResponse.redirect(new URL('/settings?error=callback_failed', (process.env.NEXTAUTH_URL || request.url)))
  }
}
