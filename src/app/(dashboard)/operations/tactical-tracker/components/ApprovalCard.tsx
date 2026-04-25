'use client'

import { useState } from 'react'

interface Deliverable {
  id: string
  clientId: string
  category: string
  workItem: string
  description: string | null
  month: string
  proofUrl: string | null
  kpi: string | null
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REVISION_REQUIRED'
  submittedBy: { id: string; firstName: string; lastName: string } | null
  reviewedBy: { id: string; firstName: string; lastName: string } | null
  createdBy: { id: string; firstName: string; lastName: string } | null
  clientVisible: boolean
}

interface ApprovalCardProps {
  item: Deliverable
  clientName: string
  selected: boolean
  onSelect: (id: string, selected: boolean) => void
  onApprove: (id: string) => Promise<void>
  onRevise: (id: string) => Promise<void>
}

export function ApprovalCard({ item, clientName, selected, onSelect, onApprove, onRevise }: ApprovalCardProps) {
  const [loading, setLoading] = useState<'approve' | 'revise' | null>(null)

  const handleApprove = async () => {
    setLoading('approve')
    try {
      await onApprove(item.id)
    } finally {
      setLoading(null)
    }
  }

  const handleRevise = async () => {
    setLoading('revise')
    try {
      await onRevise(item.id)
    } finally {
      setLoading(null)
    }
  }

  const submitterName = item.createdBy
    ? `${item.createdBy.firstName} ${item.createdBy.lastName.charAt(0)}.`
    : 'Unknown'

  return (
    <div className="glass-card rounded-xl border border-white/10 p-4 hover:border-indigo-200 transition-colors">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(item.id, e.target.checked)}
          className="mt-1 w-4 h-4 text-indigo-600 border-white/20 rounded focus:ring-indigo-500"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-white truncate">{item.workItem}</p>
              <p className="text-sm text-slate-400">{clientName}</p>
            </div>
            <span className="px-2 py-1 text-xs font-medium rounded bg-slate-800/50 text-slate-300 whitespace-nowrap">
              {item.category.replace(/_/g, ' ')}
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-1">by {submitterName}</p>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {item.proofUrl && (
              <a
                href={item.proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm text-indigo-600 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20 transition-colors"
              >
                View Proof
              </a>
            )}
            <button
              onClick={handleApprove}
              disabled={loading !== null}
              className="px-3 py-1.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              {loading === 'approve' ? '...' : '✓ Approve'}
            </button>
            <button
              onClick={handleRevise}
              disabled={loading !== null}
              className="px-3 py-1.5 text-sm text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              {loading === 'revise' ? '...' : '✕ Revise'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
