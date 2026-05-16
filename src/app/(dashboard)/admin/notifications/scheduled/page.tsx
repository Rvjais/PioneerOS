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

      <div className="glass-card rounded-xl border border-white/10 overflow-hidden bg-slate-800/50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/40 border-b border-white/10">
              <th className="p-4 font-semibold text-slate-200">Name</th>
              <th className="p-4 font-semibold text-slate-200">Target Audience</th>
              <th className="p-4 font-semibold text-slate-200">Schedule</th>
              <th className="p-4 font-semibold text-slate-200">Status</th>
              <th className="p-4 font-semibold text-slate-200 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {[
              { id: 1, name: 'Monthly Company Newsletter', audience: 'All Employees', schedule: '1st of month at 9:00 AM', status: 'ACTIVE' },
              { id: 2, name: 'Weekly Timesheet Reminder', audience: 'All Employees', schedule: 'Friday at 4:00 PM', status: 'ACTIVE' },
              { id: 3, name: 'System Maintenance Alert', audience: 'All Users', schedule: 'One-time: Nov 15 at 10:00 PM', status: 'PAUSED' },
            ].map(job => (
              <tr key={job.id} className="hover:bg-slate-900/40">
                <td className="p-4 text-white font-medium">{job.name}</td>
                <td className="p-4 text-slate-300">{job.audience}</td>
                <td className="p-4 text-slate-300">{job.schedule}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    job.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-purple-400 hover:text-purple-300 font-medium text-sm">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
