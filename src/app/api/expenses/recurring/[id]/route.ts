import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

// Get a single recurring expense
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // Only ACCOUNTS, MANAGER, SUPER_ADMIN can view recurring expenses
    const allowedRoles = ['ACCOUNTS', 'MANAGER', 'SUPER_ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await routeParams!

    const expense = await prisma.recurringExpense.findUnique({
      where: { id },
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
          include: {
            payer: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...expense,
      nextDueDate: expense.nextDueDate.toISOString(),
      startDate: expense.startDate.toISOString(),
      endDate: expense.endDate?.toISOString() || null,
      lastPaidDate: expense.lastPaidDate?.toISOString() || null,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
      payments: expense.payments.map(p => ({
        ...p,
        paidDate: p.paidDate.toISOString(),
        dueDate: p.dueDate.toISOString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Failed to fetch expense:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    )
  }
})

// Update a recurring expense
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const allowedRoles = ['ACCOUNTS', 'MANAGER', 'SUPER_ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await routeParams!
    const body = await req.json()
    const patchSchema = z.object({
      name: z.string().min(1).max(300).optional(),
      description: z.string().max(1000).optional(),
      category: z.string().max(100).optional(),
      vendor: z.string().max(300).optional(),
      frequency: z.string().max(50).optional(),
      amount: z.number().min(0).optional(),
      currency: z.string().max(10).optional(),
      endDate: z.string().optional(),
      isClientBillable: z.boolean().optional(),
      autoPayEnabled: z.boolean().optional(),
      reminderDays: z.number().int().min(0).max(30).optional(),
      status: z.string().max(50).optional(),
    })
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })

    const expense = await prisma.recurringExpense.findUnique({
      where: { id },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    const updatedExpense = await prisma.recurringExpense.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        vendor: body.vendor,
        frequency: body.frequency,
        amount: body.amount,
        currency: body.currency,
        endDate: body.endDate ? new Date(body.endDate) : null,
        isClientBillable: body.isClientBillable,
        autoPayEnabled: body.autoPayEnabled,
        reminderDays: body.reminderDays,
        status: body.status,
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
        ...updatedExpense,
        nextDueDate: updatedExpense.nextDueDate.toISOString(),
        startDate: updatedExpense.startDate.toISOString(),
        endDate: updatedExpense.endDate?.toISOString() || null,
        lastPaidDate: updatedExpense.lastPaidDate?.toISOString() || null,
        createdAt: updatedExpense.createdAt.toISOString(),
        updatedAt: updatedExpense.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to update expense:', error)
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    )
  }
})

// Delete a recurring expense
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const allowedRoles = ['ACCOUNTS', 'MANAGER', 'SUPER_ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await routeParams!

    const expense = await prisma.recurringExpense.findUnique({
      where: { id },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Soft delete - change status to CANCELLED
    await prisma.recurringExpense.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete expense:', error)
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    )
  }
})
