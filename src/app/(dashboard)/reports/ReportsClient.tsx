'use client'

import { useState, useCallback } from 'react'
import { Card, CardHeader, CardContent } from '@/client/components/ui'
import { generateSummaryPDF } from '@/client/utils/export/pdfExport'
import PageGuide from '@/client/components/ui/PageGuide'
import InfoTip from '@/client/components/ui/InfoTip'

interface MonthlyRevenue {
  month: string  // e.g. 'Jan', 'Feb'
  total: number
}

interface DeptPerformance {
  dept: string
  name: string
  totalTasks: number
  completed: number
  revenue: number
}

interface TopPerformer {
  name: string
  dept: string
  completedTasks: number
}

interface ReportsClientProps {
  totalRevenue: number
  retentionRate: number
  taskCompletionRate: number
  completedTasks: number
  totalTasks: number
  totalClients: number
  lostClients: number
  activeClients: number
  atRiskClients: number
  monthlyRevenue: MonthlyRevenue[]
  deptPerformance: DeptPerformance[]
  topPerformers: TopPerformer[]
}

type DateRange = 'current_month' | 'last_30' | 'ytd'

export default function ReportsClient(props: ReportsClientProps) {
  const {
    totalRevenue,
    retentionRate,
    taskCompletionRate,
    completedTasks,
    totalTasks,
    totalClients,
    lostClients,
    activeClients,
    atRiskClients,
    monthlyRevenue,
    deptPerformance,
    topPerformers,
  } = props

  const [dateRange, setDateRange] = useState<DateRange>('current_month')

  const handleDateRangeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as DateRange
    setDateRange(value)
    // Navigate with query param to re-fetch data server-side
    const params = new URLSearchParams(window.location.search)
    params.set('range', value)
    window.location.href = `${window.location.pathname}?${params.toString()}`
  }, [])

  const handleExportPDF = useCallback(() => {
    // Build summary + table PDF from current data
    generateSummaryPDF(
      'Business Reports - Pioneer OS',
      [
        {
          title: 'Key Metrics',
          items: [
            { label: 'Total Revenue', value: totalRevenue > 0 ? `INR ${totalRevenue.toLocaleString('en-IN')}` : 'No revenue data' },
            { label: 'Client Retention', value: `${retentionRate}%` },
            { label: 'Task Completion', value: `${taskCompletionRate}% (${completedTasks}/${totalTasks})` },
            { label: 'Active Clients', value: totalClients - lostClients },
          ],
        },
        {
          title: 'Client Health',
          items: [
            { label: 'Healthy', value: activeClients },
            { label: 'At Risk', value: atRiskClients },
            { label: 'Lost/Critical', value: lostClients },
          ],
        },
        {
          title: 'Department Performance',
          items: deptPerformance.map(d => ({
            label: d.name,
            value: `${d.completed}/${d.totalTasks} tasks | Revenue: INR ${d.revenue.toLocaleString('en-IN')}`,
          })),
        },
        {
          title: 'Top Performers',
          items: topPerformers.length > 0
            ? topPerformers.map((p, i) => ({
                label: `#${i + 1} ${p.name}`,
                value: `${p.completedTasks} completed tasks (${p.dept})`,
              }))
            : [{ label: 'No data', value: 'No active performers yet' }],
        },
      ],
      { filename: `reports-${new Date().toISOString().slice(0, 10)}` }
    )
  }, [totalRevenue, retentionRate, taskCompletionRate, completedTasks, totalTasks, totalClients, lostClients, activeClients, atRiskClients, deptPerformance, topPerformers])

  // Revenue chart: compute max for bar scaling
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.total), 1)
  const hasRevenueData = monthlyRevenue.some(m => m.total > 0)

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div className="space-y-6">
      <PageGuide
        pageKey="reports"
        title="Reports"
        description="Company performance reports with revenue, department metrics, and team analytics."
        steps={[
          { label: 'Select date range', description: 'Choose current month, last 30 days, or year to date' },
          { label: 'Review key metrics', description: 'Revenue, retention, and task completion rates' },
          { label: 'Export PDF', description: 'Download a formatted report for sharing' },
        ]}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-slate-400 mt-1">Analytics, P&L, and performance insights</p>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center">
            <select
              value={dateRange}
              onChange={handleDateRangeChange}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ colorScheme: 'dark' }}
            >
              <option value="current_month" className="bg-slate-800 text-white">Current Month</option>
              <option value="last_30" className="bg-slate-800 text-white">Last 30 Days</option>
              <option value="ytd" className="bg-slate-800 text-white">Year to Date</option>
            </select>
            <InfoTip text="Change the reporting period for all metrics" type="action" />
          </span>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-1"
          >
            Export PDF
            <InfoTip text="Download a formatted PDF report" type="action" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-400">Total Revenue</p>
          <p className="text-2xl font-bold text-white mt-1">
            {totalRevenue > 0 ? `\u20B9${totalRevenue.toLocaleString('en-IN')}` : '\u20B90'}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {totalRevenue === 0 ? 'No paid invoices yet' : 'From paid invoices'}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-400">Client Retention</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{retentionRate}%</p>
          <p className="text-sm text-slate-400 mt-1">{lostClients} clients lost</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-400">Task Completion</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{taskCompletionRate}%</p>
          <p className="text-sm text-slate-400 mt-1">{completedTasks}/{totalTasks} tasks</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-400">Active Clients</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{totalClients - lostClients}</p>
          <p className="text-sm text-slate-400 mt-1">Across all tiers</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-white">Monthly Revenue Trend</h3>
          </CardHeader>
          <CardContent>
            {hasRevenueData ? (
              <div className="h-64 flex items-end justify-between gap-2 px-4">
                {monthlyRevenue.map((item, i) => {
                  const pct = maxRevenue > 0 ? (item.total / maxRevenue) * 100 : 0
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs text-slate-400 mb-1">
                        {item.total > 0 ? `\u20B9${(item.total / 1000).toFixed(0)}K` : ''}
                      </span>
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t transition-all"
                        style={{ height: `${Math.max(pct, item.total > 0 ? 2 : 0)}%` }}
                      />
                      <span className="text-xs text-slate-400">{item.month}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-slate-400 text-lg">No revenue data available</p>
                  <p className="text-slate-500 text-sm mt-2">Revenue will appear here once invoices are marked as paid</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-white">Department Performance</h3>
          </CardHeader>
          <CardContent>
            {deptPerformance.some(d => d.totalTasks > 0 || d.revenue > 0) ? (
              <div className="space-y-4">
                {deptPerformance.map((dept) => (
                  <div key={dept.dept} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">{dept.name}</span>
                      <span className="text-sm text-slate-400">
                        {dept.completed}/{dept.totalTasks} tasks completed
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{ width: `${dept.totalTasks > 0 ? (dept.completed / dept.totalTasks) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-green-400 w-20 text-right">
                        {dept.revenue > 0 ? `\u20B9${(dept.revenue / 1000).toFixed(0)}K` : '\u20B90'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-slate-400">No department data available</p>
                <p className="text-slate-500 text-sm mt-2">Create tasks and invoices to see department metrics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client Health & Attrition */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-white">Client Health Overview</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-500/10 rounded-lg">
                <p className="text-3xl font-bold text-green-400">{activeClients}</p>
                <p className="text-sm text-slate-400 mt-1">Healthy</p>
              </div>
              <div className="p-4 bg-yellow-500/10 rounded-lg">
                <p className="text-3xl font-bold text-yellow-400">{atRiskClients}</p>
                <p className="text-sm text-slate-400 mt-1">At Risk</p>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg">
                <p className="text-3xl font-bold text-red-400">{lostClients}</p>
                <p className="text-sm text-slate-400 mt-1">Critical/Lost</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-white">Attrition Kill-Switch Impact</h3>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-5xl font-bold text-white">{'\u20B9'}0</p>
              <p className="text-slate-400 mt-2">Bonus forfeited this month</p>
              <p className="text-sm text-green-400 mt-1">
                {lostClients === 0 ? 'No client losses!' : `${lostClients} client(s) lost`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-white">Top Performers</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Employee</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Department</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Tasks Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {topPerformers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-slate-400">
                      No active performers yet. Task completion data will appear here.
                    </td>
                  </tr>
                ) : (
                  topPerformers.map((emp, i) => (
                    <tr key={emp.name} className="hover:bg-slate-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold w-6 text-slate-400">
                            {i < 3 ? `#${i + 1}` : ''}
                          </span>
                          <span className="text-white">{emp.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{emp.dept || 'N/A'}</td>
                      <td className="py-3 px-4 text-right text-white">{emp.completedTasks}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
