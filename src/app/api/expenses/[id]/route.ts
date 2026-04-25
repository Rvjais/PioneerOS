import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { parseMoney } from '@/shared/utils/money'
import { z } from 'zod'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const expense = await prisma.expense.findUnique({
      where: { id },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Check if user can view this expense
    const canViewAll = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(session.user.role) ||
      session.user.department === 'ACCOUNTS'

    if (!canViewAll && expense.submittedBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Failed to fetch expense:', error)
    return NextResponse.json({ error: 'Failed to fetch expense' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check expense exists and user has permission
    const existingExpense = await prisma.expense.findUnique({
      where: { id },
    })

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Only owner can edit, unless user is ACCOUNTS/MANAGER/SUPER_ADMIN
    const canEditAll = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(session.user.role) ||
      session.user.department === 'ACCOUNTS'

    if (!canEditAll && existingExpense.submittedBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Owners can't change status - only ACCOUNTS/MANAGER can
    const body = await req.json()
    const patchSchema = z.object({
      date: z.string().optional(),
      category: z.string().max(100).optional(),
      description: z.string().max(1000).optional(),
      amount: z.union([z.string(), z.number()]).optional(),
      vendor: z.string().max(300).optional(),
      notes: z.string().max(2000).optional(),
      receipt: z.string().max(1000).optional(),
      status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'REIMBURSED']).optional(),
    })
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const updateData: Record<string, unknown> = {}

    if (body.date !== undefined) updateData.date = new Date(body.date)
    if (body.category !== undefined) updateData.category = body.category
    if (body.description !== undefined) updateData.description = body.description
    if (body.amount !== undefined) updateData.amount = parseMoney(body.amount)
    if (body.vendor !== undefined) updateData.vendor = body.vendor || null
    if (body.notes !== undefined) updateData.notes = body.notes || null
    if (body.receipt !== undefined) updateData.receipt = body.receipt || null

    // Only privileged users can change status
    const statusChanged = body.status !== undefined && canEditAll && body.status !== existingExpense.status
    if (statusChanged) {
      updateData.status = body.status
      updateData.approvedBy = ['APPROVED', 'REJECTED'].includes(body.status) ? session.user.id : undefined
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
    })

    // Notify submitter when expense is approved/rejected
    if (statusChanged && existingExpense.submittedBy && existingExpense.submittedBy !== session.user.id) {
      const isApproved = body.status === 'APPROVED'
      await prisma.notification.create({
        data: {
          userId: existingExpense.submittedBy,
          type: isApproved ? 'EXPENSE_APPROVED' : 'EXPENSE_REJECTED',
          title: isApproved ? 'Expense Approved' : 'Expense Rejected',
          message: isApproved
            ? `Your expense "${existingExpense.description}" for ₹${existingExpense.amount} has been approved.`
            : `Your expense "${existingExpense.description}" has been rejected.`,
          link: '/expenses',
        },
      })
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Failed to update expense:', error)
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check expense exists and user has permission
    const existingExpense = await prisma.expense.findUnique({
      where: { id },
    })

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Only owner or ACCOUNTS/MANAGER/SUPER_ADMIN can delete
    const canDeleteAll = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(session.user.role) ||
      session.user.department === 'ACCOUNTS'

    if (!canDeleteAll && existingExpense.submittedBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Don't allow deleting approved expenses unless SUPER_ADMIN
    if (existingExpense.status === 'APPROVED' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cannot delete approved expenses' }, { status: 400 })
    }

    await prisma.expense.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete expense:', error)
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}
