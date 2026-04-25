'use client'

interface Project {
  id: string
  name: string
  client: string
  type: 'WEBSITE_DEVELOPMENT' | 'WEBSITE_REVAMP' | 'LANDING_PAGE' | 'TECHNICAL_FIX'
  status: 'PLANNING' | 'DESIGN' | 'DEVELOPMENT' | 'TESTING' | 'CLIENT_REVIEW' | 'LIVE'
  progress: number
  deadline: string
  owner: string
  team: string[]
}

const PROJECTS: Project[] = [
  { id: '1', name: 'Apollo Website Revamp', client: 'Apollo Hospitals', type: 'WEBSITE_REVAMP', status: 'DEVELOPMENT', progress: 65, deadline: '2024-03-25', owner: 'Manish', team: ['Shivam', 'Aniket'] },
  { id: '2', name: 'MedPlus Landing Page', client: 'MedPlus Clinics', type: 'LANDING_PAGE', status: 'TESTING', progress: 85, deadline: '2024-03-15', owner: 'Manish', team: ['Chitransh'] },
  { id: '3', name: 'CareConnect Website', client: 'CareConnect', type: 'WEBSITE_DEVELOPMENT', status: 'DEVELOPMENT', progress: 40, deadline: '2024-03-30', owner: 'Shivam', team: ['Aniket', 'Chitransh'] },
  { id: '4', name: 'HealthFirst Performance Fix', client: 'HealthFirst Labs', type: 'TECHNICAL_FIX', status: 'DEVELOPMENT', progress: 55, deadline: '2024-03-18', owner: 'Shivam', team: [] },
  { id: '5', name: 'WellnessHub New Website', client: 'WellnessHub', type: 'WEBSITE_DEVELOPMENT', status: 'DESIGN', progress: 25, deadline: '2024-04-15', owner: 'Manish', team: ['Shivam', 'Chitransh'] },
]

export default function WebActiveProjectsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'bg-slate-800/50 text-slate-200'
      case 'DESIGN': return 'bg-purple-500/20 text-purple-400'
      case 'DEVELOPMENT': return 'bg-blue-500/20 text-blue-400'
      case 'TESTING': return 'bg-amber-500/20 text-amber-400'
      case 'CLIENT_REVIEW': return 'bg-orange-500/20 text-orange-400'
      case 'LIVE': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'WEBSITE_DEVELOPMENT': return 'bg-indigo-500/20 text-indigo-400'
      case 'WEBSITE_REVAMP': return 'bg-blue-500/20 text-blue-400'
      case 'LANDING_PAGE': return 'bg-emerald-500/20 text-emerald-400'
      case 'TECHNICAL_FIX': return 'bg-amber-500/20 text-amber-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const statusOrder = ['PLANNING', 'DESIGN', 'DEVELOPMENT', 'TESTING', 'CLIENT_REVIEW']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Active Projects</h1>
            <p className="text-indigo-200">All ongoing website projects</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-indigo-200 text-sm">Total Active</p>
              <p className="text-3xl font-bold">{PROJECTS.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-5 gap-4">
        {statusOrder.map(status => {
          const count = PROJECTS.filter(p => p.status === status).length
          return (
            <div key={status} className="glass-card rounded-xl border border-white/10 p-4">
              <p className="text-xs text-slate-400">{status.replace(/_/g, ' ')}</p>
              <p className="text-2xl font-bold text-white">{count}</p>
            </div>
          )
        })}
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {PROJECTS.map(project => (
          <div key={project.id} className="glass-card rounded-xl border border-white/10 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{project.name}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(project.type)}`}>
                    {project.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-sm text-slate-400">Client: {project.client}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(project.status)}`}>
                {project.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    project.progress >= 80 ? 'bg-green-500' :
                    project.progress >= 50 ? 'bg-blue-500' :
                    'bg-amber-500'
                  }`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-slate-300">{project.progress}%</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-slate-400">Owner: <span className="font-medium text-slate-200">{project.owner}</span></span>
                {project.team.length > 0 && (
                  <span className="text-slate-400">Team: {project.team.join(', ')}</span>
                )}
              </div>
              <span className={`text-slate-400 ${new Date(project.deadline) < new Date('2024-03-20') ? 'text-red-400 font-medium' : ''}`}>
                Deadline: {new Date(project.deadline).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="bg-indigo-500/10 rounded-xl border border-indigo-200 p-4">
        <h3 className="font-semibold text-indigo-800 mb-3">Project Insights</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-indigo-700">
          <div className="glass-card rounded-lg p-3 border border-indigo-100">
            <p className="text-2xl font-bold text-indigo-600">{PROJECTS.filter(p => p.type === 'WEBSITE_DEVELOPMENT').length}</p>
            <p className="text-slate-300">New Websites</p>
          </div>
          <div className="glass-card rounded-lg p-3 border border-indigo-100">
            <p className="text-2xl font-bold text-blue-400">{PROJECTS.filter(p => p.type === 'WEBSITE_REVAMP').length}</p>
            <p className="text-slate-300">Revamps</p>
          </div>
          <div className="glass-card rounded-lg p-3 border border-indigo-100">
            <p className="text-2xl font-bold text-emerald-600">{PROJECTS.filter(p => p.type === 'LANDING_PAGE').length}</p>
            <p className="text-slate-300">Landing Pages</p>
          </div>
          <div className="glass-card rounded-lg p-3 border border-indigo-100">
            <p className="text-2xl font-bold text-amber-400">{PROJECTS.filter(p => p.type === 'TECHNICAL_FIX').length}</p>
            <p className="text-slate-300">Tech Fixes</p>
          </div>
        </div>
      </div>
    </div>
  )
}
