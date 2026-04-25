import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminNotificationsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role !== 'SUPER_ADMIN') redirect('/dashboard')

  // Get notification stats
  const [totalNotifications, unreadCount, recentNotifications, notificationsByType] = await Promise.all([
    prisma.notification.count(),
    prisma.notification.count({ where: { isRead: false } }),
    prisma.notification.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true, department: true },
        },
      },
    }),
    prisma.notification.groupBy({
      by: ['type'],
      _count: true,
    }),
  ])

  const typeCountMap = new Map(notificationsByType.map(n => [n.type, n._count]))

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const mins = Math.floor(diff / 1000 / 60)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)

    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TASK': return 'bg-blue-500/20 text-blue-400'
      case 'MEETING': return 'bg-purple-500/20 text-purple-400'
      case 'PAYMENT': return 'bg-green-500/20 text-green-400'
      case 'ESCALATION': return 'bg-red-500/20 text-red-400'
      case 'GENERAL': return 'bg-slate-900/20 text-slate-400'
      default: return 'bg-slate-900/20 text-slate-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-400'
      case 'HIGH': return 'text-amber-400'
      case 'NORMAL': return 'text-slate-400'
      case 'LOW': return 'text-slate-400'
      default: return 'text-slate-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <span>Notifications</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Notification Management</h1>
          <p className="text-slate-400 mt-1">Monitor and manage system notifications</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/notifications/templates"
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            Templates
          </Link>
          <Link
            href="/admin/notifications/scheduled"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Scheduled
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Total Sent</p>
          <p className="text-2xl font-bold text-white">{totalNotifications.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Unread</p>
          <p className="text-2xl font-bold text-amber-400">{unreadCount.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Tasks</p>
          <p className="text-2xl font-bold text-blue-400">{typeCountMap.get('TASK') || 0}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Meetings</p>
          <p className="text-2xl font-bold text-purple-400">{typeCountMap.get('MEETING') || 0}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Escalations</p>
          <p className="text-2xl font-bold text-red-400">{typeCountMap.get('ESCALATION') || 0}</p>
        </div>
      </div>

      {/* Notification Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Type */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">By Type</h2>
          <div className="space-y-3">
            {['TASK', 'MEETING', 'PAYMENT', 'ESCALATION', 'GENERAL'].map(type => {
              const count = typeCountMap.get(type) || 0
              const percentage = totalNotifications > 0 ? (count / totalNotifications) * 100 : 0
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(type)}`}>
                      {type}
                    </span>
                    <span className="text-sm text-slate-400">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <div className="w-full flex items-center justify-between p-3 bg-slate-700/30 rounded-lg opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <span className="text-xl">📢</span>
                <div className="text-left">
                  <p className="text-white font-medium">Send Broadcast</p>
                  <p className="text-xs text-slate-400">Send notification to all users</p>
                </div>
              </div>
              <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded">Coming Soon</span>
            </div>
            <div className="w-full flex items-center justify-between p-3 bg-slate-700/30 rounded-lg opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <span className="text-xl">🏢</span>
                <div className="text-left">
                  <p className="text-white font-medium">Department Alert</p>
                  <p className="text-xs text-slate-400">Notify specific department</p>
                </div>
              </div>
              <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded">Coming Soon</span>
            </div>
            <Link href="/admin/notifications/scheduled" className="w-full flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xl">⏰</span>
                <div className="text-left">
                  <p className="text-white font-medium">Schedule Reminder</p>
                  <p className="text-xs text-slate-400">Schedule future notification</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <div className="w-full flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <span className="text-xl">🗑️</span>
                <div className="text-left">
                  <p className="text-red-400 font-medium">Clear Old Notifications</p>
                  <p className="text-xs text-red-400/70">Remove read notifications older than 30 days</p>
                </div>
              </div>
              <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent Notifications</h2>
          <span className="text-sm text-slate-400">Last 50</span>
        </div>
        <div className="divide-y divide-slate-700/50">
          {recentNotifications.map(notification => (
            <div
              key={notification.id}
              className={`px-5 py-4 flex items-start gap-4 ${!notification.isRead ? 'bg-purple-500/5' : ''}`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 ${!notification.isRead ? 'bg-purple-500' : 'bg-slate-600'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(notification.type)}`}>
                    {notification.type}
                  </span>
                  <span className={`text-xs ${getPriorityColor(notification.priority)}`}>
                    {notification.priority}
                  </span>
                </div>
                <p className="text-white font-medium">{notification.title}</p>
                <p className="text-sm text-slate-400 truncate">{notification.message}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  <span>To: {notification.user.firstName} {notification.user.lastName}</span>
                  <span>{notification.user.department}</span>
                  <span>{formatTime(notification.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {recentNotifications.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            No notifications found
          </div>
        )}
      </div>
    </div>
  )
}
