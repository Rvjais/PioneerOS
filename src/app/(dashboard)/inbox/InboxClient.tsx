'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

/* ─────────────────────────── types ─────────────────────────── */
interface InboxNotification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  priority: string
  createdAt: string
}

interface InboxTask {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueDate: string | null
  department: string
  clientName: string | null
  clientId: string | null
  creatorName: string | null
}

interface InboxTicket {
  id: string
  title: string
  description: string
  status: string
  priority: string
  clientName: string | null
  clientId: string | null
  createdAt: string
}

interface Props {
  notifications: InboxNotification[]
  tasks: InboxTask[]
  tickets: InboxTicket[]
  unreadCount: number
  userName: string
}

/* ─────────────────────────── helpers ─────────────────────────── */
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (d < 7) return `${d}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const PRIORITY_DOT: Record<string, string> = {
  URGENT: 'bg-red-500',
  HIGH: 'bg-amber-400',
  MEDIUM: 'bg-blue-400',
  LOW: 'bg-slate-500',
}

const STATUS_PILL: Record<string, string> = {
  TODO: 'bg-slate-700 text-slate-300',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-300',
  IN_REVIEW: 'bg-purple-500/20 text-purple-300',
  OPEN: 'bg-amber-500/20 text-amber-300',
  IN_PROGRESS_TICKET: 'bg-blue-500/20 text-blue-300',
  PENDING: 'bg-amber-500/20 text-amber-300',
  RESOLVED: 'bg-green-500/20 text-green-300',
}

const TYPE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  TASK: { bg: 'bg-blue-500/20', color: 'text-blue-400', label: 'Task' },
  MEETING: { bg: 'bg-purple-500/20', color: 'text-purple-400', label: 'Meeting' },
  PAYMENT: { bg: 'bg-green-500/20', color: 'text-green-400', label: 'Payment' },
  REPORT: { bg: 'bg-amber-500/20', color: 'text-amber-400', label: 'Report' },
  LEAVE: { bg: 'bg-teal-500/20', color: 'text-teal-400', label: 'Leave' },
  GENERAL: { bg: 'bg-slate-700/60', color: 'text-slate-300', label: 'General' },
}

/* ─────────────────────────── component ─────────────────────────── */
export function InboxClient({ notifications, tasks, tickets, unreadCount, userName }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'notifications' | 'tasks' | 'tickets'>('notifications')
  const [notifs, setNotifs] = useState(notifications)
  const [unread, setUnread] = useState(unreadCount)
  const [marking, setMarking] = useState(false)

  /* mark single read */
  const markRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'markRead', notificationId: id }),
    })
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    setUnread((prev) => Math.max(0, prev - 1))
  }

  /* mark all read */
  const markAllRead = async () => {
    setMarking(true)
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'markAllRead' }),
    })
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnread(0)
    setMarking(false)
    router.refresh()
  }

  const tabs = [
    { id: 'notifications', label: 'Notifications', badge: unread },
    { id: 'tasks', label: 'My Tasks', badge: tasks.length },
    { id: 'tickets', label: 'Support Tickets', badge: tickets.length },
  ] as const

  return (
    <div className="space-y-6 pb-10">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Inbox</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Hey {userName}! You have{' '}
            <span className="text-white font-medium">{unread} unread</span> notification
            {unread !== 1 ? 's' : ''} and{' '}
            <span className="text-white font-medium">{tasks.length} pending</span> task
            {tasks.length !== 1 ? 's' : ''}.
          </p>
        </div>
        {tab === 'notifications' && unread > 0 && (
          <button
            onClick={markAllRead}
            disabled={marking}
            className="px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50 border border-blue-500/20"
          >
            {marking ? 'Marking…' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-slate-800/60 rounded-xl border border-white/5 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {t.label}
            {t.badge > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                  tab === t.id ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Notifications tab ── */}
      {tab === 'notifications' && (
        <div className="rounded-xl border border-white/10 overflow-hidden bg-[#141A25]">
          {notifs.length === 0 ? (
            <EmptyState icon="bell" message="No notifications yet." />
          ) : (
            <div className="divide-y divide-white/5">
              {notifs.map((n) => {
                const style = TYPE_STYLE[n.type] ?? TYPE_STYLE.GENERAL
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-4 p-4 transition-colors hover:bg-white/5 ${
                      !n.isRead ? 'bg-blue-500/5' : ''
                    } ${n.priority === 'URGENT' ? 'border-l-2 border-l-red-500' : n.priority === 'HIGH' ? 'border-l-2 border-l-amber-400' : ''}`}
                  >
                    {/* icon */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${style.bg}`}
                    >
                      <span className={`text-xs font-bold ${style.color}`}>
                        {style.label.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    {/* content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`text-sm font-medium ${!n.isRead ? 'text-white' : 'text-slate-200'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-slate-500">{timeAgo(n.createdAt)}</span>
                          {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        {n.link && (
                          <Link
                            href={n.link}
                            onClick={() => !n.isRead && markRead(n.id)}
                            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                          >
                            View →
                          </Link>
                        )}
                        {!n.isRead && (
                          <button
                            onClick={() => markRead(n.id)}
                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tasks tab ── */}
      {tab === 'tasks' && (
        <div className="rounded-xl border border-white/10 overflow-hidden bg-[#141A25]">
          {tasks.length === 0 ? (
            <EmptyState icon="check" message="No pending tasks assigned to you." />
          ) : (
            <div className="divide-y divide-white/5">
              {tasks.map((t) => (
                <Link
                  key={t.id}
                  href={`/tasks?id=${t.id}`}
                  className="flex items-start gap-4 p-4 hover:bg-white/5 transition-colors group"
                >
                  {/* priority dot */}
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[t.priority] ?? 'bg-slate-500'}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-slate-100 group-hover:text-white transition-colors line-clamp-1">
                        {t.title}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_PILL[t.status] ?? 'bg-slate-700 text-slate-300'}`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs text-slate-500">{t.department}</span>
                      {t.clientName && (
                        <span className="text-xs text-slate-500">• {t.clientName}</span>
                      )}
                      {t.creatorName && (
                        <span className="text-xs text-slate-500">• by {t.creatorName}</span>
                      )}
                      {t.dueDate && (
                        <span
                          className={`text-xs font-medium ml-auto ${
                            new Date(t.dueDate) < new Date()
                              ? 'text-red-400'
                              : 'text-slate-400'
                          }`}
                        >
                          Due {timeAgo(t.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tickets tab ── */}
      {tab === 'tickets' && (
        <div className="rounded-xl border border-white/10 overflow-hidden bg-[#141A25]">
          {tickets.length === 0 ? (
            <EmptyState icon="ticket" message="No open support tickets assigned to you." />
          ) : (
            <div className="divide-y divide-white/5">
              {tickets.map((tk) => (
                <div key={tk.id} className="flex items-start gap-4 p-4 hover:bg-white/5 transition-colors">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[tk.priority] ?? 'bg-slate-500'}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-slate-100 line-clamp-1">{tk.title}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_PILL[tk.status] ?? 'bg-slate-700 text-slate-300'}`}
                      >
                        {tk.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{tk.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {tk.clientName && (
                        <span className="text-xs text-slate-500">{tk.clientName}</span>
                      )}
                      <span className="text-xs text-slate-500 ml-auto">{timeAgo(tk.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────── empty state ─────────────────────────── */
function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-4">
      <div className="w-14 h-14 rounded-full bg-slate-800/60 flex items-center justify-center mb-4">
        {icon === 'bell' && (
          <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        )}
        {icon === 'check' && (
          <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        )}
        {icon === 'ticket' && (
          <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        )}
      </div>
      <p className="text-slate-300 font-medium">All clear!</p>
      <p className="text-slate-500 text-sm mt-1">{message}</p>
    </div>
  )
}
