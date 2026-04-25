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

    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS']
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const entityType = searchParams.get('entityType') || ''
    const segment = searchParams.get('segment') || ''

    const now = new Date()

    // Get all unpaid invoices
    const whereClause: Record<string, unknown> = {
      status: { in: ['SENT', 'OVERDUE', 'PARTIAL'] },
    }
    if (entityType) whereClause.entityType = entityType
    if (segment) {
      whereClause.client = { serviceSegment: segment }
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            tier: true,
            monthlyFee: true,
            serviceSegment: true,
            entityType: true,
            contactEmail: true,
            paymentDueDay: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    })

    // Categorize by aging buckets
    const buckets = {
      current: [] as typeof invoices,      // Not yet due
      days0to30: [] as typeof invoices,     // 1-30 days overdue
      days31to60: [] as typeof invoices,    // 31-60 days overdue
      days61to90: [] as typeof invoices,    // 61-90 days overdue
      days90plus: [] as typeof invoices,    // 90+ days overdue
    }

    for (const inv of invoices) {
      if (!inv.dueDate) {
        buckets.current.push(inv)
        continue
      }
      const daysOverdue = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24))
      if (daysOverdue <= 0) buckets.current.push(inv)
      else if (daysOverdue <= 30) buckets.days0to30.push(inv)
      else if (daysOverdue <= 60) buckets.days31to60.push(inv)
      else if (daysOverdue <= 90) buckets.days61to90.push(inv)
      else buckets.days90plus.push(inv)
    }

    const sumBucket = (items: typeof invoices) => {
      const outstanding = items.reduce((s, i) => s + i.total - (i.paidAmount || 0), 0)
      return {
        count: items.length,
        outstanding: Math.round(outstanding * 100) / 100,
      }
    }

    // Per-client aging breakdown
    const clientMap = new Map<string, {
      client: (typeof invoices)[0]['client']
      current: number
      days0to30: number
      days31to60: number
      days61to90: number
      days90plus: number
      total: number
      invoiceCount: number
    }>()

    for (const inv of invoices) {
      if (!inv.client) continue
      const key = inv.client.id
      const outstanding = inv.total - (inv.paidAmount || 0)
      if (!clientMap.has(key)) {
        clientMap.set(key, {
          client: inv.client,
          current: 0, days0to30: 0, days31to60: 0, days61to90: 0, days90plus: 0,
          total: 0, invoiceCount: 0,
        })
      }
      const entry = clientMap.get(key)!
      entry.invoiceCount++
      entry.total += outstanding

      if (!inv.dueDate) {
        entry.current += outstanding
      } else {
        const daysOverdue = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24))
        if (daysOverdue <= 0) entry.current += outstanding
        else if (daysOverdue <= 30) entry.days0to30 += outstanding
        else if (daysOverdue <= 60) entry.days31to60 += outstanding
        else if (daysOverdue <= 90) entry.days61to90 += outstanding
        else entry.days90plus += outstanding
      }
    }

    const clientBreakdown = Array.from(clientMap.values())
      .sort((a, b) => b.total - a.total)
      .map(entry => ({
        ...entry,
        current: Math.round(entry.current * 100) / 100,
        days0to30: Math.round(entry.days0to30 * 100) / 100,
        days31to60: Math.round(entry.days31to60 * 100) / 100,
        days61to90: Math.round(entry.days61to90 * 100) / 100,
        days90plus: Math.round(entry.days90plus * 100) / 100,
        total: Math.round(entry.total * 100) / 100,
      }))

    const totalOutstanding = invoices.reduce((s, i) => s + i.total - (i.paidAmount || 0), 0)

    return NextResponse.json({
      summary: {
        current: sumBucket(buckets.current),
        days0to30: sumBucket(buckets.days0to30),
        days31to60: sumBucket(buckets.days31to60),
        days61to90: sumBucket(buckets.days61to90),
        days90plus: sumBucket(buckets.days90plus),
        totalOutstanding: Math.round(totalOutstanding * 100) / 100,
        totalInvoices: invoices.length,
      },
      clientBreakdown,
      generatedAt: now.toISOString(),
    })
  } catch (error) {
    console.error('Failed to generate aging report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
