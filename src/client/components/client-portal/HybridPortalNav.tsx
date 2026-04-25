'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface HybridPortalNavProps {
  hasMarketingAccess: boolean
  hasWebsiteAccess: boolean
  clientName: string
}

export default function HybridPortalNav({
  hasMarketingAccess,
  hasWebsiteAccess,
  clientName,
}: HybridPortalNavProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  // Don't render if client has only one type of access
  if (!hasMarketingAccess || !hasWebsiteAccess) {
    return null
  }

  return (
    <div className="bg-slate-800/50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Portal:</span>
            <div className="flex gap-1">
              <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 text-xs rounded">Marketing</span>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">Website</span>
            </div>
          </div>
          <span className="text-slate-400 text-sm">{clientName}</span>
        </div>
      </div>

      {/* Combined Navigation */}
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex gap-1 overflow-x-auto pb-2">
          {/* Dashboard */}
          <Link
            href="/client-portal"
            className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
              pathname === '/client-portal'
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Dashboard
          </Link>

          {/* Marketing Section */}
          <div className="flex items-center gap-1 pl-2 border-l border-white/10">
            <span className="text-xs text-pink-400/50 uppercase tracking-wide">Marketing</span>
            <Link
              href="/client-portal?tab=deliverables"
              className={`px-3 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
                pathname.includes('deliverables')
                  ? 'bg-pink-500/20 text-pink-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Deliverables
            </Link>
            <Link
              href="/client-portal?tab=reports"
              className={`px-3 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
                pathname.includes('reports')
                  ? 'bg-pink-500/20 text-pink-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Reports
            </Link>
            <Link
              href="/client-portal?tab=billing"
              className={`px-3 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
                pathname.includes('billing')
                  ? 'bg-pink-500/20 text-pink-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Billing
            </Link>
          </div>

          {/* Website Section */}
          <div className="flex items-center gap-1 pl-2 border-l border-white/10">
            <span className="text-xs text-blue-400/50 uppercase tracking-wide">Website</span>
            <Link
              href="/client-portal/web"
              className={`px-3 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
                isActive('/client-portal/web') && pathname === '/client-portal/web'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Project
            </Link>
            <Link
              href="/client-portal/web/approvals"
              className={`px-3 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
                isActive('/client-portal/web/approvals')
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Approvals
            </Link>
            <Link
              href="/client-portal/web/bugs"
              className={`px-3 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
                isActive('/client-portal/web/bugs')
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Bug Reports
            </Link>
            <Link
              href="/client-portal/web/requests"
              className={`px-3 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
                isActive('/client-portal/web/requests')
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Change Requests
            </Link>
          </div>
        </nav>
      </div>
    </div>
  )
}
