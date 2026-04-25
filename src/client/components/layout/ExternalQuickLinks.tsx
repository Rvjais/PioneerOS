'use client'

import Link from 'next/link'

interface ExternalQuickLinksProps {
  userRole?: string
}

export function ExternalQuickLinks({ userRole }: ExternalQuickLinksProps) {
  // Only SUPER_ADMIN should see admin-only links (Hire, Client, RFP)
  // Other users see the public links (Careers, Assess, Join)
  const isSuperAdmin = userRole === 'SUPER_ADMIN'

  return (
    <div className="p-3 mx-3 mb-3 border border-orange-500/20 rounded-xl bg-orange-500/5">
      <p className="text-[10px] uppercase tracking-widest text-orange-400/60 font-semibold mb-2 px-1">External Forms</p>
      <div className="grid grid-cols-3 gap-2">
        {isSuperAdmin && (
          <Link
            href="/hr/employee-onboarding"
            className="flex flex-col items-center gap-1 px-1 py-2 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Hire
          </Link>
        )}
        {isSuperAdmin && (
          <Link
            href="/accounts/onboarding/create"
            className="flex flex-col items-center gap-1 px-1 py-2 text-[10px] font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg hover:bg-orange-500/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Client
          </Link>
        )}
        {isSuperAdmin && (
          <Link
            href="/sales/rfp-manager"
            className="flex flex-col items-center gap-1 px-1 py-2 text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            RFP
          </Link>
        )}
        <Link
          href="/careers"
          target="_blank"
          className="flex flex-col items-center gap-1 px-1 py-2 text-[10px] font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Careers
        </Link>
        <Link
          href="/hr/assessment-pipeline"
          className="flex flex-col items-center gap-1 px-1 py-2 text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Assess
        </Link>
        <Link
          href="/join"
          target="_blank"
          className="flex flex-col items-center gap-1 px-1 py-2 text-[10px] font-semibold text-pink-400 bg-pink-500/10 border border-pink-500/20 rounded-lg hover:bg-pink-500/20 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Join
        </Link>
      </div>
    </div>
  )
}
