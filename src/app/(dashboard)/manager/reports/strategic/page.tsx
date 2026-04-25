'use client'

export default function ManagerStrategicReportPage() {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const quarterlyMetrics = {
    revenue: { current: 5250000, target: 6000000, lastQuarter: 4800000, growth: 9.4 },
    clients: { total: 45, new: 8, churned: 2, netGrowth: 6 },
    team: { size: 25, hired: 4, attrition: 1, openPositions: 5 },
    satisfaction: { csat: 82, nps: 45, retention: 92 },
  }

  const strategicGoals = [
    { goal: 'Reach 6L MRR', category: 'Revenue', status: 'ON_TRACK', progress: 87.5, dueDate: 'Q1 2024' },
    { goal: '50 Active Clients', category: 'Growth', status: 'ON_TRACK', progress: 90, dueDate: 'Q2 2024' },
    { goal: '95% Client Retention', category: 'Retention', status: 'AT_RISK', progress: 92, dueDate: 'Q1 2024' },
    { goal: 'Team Size: 30', category: 'Team', status: 'DELAYED', progress: 83, dueDate: 'Q2 2024' },
    { goal: 'NPS Score: 50+', category: 'Satisfaction', status: 'ON_TRACK', progress: 90, dueDate: 'Q2 2024' },
  ]

  const marketInsights = [
    { insight: 'Healthcare digital marketing growing 25% YoY', impact: 'POSITIVE', action: 'Expand healthcare focus' },
    { insight: 'AI automation reducing operational costs by 20%', impact: 'POSITIVE', action: 'Invest in AI tools' },
    { insight: 'Competition increasing pricing pressure', impact: 'NEGATIVE', action: 'Focus on value differentiation' },
    { insight: 'New data privacy regulations upcoming', impact: 'NEUTRAL', action: 'Compliance audit needed' },
  ]

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`
    return `${(amount / 1000).toFixed(0)}K`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TRACK': return 'bg-green-500/20 text-green-400'
      case 'AT_RISK': return 'bg-amber-500/20 text-amber-400'
      case 'DELAYED': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'POSITIVE': return 'bg-green-500/20 text-green-400'
      case 'NEGATIVE': return 'bg-red-500/20 text-red-400'
      case 'NEUTRAL': return 'bg-slate-800/50 text-slate-200'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Strategic Meeting</h1>
            <p className="text-violet-200">{today}</p>
          </div>
          <div className="text-right">
            <p className="text-violet-200 text-sm">Meeting Schedule</p>
            <p className="text-xl font-bold">Monthly - First Friday</p>
          </div>
        </div>
      </div>

      {/* Quarterly Performance */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Q1 2024 Performance Overview</h2>
        </div>
        <div className="grid grid-cols-4 divide-x divide-slate-200">
          <div className="p-6">
            <p className="text-sm text-slate-400 mb-2">Revenue</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(quarterlyMetrics.revenue.current)}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-slate-400">Target: {formatCurrency(quarterlyMetrics.revenue.target)}</span>
              <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                +{quarterlyMetrics.revenue.growth}%
              </span>
            </div>
            <div className="mt-3 h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full"
                style={{ width: `${(quarterlyMetrics.revenue.current / quarterlyMetrics.revenue.target) * 100}%` }}
              />
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-400 mb-2">Client Base</p>
            <p className="text-3xl font-bold text-white">{quarterlyMetrics.clients.total}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-green-400">+{quarterlyMetrics.clients.new} new</span>
              <span className="text-sm text-red-400">-{quarterlyMetrics.clients.churned} churned</span>
            </div>
            <p className="text-sm text-slate-400 mt-2">Net Growth: +{quarterlyMetrics.clients.netGrowth}</p>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-400 mb-2">Team</p>
            <p className="text-3xl font-bold text-white">{quarterlyMetrics.team.size}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-green-400">+{quarterlyMetrics.team.hired} hired</span>
              <span className="text-sm text-amber-400">{quarterlyMetrics.team.openPositions} open</span>
            </div>
            <p className="text-sm text-slate-400 mt-2">Attrition: {quarterlyMetrics.team.attrition}</p>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-400 mb-2">Client Satisfaction</p>
            <p className="text-3xl font-bold text-white">{quarterlyMetrics.satisfaction.csat}%</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-slate-400">NPS: {quarterlyMetrics.satisfaction.nps}</span>
            </div>
            <p className="text-sm text-slate-400 mt-2">Retention: {quarterlyMetrics.satisfaction.retention}%</p>
          </div>
        </div>
      </div>

      {/* Strategic Goals */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Strategic Goals Progress</h2>
        </div>
        <div className="divide-y divide-white/10">
          {strategicGoals.map((goal, idx) => (
            <div key={goal.goal} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <p className="font-medium text-white">{goal.goal}</p>
                  <span className="px-2 py-0.5 text-xs bg-slate-800/50 text-slate-300 rounded">{goal.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(goal.status)}`}>
                    {goal.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-slate-400">{goal.dueDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      goal.status === 'ON_TRACK' ? 'bg-green-500' :
                      goal.status === 'AT_RISK' ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-300">{goal.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Insights */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Market Insights & Trends</h2>
        </div>
        <div className="divide-y divide-white/10">
          {marketInsights.map((item, idx) => (
            <div key={item.insight} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-white">{item.insight}</p>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getImpactColor(item.impact)}`}>
                      {item.impact}
                    </span>
                  </div>
                  <p className="text-sm text-purple-400">Action: {item.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Discussion */}
      <div className="bg-violet-50 rounded-xl border border-violet-200 p-4">
        <h3 className="font-semibold text-violet-800 mb-3">Strategic Discussion Agenda</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-violet-700">
          <div>
            <p className="font-medium mb-1">Q2 Planning</p>
            <ul className="space-y-1">
              <li>- Revenue target: 7.5L MRR</li>
              <li>- Client acquisition: 10 new</li>
              <li>- Team expansion: 5 hires</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Investment Areas</p>
            <ul className="space-y-1">
              <li>- AI automation tools</li>
              <li>- Sales team expansion</li>
              <li>- Process automation</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Risk Mitigation</p>
            <ul className="space-y-1">
              <li>- Client concentration risk</li>
              <li>- Key person dependencies</li>
              <li>- Market competition</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Long-term Vision */}
      <div className="bg-gradient-to-r from-violet-100 to-purple-100 rounded-xl border border-violet-200 p-6">
        <h3 className="font-semibold text-violet-800 mb-4">2024 Vision & Roadmap</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="glass-card rounded-lg p-4 border border-violet-200">
            <p className="text-3xl font-bold text-violet-600">10L</p>
            <p className="text-sm text-slate-300">MRR Target</p>
          </div>
          <div className="glass-card rounded-lg p-4 border border-violet-200">
            <p className="text-3xl font-bold text-violet-600">75</p>
            <p className="text-sm text-slate-300">Active Clients</p>
          </div>
          <div className="glass-card rounded-lg p-4 border border-violet-200">
            <p className="text-3xl font-bold text-violet-600">40</p>
            <p className="text-sm text-slate-300">Team Size</p>
          </div>
          <div className="glass-card rounded-lg p-4 border border-violet-200">
            <p className="text-3xl font-bold text-violet-600">60+</p>
            <p className="text-sm text-slate-300">NPS Score</p>
          </div>
        </div>
      </div>
    </div>
  )
}
