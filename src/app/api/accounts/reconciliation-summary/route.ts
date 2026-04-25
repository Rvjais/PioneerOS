import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async (req, { user }) => {
  const financialRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS']
  if (!financialRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {

    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') || ''
    const entityId = searchParams.get('entityId') || ''

    // Build filter
    const stmtWhere: Record<string, unknown> = {}
    if (month) stmtWhere.statementMonth = month
    if (entityId) stmtWhere.entityId = entityId

    // Get bank statements
    const statements = await prisma.bankStatement.findMany({
      where: stmtWhere,
      include: {
        transactions: {
          select: {
            id: true,
            type: true,
            amount: true,
            matchStatus: true,
            matchConfidence: true,
            category: true,
            clientId: true,
            invoiceId: true,
            paymentId: true,
            isReviewed: true,
            description: true,
            transactionDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Per-statement summary
    const statementSummaries = statements.map(stmt => {
      const txns = stmt.transactions
      const credits = txns.filter(t => t.type === 'CREDIT')
      const debits = txns.filter(t => t.type === 'DEBIT')
      const matched = txns.filter(t => ['AUTO_MATCHED', 'MANUAL_MATCHED'].includes(t.matchStatus))
      const unmatched = txns.filter(t => t.matchStatus === 'UNMATCHED')
      const ignored = txns.filter(t => t.matchStatus === 'IGNORED')
      const reviewed = txns.filter(t => t.isReviewed)

      return {
        id: stmt.id,
        bankName: stmt.bankName,
        accountNumber: stmt.accountNumber,
        statementMonth: stmt.statementMonth,
        status: stmt.status,
        openingBalance: stmt.openingBalance,
        closingBalance: stmt.closingBalance,
        totalCredits: credits.reduce((s, t) => s + t.amount, 0),
        totalDebits: debits.reduce((s, t) => s + t.amount, 0),
        transactionCount: txns.length,
        creditCount: credits.length,
        debitCount: debits.length,
        matchedCount: matched.length,
        unmatchedCount: unmatched.length,
        ignoredCount: ignored.length,
        reviewedCount: reviewed.length,
        matchRate: txns.length > 0 ? Math.round((matched.length / txns.length) * 100) : 0,
        reviewRate: txns.length > 0 ? Math.round((reviewed.length / txns.length) * 100) : 0,
        unmatchedCredits: credits.filter(t => t.matchStatus === 'UNMATCHED').reduce((s, t) => s + t.amount, 0),
        unmatchedDebits: debits.filter(t => t.matchStatus === 'UNMATCHED').reduce((s, t) => s + t.amount, 0),
      }
    })

    // Get unlinked payments (payments without matching bank transactions)
    const recentPayments = await prisma.paymentCollection.findMany({
      where: {
        status: 'CONFIRMED',
        ...(month ? {
          collectedAt: {
            gte: new Date(`${month}-01`),
            lte: new Date(new Date(`${month}-01`).getFullYear(), new Date(`${month}-01`).getMonth() + 1, 0),
          },
        } : {
          collectedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1) },
        }),
      },
      select: {
        id: true,
        clientId: true,
        grossAmount: true,
        netAmount: true,
        transactionRef: true,
        collectedAt: true,
        bankTransactions: { select: { id: true } },
      },
    })

    const unlinkedPayments = recentPayments.filter(p => p.bankTransactions.length === 0)

    // Discrepancies: invoices marked paid but no matching payment
    const paidInvoices = await prisma.invoice.findMany({
      where: {
        status: 'PAID',
        ...(month ? {
          paidAt: {
            gte: new Date(`${month}-01`),
            lte: new Date(new Date(`${month}-01`).getFullYear(), new Date(`${month}-01`).getMonth() + 1, 0),
          },
        } : {
          paidAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1) },
        }),
      },
      select: {
        id: true,
        invoiceNumber: true,
        total: true,
        paidAmount: true,
        clientId: true,
        client: { select: { name: true } },
        payments: { select: { id: true, grossAmount: true } },
      },
    })

    const invoicesWithoutPayments = paidInvoices.filter(i => i.payments.length === 0)

    // Overall summary
    const allTxns = statements.flatMap(s => s.transactions)
    const totalMatched = allTxns.filter(t => ['AUTO_MATCHED', 'MANUAL_MATCHED'].includes(t.matchStatus)).length
    const totalUnmatched = allTxns.filter(t => t.matchStatus === 'UNMATCHED').length

    return NextResponse.json({
      statements: statementSummaries,
      summary: {
        totalStatements: statements.length,
        processedStatements: statements.filter(s => s.status === 'PROCESSED').length,
        totalTransactions: allTxns.length,
        totalMatched,
        totalUnmatched,
        overallMatchRate: allTxns.length > 0 ? Math.round((totalMatched / allTxns.length) * 100) : 0,
        unlinkedPaymentCount: unlinkedPayments.length,
        unlinkedPaymentAmount: Math.round(unlinkedPayments.reduce((s, p) => s + p.grossAmount, 0) * 100) / 100,
        invoicesWithoutPayments: invoicesWithoutPayments.length,
      },
      unlinkedPayments: unlinkedPayments.slice(0, 20).map(p => ({
        id: p.id,
        amount: p.grossAmount,
        reference: p.transactionRef,
        date: p.collectedAt?.toISOString(),
      })),
      invoiceDiscrepancies: invoicesWithoutPayments.slice(0, 20).map(i => ({
        invoiceNumber: i.invoiceNumber,
        amount: i.total,
        clientName: i.client?.name,
      })),
    })
  } catch (error) {
    console.error('Failed to generate reconciliation summary:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'] })
