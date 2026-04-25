import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'

// GET /api/client-portal/magic-login?token=xxx - Magic login for clients
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // Find client user by session token
    const clientUser = await prisma.clientUser.findFirst({
      where: { sessionToken: token },
      include: {
        client: { select: { name: true } }
      }
    })

    if (!clientUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if session has expired
    if (clientUser.sessionExpiresAt && clientUser.sessionExpiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    // Set session expiration (7 days from now)
    const sessionExpiresAt = new Date()
    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 7)

    await prisma.clientUser.update({
      where: { id: clientUser.id },
      data: {
        lastLoginAt: new Date(),
        sessionExpiresAt,
      }
    })

    // Redirect to dashboard with cookie set on the response
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://brandingpioneers.in'
    const response = NextResponse.redirect(new URL('/portal/dashboard', baseUrl))

    // Set cookie on the response object (not via cookies() which doesn't work with redirects)
    response.cookies.set('client_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // 'lax' allows cookie on redirect from external links
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Magic login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
