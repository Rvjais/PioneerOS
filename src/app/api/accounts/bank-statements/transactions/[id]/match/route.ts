import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const matchTransactionSchema = z.object({
  clientId: z.string().optional(),
  invoiceId: z.string().optional(),
  paymentId: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  matchStatus: z.string().optional(),
  reviewNotes: z.string().optional(),
})

const bulkUpdateSchema = z.object({
  transactionIds: z.array(z.string().min(1)).min(1),
  category: z.string().optional(),
  matchStatus: z.string().optional(),
})

// POST /api/accounts/bank-statements/transactions/[id]/match - Manual match transaction
export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const hasAccess = ['SUPER_ADMIN', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await routeParams!
    const raw = await req.json()
    const parsed = matchTransactionSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const {
      clientId,
      invoiceId,
      paymentId,
      category,
      subcategory,
      matchStatus,
      reviewNotes
    } = parsed.data

    // Get the transaction
    const transaction = await prisma.bankTransaction.findUnique({
      where: { id },
      include: { statement: true }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Update the transaction
    const updatedTransaction = await prisma.bankTransaction.update({
      where: { id },
      data: {
        ...(clientId !== undefined && { clientId }),
        ...(invoiceId !== undefined && { invoiceId }),
        ...(paymentId !== undefined && { paymentId }),
        ...(category && { category }),
        ...(subcategory && { subcategory }),
        matchStatus: matchStatus || (clientId ? 'MANUAL_MATCHED' : transaction.matchStatus),
        isReviewed: true,
        reviewedBy: user.id,
        reviewedAt: new Date(),
        ...(reviewNotes && { reviewNotes })
      },
      include: {
        client: { select: { id: true, name: true } },
        invoice: { select: { id: true, invoiceNumber: true } },
        payment: { select: { id: true, grossAmount: true, transactionRef: true } }
      }
    })

    // Update statement match counts
    const wasMatched = ['AUTO_MATCHED', 'MANUAL_MATCHED'].includes(transaction.matchStatus)
    const isNowMatched = ['AUTO_MATCHED', 'MANUAL_MATCHED'].includes(updatedTransaction.matchStatus)

    if (!wasMatched && isNowMatched) {
      await prisma.bankStatement.update({
        where: { id: transaction.statementId },
        data: {
          matchedCount: { increment: 1 },
          unmatchedCount: { decrement: 1 }
        }
      })
    } else if (wasMatched && !isNowMatched) {
      await prisma.bankStatement.update({
        where: { id: transaction.statementId },
        data: {
          matchedCount: { decrement: 1 },
          unmatchedCount: { increment: 1 }
        }
      })
    }

    return NextResponse.json({
      transaction: {
        ...updatedTransaction,
        transactionDate: updatedTransaction.transactionDate.toISOString(),
        valueDate: updatedTransaction.valueDate?.toISOString(),
        reviewedAt: updatedTransaction.reviewedAt?.toISOString(),
        createdAt: updatedTransaction.createdAt.toISOString(),
        updatedAt: updatedTransaction.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Failed to match transaction:', error)
    return NextResponse.json({ error: 'Failed to match transaction' }, { status: 500 })
  }
})

// PATCH /api/accounts/bank-statements/transactions/[id]/match - Bulk update transactions
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const hasAccess = ['SUPER_ADMIN', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // In this case, id is the statement id, not transaction id
    const { id: statementId } = await routeParams!
    const rawPatch = await req.json()
    const parsedPatch = bulkUpdateSchema.safeParse(rawPatch)
    if (!parsedPatch.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsedPatch.error.flatten() }, { status: 400 })
    }
    const { transactionIds, category, matchStatus } = parsedPatch.data

    // Bulk update
    const updateData: Record<string, unknown> = {
      isReviewed: true,
      reviewedBy: user.id,
      reviewedAt: new Date()
    }
    if (category) updateData.category = category
    if (matchStatus) updateData.matchStatus = matchStatus

    await prisma.bankTransaction.updateMany({
      where: {
        id: { in: transactionIds },
        statementId
      },
      data: updateData
    })

    // Recalculate statement counts
    const transactions = await prisma.bankTransaction.findMany({
      where: { statementId },
      select: { matchStatus: true }
    })

    const matchedCount = transactions.filter(t => ['AUTO_MATCHED', 'MANUAL_MATCHED'].includes(t.matchStatus)).length
    const unmatchedCount = transactions.filter(t => t.matchStatus === 'UNMATCHED').length

    await prisma.bankStatement.update({
      where: { id: statementId },
      data: { matchedCount, unmatchedCount }
    })

    return NextResponse.json({
      success: true,
      updated: transactionIds.length,
      matchedCount,
      unmatchedCount
    })
  } catch (error) {
    console.error('Failed to bulk update transactions:', error)
    return NextResponse.json({ error: 'Failed to bulk update transactions' }, { status: 500 })
  }
})
