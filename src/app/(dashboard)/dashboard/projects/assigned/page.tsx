'use client'

import { useState } from 'react'

interface AssignedProject {
  id: string
  name: string
  client: string
  myRole: string
  tasks: number
  completedTasks: number
  deadline: string
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'
}

const ASSIGNED_PROJECTS: AssignedProject[] = [
  { id: '1', name: 'Apollo Website Revamp', client: 'Apollo Hospitals', myRole: 'Lead Developer', tasks: 12, completedTasks: 8, deadline: '2024-03-25', status: 'ACTIVE' },
  { id: '2', name: 'MedPlus Landing Page', client: 'MedPlus Clinics', myRole: 'Frontend Dev', tasks: 6, completedTasks: 5, deadline: '2024-03-15', status: 'ACTIVE' },
  { id: '3', name: 'CareConnect Website', client: 'CareConnect', myRole: 'Backend Support', tasks: 4, completedTasks: 2, deadline: '2024-03-30', status: 'ACTIVE' },
  { id: '4', name: 'HealthFirst Labs', client: 'HealthFirst Labs', myRole: 'Performance Specialist', tasks: 3, completedTasks: 1, deadline: '2024-03-18', status: 'ACTIVE' },
]

export default function WebAssignedProjectsPage() {
  const [filter, setFilter] = useState<string>('all')

  const filteredProjects = filter === 'all' ? ASSIGNED_PROJECTS : ASSIGNED_PROJECTS.filter(p => p.status === filter)

  const totalTasks = ASSIGNED_PROJECTS.reduce((sum, p) => sum + p.tasks, 0)
  const completedTasks = ASSIGNED_PROJECTS.reduce((sum, p) => sum + p.completedTasks, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Assigned Projects</h1>
            <p className="text-indigo-200">Projects you&apos;re working on</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-indigo-200 text-sm">My Projects</p>
              <p className="text-3xl font-bold">{ASSIGNED_PROJECTS.length}</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-sm">My Tasks</p>
              <p className="text-3xl font-bold">{totalTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total Tasks</p>
          <p className="text-3xl font-bold text-white">{totalTasks}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Completed</p>
          <p className="text-3xl font-bold text-green-400">{completedTasks}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Remaining</p>
          <p className="text-3xl font-bold text-amber-400">{totalTasks - completedTasks}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Completion Rate</p>
          <p className="text-3xl font-bold text-indigo-600">{Math.round((completedTasks / totalTasks) * 100)}%</p>
        </div>
      </div>

      {/* Projects List */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">My Assigned Projects</h2>
        </div>
        <div className="divide-y divide-white/10">
          {filteredProjects.map(project => (
            <div key={project.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{project.name}</h3>
                  <p className="text-sm text-slate-400">{project.client}</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded bg-indigo-500/20 text-indigo-400">
                  {project.myRole}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${(project.completedTasks / project.tasks) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-slate-400">
                  {project.completedTasks}/{project.tasks} tasks
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className={`${
                  new Date(project.deadline) < new Date('2024-03-20') ? 'text-red-400' : 'text-slate-400'
                }`}>
                  Deadline: {new Date(project.deadline).toLocaleDateString('en-IN')}
                </span>
                <a href={`/dashboard/projects/active`} className="text-indigo-600 hover:underline">View Project</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workload Summary */}
      <div className="bg-indigo-500/10 rounded-xl border border-indigo-200 p-4">
        <h3 className="font-semibold text-indigo-800 mb-3">Workload Summary</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-indigo-700">
          <div>
            <p className="font-medium mb-1">Current Focus</p>
            <ul className="space-y-1">
              <li>- Apollo Website: 4 tasks remaining</li>
              <li>- MedPlus: 1 task to complete</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Upcoming Deadlines</p>
            <ul className="space-y-1">
              <li>- MedPlus Landing Page: Mar 15</li>
              <li>- HealthFirst: Mar 18</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
