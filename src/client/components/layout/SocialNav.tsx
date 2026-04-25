'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Users,
  Target,
  Share2,
  FileText,
  Palette,
  CalendarDays,
  ListTodo,
  Columns3,
  GanttChart,
  ShieldCheck,
  UserCheck,
  Clock,
  Send,
  BarChart3,
  TrendingUp,
  FileBarChart,
  ClipboardList,
  PieChart,
  Lightbulb,
  Plus,
  Image,
  Linkedin,
  Video,
  Printer,
  MessageSquare,
  Network,
  Lightbulb as LightbulbIcon,
  Gamepad2,
} from 'lucide-react'
import { ExternalQuickLinks } from './ExternalQuickLinks'

const socialNavigation = [
  {
    category: 'Main',
    items: [
      { name: 'Dashboard', href: '/social', icon: LayoutDashboard },
      { name: 'Daily Planner', href: '/tasks/daily', icon: Calendar },
      { name: 'Calendar', href: '/social/calendar', icon: CalendarDays },
    ],
  },
  {
    category: 'Content Production',
    items: [
      { name: 'Content Planner', href: '/social/content/planner', icon: FileText },
      { name: 'Creative Requests', href: '/social/content/creative-requests', icon: Palette },
      { name: 'Content Calendar', href: '/social/content/calendar', icon: CalendarDays },
    ],
  },
  {
    category: 'Task Management',
    items: [
      { name: 'Social Tasks', href: '/social/tasks', icon: ListTodo },
      { name: 'Task Board', href: '/social/tasks/board', icon: Columns3 },
      { name: 'Task Timeline', href: '/social/tasks/timeline', icon: GanttChart },
    ],
  },
  {
    category: 'Approval System',
    items: [
      { name: 'Internal Approvals', href: '/social/approvals/internal', icon: ShieldCheck },
      { name: 'Client Approvals', href: '/social/approvals/client', icon: UserCheck },
    ],
  },
  {
    category: 'Platform Specific',
    items: [
      { name: 'LinkedIn Management', href: '/social/linkedin', icon: Linkedin },
      { name: 'Video Production', href: '/social/video-production', icon: Video },
      { name: 'Print Designing', href: '/social/print-designing', icon: Printer },
    ],
  },
  {
    category: 'Publishing',
    items: [
      { name: 'Scheduled Posts', href: '/social/publishing/scheduled', icon: Clock },
      { name: 'Published Posts', href: '/social/publishing/published', icon: Send },
    ],
  },
  {
    category: 'Performance',
    items: [
      { name: 'Engagement Analytics', href: '/social/performance/engagement', icon: BarChart3 },
      { name: 'Campaign Performance', href: '/social/performance/campaigns', icon: TrendingUp },
      { name: 'Social Reports', href: '/social/performance/reports', icon: FileBarChart },
    ],
  },
  {
    category: 'Reporting',
    items: [
      { name: 'Operations Report', href: '/social/reports/operations', icon: ClipboardList },
      { name: 'Tactical Report', href: '/social/reports/tactical', icon: PieChart },
      { name: 'Strategic Insights', href: '/social/reports/strategic', icon: Lightbulb },
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

export function SocialNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role as string | undefined
  const [teamMembers, setTeamMembers] = useState<{ name: string; role: string; avatar: string }[]>([])

  useEffect(() => {
    fetch('/api/hr/employees?department=SOCIAL_MEDIA')
      .then(res => res.json())
      .then(data => {
        const employees = Array.isArray(data) ? data : data.employees || []
        setTeamMembers(employees.slice(0, 6).map((e: any) => {
          const name = `${e.firstName || ''} ${e.lastName || ''}`.trim() || 'Team Member'
          return {
            name,
            role: e.designation || e.role || 'Social Media',
            avatar: name[0] || '?',
          }
        }))
      })
      .catch(() => {})
  }, [])

  return (
    <aside className="h-full glass-card border-r border-white/10 flex flex-col overflow-hidden">
      {/* Team Header */}
      <div className="shrink-0 p-4 border-b border-white/10 bg-gradient-to-r from-pink-600 to-fuchsia-600">
        <h2 className="font-bold text-slate-50 text-lg">Social Media</h2>
        <p className="text-pink-100 text-sm">Content & Engagement</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Quick Actions */}
        <div className="p-3 border-b border-white/10 bg-pink-500/10">
          <div className="flex gap-2">
            <Link
              href="/social/content/planner?action=create"
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700"
            >
              <Plus className="w-4 h-4" />
              New Post
            </Link>
            <Link
              href="/social/content/creative-requests?action=new"
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-700 text-pink-400 text-sm font-medium rounded-lg border border-pink-200/30 hover:bg-slate-600"
            >
              <Image className="w-4 h-4" />
              Request
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3">
          {socialNavigation.map((section) => (
            <div key={section.category} className="mb-4">
              <h3 className="px-3 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {section.category}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-pink-500/20 text-pink-400'
                            : 'text-slate-100 hover:bg-slate-800/50 hover:text-white'
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${isActive ? 'text-pink-600' : 'text-slate-100 group-hover:text-white'}`} />
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
        <div className="p-3 border-t border-white/10 mt-auto">
          <h3 className="px-3 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Team
          </h3>
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div key={member.name} className="flex items-center gap-2 px-3 py-1">
                <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-medium">
                  {member.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{member.name}</p>
                  <p className="text-xs text-slate-300 truncate">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
