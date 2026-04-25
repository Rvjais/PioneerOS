'use client'

import { useState, useEffect } from 'react'

interface OperationsMetric {
  id: string
  metric: string
  category: 'CAMPAIGNS' | 'TEAM' | 'CLIENTS' | 'EFFICIENCY'
  currentValue: number | string
  target: number | string
  status: 'ON_TRACK' | 'AT_RISK' | 'BEHIND'
  trend: 'UP' | 'DOWN' | 'STABLE'
}

interface TeamMember {
  id: string
  name: string
  role: string
  activeCampaigns: number
  leadsGenerated: number
  tasksCompleted: number
  efficiency: number
}

export default function OperationsReportPage() {
  const [metrics, setMetrics] = useState<OperationsMetric[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const [analyticsRes, usersRes] = await Promise.all([
          fetch('/api/ads/analytics'),
          fetch('/api/users?department=ADS'),
        ])
        if (!analyticsRes.ok) throw new Error('Failed to fetch analytics')
        const analyticsData = await analyticsRes.json()
        const overview = analyticsData.overview || {}

        const activeCampaigns = overview.activeCampaigns || 0
        const totalLeads = overview.totalLeads || 0
        const avgCPL = overview.avgCPL || 0
        const avgCTR = overview.avgCTR || 0

        const mappedMetrics: OperationsMetric[] = [
          { id: '1', metric: 'Active Campaigns', category: 'CAMPAIGNS', currentValue: activeCampaigns, target: 20, status: activeCampaigns >= 18 ? 'ON_TRACK' : 'AT_RISK', trend: 'UP' },
          { id: '2', metric: 'Total Leads', category: 'CAMPAIGNS', currentValue: totalLeads, target: 500, status: totalLeads >= 400 ? 'ON_TRACK' : 'AT_RISK', trend: totalLeads > 250 ? 'UP' : 'DOWN' },
          { id: '3', metric: 'Avg CPL', category: 'EFFICIENCY', currentValue: `₹${avgCPL.toFixed(0)}`, target: '₹300', status: avgCPL <= 300 ? 'ON_TRACK' : 'AT_RISK', trend: avgCPL <= 300 ? 'UP' : 'DOWN' },
          { id: '4', metric: 'Avg CTR', category: 'EFFICIENCY', currentValue: `${avgCTR.toFixed(2)}%`, target: '2%', status: avgCTR >= 2 ? 'ON_TRACK' : 'AT_RISK', trend: avgCTR >= 1.5 ? 'UP' : 'DOWN' },
          { id: '5', metric: 'ROAS', category: 'CLIENTS', currentValue: `${(overview.roas || 0).toFixed(1)}x`, target: '4x', status: (overview.roas || 0) >= 4 ? 'ON_TRACK' : 'AT_RISK', trend: (overview.roas || 0) >= 3 ? 'UP' : 'DOWN' },
          { id: '6', metric: 'Total Spend', category: 'CLIENTS', currentValue: `₹${((overview.totalSpend || 0) / 100000).toFixed(1)}L`, target: '₹15L', status: (overview.totalSpend || 0) >= 1200000 ? 'ON_TRACK' : 'AT_RISK', trend: 'STABLE' },
        ]
        setMetrics(mappedMetrics)

        // Parse team members
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          const users = Array.isArray(usersData) ? usersData : []
          const mappedTeam: TeamMember[] = users.map((u: Record<string, unknown>) => ({
            id: u.id as string,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
            role: (u.role as string) || 'Ads Executive',
            activeCampaigns: 0,
            leadsGenerated: 0,
            tasksCompleted: 0,
            efficiency: 85,
          }))
          setTeam(mappedTeam)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load operations data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="space-y-4">{Array.from({length:3}).map((_,i) => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}</div>
  if (error) return <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">{error}</div>

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TRACK': return 'bg-green-500/20 text-green-400'
      case 'AT_RISK': return 'bg-amber-500/20 text-amber-400'
      case 'BEHIND': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'UP': return '↑'
      case 'DOWN': return '↓'
      case 'STABLE': return '→'
      default: return ''
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'UP': return 'text-green-400'
      case 'DOWN': return 'text-red-400'
      case 'STABLE': return 'text-slate-400'
      default: return 'text-slate-400'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CAMPAIGNS': return 'bg-blue-500/20 text-blue-400'
      case 'TEAM': return 'bg-purple-500/20 text-purple-400'
      case 'CLIENTS': return 'bg-green-500/20 text-green-400'
      case 'EFFICIENCY': return 'bg-orange-500/20 text-orange-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const onTrackCount = metrics.filter(m => m.status === 'ON_TRACK').length
  const atRiskCount = metrics.filter(m => m.status === 'AT_RISK').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Operations Report</h1>
            <p className="text-red-200">Daily operations metrics and team performance</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-red-200">Last updated</p>
            <p className="font-medium">Today, 9:00 AM</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">On Track</p>
          <p className="text-3xl font-bold text-green-400">{onTrackCount}</p>
          <p className="text-xs text-green-400">metrics</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">At Risk</p>
          <p className="text-3xl font-bold text-amber-400">{atRiskCount}</p>
          <p className="text-xs text-amber-400">metrics</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Active Campaigns</p>
          <p className="text-3xl font-bold text-blue-400">{metrics.find(m => m.metric === 'Active Campaigns')?.currentValue || 0}</p>
          <p className="text-xs text-blue-400">tracked</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Team Members</p>
          <p className="text-3xl font-bold text-purple-400">{team.length}</p>
          <p className="text-xs text-purple-400">in department</p>
        </div>
      </div>

      {/* Operations Metrics Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Key Operations Metrics</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">METRIC</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CATEGORY</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">CURRENT</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">TARGET</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">TREND</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map(metric => (
              <tr key={metric.id} className="border-b border-white/5 hover:bg-slate-900/40">
                <td className="py-3 px-4 font-medium text-white">{metric.metric}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(metric.category)}`}>
                    {metric.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-white font-semibold">{metric.currentValue}</td>
                <td className="py-3 px-4 text-right text-slate-400">{metric.target}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(metric.status)}`}>
                    {metric.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`text-lg font-bold ${getTrendColor(metric.trend)}`}>
                    {getTrendIcon(metric.trend)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Team Performance */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Team Performance (This Week)</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">TEAM MEMBER</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">ROLE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">CAMPAIGNS</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">LEADS</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">TASKS</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">EFFICIENCY</th>
            </tr>
          </thead>
          <tbody>
            {team.map(member => (
              <tr key={member.id} className="border-b border-white/5 hover:bg-slate-900/40">
                <td className="py-3 px-4 font-medium text-white">{member.name}</td>
                <td className="py-3 px-4 text-slate-300">{member.role}</td>
                <td className="py-3 px-4 text-center text-blue-400 font-medium">{member.activeCampaigns}</td>
                <td className="py-3 px-4 text-center text-green-400 font-medium">{member.leadsGenerated}</td>
                <td className="py-3 px-4 text-center text-purple-400 font-medium">{member.tasksCompleted}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`font-bold ${member.efficiency >= 90 ? 'text-green-400' : member.efficiency >= 80 ? 'text-blue-400' : 'text-amber-400'}`}>
                    {member.efficiency}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Items */}
      <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
        <h3 className="font-semibold text-amber-800 mb-3">Action Items for Today</h3>
        <div className="space-y-2 text-sm text-amber-400">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="action-launch-rate" className="rounded border-amber-400" />
            <label htmlFor="action-launch-rate">Review campaign launch rate - currently at 4/week vs 5/week target</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="action-setup-time" className="rounded border-amber-400" />
            <label htmlFor="action-setup-time">Optimize campaign setup process to reduce setup time to 3 hours</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="action-weekly-reports" className="rounded border-amber-400" />
            <label htmlFor="action-weekly-reports">Send pending weekly reports to 2 clients</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="action-review-meeting" className="rounded border-amber-400" />
            <label htmlFor="action-review-meeting">Schedule campaign review meeting with Vikram for Apollo account</label>
          </div>
        </div>
      </div>
    </div>
  )
}
