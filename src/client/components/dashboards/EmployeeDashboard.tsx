'use client'

import Link from 'next/link'

interface EmployeeDashboardProps {
  user: {
    firstName: string
    lastName: string
  }
  stats: {
    assignedTasks: number
    completedToday: number
    pendingReview: number
    upcomingMeetings: number
  }
  tasks: Array<{
    id: string
    title: string
    client: string
    priority: string
    due: string
  }>
  schedule: Array<{
    id: string
    title: string
    time: string
    type: string
    duration: string
    client?: string
  }>
  announcements: Array<{
    id: string
    title: string
    category: string
    time: string
  }>
}

export default function EmployeeDashboard({
  user,
  stats,
  tasks,
  schedule,
  announcements
}: EmployeeDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user.firstName}!</h1>
        <p className="text-cyan-100">Here&apos;s your daily overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.assignedTasks}</p>
          <p className="text-sm text-slate-600 font-medium">Assigned Tasks</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-2xl font-bold text-emerald-600">{stats.completedToday}</p>
          <p className="text-sm text-slate-600 font-medium">Completed Today</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-2xl font-bold text-amber-600">{stats.pendingReview}</p>
          <p className="text-sm text-slate-600 font-medium">Pending Review</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-2xl font-bold text-purple-600">{stats.upcomingMeetings}</p>
          <p className="text-sm text-slate-600 font-medium">Meetings This Week</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">My Tasks</h2>
            <Link href="/tasks" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">No tasks assigned</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="p-3 border border-slate-100 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{task.title}</p>
                      <p className="text-xs text-slate-500">{task.client}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                      task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                      task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium text-slate-600">Due: {task.due}</span>
                    <Link href={`/tasks/${task.id}`} className="text-xs font-semibold text-blue-600 hover:underline">Start Task</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Today&apos;s Schedule</h2>
            <Link href="/calendar" className="text-sm font-semibold text-blue-600 hover:underline">Full Calendar</Link>
          </div>
          <div className="space-y-3">
            {schedule.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">No events scheduled today</p>
            ) : (
              schedule.map((event) => (
                <div key={event.id} className={`p-3 rounded-lg border ${
                  event.type === 'CLIENT' ? 'bg-blue-50 border-blue-200' :
                  event.type === 'BREAK' ? 'bg-emerald-50 border-emerald-200' :
                  'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{event.title}</p>
                      {event.client && <p className="text-xs font-medium text-slate-500">{event.client}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-700">{event.time}</p>
                      <p className="text-xs font-medium text-slate-500">{event.duration}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Announcements</h2>
            <Link href="/feed" className="text-sm font-semibold text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">No announcements</p>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="p-3 border border-slate-200 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{announcement.title}</p>
                      <span className="text-xs font-medium text-slate-500">{announcement.time}</span>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded">
                      {announcement.category}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/tasks" className="p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-center">
              <svg className="w-6 h-6 text-blue-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="text-sm font-semibold text-blue-700">My Tasks</span>
            </Link>
            <Link href="/hr/leave" className="p-4 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors text-center">
              <svg className="w-6 h-6 text-emerald-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold text-emerald-700">Apply Leave</span>
            </Link>
            <Link href="/training" className="p-4 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-center">
              <svg className="w-6 h-6 text-purple-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-sm font-semibold text-purple-700">Training</span>
            </Link>
            <Link href="/ideas" className="p-4 bg-white border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors text-center">
              <svg className="w-6 h-6 text-amber-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-sm font-semibold text-amber-700">Submit Idea</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
