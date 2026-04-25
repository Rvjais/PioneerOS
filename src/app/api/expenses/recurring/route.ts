import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

// Get all recurring expenses
export const GET = withAuth(async (req, { user, params }) => {
  try {
// Only ACCOUNTS, MANAGER, SUPER_ADMIN can view expenses
    const allowedRoles = ['ACCOUNTS', 'MANAGER', 'SUPER_ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    const expenses = await prisma.recurringExpense.findMany({
      where: {
        ...(status && { status }),
        ...(category && { category }),
      },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true },
        },
        allocations: {
          include: {
            client: {
              select: { id: true, name: true },
            },
          },
        },
        payments: {
          orderBy: { paidDate: 'desc' },
          take: 5,
        },
      },
      orderBy: [
        { nextDueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    // Calculate totals
    const activeExpenses = expenses.filter(e => e.status === 'ACTIVE')
    const monthlyTotal = activeExpenses.reduce((sum, e) => {
      const monthlyAmount = calculateMonthlyEquivalent(e.amount, e.frequency)
      return sum + monthlyAmount
    }, 0)

    return NextResponse.json({
      expenses: expenses.map(e => ({
        ...e,
        nextDueDate: e.nextDueDate.toISOString(),
        startDate: e.startDate.toISOString(),
        endDate: e.endDate?.toISOString() || null,
        lastPaidDate: e.lastPaidDate?.toISOString() || null,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
        payments: e.payments.map(p => ({
          ...p,
          paidDate: p.paidDate.toISOString(),
          dueDate: p.dueDate.toISOString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        })),
      })),
      summary: {
        totalExpenses: expenses.length,
        activeExpenses: activeExpenses.length,
        monthlyTotal,
        upcomingDue: activeExpenses.filter(e => {
          const daysUntilDue = Math.ceil((new Date(e.nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          return daysUntilDue <= 7 && daysUntilDue >= 0
        }).length,
      },
    })
  } catch (error) {
    console.error('Failed to fetch recurring expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recurring expenses' },
      { status: 500 }
    )
  }
})

// Create a new recurring expense
export const POST = withAuth(async (req, { user, params }) => {
  try {
// Only ACCOUNTS, MANAGER, SUPER_ADMIN can create expenses
    const allowedRoles = ['ACCOUNTS', 'MANAGER', 'SUPER_ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const postSchema = z.object({
      name: z.string().min(1).max(300),
      description: z.string().max(1000).optional(),
      category: z.string().min(1).max(100),
      vendor: z.string().max(300).optional(),
      frequency: z.string().min(1).max(50),
      amount: z.number().min(0),
      currency: z.string().max(10).optional().default('INR'),
      startDate: z.string().min(1),
      endDate: z.string().optional(),
      isClientBillable: z.boolean().optional().default(false),
      autoPayEnabled: z.boolean().optional().default(false),
      reminderDays: z.number().int().min(0).max(30).optional().default(3),
      allocations: z.array(z.object({
        clientId: z.string().min(1),
        percentage: z.number().optional(),
        fixedAmount: z.number().optional(),
        notes: z.string().max(500).optional(),
      })).optional().default([]),
    })
    const parsed = postSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const {
      name,
      description,
      category,
      vendor,
      frequency,
      amount,
      currency,
      startDate,
      endDate,
      isClientBillable,
      autoPayEnabled,
      reminderDays,
      allocations,
    } = parsed.data

    // Calculate next due date based on start date and frequency
    const nextDueDate = calculateNextDueDate(new Date(startDate), frequency)

    const expense = await prisma.recurringExpense.create({
      data: {
        name,
        description,
        category,
        vendor,
        frequency,
        amount,
        currency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        nextDueDate,
        isClientBillable,
        autoPayEnabled,
        reminderDays,
        status: 'ACTIVE',
        createdBy: user.id,
        allocations: {
          create: allocations.map((a: { clientId: string; percentage?: number; fixedAmount?: number; notes?: string }) => ({
            clientId: a.clientId,
            percentage: a.percentage || 100,
            fixedAmount: a.fixedAmount,
            notes: a.notes,
          })),
        },
      },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true },
        },
        allocations: {
          include: {
            client: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      expense: {
        ...expense,
        nextDueDate: expense.nextDueDate.toISOString(),
        startDate: expense.startDate.toISOString(),
        endDate: expense.endDate?.toISOString() || null,
        createdAt: expense.createdAt.toISOString(),
        updatedAt: expense.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to create recurring expense:', error)
    return NextResponse.json(
      { error: 'Failed to create recurring expense' },
      { status: 500 }
    )
  }
})

// Helper to calculate next due date based on frequency
function calculateNextDueDate(startDate: Date, frequency: string): Date {
  const now = new Date()
  let nextDue = new Date(startDate)

  // If start date is in the future, that's the next due date
  if (nextDue > now) {
    return nextDue
  }

  // Calculate the next occurrence
  switch (frequency) {
    case 'DAILY':
      nextDue = new Date(now)
      nextDue.setDate(nextDue.getDate() + 1)
      break
    case 'WEEKLY':
      while (nextDue <= now) {
        nextDue.setDate(nextDue.getDate() + 7)
      }
      break
    case 'MONTHLY':
      while (nextDue <= now) {
        nextDue.setMonth(nextDue.getMonth() + 1)
      }
      break
    case 'QUARTERLY':
      while (nextDue <= now) {
        nextDue.setMonth(nextDue.getMonth() + 3)
      }
      break
    case 'HALF_YEARLY':
      while (nextDue <= now) {
        nextDue.setMonth(nextDue.getMonth() + 6)
      }
      break
    case 'YEARLY':
      while (nextDue <= now) {
        nextDue.setFullYear(nextDue.getFullYear() + 1)
      }
      break
    default:
      nextDue = new Date(now)
      nextDue.setMonth(nextDue.getMonth() + 1)
  }

  return nextDue
}

// Helper to calculate monthly equivalent of expense
function calculateMonthlyEquivalent(amount: number, frequency: string): number {
  switch (frequency) {
    case 'DAILY':
      return amount * 30
    case 'WEEKLY':
      return amount * 4.33
    case 'MONTHLY':
      return amount
    case 'QUARTERLY':
      return amount / 3
    case 'HALF_YEARLY':
      return amount / 6
    case 'YEARLY':
      return amount / 12
    default:
      return amount
  }
}
