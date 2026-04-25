import prisma from '@/server/db/prisma'
import { requirePageAuth, SALES_ACCESS } from '@/server/auth/pageAuth'
import Link from 'next/link'

async function getReportData(userId: string, role: string) {
  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(role)
  const userFilter = isManager ? {} : { assignedToId: userId }
  const dealUserFilter = isManager ? {} : { userId }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)

  const [
    thisMonthDeals, lastMonthDeals, quarterDeals,
    thisMonthLeads, lastMonthLeads,
    activities, proposals, handovers,
  ] = await Promise.all([
    prisma.salesDeal.findMany({
      where: { ...dealUserFilter, createdAt: { gte: startOfMonth } },
      include: { user: { select: { firstName: true, lastName: true } }, lead: { select: { companyName: true, source: true } } },
    }),
    prisma.salesDeal.findMany({
      where: { ...dealUserFilter, createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
    }),
    prisma.salesDeal.findMany({
      where: { ...dealUserFilter, createdAt: { gte: startOfQuarter } },
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
    prisma.lead.findMany({
      where: { ...userFilter, createdAt: { gte: startOfMonth } },
      select: { id: true, source: true, stage: true, leadPriority: true },
    }),
    prisma.lead.findMany({
      where: { ...userFilter, createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
      select: { id: true },
    }),
    prisma.leadActivity.findMany({
      where: { ...(isManager ? {} : { userId }), createdAt: { gte: startOfMonth } },
      select: { type: true, userId: true },
    }),
    prisma.proposal.findMany({
      where: { createdAt: { gte: startOfMonth } },
      select: { id: true, status: true, value: true },
    }),
    prisma.salesHandover.findMany({
      where: { createdAt: { gte: startOfMonth } },
      select: { id: true, status: true, dealValue: true },
    }),
  ])

  return {
    thisMonthDeals, lastMonthDeals, quarterDeals,
    thisMonthLeads, lastMonthLeads,
    activities, proposals, handovers,
  }
}

export default async function SalesReportsPage() {
  const session = await requirePageAuth(SALES_ACCESS)
  const data = await getReportData(session.user.id, session.user.role)

  const {
    thisMonthDeals, lastMonthDeals, quarterDeals,
    thisMonthLeads, lastMonthLeads,
    activities, proposals, handovers,
  } = data

  // This month vs last month comparisons
  const thisMonthWon = thisMonthDeals.filter(d => d.status === 'WON')
  const lastMonthWon = lastMonthDeals.filter(d => d.status === 'WON')
  const thisMonthRevenue = thisMonthWon.reduce((s, d) => s + (d.dealValue || 0), 0)
  const lastMonthRevenue = lastMonthWon.reduce((s, d) => s + (d.dealValue || 0), 0)
  const revenueGrowth = lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0

  const leadGrowth = lastMonthLeads.length > 0
    ? Math.round(((thisMonthLeads.length - lastMonthLeads.length) / lastMonthLeads.length) * 100) : 0

  // Activity breakdown
  const callCount = activities.filter(a => a.type === 'CALL').length
  const emailCount = activities.filter(a => a.type === 'EMAIL').length
  const meetingCount = activities.filter(a => a.type === 'MEETING').length

  // Quarter totals
  const quarterWon = quarterDeals.filter(d => d.status === 'WON')
  const quarterRevenue = quarterWon.reduce((s, d) => s + (d.dealValue || 0), 0)

  // Proposal stats
  const proposalsSent = proposals.filter(p => p.status === 'SENT' || p.status === 'VIEWED' || p.status === 'ACCEPTED').length
  const proposalsAccepted = proposals.filter(p => p.status === 'ACCEPTED').length
  const proposalConversion = proposalsSent > 0 ? Math.round((proposalsAccepted / proposalsSent) * 100) : 0

  // Handover stats
  const completedHandovers = handovers.filter(h => h.status === 'COMPLETED').length
  const pendingHandovers = handovers.filter(h => h.status !== 'COMPLETED').length

  // Source performance
  const sourceMap = new Map<string, { total: number; won: number }>()
  for (const lead of thisMonthLeads) {
    const source = lead.source || 'Unknown'
    const existing = sourceMap.get(source) || { total: 0, won: 0 }
    existing.total++
    if (lead.stage === 'WON') existing.won++
    sourceMap.set(source, existing)
  }
  const sourcePerformance = Array.from(sourceMap.entries())
    .map(([source, data]) => ({ source: source.replace(/_/g, ' '), ...data }))
    .sort((a, b) => b.total - a.total)

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
    return `₹${amount}`
  }

  const monthName = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Reports</h1>
          <p className="text-slate-400 mt-1">{monthName} — Monthly performance summary</p>
        </div>
        <Link href="/sales/analytics" className="px-4 py-2 border border-white/20 text-slate-200 rounded-xl hover:bg-slate-900/40 transition-colors">
          Detailed Analytics
        </Link>
      </div>

      {/* Month-over-Month Comparison */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-xs text-slate-400">Monthly Revenue</p>
          <p className="text-3xl font-bold text-green-400 mt-1">{formatCurrency(thisMonthRevenue)}</p>
          <p className={`text-xs mt-1 ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-400'}`}>
            {revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(revenueGrowth)}% vs last month
          </p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-xs text-slate-400">New Leads</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{thisMonthLeads.length}</p>
          <p className={`text-xs mt-1 ${leadGrowth >= 0 ? 'text-green-500' : 'text-red-400'}`}>
            {leadGrowth >= 0 ? '↑' : '↓'} {Math.abs(leadGrowth)}% vs last month
          </p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-xs text-slate-400">Deals Closed</p>
          <p className="text-3xl font-bold text-purple-400 mt-1">{thisMonthWon.length}</p>
          <p className="text-xs text-slate-500 mt-1">{thisMonthDeals.filter(d => d.status === 'LOST').length} lost</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-xs text-slate-400">Quarter Revenue</p>
          <p className="text-3xl font-bold text-orange-400 mt-1">{formatCurrency(quarterRevenue)}</p>
          <p className="text-xs text-slate-500 mt-1">{quarterWon.length} deals this quarter</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Activity Report */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Activity Report</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-green-500/10 rounded-xl">
                <p className="text-2xl font-bold text-green-400">{callCount}</p>
                <p className="text-xs text-slate-400">Calls</p>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-xl">
                <p className="text-2xl font-bold text-blue-400">{emailCount}</p>
                <p className="text-xs text-slate-400">Emails</p>
              </div>
              <div className="text-center p-3 bg-purple-500/10 rounded-xl">
                <p className="text-2xl font-bold text-purple-400">{meetingCount}</p>
                <p className="text-xs text-slate-400">Meetings</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Proposals Sent</span>
                  <span className="text-white">{proposalsSent}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Proposals Accepted</span>
                  <span className="text-green-400">{proposalsAccepted} ({proposalConversion}%)</span>
                </div>
              </div>
              <div className="pt-3 border-t border-white/5">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Handovers Completed</span>
                  <span className="text-green-400">{completedHandovers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Handovers Pending</span>
                  <span className="text-yellow-400">{pendingHandovers}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Source Performance */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Lead Source Performance</h2>
          </div>
          <div className="divide-y divide-white/5">
            {sourcePerformance.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No leads this month</div>
            ) : (
              sourcePerformance.map(source => (
                <div key={source.source} className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">{source.source}</p>
                    <p className="text-xs text-slate-400">{source.total} leads</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-green-400">{source.won} won</span>
                    <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${source.total > 0 ? (source.won / source.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Won Deals */}
      {thisMonthWon.length > 0 && (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Won Deals This Month</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-3 text-xs text-slate-400">Company</th>
                  <th className="text-left p-3 text-xs text-slate-400">Sales Rep</th>
                  <th className="text-left p-3 text-xs text-slate-400">Source</th>
                  <th className="text-right p-3 text-xs text-slate-400">Deal Value</th>
                  <th className="text-right p-3 text-xs text-slate-400">Closed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {thisMonthWon.map(deal => (
                  <tr key={deal.id} className="hover:bg-slate-900/40">
                    <td className="p-3 text-white font-medium">{deal.lead?.companyName || '-'}</td>
                    <td className="p-3 text-slate-300">{deal.user.firstName} {deal.user.lastName || ''}</td>
                    <td className="p-3 text-slate-300">{deal.lead?.source?.replace(/_/g, ' ') || '-'}</td>
                    <td className="p-3 text-right text-green-400 font-medium">{formatCurrency(deal.dealValue || 0)}</td>
                    <td className="p-3 text-right text-slate-400">
                      {deal.closedAt ? new Date(deal.closedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
