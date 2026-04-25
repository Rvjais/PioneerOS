import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import ReportsClient from './ReportsClient'
import { requirePageAuth, LEADERSHIP_ACCESS } from '@/server/auth/pageAuth'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  await requirePageAuth(LEADERSHIP_ACCESS)

  const params = await searchParams
  const range = params.range || 'current_month'

  // Compute date filter boundaries
  const now = new Date()
  let dateFrom: Date
  if (range === 'last_30') {
    dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
  } else if (range === 'ytd') {
    dateFrom = new Date(now.getFullYear(), 0, 1)
  } else {
    // current_month
    dateFrom = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  // ---------- Fetch all data in parallel ----------
  const [
    totalClients,
    lostClients,
    totalTasks,
    completedTasks,
    paidInvoices,
    users,
    activeClients,
    atRiskClients,
    // For monthly revenue chart: all paid invoices in the last 12 months
    last12MonthsInvoices,
    // For department performance: tasks grouped by department
    allDeptTasks,
    // Department revenue: invoices with client tasks for department mapping
    deptInvoices,
  ] = await Promise.all([
    prisma.client.count({ where: { NOT: { status: 'LEAD' } } }),
    prisma.client.count({ where: { status: 'LOST' } }),
    prisma.task.count({ where: { createdAt: { gte: dateFrom } } }),
    prisma.task.count({ where: { status: 'COMPLETED', createdAt: { gte: dateFrom } } }),
    prisma.invoice.findMany({
      where: { status: 'PAID', paidAt: { gte: dateFrom } },
      select: { total: true, paidAt: true },
    }),
    prisma.user.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: {
        firstName: true,
        lastName: true,
        department: true,
        assignedTasks: {
          where: { status: 'COMPLETED', completedAt: { gte: dateFrom } },
          select: { id: true },
        },
      },
    }),
    prisma.client.count({ where: { healthStatus: 'HEALTHY' } }),
    prisma.client.count({ where: { healthStatus: 'AT_RISK' } }),
    // Last 12 months of paid invoices for the chart
    prisma.invoice.findMany({
      where: {
        status: 'PAID',
        paidAt: {
          gte: new Date(now.getFullYear() - 1, now.getMonth(), 1),
        },
      },
      select: { total: true, paidAt: true },
    }),
    // All tasks (for department breakdown)
    prisma.task.findMany({
      where: { createdAt: { gte: dateFrom } },
      select: { department: true, status: true },
    }),
    // Invoices linked to clients that have tasks, for department revenue approximation
    prisma.invoice.findMany({
      where: { status: 'PAID', paidAt: { gte: dateFrom } },
      select: {
        total: true,
        client: {
          select: {
            tasks: {
              select: { department: true },
              take: 1,
            },
          },
        },
      },
    }),
  ])

  // ---------- Compute metrics ----------
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const retentionRate = totalClients === 0 ? 100 : Math.round(((totalClients - lostClients) / totalClients) * 100)
  const taskCompletionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  // ---------- Monthly revenue chart (last 12 months) ----------
  const monthlyMap = new Map<string, number>()
  // Initialize all 12 months
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    monthlyMap.set(key, 0)
  }
  // Aggregate invoices
  for (const inv of last12MonthsInvoices) {
    if (inv.paidAt) {
      const d = inv.paidAt
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (monthlyMap.has(key)) {
        monthlyMap.set(key, (monthlyMap.get(key) || 0) + inv.total)
      }
    }
  }
  const monthlyRevenue = Array.from(monthlyMap.entries()).map(([key, total]) => {
    const [, monthStr] = key.split('-')
    return { month: MONTH_LABELS[parseInt(monthStr)], total }
  })

  // ---------- Department performance ----------
  const DEPARTMENTS = [
    { dept: 'WEB', name: 'Web Development' },
    { dept: 'SEO', name: 'SEO' },
    { dept: 'ADS', name: 'Paid Ads' },
    { dept: 'SOCIAL', name: 'Social Media' },
  ]

  // Count tasks by department
  const deptTaskCounts: Record<string, { total: number; completed: number }> = {}
  for (const t of allDeptTasks) {
    if (!deptTaskCounts[t.department]) {
      deptTaskCounts[t.department] = { total: 0, completed: 0 }
    }
    deptTaskCounts[t.department].total++
    if (t.status === 'COMPLETED') {
      deptTaskCounts[t.department].completed++
    }
  }

  // Revenue by department: attribute invoice revenue to the department of the client's first task
  const deptRevenueTotals: Record<string, number> = {}
  for (const inv of deptInvoices) {
    const dept = inv.client?.tasks?.[0]?.department
    if (dept) {
      deptRevenueTotals[dept] = (deptRevenueTotals[dept] || 0) + inv.total
    }
  }

  const deptPerformance = DEPARTMENTS.map(d => ({
    dept: d.dept,
    name: d.name,
    totalTasks: deptTaskCounts[d.dept]?.total || 0,
    completed: deptTaskCounts[d.dept]?.completed || 0,
    revenue: deptRevenueTotals[d.dept] || 0,
  }))

  // ---------- Top performers ----------
  const topPerformers = users
    .map(u => ({
      name: `${u.firstName} ${u.lastName || ''}`.trim(),
      dept: u.department,
      completedTasks: u.assignedTasks.length,
    }))
    .filter(u => u.completedTasks > 0)
    .sort((a, b) => b.completedTasks - a.completedTasks)
    .slice(0, 5)

  return (
    <ReportsClient
      totalRevenue={totalRevenue}
      retentionRate={retentionRate}
      taskCompletionRate={taskCompletionRate}
      completedTasks={completedTasks}
      totalTasks={totalTasks}
      totalClients={totalClients}
      lostClients={lostClients}
      activeClients={activeClients}
      atRiskClients={atRiskClients}
      monthlyRevenue={monthlyRevenue}
      deptPerformance={deptPerformance}
      topPerformers={topPerformers}
    />
  )
}
