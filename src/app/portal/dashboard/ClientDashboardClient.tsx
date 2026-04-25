'use client'

import { formatDistanceToNow } from 'date-fns'
import {
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  Activity,
  Star,
  Calendar,
  Clock,
  FileText,
  ThumbsUp,
  CalendarPlus,
  HeadphonesIcon,
  Receipt,
  ArrowRight,
  Sparkles,
  Mail,
  Phone,
  Video,
  MessageCircle,
} from 'lucide-react'
import Link from 'next/link'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import PageGuide from '@/client/components/ui/PageGuide'
import MonthlySurveyPopup from '@/client/components/portal/MonthlySurveyPopup'

interface DashboardData {
  client: {
    id: string
    name: string
    healthScore: number | null
  }
  stats: {
    leadsGenerated: number
    leadsChange: number
    deliverablesOnTrack: number
    campaignScore: number | null
  }
  deliverables: Array<{
    name: string
    delivered: number
    total: number
  }>
  recentActivity: Array<{
    id: string
    title: string
    type: string
    time: string
  }>
  upcomingMeetings: Array<{
    id: string
    title: string
    date: string
    time: string
  }>
  accountManager: {
    name: string
  } | null
}

interface Props {
  data: DashboardData
}

const ACTIVITY_ICONS: Record<string, { icon: typeof Mail; color: string }> = {
  email: { icon: Mail, color: 'text-blue-400' },
  call: { icon: Phone, color: 'text-green-400' },
  meeting: { icon: Video, color: 'text-purple-400' },
  whatsapp: { icon: MessageCircle, color: 'text-emerald-400' },
}

const QUICK_ACTIONS = [
  {
    label: 'View Reports',
    description: 'Performance analytics & insights',
    icon: FileText,
    href: '/portal/reports',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    label: 'Approve Content',
    description: 'Review pending deliverables',
    icon: ThumbsUp,
    href: '/portal/approvals',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    label: 'Schedule Meeting',
    description: 'Book a call with your team',
    icon: CalendarPlus,
    href: '/portal/meetings',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    label: 'Raise Support Ticket',
    description: 'Get help from our team',
    icon: HeadphonesIcon,
    href: '/portal/support',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    label: 'View Invoices',
    description: 'Billing & payment history',
    icon: Receipt,
    href: '/portal/invoices',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
]

// formatDateDDMMYYYY is now imported from @/shared/utils/cn

function formatTimeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
  } catch {
    return dateStr || '-'
  }
}

function CircularProgress({ percentage }: { percentage: number }) {
  const clamped = Math.min(Math.max(percentage, 0), 100)
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  const color =
    clamped >= 75 ? '#22C55E' : clamped >= 50 ? '#3B82F6' : clamped >= 25 ? '#F59E0B' : '#EF4444'

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-white">{clamped}%</span>
      </div>
    </div>
  )
}

function StarRating({ score }: { score: number }) {
  const clamped = Math.min(Math.max(score, 0), 5)
  const full = Math.floor(clamped)
  const partial = clamped - full

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        let fillOpacity = 0.15
        if (i < full) fillOpacity = 1
        else if (i === full && partial > 0) fillOpacity = partial

        return (
          <div key={`star-${i}`} className="relative">
            <Star className="w-4 h-4 text-white/15" fill="rgba(255,255,255,0.06)" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillOpacity * 100}%` }}>
              <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ClientDashboardClient({ data }: Props) {
  const { client, stats, deliverables, recentActivity, upcomingMeetings, accountManager } = data

  const healthScore = client.healthScore
  const healthColor =
    healthScore !== null && healthScore >= 80
      ? 'text-green-400'
      : healthScore !== null && healthScore >= 60
        ? 'text-amber-400'
        : 'text-red-400'
  const healthLabel =
    healthScore !== null && healthScore >= 80
      ? 'Healthy'
      : healthScore !== null && healthScore >= 60
        ? 'Needs Attention'
        : 'Critical'
  const healthDot =
    healthScore !== null && healthScore >= 80
      ? 'bg-green-400'
      : healthScore !== null && healthScore >= 60
        ? 'bg-amber-400'
        : 'bg-red-400'

  const nextMeeting = upcomingMeetings.length > 0 ? upcomingMeetings[0] : null

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        <PageGuide
          title="Client Dashboard"
          description="Welcome to your client dashboard. View your project health, deliverables progress, and upcoming schedule at a glance."
          pageKey="portal-dashboard"
          steps={[
            { label: 'Review your key metrics', description: 'Check leads, deliverables, and health score' },
            { label: 'Check deliverable status', description: 'See what has been delivered this month' },
            { label: 'View upcoming meetings', description: 'Stay on top of your schedule with the team' },
          ]}
        />

        {/* ── Welcome Section ── */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome back, {client.name || 'there'}
              </h1>
              <p className="text-slate-400 mt-1.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Your marketing is being managed by Branding Pioneers
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-semibold">
                {accountManager?.name?.charAt(0)?.toUpperCase() || 'AM'}
              </div>
              <div>
                <p className="text-xs text-slate-400">Account Manager</p>
                <p className="text-sm font-medium text-white">{accountManager?.name || 'Your BP Team'}</p>
              </div>
            </div>
          </div>

          {/* Active services pills */}
          {deliverables.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {deliverables.map((d) => (
                <span
                  key={d.name}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20"
                >
                  {d.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Row 1: Performance Metrics ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Leads Generated */}
          <Link href="/portal/performance" className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 hover:bg-slate-800/50 hover:border-white/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              {stats.leadsChange !== 0 && (
                <div
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    stats.leadsChange > 0
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {stats.leadsChange > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {stats.leadsChange > 0 ? '+' : ''}
                  {stats.leadsChange}%
                </div>
              )}
            </div>
            <p className="text-3xl font-bold tracking-tight">
              {stats.leadsGenerated > 0 ? stats.leadsGenerated.toLocaleString() : '-'}
            </p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-slate-400">Leads Generated</p>
              <ArrowRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          {/* Deliverables Progress */}
          <Link href="/portal/deliverables" className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 hover:bg-slate-800/50 hover:border-white/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <CircularProgress percentage={stats.deliverablesOnTrack} />
            </div>
            <p className="text-3xl font-bold tracking-tight">{stats.deliverablesOnTrack}%</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-slate-400">Deliverables On Track</p>
              <ArrowRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          {/* Health Score */}
          <Link href="/portal/performance" className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 hover:bg-slate-800/50 hover:border-white/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              {healthScore !== null && (
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${healthDot}`} />
                  <span className={`text-xs font-medium ${healthColor}`}>{healthLabel}</span>
                </div>
              )}
            </div>
            <p className="text-3xl font-bold tracking-tight">
              {healthScore !== null ? healthScore : '-'}
            </p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-slate-400">Health Score</p>
              <ArrowRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          {/* Campaign Score */}
          <Link href="/portal/reports" className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 hover:bg-slate-800/50 hover:border-white/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-400" />
              </div>
              <StarRating score={stats.campaignScore ?? 0} />
            </div>
            <p className="text-3xl font-bold tracking-tight">
              {stats.campaignScore != null && stats.campaignScore > 0 ? stats.campaignScore.toFixed(1) : '-'}
              <span className="text-base font-normal text-slate-500 ml-1">/ 5</span>
            </p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-slate-400">Campaign Score</p>
              <ArrowRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        </div>

        {/* ── Row 2: Deliverables + Schedule ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left: Deliverables (3/5 = 60%) */}
          <div className="lg:col-span-3 bg-slate-900/40 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-5">This Month&apos;s Deliverables</h2>

            {deliverables.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-slate-400 text-sm">
                  Deliverables are being prepared for this month
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {deliverables.map((item) => {
                  const pct = item.total > 0 ? Math.round((item.delivered / item.total) * 100) : 0
                  const barColor =
                    pct >= 100
                      ? 'bg-green-500'
                      : pct >= 75
                        ? 'bg-blue-500'
                        : pct >= 50
                          ? 'bg-amber-500'
                          : 'bg-red-500'

                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-200">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">
                            {item.delivered}/{item.total}
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              pct >= 100
                                ? 'text-green-400'
                                : pct >= 75
                                  ? 'text-blue-400'
                                  : pct >= 50
                                    ? 'text-amber-400'
                                    : 'text-red-400'
                            }`}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right: Upcoming Schedule (2/5 = 40%) */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-5">Upcoming Schedule</h2>

            {/* Next meeting highlight */}
            {nextMeeting ? (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-blue-300 uppercase tracking-wide">
                    Next Meeting
                  </span>
                </div>
                <p className="text-sm font-medium text-white">{nextMeeting.title}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDateDDMMYYYY(nextMeeting.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {nextMeeting.time || '-'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 rounded-xl p-4 mb-5 text-center">
                <p className="text-sm text-slate-400">No upcoming meetings</p>
              </div>
            )}

            {/* Recent activity */}
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-3">Recent Activity</h3>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-slate-500">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.slice(0, 3).map((activity) => {
                    const activityConfig = ACTIVITY_ICONS[activity.type] || {
                      icon: Activity,
                      color: 'text-slate-400',
                    }
                    const IconComponent = activityConfig.icon

                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <IconComponent className={`w-4 h-4 ${activityConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-200 truncate">{activity.title}</p>
                          <p className="text-xs text-slate-500">{formatTimeAgo(activity.time)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* View all link */}
            {upcomingMeetings.length > 1 && (
              <Link
                href="/portal/meetings"
                className="flex items-center gap-1.5 mt-5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                View All Meetings
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* ── Row 3: Quick Actions ── */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {QUICK_ACTIONS.map((action) => {
              const ActionIcon = action.icon
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group bg-slate-900/40 border border-white/10 rounded-2xl p-5 hover:bg-slate-800/50 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center mb-3`}
                  >
                    <ActionIcon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                    {action.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{action.description}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
      <MonthlySurveyPopup />
    </div>
  )
}
