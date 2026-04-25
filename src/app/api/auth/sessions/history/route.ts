import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

/**
 * GET /api/auth/sessions/history
 * Get login history with pagination
 */
export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [sessions, total] = await Promise.all([
      prisma.loginSession.findMany({
        where: { userId: user.id },
        orderBy: { loginAt: 'desc' },
        skip,
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
      }),
      prisma.loginSession.count({
        where: { userId: user.id },
      }),
    ])

    return NextResponse.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Failed to get login history:', error)
    return NextResponse.json(
      { error: 'Failed to get login history' },
      { status: 500 }
    )
  }
})
