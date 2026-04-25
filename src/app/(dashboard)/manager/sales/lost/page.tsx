'use client'

interface LostDeal {
  id: string
  company: string
  contact: string
  value: number
  services: string[]
  lostDate: string
  lostStage: string
  reason: 'BUDGET' | 'COMPETITOR' | 'NO_RESPONSE' | 'TIMING' | 'OTHER'
  owner: string
  notes: string
}

const LOST_DEALS: LostDeal[] = [
  { id: '1', company: 'City Hospital', contact: 'Dr. Joshi', value: 100000, services: ['SEO', 'Ads'], lostDate: '2024-03-05', lostStage: 'PROPOSAL_SHARED', reason: 'BUDGET', owner: 'Abhishek', notes: 'Budget was cut due to new equipment purchase' },
  { id: '2', company: 'Metro Clinic', contact: 'Mr. Kapoor', value: 75000, services: ['Social'], lostDate: '2024-02-28', lostStage: 'FOLLOW_UP', reason: 'COMPETITOR', owner: 'Sales Team', notes: 'Went with a cheaper agency' },
  { id: '3', company: 'Prime Diagnostics', contact: 'Ms. Nair', value: 60000, services: ['SEO', 'Web'], lostDate: '2024-03-02', lostStage: 'RFP_SENT', reason: 'NO_RESPONSE', owner: 'Sales Team', notes: 'No response after multiple follow-ups' },
  { id: '4', company: 'Wellness Center', contact: 'Dr. Kumar', value: 90000, services: ['Ads', 'Social'], lostDate: '2024-02-20', lostStage: 'MEETING_SCHEDULED', reason: 'TIMING', owner: 'Abhishek', notes: 'Want to start next quarter instead' },
]

export default function ManagerSalesLostPage() {
  const totalLostValue = LOST_DEALS.reduce((sum, d) => sum + d.value, 0)
  const thisMonthLost = LOST_DEALS.filter(d => d.lostDate.startsWith('2024-03')).length

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`
    return `${(amount / 1000).toFixed(0)}K`
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'BUDGET': return 'bg-amber-500/20 text-amber-400'
      case 'COMPETITOR': return 'bg-red-500/20 text-red-400'
      case 'NO_RESPONSE': return 'bg-slate-800/50 text-slate-200'
      case 'TIMING': return 'bg-blue-500/20 text-blue-400'
      case 'OTHER': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  // Count reasons
  const reasonCounts: Record<string, number> = {}
  LOST_DEALS.forEach(d => {
    reasonCounts[d.reason] = (reasonCounts[d.reason] || 0) + 1
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Lost Deals</h1>
            <p className="text-red-100">Analysis of lost opportunities</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-red-100 text-sm">Lost Value</p>
              <p className="text-3xl font-bold">{formatCurrency(totalLostValue)}</p>
            </div>
            <div className="text-right">
              <p className="text-red-100 text-sm">This Month</p>
              <p className="text-3xl font-bold">{thisMonthLost} deals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reason Stats */}
      <div className="grid grid-cols-5 gap-4">
        {['BUDGET', 'COMPETITOR', 'NO_RESPONSE', 'TIMING', 'OTHER'].map(reason => (
          <div key={reason} className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-sm text-slate-400">{reason.replace(/_/g, ' ')}</p>
            <p className="text-3xl font-bold text-white">{reasonCounts[reason] || 0}</p>
          </div>
        ))}
      </div>

      {/* Lost Deals Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Lost Deals Detail</h2>
        </div>
        <div className="divide-y divide-white/10">
          {LOST_DEALS.map(deal => (
            <div key={deal.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-white">{deal.company}</p>
                  <p className="text-sm text-slate-400">{deal.contact}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-400">{formatCurrency(deal.value)}/mo</p>
                  <p className="text-xs text-slate-400">Lost at {deal.lostStage.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getReasonColor(deal.reason)}`}>
                  {deal.reason.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-400">Owner: {deal.owner}</span>
                <span className="text-xs text-slate-400">
                  Lost: {new Date(deal.lostDate).toLocaleDateString('en-IN')}
                </span>
              </div>
              <p className="text-sm text-slate-300 bg-slate-900/40 p-2 rounded">
                {deal.notes}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Loss Analysis */}
      <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
        <h3 className="font-semibold text-red-800 mb-3">Loss Analysis & Learnings</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-red-400">
          <div>
            <p className="font-medium mb-1">Key Patterns</p>
            <ul className="space-y-1">
              <li>- Budget is #1 reason (25%)</li>
              <li>- Competitor pricing undercuts</li>
              <li>- Follow-up gaps causing losses</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Recommendations</p>
            <ul className="space-y-1">
              <li>- Create flexible pricing tiers</li>
              <li>- Improve follow-up automation</li>
              <li>- Competitive analysis needed</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Win-Back Opportunities</p>
            <ul className="space-y-1">
              <li>- Wellness Center: Follow up Q2</li>
              <li>- City Hospital: Budget may restore</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
