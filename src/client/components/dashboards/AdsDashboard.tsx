'use client'

import Link from 'next/link'

interface AdsDashboardProps {
  user: {
    firstName: string
    lastName: string
  }
  stats: {
    clientsManaged: number
    activeCampaigns: number
    totalSpend: number
    totalLeads: number
    avgCPL: number
    avgROAS: number
  }
  campaigns: Array<{
    id: string
    name: string
    client: string
    platform: string
    status: string
    spend: number
    leads: number
    cpl: number
  }>
  budgetAlerts: Array<{
    client: string
    campaign: string
    budgetUsed: number
    budgetTotal: number
  }>
  todaysTasks: Array<{
    id: string
    title: string
    client: string
    priority: string
    status: string
  }>
}

export function AdsDashboard({
  user,
  stats,
  campaigns,
  budgetAlerts,
  todaysTasks,
}: AdsDashboardProps) {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Performance Ads Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {user.firstName}! Monitor your ad campaigns.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/tasks/daily"
            className="px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Daily Planner
          </Link>
          <Link
            href="/ads/campaigns"
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-medium hover:shadow-none transition-all"
          >
            Manage Campaigns
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.clientsManaged}</p>
          <p className="text-sm text-slate-400">Clients</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.activeCampaigns}</p>
          <p className="text-sm text-slate-400">Active Campaigns</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">₹{(stats.totalSpend / 1000).toFixed(1)}K</p>
          <p className="text-sm text-slate-400">Total Spend</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.totalLeads}</p>
          <p className="text-sm text-slate-400">Leads Generated</p>
        </div>
        <div className="bg-gradient-to-br from-rose-500/20 to-red-500/20 border border-rose-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">
            {stats.activeCampaigns > 0 ? `₹${stats.avgCPL}` : '-'}
          </p>
          <p className="text-sm text-slate-400">Avg CPL</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">
            {stats.activeCampaigns > 0 ? `${stats.avgROAS}x` : '-'}
          </p>
          <p className="text-sm text-slate-400">Avg ROAS</p>
        </div>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-lg font-semibold text-white">Budget Alerts</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {budgetAlerts.slice(0, 4).map((alert, index) => {
              const percentage = (alert.budgetUsed / alert.budgetTotal) * 100
              return (
                <div key={`${alert.client}-${alert.campaign}`} className="bg-white/5 backdrop-blur-sm rounded-xl p-3">
                  <p className="text-sm font-medium text-white truncate">{alert.client}</p>
                  <p className="text-xs text-slate-400 truncate">{alert.campaign}</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Budget Used</span>
                      <span className={`font-medium ${percentage >= 90 ? 'text-red-400' : percentage >= 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${percentage >= 90 ? 'bg-red-500' : percentage >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Active Campaigns */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Active Campaigns</h2>
          <Link href="/ads/campaigns" className="text-sm text-blue-400 hover:text-blue-300">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Campaign performance">
            <thead className="bg-white/5 backdrop-blur-sm">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Campaign</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Client</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Platform</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Spend</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Leads</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">CPL</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">No active campaigns</td>
                </tr>
              ) : (
                campaigns.slice(0, 5).map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-white/5">
                    <td className="px-5 py-4 text-sm font-medium text-white">{campaign.name}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">{campaign.client}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        campaign.platform === 'Meta' ? 'bg-blue-500/20 text-blue-300' :
                        campaign.platform === 'Google' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-purple-500/20 text-purple-300'
                      }`}>
                        {campaign.platform}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">₹{campaign.spend.toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm text-white font-medium">{campaign.leads}</td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-medium ${
                        campaign.cpl <= 100 ? 'text-emerald-400' :
                        campaign.cpl <= 200 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        ₹{campaign.cpl}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' :
                        campaign.status === 'PAUSED' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Today&apos;s Tasks</h2>
          <Link href="/tasks/daily" className="text-sm text-blue-400 hover:text-blue-300">
            View all
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {todaysTasks.length === 0 ? (
            <div className="p-5 text-center text-slate-400">No tasks for today</div>
          ) : (
            todaysTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="p-4 flex items-center justify-between hover:bg-white/5">
                <div>
                  <p className="font-medium text-white">{task.title}</p>
                  <p className="text-sm text-slate-400">{task.client}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    task.priority === 'HIGH' ? 'bg-red-500/20 text-red-300' :
                    task.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-white/5 text-slate-300'
                  }`}>
                    {task.priority}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    task.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                    task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-white/5 text-slate-300'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/ads/campaigns/new" className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl hover:border-blue-500/40 transition-colors text-left block">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white">Create Campaign</p>
            <p className="text-xs text-slate-400 mt-1">Launch new ads</p>
          </Link>
          <Link href="/ads/analytics" className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl hover:border-emerald-500/40 transition-colors text-left block">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white">View Analytics</p>
            <p className="text-xs text-slate-400 mt-1">Performance data</p>
          </Link>
          <Link href="/ads/leads" className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl hover:border-purple-500/40 transition-colors text-left block">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white">Lead Quality</p>
            <p className="text-xs text-slate-400 mt-1">Check lead status</p>
          </Link>
          <Link href="/ads/reports/budget" className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl hover:border-amber-500/40 transition-colors text-left block">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white">Budget Report</p>
            <p className="text-xs text-slate-400 mt-1">Spend analysis</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
