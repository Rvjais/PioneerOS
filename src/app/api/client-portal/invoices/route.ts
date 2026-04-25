import { NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'

// GET /api/client-portal/invoices - Get invoices for client
export const GET = withClientAuth(async (req, { user }) => {
  const clientId = user.clientId

  // Get query params
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  // Build filter
  const where: Record<string, unknown> = { clientId }

  if (status && status !== 'all') {
    where.status = status
  }

  // Fetch invoices
  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // Calculate summary
  const allInvoices = await prisma.invoice.findMany({
    where: { clientId },
    select: { status: true, total: true },
  })

  const summary = {
    total: allInvoices.length,
    totalAmount: allInvoices.reduce((sum, inv) => sum + inv.total, 0),
    paid: allInvoices.filter(inv => inv.status === 'PAID').length,
    paidAmount: allInvoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.total, 0),
    pending: allInvoices.filter(inv => ['SENT', 'DRAFT'].includes(inv.status)).length,
    pendingAmount: allInvoices.filter(inv => ['SENT', 'DRAFT'].includes(inv.status)).reduce((sum, inv) => sum + inv.total, 0),
    overdue: allInvoices.filter(inv => inv.status === 'OVERDUE').length,
    overdueAmount: allInvoices.filter(inv => inv.status === 'OVERDUE').reduce((sum, inv) => sum + inv.total, 0),
  }

  return NextResponse.json({
    invoices: invoices.map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      amount: inv.amount,
      tax: inv.tax,
      total: inv.total,
      status: inv.status,
      dueDate: inv.dueDate.toISOString(),
      paidAt: inv.paidAt?.toISOString() || null,
      items: inv.items ? JSON.parse(inv.items) : [],
      notes: inv.notes,
      entityType: inv.entityType,
      currency: inv.currency,
      serviceMonth: inv.serviceMonth?.toISOString() || null,
      createdAt: inv.createdAt.toISOString(),
    })),
    summary,
  })
}, { rateLimit: 'READ' })
