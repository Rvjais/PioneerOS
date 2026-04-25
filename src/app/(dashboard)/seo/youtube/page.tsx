'use client'

import { useState, useEffect } from 'react'

interface ContentTask {
  id: string
  title: string
  clientName: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
}

export default function YouTubeSEOPage() {
  const [tasks, setTasks] = useState<ContentTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/seo/tasks?taskType=CONTENT')
      .then(res => res.json())
      .then(data => {
        const allTasks: ContentTask[] = data.tasks || data || []
        setTasks(allTasks)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const clientGroups = tasks.reduce((acc, t) => {
    const name = t.clientName || 'Unknown'
    if (!acc[name]) acc[name] = { total: 0, completed: 0, inProgress: 0 }
    acc[name].total++
    if (t.status === 'DONE' || t.status === 'COMPLETED') acc[name].completed++
    if (t.status === 'IN_PROGRESS') acc[name].inProgress++
    return acc
  }, {} as Record<string, { total: number; completed: number; inProgress: number }>)
  const uniqueClients = Object.keys(clientGroups).length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': case 'COMPLETED': return 'bg-green-500/20 text-green-400'
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400'
      case 'TODO': return 'bg-slate-800/50 text-slate-200'
      case 'REVIEW': return 'bg-amber-500/20 text-amber-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500/20 text-red-400'
      case 'HIGH': return 'bg-orange-500/20 text-orange-400'
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400'
      case 'LOW': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">YouTube SEO</h1>
            <p className="text-red-200">Video optimization & channel performance</p>
          </div>
          <button disabled title="Coming soon" className="px-4 py-2 glass-card text-red-400 rounded-lg font-medium opacity-50 cursor-not-allowed">
            + Add Video
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300">Total Clients</p>
          <p className="text-3xl font-bold text-slate-200">{uniqueClients}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Content Tasks</p>
          <p className="text-3xl font-bold text-red-400">{totalTasks}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">In Progress</p>
          <p className="text-3xl font-bold text-blue-400">{inProgressTasks}</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Completed</p>
          <p className="text-3xl font-bold text-purple-400">{completedTasks}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Completion Rate</p>
          <p className="text-3xl font-bold text-green-400">{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</p>
        </div>
      </div>

      {/* Content by Client */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Content Activity by Client</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">TOTAL TASKS</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">COMPLETED</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">IN PROGRESS</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(clientGroups).map(([client, stats]) => (
              <tr key={client} className="border-b border-white/5 hover:bg-slate-900/40">
                <td className="py-3 px-4">
                  <p className="font-medium text-white">{client}</p>
                </td>
                <td className="py-3 px-4 text-center text-slate-300">{stats.total}</td>
                <td className="py-3 px-4 text-center text-red-400 font-semibold">{stats.completed}</td>
                <td className="py-3 px-4 text-center text-blue-400 font-semibold">{stats.inProgress}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    stats.completed === stats.total ? 'bg-green-500/20 text-green-400' :
                    stats.inProgress > 0 ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {stats.completed === stats.total ? 'COMPLETE' : stats.inProgress > 0 ? 'ACTIVE' : 'PENDING'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Content Tasks */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40 flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent Content Tasks</h2>
          <span className="text-sm text-slate-400">Showing {tasks.length} tasks</span>
        </div>
        <div className="divide-y divide-white/10">
          {tasks.slice(0, 20).map(task => (
            <div key={task.id} className="p-4 hover:bg-slate-900/40">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-white">{task.title}</h3>
                  <p className="text-sm text-slate-400">{task.clientName} {task.createdAt ? `• ${new Date(task.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(task.status)}`}>
                    {task.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* YouTube Best Practices */}
      <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
        <h3 className="font-semibold text-red-800 mb-3">YouTube SEO Best Practices</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-red-400">
          <div>
            <p className="font-medium mb-1">Video Frequency</p>
            <ul className="space-y-1">
              <li>• 8-12 videos/month</li>
              <li>• Mix of Shorts & Long</li>
              <li>• Consistent schedule</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Optimization</p>
            <ul className="space-y-1">
              <li>• Keyword in title</li>
              <li>• Detailed description</li>
              <li>• Relevant tags</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Thumbnails</p>
            <ul className="space-y-1">
              <li>• Custom thumbnails</li>
              <li>• High contrast text</li>
              <li>• Faces perform well</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Engagement</p>
            <ul className="space-y-1">
              <li>• Reply to comments</li>
              <li>• Community posts</li>
              <li>• End screens & cards</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
