import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { sendWhatsAppMessage } from '@/server/notifications/wbiztool'

export const maxDuration = 300

const CRON_SECRET = process.env.CRON_SECRET

/**
 * Monthly Notification Cron Job
 * Triggers: 1st of every month at 10:00 AM IST
 *
 * Sends:
 * 1. Monthly performance report to all employees
 * 2. Revenue summary to super admins
 * 3. Client retention report to managers
 * 4. Invoice reminders to clients with pending payments
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!CRON_SECRET) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json({ error: 'Cron not configured' }, { status: 503 })
    }
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Atomically check and acquire lock (prevents TOCTOU race condition)
    const today_date = new Date().toISOString().split('T')[0]
    const lockId = `monthly-notifications-${today_date}`
    try {
      await prisma.distributedLock.create({
        data: { id: lockId, lockName: lockId, expiresAt: new Date(Date.now() + 86400000) }
      })
    } catch {
      return NextResponse.json({ message: 'Already ran today', skipped: true })
    }

    const results = {
      performanceReports: 0,
      revenueSummaries: 0,
      retentionReports: 0,
      invoiceReminders: 0,
      clientReports: 0,
      errors: [] as string[],
    }

    const today = new Date()
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
    const monthName = lastMonth.toLocaleString('en-IN', { month: 'long', year: 'numeric' })

    // 1. Monthly performance report to employees
    const employees = await prisma.user.findMany({
      where: { status: 'ACTIVE', deletedAt: null, role: { in: ['EMPLOYEE', 'MANAGER', 'INTERN'] } },
      select: { id: true, firstName: true, lastName: true, phone: true },
    })

    for (const employee of employees) {
      const tasks = await prisma.dailyTask.findMany({
        where: {
          plan: {
            userId: employee.id,
            date: { gte: lastMonth, lte: lastMonthEnd },
          },
        },
        select: { status: true, plannedHours: true, actualHours: true },
      })

      if (tasks.length === 0) continue

      const completed = tasks.filter(t => t.status === 'COMPLETED').length
      const breakdowns = tasks.filter(t => t.status === 'BREAKDOWN').length
      const completionRate = Math.round((completed / tasks.length) * 100)
      const totalPlanned = tasks.reduce((sum, t) => sum + t.plannedHours, 0)
      const totalActual = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)

      const message = `Monthly Performance Report - ${monthName}\n\nHi ${employee.firstName}!\n\nHere's your monthly summary:\n- Tasks Completed: ${completed}/${tasks.length} (${completionRate}%)\n- Breakdowns: ${breakdowns}\n- Hours Logged: ${totalActual.toFixed(1)}h\n- Planned Hours: ${totalPlanned}h\n\nKeep up the great work this month!`

      if (employee.phone) {
        try {
          await sendWhatsAppMessage({ phone: employee.phone, message })
          results.performanceReports++
        } catch (error) {
          results.errors.push(`Performance report failed for ${employee.firstName}: ${error}`)
        }
      }
    }

    // 2. Revenue summary to super admins
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN', status: 'ACTIVE', deletedAt: null },
      select: { firstName: true, phone: true },
    })

    const totalClients = await prisma.client.count({ where: { status: 'ACTIVE', deletedAt: null } })
    const newClientsThisMonth = await prisma.client.count({
      where: {
        createdAt: { gte: lastMonth, lte: lastMonthEnd },
        deletedAt: null,
      },
    })

    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: { gte: lastMonth, lte: lastMonthEnd },
      },
      select: { total: true, status: true },
    })

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
    const paidRevenue = invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + (inv.total || 0), 0)

    const expenses = await prisma.expense.aggregate({
      where: {
        date: { gte: lastMonth, lte: lastMonthEnd },
        status: 'APPROVED',
      },
      _sum: { amount: true },
    })

    const totalExpenses = expenses._sum.amount || 0
    const profit = totalRevenue - totalExpenses

    for (const admin of superAdmins) {
      const message = `Monthly Revenue Summary - ${monthName}\n\n*Revenue*\n- Total Invoiced: ₹${totalRevenue.toLocaleString('en-IN')}\n- Collected: ₹${paidRevenue.toLocaleString('en-IN')}\n- Pending: ₹${(totalRevenue - paidRevenue).toLocaleString('en-IN')}\n\n*Expenses*\n- Total: ₹${totalExpenses.toLocaleString('en-IN')}\n\n*Net*\n- Profit: ₹${profit.toLocaleString('en-IN')}\n\n*Clients*\n- Active: ${totalClients}\n- New This Month: ${newClientsThisMonth}`

      if (admin.phone) {
        try {
          await sendWhatsAppMessage({ phone: admin.phone, message })
          results.revenueSummaries++
        } catch (error) {
          results.errors.push(`Revenue summary failed for ${admin.firstName}: ${error}`)
        }
      }
    }

    // 3. Client retention report to managers
    const managers = await prisma.user.findMany({
      where: { role: 'MANAGER', status: 'ACTIVE', deletedAt: null },
      select: { firstName: true, phone: true },
    })

    const lostClients = await prisma.client.count({
      where: {
        status: 'LOST',
        updatedAt: { gte: lastMonth, lte: lastMonthEnd },
        deletedAt: null,
      },
    })

    const atRiskClients = await prisma.client.count({
      where: { healthStatus: 'AT_RISK', status: 'ACTIVE', deletedAt: null },
    })

    const retentionRate = totalClients > 0
      ? Math.round(((totalClients - lostClients) / totalClients) * 100)
      : 100

    for (const manager of managers) {
      const message = `Monthly Client Report - ${monthName}\n\n*Retention*\n- Rate: ${retentionRate}%\n- Lost Clients: ${lostClients}\n- At Risk: ${atRiskClients}\n\n*Growth*\n- New Clients: ${newClientsThisMonth}\n- Total Active: ${totalClients}\n\nFocus on the at-risk clients this month!`

      if (manager.phone) {
        try {
          await sendWhatsAppMessage({ phone: manager.phone, message })
          results.retentionReports++
        } catch (error) {
          results.errors.push(`Retention report failed for ${manager.firstName}: ${error}`)
        }
      }
    }

    // 4. Invoice reminders to clients with pending payments
    // Only remind about invoices overdue within last 90 days to avoid spamming for very old invoices
    const pendingInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: ['SENT', 'OVERDUE'] },
        dueDate: { lte: today, gte: new Date(Date.now() - 90 * 86400000) },
      },
      include: {
        client: {
          select: { name: true, contactName: true, contactPhone: true },
        },
      },
    })

    for (const invoice of pendingInvoices) {
      if (invoice.client?.contactPhone) {
        const daysPastDue = Math.floor((today.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))

        const message = `Payment Reminder\n\nDear ${invoice.client.contactName || invoice.client.name},\n\nThis is a friendly reminder that your invoice #${invoice.invoiceNumber} for ₹${(invoice.total || 0).toLocaleString('en-IN')} ${daysPastDue > 0 ? `is ${daysPastDue} days overdue` : 'is due today'}.\n\nPlease process the payment at your earliest convenience to avoid any service interruption.\n\nThank you!\nBranding Pioneers`

        try {
          await sendWhatsAppMessage({ phone: invoice.client.contactPhone, message })
          results.invoiceReminders++
        } catch (error) {
          results.errors.push(`Invoice reminder failed for ${invoice.client.name}: ${error}`)
        }
      }
    }

    // 5. Monthly report notification to clients
    const activeClients = await prisma.client.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: { name: true, contactName: true, contactPhone: true },
    })

    for (const client of activeClients) {
      if (client.contactPhone) {
        const message = `Monthly Report Ready!\n\nHi ${client.contactName || client.name},\n\nYour monthly marketing performance report for ${monthName} is now available.\n\nPlease login to your client portal to view the detailed insights, or we'll be sharing it with you shortly.\n\nBest regards,\nTeam Branding Pioneers`

        try {
          await sendWhatsAppMessage({ phone: client.contactPhone, message })
          results.clientReports++
        } catch (error) {
          results.errors.push(`Client report notification failed for ${client.name}: ${error}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Monthly cron job failed:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return POST(req)
}
