'use client'

import { useState, useEffect } from 'react'

interface StrategicGoal {
  id: string
  goal: string
  category: 'REVENUE' | 'GROWTH' | 'EFFICIENCY' | 'CLIENT'
  target: string
  current: string
  progress: number
  deadline: string
  status: 'ON_TRACK' | 'AT_RISK' | 'AHEAD'
}

interface ClientHealth {
  id: string
  client: string
  retainerValue: number
  adSpend: number
  revenue: number
  satisfaction: number
  renewalDate: string
  risk: 'LOW' | 'MEDIUM' | 'HIGH'
}

export default function StrategicInsightsPage() {
  const [goals, setGoals] = useState<StrategicGoal[]>([])
  const [clients, setClients] = useState<ClientHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const [analyticsRes, campaignsRes] = await Promise.all([
          fetch('/api/ads/analytics'),
          fetch('/api/ads/campaigns?status=ACTIVE'),
        ])
        if (!analyticsRes.ok) throw new Error('Failed to fetch analytics')
        const analyticsData = await analyticsRes.json()
        const overview = analyticsData.overview || {}

        // Build strategic goals from analytics overview
        const totalSpend = overview.totalSpend || 0
        const roas = overview.roas || 0
        const totalLeads = overview.totalLeads || 0
        const activeCampaigns = overview.activeCampaigns || 0

        const mappedGoals: StrategicGoal[] = [
          { id: '1', goal: 'Monthly Ad Spend Under Management', category: 'REVENUE', target: '₹15L', current: `₹${(totalSpend / 100000).toFixed(1)}L`, progress: Math.min(100, Math.round((totalSpend / 1500000) * 100)), deadline: new Date(new Date().getFullYear(), new Date().getMonth() + 3, 0).toISOString().split('T')[0], status: totalSpend >= 1200000 ? 'ON_TRACK' : 'AT_RISK' },
          { id: '2', goal: 'Average Client ROAS', category: 'EFFICIENCY', target: '5x', current: `${roas.toFixed(1)}x`, progress: Math.min(100, Math.round((roas / 5) * 100)), deadline: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0], status: roas >= 4 ? 'ON_TRACK' : roas >= 3 ? 'AT_RISK' : 'AT_RISK' },
          { id: '3', goal: 'Active Campaigns', category: 'GROWTH', target: '20 campaigns', current: `${activeCampaigns} campaigns`, progress: Math.min(100, Math.round((activeCampaigns / 20) * 100)), deadline: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0], status: activeCampaigns >= 15 ? 'ON_TRACK' : 'AT_RISK' },
          { id: '4', goal: 'Total Leads Generated', category: 'CLIENT', target: '500 leads', current: `${totalLeads} leads`, progress: Math.min(100, Math.round((totalLeads / 500) * 100)), deadline: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0], status: totalLeads >= 400 ? 'AHEAD' : totalLeads >= 250 ? 'ON_TRACK' : 'AT_RISK' },
        ]
        setGoals(mappedGoals)

        // Build client health from campaigns
        if (campaignsRes.ok) {
          const campaignsData = await campaignsRes.json()
          const campaigns = campaignsData.campaigns || []
          const clientMap: Record<string, ClientHealth> = {}
          for (const c of campaigns) {
            const clientName = c.client?.name || 'Unknown'
            const clientId = c.client?.id || c.clientId
            if (!clientMap[clientId]) {
              clientMap[clientId] = {
                id: clientId,
                client: clientName,
                retainerValue: 0,
                adSpend: 0,
                revenue: 0,
                satisfaction: 80,
                renewalDate: c.endDate || '',
                risk: 'LOW',
              }
            }
            clientMap[clientId].adSpend += (c.spend || 0)
            clientMap[clientId].revenue += ((c.spend || 0) * (c.roas || 1))
          }
          const clientList = Object.values(clientMap).map(ch => ({
            ...ch,
            risk: ch.adSpend === 0 ? 'HIGH' as const : ch.revenue / ch.adSpend < 2 ? 'HIGH' as const : ch.revenue / ch.adSpend < 3 ? 'MEDIUM' as const : 'LOW' as const,
          }))
          setClients(clientList)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load strategic data')
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
      case 'AHEAD': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'REVENUE': return 'bg-green-500/20 text-green-400'
      case 'GROWTH': return 'bg-blue-500/20 text-blue-400'
      case 'EFFICIENCY': return 'bg-purple-500/20 text-purple-400'
      case 'CLIENT': return 'bg-orange-500/20 text-orange-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-500/20 text-green-400'
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400'
      case 'HIGH': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500'
    if (progress >= 70) return 'bg-blue-500'
    if (progress >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const totalRetainer = clients.reduce((sum, c) => sum + c.retainerValue, 0)
  const totalAdSpend = clients.reduce((sum, c) => sum + c.adSpend, 0)
  const totalRevenue = clients.reduce((sum, c) => sum + c.revenue, 0)
  const avgSatisfaction = clients.length > 0 ? Math.round(clients.reduce((sum, c) => sum + c.satisfaction, 0) / clients.length) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Strategic Insights</h1>
            <p className="text-red-200">Long-term goals, client health, and growth trajectory</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-red-200">Q{Math.ceil((new Date().getMonth() + 1) / 3)} {new Date().getFullYear()}</p>
            <p className="font-medium">{clients.length} clients tracked</p>
          </div>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Monthly Retainer</p>
          <p className="text-3xl font-bold text-green-400">₹{(totalRetainer / 100000).toFixed(1)}L</p>
          <p className="text-xs text-green-400 mt-1">6 active clients</p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Ad Spend Managed</p>
          <p className="text-3xl font-bold text-red-400">₹{(totalAdSpend / 100000).toFixed(1)}L</p>
          <p className="text-xs text-red-400 mt-1">this month</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Revenue Generated</p>
          <p className="text-3xl font-bold text-purple-400">₹{(totalRevenue / 100000).toFixed(1)}L</p>
          <p className="text-xs text-purple-400 mt-1">for clients</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Avg Satisfaction</p>
          <p className="text-3xl font-bold text-blue-400">{avgSatisfaction}%</p>
          <p className="text-xs text-blue-400 mt-1">client score</p>
        </div>
      </div>

      {/* Strategic Goals */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Q{Math.ceil((new Date().getMonth() + 1) / 3)} {new Date().getFullYear()} Strategic Goals</h2>
        </div>
        <div className="divide-y divide-white/10">
          {goals.map(goal => (
            <div key={goal.id} className="p-4 hover:bg-slate-900/40">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(goal.category)}`}>
                    {goal.category}
                  </span>
                  <h3 className="font-medium text-white">{goal.goal}</h3>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(goal.status)}`}>
                  {goal.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-1">
                  <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getProgressColor(goal.progress)}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-300 w-12 text-right">{goal.progress}%</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Current: <span className="font-medium text-slate-200">{goal.current}</span></span>
                <span>Target: <span className="font-medium text-slate-200">{goal.target}</span></span>
                <span>Deadline: <span className="font-medium text-slate-200">{new Date(goal.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Health */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Client Health Overview</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">RETAINER</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">AD SPEND</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">REVENUE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">SATISFACTION</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">RENEWAL</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">RISK</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client.id} className="border-b border-white/5 hover:bg-slate-900/40">
                <td className="py-3 px-4 font-medium text-white">{client.client}</td>
                <td className="py-3 px-4 text-right text-slate-300">₹{(client.retainerValue / 1000).toFixed(0)}K</td>
                <td className="py-3 px-4 text-right text-red-400">₹{(client.adSpend / 100000).toFixed(1)}L</td>
                <td className="py-3 px-4 text-right text-green-400 font-semibold">₹{(client.revenue / 100000).toFixed(1)}L</td>
                <td className="py-3 px-4 text-center">
                  <span className={`font-medium ${client.satisfaction >= 85 ? 'text-green-400' : client.satisfaction >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                    {client.satisfaction}%
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-slate-300">
                  {client.renewalDate ? new Date(client.renewalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '-'}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getRiskColor(client.risk)}`}>
                    {client.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Strategic Recommendations */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <h3 className="font-semibold text-green-800 mb-3">Growth Opportunities</h3>
          <div className="space-y-3 text-sm text-green-400">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center text-green-400 font-bold text-xs">1</span>
              <div>
                <p className="font-medium">Upsell Apollo to Performance Max</p>
                <p className="text-green-400">Potential +₹1L ad spend/month</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center text-green-400 font-bold text-xs">2</span>
              <div>
                <p className="font-medium">Expand HealthFirst to Google Ads</p>
                <p className="text-green-400">Currently Meta only, high potential</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center text-green-400 font-bold text-xs">3</span>
              <div>
                <p className="font-medium">Target 2 new healthcare clients</p>
                <p className="text-green-400">Focus on diagnostic labs vertical</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <h3 className="font-semibold text-red-800 mb-3">Risk Mitigation</h3>
          <div className="space-y-3 text-sm text-red-400">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-red-200 rounded-full flex items-center justify-center text-red-400 font-bold text-xs">!</span>
              <div>
                <p className="font-medium">PhysioPlus renewal at risk</p>
                <p className="text-red-400">Schedule QBR before Apr 1</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-amber-400 font-bold text-xs">!</span>
              <div>
                <p className="font-medium">WellnessHub satisfaction dropping</p>
                <p className="text-red-400">Address CPL concerns proactively</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-amber-400 font-bold text-xs">!</span>
              <div>
                <p className="font-medium">Dr Sharma Clinic needs attention</p>
                <p className="text-red-400">Review campaign strategy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
