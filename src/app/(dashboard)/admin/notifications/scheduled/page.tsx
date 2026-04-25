'use client'

import Link from 'next/link'

export default function ScheduledNotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/notifications" className="hover:text-white transition-colors">Notifications</Link>
            <span>/</span>
            <span>Scheduled</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Scheduled Notifications</h1>
          <p className="text-slate-400 mt-1">View and manage scheduled notifications</p>
        </div>
      </div>

      <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
        <div className="text-4xl mb-4">📅</div>
        <h3 className="text-lg font-medium text-white mb-2">Coming Soon</h3>
        <p className="text-slate-400">Scheduled notifications management is under development.</p>
        <Link
          href="/admin/notifications"
          className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Back to Notifications
        </Link>
      </div>
    </div>
  )
}
