'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  priority: string
  createdAt: string
}

interface Props {
  initialNotifications: Notification[]
  initialUnreadCount: number
}

export function NotificationsClient({ initialNotifications, initialUnreadCount }: Props) {
  const router = useRouter()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [isMarkingRead, setIsMarkingRead] = useState(false)

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications

  const handleMarkAllRead = async () => {
    if (!confirm('Mark all notifications as read?')) return
    setIsMarkingRead(true)
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      })
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    } finally {
      setIsMarkingRead(false)
    }
  }

  const handleMarkRead = async (notificationId: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markRead', notificationId }),
      })
      if (res.ok) {
        setNotifications(prev => prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
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
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const typeIcons: Record<string, { iconType: string; bg: string; color: string }> = {
    TASK: { iconType: 'task', bg: 'bg-blue-500/20', color: 'text-blue-400' },
    MEETING: { iconType: 'meeting', bg: 'bg-purple-500/20', color: 'text-purple-400' },
    PAYMENT: { iconType: 'payment', bg: 'bg-green-500/20', color: 'text-green-400' },
    REPORT: { iconType: 'report', bg: 'bg-amber-500/20', color: 'text-amber-400' },
    LEAVE: { iconType: 'leave', bg: 'bg-teal-500/20', color: 'text-teal-600' },
    GENERAL: { iconType: 'general', bg: 'bg-slate-800/50', color: 'text-slate-300' },
  }

  const renderIcon = (iconType: string, color: string) => {
    const iconClass = `w-5 h-5 ${color}`
    switch (iconType) {
      case 'task':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
      case 'meeting':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      case 'payment':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      case 'report':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      case 'leave':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      default:
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
    }
  }

  const priorityColors: Record<string, string> = {
    URGENT: 'border-l-4 border-l-red-500',
    HIGH: 'border-l-4 border-l-amber-500',
    NORMAL: '',
    LOW: '',
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-slate-400 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingRead}
            className="px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50"
            title="Mark all notifications as read"
          >
            {isMarkingRead ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              filter === 'unread' ? 'bg-white/20 backdrop-blur-sm' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="font-medium text-white">No notifications</h3>
            <p className="text-slate-400 mt-1">
              {filter === 'unread' ? 'All caught up! No unread notifications.' : 'You don\'t have any notifications yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredNotifications.map((notification) => {
              const typeConfig = typeIcons[notification.type] || typeIcons.GENERAL
              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-slate-900/40 transition-colors ${
                    !notification.isRead ? 'bg-blue-500/10' : ''
                  } ${priorityColors[notification.priority] || ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 ${typeConfig.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      {renderIcon(typeConfig.iconType, typeConfig.color)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`font-medium ${!notification.isRead ? 'text-white' : 'text-slate-200'}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-slate-400 mt-0.5">{notification.message}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-slate-400">{formatTime(notification.createdAt)}</span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        {notification.link && (
                          <Link
                            href={notification.link}
                            onClick={() => !notification.isRead && handleMarkRead(notification.id)}
                            className="text-sm text-blue-400 hover:text-blue-400 font-medium"
                          >
                            View details
                          </Link>
                        )}
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkRead(notification.id)}
                            className="text-sm text-slate-400 hover:text-slate-200"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
