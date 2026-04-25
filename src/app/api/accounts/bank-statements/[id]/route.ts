import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const updateStatementSchema = z.object({
  openingBalance: z.number().optional(),
  closingBalance: z.number().optional(),
  status: z.string().optional(),
  processingError: z.string().optional(),
})

// GET /api/accounts/bank-statements/[id] - Get statement with all transactions
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const hasAccess = ['SUPER_ADMIN', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await routeParams!

    const { searchParams } = new URL(req.url)
    const matchStatus = searchParams.get('matchStatus')
    const category = searchParams.get('category')

    const transactionWhere: Prisma.BankTransactionWhereInput = { statementId: id }
    if (matchStatus) transactionWhere.matchStatus = matchStatus
    if (category) transactionWhere.category = category

    const statement = await prisma.bankStatement.findUnique({
      where: { id },
      include: {
        transactions: {
          where: transactionWhere,
          include: {
            client: { select: { id: true, name: true } },
            invoice: { select: { id: true, invoiceNumber: true } },
            payment: { select: { id: true, grossAmount: true, transactionRef: true } }
          },
          orderBy: { transactionDate: 'desc' }
        }
      }
    })

    if (!statement) {
      return NextResponse.json({ error: 'Statement not found' }, { status: 404 })
    }

    // Calculate transaction stats
    const stats = {
      total: statement.transactions.length,
      credits: statement.transactions.filter(t => t.type === 'CREDIT').length,
      debits: statement.transactions.filter(t => t.type === 'DEBIT').length,
      matched: statement.transactions.filter(t => ['AUTO_MATCHED', 'MANUAL_MATCHED'].includes(t.matchStatus)).length,
      unmatched: statement.transactions.filter(t => t.matchStatus === 'UNMATCHED').length,
      ignored: statement.transactions.filter(t => t.matchStatus === 'IGNORED').length,
      reviewed: statement.transactions.filter(t => t.isReviewed).length
    }

    return NextResponse.json({
      statement: {
        ...statement,
        statementMonth: statement.statementMonth.toISOString(),
        processedAt: statement.processedAt?.toISOString(),
        createdAt: statement.createdAt.toISOString(),
        updatedAt: statement.updatedAt.toISOString(),
        transactions: statement.transactions.map(t => ({
          ...t,
          transactionDate: t.transactionDate.toISOString(),
          valueDate: t.valueDate?.toISOString(),
          reviewedAt: t.reviewedAt?.toISOString(),
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString()
        }))
      },
      stats
    })
  } catch (error) {
    console.error('Failed to fetch bank statement:', error)
    return NextResponse.json({ error: 'Failed to fetch bank statement' }, { status: 500 })
  }
})

// PATCH /api/accounts/bank-statements/[id] - Update statement metadata
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const hasAccess = ['SUPER_ADMIN', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await routeParams!
    const raw = await req.json()
    const parsed = updateStatementSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const body = parsed.data

    const statement = await prisma.bankStatement.update({
      where: { id },
      data: {
        ...(body.openingBalance !== undefined && { openingBalance: body.openingBalance }),
        ...(body.closingBalance !== undefined && { closingBalance: body.closingBalance }),
        ...(body.status && { status: body.status }),
        ...(body.processingError && { processingError: body.processingError })
      }
    })

    return NextResponse.json({
      statement: {
        ...statement,
        statementMonth: statement.statementMonth.toISOString(),
        processedAt: statement.processedAt?.toISOString(),
        createdAt: statement.createdAt.toISOString(),
        updatedAt: statement.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Failed to update bank statement:', error)
    return NextResponse.json({ error: 'Failed to update bank statement' }, { status: 500 })
  }
})

// DELETE /api/accounts/bank-statements/[id] - Delete statement and all transactions
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const hasAccess = ['SUPER_ADMIN'].includes(user.role)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden - Only Super Admin can delete statements' }, { status: 403 })
    }

    const { id } = await routeParams!

    // Cascade delete will remove all transactions
    await prisma.bankStatement.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete bank statement:', error)
    return NextResponse.json({ error: 'Failed to delete bank statement' }, { status: 500 })
  }
})
