'use client'

interface WonDeal {
  id: string
  company: string
  contact: string
  value: number
  services: string[]
  closedDate: string
  closedBy: string
  contractLength: number
  source: string
  handoverStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
}

const WON_DEALS: WonDeal[] = [
  { id: '1', company: 'Apollo Hospitals', contact: 'Dr. Reddy', value: 150000, services: ['SEO', 'Ads', 'Social'], closedDate: '2024-03-01', closedBy: 'Abhishek', contractLength: 12, source: 'Referral', handoverStatus: 'COMPLETED' },
  { id: '2', company: 'MaxCare Hospital', contact: 'Mr. Kumar', value: 200000, services: ['SEO', 'Ads'], closedDate: '2024-02-15', closedBy: 'Abhishek', contractLength: 12, source: 'Website', handoverStatus: 'COMPLETED' },
  { id: '3', company: 'HealthFirst Labs', contact: 'Ms. Sharma', value: 60000, services: ['Ads', 'Social'], closedDate: '2024-03-05', closedBy: 'Sales Team', contractLength: 6, source: 'LinkedIn', handoverStatus: 'IN_PROGRESS' },
  { id: '4', company: 'CareConnect', contact: 'Dr. Patel', value: 120000, services: ['SEO', 'Ads', 'Web'], closedDate: '2024-02-20', closedBy: 'Abhishek', contractLength: 12, source: 'Cold Outreach', handoverStatus: 'COMPLETED' },
  { id: '5', company: 'MedPlus Clinics', contact: 'Mr. Verma', value: 80000, services: ['SEO', 'Web'], closedDate: '2024-03-08', closedBy: 'Sales Team', contractLength: 6, source: 'Website', handoverStatus: 'PENDING' },
]

export default function ManagerSalesWonPage() {
  const totalValue = WON_DEALS.reduce((sum, d) => sum + d.value, 0)
  const thisMonthDeals = WON_DEALS.filter(d => d.closedDate.startsWith('2024-03')).length
  const avgDealSize = WON_DEALS.length > 0 ? Math.round(totalValue / WON_DEALS.length) : 0
  const pendingHandovers = WON_DEALS.filter(d => d.handoverStatus !== 'COMPLETED').length

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`
    return `${(amount / 1000).toFixed(0)}K`
  }

  const getHandoverColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500/20 text-green-400'
      case 'IN_PROGRESS': return 'bg-amber-500/20 text-amber-400'
      case 'PENDING': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Won Deals</h1>
            <p className="text-green-100">Closed opportunities and new clients</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-green-100 text-sm">Total MRR</p>
              <p className="text-3xl font-bold">{formatCurrency(totalValue)}</p>
            </div>
            <div className="text-right">
              <p className="text-green-100 text-sm">This Month</p>
              <p className="text-3xl font-bold">{thisMonthDeals} deals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total Deals</p>
          <p className="text-3xl font-bold text-green-400">{WON_DEALS.length}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Avg Deal Size</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(avgDealSize)}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total MRR</p>
          <p className="text-3xl font-bold text-emerald-600">{formatCurrency(totalValue)}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Pending Handovers</p>
          <p className="text-3xl font-bold text-amber-400">{pendingHandovers}</p>
        </div>
      </div>

      {/* Won Deals Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Recent Won Deals</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">COMPANY</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">VALUE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">SERVICES</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">CLOSED BY</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">CLOSED DATE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">HANDOVER</th>
            </tr>
          </thead>
          <tbody>
            {WON_DEALS.map(deal => (
              <tr key={deal.id} className="border-b border-white/5 hover:bg-slate-900/40">
                <td className="py-4 px-4">
                  <p className="font-medium text-white">{deal.company}</p>
                  <p className="text-sm text-slate-400">{deal.contact}</p>
                </td>
                <td className="py-4 px-4 text-center">
                  <p className="font-medium text-green-400">{formatCurrency(deal.value)}/mo</p>
                  <p className="text-xs text-slate-400">{deal.contractLength} months</p>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex gap-1 justify-center flex-wrap">
                    {deal.services.map(s => (
                      <span key={s} className="px-2 py-0.5 text-xs bg-slate-800/50 text-slate-300 rounded">{s}</span>
                    ))}
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-sm text-slate-300">{deal.closedBy}</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-sm text-slate-400">
                    {new Date(deal.closedDate).toLocaleDateString('en-IN')}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getHandoverColor(deal.handoverStatus)}`}>
                    {deal.handoverStatus.replace(/_/g, ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
        <h3 className="font-semibold text-green-800 mb-3">Win Analysis</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-green-400">
          <div>
            <p className="font-medium mb-1">Top Sources</p>
            <ul className="space-y-1">
              <li>- Website: 2 deals</li>
              <li>- Referral: 1 deal</li>
              <li>- LinkedIn: 1 deal</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Top Services</p>
            <ul className="space-y-1">
              <li>- SEO: 4 deals</li>
              <li>- Ads: 4 deals</li>
              <li>- Web: 2 deals</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Pending Actions</p>
            <ul className="space-y-1">
              <li>- MedPlus: Start handover process</li>
              <li>- HealthFirst: Complete handover</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
