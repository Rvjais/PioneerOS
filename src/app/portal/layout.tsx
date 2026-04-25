'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { BRAND } from '@/shared/constants/constants'

const navigation = [
  { name: 'Dashboard', href: '/portal/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Business Profile', href: '/portal/profile', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { name: 'Performance', href: '/portal/performance', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { name: 'Ads', href: '/portal/ads', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055zM20.488 9H15V3.512A9.025 9.025 0 0120.488 9z' },
  { name: 'Goals', href: '/portal/goals', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { name: 'Reports', href: '/portal/reports', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { name: 'Deliverables', href: '/portal/deliverables', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { name: 'Documents', href: '/portal/documents', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { name: 'Approvals', href: '/portal/approvals', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'Meetings', href: '/portal/meetings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { name: 'Contracts', href: '/portal/contracts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2zM14 2v6a1 1 0 001 1h6' },
  { name: 'Proforma Invoices', href: '/portal/invoices', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'Support', href: '/portal/support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
  { name: 'Notifications', href: '/portal/notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { name: 'My Account', href: '/portal/account', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]

interface ImpersonationData {
  isImpersonating: boolean
  adminId?: string
  adminName?: string
  clientUserId?: string
  clientName?: string
  startedAt?: string
}

interface ClientPortalData {
  logoUrl: string | null
  clientName: string | null
  hasMarketingAccess: boolean
  hasWebsiteAccess: boolean
}

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [impersonation, setImpersonation] = useState<ImpersonationData | null>(null)
  const [endingImpersonation, setEndingImpersonation] = useState(false)
  const [portalData, setPortalData] = useState<ClientPortalData | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    // Check if currently being impersonated
    const checkImpersonation = async () => {
      try {
        const res = await fetch('/api/admin/impersonate-client', { signal })
        if (res.ok) {
          const data = await res.json()
          if (data.isImpersonating) {
            setImpersonation(data)
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.error('Failed to check impersonation status:', error)
      }
    }

    // Fetch portal data with abort signal
    const fetchPortalDataWithSignal = async () => {
      try {
        const res = await fetch('/api/client-portal/profile', { signal })
        if (res.ok) {
          const data = await res.json()
          setPortalData({
            logoUrl: data.client?.logoUrl || data.portal?.logoUrl || null,
            clientName: data.client?.name || null,
            hasMarketingAccess: data.user?.hasMarketingAccess || false,
            hasWebsiteAccess: data.user?.hasWebsiteAccess || false,
          })
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.error('Failed to fetch portal data:', error)
      }
    }

    // Fetch unread notification count
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/client-portal/notifications?unread=true', { signal })
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.error('Failed to fetch unread count:', error)
      }
    }

    checkImpersonation()
    fetchPortalDataWithSignal()
    fetchUnreadCount()

    // Listen for logo update events from account page
    const handleLogoUpdate = (e: CustomEvent<{ logoUrl: string | null }>) => {
      setPortalData(prev => prev ? { ...prev, logoUrl: e.detail.logoUrl } : null)
    }
    window.addEventListener('client-logo-updated', handleLogoUpdate as EventListener)

    return () => {
      controller.abort()
      window.removeEventListener('client-logo-updated', handleLogoUpdate as EventListener)
    }
  }, [])

  const handleEndImpersonation = async () => {
    setEndingImpersonation(true)
    try {
      const res = await fetch('/api/admin/impersonate-client', { method: 'DELETE' })
      if (res.ok) {
        const data = await res.json()
        window.location.href = data.redirectUrl || '/admin'
      }
    } catch (error) {
      console.error('Failed to end impersonation:', error)
    } finally {
      setEndingImpersonation(false)
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await fetch('/api/client-portal/logout', { method: 'POST' })
      window.location.href = '/client-portal'
    } catch (error) {
      console.error('Failed to sign out:', error)
      window.location.href = '/client-portal'
    }
  }

  return (
    <div className="min-h-screen bg-slate-900/40">
      {/* Skip to main content - accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Impersonation Banner */}
      {impersonation?.isImpersonating && (
        <div role="alert" className="fixed top-0 left-0 right-0 bg-purple-600 text-white z-[60] px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-sm">
                <span className="font-semibold">{impersonation.adminName}</span> viewing as client: <span className="font-semibold">{impersonation.clientName}</span>
              </span>
            </div>
            <button
              onClick={handleEndImpersonation}
              disabled={endingImpersonation}
              aria-label="End impersonation session"
              className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              {endingImpersonation ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Ending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  End Session
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        role="navigation"
        aria-label="Portal navigation"
        className={`fixed inset-y-0 left-0 w-64 glass-card border-r border-white/10 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${impersonation?.isImpersonating ? 'top-10' : ''}`}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden">
              <Image
                src={BRAND.logo}
                alt={BRAND.logoAlt}
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-semibold text-white">Marketing Portal</span>
              <p className="text-xs text-slate-400">{BRAND.name}</p>
            </div>
          </div>
        </div>

        {/* Portal Switcher for clients with website access */}
        {portalData?.hasWebsiteAccess && (
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-xs font-medium text-slate-400 mb-2">SWITCH PORTAL</p>
            <Link
              href="/portal/web"
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900/40 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Website Portal
            </Link>
          </div>
        )}

        <nav aria-label="Portal menu" className="p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              aria-current={pathname === item.href ? 'page' : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.href
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-slate-300 hover:bg-slate-900/40'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label="Sign out of portal"
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-300 hover:bg-slate-900/40 rounded-lg transition-colors disabled:opacity-50"
          >
            {signingOut ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            )}
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`lg:pl-64 ${impersonation?.isImpersonating ? 'pt-10' : ''}`}>
        {/* Header */}
        <header className={`sticky ${impersonation?.isImpersonating ? 'top-10' : 'top-0'} glass-card border-b border-white/10 z-30`}>
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 hover:bg-slate-800/50 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-4">
              <Link href="/portal/notifications" className="p-2 hover:bg-slate-800/50 rounded-lg relative" aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}>
                <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
                )}
              </Link>
              {portalData?.logoUrl ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10">
                  <Image
                    src={portalData.logoUrl}
                    alt={portalData.clientName || 'Client'}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {portalData?.clientName?.charAt(0).toUpperCase() || 'C'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main id="main-content" className="p-6 text-white">
          {children}
        </main>
      </div>
    </div>
  )
}
