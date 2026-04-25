import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { RECONCILIATION_CONFIG } from '@/shared/constants/config/accounts'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const reconcileSchema = z.object({
  month: z.string().min(1),
  autoMatch: z.boolean().optional(),
})

interface DuplicateCandidate {
  id: string
  clientId: string
  clientName: string
  grossAmount: number
  collectedAt: Date
  transactionRef: string | null
  matchedWith: {
    id: string
    grossAmount: number
    collectedAt: Date
    transactionRef: string | null
    amountDiff: number
    daysDiff: number
  }[]
}

interface ReconciliationMismatch {
  type: 'AMOUNT_MISMATCH' | 'MISSING_PAYMENT' | 'MISSING_TRANSACTION' | 'DUPLICATE_PAYMENT'
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  bankTransaction?: {
    id: string
    amount: number
    date: string
    description: string
  }
  payment?: {
    id: string
    amount: number
    date: string
    clientName: string
  }
  details: string
}

// GET /api/accounts/reconciliation - Get reconciliation status for a month
export const GET = withAuth(async (req, { user, params }) => {
  try {
const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') // Format: YYYY-MM

    if (!month) {
      return NextResponse.json({ error: 'Month is required (YYYY-MM format)' }, { status: 400 })
    }

    const startDate = new Date(`${month}-01`)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)

    // Get all payments for the month
    const payments = await prisma.paymentCollection.findMany({
      where: {
        collectedAt: { gte: startDate, lt: endDate }
      },
      include: {
        client: { select: { id: true, name: true } },
        invoice: { select: { id: true, invoiceNumber: true } }
      },
      orderBy: { collectedAt: 'asc' }
    })

    // Get all matched bank transactions for the month
    const matchedTransactions = await prisma.bankTransaction.findMany({
      where: {
        transactionDate: { gte: startDate, lt: endDate },
        matchStatus: { in: ['AUTO_MATCHED', 'MANUAL_MATCHED'] },
        type: 'CREDIT'
      },
      include: {
        client: { select: { id: true, name: true } },
        payment: { select: { id: true, grossAmount: true } }
      },
      orderBy: { transactionDate: 'asc' }
    })

    // Get unmatched credit transactions (potential missing payments)
    const unmatchedCredits = await prisma.bankTransaction.findMany({
      where: {
        transactionDate: { gte: startDate, lt: endDate },
        matchStatus: 'UNMATCHED',
        type: 'CREDIT'
      },
      orderBy: { transactionDate: 'asc' }
    })

    // Detect duplicates
    const duplicates = detectDuplicates(payments)

    // Detect mismatches
    const mismatches = detectMismatches(payments, matchedTransactions, unmatchedCredits)

    // Calculate summary
    const totalPayments = payments.reduce((sum, p) => sum + p.grossAmount, 0)
    const totalMatchedTransactions = matchedTransactions.reduce((sum, t) => sum + t.amount, 0)
    const totalUnmatchedCredits = unmatchedCredits.reduce((sum, t) => sum + t.amount, 0)

    return NextResponse.json({
      month,
      summary: {
        paymentsCount: payments.length,
        totalPaymentsAmount: totalPayments,
        matchedTransactionsCount: matchedTransactions.length,
        totalMatchedAmount: totalMatchedTransactions,
        unmatchedCreditsCount: unmatchedCredits.length,
        totalUnmatchedAmount: totalUnmatchedCredits,
        variance: totalPayments - totalMatchedTransactions,
        duplicatesCount: duplicates.length,
        mismatchesCount: mismatches.length,
        reconciliationStatus: getReconciliationStatus(mismatches, duplicates)
      },
      duplicates: duplicates.map(d => ({
        ...d,
        collectedAt: d.collectedAt.toISOString(),
        matchedWith: d.matchedWith.map(m => ({
          ...m,
          collectedAt: m.collectedAt.toISOString()
        }))
      })),
      mismatches,
      payments: payments.map(p => ({
        ...p,
        collectedAt: p.collectedAt.toISOString(),
        retainerMonth: p.retainerMonth?.toISOString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString()
      })),
      unmatchedCredits: unmatchedCredits.map(t => ({
        ...t,
        transactionDate: t.transactionDate.toISOString(),
        valueDate: t.valueDate?.toISOString(),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Failed to get reconciliation:', error)
    return NextResponse.json({ error: 'Failed to get reconciliation data' }, { status: 500 })
  }
})

// POST /api/accounts/reconciliation - Auto-reconcile payments with transactions
export const POST = withAuth(async (req, { user, params }) => {
  try {
const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const raw = await req.json()
    const parsed = reconcileSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { month, autoMatch } = parsed.data

    const startDate = new Date(`${month}-01`)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)

    const results = {
      matched: 0,
      skipped: 0,
      errors: [] as string[]
    }

    if (autoMatch) {
      // Wrap auto-match in a transaction to prevent race conditions
      await prisma.$transaction(async (tx) => {
        // Get unmatched payments
        const unmatchedPayments = await tx.paymentCollection.findMany({
          where: {
            collectedAt: { gte: startDate, lt: endDate }
          },
          include: {
            client: { select: { id: true, name: true } }
          }
        })

        // Get unmatched credit transactions
        const unmatchedCredits = await tx.bankTransaction.findMany({
          where: {
            transactionDate: { gte: startDate, lt: endDate },
            matchStatus: 'UNMATCHED',
            type: 'CREDIT',
            paymentId: null
          }
        })

        // Try to match payments with transactions
        for (const payment of unmatchedPayments) {
          // Already linked to a transaction?
          const existingMatch = await tx.bankTransaction.findFirst({
            where: { paymentId: payment.id }
          })

          if (existingMatch) {
            results.skipped++
            continue
          }

          // Find matching transaction by amount and date proximity
          const matchingTransaction = unmatchedCredits.find(t => {
            const amountTolerance = payment.grossAmount * RECONCILIATION_CONFIG.DUPLICATE_AMOUNT_TOLERANCE
            const amountMatch = Math.abs(t.amount - payment.grossAmount) <= amountTolerance

            const daysDiff = Math.abs(
              (t.transactionDate.getTime() - payment.collectedAt.getTime()) / (1000 * 60 * 60 * 24)
            )
            const dateMatch = daysDiff <= RECONCILIATION_CONFIG.DUPLICATE_DATE_RANGE_DAYS

            // Also check if transaction ref matches (if available)
            const refMatch = payment.transactionRef && t.description
              ? t.description.toLowerCase().includes(payment.transactionRef.toLowerCase())
              : true

            return amountMatch && dateMatch && refMatch
          })

          if (matchingTransaction) {
            try {
              // Link payment to transaction
              await tx.bankTransaction.update({
                where: { id: matchingTransaction.id },
                data: {
                  paymentId: payment.id,
                  clientId: payment.clientId,
                  matchStatus: 'AUTO_MATCHED',
                  isReviewed: true,
                  reviewedBy: user.id,
                  reviewedAt: new Date(),
                  reviewNotes: 'Auto-reconciled by system'
                }
              })

              // Update statement match count
              await tx.bankStatement.update({
                where: { id: matchingTransaction.statementId },
                data: {
                  matchedCount: { increment: 1 },
                  unmatchedCount: { decrement: 1 }
                }
              })

              // Remove from available pool
              const index = unmatchedCredits.indexOf(matchingTransaction)
              if (index > -1) {
                unmatchedCredits.splice(index, 1)
              }

              results.matched++
            } catch (err) {
              results.errors.push(`Failed to match payment ${payment.id}: ${err}`)
            }
          } else {
            results.skipped++
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Auto-reconciliation complete. Matched: ${results.matched}, Skipped: ${results.skipped}`
    })
  } catch (error) {
    console.error('Failed to run reconciliation:', error)
    return NextResponse.json({ error: 'Failed to run reconciliation' }, { status: 500 })
  }
})

/**
 * Detect duplicate payments based on amount and date proximity
 */
interface PaymentWithClient {
  id: string
  clientId: string
  client: { name: string }
  grossAmount: number
  collectedAt: Date
  transactionRef: string | null
}

function detectDuplicates(payments: PaymentWithClient[]): DuplicateCandidate[] {
  const duplicates: DuplicateCandidate[] = []
  const processed = new Set<string>()

  for (let i = 0; i < payments.length; i++) {
    if (processed.has(payments[i].id)) continue

    const payment = payments[i]
    const matches: DuplicateCandidate['matchedWith'] = []

    for (let j = i + 1; j < payments.length; j++) {
      if (processed.has(payments[j].id)) continue

      const other = payments[j]

      // Same client
      if (payment.clientId !== other.clientId) continue

      // Similar amount (within tolerance)
      const amountTolerance = payment.grossAmount * RECONCILIATION_CONFIG.DUPLICATE_AMOUNT_TOLERANCE
      const amountDiff = Math.abs(payment.grossAmount - other.grossAmount)
      if (amountDiff > amountTolerance) continue

      // Within date range
      const daysDiff = Math.abs(
        (payment.collectedAt.getTime() - other.collectedAt.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysDiff > RECONCILIATION_CONFIG.DUPLICATE_DATE_RANGE_DAYS) continue

      matches.push({
        id: other.id,
        grossAmount: other.grossAmount,
        collectedAt: other.collectedAt,
        transactionRef: other.transactionRef,
        amountDiff,
        daysDiff
      })

      processed.add(other.id)
    }

    if (matches.length > 0) {
      duplicates.push({
        id: payment.id,
        clientId: payment.clientId,
        clientName: payment.client.name,
        grossAmount: payment.grossAmount,
        collectedAt: payment.collectedAt,
        transactionRef: payment.transactionRef,
        matchedWith: matches
      })
      processed.add(payment.id)
    }
  }

  return duplicates
}

/**
 * Detect mismatches between payments and bank transactions
 */
interface MatchedTransaction {
  id: string
  amount: number
  transactionDate: Date
  description: string
  client?: { name: string } | null
  payment?: { id: string; grossAmount: number } | null
}

interface UnmatchedCredit {
  id: string
  amount: number
  transactionDate: Date
  description: string
}

function detectMismatches(
  payments: PaymentWithClient[],
  matchedTransactions: MatchedTransaction[],
  unmatchedCredits: UnmatchedCredit[]
): ReconciliationMismatch[] {
  const mismatches: ReconciliationMismatch[] = []

  // Check for amount mismatches in matched transactions
  for (const transaction of matchedTransactions) {
    if (transaction.payment) {
      const amountDiff = Math.abs(transaction.amount - transaction.payment.grossAmount)
      if (amountDiff > 1) { // More than 1 unit difference
        mismatches.push({
          type: 'AMOUNT_MISMATCH',
          severity: amountDiff > 1000 ? 'HIGH' : amountDiff > 100 ? 'MEDIUM' : 'LOW',
          bankTransaction: {
            id: transaction.id,
            amount: transaction.amount,
            date: transaction.transactionDate.toISOString(),
            description: transaction.description
          },
          payment: {
            id: transaction.payment.id,
            amount: transaction.payment.grossAmount,
            date: transaction.transactionDate.toISOString(),
            clientName: transaction.client?.name || 'Unknown'
          },
          details: `Amount difference of ${amountDiff.toFixed(2)} between bank transaction and recorded payment`
        })
      }
    }
  }

  // Check for significant unmatched credits (potential missing payments)
  for (const credit of unmatchedCredits) {
    if (credit.amount >= 5000) { // Only flag significant amounts
      mismatches.push({
        type: 'MISSING_PAYMENT',
        severity: credit.amount > 50000 ? 'HIGH' : credit.amount > 10000 ? 'MEDIUM' : 'LOW',
        bankTransaction: {
          id: credit.id,
          amount: credit.amount,
          date: credit.transactionDate.toISOString(),
          description: credit.description
        },
        details: `Unmatched bank credit of ${credit.amount.toFixed(2)} - may need payment record`
      })
    }
  }

  // Check for payments without matching bank transactions
  const matchedPaymentIds = new Set(
    matchedTransactions
      .filter((t): t is MatchedTransaction & { payment: NonNullable<MatchedTransaction['payment']> } => !!t.payment)
      .map(t => t.payment.id)
  )

  for (const payment of payments) {
    if (!matchedPaymentIds.has(payment.id) && payment.grossAmount >= 5000) {
      mismatches.push({
        type: 'MISSING_TRANSACTION',
        severity: payment.grossAmount > 50000 ? 'HIGH' : payment.grossAmount > 10000 ? 'MEDIUM' : 'LOW',
        payment: {
          id: payment.id,
          amount: payment.grossAmount,
          date: payment.collectedAt.toISOString(),
          clientName: payment.client?.name || 'Unknown'
        },
        details: `Payment of ${payment.grossAmount.toFixed(2)} from ${payment.client?.name} has no matching bank transaction`
      })
    }
  }

  return mismatches.sort((a, b) => {
    const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })
}

/**
 * Get overall reconciliation status
 */
function getReconciliationStatus(
  mismatches: ReconciliationMismatch[],
  duplicates: DuplicateCandidate[]
): 'RECONCILED' | 'NEEDS_REVIEW' | 'CRITICAL' {
  const highSeverity = mismatches.filter(m => m.severity === 'HIGH').length
  const mediumSeverity = mismatches.filter(m => m.severity === 'MEDIUM').length

  if (highSeverity > 0 || duplicates.length > 2) {
    return 'CRITICAL'
  }

  if (mediumSeverity > 0 || duplicates.length > 0 || mismatches.length > 5) {
    return 'NEEDS_REVIEW'
  }

  return 'RECONCILED'
}
