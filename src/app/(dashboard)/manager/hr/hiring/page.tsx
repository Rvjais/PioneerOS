'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface Candidate {
  id: string
  name: string
  position: string
  department: string
  status: string
  currentStage: string
  experience: number | null
  source: string
}

export default function ManagerHRHiringPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/hiring/candidates')
      .then(res => res.json())
      .then(data => {
        const items = Array.isArray(data) ? data : data.data || data.candidates || []
        setCandidates(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: candidates.length,
    inPipeline: candidates.filter(c => !['JOINED', 'REJECTED'].includes(c.status)).length,
    interviewing: candidates.filter(c => ['PHONE_SCREEN', 'MANAGER_INTERVIEW', 'FOUNDER_INTERVIEW'].includes(c.status)).length,
    hired: candidates.filter(c => c.status === 'JOINED').length,
  }

  const getStageColor = (stage: string) => {
    if (['APPLIED'].includes(stage)) return 'bg-slate-800/50 text-slate-300'
    if (['PHONE_SCREEN_SCHEDULED', 'PHONE_SCREEN_DONE'].includes(stage)) return 'bg-blue-500/20 text-blue-400'
    if (['MANAGER_INTERVIEW_SCHEDULED', 'MANAGER_INTERVIEW_DONE'].includes(stage)) return 'bg-purple-500/20 text-purple-400'
    if (['TEST_TASK_ASSIGNED', 'TEST_TASK_SUBMITTED'].includes(stage)) return 'bg-amber-500/20 text-amber-400'
    if (['OFFER_PENDING', 'OFFER_SENT', 'OFFER_ACCEPTED'].includes(stage)) return 'bg-emerald-500/20 text-emerald-400'
    if (stage === 'JOINED') return 'bg-green-500/20 text-green-400'
    if (stage === 'REJECTED') return 'bg-red-500/20 text-red-400'
    return 'bg-slate-800/50 text-slate-400'
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hiring Pipeline</h1>
          <p className="text-slate-400">Active candidates and recruitment progress</p>
        </div>
        <Link href="/hiring" className="px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl text-sm font-medium hover:bg-orange-500/30 transition-colors">
          View Full Pipeline
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Candidates', value: stats.total, icon: Users, color: 'text-slate-400' },
          { label: 'In Pipeline', value: stats.inPipeline, icon: Clock, color: 'text-blue-400' },
          { label: 'Interviewing', value: stats.interviewing, icon: UserPlus, color: 'text-purple-400' },
          { label: 'Hired', value: stats.hired, icon: CheckCircle2, color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900/40 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Candidate Table */}
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs font-medium text-slate-400 uppercase px-5 py-3">Candidate</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase px-5 py-3">Position</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase px-5 py-3">Department</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase px-5 py-3">Stage</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase px-5 py-3">Exp</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase px-5 py-3">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {candidates.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No candidates in pipeline</td></tr>
            ) : (
              candidates.slice(0, 20).map(c => (
                <tr key={c.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3 font-medium text-white">{c.name}</td>
                  <td className="px-5 py-3 text-sm text-slate-300">{c.position || '-'}</td>
                  <td className="px-5 py-3 text-sm text-slate-400">{c.department || '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStageColor(c.currentStage)}`}>
                      {c.currentStage?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-300">{c.experience ? `${c.experience}y` : '-'}</td>
                  <td className="px-5 py-3 text-sm text-slate-400">{c.source?.replace(/_/g, ' ')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
