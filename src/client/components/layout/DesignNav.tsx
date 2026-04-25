'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Inbox,
  Clock,
  Palette,
  Printer,
  Monitor,
  Sparkles,
  Play,
  CheckCircle2,
  BadgeCheck,
  BarChart3,
  Clock4,
  MessageSquare,
  Network,
  Users,
  LightbulbIcon,
  Gamepad2,
  Plus,
  ArrowRight,
} from 'lucide-react'
import { ExternalQuickLinks } from './ExternalQuickLinks'

const designNavigation = [
  {
    category: 'Main',
    items: [
      { name: 'Dashboard', href: '/design', icon: LayoutDashboard },
      { name: 'Daily Planner', href: '/design/daily-planner', icon: Calendar },
      { name: 'Calendar', href: '/design/calendar', icon: CalendarDays },
    ],
  },
  {
    category: 'Incoming Requests',
    items: [
      { name: 'All Requests', href: '/design/requests', icon: Inbox },
      { name: 'Pending Review', href: '/design/requests/pending', icon: Clock },
      { name: 'In Progress', href: '/design/requests/in-progress', icon: Palette },
    ],
  },
  {
    category: 'Creative Work',
    items: [
      { name: 'Print Designing', href: '/design/print', icon: Printer },
      { name: 'Digital Graphics', href: '/design/digital', icon: Monitor },
      { name: 'Brand Identity', href: '/design/branding', icon: Sparkles },
      { name: 'Video Thumbnails', href: '/design/thumbnails', icon: Play },
    ],
  },
  {
    category: 'Delivery',
    items: [
      { name: 'Completed Work', href: '/design/delivered', icon: CheckCircle2 },
      { name: 'Client Approvals', href: '/design/approvals', icon: BadgeCheck },
    ],
  },
  {
    category: 'Analytics',
    items: [
      { name: 'Design Metrics', href: '/design/metrics', icon: BarChart3 },
      { name: 'Turnaround Times', href: '/design/metrics/turnaround', icon: Clock4 },
    ],
  },
  {
    category: 'Team',
    items: [
      { name: 'Team Chat', href: '/mash', icon: MessageSquare },
      { name: 'Org Chart', href: '/team/org-chart', icon: Network },
      { name: 'Directory', href: '/directory', icon: Users },
      { name: 'Ideas', href: '/ideas', icon: LightbulbIcon },
      { name: 'Arcade', href: '/arcade', icon: Gamepad2 },
    ],
  },
]

interface TeamMember {
  name: string
  role: string
  avatar: string
}

interface DesignNavProps {
  onNavigate?: () => void
}

export function DesignNav({ onNavigate }: DesignNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role as string | undefined
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, delivered: 0 })

  useEffect(() => {
    async function fetchData() {
      try {
        const [teamRes, requestsRes] = await Promise.all([
          fetch('/api/users?department=DESIGN'),
          fetch('/api/design/requests?status=REQUESTED,IN_DESIGN'),
        ])

        if (teamRes.ok) {
          const data = await teamRes.json()
          const users = Array.isArray(data) ? data : data.users || []
          setTeamMembers(
            users.map((u: { firstName?: string; lastName?: string; name?: string; role?: string; jobTitle?: string }) => ({
              name: u.firstName || u.name || 'Unknown',
              role: u.jobTitle || u.role || 'Design Team',
              avatar: (u.firstName || u.name || 'U').charAt(0).toUpperCase(),
            }))
          )
        }

        if (requestsRes.ok) {
          const reqData = await requestsRes.json()
          const requests = reqData.requests || []
          setStats({
            pending: requests.filter((r: { status: string }) => r.status === 'REQUESTED').length,
            inProgress: requests.filter((r: { status: string }) => r.status === 'IN_DESIGN').length,
            delivered: requests.filter((r: { status: string }) => r.status === 'DELIVERED').length,
          })
        }
      } catch {
        // Silently fail - non-critical
      }
    }
    fetchData()
  }, [])

  return (
    <aside className="h-full glass-card border-r border-white/10 flex flex-col overflow-hidden">
      {/* Team Header */}
      <div className="shrink-0 p-4 border-b border-white/10 bg-gradient-to-r from-violet-600 to-purple-600">
        <h2 className="font-bold text-slate-50 text-lg">Design Studio</h2>
        <p className="text-violet-100 text-sm">Creative & Print</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">

      {/* Quick Actions */}
      <div className="p-3 border-b border-white/10 bg-violet-500/10">
        <div className="flex gap-2">
          <Link
            href="/design/requests/new"
            onClick={onNavigate}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700"
            aria-label="Create new design request"
          >
            <Plus className="w-4 h-4" />
            New Design
          </Link>
          <Link
            href="/design/requests"
            onClick={onNavigate}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 glass-card text-violet-400 text-sm font-medium rounded-lg border border-violet-200 hover:bg-violet-500/10"
            aria-label="View all requests"
          >
            <ArrowRight className="w-4 h-4" />
            View All
          </Link>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-violet-500/10 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-violet-400">{stats.pending}</div>
            <div className="text-xs text-violet-200">Pending</div>
          </div>
          <div className="bg-violet-500/10 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-violet-400">{stats.inProgress}</div>
            <div className="text-xs text-violet-200">In Progress</div>
          </div>
          <div className="bg-violet-500/10 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-violet-400">{stats.delivered}</div>
            <div className="text-xs text-violet-200">Delivered</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3">
        {designNavigation.map((section) => (
          <div key={section.category} className="mb-4">
            <h3 className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider hover:text-slate-100">
              {section.category}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = item.href === '/design'
                  ? pathname === '/design'
                  : pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-violet-500/20 text-violet-400'
                          : 'text-slate-100 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-100'}`} />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <ExternalQuickLinks userRole={userRole} />

      {/* Team Members */}
      {teamMembers.length > 0 && (
        <div className="p-3 border-t border-white/10 mt-auto">
          <h3 className="px-3 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Team
          </h3>
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div key={member.name} className="flex items-center gap-2 px-3 py-1">
                <div className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-medium">
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{member.name}</p>
                  <p className="text-xs text-slate-300">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </aside>
  )
}