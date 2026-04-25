'use client'

export default function WebWorkSummaryPage() {
  const monthlyMetrics = {
    projectsCompleted: 3,
    projectsActive: 5,
    tasksCompleted: 85,
    avgDeliveryTime: 28,
    qcPassRate: 88,
    bugsResolved: 12,
  }

  const projectPerformance = [
    { project: 'MaxCare Hospital Website', deliveryTime: 45, onTime: true, rating: 4.8 },
    { project: 'HealthPlus Landing Page', deliveryTime: 10, onTime: true, rating: 4.5 },
    { project: 'Wellness Clinic Revamp', deliveryTime: 30, onTime: true, rating: 4.9 },
    { project: 'DiagnoLab Performance Fix', deliveryTime: 5, onTime: true, rating: 5.0 },
  ]

  const teamPerformance = [
    { name: 'Manish', tasksCompleted: 28, qcScore: 94, bugsFixed: 3 },
    { name: 'Shivam', tasksCompleted: 32, qcScore: 91, bugsFixed: 5 },
    { name: 'Aniket', tasksCompleted: 18, qcScore: 85, bugsFixed: 2 },
    { name: 'Chitransh', tasksCompleted: 15, qcScore: 88, bugsFixed: 2 },
  ]

  const technologyBreakdown = [
    { tech: 'Next.js', projects: 3 },
    { tech: 'WordPress', projects: 2 },
    { tech: 'React', projects: 2 },
    { tech: 'Static HTML', projects: 1 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Work Summary</h1>
            <p className="text-indigo-200">March 2024 Performance Report</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-indigo-200 text-sm">Projects Delivered</p>
              <p className="text-3xl font-bold">{monthlyMetrics.projectsCompleted}</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-sm">QC Pass Rate</p>
              <p className="text-3xl font-bold">{monthlyMetrics.qcPassRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-6 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Projects Completed</p>
          <p className="text-2xl font-bold text-green-400">{monthlyMetrics.projectsCompleted}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Active Projects</p>
          <p className="text-2xl font-bold text-blue-400">{monthlyMetrics.projectsActive}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Tasks Done</p>
          <p className="text-2xl font-bold text-white">{monthlyMetrics.tasksCompleted}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Avg Delivery</p>
          <p className="text-2xl font-bold text-white">{monthlyMetrics.avgDeliveryTime} days</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">QC Pass Rate</p>
          <p className="text-2xl font-bold text-indigo-600">{monthlyMetrics.qcPassRate}%</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Bugs Resolved</p>
          <p className="text-2xl font-bold text-purple-400">{monthlyMetrics.bugsResolved}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Team Performance</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/40">
                <th className="text-left py-2 px-4 text-xs font-semibold text-slate-400">MEMBER</th>
                <th className="text-center py-2 px-4 text-xs font-semibold text-slate-400">TASKS</th>
                <th className="text-center py-2 px-4 text-xs font-semibold text-slate-400">QC SCORE</th>
                <th className="text-center py-2 px-4 text-xs font-semibold text-slate-400">BUGS FIXED</th>
              </tr>
            </thead>
            <tbody>
              {teamPerformance.map(member => (
                <tr key={member.name} className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium text-white">{member.name}</td>
                  <td className="py-3 px-4 text-center text-slate-300">{member.tasksCompleted}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-medium ${
                      member.qcScore >= 90 ? 'text-green-400' : 'text-amber-400'
                    }`}>
                      {member.qcScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-300">{member.bugsFixed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Project Performance */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Delivered Projects</h2>
          </div>
          <div className="divide-y divide-white/10">
            {projectPerformance.map((project, idx) => (
              <div key={project.project} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-white">{project.project}</p>
                  <span className="text-amber-400 font-medium">{project.rating} ★</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>Delivery: {project.deliveryTime} days</span>
                  <span className={project.onTime ? 'text-green-400' : 'text-red-400'}>
                    {project.onTime ? 'On Time' : 'Delayed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Breakdown */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <h3 className="font-semibold text-white mb-4">Technology Stack Usage</h3>
        <div className="grid grid-cols-4 gap-4">
          {technologyBreakdown.map(tech => (
            <div key={tech.tech} className="text-center p-3 bg-slate-900/40 rounded-lg">
              <p className="text-2xl font-bold text-indigo-600">{tech.projects}</p>
              <p className="text-sm text-slate-300">{tech.tech}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary & Recommendations */}
      <div className="bg-indigo-500/10 rounded-xl border border-indigo-200 p-4">
        <h3 className="font-semibold text-indigo-800 mb-3">Monthly Summary</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-indigo-700">
          <div>
            <p className="font-medium mb-1">Achievements</p>
            <ul className="space-y-1">
              <li>- 3 projects delivered on time</li>
              <li>- 88% QC pass rate</li>
              <li>- All client ratings above 4.5</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Areas to Improve</p>
            <ul className="space-y-1">
              <li>- Reduce QC return rate</li>
              <li>- Mobile responsiveness issues</li>
              <li>- Performance optimization</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Next Month Goals</p>
            <ul className="space-y-1">
              <li>- Achieve 95% QC pass rate</li>
              <li>- Complete Apollo & MedPlus</li>
              <li>- Start WellnessHub project</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
