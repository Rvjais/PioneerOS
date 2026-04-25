'use client'

import { useState, useEffect } from 'react'
import { NOTIFICATION_TYPE_STYLES, NOTIFICATION_CATEGORIES } from '@/shared/constants/portal'
import PageGuide from '@/client/components/ui/PageGuide'
import PortalPageSkeleton from '@/client/components/portal/PortalPageSkeleton'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  category: string
  actionUrl: string | null
  actionLabel: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
  sourceType: string | null
  sourceId: string | null
}

export default function PortalNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [markingRead, setMarkingRead] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [filter, categoryFilter])

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams()
      if (filter === 'unread') params.set('unread', 'true')
      if (categoryFilter !== 'all') params.set('category', categoryFilter)

      const res = await fetch(`/api/client-portal/notifications?${params}`)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    setMarkingRead(id)
    try {
      const res = await fetch('/api/client-portal/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true }),
      })
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
        )
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
    } finally {
      setMarkingRead(null)
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id)
    if (unreadIds.length === 0) return

    try {
      await Promise.all(
        unreadIds.map((id) =>
          fetch('/api/client-portal/notifications', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, isRead: true }),
          })
        )
      )
      fetchNotifications()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/client-portal/notifications?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${day}-${month}-${date.getFullYear()}`
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (loading) {
    return <PortalPageSkeleton titleWidth="w-40" statCards={0} listItems={6} showFilters={true} />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageGuide
        pageKey="portal-notifications"
        title="Notifications"
        description="Stay updated on invoices, deliverables, and team activity"
        steps={[
          { label: 'View unread notifications', description: 'Unread items are highlighted with a blue indicator on the left' },
          { label: 'Mark as read', description: 'Click the checkmark button to mark individual notifications as read, or use Mark all as read' },
          { label: 'Manage preferences', description: 'Filter by category or status to find the notifications that matter most' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-slate-300">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'glass-card text-slate-300 border border-white/10 hover:bg-slate-900/40'
              }`}
            >
              {f === 'all' ? 'All' : 'Unread'}
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {Object.entries(NOTIFICATION_CATEGORIES).map(([value, label]: [string, string]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
          <p className="text-slate-400">
            {filter === 'unread' ? 'No unread notifications.' : 'You\'re all caught up!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const typeStyle = NOTIFICATION_TYPE_STYLES[notification.type] || NOTIFICATION_TYPE_STYLES.INFO
            return (
              <div
                key={notification.id}
                className={`relative rounded-xl border transition-all ${
                  notification.isRead
                    ? 'glass-card border-white/10'
                    : `${typeStyle.bg} border-white/10 shadow-none`
                }`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${notification.isRead ? 'bg-slate-800/50' : 'glass-card'}`}>
                      <svg className={`w-5 h-5 ${typeStyle.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeStyle.icon} />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={`font-medium ${notification.isRead ? 'text-slate-200' : 'text-white'}`}>
                            {notification.title}
                          </h3>
                          <p className={`text-sm mt-1 ${notification.isRead ? 'text-slate-400' : 'text-slate-300'}`}>
                            {notification.message}
                          </p>
                        </div>
                        <span className="flex-shrink-0 text-xs text-slate-400">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs px-2 py-0.5 bg-slate-800/50 text-slate-300 rounded">
                          {NOTIFICATION_CATEGORIES[notification.category]}
                        </span>
                        {notification.sourceType === 'USER' && (
                          <span className="text-xs text-slate-400">
                            From your account team
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors"
                          >
                            {notification.actionLabel || 'View'}
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </a>
                        )}
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            disabled={markingRead === notification.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {markingRead === notification.id ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Unread indicator */}
                {!notification.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
