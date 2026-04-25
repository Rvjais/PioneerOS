'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ChecklistItem {
  id: string
  exitProcessId: string
  category: string
  item: string
  status: string
  responsibleRole: string | null
  isCompleted: boolean
  completedAt: string | null
  completedBy: string | null
  notes: string | null
}

interface ExitChecklistClientProps {
  exitProcessId: string
  checklist: ChecklistItem[]
  processStatus: string
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  HR: { label: 'HR Documentation', color: 'text-blue-300', bgColor: 'bg-blue-500/10 border-blue-500/20' },
  IT_ACCESS: { label: 'IT & Access', color: 'text-purple-300', bgColor: 'bg-purple-500/10 border-purple-500/20' },
  DEPARTMENT: { label: 'Department Handover', color: 'text-amber-300', bgColor: 'bg-amber-500/10 border-amber-500/20' },
  FINANCE: { label: 'Finance Clearance', color: 'text-emerald-300', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
}

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  PENDING: { color: 'text-slate-400', bgColor: 'bg-slate-500/20', label: 'Pending' },
  IN_PROGRESS: { color: 'text-amber-400', bgColor: 'bg-amber-500/20', label: 'In Progress' },
  COMPLETED: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', label: 'Completed' },
}

export function ExitChecklistClient({ exitProcessId, checklist, processStatus }: ExitChecklistClientProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  const hasChecklist = checklist.length > 0

  // Group by category
  const grouped: Record<string, ChecklistItem[]> = {}
  for (const item of checklist) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }

  const totalItems = checklist.length
  const completedItems = checklist.filter((c) => c.status === 'COMPLETED').length
  const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const handleGenerateChecklist = async () => {
    setGenerating(true)
    try {
      const res = await fetch(`/api/hr/exit/${exitProcessId}/checklist`, {
        method: 'POST',
      })
      if (res.ok) {
        router.refresh()
      }
    } catch {
      // silently fail
    } finally {
      setGenerating(false)
    }
  }

  const cycleStatus = (current: string): string => {
    if (current === 'PENDING') return 'IN_PROGRESS'
    if (current === 'IN_PROGRESS') return 'COMPLETED'
    return 'PENDING'
  }

  const handleToggleStatus = async (item: ChecklistItem) => {
    const newStatus = cycleStatus(item.status)
    setUpdating(item.id)
    try {
      const res = await fetch(`/api/hr/exit/${exitProcessId}/checklist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklistItemId: item.id, status: newStatus }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch {
      // silently fail
    } finally {
      setUpdating(null)
    }
  }

  // Generate checklist button (when no checklist exists)
  if (!hasChecklist) {
    return (
      <div className="mt-4 pt-4 border-t border-white/5">
        <button
          onClick={handleGenerateChecklist}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:shadow-lg disabled:opacity-50 transition-all"
        >
          {generating ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Generate Checklist
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="mt-4 pt-4 border-t border-white/5">
      {/* Expandable header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white">Clearance Checklist</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
            {completedItems}/{totalItems} ({overallProgress}%)
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Overall progress bar */}
      <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            overallProgress === 100
              ? 'bg-emerald-500'
              : overallProgress > 50
              ? 'bg-blue-500'
              : 'bg-amber-500'
          }`}
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Expanded checklist */}
      {expanded && (
        <div className="mt-4 space-y-4">
          {Object.entries(CATEGORY_CONFIG).map(([catKey, catConfig]) => {
            const items = grouped[catKey] || []
            if (items.length === 0) return null

            const catCompleted = items.filter((i) => i.status === 'COMPLETED').length
            const catProgress = Math.round((catCompleted / items.length) * 100)

            return (
              <div key={catKey} className={`rounded-xl border p-3 ${catConfig.bgColor}`}>
                {/* Category header */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`text-sm font-semibold ${catConfig.color}`}>
                    {catConfig.label}
                  </h4>
                  <span className="text-xs text-slate-400">
                    {catCompleted}/{items.length} ({catProgress}%)
                  </span>
                </div>

                {/* Category progress bar */}
                <div className="w-full bg-white/10 rounded-full h-1 mb-3">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      catProgress === 100 ? 'bg-emerald-400' : 'bg-white/30'
                    }`}
                    style={{ width: `${catProgress}%` }}
                  />
                </div>

                {/* Items */}
                <div className="space-y-1.5">
                  {items.map((item) => {
                    const statusConf = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING
                    const isUpdating = updating === item.id

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 group"
                      >
                        <button
                          onClick={() => handleToggleStatus(item)}
                          disabled={isUpdating || processStatus === 'COMPLETED'}
                          className="flex-shrink-0 disabled:opacity-50"
                          title={`Click to change: ${item.status} → ${cycleStatus(item.status)}`}
                        >
                          {isUpdating ? (
                            <svg className="w-4 h-4 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : item.status === 'COMPLETED' ? (
                            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : item.status === 'IN_PROGRESS' ? (
                            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <circle cx="12" cy="12" r="9" strokeWidth={2} />
                            </svg>
                          )}
                        </button>
                        <span
                          className={`text-xs flex-1 ${
                            item.status === 'COMPLETED'
                              ? 'text-slate-500 line-through'
                              : item.status === 'IN_PROGRESS'
                              ? 'text-amber-200'
                              : 'text-slate-300'
                          }`}
                        >
                          {item.item}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusConf.bgColor} ${statusConf.color}`}>
                          {statusConf.label}
                        </span>
                        {item.responsibleRole && (
                          <span className="text-[10px] text-slate-500">
                            {item.responsibleRole}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
