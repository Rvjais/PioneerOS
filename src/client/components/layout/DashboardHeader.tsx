'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { BRAND } from '@/shared/constants/constants'
import { formatRoleLabel } from '@/shared/utils/utils'
import { useMobileNav } from './MobileNavContext'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

interface DashboardHeaderProps {
  showHamburger?: boolean
}

export function DashboardHeader({ showHamburger = true }: DashboardHeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toggle: toggleMobileNav } = useMobileNav()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchResults, setSearchResults] = useState<{
    clients: { id: string; name: string; tier: string }[]
    employees: { id: string; firstName: string; lastName: string | null; empId: string; department: string; profile?: { profilePicture?: string | null } | null }[]
    tasks: { id: string; title: string; status: string }[]
  }>({ clients: [], employees: [], tasks: [] })
  const [searchLoading, setSearchLoading] = useState(false)

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=5')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      // Sentry captures this error
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Pause polling when tab is hidden to save server load
    let interval: ReturnType<typeof setInterval> | null = setInterval(fetchNotifications, 60000)

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (interval) { clearInterval(interval); interval = null }
      } else {
        fetchNotifications() // Refresh immediately when tab becomes active
        interval = setInterval(fetchNotifications, 60000)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (interval) clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchNotifications])

  // Handle keyboard shortcut for search and closing dropdowns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
      if (e.key === 'Escape') {
        setShowSearch(false)
        setShowImpersonateDropdown(false)
        setShowUserMenu(false)
        setShowNotifications(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Live search as user types
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setSearchLoading(true)
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
          if (res.ok) {
            const data = await res.json()
            setSearchResults(data)
          }
        } catch (error) {
          // Sentry captures this error
        } finally {
          setSearchLoading(false)
        }
      } else {
        setSearchResults({ clients: [], employees: [], tasks: [] })
      }
    }, 300) // Debounce 300ms

    return () => clearTimeout(searchTimeout)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setShowSearch(false)
      setSearchQuery('')
      setSearchResults({ clients: [], employees: [], tasks: [] })
    }
  }

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      })
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      // Sentry captures this error
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <>
      {/* Impersonation banner is rendered in dashboard layout via <ImpersonationBanner /> */}

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between h-[73px] px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger button — only shown when DashboardNav is active */}
            {showHamburger && (
              <button
                onClick={toggleMobileNav}
                className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Open navigation menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                <Image
                  src={BRAND.logo}
                  alt={BRAND.logoAlt}
                  fill
                  sizes="40px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-bold text-slate-900 hidden sm:block tracking-tight">
                PioneerOS
              </span>
            </Link>
          </div>

          {/* Global Search */}
          <button
            data-tour="search"
            onClick={() => setShowSearch(true)}
            className="hidden md:flex items-center gap-3 px-4 py-2 text-slate-400 bg-slate-100 border border-slate-200 hover:bg-slate-150 rounded-xl transition-all w-96 group"
          >
            <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm">Search clients, tasks, employees...</span>
            <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-200 rounded border border-slate-300 ml-auto">
              <span>⌘</span>K
            </kbd>
          </button>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Mobile Search */}
            <button
              onClick={() => setShowSearch(true)}
              className="md:hidden p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                aria-expanded={showNotifications}
                className={`p-2 rounded-xl transition-all relative ${showNotifications ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 text-[9px] font-bold text-white bg-blue-500 rounded-full flex items-center justify-center" aria-hidden="true">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-10 hidden sm:block" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-lg border border-slate-200 z-20 overflow-hidden transform origin-top-right transition-all">
                    <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                      <h3 className="font-semibold text-slate-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-slate-400 text-sm">
                          No alerts in the hub.
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <Link
                            key={notification.id}
                            href={notification.link || '/notifications'}
                            onClick={() => setShowNotifications(false)}
                            className={`block px-4 py-3 border-b border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-500/5' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 mt-2 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] ${!notification.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${!notification.isRead ? 'text-slate-900' : 'text-slate-600'}`}>{notification.title}</p>
                                <p className="text-xs text-slate-400 mt-0.5 truncate">{notification.message}</p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{formatTime(notification.createdAt)}</p>
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                    <Link
                      href="/notifications"
                      className="block px-4 py-3 text-center text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-slate-100 bg-slate-50 transition-colors uppercase tracking-widest"
                      onClick={() => setShowNotifications(false)}
                    >
                      View Archives
                    </Link>
                  </div>
                </>
              )}
            </div>


            {/* User Menu */}
            {session?.user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label={`User menu for ${session.user.firstName} ${session.user.lastName || ''}`}
                  aria-expanded={showUserMenu}
                  aria-haspopup="menu"
                  className={`flex items-center gap-3 p-1.5 pr-3 rounded-full border transition-all cursor-pointer ${showUserMenu ? 'bg-slate-100 border-slate-300' : 'border-transparent hover:bg-slate-100 hover:border-slate-200'}`}
                >
                  {session.user.profilePicture ? (
                    <img
                      src={session.user.profilePicture}
                      alt={session.user.firstName}
                      className="w-8 h-8 rounded-full object-cover shadow-inner border border-slate-200 pointer-events-none"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-inner border border-slate-200 pointer-events-none">
                      <span className="text-slate-900 text-sm font-bold">
                        {session.user.firstName?.[0] || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="hidden sm:block text-left pointer-events-none">
                    <p className="text-sm font-bold text-slate-900 leading-tight">
                      {session.user.firstName} {session.user.lastName}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{formatRoleLabel(session.user.role)}</p>
                  </div>
                  <svg className={`w-4 h-4 text-slate-400 hidden sm:block transition-transform duration-300 pointer-events-none ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10 hidden sm:block" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-lg border border-slate-200 z-20 overflow-hidden transform origin-top-right transition-all">
                      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
                        <p className="text-sm font-bold text-slate-900 mb-0.5">{session.user.firstName} {session.user.lastName}</p>
                        <p className="text-xs text-blue-400 font-medium">Emp ID: {session.user.empId}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          System Limits
                        </Link>
                      </div>
                      <div className="p-2 border-t border-slate-200 bg-slate-50">
                        <button
                          onClick={() => signOut({ callbackUrl: '/login' })}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors w-full"
                        >
                          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowSearch(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleSearch}>
              <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Query MASH index..."
                  className="flex-1 text-lg text-slate-900 bg-transparent placeholder-slate-500 outline-none"
                  autoFocus
                />
                <kbd className="px-2 py-1 text-xs font-bold text-slate-400 bg-slate-50 rounded-md border border-slate-200">
                  ESC
                </kbd>
              </div>
            </form>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Search Results */}
              {searchQuery.trim().length >= 2 && (
                <div className="mb-6">
                  {searchLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <>
                      {/* Clients */}
                      {searchResults.clients.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Clients</p>
                          <div className="space-y-1">
                            {searchResults.clients.slice(0, 5).map(client => (
                              <Link
                                key={client.id}
                                href={`/clients/${client.id}`}
                                onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults({ clients: [], employees: [], tasks: [] }); }}
                                className="flex items-center gap-3 p-3 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-900">{client.name}</p>
                                  <p className="text-xs text-slate-400">{client.tier}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Employees */}
                      {searchResults.employees.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Employees</p>
                          <div className="space-y-1">
                            {searchResults.employees.slice(0, 5).map(emp => (
                              <Link
                                key={emp.id}
                                href={`/team/${emp.id}`}
                                onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults({ clients: [], employees: [], tasks: [] }); }}
                                className="flex items-center gap-3 p-3 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <UserAvatar user={{ id: emp.id, firstName: emp.firstName, lastName: emp.lastName, empId: emp.empId, department: emp.department, profile: emp.profile }} size="sm" showPreview={false} />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-900">{emp.firstName} {emp.lastName || ''}</p>
                                  <p className="text-xs text-slate-400">{emp.empId} • {emp.department}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tasks */}
                      {searchResults.tasks.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tasks</p>
                          <div className="space-y-1">
                            {searchResults.tasks.slice(0, 5).map(task => (
                              <Link
                                key={task.id}
                                href={`/tasks/${task.id}`}
                                onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults({ clients: [], employees: [], tasks: [] }); }}
                                className="flex items-center gap-3 p-3 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-900">{task.title}</p>
                                  <p className="text-xs text-slate-400">{task.status.replace(/_/g, ' ')}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No results */}
                      {searchResults.clients.length === 0 && searchResults.employees.length === 0 && searchResults.tasks.length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                          No results found for &quot;{searchQuery}&quot;
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Fast Paths - show when not searching */}
              {searchQuery.trim().length < 2 && (
                <>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">MASH Fast-Paths</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/tasks/new"
                      onClick={() => setShowSearch(false)}
                      className="flex items-center gap-4 p-4 border border-slate-200 hover:border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10">
                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold transition-colors text-slate-600 group-hover:text-blue-400">Assign Task</span>
                    </Link>
                    <Link
                      href="/accounts/onboarding/create"
                      onClick={() => setShowSearch(false)}
                      className="flex items-center gap-4 p-4 border border-slate-200 hover:border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500/10">
                        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold transition-colors text-slate-600 group-hover:text-purple-400">Onboard Client</span>
                    </Link>
                    <Link
                      href="/finance/invoices/new"
                      onClick={() => setShowSearch(false)}
                      className="flex items-center gap-4 p-4 border border-slate-200 hover:border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold transition-colors text-slate-600 group-hover:text-emerald-400">Generate Invoice</span>
                    </Link>
                    <Link
                      href="/meetings"
                      onClick={() => setShowSearch(false)}
                      className="flex items-center gap-4 p-4 border border-slate-200 hover:border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-500/10">
                        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold transition-colors text-slate-600 group-hover:text-amber-400">Book Sync</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
