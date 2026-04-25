'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface AppraisalCycle {
  year: number
  total: number
  pending: number
  inProgress: number
  submitted: number
  completed: number
}

interface EmployeeAppraisal {
  id: string
  userId: string
  name: string
  empId: string
  department: string
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED'
  cycleYear: number
  selfRating?: number
  finalRating?: number
  submittedAt?: string
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-slate-700 text-slate-300',
  IN_PROGRESS: 'bg-yellow-900/50 text-yellow-300',
  SUBMITTED: 'bg-blue-900/50 text-blue-300',
  COMPLETED: 'bg-green-900/50 text-green-300',
}

export default function AppraisalWorkflowPage() {
  const [cycle, setCycle] = useState<AppraisalCycle | null>(null)
  const [appraisals, setAppraisals] = useState<EmployeeAppraisal[]>([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)
  const [completing, setCompleting] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const currentYear = new Date().getFullYear()

  useEffect(() => {
    fetchAppraisals()
  }, [])

  async function fetchAppraisals() {
    setLoading(true)
    try {
      const empRes = await fetch('/api/employees')
      if (empRes.ok) {
        const data = await empRes.json()
        const employees = Array.isArray(data) ? data : data.employees || []

        const mapped: EmployeeAppraisal[] = employees.map((e: { appraisalId?: string; id: string; firstName?: string; lastName?: string; name?: string; empId?: string; department?: string; appraisalStatus?: string; selfRating?: number; finalRating?: number; appraisalSubmittedAt?: string }) => ({
          id: e.appraisalId || e.id,
          userId: e.id,
          name: `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.name || 'Unknown',
          empId: e.empId || '-',
          department: e.department || 'General',
          status: e.appraisalStatus || 'PENDING',
          cycleYear: currentYear,
          selfRating: e.selfRating,
          finalRating: e.finalRating,
          submittedAt: e.appraisalSubmittedAt,
        }))

        setAppraisals(mapped)

        const pending = mapped.filter(a => a.status === 'PENDING').length
        const inProgress = mapped.filter(a => a.status === 'IN_PROGRESS').length
        const submitted = mapped.filter(a => a.status === 'SUBMITTED').length
        const completed = mapped.filter(a => a.status === 'COMPLETED').length

        setCycle({
          year: currentYear,
          total: mapped.length,
          pending,
          inProgress,
          submitted,
          completed,
        })
      }
    } catch (err) {
      console.error('Failed to fetch appraisals:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleTriggerCycle() {
    setTriggering(true)
    try {
      const res = await fetch('/api/hr/appraisals/trigger', { method: 'POST' })
      if (res.ok) {
        await fetchAppraisals()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to trigger appraisals')
      }
    } catch {
      toast.error('Failed to trigger appraisal cycle')
    } finally {
      setTriggering(false)
    }
  }

  async function handleComplete(appraisalId: string) {
    const rating = prompt('Enter final rating (1-5):')
    if (!rating || isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) return

    setCompleting(appraisalId)
    try {
      const res = await fetch(`/api/hr/appraisals/${appraisalId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          managerRating: Number(rating),
          finalRating: Number(rating),
          managerComments: '',
          incrementRecommendation: false,
          promotionRecommendation: false,
        }),
      })
      if (res.ok) {
        await fetchAppraisals()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to complete appraisal')
      }
    } catch {
      toast.error('Failed to complete appraisal')
    } finally {
      setCompleting(null)
    }
  }

  const filtered = appraisals.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.empId.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-500">Loading appraisals...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Appraisal Workflow</h1>
          <p className="text-sm text-slate-400 mt-1">Cycle Year: {currentYear}</p>
        </div>
        <button
          onClick={handleTriggerCycle}
          disabled={triggering}
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500/100 text-white font-semibold text-sm disabled:opacity-50 transition-colors"
        >
          {triggering ? 'Triggering...' : 'Start Appraisal Cycle'}
        </button>
      </div>

      {/* Stats */}
      {cycle && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total', value: cycle.total, color: 'text-white' },
            { label: 'Pending', value: cycle.pending, color: 'text-slate-400' },
            { label: 'In Progress', value: cycle.inProgress, color: 'text-yellow-300' },
            { label: 'Submitted', value: cycle.submitted, color: 'text-blue-300' },
            { label: 'Completed', value: cycle.completed, color: 'text-green-300' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-white/10 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-2">
          {['all', 'PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs rounded-full border ${statusFilter === s ? 'bg-orange-600 border-orange-500 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}
            >
              {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or ID..."
          className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Employee List */}
      <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-left">
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Emp ID</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Self Rating</th>
              <th className="px-4 py-3 font-medium">Final Rating</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">No appraisals found</td>
              </tr>
            ) : (
              filtered.map(a => (
                <tr key={a.id} className="border-b border-white/5 hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-white font-medium">{a.name}</td>
                  <td className="px-4 py-3 text-slate-400">{a.empId}</td>
                  <td className="px-4 py-3 text-slate-400">{a.department}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[a.status]}`}>
                      {a.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{a.selfRating ? `${a.selfRating}/5` : '-'}</td>
                  <td className="px-4 py-3 text-slate-300">{a.finalRating ? `${a.finalRating}/5` : '-'}</td>
                  <td className="px-4 py-3">
                    {a.status === 'SUBMITTED' && (
                      <button
                        onClick={() => handleComplete(a.id)}
                        disabled={completing === a.id}
                        className="px-3 py-1 text-xs rounded-lg bg-green-700 hover:bg-green-600 text-white disabled:opacity-50"
                      >
                        {completing === a.id ? '...' : 'Complete'}
                      </button>
                    )}
                    {a.status === 'COMPLETED' && (
                      <span className="text-xs text-green-400">Done</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
