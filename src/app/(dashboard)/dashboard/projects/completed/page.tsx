'use client'

interface CompletedProject {
  id: string
  name: string
  client: string
  type: string
  completedDate: string
  deliveryTime: number // days
  teamSize: number
  rating: number
}

const COMPLETED_PROJECTS: CompletedProject[] = [
  { id: '1', name: 'MaxCare Hospital Website', client: 'MaxCare Hospital', type: 'Website Development', completedDate: '2024-02-28', deliveryTime: 45, teamSize: 3, rating: 4.8 },
  { id: '2', name: 'HealthPlus Landing Page', client: 'HealthPlus', type: 'Landing Page', completedDate: '2024-02-15', deliveryTime: 10, teamSize: 1, rating: 4.5 },
  { id: '3', name: 'Wellness Clinic Revamp', client: 'Wellness Clinic', type: 'Website Revamp', completedDate: '2024-02-10', deliveryTime: 30, teamSize: 2, rating: 4.9 },
  { id: '4', name: 'DiagnoLab Performance Fix', client: 'DiagnoLab', type: 'Technical Fix', completedDate: '2024-02-05', deliveryTime: 5, teamSize: 1, rating: 5.0 },
  { id: '5', name: 'MedFirst New Website', client: 'MedFirst', type: 'Website Development', completedDate: '2024-01-25', deliveryTime: 60, teamSize: 4, rating: 4.7 },
]

export default function WebCompletedProjectsPage() {
  const totalProjects = COMPLETED_PROJECTS.length
  const avgDeliveryTime = Math.round(COMPLETED_PROJECTS.reduce((sum, p) => sum + p.deliveryTime, 0) / totalProjects)
  const avgRating = (COMPLETED_PROJECTS.reduce((sum, p) => sum + p.rating, 0) / totalProjects).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Completed Projects</h1>
            <p className="text-green-100">Successfully delivered websites</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-green-100 text-sm">Total Delivered</p>
              <p className="text-3xl font-bold">{totalProjects}</p>
            </div>
            <div className="text-right">
              <p className="text-green-100 text-sm">Avg Rating</p>
              <p className="text-3xl font-bold">{avgRating}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total Delivered</p>
          <p className="text-3xl font-bold text-green-400">{totalProjects}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Avg Delivery Time</p>
          <p className="text-3xl font-bold text-white">{avgDeliveryTime} days</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Avg Rating</p>
          <p className="text-3xl font-bold text-amber-400">{avgRating} ★</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">This Month</p>
          <p className="text-3xl font-bold text-indigo-600">{COMPLETED_PROJECTS.filter(p => p.completedDate.startsWith('2024-02')).length}</p>
        </div>
      </div>

      {/* Completed Projects Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">PROJECT</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">TYPE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">COMPLETED</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">DELIVERY TIME</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">TEAM SIZE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">RATING</th>
            </tr>
          </thead>
          <tbody>
            {COMPLETED_PROJECTS.map(project => (
              <tr key={project.id} className="border-b border-white/5 hover:bg-slate-900/40">
                <td className="py-4 px-4">
                  <p className="font-medium text-white">{project.name}</p>
                  <p className="text-sm text-slate-400">{project.client}</p>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="px-2 py-1 text-xs font-medium rounded bg-slate-800/50 text-slate-200">
                    {project.type}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-sm text-slate-300">
                    {new Date(project.completedDate).toLocaleDateString('en-IN')}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-sm font-medium text-white">{project.deliveryTime} days</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-sm text-slate-300">{project.teamSize}</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-sm font-medium text-amber-400">{project.rating} ★</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
        <h3 className="font-semibold text-green-800 mb-3">Delivery Performance</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-green-400">
          <div>
            <p className="font-medium mb-1">By Type</p>
            <ul className="space-y-1">
              <li>- Website Development: 2</li>
              <li>- Landing Pages: 1</li>
              <li>- Revamps: 1</li>
              <li>- Tech Fixes: 1</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Top Rated</p>
            <ul className="space-y-1">
              <li>- DiagnoLab: 5.0 ★</li>
              <li>- Wellness Clinic: 4.9 ★</li>
              <li>- MaxCare: 4.8 ★</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Fastest Delivery</p>
            <ul className="space-y-1">
              <li>- DiagnoLab: 5 days</li>
              <li>- HealthPlus: 10 days</li>
              <li>- Wellness Clinic: 30 days</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
