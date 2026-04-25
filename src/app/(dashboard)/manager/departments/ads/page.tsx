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

export default function AdsDepartmentPage() {
  const [data, setData] = useState<DepartmentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDepartmentData()
  }, [])

  const fetchDepartmentData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/manager/departments/ads')
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

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`
    return `${(amount / 1000).toFixed(0)}K`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Failed to load department data</p>
        <button onClick={fetchDepartmentData} className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg">
          Retry
        </button>
      </div>
    )
  }

  const { teamMembers, projects, stats } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ads Department</h1>
            <p className="text-orange-100">Paid Advertising Team (Google, Meta, LinkedIn)</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-orange-100 text-sm">Team Size</p>
              <p className="text-2xl font-bold">{stats.teamSize}</p>
            </div>
            <div className="text-right">
              <p className="text-orange-100 text-sm">Active Clients</p>
              <p className="text-2xl font-bold">{stats.activeProjects}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
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
          <p className="text-3xl font-bold text-orange-600">{stats.avgQCScore}%</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">On Leave</p>
          <p className="text-3xl font-bold text-amber-400">{stats.onLeaveCount}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Delayed Projects</p>
          <p className="text-3xl font-bold text-red-400">{stats.delayedProjects}</p>
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
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        member.qcScore >= 90 ? 'bg-green-500/20 text-green-400' :
                        member.qcScore >= 80 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        QC: {member.qcScore}%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div className="text-center p-2 bg-green-500/10 rounded">
                      <p className="font-bold text-green-400">{member.tasksCompleted}</p>
                      <p className="text-xs text-slate-400">Done</p>
                    </div>
                    <div className="text-center p-2 bg-amber-500/10 rounded">
                      <p className="font-bold text-amber-400">{member.tasksPending}</p>
                      <p className="text-xs text-slate-400">Pending</p>
                    </div>
                    <div className="text-center p-2 bg-orange-500/10 rounded">
                      <p className="font-bold text-orange-600">{member.projectsActive}</p>
                      <p className="text-xs text-slate-400">Projects</p>
                    </div>
                    <div className="text-center p-2 bg-blue-500/10 rounded">
                      <p className="font-bold text-blue-400">{member.availability === 'ON_LEAVE' ? 'Leave' : 'Active'}</p>
                      <p className="text-xs text-slate-400">Status</p>
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
            <h2 className="font-semibold text-white">Client Campaigns</h2>
          </div>
          <div className="divide-y divide-white/10">
            {projects.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No active campaigns in this department
              </div>
            ) : (
              projects.map(project => (
                <div key={project.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-white">{project.client}</p>
                      <p className="text-sm text-slate-400">Google + Meta</p>
                    </div>
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
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Assignee: {project.assignee}</span>
                    <span className="text-slate-400">Due: {project.deadline !== 'TBD' ? new Date(project.deadline).toLocaleDateString('en-IN') : 'TBD'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-orange-500/10 rounded-xl border border-orange-500/30 p-4">
        <h3 className="font-semibold text-orange-800 mb-3">Performance Insights</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-orange-700">
          <div>
            <p className="font-medium mb-1">Team Capacity</p>
            <ul className="space-y-1">
              <li>- Available: {teamMembers.filter(m => m.availability === 'AVAILABLE').length} members</li>
              <li>- Busy: {teamMembers.filter(m => m.availability === 'BUSY').length} members</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Campaign Status</p>
            <ul className="space-y-1">
              <li>- On Track: {projects.filter(p => p.status === 'ON_TRACK').length} campaigns</li>
              <li>- At Risk: {projects.filter(p => p.status === 'AT_RISK').length} campaigns</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Actions</p>
            <ul className="space-y-1">
              <li>- Review delayed campaigns</li>
              <li>- Optimize underperforming ads</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
