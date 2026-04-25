'use client'

import { useState, useEffect } from 'react'

interface TeamMember {
  id: string
  empId: string
  name: string
  role: string
  tasksCompleted: number
  tasksPending: number
  qcScore: number
  projectsActive: number
  availability: 'AVAILABLE' | 'BUSY' | 'ON_LEAVE'
}

interface ClientProject {
  id: string
  client: string
  projectType: string
  status: 'ON_TRACK' | 'DELAYED' | 'AT_RISK'
  progress: number
  deadline: string
  assignee: string
}

interface DepartmentData {
  department: string
  teamMembers: TeamMember[]
  projects: ClientProject[]
  stats: {
    teamSize: number
    totalTasks: number
    completedTasks: number
    completionRate: number
    avgQCScore: number
    onLeaveCount: number
    delayedProjects: number
    activeProjects: number
  }
}

export default function SEODepartmentPage() {
  const [data, setData] = useState<DepartmentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDepartmentData()
  }, [])

  const fetchDepartmentData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/manager/departments/seo')
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch department data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Failed to load department data</p>
        <button onClick={fetchDepartmentData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
          Retry
        </button>
      </div>
    )
  }

  const { teamMembers, projects, stats } = data
  const totalEscalations = 0 // Would need escalation data from API

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">SEO Department</h1>
            <p className="text-blue-100">Search Engine Optimization Team</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-blue-100 text-sm">Team Size</p>
              <p className="text-2xl font-bold">{stats.teamSize}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Active Clients</p>
              <p className="text-2xl font-bold">{stats.activeProjects}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Tasks Completed</p>
          <p className="text-3xl font-bold text-green-400">{stats.completedTasks}</p>
          <p className="text-xs text-slate-400">of {stats.totalTasks} total</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Completion Rate</p>
          <p className="text-3xl font-bold text-white">{stats.completionRate}%</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Avg QC Score</p>
          <p className="text-3xl font-bold text-blue-400">{stats.avgQCScore}%</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Escalations</p>
          <p className="text-3xl font-bold text-red-400">{totalEscalations}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Team Performance</h2>
          </div>
          <div className="divide-y divide-white/10">
            {teamMembers.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No team members found in this department
              </div>
            ) : (
              teamMembers.map(member => (
                <div key={member.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-white">{member.name}</p>
                      <p className="text-sm text-slate-400">{member.role}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      member.qcScore >= 90 ? 'bg-green-500/20 text-green-400' :
                      member.qcScore >= 80 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      QC: {member.qcScore}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 bg-green-500/10 rounded">
                      <p className="font-bold text-green-400">{member.tasksCompleted}</p>
                      <p className="text-xs text-slate-400">Completed</p>
                    </div>
                    <div className="text-center p-2 bg-amber-500/10 rounded">
                      <p className="font-bold text-amber-400">{member.tasksPending}</p>
                      <p className="text-xs text-slate-400">Pending</p>
                    </div>
                    <div className="text-center p-2 bg-blue-500/10 rounded">
                      <p className="font-bold text-blue-400">{member.projectsActive}</p>
                      <p className="text-xs text-slate-400">Projects</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Client Projects */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Client Projects</h2>
          </div>
          <div className="divide-y divide-white/10">
            {projects.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No active projects in this department
              </div>
            ) : (
              projects.map(project => (
                <div key={project.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-white">{project.client}</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      project.status === 'ON_TRACK' ? 'bg-green-500/20 text-green-400' :
                      project.status === 'DELAYED' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {project.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          project.status === 'ON_TRACK' ? 'bg-green-500' :
                          project.status === 'DELAYED' ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-400">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Assignee: {project.assignee}</span>
                    <span>Due: {project.deadline !== 'TBD' ? new Date(project.deadline).toLocaleDateString('en-IN') : 'TBD'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
