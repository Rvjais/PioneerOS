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
    const months = parseInt(searchParams.get('months') || '3')
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    startDate.setDate(1)

    const issues: Array<{
      type: string
      severity: 'HIGH' | 'MEDIUM' | 'LOW'
      title: string
      description: string
      amount?: number
      clientName?: string
      clientId?: string
      invoiceNumber?: string
      date?: string
    }> = []

    // 1. Duplicate invoices (same client + same month + similar amount)
    const invoices = await prisma.invoice.findMany({
      where: { createdAt: { gte: startDate }, status: { not: 'CANCELLED' } },
      include: { client: { select: { id: true, name: true } } },
      orderBy: [{ clientId: 'asc' }, { createdAt: 'asc' }],
    })

    const invoiceGroups = new Map<string, typeof invoices>()
    for (const inv of invoices) {
      const month = inv.createdAt.toISOString().slice(0, 7)
      const key = `${inv.clientId}-${month}`
      const group = invoiceGroups.get(key) || []
      group.push(inv)
      invoiceGroups.set(key, group)
    }

    for (const [, group] of invoiceGroups) {
      if (group.length > 1) {
        // Check if amounts are similar (within 10%)
        for (let i = 0; i < group.length - 1; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const diff = Math.abs(group[i].total - group[j].total)
            const threshold = Math.max(group[i].total, group[j].total) * 0.1
            if (diff <= threshold) {
              issues.push({
                type: 'DUPLICATE_INVOICE',
                severity: 'HIGH',
                title: `Possible duplicate invoice for ${group[i].client?.name}`,
                description: `Invoice #${group[i].invoiceNumber} (${group[i].total}) and #${group[j].invoiceNumber} (${group[j].total}) in same month`,
                amount: group[i].total,
                clientName: group[i].client?.name || '',
                clientId: group[i].clientId,
                invoiceNumber: `${group[i].invoiceNumber}, ${group[j].invoiceNumber}`,
                date: group[i].createdAt.toISOString(),
              })
            }
          }
        }
      }
    }

    // 2. Payment-invoice amount mismatches
    const paymentsWithInvoice = await prisma.paymentCollection.findMany({
      where: {
        collectedAt: { gte: startDate },
        status: 'CONFIRMED',
        invoiceId: { not: null },
      },
      include: {
        invoice: { select: { invoiceNumber: true, total: true, tax: true } },
        client: { select: { id: true, name: true } },
      },
    })

    for (const p of paymentsWithInvoice) {
      if (!p.invoice) continue
      const invoiceNet = p.invoice.total - (p.invoice.tax || 0)
      const diff = Math.abs(p.grossAmount - p.invoice.total)
      // If gross doesn't match invoice total AND net doesn't match (after TDS)
      if (diff > 1 && Math.abs(p.netAmount - invoiceNet) > 1) {
        issues.push({
          type: 'PAYMENT_MISMATCH',
          severity: 'MEDIUM',
          title: `Payment mismatch for ${p.client?.name}`,
          description: `Payment ${p.grossAmount} doesn't match invoice #${p.invoice.invoiceNumber} total ${p.invoice.total}`,
          amount: diff,
          clientName: p.client?.name || '',
          clientId: p.clientId,
          invoiceNumber: p.invoice.invoiceNumber,
          date: p.collectedAt?.toISOString(),
        })
      }
    }

    // 3. Fee changes without recent contract update
    const clients = await prisma.client.findMany({
      where: { status: 'ACTIVE', monthlyFee: { gt: 0 }, deletedAt: null },
      select: {
        id: true,
        name: true,
        monthlyFee: true,
        updatedAt: true,
      },
    })

    // Check invoices for amounts that differ from current monthlyFee
    for (const client of clients) {
      const recentInvoices = invoices.filter(i => i.clientId === client.id)
      for (const inv of recentInvoices) {
        const expectedBase = client.monthlyFee || 0
        const invoiceBase = inv.total - (inv.tax || 0)
        if (expectedBase > 0 && Math.abs(invoiceBase - expectedBase) > expectedBase * 0.15) {
          issues.push({
            type: 'FEE_DISCREPANCY',
            severity: 'LOW',
            title: `Invoice amount differs from monthly fee for ${client.name}`,
            description: `Invoice #${inv.invoiceNumber} base ${invoiceBase} vs monthly fee ${expectedBase}`,
            amount: Math.abs(invoiceBase - expectedBase),
            clientName: client.name,
            clientId: client.id,
            invoiceNumber: inv.invoiceNumber,
            date: inv.createdAt.toISOString(),
          })
        }
      }
    }

    // 4. Payments without invoices
    const paymentsWithoutInvoice = await prisma.paymentCollection.findMany({
      where: {
        collectedAt: { gte: startDate },
        status: 'CONFIRMED',
        invoiceId: null,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    for (const p of paymentsWithoutInvoice) {
      issues.push({
        type: 'UNLINKED_PAYMENT',
        severity: 'MEDIUM',
        title: `Payment without invoice for ${p.client?.name}`,
        description: `Payment of ${p.grossAmount} (ref: ${p.transactionRef || 'none'}) has no linked invoice`,
        amount: p.grossAmount,
        clientName: p.client?.name || '',
        clientId: p.clientId,
        date: p.collectedAt?.toISOString(),
      })
    }

    // 5. Overdue invoices with no follow-up
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: 'OVERDUE',
        dueDate: { lt: new Date() },
      },
      include: {
        client: { select: { id: true, name: true, haltReminders: true } },
      },
    })

    for (const inv of overdueInvoices) {
      if (inv.client?.haltReminders) continue
      const daysPast = Math.floor((Date.now() - new Date(inv.dueDate!).getTime()) / (1000 * 60 * 60 * 24))
      if (daysPast > 30) {
        issues.push({
          type: 'STALE_OVERDUE',
          severity: 'HIGH',
          title: `Invoice overdue ${daysPast} days for ${inv.client?.name}`,
          description: `Invoice #${inv.invoiceNumber} (${inv.total}) has been overdue since ${inv.dueDate?.toISOString().slice(0, 10)}`,
          amount: inv.total,
          clientName: inv.client?.name || '',
          clientId: inv.clientId,
          invoiceNumber: inv.invoiceNumber,
          date: inv.dueDate?.toISOString(),
        })
      }
    }

    // Sort by severity
    const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
    issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    const summary = {
      total: issues.length,
      high: issues.filter(i => i.severity === 'HIGH').length,
      medium: issues.filter(i => i.severity === 'MEDIUM').length,
      low: issues.filter(i => i.severity === 'LOW').length,
      byType: {
        duplicateInvoices: issues.filter(i => i.type === 'DUPLICATE_INVOICE').length,
        paymentMismatches: issues.filter(i => i.type === 'PAYMENT_MISMATCH').length,
        feeDiscrepancies: issues.filter(i => i.type === 'FEE_DISCREPANCY').length,
        unlinkedPayments: issues.filter(i => i.type === 'UNLINKED_PAYMENT').length,
        staleOverdue: issues.filter(i => i.type === 'STALE_OVERDUE').length,
      },
      totalAmountAtRisk: Math.round(issues.reduce((s, i) => s + (i.amount || 0), 0) * 100) / 100,
    }

    return NextResponse.json({ issues, summary })
  } catch (error) {
    console.error('Failed to detect discrepancies:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
