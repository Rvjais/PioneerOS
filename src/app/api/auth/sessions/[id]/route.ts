import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * DELETE /api/auth/sessions/[id]
 * Terminate a specific session
 */
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!

    // Verify the session belongs to the user
    const loginSession = await prisma.loginSession.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!loginSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Deactivate the session
    await prisma.loginSession.update({
      where: { id },
      data: {
        isActive: false,
        logoutAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to terminate session:', error)
    return NextResponse.json(
      { error: 'Failed to terminate session' },
      { status: 500 }
    )
  }
})
