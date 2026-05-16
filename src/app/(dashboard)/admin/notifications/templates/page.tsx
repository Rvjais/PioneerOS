'use client'

import Link from 'next/link'

export default function NotificationTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/notifications" className="hover:text-white transition-colors">Notifications</Link>
            <span>/</span>
            <span>Templates</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Notification Templates</h1>
          <p className="text-slate-400 mt-1">Manage notification message templates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Meeting Reminder', type: 'MEETING', description: 'Sent 15 minutes before scheduled meetings' },
          { title: 'Task Assigned', type: 'TASK', description: 'Triggered when a new task is assigned to an employee' },
          { title: 'Payment Overdue', type: 'PAYMENT', description: 'Sent to clients when invoice passes due date' },
          { title: 'Project Escalation', type: 'ESCALATION', description: 'Alert for projects missing critical milestones' },
        ].map(template => (
          <div key={template.title} className="glass-card p-6 rounded-xl border border-white/10 hover:border-purple-500/50 transition-colors cursor-pointer bg-slate-800/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-lg">{template.title}</h3>
              <span className="px-2 py-1 text-xs font-medium rounded bg-purple-500/20 text-purple-400">{template.type}</span>
            </div>
            <p className="text-sm text-slate-400 mb-6">{template.description}</p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Last updated: 2 days ago</span>
              <button className="text-purple-400 hover:text-purple-300 font-medium">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
