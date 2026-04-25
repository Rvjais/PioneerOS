import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getAchievements(userId: string, isManager: boolean) {
  const currentMonth = new Date()
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)

  const whereClause: Record<string, unknown> = isManager
    ? { month: monthStart }
    : { userId, month: monthStart }

  return prisma.achievement.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          department: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

async function getStats(userId: string) {
  const achievements = await prisma.achievement.findMany({
    where: { userId, status: 'APPROVED' },
  })

  const totalPoints = achievements.reduce((sum, a) => sum + a.pointsAwarded, 0)
  const totalIncentive = achievements.reduce((sum, a) => sum + (a.incentiveValue || 0), 0)

  return { totalAchievements: achievements.length, totalPoints, totalIncentive }
}

const ACHIEVEMENT_ICONS: Record<string, string> = {
  CLIENT_APPRECIATION: 'chat',
  GOOGLE_REVIEW: 'star',
  VIDEO_TESTIMONIAL: 'video',
  EMPLOYEE_REFERRAL: 'users',
  CLIENT_REFERRAL: 'handshake',
  SALE_CLOSED: 'currency',
  ATTENDANCE_PERFECT: 'calendar',
  GOAL_ACHIEVEMENT: 'target',
  BP_CONTENT: 'film',
}

const renderAchievementIcon = (iconType: string, className: string = "w-8 h-8") => {
  switch (iconType) {
    case 'chat':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
    case 'star':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
    case 'video':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
    case 'users':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    case 'handshake':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>
    case 'currency':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    case 'calendar':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    case 'target':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    case 'film':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
    default:
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
  }
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  APPROVED: 'bg-green-500/20 text-green-400',
  REJECTED: 'bg-red-500/20 text-red-400',
}

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(session.user.role)
  const [achievements, stats] = await Promise.all([
    getAchievements(session.user.id, isManager),
    getStats(session.user.id),
  ])

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Achievements</h1>
          <p className="text-slate-400 mt-1">Your recognitions and rewards</p>
        </div>
        <Link
          href="/performance"
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          View Leaderboard
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-4xl font-bold">{stats.totalPoints}</p>
          <p className="text-indigo-100">Total Points Earned</p>
        </div>
        <div className="glass-card rounded-2xl border border-white/10 p-6">
          <p className="text-4xl font-bold text-white">{stats.totalAchievements}</p>
          <p className="text-slate-400">Total Achievements</p>
        </div>
        <div className="glass-card rounded-2xl border border-white/10 p-6">
          <p className="text-4xl font-bold text-green-400">
            ₹{stats.totalIncentive.toLocaleString('en-IN')}
          </p>
          <p className="text-slate-400">Total Incentives Earned</p>
        </div>
      </div>

      {/* Achievement Types Guide */}
      <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-4">
        <h3 className="font-semibold text-amber-800 mb-2">How to Earn Points</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm text-amber-400">
          <div className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> Client Appreciation: +2 pts</div>
          <div className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> Google Review: +5 pts</div>
          <div className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Video Testimonial: +10 pts</div>
          <div className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Employee Referral: +50 pts</div>
          <div className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg> Client Referral: +20 pts</div>
        </div>
      </div>

      {/* Achievements List */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {isManager ? 'All Team Achievements' : 'Your Achievements'}
          </h2>
        </div>
        <div className="divide-y divide-white/10">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="p-4 hover:bg-slate-900/40">
              <div className="flex items-start gap-4">
                <span>{renderAchievementIcon(ACHIEVEMENT_ICONS[achievement.type] || 'default', 'w-8 h-8 text-indigo-500')}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white">{achievement.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[achievement.status]}`}>
                      {achievement.status}
                    </span>
                  </div>
                  {achievement.description && (
                    <p className="text-sm text-slate-400 mb-2">{achievement.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    {isManager && (
                      <span className="font-medium">
                        {achievement.user.firstName} {achievement.user.lastName || ''} • {achievement.user.department}
                      </span>
                    )}
                    {achievement.client && <span>Client: {achievement.client.name}</span>}
                    <span>{new Date(achievement.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-indigo-600">+{achievement.pointsAwarded}</span>
                  <p className="text-xs text-slate-400">points</p>
                  {achievement.incentiveValue && (
                    <p className="text-sm text-green-400 font-medium mt-1">
                      ₹{achievement.incentiveValue.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {achievements.length === 0 && (
            <div className="p-12 text-center">
              <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <p className="text-slate-400">No achievements recorded yet this month</p>
              <p className="text-sm text-slate-400 mt-1">Get client appreciations, testimonials, or referrals to earn points!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
