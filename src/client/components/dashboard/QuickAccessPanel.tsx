import Link from 'next/link'
import { ReactNode } from 'react'

interface QuickAccessPanelProps {
  isLoggedIn: boolean
}

const Icons: Record<string, ReactNode> = {
  gamepad: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  book: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  clipboard: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
}

export function QuickAccessPanel({ isLoggedIn }: QuickAccessPanelProps) {
  const links = [
    { label: 'Arcade Program', href: '/arcade', icon: 'gamepad', requiresAuth: true },
    { label: 'Company Guidebook', href: '/policies', icon: 'book', requiresAuth: false },
    { label: 'Policies', href: '/policies', icon: 'clipboard', requiresAuth: false },
    { label: 'Team Directory', href: '/directory', icon: 'users', requiresAuth: true },
  ]

  return (
    <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/5">
        <h3 className="font-semibold text-white">Quick Access</h3>
      </div>
      <div className="p-2">
        {links.map((link) => {
          const isLocked = link.requiresAuth && !isLoggedIn

          if (isLocked) {
            return (
              <div
                key={link.label}
                className="flex items-center gap-3 px-4 py-3 text-slate-400 cursor-not-allowed"
              >
                <span className="opacity-50">{Icons[link.icon]}</span>
                <span className="text-sm">{link.label}</span>
                <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            )
          }

          return (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors"
            >
              <span className="text-slate-400">{Icons[link.icon]}</span>
              <span className="text-sm text-slate-200">{link.label}</span>
              <svg className="w-4 h-4 ml-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
