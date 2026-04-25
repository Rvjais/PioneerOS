import prisma from '@/server/db/prisma'
import { requirePageAuth, LEADERSHIP_ACCESS } from '@/server/auth/pageAuth'

async function getAnalyticsData(userId: string, role: string) {
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thisYear = new Date(now.getFullYear(), 0, 1)

  const fullAccessRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'OPERATIONS_HEAD']
  const clientWhere = fullAccessRoles.includes(role)
    ? {}
    : { teamMembers: { some: { userId } } }

  // Use database aggregations instead of loading entire tables into memory
  const [
    // Revenue aggregations (instead of loading all invoices)
    revenueThisMonthAgg,
    revenueLastMonthAgg,
    revenueThisYearAgg,
    // Expense aggregations (instead of loading all expenses)
    expensesThisMonthAgg,
    expensesThisYearAgg,
    // Task counts (instead of loading all tasks)
    tasksThisMonthTotal,
    tasksThisMonthCompleted,
    // Client counts (instead of loading all clients)
    activeClients,
    newClientsThisMonth,
    churnedClients,
    // Lead counts (instead of loading all leads)
    leadsThisMonth,
    leadsWon,
    leadsLost,
    pipelineValueAgg,
    // Employee count
    employeeCount,
    // Attendance count
    attendanceCount,
    // Client tier counts
    clientTierCounts,
    // MRR aggregation
    mrrAgg,
    // Client health status counts (for JSX display)
    clientHealthCounts,
    // Department employee counts
    deptEmployeeCounts,
    // Department task counts
    deptTaskCounts,
    // Department completed task counts
    deptTaskCompletedCounts,
  ] = await Promise.all([
    // Revenue: sum of paid invoices this month
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: { status: 'PAID', createdAt: { gte: thisMonth } },
    }),
    // Revenue: sum of paid invoices last month
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: { status: 'PAID', createdAt: { gte: lastMonth, lt: thisMonth } },
    }),
    // Revenue: sum of paid invoices this year
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: { status: 'PAID', createdAt: { gte: thisYear } },
    }),
    // Expenses this month
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: thisMonth } },
    }),
    // Expenses this year
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: thisYear } },
    }),
    // Tasks this month (total)
    prisma.task.count({ where: { createdAt: { gte: thisMonth } } }),
    // Tasks this month (completed)
    prisma.task.count({ where: { createdAt: { gte: thisMonth }, status: 'COMPLETED' } }),
    // Active clients
    prisma.client.count({ where: { ...clientWhere, status: 'ACTIVE' } }),
    // New clients this month
    prisma.client.count({ where: { ...clientWhere, createdAt: { gte: thisMonth } } }),
    // Churned clients
    prisma.client.count({
      where: { ...clientWhere, OR: [{ status: 'LOST' }, { lifecycleStage: 'CHURNED' }] },
    }),
    // Leads this month
    prisma.lead.count({ where: { deletedAt: null, createdAt: { gte: thisMonth } } }),
    // Leads won this month
    prisma.lead.count({ where: { deletedAt: null, stage: 'WON', wonAt: { gte: thisMonth } } }),
    // Leads lost
    prisma.lead.count({ where: { deletedAt: null, stage: 'LOST' } }),
    // Pipeline value
    prisma.lead.aggregate({
      _sum: { value: true },
      where: { deletedAt: null, stage: { notIn: ['WON', 'LOST'] } },
    }),
    // Employee count
    prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
    // Attendance this month
    prisma.attendance.count({ where: { date: { gte: thisMonth } } }),
    // Client tier distribution
    prisma.client.groupBy({
      by: ['tier'],
      _count: true,
      where: clientWhere,
    }),
    // MRR
    prisma.client.aggregate({
      _sum: { monthlyFee: true },
      where: { ...clientWhere, status: 'ACTIVE', monthlyFee: { not: null } },
    }),
    // Client health status
    prisma.client.groupBy({
      by: ['healthStatus'],
      _count: true,
      where: clientWhere,
    }),
    // Department employee counts
    prisma.user.groupBy({
      by: ['department'],
      _count: true,
      where: { status: 'ACTIVE', deletedAt: null },
    }),
    // Department task counts (all)
    prisma.task.groupBy({
      by: ['department'],
      _count: true,
    }),
    // Department task counts (completed)
    prisma.task.groupBy({
      by: ['department'],
      _count: true,
      where: { status: 'COMPLETED' },
    }),
  ])

  // Extract aggregated values
  const revenueThisMonth = revenueThisMonthAgg._sum.total || 0
  const revenueLastMonth = revenueLastMonthAgg._sum.total || 0
  const revenueThisYear = revenueThisYearAgg._sum.total || 0
  const expensesThisMonth = expensesThisMonthAgg._sum.amount || 0
  const expensesThisYear = expensesThisYearAgg._sum.amount || 0
  const pipelineValue = pipelineValueAgg._sum.value || 0
  const mrr = mrrAgg._sum.monthlyFee || 0

  const tasksCompleted = tasksThisMonthCompleted
  const tasksTotal = tasksThisMonthTotal

  // Build department stats from groupBy results
  const deptEmpMap = new Map(deptEmployeeCounts.map(d => [d.department, d._count]))
  const deptTaskMap = new Map(deptTaskCounts.map(d => [d.department, d._count]))
  const deptCompletedMap = new Map(deptTaskCompletedCounts.map(d => [d.department, d._count]))

  const departmentStats = ['WEB', 'SEO', 'ADS', 'SOCIAL', 'OPERATIONS', 'HR', 'ACCOUNTS', 'SALES']
    .map(dept => {
      const empCount = deptEmpMap.get(dept) || 0
      const total = deptTaskMap.get(dept) || 0
      const completed = deptCompletedMap.get(dept) || 0
      return {
        department: dept,
        employeeCount: empCount,
        tasksTotal: total,
        tasksCompleted: completed,
        completionRate: total ? Math.round((completed / total) * 100) : 0,
      }
    })
    .filter(d => d.employeeCount > 0)

  // Build tier counts from groupBy
  const tierMap = new Map(clientTierCounts.map(t => [t.tier, t._count]))
  const clientsByTier = {
    ENTERPRISE: tierMap.get('ENTERPRISE') || 0,
    GROWTH: tierMap.get('GROWTH') || 0,
    STARTER: tierMap.get('STARTER') || 0,
  }

  // Build health counts from groupBy
  const healthMap = new Map(clientHealthCounts.map(h => [h.healthStatus, h._count]))
  const clientHealthStats = {
    HEALTHY: healthMap.get('HEALTHY') || 0,
    WARNING: healthMap.get('WARNING') || 0,
    AT_RISK: healthMap.get('AT_RISK') || 0,
  }

  // Attendance rate
  const attendanceRate = employeeCount > 0
    ? Math.round((attendanceCount / (employeeCount * now.getDate())) * 100)
    : 0

  return {
    clientHealthStats,
    metrics: {
      revenueThisMonth,
      revenueLastMonth,
      revenueThisYear,
      expensesThisMonth,
      expensesThisYear,
      profitThisMonth: revenueThisMonth - expensesThisMonth,
      profitThisYear: revenueThisYear - expensesThisYear,
      tasksCompleted,
      tasksTotal,
      taskCompletionRate: tasksTotal ? Math.round((tasksCompleted / tasksTotal) * 100) : 0,
      activeClients,
      newClientsThisMonth,
      churnedClients,
      churnRate: activeClients ? Math.round((churnedClients / activeClients) * 100) : 0,
      leadsThisMonth,
      leadsWon,
      leadsLost,
      leadConversionRate: leadsThisMonth ? Math.round((leadsWon / leadsThisMonth) * 100) : 0,
      pipelineValue,
      mrr,
      arr: mrr * 12,
      departmentStats,
      clientsByTier,
      attendanceRate,
      employeeCount,
    }
  }
}

export default async function AnalyticsPage() {
  // Role-based access: Leadership (SUPER_ADMIN, MANAGER, OPERATIONS_HEAD) can access analytics
  const session = await requirePageAuth(LEADERSHIP_ACCESS)

  // Also allow OPERATIONS department users
  const effectiveRole = (session.user.isImpersonating
    ? session.user.originalRole
    : session.user.role) as string || ''
  const userDepartment = (session.user.department as string) || ''

  const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(effectiveRole) || userDepartment === 'OPERATIONS'

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Access Restricted</h1>
          <p className="text-slate-300">Agency Analytics is only accessible to leadership users.</p>
        </div>
      </div>
    )
  }

  const { metrics, clientHealthStats } = await getAnalyticsData(
    (session.user as any).id,
    effectiveRole || 'EMPLOYEE'
  )

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(2)}Cr`
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
    return `${amount}`
  }

  const revenueGrowth = metrics.revenueLastMonth > 0
    ? Math.round(((metrics.revenueThisMonth - metrics.revenueLastMonth) / metrics.revenueLastMonth) * 100)
    : 0

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agency Analytics</h1>
          <p className="text-slate-400 mt-1">Comprehensive performance metrics and insights</p>
        </div>
        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm font-medium rounded-full">
          {effectiveRole === 'SUPER_ADMIN' ? 'Super Admin' :
           effectiveRole === 'OPERATIONS_HEAD' ? 'Operations Manager' :
           effectiveRole === 'MANAGER' ? 'Manager' : 'Leadership'} View
        </span>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
          <p className="text-blue-100 text-sm">Revenue (This Month)</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(metrics.revenueThisMonth)}</p>
          <p className={`text-xs mt-2 ${revenueGrowth >= 0 ? 'text-blue-200' : 'text-red-200'}`}>
            {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}% from last month
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white">
          <p className="text-green-100 text-sm">Net Profit (This Month)</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(metrics.profitThisMonth)}</p>
          <p className="text-green-200 text-xs mt-2">
            Expenses: {formatCurrency(metrics.expensesThisMonth)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
          <p className="text-purple-100 text-sm">MRR</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(metrics.mrr)}</p>
          <p className="text-purple-200 text-xs mt-2">ARR: {formatCurrency(metrics.arr)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
          <p className="text-orange-100 text-sm">Pipeline Value</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(metrics.pipelineValue)}</p>
          <p className="text-orange-200 text-xs mt-2">{metrics.leadsThisMonth} leads this month</p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        <div className="glass-card rounded-xl border border-white/10 p-4 text-center">
          <p className="text-2xl font-bold text-white">{metrics.activeClients}</p>
          <p className="text-xs text-slate-400">Active Clients</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4 text-center">
          <p className="text-2xl font-bold text-green-400">+{metrics.newClientsThisMonth}</p>
          <p className="text-xs text-slate-400">New Clients</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{metrics.churnRate}%</p>
          <p className="text-xs text-slate-400">Churn Rate</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{metrics.leadConversionRate}%</p>
          <p className="text-xs text-slate-400">Lead Conv.</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4 text-center">
          <p className="text-2xl font-bold text-white">{metrics.tasksCompleted}</p>
          <p className="text-xs text-slate-400">Tasks Done</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{metrics.taskCompletionRate}%</p>
          <p className="text-xs text-slate-400">Completion</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4 text-center">
          <p className="text-2xl font-bold text-white">{metrics.employeeCount}</p>
          <p className="text-xs text-slate-400">Team Size</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{metrics.attendanceRate}%</p>
          <p className="text-xs text-slate-400">Attendance</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <div className="glass-card rounded-2xl border border-white/10 p-5">
          <h3 className="font-semibold text-white mb-4">Department Performance</h3>
          <div className="space-y-4">
            {metrics.departmentStats.map((dept) => (
              <div key={dept.department} className="flex items-center gap-4">
                <span className="w-20 text-sm font-medium text-slate-300">{dept.department}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-400">{dept.employeeCount} members</span>
                    <span className="text-xs text-slate-400">{dept.tasksCompleted}/{dept.tasksTotal} tasks</span>
                  </div>
                  <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        dept.completionRate >= 80 ? 'bg-green-500' :
                        dept.completionRate >= 60 ? 'bg-blue-500' :
                        dept.completionRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${dept.completionRate}%` }}
                    />
                  </div>
                </div>
                <span className={`text-sm font-bold w-12 text-right ${
                  dept.completionRate >= 80 ? 'text-green-400' :
                  dept.completionRate >= 60 ? 'text-blue-400' :
                  dept.completionRate >= 40 ? 'text-yellow-600' : 'text-red-400'
                }`}>{dept.completionRate}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Client Tier Distribution */}
        <div className="glass-card rounded-2xl border border-white/10 p-5">
          <h3 className="font-semibold text-white mb-4">Client Distribution by Tier</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-500/10 rounded-xl">
              <p className="text-3xl font-bold text-purple-400">{metrics.clientsByTier.ENTERPRISE}</p>
              <p className="text-sm text-purple-400 font-medium">Enterprise</p>
              <p className="text-xs text-slate-400 mt-1">Premium</p>
            </div>
            <div className="text-center p-4 bg-blue-500/10 rounded-xl">
              <p className="text-3xl font-bold text-blue-400">{metrics.clientsByTier.GROWTH}</p>
              <p className="text-sm text-blue-400 font-medium">Growth</p>
              <p className="text-xs text-slate-400 mt-1">Scale-ups</p>
            </div>
            <div className="text-center p-4 bg-slate-900/40 rounded-xl">
              <p className="text-3xl font-bold text-slate-300">{metrics.clientsByTier.STARTER}</p>
              <p className="text-sm text-slate-200 font-medium">Starter</p>
              <p className="text-xs text-slate-400 mt-1">SMBs</p>
            </div>
          </div>

          {/* Client Health */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Client Health Status</h4>
            <div className="space-y-2">
              {[
                { label: 'Healthy', count: clientHealthStats.HEALTHY, color: 'bg-green-500', textColor: 'text-green-400' },
                { label: 'Warning', count: clientHealthStats.WARNING, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
                { label: 'At Risk', count: clientHealthStats.AT_RISK, color: 'bg-red-500', textColor: 'text-red-400' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-slate-300 flex-1">{item.label}</span>
                  <span className={`text-sm font-bold ${item.textColor}`}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sales Pipeline */}
        <div className="glass-card rounded-2xl border border-white/10 p-5">
          <h3 className="font-semibold text-white mb-4">Sales Funnel</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg">
              <span className="text-sm text-slate-300">New Leads</span>
              <span className="font-bold text-white">{metrics.leadsThisMonth}</span>
            </div>
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
              <span className="text-sm text-green-400">Won</span>
              <span className="font-bold text-green-400">{metrics.leadsWon}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
              <span className="text-sm text-red-400">Lost</span>
              <span className="font-bold text-red-400">{metrics.leadsLost}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Conversion Rate</span>
              <span className={`text-lg font-bold ${metrics.leadConversionRate >= 20 ? 'text-green-400' : 'text-amber-400'}`}>
                {metrics.leadConversionRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Financial Summary YTD */}
        <div className="glass-card rounded-2xl border border-white/10 p-5">
          <h3 className="font-semibold text-white mb-4">Year-to-Date Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Total Revenue</span>
              <span className="text-xl font-bold text-white">{formatCurrency(metrics.revenueThisYear)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Total Expenses</span>
              <span className="text-xl font-bold text-red-400">{formatCurrency(metrics.expensesThisYear)}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="font-medium text-slate-200">Net Profit</span>
              <span className={`text-xl font-bold ${metrics.profitThisYear >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(metrics.profitThisYear)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Profit Margin</span>
              <span className={`font-medium ${metrics.revenueThisYear > 0 && (metrics.profitThisYear / metrics.revenueThisYear) >= 0.2 ? 'text-green-400' : 'text-amber-400'}`}>
                {metrics.revenueThisYear > 0 ? Math.round((metrics.profitThisYear / metrics.revenueThisYear) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
