'use client'

export default function WebOperationsReportPage() {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const dailyMetrics = {
    tasksCompleted: 8,
    tasksDelayed: 2,
    tasksPendingQC: 4,
    bugsFixed: 1,
    bugsOpen: 3,
  }

  const teamWorkload = [
    { name: 'Manish', tasksToday: 3, completed: 2, inProgress: 1 },
    { name: 'Shivam', tasksToday: 4, completed: 3, inProgress: 1 },
    { name: 'Aniket', tasksToday: 3, completed: 2, inProgress: 1 },
    { name: 'Chitransh', tasksToday: 2, completed: 1, inProgress: 1 },
  ]

  const projectUpdates = [
    { project: 'Apollo Website Revamp', status: 'ON_TRACK', todayProgress: 'Homepage hero 80% done' },
    { project: 'MedPlus Landing Page', status: 'AT_RISK', todayProgress: 'Mobile fixes pending, deadline tomorrow' },
    { project: 'CareConnect Website', status: 'ON_TRACK', todayProgress: 'Contact form in QC review' },
    { project: 'HealthFirst Labs', status: 'ON_TRACK', todayProgress: 'Performance optimization started' },
  ]

  const blockers = [
    { issue: 'MedPlus mobile responsiveness needs immediate attention', severity: 'HIGH' },
    { issue: 'Waiting for Apollo client feedback on homepage design', severity: 'MEDIUM' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TRACK': return 'bg-green-500/20 text-green-400'
      case 'AT_RISK': return 'bg-amber-500/20 text-amber-400'
      case 'DELAYED': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Daily Operations Report</h1>
            <p className="text-indigo-200">{today}</p>
          </div>
          <div className="text-right">
            <p className="text-indigo-200 text-sm">Team Standup</p>
            <p className="text-xl font-bold">9:00 AM</p>
          </div>
        </div>
      </div>

      {/* Daily Metrics */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Tasks Completed</p>
          <p className="text-3xl font-bold text-green-400">{dailyMetrics.tasksCompleted}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Tasks Delayed</p>
          <p className="text-3xl font-bold text-red-400">{dailyMetrics.tasksDelayed}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Pending QC</p>
          <p className="text-3xl font-bold text-amber-400">{dailyMetrics.tasksPendingQC}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Bugs Fixed</p>
          <p className="text-3xl font-bold text-blue-400">{dailyMetrics.bugsFixed}</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Bugs Open</p>
          <p className="text-3xl font-bold text-purple-400">{dailyMetrics.bugsOpen}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Team Workload */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Team Workload Today</h2>
          </div>
          <div className="divide-y divide-white/10">
            {teamWorkload.map(member => (
              <div key={member.name} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-white">{member.name}</p>
                  <span className="text-sm text-slate-400">{member.tasksToday} tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(member.completed / member.tasksToday) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-400">{member.completed}/{member.tasksToday}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Updates */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Project Updates</h2>
          </div>
          <div className="divide-y divide-white/10">
            {projectUpdates.map((project, idx) => (
              <div key={project.project} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-white">{project.project}</p>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(project.status)}`}>
                    {project.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{project.todayProgress}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blockers */}
      {blockers.length > 0 && (
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <h3 className="font-semibold text-red-800 mb-3">Blockers & Issues</h3>
          <ul className="space-y-2">
            {blockers.map((blocker, idx) => (
              <li key={`blocker-${blocker.issue}-${idx}`} className="flex items-center gap-2 text-sm text-red-400">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                  blocker.severity === 'HIGH' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
                }`}>
                  {blocker.severity}
                </span>
                {blocker.issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Today's Focus */}
      <div className="bg-indigo-500/10 rounded-xl border border-indigo-200 p-4">
        <h3 className="font-semibold text-indigo-800 mb-3">Today&apos;s Focus</h3>
        <ul className="space-y-2 text-sm text-indigo-700">
          <li className="flex items-start gap-2">
            <span className="text-indigo-500">1.</span>
            Complete MedPlus mobile responsiveness fixes - Critical deadline
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500">2.</span>
            Finish Apollo homepage hero section
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500">3.</span>
            Clear QC queue - 4 tasks pending review
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500">4.</span>
            Fix CareConnect contact form bug (Critical)
          </li>
        </ul>
      </div>
    </div>
  )
}
