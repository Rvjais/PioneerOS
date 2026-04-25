'use client'

interface PaymentDelay {
  id: string
  client: string
  invoiceNumber: string
  amount: number
  dueDate: string
  daysOverdue: number
  reason: 'BUDGET_CONSTRAINTS' | 'DISPUTE' | 'PROCESS_DELAY' | 'NO_RESPONSE' | 'UNKNOWN'
  lastContact: string
  escalationLevel: 'NONE' | 'LEVEL_1' | 'LEVEL_2' | 'LEGAL'
  assignedTo: string
  actionTaken: string
}

const PAYMENT_DELAYS: PaymentDelay[] = [
  { id: '1', client: 'MedPlus Clinics', invoiceNumber: 'INV-2024-003', amount: 80000, dueDate: '2024-03-05', daysOverdue: 6, reason: 'BUDGET_CONSTRAINTS', lastContact: '2024-03-09', escalationLevel: 'LEVEL_1', assignedTo: 'Anita', actionTaken: 'Offered payment plan' },
  { id: '2', client: 'CareConnect', invoiceNumber: 'INV-2024-005', amount: 120000, dueDate: '2024-03-01', daysOverdue: 10, reason: 'DISPUTE', lastContact: '2024-03-07', escalationLevel: 'LEVEL_2', assignedTo: 'Vikram', actionTaken: 'Escalated to management, meeting scheduled' },
  { id: '3', client: 'WellnessHub', invoiceNumber: 'INV-2024-010', amount: 45000, dueDate: '2024-02-25', daysOverdue: 14, reason: 'NO_RESPONSE', lastContact: '2024-03-05', escalationLevel: 'LEVEL_1', assignedTo: 'Anita', actionTaken: 'Multiple follow-ups, no response' },
]

export default function ManagerAccountsPaymentDelaysPage() {
  const totalOverdue = PAYMENT_DELAYS.reduce((sum, d) => sum + d.amount, 0)
  const avgDaysOverdue = PAYMENT_DELAYS.length > 0 ? Math.round(PAYMENT_DELAYS.reduce((sum, d) => sum + d.daysOverdue, 0) / PAYMENT_DELAYS.length) : 0
  const criticalCount = PAYMENT_DELAYS.filter(d => d.daysOverdue > 10).length

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`
    return `${(amount / 1000).toFixed(0)}K`
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'BUDGET_CONSTRAINTS': return 'bg-amber-500/20 text-amber-400'
      case 'DISPUTE': return 'bg-red-500/20 text-red-400'
      case 'PROCESS_DELAY': return 'bg-blue-500/20 text-blue-400'
      case 'NO_RESPONSE': return 'bg-slate-800/50 text-slate-200'
      case 'UNKNOWN': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getEscalationColor = (level: string) => {
    switch (level) {
      case 'NONE': return 'bg-green-500/20 text-green-400'
      case 'LEVEL_1': return 'bg-amber-500/20 text-amber-400'
      case 'LEVEL_2': return 'bg-orange-500/20 text-orange-400'
      case 'LEGAL': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Payment Delays</h1>
            <p className="text-red-100">Overdue payments requiring attention</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-red-100 text-sm">Total Overdue</p>
              <p className="text-3xl font-bold">{formatCurrency(totalOverdue)}</p>
            </div>
            <div className="text-right">
              <p className="text-red-100 text-sm">Critical</p>
              <p className="text-3xl font-bold">{criticalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total Overdue</p>
          <p className="text-3xl font-bold text-red-400">{formatCurrency(totalOverdue)}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Delayed Accounts</p>
          <p className="text-3xl font-bold text-white">{PAYMENT_DELAYS.length}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Avg Days Overdue</p>
          <p className="text-3xl font-bold text-amber-400">{avgDaysOverdue}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Critical (&gt;10 days)</p>
          <p className="text-3xl font-bold text-red-400">{criticalCount}</p>
        </div>
      </div>

      {/* Delays Table */}
      <div className="space-y-4">
        {PAYMENT_DELAYS.map(delay => (
          <div key={delay.id} className={`glass-card rounded-xl border-2 p-4 ${delay.daysOverdue > 10 ? 'border-red-300' : 'border-white/10'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{delay.client}</h3>
                  {delay.daysOverdue > 10 && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded">CRITICAL</span>
                  )}
                </div>
                <p className="text-sm text-slate-400">{delay.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-400">{formatCurrency(delay.amount)}</p>
                <p className="text-sm text-red-500">{delay.daysOverdue} days overdue</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-3">
              <div>
                <p className="text-xs text-slate-400">Reason</p>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getReasonColor(delay.reason)}`}>
                  {delay.reason.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400">Escalation</p>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getEscalationColor(delay.escalationLevel)}`}>
                  {delay.escalationLevel.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400">Assigned To</p>
                <p className="text-sm font-medium text-white">{delay.assignedTo}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Last Contact</p>
                <p className="text-sm text-slate-300">{new Date(delay.lastContact).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            <div className="bg-slate-900/40 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Action Taken</p>
              <p className="text-sm text-slate-200">{delay.actionTaken}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Escalation Guidelines */}
      <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
        <h3 className="font-semibold text-red-800 mb-3">Escalation Guidelines</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-red-400">
          <div>
            <p className="font-medium mb-1">Level 1 (1-7 days)</p>
            <ul className="space-y-1">
              <li>- Email reminders</li>
              <li>- Phone follow-up</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Level 2 (8-14 days)</p>
            <ul className="space-y-1">
              <li>- Manager involvement</li>
              <li>- Payment plan offer</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Level 3 (15-30 days)</p>
            <ul className="space-y-1">
              <li>- Service pause warning</li>
              <li>- Leadership escalation</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Legal (30+ days)</p>
            <ul className="space-y-1">
              <li>- Legal notice</li>
              <li>- Service termination</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
