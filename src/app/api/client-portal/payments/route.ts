import { NextRequest, NextResponse } from 'next/server'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'

// Extract YYYY-MM in Asia/Kolkata timezone to avoid UTC month boundary issues
function toMonthKey(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    timeZone: 'Asia/Kolkata',
  })
  return formatter.format(date).slice(0, 7) // "YYYY-MM"
}

// GET /api/client-portal/payments - Get payment history
export const GET = withClientAuth(async (req, { user }) => {
  // Get payment collections for this client
  const payments = await prisma.paymentCollection.findMany({
    where: { clientId: user.clientId },
    orderBy: { collectedAt: 'desc' },
    select: {
      id: true,
      grossAmount: true,
      netAmount: true,
      tdsDeducted: true,
      collectedAt: true,
      paymentMethod: true,
      transactionRef: true,
      retainerMonth: true,
      serviceType: true,
      status: true,
      description: true,
    },
  })

  // Get invoices with payment status
  const invoices = await prisma.invoice.findMany({
    where: { clientId: user.clientId },
    orderBy: { dueDate: 'desc' },
    select: {
      id: true,
      invoiceNumber: true,
      total: true,
      status: true,
      dueDate: true,
      paidAt: true,
      createdAt: true,
    },
  })

  // Calculate payment cycle summary
  const now = new Date()
  const currentYear = now.getFullYear()
  const yearStart = new Date(currentYear, 0, 1)

  const yearlyPayments = payments.filter(
    p => new Date(p.collectedAt) >= yearStart
  )

  const totalPaidThisYear = yearlyPayments.reduce(
    (sum, p) => sum + (p.netAmount || 0),
    0
  )

  // Group payments by month for payment cycle visualization
  const paymentsByMonth: Record<string, { month: string; amount: number; status: string }> = {}

  // Get last 12 months
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = toMonthKey(date)
    const monthLabel = formatDateDDMMYYYY(date)

    // Check if there's a payment for this month
    const monthPayments = payments.filter(p => {
      const paymentMonth = p.retainerMonth
        ? toMonthKey(new Date(p.retainerMonth))
        : toMonthKey(new Date(p.collectedAt))
      return paymentMonth === monthKey
    })

    const monthInvoice = invoices.find(inv => {
      const invMonth = toMonthKey(new Date(inv.dueDate))
      return invMonth === monthKey
    })

    paymentsByMonth[monthKey] = {
      month: monthLabel,
      amount: monthPayments.reduce((sum, p) => sum + (p.netAmount || 0), 0),
      status: monthPayments.length > 0 ? 'PAID' :
              monthInvoice?.status === 'OVERDUE' ? 'OVERDUE' :
              monthInvoice?.status === 'SENT' || monthInvoice?.status === 'PENDING' ? 'PENDING' :
              'NOT_DUE',
    }
  }

  // Contract payment schedule (for full term visualization)
  const client = user.client
  const contractMonths: { month: string; expectedAmount: number; status: string }[] = []

  if (client.startDate && client.monthlyFee) {
    const startDate = new Date(client.startDate)
    const endDate = client.endDate ? new Date(client.endDate) : new Date(now.getFullYear() + 1, now.getMonth(), 1)

    let currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    while (currentMonth <= endDate && contractMonths.length < 24) {
      const monthKey = toMonthKey(currentMonth)
      const monthLabel = formatDateDDMMYYYY(currentMonth)

      const monthPayment = payments.find(p => {
        const paymentMonth = p.retainerMonth
          ? toMonthKey(new Date(p.retainerMonth))
          : null
        return paymentMonth === monthKey
      })

      const isPast = currentMonth < now
      const isCurrent = currentMonth.getFullYear() === now.getFullYear() && currentMonth.getMonth() === now.getMonth()

      contractMonths.push({
        month: monthLabel,
        expectedAmount: client.monthlyFee,
        status: monthPayment ? 'PAID' : isCurrent ? 'CURRENT' : isPast ? 'OVERDUE' : 'UPCOMING',
      })

      currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    }
  }

  return NextResponse.json({
    payments: payments.map(p => ({
      id: p.id,
      grossAmount: p.grossAmount,
      netAmount: p.netAmount,
      tdsDeducted: p.tdsDeducted,
      collectedAt: p.collectedAt.toISOString(),
      paymentMethod: p.paymentMethod,
      transactionRef: p.transactionRef,
      retainerMonth: p.retainerMonth?.toISOString() || null,
      serviceType: p.serviceType,
      status: p.status,
      description: p.description,
    })),
    summary: {
      totalPaidThisYear,
      pendingAmount: client.pendingAmount || 0,
      monthlyFee: client.monthlyFee || 0,
      paymentsByMonth: Object.values(paymentsByMonth).reverse(),
    },
    contractCycle: contractMonths,
  })
}, { rateLimit: 'READ' })
