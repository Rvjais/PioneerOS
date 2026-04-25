import prisma from '@/server/db/prisma'
import { requirePageAuth, SALES_ACCESS } from '@/server/auth/pageAuth'
import Link from 'next/link'

async function getPerformanceData(userId: string, role: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(role)
  const goalWhere = isManager ? {} : { userId }

  const [goals, leads, deals, activities] = await Promise.all([
    prisma.tacticalGoal.findMany({
      where: { ...goalWhere, month: { gte: startOfMonth, lt: endOfMonth } },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { priority: 'desc' },
    }),
    prisma.lead.findMany({
      where: isManager ? {} : { assignedToId: userId },
      select: { id: true, stage: true, value: true, wonAt: true, assignedToId: true, updatedAt: true,
        assignedTo: { select: { id: true, firstName: true, lastName: true } }
      },
    }),
    prisma.salesDeal.findMany({
      where: {
        ...(isManager ? {} : { userId }),
        createdAt: { gte: startOfMonth },
      },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    }),
    prisma.leadActivity.findMany({
      where: {
        ...(isManager ? {} : { userId }),
        createdAt: { gte: startOfMonth },
      },
      select: { id: true, type: true, userId: true },
    }),
  ])

  return { goals, leads, deals, activities }
}

export default async function SalesPerformancePage() {
  const session = await requirePageAuth(SALES_ACCESS)
  const { goals, leads, deals, activities } = await getPerformanceData(session.user.id, session.user.role)

  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(session.user.role)

  // Goal stats
  const totalGoals = goals.length
  const achievedGoals = goals.filter(g => g.status === 'ACHIEVED').length
  const achievementRate = totalGoals > 0 ? Math.round((achievedGoals / totalGoals) * 100) : 0

  // Deal stats
  const wonDeals = deals.filter(d => d.status === 'WON')
  const lostDeals = deals.filter(d => d.status === 'LOST')
  const winRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0
  const totalRevenue = wonDeals.reduce((sum, d) => sum + (d.dealValue || 0), 0)

  // Activity stats
  const callCount = activities.filter(a => a.type === 'CALL').length
  const meetingCount = activities.filter(a => a.type === 'MEETING').length
  const emailCount = activities.filter(a => a.type === 'EMAIL').length

  // Leaderboard (group by user)
  const repMap = new Map<string, { name: string; won: number; revenue: number; activities: number }>()
  for (const deal of wonDeals) {
    const uid = deal.userId
    const name = `${deal.user.firstName} ${deal.user.lastName || ''}`.trim()
    const existing = repMap.get(uid) || { name, won: 0, revenue: 0, activities: 0 }
    existing.won += 1
    existing.revenue += deal.dealValue || 0
    repMap.set(uid, existing)
  }
  for (const act of activities) {
    const uid = act.userId
    const existing = repMap.get(uid)
    if (existing) existing.activities += 1
  }
  const leaderboard = Array.from(repMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
    return `₹${amount}`
  }

  const priorityColors: Record<string, string> = {
    HIGH: 'text-red-400 bg-red-500/10',
    MEDIUM: 'text-yellow-400 bg-yellow-500/10',
    LOW: 'text-slate-400 bg-slate-500/10',
  }

  const statusColors: Record<string, string> = {
    IN_PROGRESS: 'text-blue-400 bg-blue-500/10',
    ACHIEVED: 'text-green-400 bg-green-500/10',
    MISSED: 'text-red-400 bg-red-500/10',
    CANCELLED: 'text-slate-400 bg-slate-500/10',
  }

  const categoryIcons: Record<string, string> = {
    GROWTH: '📈',
    QUALITY: '⭐',
    EFFICIENCY: '⚡',
    CLIENT_SATISFACTION: '🤝',
    LEARNING: '📚',
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Performance</h1>
          <p className="text-slate-400 mt-1">
            {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} — Goals, metrics & leaderboard
          </p>
        </div>
        {isManager && (
          <Link
            href="/sales/performance/goals"
            className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            Manage Goals
          </Link>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Win Rate</p>
          <p className="text-3xl font-bold text-green-400 mt-1">{winRate}%</p>
          <p className="text-xs text-slate-500 mt-1">{wonDeals.length}W / {lostDeals.length}L this month</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Revenue Won</p>
          <p className="text-3xl font-bold text-purple-400 mt-1">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-slate-500 mt-1">{wonDeals.length} deals closed</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Goal Achievement</p>
          <p className="text-3xl font-bold text-orange-400 mt-1">{achievementRate}%</p>
          <p className="text-xs text-slate-500 mt-1">{achievedGoals}/{totalGoals} goals met</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Activities</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{activities.length}</p>
          <p className="text-xs text-slate-500 mt-1">{callCount} calls · {meetingCount} meetings · {emailCount} emails</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Goals */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold text-white">Current Goals</h2>
            <Link href="/sales/performance/goals" className="text-xs text-orange-400 hover:underline">
              {isManager ? 'Manage All' : 'View All'}
            </Link>
          </div>
          <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
            {goals.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                No goals set for this month
              </div>
            ) : (
              goals.slice(0, 8).map((goal) => {
                const progress = goal.targetValue && goal.currentValue
                  ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
                  : 0
                return (
                  <div key={goal.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{categoryIcons[goal.category] || '🎯'}</span>
                        <div>
                          <p className="font-medium text-white text-sm">{goal.title}</p>
                          {isManager && (
                            <p className="text-xs text-slate-500">{goal.user.firstName} {goal.user.lastName || ''}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${priorityColors[goal.priority] || ''}`}>
                          {goal.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${statusColors[goal.status] || ''}`}>
                          {goal.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {goal.targetValue ? (
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>{goal.currentValue || 0} / {goal.targetValue}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              goal.status === 'ACHIEVED' ? 'bg-green-500' :
                              progress >= 75 ? 'bg-orange-500' :
                              progress >= 50 ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      goal.description && (
                        <p className="text-xs text-slate-400">{goal.description}</p>
                      )
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold text-white">Leaderboard</h2>
            <span className="text-xs text-slate-400">This month</span>
          </div>
          <div className="divide-y divide-white/5">
            {leaderboard.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                No deals closed this month yet
              </div>
            ) : (
              leaderboard.map((rep, index) => (
                <div key={rep.id} className="p-4 flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    index === 1 ? 'bg-slate-400/20 text-slate-300' :
                    index === 2 ? 'bg-orange-700/20 text-orange-400' :
                    'bg-slate-800/50 text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{rep.name}</p>
                    <p className="text-xs text-slate-400">{rep.won} deals · {rep.activities} activities</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-400">{formatCurrency(rep.revenue)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
