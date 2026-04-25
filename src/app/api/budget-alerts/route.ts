import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const budgetAlertCreateSchema = z.object({
  scope: z.enum(['CLIENT', 'DEPARTMENT', 'COMPANY']),
  clientId: z.string().max(100).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  budgetAmount: z.number().positive('Budget amount must be positive').max(1e12, 'Budget amount is too large'),
  currency: z.string().min(1).max(10).default('INR'),
  period: z.string().min(1, 'Period is required').max(50),
  periodStart: z.string().min(1, 'Period start is required').refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Invalid period start date format' }
  ),
  periodEnd: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Invalid period end date format' }
  ).optional().nullable(),
  warningThreshold: z.number().min(0, 'Warning threshold must be >= 0').max(100, 'Warning threshold must be <= 100').default(80),
  criticalThreshold: z.number().min(0, 'Critical threshold must be >= 0').max(200, 'Critical threshold must be <= 200').default(100),
  pauseOnCritical: z.boolean().default(false),
  notifyUsers: z.array(z.string()).default([]),
  notifyOnWarning: z.boolean().default(true),
  notifyOnCritical: z.boolean().default(true),
})

const budgetAlertUpdateSchema = z.object({
  alertId: z.string().min(1, 'Alert ID is required').max(100),
  spentAmount: z.number().min(0, 'Spent amount cannot be negative').max(1e12, 'Spent amount is too large'),
})

// Get all budget alerts
export const GET = withAuth(async (req, { user, params }) => {
  try {
// Only ACCOUNTS, MANAGER, SUPER_ADMIN can view budget alerts
    const allowedRoles = ['ACCOUNTS', 'MANAGER', 'SUPER_ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const scope = searchParams.get('scope')
    const alertLevel = searchParams.get('alertLevel')
    const clientId = searchParams.get('clientId')

    const alerts = await prisma.budgetAlert.findMany({
      where: {
        ...(scope && { scope }),
        ...(alertLevel && { alertLevel }),
        ...(clientId && { clientId }),
      },
      include: {
        client: {
          select: { id: true, name: true },
        },
        creator: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: [
        { alertLevel: 'desc' }, // Critical first
        { spentPercentage: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    // Summary stats
    const summary = {
      total: alerts.length,
      normal: alerts.filter(a => a.alertLevel === 'NORMAL').length,
      warning: alerts.filter(a => a.alertLevel === 'WARNING').length,
      critical: alerts.filter(a => a.alertLevel === 'CRITICAL').length,
      exceeded: alerts.filter(a => a.alertLevel === 'EXCEEDED').length,
      paused: alerts.filter(a => a.isPaused).length,
    }

    return NextResponse.json({
      alerts: alerts.map(a => ({
        ...a,
        periodStart: a.periodStart.toISOString(),
        periodEnd: a.periodEnd?.toISOString() || null,
        lastAlertSent: a.lastAlertSent?.toISOString() || null,
        pausedAt: a.pausedAt?.toISOString() || null,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      summary,
    })
  } catch (error) {
    console.error('Failed to fetch budget alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budget alerts' },
      { status: 500 }
    )
  }
})

// Create a new budget alert
export const POST = withAuth(async (req, { user, params }) => {
  try {
const allowedRoles = ['ACCOUNTS', 'MANAGER', 'SUPER_ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const parseResult = budgetAlertCreateSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const {
      scope,
      clientId,
      department,
      budgetAmount,
      currency,
      period,
      periodStart,
      periodEnd,
      warningThreshold,
      criticalThreshold,
      pauseOnCritical,
      notifyUsers,
      notifyOnWarning,
      notifyOnCritical,
    } = parseResult.data

    // Validate scope-specific requirements
    if (scope === 'CLIENT' && !clientId) {
      return NextResponse.json(
        { error: 'clientId is required for CLIENT scope' },
        { status: 400 }
      )
    }
    if (scope === 'DEPARTMENT' && !department) {
      return NextResponse.json(
        { error: 'department is required for DEPARTMENT scope' },
        { status: 400 }
      )
    }

    const alert = await prisma.budgetAlert.create({
      data: {
        scope,
        clientId: scope === 'CLIENT' ? clientId : null,
        department: scope === 'DEPARTMENT' ? department : null,
        budgetAmount,
        currency,
        period,
        periodStart: new Date(periodStart),
        periodEnd: periodEnd ? new Date(periodEnd) : null,
        warningThreshold,
        criticalThreshold,
        pauseOnCritical,
        notifyUsers: JSON.stringify(notifyUsers),
        notifyOnWarning,
        notifyOnCritical,
        alertsEnabled: true,
        createdBy: user.id,
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
        ...alert,
        periodStart: alert.periodStart.toISOString(),
        periodEnd: alert.periodEnd?.toISOString() || null,
        createdAt: alert.createdAt.toISOString(),
        updatedAt: alert.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to create budget alert:', error)
    return NextResponse.json(
      { error: 'Failed to create budget alert' },
      { status: 500 }
    )
  }
})

// Update spending and check thresholds
export const PUT = withAuth(async (req, { user, params }) => {
  try {
// Only ACCOUNTS, MANAGER, SUPER_ADMIN can update budget alerts
    const allowedRoles = ['ACCOUNTS', 'MANAGER', 'SUPER_ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const putResult = budgetAlertUpdateSchema.safeParse(body)
    if (!putResult.success) {
      return NextResponse.json(
        { error: putResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const { alertId, spentAmount } = putResult.data

    const alert = await prisma.budgetAlert.findUnique({
      where: { id: alertId },
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    // Calculate percentage
    const spentPercentage = (spentAmount / alert.budgetAmount) * 100

    // Determine alert level
    let alertLevel = 'NORMAL'
    if (spentPercentage >= alert.criticalThreshold) {
      alertLevel = spentPercentage > 100 ? 'EXCEEDED' : 'CRITICAL'
    } else if (spentPercentage >= alert.warningThreshold) {
      alertLevel = 'WARNING'
    }

    // Check if we need to pause
    const shouldPause = alert.pauseOnCritical && alertLevel === 'CRITICAL' && !alert.isPaused

    // Update the alert
    const updatedAlert = await prisma.budgetAlert.update({
      where: { id: alertId },
      data: {
        spentAmount,
        spentPercentage,
        alertLevel,
        ...(shouldPause && {
          isPaused: true,
          pausedAt: new Date(),
          pausedBy: user.id,
        }),
      },
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
    })

    // Return whether notifications should be sent
    const shouldNotify = (
      (alertLevel === 'WARNING' && alert.notifyOnWarning && alert.alertLevel !== 'WARNING') ||
      (alertLevel === 'CRITICAL' && alert.notifyOnCritical && alert.alertLevel !== 'CRITICAL') ||
      (alertLevel === 'EXCEEDED' && alert.alertLevel !== 'EXCEEDED')
    )

    return NextResponse.json({
      success: true,
      alert: {
        ...updatedAlert,
        periodStart: updatedAlert.periodStart.toISOString(),
        periodEnd: updatedAlert.periodEnd?.toISOString() || null,
        pausedAt: updatedAlert.pausedAt?.toISOString() || null,
        lastAlertSent: updatedAlert.lastAlertSent?.toISOString() || null,
        createdAt: updatedAlert.createdAt.toISOString(),
        updatedAt: updatedAlert.updatedAt.toISOString(),
      },
      levelChanged: alert.alertLevel !== alertLevel,
      shouldNotify,
      wasPaused: shouldPause,
    })
  } catch (error) {
    console.error('Failed to update budget alert:', error)
    return NextResponse.json(
      { error: 'Failed to update budget alert' },
      { status: 500 }
    )
  }
})
