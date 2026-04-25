import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { safeJsonParse } from '@/shared/utils/safeJson'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const updateBudgetAlertSchema = z.object({
  name: z.string().optional(),
  budgetAmount: z.number().optional(),
  thresholdPct: z.number().optional(),
  isActive: z.boolean().optional(),
  notifyUsers: z.array(z.string()).optional(),
}).passthrough()

// Get a single budget alert
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // Only ACCOUNTS, MANAGER, SUPER_ADMIN can view budget alerts
    const allowedRoles = ['ACCOUNTS', 'MANAGER', 'SUPER_ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await routeParams!

    const alert = await prisma.budgetAlert.findUnique({
      where: { id },
      include: {
        client: {
          select: { id: true, name: true },
        },
        creator: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...alert,
      notifyUsers: safeJsonParse(alert.notifyUsers, []),
      periodStart: alert.periodStart.toISOString(),
      periodEnd: alert.periodEnd?.toISOString() || null,
      lastAlertSent: alert.lastAlertSent?.toISOString() || null,
      pausedAt: alert.pausedAt?.toISOString() || null,
      createdAt: alert.createdAt.toISOString(),
      updatedAt: alert.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch budget alert:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budget alert' },
      { status: 500 }
    )
  }
})

// Update a budget alert
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const allowedRoles = ['ACCOUNTS', 'MANAGER', 'SUPER_ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await routeParams!
    const raw = await req.json()
    const parsed = updateBudgetAlertSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const body = parsed.data

    const alert = await prisma.budgetAlert.findUnique({
      where: { id },
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    const updatedAlert = await prisma.budgetAlert.update({
      where: { id },
      data: {
        budgetAmount: body.budgetAmount as number | undefined,
        warningThreshold: body.warningThreshold as number | undefined,
        criticalThreshold: body.criticalThreshold as number | undefined,
        pauseOnCritical: body.pauseOnCritical as boolean | undefined,
        alertsEnabled: body.alertsEnabled as boolean | undefined,
        notifyOnWarning: body.notifyOnWarning as boolean | undefined,
        notifyOnCritical: body.notifyOnCritical as boolean | undefined,
        notifyUsers: body.notifyUsers ? JSON.stringify(body.notifyUsers) : alert.notifyUsers,
        periodEnd: body.periodEnd ? new Date(body.periodEnd as string) : alert.periodEnd,
      },
      include: {
        client: {
          select: { id: true, name: true },
        },
        creator: {
          select: { id: true, firstName: true, lastName: true },
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
    })
  } catch (error) {
    console.error('Failed to update budget alert:', error)
    return NextResponse.json(
      { error: 'Failed to update budget alert' },
      { status: 500 }
    )
  }
})

// Delete a budget alert
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const allowedRoles = ['ACCOUNTS', 'MANAGER', 'SUPER_ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await routeParams!

    await prisma.budgetAlert.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete budget alert:', error)
    return NextResponse.json(
      { error: 'Failed to delete budget alert' },
      { status: 500 }
    )
  }
})
