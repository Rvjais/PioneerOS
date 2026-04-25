'use client'

import { useState, useMemo } from 'react'
import PageGuide from '@/client/components/ui/PageGuide'
import InfoTip from '@/client/components/ui/InfoTip'

type UserEntry = {
  id: string
  empId: string
  firstName: string
  lastName: string | null
  role: string
  department: string
  status: string
  token: string | null
  tokenExpiry: string | null
  tokenCreated: string | null
}

type DepartmentGroup = {
  department: string
  users: UserEntry[]
}

type Props = {
  groupedUsers: DepartmentGroup[]
  totalUsers: number
  withLinks: number
  expiredLinks: number
  departmentCount: number
}

const roleBadgeColors: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-500/20 text-purple-400',
  MANAGER: 'bg-blue-500/20 text-blue-400',
  OPERATIONS_HEAD: 'bg-cyan-500/20 text-cyan-400',
  EMPLOYEE: 'bg-green-500/20 text-green-400',
  HR: 'bg-pink-500/20 text-pink-400',
  SALES: 'bg-orange-500/20 text-orange-400',
  ACCOUNTS: 'bg-amber-500/20 text-amber-400',
  FREELANCER: 'bg-teal-500/20 text-teal-400',
  INTERN: 'bg-indigo-500/20 text-indigo-400',
}

const deptBadgeColors: Record<string, string> = {
  WEB: 'bg-blue-500/20 text-blue-400',
  SEO: 'bg-green-500/20 text-green-400',
  ADS: 'bg-orange-500/20 text-orange-400',
  SOCIAL: 'bg-pink-500/20 text-pink-400',
  HR: 'bg-purple-500/20 text-purple-400',
  ACCOUNTS: 'bg-amber-500/20 text-amber-400',
  SALES: 'bg-cyan-500/20 text-cyan-400',
  OPERATIONS: 'bg-slate-500/20 text-slate-400',
}

export default function AllAccessClient({
  groupedUsers,
  totalUsers,
  withLinks,
  expiredLinks,
  departmentCount,
}: Props) {
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [localUsers, setLocalUsers] = useState(groupedUsers)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return localUsers
    const q = search.toLowerCase()
    return localUsers
      .map((group) => ({
        ...group,
        users: group.users.filter(
          (u) =>
            u.empId.toLowerCase().includes(q) ||
            u.firstName.toLowerCase().includes(q) ||
            (u.lastName && u.lastName.toLowerCase().includes(q)) ||
            u.role.toLowerCase().includes(q) ||
            u.department.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.users.length > 0)
  }, [search, localUsers])

  const isExpired = (expiry: string | null) => {
    if (!expiry) return true
    return new Date(expiry) < new Date()
  }

  const copyLink = async (token: string, userId: string) => {
    const url = `${origin}/auth/magic?token=${token}`
    await navigator.clipboard.writeText(url)
    setCopiedId(userId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const generateNewLink = async (userId: string) => {
    setGeneratingId(userId)
    try {
      const res = await fetch('/api/admin/generate-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (data.success) {
        // Update local state
        setLocalUsers((prev) =>
          prev.map((group) => ({
            ...group,
            users: group.users.map((u) =>
              u.id === userId
                ? {
                    ...u,
                    token: data.token,
                    tokenExpiry: data.expiresAt,
                    tokenCreated: new Date().toISOString(),
                  }
                : u
            ),
          }))
        )
      }
    } catch (err) {
      console.error('Failed to generate link:', err)
    } finally {
      setGeneratingId(null)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6 pb-8">
      <PageGuide
        pageKey="all-access"
        title="All Access"
        description="Manage magic link access for all employees. Copy links to share secure login URLs."
        steps={[
          { label: 'Generate links', description: 'Create magic login URLs for employees' },
          { label: 'Copy and share', description: 'Click copy to share secure access links' },
          { label: 'Monitor expiry', description: 'Track which links have expired' },
        ]}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">All Access</h1>
          <p className="text-sm text-slate-400">
            Magic link login URLs for all active users
          </p>
        </div>
        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm font-medium rounded-full">
          Super Admin View
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-blue-400">{totalUsers}</p>
          <p className="text-sm text-slate-400">Total Active Users</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-green-400">{withLinks}</p>
          <p className="text-sm text-slate-400">With Active Links</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-amber-400">{expiredLinks}</p>
          <p className="text-sm text-slate-400">Expired Links</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-purple-400">
            {departmentCount}
          </p>
          <p className="text-sm text-slate-400">Departments</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search by name, employee ID, role, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
        />
      </div>

      {/* Grouped Tables */}
      {filteredGroups.map((group) => (
        <div key={group.department} className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                deptBadgeColors[group.department] ||
                'bg-slate-500/20 text-slate-400'
              }`}
            >
              {group.department}
            </span>
            <span className="text-xs text-slate-500">
              {group.users.length} user{group.users.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900/40 border-b border-white/10">
                    <th className="text-left px-4 py-3 font-medium text-slate-300">
                      Emp ID
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-300">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-300">
                      Role
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-300">
                      Magic Link
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-slate-300">
                      Status
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {group.users.map((user) => {
                    const expired = isExpired(user.tokenExpiry)
                    const hasToken = !!user.token
                    const linkUrl = hasToken
                      ? `${origin}/auth/magic?token=${user.token}`
                      : null

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-900/40 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-slate-300">
                            {user.empId}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">
                            {user.firstName} {user.lastName || ''}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              roleBadgeColors[user.role] ||
                              'bg-slate-500/20 text-slate-400'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[300px]">
                          {linkUrl ? (
                            <a
                              href={linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 truncate block font-mono"
                              title={linkUrl}
                            >
                              /auth/magic?token=
                              {user.token?.substring(0, 12)}...
                            </a>
                          ) : (
                            <span className="text-xs text-slate-500 italic">
                              No link generated
                            </span>
                          )}
                          {user.tokenCreated && (
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Created: {formatDate(user.tokenCreated)}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {hasToken ? (
                            expired ? (
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-400">
                                Expired
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                                Active
                              </span>
                            )
                          ) : (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-500/20 text-slate-400">
                              None
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {hasToken && !expired && (
                              <button
                                onClick={() => copyLink(user.token!, user.id)}
                                className="px-2 py-1 text-xs font-medium rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                                title="Copy magic link URL"
                              >
                                {copiedId === user.id ? (
                                  <span className="flex items-center gap-1">
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                    Copied
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                      />
                                    </svg>
                                    Copy
                                  </span>
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => generateNewLink(user.id)}
                              disabled={generatingId === user.id}
                              className="px-2 py-1 text-xs font-medium rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                              title="Generate new magic link"
                            >
                              {generatingId === user.id ? (
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="w-3 h-3 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                  </svg>
                                  ...
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                  </svg>
                                  {hasToken ? 'Regenerate' : 'Generate'}
                                </span>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}

      {filteredGroups.length === 0 && (
        <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
          <p className="text-slate-400">No users found matching your search.</p>
        </div>
      )}
    </div>
  )
}
