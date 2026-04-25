'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { ExternalQuickLinks } from './ExternalQuickLinks'

interface BlendedNavProps {
  departments: string[]
  userName?: string
}

const DEPT_CONFIG: Record<string, {
  color: string
  gradient: string
  icon: React.ReactNode
  label: string
  navItems: Array<{ name: string; href: string; icon: string }>
}> = {
  SEO: {
    color: 'teal',
    gradient: 'from-teal-500 to-emerald-500',
    label: 'SEO',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    navItems: [
      { name: 'SEO Dashboard', href: '/seo', icon: 'dashboard' },
      { name: 'Keyword Tracker', href: '/seo/performance/rankings', icon: 'keywords' },
      { name: 'Content Deliverables', href: '/seo/deliverables/content', icon: 'content' },
      { name: 'Backlinks', href: '/seo/deliverables/backlinks', icon: 'backlinks' },
      { name: 'GBP Management', href: '/seo/gbp', icon: 'gbp' },
      { name: 'SEO Reports', href: '/seo/performance/reports', icon: 'reports' },
    ],
  },
  ADS: {
    color: 'red',
    gradient: 'from-red-500 to-orange-500',
    label: 'Ads',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
    navItems: [
      { name: 'Ads Dashboard', href: '/ads', icon: 'dashboard' },
      { name: 'Meta Campaigns', href: '/ads/campaigns/meta', icon: 'meta' },
      { name: 'Google Campaigns', href: '/ads/campaigns/google', icon: 'google' },
      { name: 'Lead Performance', href: '/ads/leads/performance', icon: 'leads' },
      { name: 'Budget Tracking', href: '/ads/budget', icon: 'budget' },
      { name: 'Ad Creatives', href: '/ads/creatives/assets', icon: 'creatives' },
    ],
  },
}

const getIcon = (icon: string, color: string) => {
  const colorClass = color === 'teal' ? 'text-teal-400' : 'text-red-400'
  const icons: Record<string, React.ReactNode> = {
    dashboard: (
      <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    keywords: (
      <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    ),
    content: (
      <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    backlinks: (
      <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    gbp: (
      <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    reports: (
      <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    meta: (
      <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    google: (
      <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
    leads: (
      <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    budget: (
      <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    creatives: (
      <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  }
  return icons[icon] || icons.dashboard
}

export function BlendedNav({ departments, userName = 'Specialist' }: BlendedNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role as string | undefined
  const [expandedDepts, setExpandedDepts] = useState<string[]>(departments)

  const toggleDept = (dept: string) => {
    setExpandedDepts(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    )
  }

  return (
    <aside className="h-full bg-slate-900 border-r border-white/10 overflow-y-auto">
      <div className="p-4">
        {/* Multi-Department Header */}
        <div className="mb-6 p-3 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{userName}</p>
              <p className="text-xs text-purple-300">Multi-Department</p>
            </div>
          </div>
          <div className="flex gap-1.5 mt-3">
            {departments.map(dept => {
              const config = DEPT_CONFIG[dept]
              return (
                <span
                  key={dept}
                  className={`px-2 py-0.5 rounded text-xs font-medium bg-${config?.color || 'slate'}-500/20 text-${config?.color || 'slate'}-400 border border-${config?.color || 'slate'}-500/30`}
                >
                  {config?.label || dept}
                </span>
              )
            })}
          </div>
        </div>

        {/* Blended Dashboard Link */}
        <div className="mb-4">
          <Link
            href="/blended"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              pathname === '/blended'
                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="font-medium">Blended Dashboard</span>
          </Link>
        </div>

        {/* Daily Planner Link */}
        <div className="mb-4">
          <Link
            href="/tasks/daily"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              pathname === '/tasks/daily'
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span className="font-medium">Daily Planner</span>
          </Link>
        </div>

        <div className="border-t border-white/10 my-4" />

        {/* Department Sections */}
        <nav className="space-y-4">
          {departments.map(dept => {
            const config = DEPT_CONFIG[dept]
            if (!config) return null

            const isExpanded = expandedDepts.includes(dept)

            return (
              <div key={dept}>
                <button
                  onClick={() => toggleDept(dept)}
                  className={`flex items-center justify-between w-full px-2 py-2 rounded-lg transition-all hover:bg-slate-800 group`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white`}>
                      {config.icon}
                    </div>
                    <span className="text-sm font-semibold text-white">{config.label} Team</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <ul className="mt-2 ml-2 space-y-1">
                    {config.navItems.map(item => {
                      const isActive = pathname === item.href
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all ${
                              isActive
                                ? `bg-${config.color}-500/20 text-${config.color}-400 border-l-2 border-${config.color}-500`
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            {getIcon(item.icon, config.color)}
                            {item.name}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}

          {/* Team Section - Common for all departments */}
          <div className="border-t border-white/10 pt-4 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Team</span>
            </div>
            <ul className="ml-2 space-y-1">
              <li>
                <Link
                  href="/mash"
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Team Chat
                </Link>
              </li>
              <li>
                <Link
                  href="/team/org-chart"
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Org Chart
                </Link>
              </li>
              <li>
                <Link
                  href="/directory"
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Directory
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <ExternalQuickLinks userRole={userRole} />

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="px-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Actions</p>
          <div className="space-y-2">
            <Link
              href="/seo/deliverables/content"
              className="flex items-center gap-2 px-3 py-2 text-sm text-teal-400 bg-teal-500/10 border border-teal-500/20 rounded-lg hover:bg-teal-500/20 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add SEO Content
            </Link>
            <Link
              href="/ads/campaigns"
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Campaign
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
