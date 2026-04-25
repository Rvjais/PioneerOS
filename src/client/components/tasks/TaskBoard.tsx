'use client'

import { useState } from 'react'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

interface Task {
  id: string
  title: string
  description: string | null
  department: string
  priority: string
  status: string
  dueDate: Date | null
  assignee: {
    id: string
    firstName: string
    lastName: string | null
    email?: string | null
    department?: string | null
    role?: string
    profile?: { profilePicture: string | null } | null
  } | null
  client: { name: string } | null
}

interface TaskBoardProps {
  tasks: Task[]
}

const priorityColors: Record<string, string> = {
  URGENT: 'bg-red-500/20 text-red-400 border-red-200',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-200',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-200',
  LOW: 'bg-green-500/20 text-green-400 border-green-200',
}

const statusColumns = [
  { key: 'TODO', label: 'To Do', color: 'border-white/20' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'border-blue-400' },
  { key: 'REVIEW', label: 'Review', color: 'border-purple-400' },
  { key: 'COMPLETED', label: 'Completed', color: 'border-green-400' },
]

export function TaskBoard({ tasks }: TaskBoardProps) {
  const [view, setView] = useState<'board' | 'list'>('board')
  const [filter, setFilter] = useState('ALL')

  const filteredTasks = filter === 'ALL' ? tasks : tasks.filter(t => t.priority === filter)

  const formatDate = (date: Date | null) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const isOverdue = (date: Date | null) => {
    if (!date) return false
    return new Date(date) < new Date() && true
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-white/10 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ colorScheme: 'dark' }}
          >
            <option value="ALL" className="bg-slate-800 text-white">All Priorities</option>
            <option value="URGENT" className="bg-slate-800 text-white">Urgent</option>
            <option value="HIGH" className="bg-slate-800 text-white">High</option>
            <option value="MEDIUM" className="bg-slate-800 text-white">Medium</option>
            <option value="LOW" className="bg-slate-800 text-white">Low</option>
          </select>
        </div>
        <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
          <button
            onClick={() => setView('board')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === 'board' ? 'glass-card shadow text-white' : 'text-slate-400'}`}
          >
            Board
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === 'list' ? 'glass-card shadow text-white' : 'text-slate-400'}`}
          >
            List
          </button>
        </div>
      </div>

      {view === 'board' ? (
        <div className="grid md:grid-cols-4 gap-4">
          {statusColumns.map((column) => {
            const columnTasks = filteredTasks.filter(t => t.status === column.key)
            return (
              <div key={column.key} className={`bg-slate-900/40 rounded-xl p-4 border-t-4 ${column.color}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-200">{column.label}</h3>
                  <span className="text-sm text-slate-400">{columnTasks.length}</span>
                </div>
                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      className="glass-card rounded-lg p-4 shadow-none border border-white/10 hover:shadow-none transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white text-sm">{task.title}</h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.client && (
                        <p className="text-xs text-slate-400 mb-2">{task.client.name}</p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        {task.dueDate && (
                          <span className={`text-xs ${isOverdue(task.dueDate) ? 'text-red-400' : 'text-slate-400'}`}>
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                        {task.assignee && (
                          <UserAvatar
                            user={task.assignee}
                            size="xs"
                            showPreview={true}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  {columnTasks.length === 0 && (
                    <p className="text-center text-sm text-slate-400 py-4">No tasks</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900/40">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Task</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-900/40 cursor-pointer">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{task.title}</p>
                    <p className="text-xs text-slate-400">{task.department}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{task.client?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{task.status.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3">
                    {task.dueDate ? (
                      <span className={`text-sm ${isOverdue(task.dueDate) ? 'text-red-400 font-medium' : 'text-slate-300'}`}>
                        {formatDate(task.dueDate)}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
