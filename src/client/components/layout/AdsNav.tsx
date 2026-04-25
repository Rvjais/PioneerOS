'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Users,
  Target,
  Megaphone,
  Search,
  CalendarDays,
  ListTodo,
  Image,
  Palette,
  UserCheck,
  TrendingUp,
  Wallet,
  Receipt,
  BarChart3,
  PieChart,
  FileBarChart,
  ClipboardList,
  Lightbulb,
  Plus,
  Zap,
  MessageSquare,
  Network,
  Lightbulb as LightbulbIcon,
  Gamepad2,
} from 'lucide-react'
import { ExternalQuickLinks } from './ExternalQuickLinks'

const adsNavigation = [
  {
    category: 'Main',
    items: [
      { name: 'Dashboard', href: '/ads', icon: LayoutDashboard },
      { name: 'Daily Planner', href: '/ads/daily-planner', icon: Calendar },
      { name: 'Calendar', href: '/ads/calendar', icon: CalendarDays },
    ],
  },
  {
    category: 'Campaigns',
    items: [
      { name: 'Meta Campaigns', href: '/ads/campaigns/meta', icon: Megaphone },
      { name: 'Google Campaigns', href: '/ads/campaigns/google', icon: Search },
      { name: 'Campaign Planner', href: '/ads/campaigns/planner', icon: CalendarDays },
    ],
  },
  {
    category: 'Creative Management',
    items: [
      { name: 'Ad Creatives', href: '/ads/creatives/assets', icon: Image },
      { name: 'Creative Requests', href: '/ads/creatives/requests', icon: Palette },
    ],
  },
  {
    category: 'Lead Tracking',
    items: [
      { name: 'Lead Performance', href: '/ads/leads/performance', icon: UserCheck },
      { name: 'Conversion Tracking', href: '/ads/leads/conversions', icon: TrendingUp },
    ],
  },
  {
    category: 'Budget Management',
    items: [
      { name: 'Ad Budgets', href: '/ads/budget/allocations', icon: Wallet },
      { name: 'Spend Tracking', href: '/ads/budget/spend', icon: Receipt },
    ],
  },
  {
    category: 'Performance Analytics',
    items: [
      { name: 'Campaign Performance', href: '/ads/performance/campaigns', icon: BarChart3 },
      { name: 'ROI Analysis', href: '/ads/performance/roi', icon: PieChart },
      { name: 'Ad Reports', href: '/ads/performance/reports', icon: FileBarChart },
    ],
  },
  {
    category: 'Reporting',
    items: [
      { name: 'Operations Report', href: '/ads/reports/operations', icon: ClipboardList },
      { name: 'Tactical Report', href: '/ads/reports/tactical', icon: ListTodo },
      { name: 'Strategic Insights', href: '/ads/reports/strategic', icon: Lightbulb },
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

interface AdsNavProps {
  onNavigate?: () => void
}

export function AdsNav({ onNavigate }: AdsNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role as string | undefined
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        const res = await fetch('/api/users?department=ADS')
        if (res.ok) {
          const data = await res.json()
          const users = Array.isArray(data) ? data : data.users || []
          setTeamMembers(
            users.map((u: { firstName?: string; lastName?: string; name?: string; role?: string; jobTitle?: string }) => ({
              name: u.firstName || u.name || 'Unknown',
              role: u.jobTitle || u.role || 'Ads Team',
              avatar: (u.firstName || u.name || 'U').charAt(0).toUpperCase(),
            }))
          )
        }
      } catch {
        // Silently fail - team section is non-critical
      }
    }
    fetchTeamMembers()
  }, [])

  return (
    <aside className="h-full glass-card border-r border-white/10 flex flex-col overflow-hidden">
      {/* Team Header */}
      <div className="shrink-0 p-4 border-b border-white/10 bg-gradient-to-r from-red-600 to-orange-500">
        <h2 className="font-bold text-slate-50 text-lg">Performance Ads</h2>
        <p className="text-red-50 text-sm">Meta & Google Advertising</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">

      {/* Quick Actions */}
      <div className="p-3 border-b border-white/10 bg-red-500/10">
        <div className="flex gap-2">
          <Link
            href="/ads/campaigns/planner?action=create"
            onClick={onNavigate}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
            aria-label="Create new campaign"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </Link>
          <Link
            href="/ads/performance/campaigns"
            onClick={onNavigate}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 glass-card text-red-400 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-500/10"
            aria-label="View campaign optimization"
          >
            <Zap className="w-4 h-4" />
            Optimize
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3">
        {adsNavigation.map((section) => (
          <div key={section.category} className="mb-4">
            <h3 className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider hover:text-slate-100">
              {section.category}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                // Use startsWith for child route highlighting, exact match for /ads root
                const isActive = item.href === '/ads'
                  ? pathname === '/ads'
                  : pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-red-500/20 text-red-400'
                          : 'text-slate-100 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-100 group-hover:text-white'}`} />
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
                <div className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-medium">
                  {member.name?.charAt(0)?.toUpperCase() || '?'}
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
