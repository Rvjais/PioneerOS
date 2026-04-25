'use client'

import { useState } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { WEB_PROJECT_PHASES, PHASE_STATUS, getColorForValue, getLabelForValue } from '@/shared/constants/formConstants'

interface Phase {
  id: string
  phase: string
  status: string
  order: number
  notes?: string | null
  proofUrl?: string | null
  startedAt?: string | null
  completedAt?: string | null
  user?: {
    id: string
    firstName: string
    lastName?: string | null
  } | null
}

interface Props {
  clientId: string
  phases: Phase[]
  onUpdate: () => void
}

export function PhaseTracker({ clientId, phases, onUpdate }: Props) {
  const [updating, setUpdating] = useState<string | null>(null)
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesValue, setNotesValue] = useState('')
  const [proofValue, setProofValue] = useState('')

  async function updatePhase(phase: string, data: Record<string, unknown>) {
    setUpdating(phase)
    try {
      const res = await fetch(`/api/web-clients/${clientId}/phases`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase, ...data }),
      })

      if (res.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to update phase:', error)
    } finally {
      setUpdating(null)
    }
  }

  function handleStatusChange(phase: Phase, newStatus: string) {
    updatePhase(phase.phase, { status: newStatus })
  }

  function handleSaveNotes(phase: Phase) {
    updatePhase(phase.phase, { notes: notesValue, proofUrl: proofValue })
    setEditingNotes(null)
  }

  function getPhaseIcon(phase: Phase) {
    const config = WEB_PROJECT_PHASES.find((p) => p.value === phase.phase)
    const iconClass = 'w-5 h-5'

    switch (config?.icon) {
      case 'file-text':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'palette':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        )
      case 'image':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'code':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        )
      case 'check-circle':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'rocket':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      default:
        return <span className="text-sm font-bold">{phase.order}</span>
    }
  }

  const sortedPhases = [...phases].sort((a, b) => a.order - b.order)
  const completedCount = phases.filter((p) => p.status === 'COMPLETED').length
  const progress = phases.length > 0 ? Math.round((completedCount / phases.length) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white">Project Progress</h3>
          <span className="text-lg font-bold text-teal-600">{progress}%</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-slate-400 mt-2">
          {completedCount} of {phases.length} phases completed
        </p>
      </div>

      {/* Phase Pipeline */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 bg-slate-900/40">
          <h3 className="font-semibold text-white">Project Phases</h3>
        </div>

        <div className="divide-y divide-white/10">
          {sortedPhases.map((phase) => {
            const config = WEB_PROJECT_PHASES.find((p) => p.value === phase.phase)
            const isExpanded = expandedPhase === phase.id
            const isEditing = editingNotes === phase.id

            return (
              <div key={phase.id} className="transition-colors">
                {/* Phase Header */}
                <div
                  className={`p-4 cursor-pointer hover:bg-slate-900/40 ${
                    phase.status === 'IN_PROGRESS' ? 'bg-teal-50/50' : ''
                  }`}
                  onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          phase.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-600'
                            : phase.status === 'IN_PROGRESS'
                            ? 'bg-teal-500/20 text-teal-400'
                            : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {phase.status === 'COMPLETED' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          getPhaseIcon(phase)
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">
                          {phase.order}. {config?.label || phase.phase}
                        </h4>
                        <p className="text-sm text-slate-400">{config?.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getColorForValue(PHASE_STATUS, phase.status)}`}
                      >
                        {getLabelForValue(PHASE_STATUS, phase.status)}
                      </span>
                      <svg
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 bg-slate-900/40" onClick={(e) => e.stopPropagation()}>
                    <div className="pl-13 space-y-4">
                      {/* Status Actions */}
                      <div className="flex flex-wrap gap-2">
                        {PHASE_STATUS.map((status) => (
                          <button
                            key={status.value}
                            onClick={() => handleStatusChange(phase, status.value)}
                            disabled={updating === phase.phase || phase.status === status.value}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                              phase.status === status.value
                                ? `${status.color} ring-2 ring-offset-1 ring-slate-300`
                                : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
                            } disabled:opacity-50`}
                          >
                            {updating === phase.phase ? '...' : status.label}
                          </button>
                        ))}
                      </div>

                      {/* Notes and Proof */}
                      {isEditing ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1">
                              Notes
                            </label>
                            <textarea
                              value={notesValue}
                              onChange={(e) => setNotesValue(e.target.value)}
                              placeholder="Add notes about this phase..."
                              rows={3}
                              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1">
                              Proof URL
                            </label>
                            <input
                              type="url"
                              value={proofValue}
                              onChange={(e) => setProofValue(e.target.value)}
                              placeholder="Link to design, staging site, etc."
                              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingNotes(null)}
                              className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-lg hover:bg-white/10"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveNotes(phase)}
                              disabled={updating === phase.phase}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {(phase.notes || phase.proofUrl) && (
                            <div className="glass-card rounded-lg p-3 mb-2 border border-white/10">
                              {phase.notes && (
                                <p className="text-sm text-slate-300 mb-2">{phase.notes}</p>
                              )}
                              {phase.proofUrl && (
                                <a
                                  href={phase.proofUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  View Proof
                                </a>
                              )}
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setEditingNotes(phase.id)
                              setNotesValue(phase.notes || '')
                              setProofValue(phase.proofUrl || '')
                            }}
                            className="text-sm text-teal-600 hover:text-teal-700"
                          >
                            {phase.notes || phase.proofUrl ? 'Edit Notes' : 'Add Notes'}
                          </button>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="text-xs text-slate-400 space-y-1">
                        {phase.startedAt && (
                          <p>Started: {formatDateDDMMYYYY(phase.startedAt)}</p>
                        )}
                        {phase.completedAt && (
                          <p>Completed: {formatDateDDMMYYYY(phase.completedAt)}</p>
                        )}
                        {phase.user && (
                          <p>
                            Assigned to: {phase.user.firstName} {phase.user.lastName || ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
