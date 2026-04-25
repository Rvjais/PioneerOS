'use client'

import { useState } from 'react'

interface WebTask {
  id: string
  title: string
  project: string
  client: string
  assignedTo: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  dueDate: string
  estimatedHours: number
}

const TASKS: WebTask[] = [
  { id: '1', title: 'Homepage Hero Section', project: 'Apollo Website Revamp', client: 'Apollo Hospitals', assignedTo: 'Shivam', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '2024-03-12', estimatedHours: 8 },
  { id: '2', title: 'Mobile Responsiveness', project: 'MedPlus Landing Page', client: 'MedPlus Clinics', assignedTo: 'Aniket', priority: 'CRITICAL', status: 'TODO', dueDate: '2024-03-11', estimatedHours: 6 },
  { id: '3', title: 'Contact Form Integration', project: 'CareConnect Website', client: 'CareConnect', assignedTo: 'Chitransh', priority: 'MEDIUM', status: 'REVIEW', dueDate: '2024-03-13', estimatedHours: 4 },
  { id: '4', title: 'Image Optimization', project: 'HealthFirst Labs', client: 'HealthFirst Labs', assignedTo: 'Shivam', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '2024-03-14', estimatedHours: 3 },
  { id: '5', title: 'Navigation Menu', project: 'Apollo Website Revamp', client: 'Apollo Hospitals', assignedTo: 'Manish', priority: 'MEDIUM', status: 'TODO', dueDate: '2024-03-15', estimatedHours: 6 },
  { id: '6', title: 'Footer Component', project: 'MedPlus Landing Page', client: 'MedPlus Clinics', assignedTo: 'Chitransh', priority: 'LOW', status: 'TODO', dueDate: '2024-03-16', estimatedHours: 2 },
  { id: '7', title: 'API Integration', project: 'CareConnect Website', client: 'CareConnect', assignedTo: 'Aniket', priority: 'HIGH', status: 'TODO', dueDate: '2024-03-17', estimatedHours: 10 },
  { id: '8', title: 'Lazy Loading', project: 'HealthFirst Labs', client: 'HealthFirst Labs', assignedTo: 'Shivam', priority: 'MEDIUM', status: 'TODO', dueDate: '2024-03-18', estimatedHours: 4 },
]

export default function WebTasksPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  const filteredTasks = TASKS.filter(task => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-slate-800/50 text-slate-200'
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400'
      case 'REVIEW': return 'bg-purple-500/20 text-purple-400'
      case 'DONE': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500 text-white'
      case 'HIGH': return 'bg-orange-500/20 text-orange-400'
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400'
      case 'LOW': return 'bg-slate-800/50 text-slate-200'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Web Tasks</h1>
            <p className="text-indigo-200">All development tasks</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">Review</option>
          <option value="DONE">Done</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Priority</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Tasks Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">TASK</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">PROJECT</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">ASSIGNED TO</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">PRIORITY</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">DUE DATE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">EST. HOURS</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <tr key={task.id} className="border-b border-white/5 hover:bg-slate-900/40">
                <td className="py-4 px-4">
                  <p className="font-medium text-white">{task.title}</p>
                  <p className="text-xs text-slate-400">{task.client}</p>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-sm text-slate-300">{task.project}</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-sm text-slate-300">{task.assignedTo}</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(task.status)}`}>
                    {task.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`text-sm ${new Date(task.dueDate) <= new Date('2024-03-12') ? 'text-red-400 font-medium' : 'text-slate-300'}`}>
                    {new Date(task.dueDate).toLocaleDateString('en-IN')}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-sm text-slate-300">{task.estimatedHours}h</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">To Do</p>
          <p className="text-2xl font-bold text-slate-200">{TASKS.filter(t => t.status === 'TODO').length}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">In Progress</p>
          <p className="text-2xl font-bold text-blue-400">{TASKS.filter(t => t.status === 'IN_PROGRESS').length}</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Review</p>
          <p className="text-2xl font-bold text-purple-400">{TASKS.filter(t => t.status === 'REVIEW').length}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Critical</p>
          <p className="text-2xl font-bold text-red-400">{TASKS.filter(t => t.priority === 'CRITICAL').length}</p>
        </div>
      </div>
    </div>
  )
}
