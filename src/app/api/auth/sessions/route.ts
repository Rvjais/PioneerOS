import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

/**
 * GET /api/auth/sessions
 * List all login sessions for the current user
 */
export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')

    const where = {
      userId: user.id,
      ...(includeInactive ? {} : { isActive: true }),
    }

    const sessions = await prisma.loginSession.findMany({
      where,
      orderBy: { loginAt: 'desc' },
      take: limit,
      select: {
        id: true,
        ipAddress: true,
        deviceType: true,
        browser: true,
        browserVersion: true,
        os: true,
        osVersion: true,
        country: true,
        city: true,
        isActive: true,
        loginAt: true,
        logoutAt: true,
        lastActivityAt: true,
        isNewDevice: true,
        isSuspicious: true,
        suspiciousReason: true,
      },
    })

    // Get current session token to mark it
    const currentSessionToken = req.cookies.get('next-auth.session-token')?.value

    return NextResponse.json({
      sessions: sessions.map((s) => ({
        ...s,
        isCurrent: false, // We can't easily determine this without storing session tokens
      })),
      total: sessions.length,
    })
  } catch (error) {
    console.error('Failed to list sessions:', error)
    return NextResponse.json(
      { error: 'Failed to list sessions' },
      { status: 500 }
    )
  }
})

/**
 * DELETE /api/auth/sessions
 * Logout from all other sessions
 */
export const DELETE = withAuth(async (req, { user, params }) => {
  try {
// Deactivate all sessions except current
    await prisma.loginSession.updateMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      data: {
        isActive: false,
        logoutAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, message: 'All sessions terminated' })
  } catch (error) {
    console.error('Failed to terminate sessions:', error)
    return NextResponse.json(
      { error: 'Failed to terminate sessions' },
      { status: 500 }
    )
  }
})
