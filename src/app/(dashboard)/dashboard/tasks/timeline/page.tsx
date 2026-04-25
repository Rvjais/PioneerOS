'use client'

interface TimelineTask {
  id: string
  title: string
  project: string
  assignee: string
  startDate: string
  endDate: string
  progress: number
  status: 'ON_TRACK' | 'AT_RISK' | 'DELAYED'
}

const TIMELINE_TASKS: TimelineTask[] = [
  { id: '1', title: 'Apollo Homepage Redesign', project: 'Apollo Website Revamp', assignee: 'Shivam', startDate: '2024-03-08', endDate: '2024-03-15', progress: 60, status: 'ON_TRACK' },
  { id: '2', title: 'MedPlus Mobile Fixes', project: 'MedPlus Landing Page', assignee: 'Aniket', startDate: '2024-03-10', endDate: '2024-03-12', progress: 30, status: 'AT_RISK' },
  { id: '3', title: 'CareConnect Backend', project: 'CareConnect Website', assignee: 'Chitransh', startDate: '2024-03-11', endDate: '2024-03-18', progress: 20, status: 'ON_TRACK' },
  { id: '4', title: 'HealthFirst Optimization', project: 'HealthFirst Labs', assignee: 'Shivam', startDate: '2024-03-12', endDate: '2024-03-16', progress: 0, status: 'ON_TRACK' },
  { id: '5', title: 'Apollo Navigation', project: 'Apollo Website Revamp', assignee: 'Manish', startDate: '2024-03-14', endDate: '2024-03-18', progress: 0, status: 'ON_TRACK' },
  { id: '6', title: 'MedPlus Deployment', project: 'MedPlus Landing Page', assignee: 'Manish', startDate: '2024-03-18', endDate: '2024-03-20', progress: 0, status: 'ON_TRACK' },
]

export default function WebTaskTimelinePage() {
  const today = new Date('2024-03-11')
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date('2024-03-08')
    date.setDate(date.getDate() + i)
    return date
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TRACK': return 'bg-green-500'
      case 'AT_RISK': return 'bg-amber-500'
      case 'DELAYED': return 'bg-red-500'
      default: return 'bg-slate-900/40'
    }
  }

  const getBarPosition = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const baseDate = new Date('2024-03-08')

    const startDiff = Math.max(0, Math.floor((start.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)))
    const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    return {
      left: `${(startDiff / 14) * 100}%`,
      width: `${(duration / 14) * 100}%`,
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Task Timeline</h1>
            <p className="text-indigo-200">Gantt view of development schedule</p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-indigo-200 text-sm">Active Tasks</p>
              <p className="text-2xl font-bold">{TIMELINE_TASKS.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/10 bg-slate-900/40">
          <div className="flex">
            <div className="w-64 px-4 py-3 border-r border-white/10">
              <span className="text-sm font-semibold text-slate-300">Task</span>
            </div>
            <div className="flex-1 flex">
              {days.map((day, idx) => (
                <div
                  key={day.toISOString()}
                  className={`flex-1 px-1 py-3 text-center text-xs border-r border-white/5 ${
                    day.toDateString() === today.toDateString() ? 'bg-indigo-50' : ''
                  }`}
                >
                  <p className="font-medium text-slate-300">
                    {day.toLocaleDateString('en-IN', { day: 'numeric' })}
                  </p>
                  <p className="text-slate-400">
                    {day.toLocaleDateString('en-IN', { weekday: 'short' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="divide-y divide-white/10">
          {TIMELINE_TASKS.map(task => {
            const position = getBarPosition(task.startDate, task.endDate)
            return (
              <div key={task.id} className="flex">
                <div className="w-64 px-4 py-3 border-r border-white/10">
                  <p className="font-medium text-white text-sm">{task.title}</p>
                  <p className="text-xs text-slate-400">{task.assignee}</p>
                </div>
                <div className="flex-1 relative py-3 px-2">
                  <div
                    className={`absolute h-6 rounded ${getStatusColor(task.status)} opacity-80`}
                    style={{
                      left: position.left,
                      width: position.width,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  >
                    <div
                      className="h-full bg-white/30 backdrop-blur-sm rounded"
                      style={{ width: `${task.progress}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {task.progress}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Today Marker Note */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <div className="w-4 h-4 bg-indigo-500/20 rounded" />
        <span>Today (March 11)</span>
      </div>

      {/* Status Legend */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <h3 className="font-semibold text-white mb-3">Status Legend</h3>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-sm text-slate-300">On Track</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded" />
            <span className="text-sm text-slate-300">At Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-sm text-slate-300">Delayed</span>
          </div>
        </div>
      </div>

      {/* Workload Alert */}
      <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
        <h3 className="font-semibold text-amber-800 mb-2">Workload Alerts</h3>
        <ul className="text-sm text-amber-400 space-y-1">
          <li>- Shivam has overlapping tasks (Mar 12-16)</li>
          <li>- MedPlus Mobile Fixes at risk - deadline tomorrow</li>
        </ul>
      </div>
    </div>
  )
}
