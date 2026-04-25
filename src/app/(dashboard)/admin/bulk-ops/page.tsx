'use client'

import { useState, useEffect } from 'react'
import {
  Users, UserCog, BarChart3, Send, X, Check,
  Loader2, AlertCircle, ChevronDown,
} from 'lucide-react'

type Client = { id: string; name: string; status: string; accountManagerId: string | null }
type Manager = { id: string; firstName: string; lastName: string | null; empId: string }
type Candidate = { id: string; name: string; email: string; status: string; position: string }

const CLIENT_STATUSES = ['ACTIVE', 'LOST', 'ON_HOLD', 'ONBOARDING']

function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

function MultiSelect<T extends { id: string }>({
  items, selected, onToggle, renderLabel, placeholder,
}: {
  items: T[]; selected: Set<string>; onToggle: (id: string) => void
  renderLabel: (item: T) => string; placeholder: string
}) {
  const [search, setSearch] = useState('')
  const filtered = items.filter(i => renderLabel(i).toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
      />
      <div className="max-h-48 overflow-y-auto rounded-lg border border-zinc-800 divide-y divide-zinc-800">
        {filtered.length === 0 && (
          <div className="px-3 py-4 text-center text-zinc-500 text-sm">No items found</div>
        )}
        {filtered.map((item) => (
          <label key={item.id} className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800/50 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={selected.has(item.id)}
              onChange={() => onToggle(item.id)}
              className="rounded border-zinc-600 bg-zinc-800 text-violet-500 focus:ring-violet-500"
            />
            <span className="text-zinc-200 truncate">{renderLabel(item)}</span>
          </label>
        ))}
      </div>
      {selected.size > 0 && (
        <p className="text-xs text-violet-400">{selected.size} selected</p>
      )}
    </div>
  )
}

export default function BulkOpsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Modal states
  const [activeModal, setActiveModal] = useState<'manager' | 'status' | 'assessment' | null>(null)

  // Bulk assign manager
  const [selectedClientsForMgr, setSelectedClientsForMgr] = useState<Set<string>>(new Set())
  const [chosenManager, setChosenManager] = useState('')

  // Bulk update status
  const [selectedClientsForStatus, setSelectedClientsForStatus] = useState<Set<string>>(new Set())
  const [chosenStatus, setChosenStatus] = useState('')

  // Bulk send assessment
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set())

  // Action state
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    async function load() {
      setLoadingData(true)
      try {
        const [clientsRes, candidatesRes] = await Promise.all([
          fetch('/api/admin/clients'),
          fetch('/api/hr/assessment/pipeline'),
        ])
        if (clientsRes.ok) {
          const data = await clientsRes.json()
          const list = (data.clients || data || []).map((c: Record<string, unknown>) => ({
            id: c.id as string,
            name: c.name as string,
            status: c.status as string,
            accountManagerId: (c.accountManagerId as string) || null,
          }))
          setClients(list)
          // Extract managers from team members if available, otherwise build from unique concerned persons
          const mgrs: Manager[] = []
          const seen = new Set<string>()
          for (const c of (data.clients || data || [])) {
            const members = (c.teamMembers || []) as Array<Record<string, unknown>>
            for (const m of members) {
              const user = m.user as Record<string, unknown> | undefined
              if (user && !seen.has(user.id as string)) {
                seen.add(user.id as string)
                mgrs.push({
                  id: user.id as string,
                  firstName: user.firstName as string,
                  lastName: (user.lastName as string) || null,
                  empId: (user.empId as string) || '',
                })
              }
            }
          }
          setManagers(mgrs)
        }
        if (candidatesRes.ok) {
          const data = await candidatesRes.json()
          setCandidates((data.candidates || data || []).map((c: Record<string, unknown>) => ({
            id: c.id as string,
            name: c.name as string,
            email: c.email as string,
            status: c.status as string,
            position: (c.position as string) || '',
          })))
        }
      } catch {
        // silently handle
      } finally {
        setLoadingData(false)
      }
    }
    load()
  }, [])

  function toggle(set: Set<string>, id: string, setter: (s: Set<string>) => void) {
    const next = new Set(set)
    next.has(id) ? next.delete(id) : next.add(id)
    setter(next)
  }

  function closeModal() {
    setActiveModal(null)
    setResult(null)
  }

  async function handleBulkAssignManager() {
    if (!chosenManager || selectedClientsForMgr.size === 0) return
    setSubmitting(true)
    setResult(null)
    try {
      const ids = [...selectedClientsForMgr]
      const results = await Promise.allSettled(
        ids.map(clientId =>
          fetch(`/api/admin/quick-add/assignment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId, userId: chosenManager, role: 'ACCOUNT_MANAGER' }),
          })
        )
      )
      const ok = results.filter(r => r.status === 'fulfilled').length
      setResult({ ok: true, message: `Assigned manager to ${ok}/${ids.length} clients` })
      setSelectedClientsForMgr(new Set())
    } catch {
      setResult({ ok: false, message: 'Failed to assign manager' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleBulkUpdateStatus() {
    if (!chosenStatus || selectedClientsForStatus.size === 0) return
    setSubmitting(true)
    setResult(null)
    try {
      const ids = [...selectedClientsForStatus]
      const results = await Promise.allSettled(
        ids.map(clientId =>
          fetch(`/api/admin/clients`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId, status: chosenStatus }),
          })
        )
      )
      const ok = results.filter(r => r.status === 'fulfilled').length
      setResult({ ok: true, message: `Updated status for ${ok}/${ids.length} clients` })
      setSelectedClientsForStatus(new Set())
    } catch {
      setResult({ ok: false, message: 'Failed to update client status' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleBulkSendAssessment() {
    if (selectedCandidates.size === 0) return
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch('/api/hr/assessment/send', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateIds: [...selectedCandidates] }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      const sent = (data.results || []).filter((r: Record<string, unknown>) => !r.skipped).length
      const skipped = (data.results || []).filter((r: Record<string, unknown>) => r.skipped).length
      setResult({ ok: true, message: `Sent ${sent} assessment links (${skipped} already existed)` })
      setSelectedCandidates(new Set())
    } catch {
      setResult({ ok: false, message: 'Failed to send assessment links' })
    } finally {
      setSubmitting(false)
    }
  }

  const cards = [
    {
      key: 'manager' as const,
      icon: <UserCog className="w-6 h-6 text-blue-400" />,
      bg: 'bg-blue-500/10 border-blue-500/20',
      title: 'Bulk Assign Account Manager',
      desc: 'Select multiple clients and assign them to an account manager at once.',
      count: clients.length,
      countLabel: 'clients available',
    },
    {
      key: 'status' as const,
      icon: <BarChart3 className="w-6 h-6 text-amber-400" />,
      bg: 'bg-amber-500/10 border-amber-500/20',
      title: 'Bulk Update Client Status',
      desc: 'Change the status of multiple clients simultaneously.',
      count: clients.length,
      countLabel: 'clients available',
    },
    {
      key: 'assessment' as const,
      icon: <Send className="w-6 h-6 text-emerald-400" />,
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      title: 'Bulk Send Assessment Links',
      desc: 'Send assessment forms to multiple candidates in one go.',
      count: candidates.length,
      countLabel: 'candidates available',
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-violet-500/20">
          <Users className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Bulk Operations</h1>
          <p className="text-zinc-400 text-sm">Perform actions on multiple records at once</p>
        </div>
      </div>

      {loadingData && (
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading data...
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((card) => (
          <div
            key={card.key}
            className={`rounded-xl border p-5 flex flex-col gap-4 ${card.bg}`}
          >
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-zinc-900/50">{card.icon}</div>
              <span className="text-xs text-zinc-500">{card.count} {card.countLabel}</span>
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">{card.title}</h3>
              <p className="text-zinc-400 text-sm mt-1">{card.desc}</p>
            </div>
            <button
              onClick={() => { setActiveModal(card.key); setResult(null) }}
              disabled={loadingData}
              className="mt-auto w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm font-medium transition-colors disabled:opacity-40"
            >
              Open
            </button>
          </div>
        ))}
      </div>

      {/* Assign Manager Modal */}
      <Modal open={activeModal === 'manager'} onClose={closeModal} title="Bulk Assign Account Manager">
        <div className="space-y-4">
          <MultiSelect
            items={clients}
            selected={selectedClientsForMgr}
            onToggle={(id) => toggle(selectedClientsForMgr, id, setSelectedClientsForMgr)}
            renderLabel={(c) => `${c.name} (${c.status})`}
            placeholder="Search clients..."
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400 flex items-center gap-1">
              <ChevronDown className="w-3 h-3" /> Select Manager
            </label>
            <select
              value={chosenManager}
              onChange={(e) => setChosenManager(e.target.value)}
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="">Choose a manager...</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName || ''} ({m.empId})
                </option>
              ))}
            </select>
          </div>
          {result && (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${result.ok ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
              {result.ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {result.message}
            </div>
          )}
          <button
            onClick={handleBulkAssignManager}
            disabled={submitting || selectedClientsForMgr.size === 0 || !chosenManager}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCog className="w-4 h-4" />}
            Assign to {selectedClientsForMgr.size} Client{selectedClientsForMgr.size !== 1 ? 's' : ''}
          </button>
        </div>
      </Modal>

      {/* Update Status Modal */}
      <Modal open={activeModal === 'status'} onClose={closeModal} title="Bulk Update Client Status">
        <div className="space-y-4">
          <MultiSelect
            items={clients}
            selected={selectedClientsForStatus}
            onToggle={(id) => toggle(selectedClientsForStatus, id, setSelectedClientsForStatus)}
            renderLabel={(c) => `${c.name} (${c.status})`}
            placeholder="Search clients..."
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400 flex items-center gap-1">
              <ChevronDown className="w-3 h-3" /> New Status
            </label>
            <select
              value={chosenStatus}
              onChange={(e) => setChosenStatus(e.target.value)}
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="">Choose a status...</option>
              {CLIENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {result && (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${result.ok ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
              {result.ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {result.message}
            </div>
          )}
          <button
            onClick={handleBulkUpdateStatus}
            disabled={submitting || selectedClientsForStatus.size === 0 || !chosenStatus}
            className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
            Update {selectedClientsForStatus.size} Client{selectedClientsForStatus.size !== 1 ? 's' : ''}
          </button>
        </div>
      </Modal>

      {/* Send Assessment Modal */}
      <Modal open={activeModal === 'assessment'} onClose={closeModal} title="Bulk Send Assessment Links">
        <div className="space-y-4">
          <MultiSelect
            items={candidates}
            selected={selectedCandidates}
            onToggle={(id) => toggle(selectedCandidates, id, setSelectedCandidates)}
            renderLabel={(c) => `${c.name} - ${c.position} (${c.status})`}
            placeholder="Search candidates..."
          />
          {result && (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${result.ok ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
              {result.ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {result.message}
            </div>
          )}
          <button
            onClick={handleBulkSendAssessment}
            disabled={submitting || selectedCandidates.size === 0}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500/100 text-white text-sm font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send to {selectedCandidates.size} Candidate{selectedCandidates.size !== 1 ? 's' : ''}
          </button>
        </div>
      </Modal>
    </div>
  )
}
