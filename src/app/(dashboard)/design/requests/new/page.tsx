'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Client { id: string; name: string }
interface Designer { id: string; name: string; role: string }

const DESIGN_TYPES = ['Social Media Graphic', 'Print Material', 'Logo / Branding', 'Banner / Billboard', 'Video Thumbnail', 'Presentation', 'Infographic', 'Digital Ad', 'Other']

export default function NewDesignRequestPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [designers, setDesigners] = useState<Designer[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', designType: '', priority: 'NORMAL',
    dueDate: '', clientId: '', assignedDesignerId: '', referenceUrls: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/clients?limit=200').then(r => r.json()),
      fetch('/api/users?department=DESIGN').then(r => r.json()),
    ]).then(([cd, ud]) => {
      const c = Array.isArray(cd) ? cd : cd.clients || []
      setClients(c.map((x: { id: string; name: string }) => ({ id: x.id, name: x.name })))
      const u = Array.isArray(ud) ? ud : ud.users || []
      setDesigners(u.map((x: { id: string; firstName: string; lastName?: string; role: string }) => ({
        id: x.id, name: `${x.firstName} ${x.lastName ?? ''}`.trim(), role: x.role,
      })))
    }).catch(() => { toast.error('Failed to load form data') })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.clientId) { setError('Title and client are required.'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/design/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description || undefined,
        designType: form.designType || undefined,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        clientId: form.clientId,
        assignedDesignerId: form.assignedDesignerId || undefined,
        referenceUrls: form.referenceUrls ? form.referenceUrls.split('\n').filter(Boolean) : [],
      }),
    })
    setLoading(false)
    if (res.ok) { router.push('/design/requests'); router.refresh() }
    else { const d = await res.json(); setError(d.error || 'Failed to submit request.') }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Design Request</h1>
        <p className="text-slate-500 text-sm mt-1">Submit a creative request to the design team</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        {error && <p className="text-red-600 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}

        <Field label="Title *">
          <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Instagram Post for June Campaign"
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400" />
        </Field>

        <Field label="Client *">
          <select required value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900">
            <option value="">Select client…</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>

        <Field label="Description">
          <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Brief, dimensions, tone, content details…"
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 resize-none" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Design Type">
            <select value={form.designType} onChange={e => setForm(f => ({ ...f, designType: e.target.value }))}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900">
              <option value="">Select type…</option>
              {DESIGN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900">
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Due Date">
            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900" />
          </Field>
          <Field label="Assign To Designer">
            <select value={form.assignedDesignerId} onChange={e => setForm(f => ({ ...f, assignedDesignerId: e.target.value }))}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900">
              <option value="">Anyone available</option>
              {designers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Reference URLs (one per line)">
          <textarea rows={2} value={form.referenceUrls} onChange={e => setForm(f => ({ ...f, referenceUrls: e.target.value }))}
            placeholder="https://example.com/reference&#10;https://drive.google.com/..."
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 resize-none" />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors">
            {loading ? 'Submitting…' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
