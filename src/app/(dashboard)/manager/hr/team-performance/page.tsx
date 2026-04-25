'use client'

import { useState, useEffect } from 'react'

interface TeamMember {
  id: string
  empId: string
  name: string
  department: string
  role: string
  tasksCompleted: number
  tasksTotal: number
  qcScore: number
  attendance: number
  rating: number
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'UNDERPERFORMING'
}

interface TeamPerformanceData {
  teamMembers: TeamMember[]
  stats: {
    teamSize: number
    excellentCount: number
    goodCount: number
    needsImprovementCount: number
    underperformingCount: number
    avgQCScore: number
    avgAttendance: number
  }
}

export default function ManagerHRTeamPerformancePage() {
  const [data, setData] = useState<TeamPerformanceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeamPerformance()
  }, [])

  const fetchTeamPerformance = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/manager/hr/team-performance')
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch team performance:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return 'bg-green-500/20 text-green-400'
      case 'GOOD': return 'bg-blue-500/20 text-blue-400'
      case 'NEEDS_IMPROVEMENT': return 'bg-amber-500/20 text-amber-400'
      case 'UNDERPERFORMING': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Failed to load team performance data</p>
        <button onClick={fetchTeamPerformance} className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg">
          Retry
        </button>
      </div>
    )
  }

  const { teamMembers, stats } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Team Performance</h1>
            <p className="text-pink-100">Overall team performance metrics</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-pink-100 text-sm">Team Size</p>
              <p className="text-3xl font-bold">{stats.teamSize}</p>
            </div>
            <div className="text-right">
              <p className="text-pink-100 text-sm">Avg QC Score</p>
              <p className="text-3xl font-bold">{stats.avgQCScore}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Excellent</p>
          <p className="text-3xl font-bold text-green-400">{stats.excellentCount}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Good</p>
          <p className="text-3xl font-bold text-blue-400">{stats.goodCount}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Needs Work</p>
          <p className="text-3xl font-bold text-amber-400">{stats.needsImprovementCount}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Underperforming</p>
          <p className="text-3xl font-bold text-red-400">{stats.underperformingCount}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Avg QC</p>
          <p className="text-3xl font-bold text-purple-400">{stats.avgQCScore}%</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Avg Attendance</p>
          <p className="text-3xl font-bold text-white">{stats.avgAttendance}%</p>
        </div>
      </div>

      {/* Team Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">EMPLOYEE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">DEPARTMENT</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">TASKS</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">QC SCORE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">ATTENDANCE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">RATING</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No team members found
                </td>
              </tr>
            ) : (
              teamMembers.map(member => (
                <tr key={member.id} className="border-b border-white/5 hover:bg-slate-900/40">
                  <td className="py-4 px-4">
                    <p className="font-medium text-white">{member.name}</p>
                    <p className="text-sm text-slate-400">{member.role}</p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-sm text-slate-300">{member.department}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            member.tasksTotal > 0 && member.tasksCompleted / member.tasksTotal >= 0.9 ? 'bg-green-500' :
                            member.tasksTotal > 0 && member.tasksCompleted / member.tasksTotal >= 0.7 ? 'bg-amber-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${member.tasksTotal > 0 ? (member.tasksCompleted / member.tasksTotal) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-300">{member.tasksCompleted}/{member.tasksTotal}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`font-medium ${
                      member.qcScore >= 90 ? 'text-green-400' :
                      member.qcScore >= 80 ? 'text-amber-400' :
                      'text-red-400'
                    }`}>
                      {member.qcScore}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`font-medium ${
                      member.attendance >= 95 ? 'text-green-400' :
                      member.attendance >= 85 ? 'text-amber-400' :
                      'text-red-400'
                    }`}>
                      {member.attendance}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-amber-400">★ {member.rating}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(member.status)}`}>
                      {member.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Performance Actions */}
      <div className="bg-pink-50 rounded-xl border border-pink-200 p-4">
        <h3 className="font-semibold text-pink-800 mb-3">Performance Summary</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-pink-700">
          <div>
            <p className="font-medium mb-1">Top Performers</p>
            <ul className="space-y-1">
              {teamMembers.filter(m => m.status === 'EXCELLENT').slice(0, 3).map(m => (
                <li key={m.id}>- {m.name}: ★ {m.rating}</li>
              ))}
              {teamMembers.filter(m => m.status === 'EXCELLENT').length === 0 && (
                <li>No top performers this period</li>
              )}
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Needs Support</p>
            <ul className="space-y-1">
              {teamMembers.filter(m => m.status === 'NEEDS_IMPROVEMENT').slice(0, 3).map(m => (
                <li key={m.id}>- {m.name}: {m.qcScore}% QC</li>
              ))}
              {teamMembers.filter(m => m.status === 'NEEDS_IMPROVEMENT').length === 0 && (
                <li>No members need support</li>
              )}
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Urgent Attention</p>
            <ul className="space-y-1">
              {teamMembers.filter(m => m.status === 'UNDERPERFORMING').slice(0, 3).map(m => (
                <li key={m.id}>- {m.name}: PIP discussion needed</li>
              ))}
              {teamMembers.filter(m => m.status === 'UNDERPERFORMING').length === 0 && (
                <li>No urgent attention needed</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
