import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only accounts and admin roles can access finance stats
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS']
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'month'

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Use database-level aggregation instead of loading all records into memory
    const [
      invoiceStats,
      paidInvoiceStats,
      pendingInvoiceStats,
      overdueInvoiceStats,
      expenseStats,
      approvedExpenseStats,
      activeClients,
      monthlyRecurring,
    ] = await Promise.all([
      // Total invoiced
      prisma.invoice.aggregate({
        where: { createdAt: { gte: startDate } },
        _sum: { total: true },
        _count: true,
      }),
      // Paid invoices
      prisma.invoice.aggregate({
        where: { createdAt: { gte: startDate }, status: 'PAID' },
        _sum: { total: true },
        _count: true,
      }),
      // Pending invoices
      prisma.invoice.aggregate({
        where: { createdAt: { gte: startDate }, status: { in: ['SENT', 'DRAFT'] } },
        _sum: { total: true },
      }),
      // Overdue invoices
      prisma.invoice.aggregate({
        where: { createdAt: { gte: startDate }, status: 'OVERDUE' },
        _sum: { total: true },
      }),
      // Total expenses
      prisma.expense.aggregate({
        where: { createdAt: { gte: startDate } },
        _sum: { amount: true },
        _count: true,
      }),
      // Approved expenses
      prisma.expense.aggregate({
        where: { createdAt: { gte: startDate }, status: 'APPROVED' },
        _sum: { amount: true },
      }),
      // Active clients count
      prisma.client.count({
        where: { status: 'ACTIVE', deletedAt: null },
      }),
      // Monthly recurring
      prisma.client.aggregate({
        where: { status: 'ACTIVE', deletedAt: null },
        _sum: { monthlyFee: true },
      }),
    ])

    return NextResponse.json({
      revenue: {
        total: Math.round((invoiceStats._sum.total || 0) * 100) / 100,
        collected: Math.round((paidInvoiceStats._sum.total || 0) * 100) / 100,
        pending: Math.round((pendingInvoiceStats._sum.total || 0) * 100) / 100,
        overdue: Math.round((overdueInvoiceStats._sum.total || 0) * 100) / 100,
        invoiceCount: invoiceStats._count,
        paidCount: paidInvoiceStats._count,
      },
      expenses: {
        total: Math.round((expenseStats._sum.amount || 0) * 100) / 100,
        approved: Math.round((approvedExpenseStats._sum.amount || 0) * 100) / 100,
        count: expenseStats._count,
      },
      clients: {
        active: activeClients,
        monthlyRecurring: monthlyRecurring._sum.monthlyFee || 0,
      },
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    })
  } catch (error) {
    console.error('Failed to get finance stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
