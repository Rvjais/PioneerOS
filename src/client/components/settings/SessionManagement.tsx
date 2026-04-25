'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '@/client/components/ui'

interface Session {
  id: string
  ipAddress: string | null
  deviceType: string | null
  browser: string | null
  browserVersion: string | null
  os: string | null
  osVersion: string | null
  country: string | null
  city: string | null
  isActive: boolean
  loginAt: string
  logoutAt: string | null
  lastActivityAt: string
  isNewDevice: boolean
  isSuspicious: boolean
  suspiciousReason: string | null
  isCurrent?: boolean
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

function getDeviceIcon(deviceType: string | null) {
  switch (deviceType) {
    case 'MOBILE':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    case 'TABLET':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    default:
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return formatDate(dateString)
}

export function SessionManagement() {
  const [activeSessions, setActiveSessions] = useState<Session[]>([])
  const [loginHistory, setLoginHistory] = useState<Session[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [terminatingId, setTerminatingId] = useState<string | null>(null)
  const [terminatingAll, setTerminatingAll] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchActiveSessions()
  }, [])

  const fetchActiveSessions = async () => {
    try {
      const res = await fetch('/api/auth/sessions')
      if (res.ok) {
        const data = await res.json()
        setActiveSessions(data.sessions)
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLoginHistory = async (page: number = 1) => {
    try {
      const res = await fetch(`/api/auth/sessions/history?page=${page}&limit=10`)
      if (res.ok) {
        const data = await res.json()
        setLoginHistory(data.sessions)
        setPagination(data.pagination)
      }
    } catch (err) {
      console.error('Failed to fetch login history:', err)
    }
  }

  const terminateSession = async (sessionId: string) => {
    setTerminatingId(sessionId)
    setMessage(null)
    try {
      const res = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId))
        setMessage({ type: 'success', text: 'Session terminated' })
      } else {
        setMessage({ type: 'error', text: 'Failed to terminate session' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to terminate session' })
    } finally {
      setTerminatingId(null)
    }
  }

  const terminateAllSessions = async () => {
    setTerminatingAll(true)
    setMessage(null)
    try {
      const res = await fetch('/api/auth/sessions', {
        method: 'DELETE',
      })

      if (res.ok) {
        setActiveSessions([])
        setMessage({ type: 'success', text: 'All sessions terminated' })
      } else {
        setMessage({ type: 'error', text: 'Failed to terminate sessions' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to terminate sessions' })
    } finally {
      setTerminatingAll(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-white">Active Sessions</h3>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-white/10 rounded"></div>
            <div className="h-16 bg-white/10 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-200' : 'bg-red-500/10 text-red-400 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Active Sessions</h3>
            {activeSessions.length > 1 && (
              <button
                onClick={terminateAllSessions}
                disabled={terminatingAll}
                className="text-sm px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                {terminatingAll ? 'Terminating...' : 'Sign out all'}
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {activeSessions.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No active sessions</p>
          ) : (
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    session.isSuspicious
                      ? 'border-red-200 bg-red-500/10'
                      : session.isCurrent
                      ? 'border-green-200 bg-green-500/10'
                      : 'border-white/10 glass-card'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${session.isSuspicious ? 'bg-red-500/20 text-red-400' : 'bg-slate-800/50 text-slate-300'}`}>
                      {getDeviceIcon(session.deviceType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {session.browser || 'Unknown'} on {session.os || 'Unknown'}
                        </span>
                        {session.isCurrent && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                            Current
                          </span>
                        )}
                        {session.isNewDevice && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                            New Device
                          </span>
                        )}
                        {session.isSuspicious && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
                            Suspicious
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        {session.city && session.country
                          ? `${session.city}, ${session.country}`
                          : session.ipAddress || 'Unknown location'}
                        {' • '}
                        Active {getRelativeTime(session.lastActivityAt)}
                      </div>
                      {session.isSuspicious && session.suspiciousReason && (
                        <div className="text-xs text-red-400 mt-1">
                          {session.suspiciousReason}
                        </div>
                      )}
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => terminateSession(session.id)}
                      disabled={terminatingId === session.id}
                      className="px-3 py-1.5 text-sm bg-slate-800/50 text-slate-200 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      {terminatingId === session.id ? 'Ending...' : 'End'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <button
            onClick={() => {
              if (!showHistory) fetchLoginHistory()
              setShowHistory(!showHistory)
            }}
            className="flex items-center justify-between w-full"
          >
            <h3 className="font-semibold text-white">Login History</h3>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${showHistory ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </CardHeader>
        {showHistory && (
          <CardContent>
            {loginHistory.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No login history</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400 border-b border-white/10">
                        <th className="pb-2 font-medium">Device</th>
                        <th className="pb-2 font-medium">Location</th>
                        <th className="pb-2 font-medium">IP Address</th>
                        <th className="pb-2 font-medium">Login Time</th>
                        <th className="pb-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {loginHistory.map((session) => (
                        <tr key={session.id} className="text-slate-200">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">{getDeviceIcon(session.deviceType)}</span>
                              {session.browser || 'Unknown'} / {session.os || 'Unknown'}
                            </div>
                          </td>
                          <td className="py-3">
                            {session.city && session.country
                              ? `${session.city}, ${session.country}`
                              : '-'}
                          </td>
                          <td className="py-3 font-mono text-xs">{session.ipAddress || '-'}</td>
                          <td className="py-3">{formatDate(session.loginAt)}</td>
                          <td className="py-3">
                            {session.isActive ? (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-800/50 text-slate-300 text-xs font-medium rounded-full">
                                Ended
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <span className="text-sm text-slate-400">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchLoginHistory(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-3 py-1.5 text-sm bg-slate-800/50 text-slate-200 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => fetchLoginHistory(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-3 py-1.5 text-sm bg-slate-800/50 text-slate-200 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}
