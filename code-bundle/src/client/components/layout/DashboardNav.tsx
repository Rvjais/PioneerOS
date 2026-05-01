'use client'

/**
 * Atrium DashboardNav — drop-in replacement for
 * src/client/components/layout/DashboardNav.tsx
 *
 * Visual update only — keeps the same nav contract (links, active state,
 * collapse). Adapt your actual nav items list at the top.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Users, Megaphone, Search, Target, Globe,
  UserCog, Receipt, BookOpen, Calendar, Inbox, Settings, ChevronsLeft
} from 'lucide-react'

const NAV = [
  { section: 'Workspace', items: [
    { href: '/dashboard', label: 'Today', icon: LayoutDashboard, badge: '4' },
    { href: '/inbox', label: 'Inbox', icon: Inbox, badge: '12' },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
  ]},
  { section: 'Modules', items: [
    { href: '/clients', label: 'Clients', icon: Users },
    { href: '/social', label: 'Social', icon: Megaphone },
    { href: '/seo', label: 'SEO', icon: Search },
    { href: '/ads', label: 'Ads', icon: Target },
    { href: '/web', label: 'Web', icon: Globe },
    { href: '/hr', label: 'HR', icon: UserCog },
    { href: '/accounts', label: 'Accounts', icon: Receipt },
    { href: '/academy', label: 'Academy', icon: BookOpen },
  ]},
]

export function DashboardNav() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const W = collapsed ? 64 : 240

  return (
    <aside
      style={{
        width: W,
        background: 'var(--bg)',
        borderRight: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: collapsed ? '20px 8px' : '20px 16px',
        transition: 'width .18s cubic-bezier(.16,1,.3,1), padding .18s',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: 10, padding: '4px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(140deg, #2d2a26, #1a1814)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--accent)', borderRightColor: 'transparent', transform: 'rotate(-30deg)' }} />
          </div>
          {!collapsed && <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em' }}>PioneerOS</div>}
        </div>
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="atr-btn-ghost" style={{ padding: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ink-3)' }}>
            <ChevronsLeft size={16} />
          </button>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div style={{ position: 'relative' }}>
          <input className="atr-input" placeholder="Search…" style={{ width: '100%', paddingLeft: 32, fontSize: 13 }} />
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', fontSize: 13 }}>⌕</span>
          <span className="atr-kbd" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>⌘K</span>
        </div>
      )}

      {/* Sections */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', flex: 1 }}>
        {NAV.map((sec) => (
          <div key={sec.section}>
            {!collapsed && (
              <div className="atr-caption" style={{ padding: '0 8px 6px' }}>{sec.section}</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {sec.items.map((it) => {
                const active = pathname === it.href || pathname?.startsWith(it.href + '/')
                const Icon = it.icon
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: collapsed ? '8px 0' : '8px 10px',
                      borderRadius: 7,
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      color: active ? 'var(--ink)' : 'var(--ink-2)',
                      background: active ? 'var(--bg-elev)' : 'transparent',
                      border: active ? '1px solid var(--line)' : '1px solid transparent',
                      boxShadow: active ? 'var(--shadow-1)' : 'none',
                      textDecoration: 'none',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      transition: 'background .12s, color .12s',
                    }}
                    title={collapsed ? it.label : undefined}
                  >
                    <Icon size={16} strokeWidth={active ? 2 : 1.6} style={{ flexShrink: 0, color: active ? 'var(--accent)' : 'var(--ink-3)' }} />
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1 }}>{it.label}</span>
                        {it.badge && (
                          <span className="atr-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{it.badge}</span>
                        )}
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? 4 : 10, borderRadius: 8, background: 'var(--bg-elev)', border: '1px solid var(--line)', justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>RJ</div>
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Ravi Jaiswal</div>
            <div style={{ fontSize: 10, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>Founder · Branding Pioneers</div>
          </div>
        )}
      </div>

      {collapsed && (
        <button onClick={() => setCollapsed(false)} style={{ position: 'absolute', top: 60, right: -10, width: 20, height: 20, borderRadius: '50%', background: 'var(--bg-elev)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-1)', cursor: 'pointer', color: 'var(--ink-3)', display: 'grid', placeItems: 'center', fontSize: 10 }}>›</button>
      )}
    </aside>
  )
}

export default DashboardNav
