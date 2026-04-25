import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

// Record a payment for a recurring expense
export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const allowedRoles = ['ACCOUNTS', 'MANAGER', 'SUPER_ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await routeParams!
    const body = await req.json()
    const schema = z.object({
      amount: z.number().min(0).optional(),
      paidDate: z.string().optional(),
      paymentMethod: z.string().max(100).optional(),
      transactionRef: z.string().max(200).optional(),
      receipt: z.string().max(1000).optional(),
      notes: z.string().max(1000).optional(),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })

    const expense = await prisma.recurringExpense.findUnique({
      where: { id },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    const {
      amount = expense.amount,
      paidDate = new Date(),
      paymentMethod,
      transactionRef,
      receipt,
      notes,
    } = body

    // Create the payment record
    const payment = await prisma.expensePayment.create({
      data: {
        expenseId: id,
        amount,
        paidDate: new Date(paidDate),
        dueDate: expense.nextDueDate,
        paymentMethod,
        transactionRef,
        receipt,
        status: 'PAID',
        notes,
        paidBy: user.id,
      },
    })

    // Calculate next due date
    const nextDueDate = calculateNextDueDate(expense.nextDueDate, expense.frequency)

    // Update the expense with new due date and last paid date
    await prisma.recurringExpense.update({
      where: { id },
      data: {
        lastPaidDate: new Date(paidDate),
        nextDueDate,
      },
    })

    return NextResponse.json({
      success: true,
      payment: {
        ...payment,
        paidDate: payment.paidDate.toISOString(),
        dueDate: payment.dueDate.toISOString(),
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString(),
      },
      nextDueDate: nextDueDate.toISOString(),
    })
  } catch (error) {
    console.error('Failed to record payment:', error)
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    )
  }
})

// Helper to calculate next due date
function calculateNextDueDate(currentDueDate: Date, frequency: string): Date {
  const nextDue = new Date(currentDueDate)

  switch (frequency) {
    case 'DAILY':
      nextDue.setDate(nextDue.getDate() + 1)
      break
    case 'WEEKLY':
      nextDue.setDate(nextDue.getDate() + 7)
      break
    case 'MONTHLY':
      nextDue.setMonth(nextDue.getMonth() + 1)
      break
    case 'QUARTERLY':
      nextDue.setMonth(nextDue.getMonth() + 3)
      break
    case 'HALF_YEARLY':
      nextDue.setMonth(nextDue.getMonth() + 6)
      break
    case 'YEARLY':
      nextDue.setFullYear(nextDue.getFullYear() + 1)
      break
    default:
      nextDue.setMonth(nextDue.getMonth() + 1)
  }

  return nextDue
}
