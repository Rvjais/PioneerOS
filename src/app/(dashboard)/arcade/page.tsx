import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { Avatar } from '@/client/components/ui/Avatar'

async function getArcadeData() {
  const [transactions, rewards, redemptions, users] = await Promise.all([
    prisma.arcadePointTransaction.findMany({
      include: { user: { select: { id: true, firstName: true, lastName: true, department: true, profile: { select: { profilePicture: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.arcadeReward.findMany({
      where: { isActive: true },
      include: { _count: { select: { redemptions: true } } },
      orderBy: { pointsCost: 'asc' },
    }),
    prisma.arcadeRedemption.findMany({
      include: {
        user: { select: { firstName: true, lastName: true } },
        reward: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        department: true,
        role: true,
        email: true,
        profile: { select: { profilePicture: true } },
        arcadeTransactions: { select: { points: true, type: true } },
      },
    }),
  ])
  return { transactions, rewards, redemptions, users }
}

const categoryIcons: Record<string, { icon: string; color: string }> = {
  CERTIFICATION: { icon: 'cert', color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30' },
  TESTIMONIAL: { icon: 'star', color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30' },
  REFERRAL: { icon: 'handshake', color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30' },
  SLA_BREACH: { icon: 'warning', color: 'from-red-500/20 to-rose-500/20 border-red-500/30' },
  POLICY_VIOLATION: { icon: 'ban', color: 'from-red-500/20 to-orange-500/20 border-red-500/30' },
  ATTENDANCE: { icon: 'chart', color: 'from-purple-500/20 to-violet-500/20 border-purple-500/30' },
  PERFORMANCE: { icon: 'trophy', color: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30' },
}

const rewardCategoryIcons: Record<string, string> = {
  GIFT_CARD: 'gift',
  EXPERIENCE: 'ticket',
  GADGET: 'device',
  TIME_OFF: 'beach',
  CUSTOM: 'sparkle',
}

const renderCategoryIcon = (type: string) => {
  const iconClass = "w-5 h-5"
  switch (type) {
    case 'cert':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
    case 'star':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
    case 'handshake':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    case 'warning':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    case 'ban':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
    case 'chart':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    case 'trophy':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
    case 'gift':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
    case 'ticket':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
    case 'device':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
    case 'beach':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    default:
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
  }
}

export default async function ArcadePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { transactions, rewards, redemptions, users } = await getArcadeData()

  // Build leaderboard
  const leaderboard = users.map(u => {
    const earned = u.arcadeTransactions.filter(t => ['EARN', 'BONUS'].includes(t.type)).reduce((s, t) => s + t.points, 0)
    const deducted = u.arcadeTransactions.filter(t => ['DEDUCT', 'PENALTY', 'REDEEM'].includes(t.type)).reduce((s, t) => s + t.points, 0)
    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      name: `${u.firstName} ${u.lastName || ''}`.trim(),
      department: u.department,
      role: u.role,
      email: u.email,
      profile: u.profile,
      earned,
      spent: deducted,
      balance: earned - deducted,
    }
  }).sort((a, b) => b.balance - a.balance)

  // Current user stats
  const currentUserStats = leaderboard.find(u => u.id === session.user.id)
  const currentUserRank = leaderboard.findIndex(u => u.id === session.user.id) + 1

  // Monthly stats
  const now = new Date()
  const thisMonthTxns = transactions.filter(t => {
    const txnDate = new Date(t.createdAt)
    return txnDate.getMonth() === now.getMonth() && txnDate.getFullYear() === now.getFullYear()
  })
  const monthlyEarned = thisMonthTxns.filter(t => ['EARN', 'BONUS'].includes(t.type)).reduce((s, t) => s + t.points, 0)
  const monthlyDeducted = thisMonthTxns.filter(t => ['DEDUCT', 'PENALTY'].includes(t.type)).reduce((s, t) => s + Math.abs(t.points), 0)

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ARCADE Points
          </h1>
          <p className="text-slate-400 mt-1">Earn, track, and redeem your achievement points</p>
        </div>
        <button className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-none hover:shadow-amber-500/20 transition-all flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg> Rewards Store
        </button>
      </div>

      {/* Personal Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-4">
          <p className="text-3xl font-bold text-amber-400">{currentUserStats?.balance || 0}</p>
          <p className="text-sm text-slate-400">Your Balance</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">#{currentUserRank || '-'}</p>
          <p className="text-sm text-slate-400">Your Rank</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <p className="text-3xl font-bold text-emerald-400">+{monthlyEarned}</p>
          <p className="text-sm text-slate-400">Earned This Month</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <p className="text-3xl font-bold text-red-400">-{monthlyDeducted}</p>
          <p className="text-sm text-slate-400">Deducted This Month</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                Leaderboard
              </h2>
            </div>
            <div className="divide-y divide-white/5">
              {leaderboard.slice(0, 15).map((user, i) => (
                <div key={user.id} className={`flex items-center gap-4 p-4 ${user.id === session.user.id ? 'bg-blue-500/5' : 'hover:bg-white/5'} transition-colors`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-500/20 text-amber-400' :
                      i === 1 ? 'bg-white/20 text-slate-300' :
                        i === 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-white/5 backdrop-blur-sm text-slate-400'
                    }`}>
                    {i + 1}
                  </div>
                  <Avatar
                    src={user.profile?.profilePicture}
                    name={user.name}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-400">{user.balance} pts</p>
                    <p className="text-xs text-slate-400">{user.earned} earned</p>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div className="p-8 text-center text-slate-400">No points data yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Rewards Store + Recent Activity */}
        <div className="space-y-4">
          {/* Rewards */}
          <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
              Available Rewards
            </h3>
            <div className="space-y-3">
              {rewards.length === 0 ? (
                <p className="text-center text-slate-400 py-4">No rewards available yet</p>
              ) : (
                rewards.map((reward) => (
                  <div key={reward.id} className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-white/10 text-amber-400">
                      {renderCategoryIcon(rewardCategoryIcons[reward.category] || 'sparkle')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{reward.name}</p>
                      <p className="text-xs text-slate-400">{reward._count.redemptions} redeemed</p>
                    </div>
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-xs font-bold">
                      {reward.pointsCost} pts
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Earning Rules */}
          <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              How to Earn
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-300 flex items-center gap-2">{renderCategoryIcon('cert')} Get certified</span>
                <span className="text-emerald-400 font-medium">+50</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-300 flex items-center gap-2">{renderCategoryIcon('star')} Client testimonial</span>
                <span className="text-emerald-400 font-medium">+30</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-300 flex items-center gap-2">{renderCategoryIcon('handshake')} Employee referral</span>
                <span className="text-emerald-400 font-medium">+100</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-300 flex items-center gap-2">{renderCategoryIcon('chart')} Perfect attendance</span>
                <span className="text-emerald-400 font-medium">+20</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-300 flex items-center gap-2">{renderCategoryIcon('trophy')} Top performer</span>
                <span className="text-emerald-400 font-medium">+75</span>
              </div>
              <div className="border-t border-white/10 pt-2 mt-2">
                <p className="text-xs text-red-400/80 font-medium mb-1">Deductions:</p>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-2">{renderCategoryIcon('warning')} SLA breach</span>
                  <span className="text-red-400 font-medium">-25</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-2">{renderCategoryIcon('ban')} Policy violation</span>
                  <span className="text-red-400 font-medium">-50</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              Recent Activity
            </h3>
            <div className="space-y-2">
              {transactions.slice(0, 10).map((txn) => {
                const config = categoryIcons[txn.category] || { icon: 'sparkle', color: 'from-slate-500/20 to-gray-500/20 border-slate-500/30' }
                const isEarning = ['EARN', 'BONUS'].includes(txn.type)
                return (
                  <div key={txn.id} className="flex items-center gap-3 py-2">
                    <span className="text-slate-400">{renderCategoryIcon(config.icon)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{txn.reason}</p>
                      <p className="text-[10px] text-slate-400">{txn.user.firstName} • {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <span className={`text-sm font-bold ${isEarning ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isEarning ? '+' : '-'}{Math.abs(txn.points)}
                    </span>
                  </div>
                )
              })}
              {transactions.length === 0 && (
                <p className="text-center text-slate-400 py-4">No transactions yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
