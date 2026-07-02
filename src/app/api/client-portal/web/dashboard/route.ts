import { NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'

export const GET = withClientAuth(async (req, { user }) => {
  const clientId = user.clientId

  const [activeProjects, pendingInvoices, recentSupportTickets] = await Promise.all([
    prisma.webProject.count({ where: { clientId, status: { in: ['PIPELINE', 'IN_PROGRESS', 'REVISION'] } } }),
    prisma.invoice.count({ where: { clientId, status: { in: ['SENT', 'OVERDUE'] } } }),
    prisma.supportTicket.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, status: true, createdAt: true },
    }),
  ])

  const recentActivity = recentSupportTickets.map(t => ({
    id: t.id,
    type: 'support_ticket',
    description: `Support ticket: ${t.title}`,
    date: t.createdAt.toISOString(),
  }))

  // Try to get recent invoice activity
  const recentInvoices = await prisma.invoice.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { id: true, invoiceNumber: true, amount: true, status: true, createdAt: true },
  })

  for (const inv of recentInvoices) {
    recentActivity.push({
      id: inv.id,
      type: inv.status === 'PAID' ? 'payment_received' : 'invoice_created',
      description: inv.status === 'PAID'
        ? `Payment of Rs. ${inv.amount.toLocaleString()} received for invoice ${inv.invoiceNumber}`
        : `Invoice ${inv.invoiceNumber} created for Rs. ${inv.amount.toLocaleString()}`,
      date: inv.createdAt.toISOString(),
    })
  }

  recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return NextResponse.json({
    stats: {
      activeProjects,
      pendingInvoices,
      upcomingPayments: pendingInvoices, // approximate
    },
    recentActivity,
  })
})
