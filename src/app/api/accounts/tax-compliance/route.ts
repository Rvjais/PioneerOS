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
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7) // YYYY-MM
    const [yearStr, monthStr] = month.split('-')
    const year = parseInt(yearStr)
    const monthNum = parseInt(monthStr)

    const startDate = new Date(year, monthNum - 1, 1)
    const endDate = new Date(year, monthNum, 0, 23, 59, 59)

    // Get all confirmed payments for the month
    const payments = await prisma.paymentCollection.findMany({
      where: {
        collectedAt: { gte: startDate, lte: endDate },
        status: 'CONFIRMED',
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            gstNumber: true,
            panNumber: true,
            entityType: true,
          },
        },
      },
      orderBy: { collectedAt: 'asc' },
    })

    // Get invoices for the month
    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        client: {
          select: { id: true, name: true, entityType: true },
        },
      },
    })

    // GST Summary
    const gstCollected = payments.reduce((s, p) => s + (p.gstAmount || 0), 0)
    const gstOnInvoices = invoices.reduce((s, i) => s + (i.tax || 0), 0)

    // TDS Summary
    const tdsDeducted = payments.reduce((s, p) => s + (p.tdsDeducted || 0), 0)
    const paymentsWithTds = payments.filter(p => (p.tdsDeducted || 0) > 0)

    // Entity-wise breakdown
    const entityBreakdown: Record<string, {
      entity: string
      grossRevenue: number
      gstCollected: number
      tdsDeducted: number
      netReceived: number
      invoiceCount: number
      paymentCount: number
    }> = {}

    for (const p of payments) {
      const entity = p.client?.entityType || 'UNKNOWN'
      if (!entityBreakdown[entity]) {
        entityBreakdown[entity] = {
          entity,
          grossRevenue: 0, gstCollected: 0, tdsDeducted: 0,
          netReceived: 0, invoiceCount: 0, paymentCount: 0,
        }
      }
      entityBreakdown[entity].grossRevenue += p.grossAmount
      entityBreakdown[entity].gstCollected += p.gstAmount || 0
      entityBreakdown[entity].tdsDeducted += p.tdsDeducted || 0
      entityBreakdown[entity].netReceived += p.netAmount
      entityBreakdown[entity].paymentCount++
    }

    for (const inv of invoices) {
      const entity = inv.client?.entityType || 'UNKNOWN'
      if (entityBreakdown[entity]) {
        entityBreakdown[entity].invoiceCount++
      }
    }

    // Client-wise TDS breakdown (for Form 16A tracking)
    const tdsBreakdown = paymentsWithTds.reduce((acc, p) => {
      const clientId = p.clientId
      if (!acc[clientId]) {
        acc[clientId] = {
          client: p.client,
          totalGross: 0,
          totalTds: 0,
          tdsPercentage: p.tdsPercentage || 10,
          payments: 0,
          form16AReceived: false, // Could be tracked in a separate field
        }
      }
      acc[clientId].totalGross += p.grossAmount
      acc[clientId].totalTds += p.tdsDeducted || 0
      acc[clientId].payments++
      return acc
    }, {} as Record<string, {
      client: typeof payments[0]['client']
      totalGross: number
      totalTds: number
      tdsPercentage: number
      payments: number
      form16AReceived: boolean
    }>)

    // Quarterly GST totals (for GSTR filing)
    const quarterStart = new Date(year, Math.floor((monthNum - 1) / 3) * 3, 1)
    const quarterEnd = new Date(year, Math.floor((monthNum - 1) / 3) * 3 + 3, 0, 23, 59, 59)

    const quarterPayments = await prisma.paymentCollection.findMany({
      where: {
        collectedAt: { gte: quarterStart, lte: quarterEnd },
        status: 'CONFIRMED',
      },
      select: { grossAmount: true, gstAmount: true, tdsDeducted: true, netAmount: true },
    })

    const quarterGst = quarterPayments.reduce((s, p) => s + (p.gstAmount || 0), 0)
    const quarterGross = quarterPayments.reduce((s, p) => s + p.grossAmount, 0)
    const quarterTds = quarterPayments.reduce((s, p) => s + (p.tdsDeducted || 0), 0)

    return NextResponse.json({
      month,
      gst: {
        collected: Math.round(gstCollected * 100) / 100,
        onInvoices: Math.round(gstOnInvoices * 100) / 100,
        quarterTotal: Math.round(quarterGst * 100) / 100,
        quarterGross: Math.round(quarterGross * 100) / 100,
      },
      tds: {
        totalDeducted: Math.round(tdsDeducted * 100) / 100,
        clientCount: paymentsWithTds.length,
        quarterTotal: Math.round(quarterTds * 100) / 100,
        breakdown: Object.values(tdsBreakdown).map(t => ({
          ...t,
          totalGross: Math.round(t.totalGross * 100) / 100,
          totalTds: Math.round(t.totalTds * 100) / 100,
        })),
      },
      entityBreakdown: Object.values(entityBreakdown).map(e => ({
        ...e,
        grossRevenue: Math.round(e.grossRevenue * 100) / 100,
        gstCollected: Math.round(e.gstCollected * 100) / 100,
        tdsDeducted: Math.round(e.tdsDeducted * 100) / 100,
        netReceived: Math.round(e.netReceived * 100) / 100,
      })),
      totals: {
        grossRevenue: Math.round(payments.reduce((s, p) => s + p.grossAmount, 0) * 100) / 100,
        gstCollected: Math.round(gstCollected * 100) / 100,
        tdsDeducted: Math.round(tdsDeducted * 100) / 100,
        netReceived: Math.round(payments.reduce((s, p) => s + p.netAmount, 0) * 100) / 100,
        invoiceCount: invoices.length,
        paymentCount: payments.length,
      },
    })
  } catch (error) {
    console.error('Failed to generate tax compliance report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
