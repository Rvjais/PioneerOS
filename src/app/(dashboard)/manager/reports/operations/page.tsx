'use client'

export default function ManagerOperationsReportPage() {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const metrics = {
    clientHealth: { active: 45, atRisk: 5, escalated: 3 },
    delivery: { tasksCompleted: 85, tasksDelayed: 12, qcPending: 18 },
    finance: { invoicesPending: 15, overduePayments: 8, collected: 2850000 },
    sales: { newLeads: 8, meetings: 5, proposals: 3 },
    hr: { openPositions: 5, interviews: 3, attendance: 92 },
  }

  const escalations = [
    { client: 'Apollo Hospitals', issue: 'Delayed social media posts', status: 'OPEN', owner: 'Priya' },
    { client: 'MedPlus Clinics', issue: 'Website updates pending', status: 'IN_PROGRESS', owner: 'Rahul' },
    { client: 'HealthFirst Labs', issue: 'Ad performance concern', status: 'OPEN', owner: 'Anita' },
  ]

  const blockers = [
    { dept: 'Web', issue: 'Designer on leave - 3 projects impacted', impact: 'HIGH' },
    { dept: 'Accounts', issue: 'Pending vendor approval for new tool', impact: 'MEDIUM' },
  ]

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`
    return `${(amount / 1000).toFixed(0)}K`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Daily Operations Meeting</h1>
            <p className="text-purple-200">{today}</p>
          </div>
          <div className="text-right">
            <p className="text-purple-200 text-sm">Meeting Time</p>
            <p className="text-xl font-bold">10:00 AM</p>
          </div>
        </div>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-5 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400">👥</span>
            </div>
            <p className="text-sm text-slate-400">Clients</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-400">{metrics.clientHealth.active}</span>
            <span className="text-sm text-amber-400">{metrics.clientHealth.atRisk} at risk</span>
          </div>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <span className="text-purple-400">📋</span>
            </div>
            <p className="text-sm text-slate-400">Delivery</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-400">{metrics.delivery.tasksCompleted}</span>
            <span className="text-sm text-red-400">{metrics.delivery.tasksDelayed} delayed</span>
          </div>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-600">💰</span>
            </div>
            <p className="text-sm text-slate-400">Finance</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{formatCurrency(metrics.finance.collected)}</span>
            <span className="text-sm text-red-400">{metrics.finance.overduePayments} overdue</span>
          </div>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <span className="text-orange-600">📈</span>
            </div>
            <p className="text-sm text-slate-400">Sales</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-600">{metrics.sales.newLeads}</span>
            <span className="text-sm text-slate-400">new leads</span>
          </div>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
              <span className="text-pink-600">👤</span>
            </div>
            <p className="text-sm text-slate-400">HR</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{metrics.hr.attendance}%</span>
            <span className="text-sm text-slate-400">attendance</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Escalations */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-red-500/10">
            <h2 className="font-semibold text-red-800">Active Escalations ({escalations.length})</h2>
          </div>
          <div className="divide-y divide-white/10">
            {escalations.map((esc, idx) => (
              <div key={`esc-${esc.client}-${idx}`} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-white">{esc.client}</p>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    esc.status === 'OPEN' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {esc.status}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{esc.issue}</p>
                <p className="text-xs text-slate-400 mt-1">Owner: {esc.owner}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Blockers */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-amber-500/10">
            <h2 className="font-semibold text-amber-800">Blockers & Issues ({blockers.length})</h2>
          </div>
          <div className="divide-y divide-white/10">
            {blockers.map((blocker, idx) => (
              <div key={`blocker-${blocker.dept}-${idx}`} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-white">{blocker.dept}</p>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    blocker.impact === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {blocker.impact} IMPACT
                  </span>
                </div>
                <p className="text-sm text-slate-300">{blocker.issue}</p>
              </div>
            ))}
            {blockers.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                No blockers today
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Department Summary */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Department Summary</h2>
        </div>
        <div className="p-4">
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { name: 'SEO', completed: 45, pending: 12, health: 'GOOD' },
              { name: 'Ads', completed: 38, pending: 8, health: 'GOOD' },
              { name: 'Social', completed: 62, pending: 15, health: 'MODERATE' },
              { name: 'Web', completed: 28, pending: 18, health: 'POOR' },
              { name: 'AI', completed: 15, pending: 5, health: 'GOOD' },
            ].map(dept => (
              <div key={dept.name} className="p-3 border border-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-white">{dept.name}</p>
                  <span className={`w-2 h-2 rounded-full ${
                    dept.health === 'GOOD' ? 'bg-green-500' :
                    dept.health === 'MODERATE' ? 'bg-amber-500' :
                    'bg-red-500'
                  }`} />
                </div>
                <div className="text-sm">
                  <p className="text-green-400">{dept.completed} done</p>
                  <p className="text-amber-400">{dept.pending} pending</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
        <h3 className="font-semibold text-purple-800 mb-3">Today&apos;s Action Items</h3>
        <ul className="space-y-2 text-sm text-purple-400">
          <li className="flex items-start gap-2">
            <span className="text-purple-500">1.</span>
            Resolve Apollo Hospitals escalation - Schedule call with client
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500">2.</span>
            Follow up on 8 overdue payments
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500">3.</span>
            Address Web department capacity issue
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500">4.</span>
            Review 18 tasks pending QC
          </li>
        </ul>
      </div>
    </div>
  )
}
