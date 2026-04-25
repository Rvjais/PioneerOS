'use client'

export default function ManagerTacticalReportPage() {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const weeklyMetrics = {
    clients: { totalActive: 45, atRisk: 5, newOnboarded: 2, churned: 0 },
    delivery: { tasksCompleted: 425, tasksDelayed: 38, qcPassRate: 91, avgDeliveryTime: 2.3 },
    sales: { leadsGenerated: 25, proposals: 8, won: 2, revenue: 350000 },
    finance: { invoiced: 1850000, collected: 1450000, overdue: 200000 },
    hr: { positionsOpen: 5, interviewed: 12, offers: 2, attendance: 94 },
  }

  const departmentHealth = [
    { name: 'SEO', health: 'GOOD', tasksCompleted: 115, delayed: 8, qcScore: 92, issues: 1 },
    { name: 'Ads', health: 'GOOD', tasksCompleted: 98, delayed: 5, qcScore: 94, issues: 0 },
    { name: 'Social', health: 'MODERATE', tasksCompleted: 145, delayed: 15, qcScore: 88, issues: 2 },
    { name: 'Web', health: 'POOR', tasksCompleted: 52, delayed: 18, qcScore: 85, issues: 3 },
    { name: 'AI', health: 'GOOD', tasksCompleted: 35, delayed: 2, qcScore: 96, issues: 0 },
  ]

  const keyInitiatives = [
    { initiative: 'Q2 Client Retention Campaign', status: 'ON_TRACK', progress: 65, owner: 'Sales' },
    { initiative: 'QC Process Improvement', status: 'ON_TRACK', progress: 80, owner: 'Operations' },
    { initiative: 'Web Team Expansion', status: 'DELAYED', progress: 40, owner: 'HR' },
    { initiative: 'Payment Automation', status: 'IN_PROGRESS', progress: 55, owner: 'Accounts' },
  ]

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`
    return `${(amount / 1000).toFixed(0)}K`
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'GOOD': return 'bg-green-500'
      case 'MODERATE': return 'bg-amber-500'
      case 'POOR': return 'bg-red-500'
      default: return 'bg-slate-900/40'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Weekly Tactical Meeting</h1>
            <p className="text-blue-200">{today}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-sm">Meeting Time</p>
            <p className="text-xl font-bold">Every Tuesday, 10:00 AM</p>
          </div>
        </div>
      </div>

      {/* Weekly Metrics */}
      <div className="grid grid-cols-5 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Active Clients</p>
          <p className="text-3xl font-bold text-white">{weeklyMetrics.clients.totalActive}</p>
          <p className="text-xs text-amber-400">{weeklyMetrics.clients.atRisk} at risk</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Tasks Completed</p>
          <p className="text-3xl font-bold text-green-400">{weeklyMetrics.delivery.tasksCompleted}</p>
          <p className="text-xs text-red-400">{weeklyMetrics.delivery.tasksDelayed} delayed</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Sales Pipeline</p>
          <p className="text-3xl font-bold text-orange-600">{weeklyMetrics.sales.leadsGenerated}</p>
          <p className="text-xs text-slate-400">new leads</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Collected</p>
          <p className="text-3xl font-bold text-emerald-600">{formatCurrency(weeklyMetrics.finance.collected)}</p>
          <p className="text-xs text-red-400">{formatCurrency(weeklyMetrics.finance.overdue)} overdue</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Attendance</p>
          <p className="text-3xl font-bold text-white">{weeklyMetrics.hr.attendance}%</p>
          <p className="text-xs text-slate-400">team avg</p>
        </div>
      </div>

      {/* Department Health */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Department Health Overview</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">DEPARTMENT</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">HEALTH</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">COMPLETED</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">DELAYED</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">QC SCORE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">ISSUES</th>
            </tr>
          </thead>
          <tbody>
            {departmentHealth.map(dept => (
              <tr key={dept.name} className="border-b border-white/5 hover:bg-slate-900/40">
                <td className="py-4 px-4">
                  <span className="font-medium text-white">{dept.name}</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getHealthColor(dept.health)}`} />
                    <span className="text-sm text-slate-300">{dept.health}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-green-400 font-medium">{dept.tasksCompleted}</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`font-medium ${dept.delayed > 10 ? 'text-red-400' : 'text-amber-400'}`}>
                    {dept.delayed}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`font-medium ${
                    dept.qcScore >= 90 ? 'text-green-400' :
                    dept.qcScore >= 80 ? 'text-amber-400' :
                    'text-red-400'
                  }`}>
                    {dept.qcScore}%
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`font-medium ${dept.issues > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {dept.issues}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Initiatives */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Key Initiatives Progress</h2>
        </div>
        <div className="divide-y divide-white/10">
          {keyInitiatives.map((initiative, idx) => (
            <div key={initiative.initiative} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-white">{initiative.initiative}</p>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  initiative.status === 'ON_TRACK' ? 'bg-green-500/20 text-green-400' :
                  initiative.status === 'DELAYED' ? 'bg-red-500/20 text-red-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {initiative.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      initiative.status === 'ON_TRACK' ? 'bg-green-500' :
                      initiative.status === 'DELAYED' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${initiative.progress}%` }}
                  />
                </div>
                <span className="text-sm text-slate-400">{initiative.progress}%</span>
                <span className="text-xs text-slate-400">Owner: {initiative.owner}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discussion Points */}
      <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
        <h3 className="font-semibold text-blue-800 mb-3">Weekly Discussion Points</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-400">
          <div>
            <p className="font-medium mb-1">Wins This Week</p>
            <ul className="space-y-1">
              <li>- 2 new clients onboarded</li>
              <li>- QC pass rate improved to 91%</li>
              <li>- Sales closed 3.5L revenue</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Challenges</p>
            <ul className="space-y-1">
              <li>- Web team capacity issues</li>
              <li>- 2L overdue collections</li>
              <li>- Social media delays</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Next Week Focus</p>
            <ul className="space-y-1">
              <li>- Resolve Web capacity</li>
              <li>- Push overdue collections</li>
              <li>- Close 3 pending proposals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
