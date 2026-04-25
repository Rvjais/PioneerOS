'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { BRAND } from '@/shared/constants/constants'

const webNavigation = [
  { name: 'Dashboard', href: '/portal/web', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Website Pages', href: '/portal/web/sitemap', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { name: 'Contracts', href: '/portal/web/contracts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2zM14 2v6a1 1 0 001 1h6' },
  { name: 'Credentials', href: '/portal/web/credentials', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
  { name: 'Maintenance', href: '/portal/web/maintenance', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  { name: 'Support', href: '/portal/web/support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
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

export default function WebPortalLayout({
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

  // Fetch client portal data for logo and access flags
  const fetchPortalData = async () => {
    try {
      const res = await fetch('/api/client-portal/profile')
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
      console.error('Failed to fetch portal data:', error)
    }
  }

  useEffect(() => {
    // Check if currently being impersonated
    const checkImpersonation = async () => {
      try {
        const res = await fetch('/api/admin/impersonate-client')
        if (res.ok) {
          const data = await res.json()
          if (data.isImpersonating) {
            setImpersonation(data)
          }
        }
      } catch (error) {
        console.error('Failed to check impersonation status:', error)
      }
    }
    checkImpersonation()
    fetchPortalData()
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
      {/* Impersonation Banner */}
      {impersonation?.isImpersonating && (
        <div className="fixed top-0 left-0 right-0 bg-purple-600 text-white z-[60] px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 glass-card border-r border-white/10 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${impersonation?.isImpersonating ? 'top-10' : ''}`}>
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
              <span className="font-semibold text-white">Web Portal</span>
              <p className="text-xs text-slate-400">{BRAND.name}</p>
            </div>
          </div>
        </div>

        {/* Portal Switcher for clients with both access */}
        {portalData?.hasMarketingAccess && (
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-xs font-medium text-slate-400 mb-2">SWITCH PORTAL</p>
            <Link
              href="/portal/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900/40 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Marketing Portal
            </Link>
          </div>
        )}

        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {webNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.href || (item.href !== '/portal/web' && pathname.startsWith(item.href))
                  ? 'bg-teal-500/20 text-teal-400'
                  : 'text-slate-300 hover:bg-slate-900/40'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 glass-card">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
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

            <div className="hidden lg:flex items-center gap-2">
              <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded">
                Website Project
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/portal/web/support" className="p-2 hover:bg-slate-800/50 rounded-lg relative">
                <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                  {portalData?.clientName?.charAt(0).toUpperCase() || 'C'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 text-white">
          {children}
        </main>
      </div>
    </div>
  )
}
