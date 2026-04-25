'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

interface LeaderboardEntry {
  rank: number
  id: string
  user: {
    id: string
    empId: string
    firstName: string
    lastName: string | null
    department: string
    role: string
    profile?: { profilePicture: string | null } | null
  }
  unitScore: number
  growthScore: number
  finalScore: number
  deliveredUnits: number
  expectedUnits: number
  goalsAchieved: number
  totalGoals: number
  achievements: {
    count: number
    points: number
  }
  hasVideoTestimonial: boolean
}

interface Achievement {
  id: string
  type: string
  title: string
  description: string | null
  pointsAwarded: number
  user: {
    firstName: string
    lastName: string | null
    department: string
  }
  client: { name: string } | null
  createdAt: string
}

interface LeaderboardClientProps {
  leaderboard: LeaderboardEntry[]
  topPerformers: {
    topScores: Array<{
      user: {
        id: string
        firstName: string
        lastName: string | null
        department: string
        profile?: { profilePicture: string | null } | null
      }
      finalScore: number
      userId?: string
    }>
    topAchievers: Array<{
      user: {
        id: string
        firstName: string
        lastName: string | null
        department: string
        profile?: { profilePicture: string | null } | null
      } | undefined
      points: number
    }>
  }
  recentAchievements: Achievement[]
  departmentStats: Array<{
    department: string
    averageScore: number
    employeeCount: number
  }>
  currentMonth: string
  isManager: boolean
  testimonialUserIds?: string[]
}

const ACHIEVEMENT_ICONS: Record<string, string> = {
  CLIENT_APPRECIATION: 'chat',
  GOOGLE_REVIEW: 'star',
  VIDEO_TESTIMONIAL: 'film',
  EMPLOYEE_REFERRAL: 'users',
  CLIENT_REFERRAL: 'handshake',
  SALE_CLOSED: 'currency',
  ATTENDANCE_PERFECT: 'calendar',
  GOAL_ACHIEVEMENT: 'target',
  BP_CONTENT: 'video',
}

const renderAchievementIcon = (iconType: string, className: string = "w-6 h-6") => {
  switch (iconType) {
    case 'chat':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
    case 'star':
      return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
    case 'film':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
    case 'users':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    case 'handshake':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    case 'currency':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    case 'calendar':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    case 'target':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
    case 'video':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
    case 'trophy':
      return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
    default:
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
  }
}

const renderMedalIcon = (position: number, className: string = "w-6 h-6") => {
  const colors = ['text-yellow-400', 'text-slate-300', 'text-amber-400']
  const color = colors[position] || 'text-slate-400'
  return (
    <svg className={`${className} ${color}`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

const DEPARTMENT_COLORS: Record<string, string> = {
  OPERATIONS: 'bg-purple-500/20 text-purple-400',
  SEO: 'bg-blue-500/20 text-blue-400',
  SOCIAL_MEDIA: 'bg-pink-500/20 text-pink-400',
  DESIGN: 'bg-orange-500/20 text-orange-400',
  ADS: 'bg-green-500/20 text-green-400',
  DEVELOPMENT: 'bg-cyan-100 text-cyan-700',
  CONTENT: 'bg-yellow-500/20 text-yellow-400',
  ACCOUNTS: 'bg-slate-800/50 text-slate-200',
  HR: 'bg-rose-100 text-rose-700',
  SALES: 'bg-emerald-500/20 text-emerald-400',
}

export function LeaderboardClient({
  leaderboard,
  topPerformers,
  recentAchievements,
  departmentStats,
  currentMonth,
  isManager,
  testimonialUserIds = [],
}: LeaderboardClientProps) {
  const testimonialSet = new Set(testimonialUserIds)
  const router = useRouter()
  const [filter, setFilter] = useState('ALL')
  const [showAddAchievement, setShowAddAchievement] = useState(false)
  const [calculating, setCalculating] = useState(false)

  const monthDate = new Date(currentMonth)
  const monthName = formatDateDDMMYYYY(monthDate)

  const filteredLeaderboard = filter === 'ALL'
    ? leaderboard
    : leaderboard.filter(e => e.user.department === filter)

  const handleCalculateScores = async () => {
    setCalculating(true)
    try {
      const res = await fetch('/api/accountability/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: currentMonth }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to calculate scores:', error)
    } finally {
      setCalculating(false)
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank <= 3) return renderMedalIcon(rank - 1, "w-8 h-8")
    return <span className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center text-sm font-bold text-slate-300">{rank}</span>
  }

  const getScoreColor = (score: number) => {
    if (score >= 100) return 'text-green-400'
    if (score >= 80) return 'text-blue-400'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Performers Podium */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Top Performers - {monthName}</h2>
          <div className="flex justify-center items-end gap-4">
            {/* 2nd Place */}
            {topPerformers.topScores[1] && (
              <div className="text-center">
                <div className="relative">
                  <div className="mb-2 mx-auto w-fit">
                    <UserAvatar user={{ id: topPerformers.topScores[1].user.id, firstName: topPerformers.topScores[1].user.firstName, lastName: topPerformers.topScores[1].user.lastName, department: topPerformers.topScores[1].user.department, profile: topPerformers.topScores[1].user.profile }} size="xl" showPreview={false} />
                  </div>
                  {testimonialSet.has(topPerformers.topScores[1].userId || topPerformers.topScores[1].user.id) && (
                    <span className="absolute -top-1 -right-1" title="Testimonial Star">{renderMedalIcon(0, "w-5 h-5")}</span>
                  )}
                </div>
                <span className="flex justify-center mb-1">{renderMedalIcon(1, "w-8 h-8")}</span>
                <p className="font-medium">
                  {topPerformers.topScores[1].user.firstName}
                  {testimonialSet.has(topPerformers.topScores[1].userId || topPerformers.topScores[1].user.id) && <svg className="w-4 h-4 inline-block ml-1 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}
                </p>
                <p className="text-sm text-white/80">{Math.round(topPerformers.topScores[1].finalScore)}%</p>
              </div>
            )}
            {/* 1st Place */}
            {topPerformers.topScores[0] && (
              <div className="text-center -mt-4">
                <div className="relative">
                  <div className="mb-2 mx-auto w-fit">
                    <UserAvatar user={{ id: topPerformers.topScores[0].user.id, firstName: topPerformers.topScores[0].user.firstName, lastName: topPerformers.topScores[0].user.lastName, department: topPerformers.topScores[0].user.department, profile: topPerformers.topScores[0].user.profile }} size="2xl" showPreview={false} />
                  </div>
                  {testimonialSet.has(topPerformers.topScores[0].userId || topPerformers.topScores[0].user.id) && (
                    <span className="absolute -top-1 -right-1" title="Testimonial Star">{renderMedalIcon(0, "w-6 h-6")}</span>
                  )}
                </div>
                <span className="flex justify-center mb-1">{renderMedalIcon(0, "w-10 h-10")}</span>
                <p className="font-bold text-lg">
                  {topPerformers.topScores[0].user.firstName}
                  {testimonialSet.has(topPerformers.topScores[0].userId || topPerformers.topScores[0].user.id) && <svg className="w-4 h-4 inline-block ml-1 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}
                </p>
                <p className="text-sm text-white/80">{Math.round(topPerformers.topScores[0].finalScore)}%</p>
              </div>
            )}
            {/* 3rd Place */}
            {topPerformers.topScores[2] && (
              <div className="text-center">
                <div className="relative">
                  <div className="mb-2 mx-auto w-fit">
                    <UserAvatar user={{ id: topPerformers.topScores[2].user.id, firstName: topPerformers.topScores[2].user.firstName, lastName: topPerformers.topScores[2].user.lastName, department: topPerformers.topScores[2].user.department, profile: topPerformers.topScores[2].user.profile }} size="xl" showPreview={false} />
                  </div>
                  {testimonialSet.has(topPerformers.topScores[2].userId || topPerformers.topScores[2].user.id) && (
                    <span className="absolute -top-1 -right-1" title="Testimonial Star">{renderMedalIcon(0, "w-5 h-5")}</span>
                  )}
                </div>
                <span className="flex justify-center mb-1">{renderMedalIcon(2, "w-8 h-8")}</span>
                <p className="font-medium">
                  {topPerformers.topScores[2].user.firstName}
                  {testimonialSet.has(topPerformers.topScores[2].userId || topPerformers.topScores[2].user.id) && <svg className="w-4 h-4 inline-block ml-1 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}
                </p>
                <p className="text-sm text-white/80">{Math.round(topPerformers.topScores[2].finalScore)}%</p>
              </div>
            )}
          </div>
          {topPerformers.topScores.length === 0 && (
            <p className="text-center text-white/80">No scores calculated yet for this month</p>
          )}
        </div>

        {/* Achievement Stars */}
        <div className="glass-card rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Achievement Stars</h2>
          <div className="space-y-3">
            {topPerformers.topAchievers.slice(0, 3).map((achiever, index) => (
              achiever.user && (
                <div key={achiever.user.id} className="flex items-center gap-3">
                  <span className={`${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-amber-300' : 'text-slate-300'}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-white">{achiever.user.firstName} {achiever.user.lastName || ''}</p>
                    <p className="text-xs text-slate-400">{achiever.user.department}</p>
                  </div>
                  <span className="font-bold text-indigo-600">{achiever.points} pts</span>
                </div>
              )
            ))}
            {topPerformers.topAchievers.length === 0 && (
              <p className="text-center text-slate-400 text-sm">No achievements yet this month</p>
            )}
          </div>
        </div>
      </div>

      {/* Department Performance */}
      <div className="glass-card rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Department Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {departmentStats.map((dept) => (
            <div key={dept.department} className="text-center p-4 bg-slate-900/40 rounded-xl">
              <div className="text-3xl font-bold text-white">{dept.averageScore}%</div>
              <div className={`text-xs px-2 py-1 rounded mt-2 inline-block ${DEPARTMENT_COLORS[dept.department] || 'bg-slate-800/50 text-slate-200'}`}>
                {dept.department.replace(/_/g, ' ')}
              </div>
              <p className="text-xs text-slate-400 mt-1">{dept.employeeCount} employees</p>
            </div>
          ))}
        </div>
      </div>

      {/* Manager Actions */}
      {isManager && (
        <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-4 flex flex-wrap gap-3 items-center justify-between">
          <div>
            <h3 className="font-semibold text-amber-800">Manager Actions</h3>
            <p className="text-sm text-amber-400">Add achievements, calculate scores, and set goals</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddAchievement(true)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
            >
              Add Achievement
            </button>
            <button
              onClick={handleCalculateScores}
              disabled={calculating}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
            >
              {calculating ? 'Calculating...' : 'Recalculate Scores'}
            </button>
          </div>
        </div>
      )}

      {/* Main Leaderboard */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-wrap gap-4 items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Full Leaderboard</h2>
          <div className="flex gap-2 overflow-x-auto">
            {['ALL', ...Object.keys(DEPARTMENT_COLORS)].map((dept) => (
              <button
                key={dept}
                onClick={() => setFilter(dept)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap ${
                  filter === dept
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
                }`}
              >
                {dept === 'ALL' ? 'All' : dept.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/40">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Rank</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Employee</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Units</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Goals</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Achievements</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Unit Score</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Growth Score</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Final Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredLeaderboard.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    {getRankBadge(entry.rank)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <UserAvatar user={{ id: entry.user.id, firstName: entry.user.firstName, lastName: entry.user.lastName, empId: entry.user.empId, department: entry.user.department, role: entry.user.role, profile: entry.user.profile }} size="md" showPreview={false} />
                        {entry.hasVideoTestimonial && (
                          <span className="absolute -top-1 -right-1" title="Received Client Video Testimonial">{renderMedalIcon(0, "w-4 h-4")}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {entry.user.firstName} {entry.user.lastName || ''}
                          {entry.hasVideoTestimonial && (
                            <span className="ml-1 text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">Testimonial Star</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400">{entry.user.empId} • {entry.user.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-semibold text-white">{entry.deliveredUnits}</span>
                    <span className="text-slate-400">/{entry.expectedUnits}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-semibold text-white">{entry.goalsAchieved}</span>
                    <span className="text-slate-400">/{entry.totalGoals}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg> {entry.achievements.points}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-semibold ${getScoreColor(entry.unitScore)}`}>
                      {Math.round(entry.unitScore)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-semibold ${getScoreColor(entry.growthScore)}`}>
                      {Math.round(entry.growthScore)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${
                      entry.finalScore >= 100 ? 'bg-green-500/20' :
                      entry.finalScore >= 80 ? 'bg-blue-500/20' :
                      entry.finalScore >= 60 ? 'bg-yellow-500/20' : 'bg-red-500/20'
                    }`}>
                      <span className={`text-lg font-bold ${getScoreColor(entry.finalScore)}`}>
                        {Math.round(entry.finalScore)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeaderboard.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    No scores found. {isManager && 'Click "Recalculate Scores" to generate.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Achievements Feed */}
      <div className="glass-card rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Achievements</h2>
        <div className="space-y-3">
          {recentAchievements.map((achievement) => (
            <div key={achievement.id} className="flex items-start gap-3 p-3 bg-slate-900/40 rounded-xl">
              <span className="text-indigo-600">{renderAchievementIcon(ACHIEVEMENT_ICONS[achievement.type] || 'default', "w-6 h-6")}</span>
              <div className="flex-1">
                <p className="font-medium text-white">{achievement.title}</p>
                <p className="text-sm text-slate-400">
                  {achievement.user.firstName} {achievement.user.lastName || ''} • {achievement.user.department}
                  {achievement.client && ` • ${achievement.client.name}`}
                </p>
              </div>
              <span className="text-indigo-600 font-semibold">+{achievement.pointsAwarded} pts</span>
            </div>
          ))}
          {recentAchievements.length === 0 && (
            <p className="text-center text-slate-400 py-4">No achievements recorded yet</p>
          )}
        </div>
      </div>

      {/* Add Achievement Modal */}
      {showAddAchievement && (
        <AddAchievementModal onClose={() => setShowAddAchievement(false)} onSuccess={() => { setShowAddAchievement(false); router.refresh(); }} />
      )}
    </div>
  )
}

function AddAchievementModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<Array<{ id: string; firstName: string; lastName: string | null }>>([])
  const [form, setForm] = useState({
    userId: '',
    type: 'CLIENT_APPRECIATION',
    title: '',
    description: '',
    proofUrl: '',
  })

  // Fetch users on mount
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : data.users || []))
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/accountability/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        onSuccess()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to add achievement')
      }
    } catch (error) {
      console.error('Failed to add achievement:', error)
      toast.error('Failed to add achievement')
    } finally {
      setLoading(false)
    }
  }

  const achievementTypes = [
    { value: 'CLIENT_APPRECIATION', label: 'Client Appreciation (WhatsApp)', points: 2 },
    { value: 'GOOGLE_REVIEW', label: 'Google Review', points: 5 },
    { value: 'VIDEO_TESTIMONIAL', label: 'Video Testimonial', points: 10 },
    { value: 'EMPLOYEE_REFERRAL', label: 'Employee Referral', points: 50 },
    { value: 'CLIENT_REFERRAL', label: 'Client Referral', points: 20 },
    { value: 'SALE_CLOSED', label: 'Sale Closed', points: 25 },
    { value: 'ATTENDANCE_PERFECT', label: 'Perfect Attendance', points: 5 },
    { value: 'GOAL_ACHIEVEMENT', label: 'Goal Achievement', points: 10 },
    { value: 'BP_CONTENT', label: 'BP Content Creation', points: 5 },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative glass-card rounded-2xl shadow-none w-full max-w-lg">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Add Achievement</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Employee</label>
            <select
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select employee...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName || ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Achievement Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {achievementTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} (+{type.points} pts)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="e.g., Great feedback from Dr. Sharma"
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Additional details..."
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Proof URL (optional)</label>
            <input
              type="url"
              value={form.proofUrl}
              onChange={(e) => setForm({ ...form, proofUrl: e.target.value })}
              placeholder="Screenshot or video link"
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Achievement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
