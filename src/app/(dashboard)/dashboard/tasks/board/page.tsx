'use client'

interface KanbanTask {
  id: string
  title: string
  project: string
  assignee: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  dueDate: string
}

const KANBAN_DATA: Record<string, KanbanTask[]> = {
  TODO: [
    { id: '1', title: 'Mobile Responsiveness', project: 'MedPlus Landing Page', assignee: 'Aniket', priority: 'CRITICAL', dueDate: '2024-03-11' },
    { id: '2', title: 'Navigation Menu', project: 'Apollo Website Revamp', assignee: 'Manish', priority: 'MEDIUM', dueDate: '2024-03-15' },
    { id: '3', title: 'Footer Component', project: 'MedPlus Landing Page', assignee: 'Chitransh', priority: 'LOW', dueDate: '2024-03-16' },
    { id: '4', title: 'API Integration', project: 'CareConnect Website', assignee: 'Aniket', priority: 'HIGH', dueDate: '2024-03-17' },
  ],
  IN_PROGRESS: [
    { id: '5', title: 'Homepage Hero Section', project: 'Apollo Website Revamp', assignee: 'Shivam', priority: 'HIGH', dueDate: '2024-03-12' },
    { id: '6', title: 'Image Optimization', project: 'HealthFirst Labs', assignee: 'Shivam', priority: 'HIGH', dueDate: '2024-03-14' },
  ],
  REVIEW: [
    { id: '7', title: 'Contact Form Integration', project: 'CareConnect Website', assignee: 'Chitransh', priority: 'MEDIUM', dueDate: '2024-03-13' },
  ],
  DONE: [
    { id: '8', title: 'SEO Meta Tags', project: 'CareConnect Website', assignee: 'Aniket', priority: 'LOW', dueDate: '2024-03-10' },
    { id: '9', title: 'Header Design', project: 'Apollo Website Revamp', assignee: 'Shivam', priority: 'HIGH', dueDate: '2024-03-08' },
  ],
}

export default function WebTaskBoardPage() {
  const columns = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']

  const getColumnColor = (column: string) => {
    switch (column) {
      case 'TODO': return 'bg-slate-800/50 text-slate-200'
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400'
      case 'REVIEW': return 'bg-purple-500/20 text-purple-400'
      case 'DONE': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'border-l-red-500'
      case 'HIGH': return 'border-l-orange-500'
      case 'MEDIUM': return 'border-l-amber-500'
      case 'LOW': return 'border-l-slate-300'
      default: return 'border-l-slate-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Task Board</h1>
            <p className="text-indigo-200">Kanban view of development tasks</p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-indigo-200 text-sm">Total Tasks</p>
              <p className="text-2xl font-bold">{Object.values(KANBAN_DATA).flat().length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map(column => (
          <div key={column} className="bg-slate-900/40 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getColumnColor(column)}`}>
                {column.replace(/_/g, ' ')}
              </span>
              <span className="text-sm text-slate-400">{KANBAN_DATA[column]?.length || 0}</span>
            </div>

            <div className="space-y-3">
              {KANBAN_DATA[column]?.map(task => (
                <div
                  key={task.id}
                  className={`glass-card rounded-lg border border-white/10 p-3 cursor-move hover:shadow-none transition-shadow border-l-4 ${getPriorityColor(task.priority)}`}
                >
                  <p className="font-medium text-white mb-1">{task.title}</p>
                  <p className="text-xs text-slate-400 mb-2">{task.project}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
                        {task.assignee[0]}
                      </div>
                      <span className="text-xs text-slate-400">{task.assignee}</span>
                    </div>
                    <span className={`text-xs ${new Date(task.dueDate) <= new Date('2024-03-12') ? 'text-red-400' : 'text-slate-400'}`}>
                      {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              ))}

              {column !== 'DONE' && (
                <button className="w-full py-2 border-2 border-dashed border-white/10 rounded-lg text-sm text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors">
                  + Add Task
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <h3 className="font-semibold text-white mb-3">Priority Legend</h3>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-l-red-500 bg-slate-800/50 rounded" />
            <span className="text-sm text-slate-300">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-l-orange-500 bg-slate-800/50 rounded" />
            <span className="text-sm text-slate-300">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-l-amber-500 bg-slate-800/50 rounded" />
            <span className="text-sm text-slate-300">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-l-slate-300 bg-slate-800/50 rounded" />
            <span className="text-sm text-slate-300">Low</span>
          </div>
        </div>
      </div>
    </div>
  )
}
