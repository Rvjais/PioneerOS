import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'

// Roles allowed to submit expenses (excludes FREELANCER and INTERN)
const EXPENSE_SUBMIT_ROLES = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'OM', 'EMPLOYEE', 'SALES', 'ACCOUNTS', 'HR']

// Validation schema for expense creation
const createExpenseSchema = z.object({
  date: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  category: z.enum(['TRAVEL', 'FOOD', 'SOFTWARE', 'HARDWARE', 'OFFICE', 'MARKETING', 'OTHER']).optional().default('OTHER'),
  description: z.string().min(1, 'Description is required').max(500),
  amount: z.union([
    z.number().positive('Amount must be positive'),
    z.string().transform((val, ctx) => {
      const cleaned = val.replace(/[₹,\s]/g, '')
      const parsed = parseFloat(cleaned)
      if (isNaN(parsed) || !isFinite(parsed)) {
        ctx.addIssue({ code: 'custom', message: 'Invalid amount format' })
        return z.NEVER
      }
      if (parsed <= 0) {
        ctx.addIssue({ code: 'custom', message: 'Amount must be positive' })
        return z.NEVER
      }
      return parsed
    })
  ]),
  vendor: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  receipt: z.string().url().optional().nullable().or(z.literal('')),
  clientId: z.string().optional().nullable(),
})

// Validation for query params
const queryParamsSchema = z.object({
  limit: z.string().optional().transform(val => {
    if (!val) return undefined
    const parsed = parseInt(val, 10)
    if (isNaN(parsed) || parsed < 1) return undefined
    return Math.min(parsed, 100) // Cap at 100
  }),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const queryValidation = queryParamsSchema.safeParse({
      limit: searchParams.get('limit') ?? undefined,
      month: searchParams.get('month') ?? undefined,
    })

    if (!queryValidation.success) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
    }

    const { limit, month } = queryValidation.data

    // Only ACCOUNTS, MANAGER, or SUPER_ADMIN can view all expenses
    const canViewAll = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(session.user.role) ||
      session.user.department === 'ACCOUNTS'

    const where: Prisma.ExpenseWhereInput = canViewAll ? {} : { submittedBy: session.user.id }

    // Filter by month if provided (already validated)
    if (month) {
      const startDate = new Date(`${month}-01`)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      where.date = { gte: startDate, lt: endDate }
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
    })

    return NextResponse.json({ expenses })
  } catch (error) {
    console.error('Failed to fetch expenses:', error)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()

    // Validate input with Zod
    const validation = createExpenseSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors
      }, { status: 400 })
    }

    const { date, category, description, amount, vendor, notes, receipt, clientId } = validation.data

    // Parse date safely
    let expenseDate: Date
    if (date) {
      expenseDate = new Date(date)
      if (isNaN(expenseDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
      }
    } else {
      expenseDate = new Date()
    }

    const expense = await prisma.expense.create({
      data: {
        date: expenseDate,
        category,
        description,
        amount, // Already validated as positive number by Zod
        vendor: vendor || null,
        notes: notes || null,
        receipt: receipt || null,
        clientId: clientId || null,
        status: 'PENDING',
        submittedBy: user.id,
      },
    })

    // #83 Budget alert threshold check: when recording an expense, check if any
    // relevant budget alert threshold is exceeded and create notifications.
    try {
      // Only count APPROVED expenses toward budget alerts
      const approvedExpensesTotal = await prisma.expense.aggregate({
        where: {
          status: 'APPROVED',
          ...(clientId ? { clientId } : {}),
        },
        _sum: { amount: true },
      })

      const matchingAlerts = await prisma.budgetAlert.findMany({
        where: {
          alertsEnabled: true,
          isPaused: false,
          periodStart: { lte: expenseDate },
          OR: [
            { periodEnd: null },
            { periodEnd: { gte: expenseDate } },
          ],
          ...(clientId ? { clientId } : {}),
        },
      })

      for (const alert of matchingAlerts) {
        // Recalculate spent from approved expenses only
        const approvedTotal = approvedExpensesTotal._sum.amount || 0
        const newSpent = approvedTotal
        const newPercentage = (newSpent / alert.budgetAmount) * 100

        let newAlertLevel = 'NORMAL'
        if (newPercentage > 100) {
          newAlertLevel = 'EXCEEDED'
        } else if (newPercentage >= alert.criticalThreshold) {
          newAlertLevel = 'CRITICAL'
        } else if (newPercentage >= alert.warningThreshold) {
          newAlertLevel = 'WARNING'
        }

        const levelChanged = alert.alertLevel !== newAlertLevel

        await prisma.budgetAlert.update({
          where: { id: alert.id },
          data: {
            spentAmount: newSpent,
            spentPercentage: newPercentage,
            alertLevel: newAlertLevel,
            ...(alert.pauseOnCritical && newAlertLevel === 'CRITICAL' && !alert.isPaused
              ? { isPaused: true, pausedAt: new Date(), pausedBy: user.id }
              : {}),
          },
        })

        // Send notifications if threshold was newly crossed
        if (levelChanged && (newAlertLevel === 'WARNING' || newAlertLevel === 'CRITICAL' || newAlertLevel === 'EXCEEDED')) {
          let notifyUserIds: string[] = []
          try { notifyUserIds = JSON.parse(alert.notifyUsers || '[]') } catch { notifyUserIds = [] }
          if (notifyUserIds.length > 0) {
            const scopeLabel = alert.clientId ? `client budget` : alert.department ? `${alert.department} budget` : 'company budget'
            await prisma.notification.createMany({
              data: notifyUserIds.map((userId) => ({
                userId,
                type: 'BUDGET_ALERT',
                title: `Budget ${newAlertLevel}: ${scopeLabel}`,
                message: `Spending has reached ${newPercentage.toFixed(1)}% of the ${scopeLabel} (${alert.currency} ${newSpent.toFixed(2)} / ${alert.budgetAmount.toFixed(2)}).`,
                link: '/accounts/budget-alerts',
                priority: newAlertLevel === 'CRITICAL' || newAlertLevel === 'EXCEEDED' ? 'URGENT' : 'NORMAL',
              })),
            })

            await prisma.budgetAlert.update({
              where: { id: alert.id },
              data: { lastAlertSent: new Date() },
            })
          }
        }
      }
    } catch (budgetError) {
      // Don't fail the expense creation if budget alert check fails
      console.error('Failed to check budget alerts:', budgetError)
    }

    // Get user name for notification
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Someone'

    // Notify accounts team about new expense
    const accountsUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'ACCOUNTS' },
          { department: 'ACCOUNTS' },
        ],
        id: { not: user.id }, // Don't notify self
        deletedAt: null,
      },
      select: { id: true },
    })

    if (accountsUsers.length > 0) {
      await prisma.notification.createMany({
        data: accountsUsers.map((user) => ({
          userId: user.id,
          type: 'EXPENSE_SUBMITTED',
          title: 'New Expense Submitted',
          message: `${userName} submitted an expense for ₹${amount.toFixed(2)}: ${description}`,
          link: '/expenses',
        })),
      })
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Failed to create expense:', error)
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}, { roles: EXPENSE_SUBMIT_ROLES })
