'use client'

import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

interface ManagerDashboardProps {
  user: {
    firstName: string
    lastName: string
  }
  stats: {
    teamSize: number
    activeProjects: number
    completedTasks: number
    pendingReviews: number
    teamUtilization: number
  }
  teamMembers: Array<{
    id: string
    name: string
    role: string
    tasks: number
    status: string
  }>
  pendingReviews: Array<{
    id: string
    title: string
    assignee: string
    client: string
    time: string
  }>
  projects: Array<{
    id: string
    client: string
    progress: number
    status: string
  }>
}

export default function ManagerDashboard({
  user,
  stats,
  teamMembers,
  pendingReviews: initialReviews,
  projects
}: ManagerDashboardProps) {
  const [pendingReviews, setPendingReviews] = useState(initialReviews)

  const handleApprove = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DONE' })
      })
      if (res.ok) {
        setPendingReviews(prev => prev.filter(r => r.id !== taskId))
      }
    } catch {
      toast.error('Failed to approve task')
    }
  }

  const handleRequestChanges = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REVISION' })
      })
      if (res.ok) {
        setPendingReviews(prev => prev.filter(r => r.id !== taskId))
      }
    } catch {
      toast.error('Failed to request changes')
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user.firstName}!</h1>
        <p className="text-emerald-100">Team performance and project oversight</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-2xl font-bold text-slate-900">{stats.teamSize}</p>
          <p className="text-sm text-slate-600 font-medium">Team Members</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.activeProjects}</p>
          <p className="text-sm text-slate-600 font-medium">Active Projects</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-2xl font-bold text-emerald-600">{stats.completedTasks}</p>
          <p className="text-sm text-slate-600 font-medium">Completed This Week</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-2xl font-bold text-amber-600">{stats.pendingReviews}</p>
          <p className="text-sm text-slate-600 font-medium">Pending Reviews</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-2xl font-bold text-purple-600">{stats.teamUtilization}%</p>
          <p className="text-sm text-slate-600 font-medium">Team Utilization</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Team Members */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Team Overview</h2>
            <Link href="/team" className="text-sm font-semibold text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {teamMembers.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">No team members</p>
            ) : (
              teamMembers.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{member.name}</p>
                      <p className="text-xs font-medium text-slate-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-700">{member.tasks} tasks</p>
                    <span className={`text-xs font-medium ${member.status === 'busy' ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {member.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Pending Reviews</h2>
            <Link href="/tasks?status=review" className="text-sm font-semibold text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {pendingReviews.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">No pending reviews</p>
            ) : (
              pendingReviews.slice(0, 5).map((task) => (
                <div key={task.id} className="p-3 border border-slate-200 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{task.title}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">By {task.assignee} • {task.client}</p>
                    </div>
                    <span className="text-xs font-medium text-slate-500">{task.time}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleApprove(task.id)}
                      className="px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRequestChanges(task.id)}
                      className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded hover:bg-amber-200"
                    >
                      Request Changes
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Project Status */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Project Status</h2>
          <div className="space-y-4">
            {projects.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">No active projects</p>
            ) : (
              projects.map((project) => (
                <div key={project.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-700">{project.client}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                      project.status === 'On Track' ? 'bg-emerald-100 text-emerald-700' :
                      project.status === 'At Risk' ? 'bg-red-100 text-red-700' :
                      project.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        project.status === 'On Track' ? 'bg-emerald-500' :
                        project.status === 'At Risk' ? 'bg-red-500' :
                        project.status === 'In Progress' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <p className="text-xs font-medium text-slate-500 mt-1">{project.progress}% complete</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/tasks/create" className="p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-center">
              <svg className="w-6 h-6 text-blue-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-semibold text-blue-700">Create Task</span>
            </Link>
            <Link href="/meetings/schedule" className="p-4 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors text-center">
              <svg className="w-6 h-6 text-emerald-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold text-emerald-700">Schedule Meeting</span>
            </Link>
            <Link href="/reports" className="p-4 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-center">
              <svg className="w-6 h-6 text-purple-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-semibold text-purple-700">View Reports</span>
            </Link>
            <Link href="/team/performance" className="p-4 bg-white border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors text-center">
              <svg className="w-6 h-6 text-amber-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-semibold text-amber-700">Team Performance</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
