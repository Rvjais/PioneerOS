import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const pauseSchema = z.object({
  action: z.enum(['pause', 'resume']),
})

// Toggle pause/resume on a budget alert
export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const allowedRoles = ['ACCOUNTS', 'MANAGER', 'SUPER_ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await routeParams!
    const raw = await req.json()
    const parsed = pauseSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { action } = parsed.data

    const alert = await prisma.budgetAlert.findUnique({
      where: { id },
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    const isPausing = action === 'pause'

    const updatedAlert = await prisma.budgetAlert.update({
      where: { id },
      data: {
        isPaused: isPausing,
        pausedAt: isPausing ? new Date() : null,
        pausedBy: isPausing ? user.id : null,
      },
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      alert: {
        ...updatedAlert,
        periodStart: updatedAlert.periodStart.toISOString(),
        periodEnd: updatedAlert.periodEnd?.toISOString() || null,
        lastAlertSent: updatedAlert.lastAlertSent?.toISOString() || null,
        pausedAt: updatedAlert.pausedAt?.toISOString() || null,
        createdAt: updatedAlert.createdAt.toISOString(),
        updatedAt: updatedAlert.updatedAt.toISOString(),
      },
      message: isPausing ? 'Budget spending paused' : 'Budget spending resumed',
    })
  } catch (error) {
    console.error('Failed to toggle budget pause:', error)
    return NextResponse.json(
      { error: 'Failed to toggle budget pause' },
      { status: 500 }
    )
  }
})
