'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

interface DesignRequest {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  createdAt: string
  clientId: string | null
  clientName: string | null
  designType: string | null
  referenceUrls: string[]
  contentUrl: string | null
  reviewNote: string | null
  assignedDesignerId: string | null
  assignedDesignerName: string | null
  requestedById: string
  requestedByName: string
}

interface Designer { id: string; name: string; role: string }

interface Props {
  requests: DesignRequest[]
  designTeam: Designer[]
  currentUserId: string
  currentUserRole: string
  isAdmin: boolean
}

const STATUS_TABS = ['ALL', 'PENDING', 'IN_DESIGN', 'REVISION_REQUESTED', 'DELIVERED', 'APPROVED']

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  IN_REVIEW: 'bg-blue-100 text-blue-700',
  IN_DESIGN: 'bg-violet-100 text-violet-700',
  DELIVERED: 'bg-green-100 text-green-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REVISION_REQUESTED: 'bg-red-100 text-red-700',
}

const PRIORITY_DOT: Record<string, string> = {
  URGENT: 'bg-red-500', HIGH: 'bg-amber-400', NORMAL: 'bg-blue-400', LOW: 'bg-slate-500',
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const h = Math.floor(diff / 3600000), day = Math.floor(diff / 86400000)
  if (day > 0) return `${day}d ago`
  if (h > 0) return `${h}h ago`
  return 'Just now'
}

export function DesignRequestsClient({ requests, designTeam, currentUserId, currentUserRole, isAdmin }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState('ALL')
  const [selected, setSelected] = useState<DesignRequest | null>(null)
  const [assigning, setAssigning] = useState(false)
  const [delivering, setDelivering] = useState(false)
  const [deliveryUrl, setDeliveryUrl] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const status = searchParams.get('status')
    if (status && STATUS_TABS.includes(status)) {
      setTab(status)
    }
  }, [searchParams])

  const filtered = tab === 'ALL' ? requests : requests.filter(r => r.status === tab)

  const isDesigner = ['DESIGNER', 'DESIGN_LEAD'].includes(currentUserRole)

  async function patch(id: string, body: object) {
    setSaving(true)
    const res = await fetch(`/api/design/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (res.ok) { router.refresh(); setSelected(null); setAssigning(false); setDelivering(false) }
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Design Requests</h1>
          <p className="text-slate-500 text-sm mt-1">{requests.length} total creative requests</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 flex-wrap">
        {STATUS_TABS.map(t => {
          const count = t === 'ALL' ? requests.length : requests.filter(r => r.status === t).length
          return (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${tab === t ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
              {t.replace('_', ' ')}
              {count > 0 && <span className={`px-1.5 py-0.5 rounded-full text-xs ${tab === t ? 'bg-slate-300 text-slate-800' : 'bg-slate-200 text-slate-600'}`}>{count}</span>}
            </button>
          )
        })}
      </div>

      {/* List */}
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm">No requests in this category</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(r => (
              <div key={r.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setSelected(r); setNote(r.reviewNote ?? ''); setDeliveryUrl(r.contentUrl ?? '') }}>
                <div className="flex items-start gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${PRIORITY_DOT[r.priority] ?? 'bg-slate-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <p className="text-sm font-medium text-slate-900">{r.title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_STYLE[r.status] ?? 'bg-slate-200 text-slate-600'}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500">
                      <span>By <strong className="text-slate-600">{r.requestedByName}</strong></span>
                      {r.clientName && <span>• {r.clientName}</span>}
                      {r.designType && <span>• {r.designType}</span>}
                      <span>• {timeAgo(r.createdAt)}</span>
                      {r.dueDate && <span className={`font-medium ${new Date(r.dueDate) < new Date() ? 'text-red-600' : 'text-slate-500'}`}>• Due {new Date(r.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                    </div>
                    <div className="mt-2">
                      {r.assignedDesignerName
                        ? <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full">👤 {r.assignedDesignerName}</span>
                        : <span className="text-xs text-slate-500 italic">Unassigned</span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail / Action Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelected(null)}>
          <div className="flex-1 bg-black/50 backdrop-blur-sm" />
          <div className="w-full max-w-md bg-white border-l border-slate-200 flex flex-col overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Drawer header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900 text-base">{selected.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">By {selected.requestedByName} {selected.clientName ? `• ${selected.clientName}` : ''}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-900 p-1">✕</button>
            </div>

            <div className="flex-1 p-5 space-y-4 text-sm">
              {/* Status + priority */}
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[selected.status] ?? 'bg-slate-200 text-slate-600'}`}>{selected.status.replace('_', ' ')}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_DOT[selected.priority] ? 'bg-slate-200 text-slate-600' : ''}`}>{selected.priority}</span>
              </div>

              {selected.description && <p className="text-slate-600 text-sm leading-relaxed">{selected.description}</p>}
              {selected.designType && <p className="text-xs text-slate-500">Type: <span className="text-slate-700">{selected.designType}</span></p>}
              {selected.dueDate && <p className="text-xs text-slate-500">Due: <span className="text-slate-700">{new Date(selected.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>}

              {/* Reference URLs */}
              {selected.referenceUrls.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">References:</p>
                  {selected.referenceUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block truncate">{url}</a>
                  ))}
                </div>
              )}

              {/* Delivered content */}
              {selected.contentUrl && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-xs text-green-600 font-medium mb-1">Delivered</p>
                  <a href={selected.contentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">{selected.contentUrl}</a>
                </div>
              )}

              {selected.reviewNote && (
                <div className="p-3 bg-slate-100 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Note</p>
                  <p className="text-sm text-slate-700">{selected.reviewNote}</p>
                </div>
              )}

              {/* ── Assign designer (admin only) ── */}
              {isAdmin && (
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Assign Designer</p>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900"
                      defaultValue={selected.assignedDesignerId ?? ''}
                      onChange={e => setAssigning(!!e.target.value)}
                      id="designer-select"
                    >
                      <option value="">Unassigned</option>
                      {designTeam.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <button
                      disabled={saving}
                      onClick={() => {
                        const sel = document.getElementById('designer-select') as HTMLSelectElement
                        patch(selected.id, { assignedDesignerId: sel.value || null })
                      }}
                      className="px-3 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 disabled:opacity-50"
                    >
                      {saving ? '…' : 'Assign'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Designer actions: mark in-design, deliver ── */}
              {(isDesigner || selected.assignedDesignerId === currentUserId) && (
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Actions</p>

                  {selected.status === 'PENDING' && (
                    <button disabled={saving} onClick={() => patch(selected.id, { status: 'IN_DESIGN' })}
                      className="w-full py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 disabled:opacity-50">
                      {saving ? 'Saving…' : 'Start Working (Mark In Design)'}
                    </button>
                  )}

                  {['PENDING', 'IN_DESIGN', 'REVISION_REQUESTED'].includes(selected.status) && (
                    <div className="space-y-2">
                      <input
                        value={deliveryUrl}
                        onChange={e => setDeliveryUrl(e.target.value)}
                        placeholder="Paste delivery link (Drive, Figma, etc.)"
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-500"
                      />
                      <input
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="Add a note (optional)"
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-500"
                      />
                      <button disabled={saving || !deliveryUrl}
                        onClick={() => patch(selected.id, { status: 'DELIVERED', contentUrl: deliveryUrl, reviewNote: note })}
                        className="w-full py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50">
                        {saving ? 'Delivering…' : '✓ Mark as Delivered'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Requester actions: approve / request revision ── */}
              {selected.requestedById === currentUserId && selected.status === 'DELIVERED' && (
                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Review Delivery</p>
                  <div className="flex gap-2">
                    <button disabled={saving} onClick={() => patch(selected.id, { status: 'APPROVED' })}
                      className="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50">
                      ✓ Approve
                    </button>
                    <button disabled={saving} onClick={() => patch(selected.id, { status: 'REVISION_REQUESTED', reviewNote: note })}
                      className="flex-1 py-2 bg-red-600/80 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50">
                      Request Revision
                    </button>
                  </div>
                  <input value={note} onChange={e => setNote(e.target.value)}
                    placeholder="Revision notes (if requesting changes)"
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-500" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
