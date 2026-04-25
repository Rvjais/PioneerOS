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

    const now = new Date()

    // Get all active clients with monthly fees
    const clients = await prisma.client.findMany({
      where: { status: 'ACTIVE', monthlyFee: { gt: 0 }, deletedAt: null },
      select: {
        id: true,
        name: true,
        monthlyFee: true,
        billingType: true,
        serviceSegment: true,
        tier: true,
        lifecycleStage: true,
      },
    })

    // Get historical collection data (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)
    const payments = await prisma.paymentCollection.findMany({
      where: {
        collectedAt: { gte: sixMonthsAgo },
        status: 'CONFIRMED',
      },
      select: {
        clientId: true,
        grossAmount: true,
        collectedAt: true,
      },
    })

    // Calculate collection rate per client
    const clientCollectionRates = new Map<string, { paid: number; expected: number }>()
    for (const client of clients) {
      clientCollectionRates.set(client.id, { paid: 0, expected: (client.monthlyFee || 0) * 6 })
    }
    for (const p of payments) {
      const entry = clientCollectionRates.get(p.clientId)
      if (entry) entry.paid += p.grossAmount
    }

    // Monthly expected revenue from active clients
    const monthlyExpected = clients.reduce((s, c) => s + (c.monthlyFee || 0), 0)

    // Calculate overall collection rate
    const totalExpected6m = Array.from(clientCollectionRates.values()).reduce((s, e) => s + e.expected, 0)
    const totalCollected6m = Array.from(clientCollectionRates.values()).reduce((s, e) => s + e.paid, 0)
    const overallCollectionRate = totalExpected6m > 0 ? totalCollected6m / totalExpected6m : 0.85

    // Get at-risk clients (lifecycle stage AT_RISK or CHURNED recently)
    const atRiskClients = clients.filter(c => c.lifecycleStage === 'AT_RISK')
    const atRiskRevenue = atRiskClients.reduce((s, c) => s + (c.monthlyFee || 0), 0)

    // Build 6-month forecast
    const forecast: { month: string; date: string; expected: number; projected: number; optimistic: number; conservative: number; isCurrentMonth: boolean }[] = []
    for (let i = 0; i < 6; i++) {
      const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const monthLabel = forecastDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })

      // Base expected = all active client fees
      const baseExpected = monthlyExpected

      // Apply churn risk reduction (progressive for future months)
      const churnRiskFactor = 1 - (atRiskRevenue / monthlyExpected) * (i * 0.2) // Increasing risk over time

      // Apply historical collection rate
      const projectedCollection = baseExpected * overallCollectionRate * Math.max(churnRiskFactor, 0.7)

      // Optimistic (100% collection, no churn)
      const optimistic = baseExpected

      // Conservative (historical rate, full churn risk)
      const conservative = baseExpected * overallCollectionRate * Math.max(1 - (atRiskRevenue / monthlyExpected) * (i * 0.3), 0.5)

      forecast.push({
        month: monthLabel,
        date: forecastDate.toISOString(),
        expected: Math.round(baseExpected),
        projected: Math.round(projectedCollection),
        optimistic: Math.round(optimistic),
        conservative: Math.round(conservative),
        isCurrentMonth: i === 0,
      })
    }

    // Historical actuals (last 6 months)
    const historical: { month: string; date: string; expected: number; actual: number; collectionRate: number }[] = []
    for (let i = 6; i >= 1; i--) {
      const histDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const histEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthLabel = histDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })

      const monthPayments = payments.filter(p => {
        const d = new Date(p.collectedAt)
        return d >= histDate && d <= histEnd
      })

      const actual = monthPayments.reduce((s, p) => s + p.grossAmount, 0)

      historical.push({
        month: monthLabel,
        date: histDate.toISOString(),
        expected: Math.round(monthlyExpected),
        actual: Math.round(actual),
        collectionRate: monthlyExpected > 0 ? Math.round((actual / monthlyExpected) * 100) : 0,
      })
    }

    // Revenue by segment forecast
    const segmentBreakdown: Record<string, { expected: number; clientCount: number; atRisk: number }> = {}
    for (const client of clients) {
      const seg = client.serviceSegment || 'OTHER'
      if (!segmentBreakdown[seg]) segmentBreakdown[seg] = { expected: 0, clientCount: 0, atRisk: 0 }
      segmentBreakdown[seg].expected += client.monthlyFee || 0
      segmentBreakdown[seg].clientCount++
      if (client.lifecycleStage === 'AT_RISK') segmentBreakdown[seg].atRisk++
    }

    // Upcoming invoice amounts (next 30 days)
    const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const upcomingInvoices = await prisma.invoice.findMany({
      where: {
        dueDate: { gte: now, lte: thirtyDaysOut },
        status: { in: ['SENT', 'DRAFT'] },
      },
      select: {
        total: true,
        dueDate: true,
        client: { select: { name: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 20,
    })

    const expectedNext30 = upcomingInvoices.reduce((s, i) => s + i.total, 0)

    return NextResponse.json({
      forecast,
      historical,
      segmentBreakdown,
      summary: {
        monthlyExpected: Math.round(monthlyExpected),
        overallCollectionRate: Math.round(overallCollectionRate * 100),
        atRiskRevenue: Math.round(atRiskRevenue),
        atRiskClients: atRiskClients.length,
        activeClients: clients.length,
        next30DaysExpected: Math.round(expectedNext30),
        upcomingInvoiceCount: upcomingInvoices.length,
      },
      upcomingInvoices: upcomingInvoices.map(i => ({
        amount: i.total,
        dueDate: i.dueDate?.toISOString(),
        clientName: i.client?.name,
      })),
    })
  } catch (error) {
    console.error('Failed to generate forecast:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
