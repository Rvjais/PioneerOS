'use client'

import { useState } from 'react'
import { AccountsNav } from '@/client/components/layout/AccountsNav'
import { useSession } from 'next-auth/react'

export function AccountsLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const userRole = session?.user?.role as string
  const userDepartment = session?.user?.department as string

  // Show AccountsNav for ACCOUNTS role/department or SUPER_ADMIN
  const showAccountsNav = userRole === 'ACCOUNTS' ||
                          userDepartment === 'ACCOUNTS' ||
                          userRole === 'SUPER_ADMIN' ||
                          userRole === 'MANAGER'

  return (
    <div className="flex -m-6 min-h-[calc(100vh-73px)]">
      {showAccountsNav && (
        <>
          {/* Mobile nav toggle */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileNavOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Mobile nav overlay */}
          {mobileNavOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileNavOpen(false)}
            />
          )}

          {/* Mobile nav drawer */}
          <aside className={`lg:hidden fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-300 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto bg-slate-900`}>
            <AccountsNav />
          </aside>

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-[73px] self-start h-[calc(100vh-73px)] overflow-y-auto z-[35]">
            <AccountsNav />
          </aside>
        </>
      )}
      <div className="flex-1 min-w-0 p-6">{children}</div>
    </div>
  )
}
