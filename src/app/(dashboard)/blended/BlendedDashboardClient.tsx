'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  services: string | null
  status: string
  tier: string | null
  role: string
}

interface Task {
  id: string
  activityType: string
  description: string
  status: string
  plannedHours: number | null
  isBreakthrough: boolean
  isBreakdown: boolean
  client: { id: string; name: string } | null
}

interface DepartmentMetrics {
  total: number
  completed: number
  breakthroughs: number
}

interface SeoMetrics {
  keywordsTracked: number
  keywordsInTop10: number
  blogsThisMonth: number
  backlinksBuilt: number
}

interface AdsMetrics {
  activeCampaigns: number
  leadsThisMonth: number
  avgCPL: number
  totalSpend: number
  conversionRate: string
}

interface BlendedData {
  clients: Client[]
  todaysTasks: Task[]
  tasksByDepartment: Record<string, DepartmentMetrics>
  seoMetrics: SeoMetrics | null
  adsMetrics: AdsMetrics | null
  departments: string[]
}

const DEPT_COLORS: Record<string, { gradient: string; bg: string; text: string; border: string }> = {
  SEO: {
    gradient: 'from-teal-600 to-emerald-600',
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    border: 'border-teal-500/30',
  },
  ADS: {
    gradient: 'from-red-600 to-orange-500',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
  },
}

const ACTIVITY_LABELS: Record<string, { label: string; dept: string }> = {
  // SEO Activities
  BLOG_WRITING: { label: 'Blog Writing', dept: 'SEO' },
  KEYWORD_RESEARCH: { label: 'Keyword Research', dept: 'SEO' },
  ON_PAGE_SEO: { label: 'On-Page SEO', dept: 'SEO' },
  LINK_BUILDING: { label: 'Link Building', dept: 'SEO' },
  TECHNICAL_SEO: { label: 'Technical SEO', dept: 'SEO' },
  GBP_MANAGEMENT: { label: 'GBP Management', dept: 'SEO' },
  // Ads Activities
  AD_CAMPAIGN_SETUP: { label: 'Campaign Setup', dept: 'ADS' },
  AD_OPTIMIZATION: { label: 'Ad Optimization', dept: 'ADS' },
  LEAD_TRACKING: { label: 'Lead Tracking', dept: 'ADS' },
  BUDGET_MANAGEMENT: { label: 'Budget Management', dept: 'ADS' },
  CREATIVE_REVIEW: { label: 'Creative Review', dept: 'ADS' },
}

export function BlendedDashboardClient({
  data,
  userName,
}: {
  data: BlendedData
  userName: string
}) {
  const [activeView, setActiveView] = useState<'all' | string>('all')

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500/20 text-green-400'
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400'
      case 'STARTED': return 'bg-amber-500/20 text-amber-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const filteredTasks = activeView === 'all'
    ? data.todaysTasks
    : data.todaysTasks.filter(t => ACTIVITY_LABELS[t.activityType]?.dept === activeView)

  const totalTasks = Object.values(data.tasksByDepartment).reduce((sum, d) => sum + d.total, 0)
  const totalCompleted = Object.values(data.tasksByDepartment).reduce((sum, d) => sum + d.completed, 0)
  const totalBreakthroughs = Object.values(data.tasksByDepartment).reduce((sum, d) => sum + d.breakthroughs, 0)

  return (
    <div className="space-y-6">
      {/* Header with Department Switcher */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {userName}!</h1>
            <p className="text-indigo-200">Multi-Department Workspace</p>
          </div>
          <div className="flex items-center gap-2">
            {data.departments.map(dept => (
              <span
                key={dept}
                className={`px-3 py-1 rounded-full text-sm font-medium ${DEPT_COLORS[dept]?.bg || 'bg-white/20 backdrop-blur-sm'} ${DEPT_COLORS[dept]?.text || 'text-white'} border ${DEPT_COLORS[dept]?.border || 'border-white/30'}`}
              >
                {dept}
              </span>
            ))}
          </div>
        </div>

        {/* Department View Tabs */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveView('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === 'all' ? 'glass-card text-purple-400' : 'text-white/80 hover:text-white'
            }`}
          >
            All Departments
          </button>
          {data.departments.map(dept => (
            <button
              key={dept}
              onClick={() => setActiveView(dept)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeView === dept ? 'glass-card text-purple-400' : 'text-white/80 hover:text-white'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total Clients</p>
          <p className="text-3xl font-bold text-white">{data.clients.length}</p>
          <p className="text-xs text-slate-400 mt-1">Across all departments</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Tasks This Month</p>
          <p className="text-3xl font-bold text-white">{totalTasks}</p>
          <p className="text-xs text-green-400 mt-1">{totalCompleted} completed</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Breakthroughs</p>
          <p className="text-3xl font-bold text-emerald-600">{totalBreakthroughs}</p>
          <p className="text-xs text-slate-400 mt-1">Same-day completions</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Today&apos;s Tasks</p>
          <p className="text-3xl font-bold text-white">{data.todaysTasks.length}</p>
          <p className="text-xs text-blue-400 mt-1">{data.todaysTasks.filter(t => t.status === 'COMPLETED').length} done</p>
        </div>
      </div>

      {/* Department-Specific Metrics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* SEO Metrics */}
        {data.seoMetrics && (activeView === 'all' || activeView === 'SEO') && (
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-teal-800">SEO Performance</h3>
                <p className="text-xs text-teal-600">This month&apos;s metrics</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                <p className="text-sm text-teal-600">Keywords Tracked</p>
                <p className="text-2xl font-bold text-teal-800">{data.seoMetrics.keywordsTracked}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                <p className="text-sm text-teal-600">In Top 10</p>
                <p className="text-2xl font-bold text-emerald-600">{data.seoMetrics.keywordsInTop10}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                <p className="text-sm text-teal-600">Blogs Written</p>
                <p className="text-2xl font-bold text-teal-800">{data.seoMetrics.blogsThisMonth}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                <p className="text-sm text-teal-600">Backlinks Built</p>
                <p className="text-2xl font-bold text-teal-800">{data.seoMetrics.backlinksBuilt}</p>
              </div>
            </div>
            <Link href="/seo" className="mt-4 inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-800">
              Go to SEO Dashboard
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {/* Ads Metrics */}
        {data.adsMetrics && (activeView === 'all' || activeView === 'ADS') && (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-red-800">Ads Performance</h3>
                <p className="text-xs text-red-400">This month&apos;s metrics</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                <p className="text-sm text-red-400">Active Campaigns</p>
                <p className="text-2xl font-bold text-red-800">{data.adsMetrics.activeCampaigns}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                <p className="text-sm text-red-400">Leads Generated</p>
                <p className="text-2xl font-bold text-orange-600">{data.adsMetrics.leadsThisMonth}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                <p className="text-sm text-red-400">Avg CPL</p>
                <p className="text-2xl font-bold text-red-800">{formatCurrency(data.adsMetrics.avgCPL)}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                <p className="text-sm text-red-400">Total Spend</p>
                <p className="text-2xl font-bold text-red-800">{formatCurrency(data.adsMetrics.totalSpend)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-red-400">Conversion Rate: <strong>{data.adsMetrics.conversionRate}%</strong></span>
              <Link href="/ads" className="inline-flex items-center gap-1 text-sm text-red-400 hover:text-red-800">
                Go to Ads Dashboard
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Today's Tasks - Excel-like View */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Today&apos;s Work Tracker</h2>
            <p className="text-xs text-purple-200">All departments combined</p>
          </div>
          <Link
            href="/tasks/daily"
            className="px-3 py-1.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white text-sm rounded-lg transition-colors"
          >
            Open Full Planner
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/50 border-b border-white/10">
                <th className="px-3 py-2 text-left font-semibold text-slate-300 w-8">#</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-300">Dept</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-300">Activity</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-300">Client</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-300">Description</th>
                <th className="px-3 py-2 text-center font-semibold text-slate-300">Hours</th>
                <th className="px-3 py-2 text-center font-semibold text-slate-300">Status</th>
                <th className="px-3 py-2 text-center font-semibold text-slate-300">Result</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No tasks for today. <Link href="/tasks/daily" className="text-indigo-600 hover:underline">Add tasks</Link>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task, idx) => {
                  const activity = ACTIVITY_LABELS[task.activityType] || { label: task.activityType, dept: 'OTHER' }
                  const deptColor = DEPT_COLORS[activity.dept]
                  return (
                    <tr key={task.id} className="border-b border-white/5 hover:bg-slate-900/40">
                      <td className="px-3 py-2 text-slate-400 font-mono text-xs">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${deptColor?.bg || 'bg-slate-800/50'} ${deptColor?.text || 'text-slate-300'}`}>
                          {activity.dept}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-200">{activity.label}</td>
                      <td className="px-3 py-2 text-slate-300">{task.client?.name || '-'}</td>
                      <td className="px-3 py-2 text-slate-300 truncate max-w-[200px]">{task.description}</td>
                      <td className="px-3 py-2 text-center font-medium">{task.plannedHours || '-'}h</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {task.isBreakthrough && (
                          <span className="text-green-400" title="Breakthrough">✓</span>
                        )}
                        {task.isBreakdown && (
                          <span className="text-red-400" title="Breakdown">✗</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Portfolio */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40 flex items-center justify-between">
          <h2 className="font-semibold text-white">My Client Portfolio</h2>
          <span className="text-sm text-slate-400">{data.clients.length} clients</span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {data.clients.map(client => {
            const services = client.services ? JSON.parse(client.services) : []
            const hasAds = services.includes('Ads') || services.includes('ADS')
            const hasSeo = services.includes('SEO')
            return (
              <div key={client.id} className="border border-white/10 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-white">{client.name}</h3>
                    <p className="text-xs text-slate-400">{client.role.replace(/_/g, ' ')}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    client.tier === 'PREMIUM' ? 'bg-amber-500/20 text-amber-400' :
                    client.tier === 'STANDARD' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-800/50 text-slate-200'
                  }`}>
                    {client.tier || 'STANDARD'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {hasSeo && (
                    <span className="px-2 py-0.5 text-xs rounded bg-teal-500/20 text-teal-400">SEO</span>
                  )}
                  {hasAds && (
                    <span className="px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-400">ADS</span>
                  )}
                  {services.filter((s: string) => s !== 'SEO' && s !== 'Ads' && s !== 'ADS').map((s: string) => (
                    <span key={s} className="px-2 py-0.5 text-xs rounded bg-slate-800/50 text-slate-300">{s}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        <Link
          href="/tasks/daily"
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-none transition-shadow"
        >
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <p className="font-semibold">Add Task</p>
            <p className="text-xs text-indigo-200">Daily Planner</p>
          </div>
        </Link>

        <Link
          href="/seo/deliverables/content"
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:shadow-none transition-shadow"
        >
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold">Add Blog</p>
            <p className="text-xs text-teal-200">SEO Content</p>
          </div>
        </Link>

        <Link
          href="/ads/campaigns"
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-none transition-shadow"
        >
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold">Campaigns</p>
            <p className="text-xs text-red-200">View All</p>
          </div>
        </Link>

        <Link
          href="/ads/leads/performance"
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:shadow-none transition-shadow"
        >
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold">Lead Tracking</p>
            <p className="text-xs text-amber-200">Performance</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
