'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import {
  Building2, ChevronDown, ChevronRight, Plus, Pencil, Ban,
  CheckCircle2, XCircle, Loader2, Phone, Mail, User, Search,
} from 'lucide-react'

type Vendor = {
  id: string
  companyName: string
  contactName: string
  contactEmail: string | null
  contactPhone: string | null
  serviceCategory: string | null
  contractDuration: string | null
  paymentTerms: string | null
  monthlyRate: number | null
  status: string
  ndaSigned: boolean
  contractSigned: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

const CATEGORIES = [
  'Software', 'Marketing', 'Office Supplies', 'IT Services',
  'Legal', 'Accounting', 'Other',
]

const STATUS_OPTIONS = ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED']

const emptyForm = {
  companyName: '', contactName: '', contactEmail: '', contactPhone: '',
  serviceCategory: '', status: 'PENDING', monthlyRate: '',
  contractDuration: '', paymentTerms: '', notes: '',
}

function Badge({ children, variant }: { children: React.ReactNode; variant: 'green' | 'red' | 'yellow' | 'blue' | 'gray' }) {
  const colors = {
    green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    yellow: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    gray: 'bg-white/5 text-white/60 border-white/10',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[variant]}`}>
      {children}
    </span>
  )
}

function statusBadge(status: string) {
  const map: Record<string, 'green' | 'red' | 'yellow' | 'blue' | 'gray'> = {
    ACTIVE: 'green', INACTIVE: 'red', PENDING: 'yellow', SUSPENDED: 'red',
  }
  return <Badge variant={map[status] || 'gray'}>{status}</Badge>
}

function categoryBadge(cat: string | null) {
  if (!cat) return <span className="text-white/40">--</span>
  const map: Record<string, 'blue' | 'green' | 'yellow' | 'gray'> = {
    Software: 'blue', 'IT Services': 'blue', Marketing: 'green',
    Legal: 'yellow', Accounting: 'yellow',
  }
  return <Badge variant={map[cat] || 'gray'}>{cat}</Badge>
}

export default function VendorManagementPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const fetchVendors = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (filterStatus) params.set('status', filterStatus)
      const res = await fetch(`/api/vendors?${params}`)
      const json = await res.json()
      setVendors(json.data ?? json ?? [])
    } catch { /* ignore */ }
    setLoading(false)
  }, [filterStatus])

  useEffect(() => { fetchVendors() }, [fetchVendors])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const body = {
      companyName: form.companyName,
      contactName: form.contactName,
      contactEmail: form.contactEmail || null,
      contactPhone: form.contactPhone || null,
      serviceCategory: form.serviceCategory || null,
      status: form.status,
      monthlyRate: form.monthlyRate ? parseFloat(form.monthlyRate) : null,
      contractDuration: form.contractDuration || null,
      paymentTerms: form.paymentTerms || null,
      notes: form.notes || null,
    }
    try {
      const url = editingId ? `/api/vendors/${editingId}` : '/api/vendors'
      const method = editingId ? 'PATCH' : 'POST'
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      setForm(emptyForm)
      setEditingId(null)
      setShowForm(false)
      fetchVendors()
    } catch { /* ignore */ }
    setSaving(false)
  }

  const startEdit = (v: Vendor) => {
    setForm({
      companyName: v.companyName, contactName: v.contactName,
      contactEmail: v.contactEmail ?? '', contactPhone: v.contactPhone ?? '',
      serviceCategory: v.serviceCategory ?? '', status: v.status,
      monthlyRate: v.monthlyRate?.toString() ?? '',
      contractDuration: v.contractDuration ?? '',
      paymentTerms: v.paymentTerms ?? '', notes: v.notes ?? '',
    })
    setEditingId(v.id)
    setShowForm(true)
  }

  const deactivate = async (id: string) => {
    await fetch(`/api/vendors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'INACTIVE' }),
    })
    fetchVendors()
  }

  const filtered = vendors.filter(v => {
    if (!search) return true
    const q = search.toLowerCase()
    return v.companyName.toLowerCase().includes(q) ||
      v.contactName.toLowerCase().includes(q) ||
      (v.contactEmail?.toLowerCase().includes(q))
  })

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm'
  const labelCls = 'block text-xs font-medium text-white/60 mb-1'

  return (
    <div className="min-h-screen p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 rounded-xl">
            <Building2 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Vendor Management</h1>
            <p className="text-sm text-white/50">{vendors.length} vendors registered</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Vendor
        </button>
      </div>

      {/* Create / Edit Form (collapsible) */}
      {showForm && (
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Edit Vendor' : 'Create Vendor'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Company Name *</label>
              <input required className={inputCls} value={form.companyName}
                onChange={e => setForm({ ...form, companyName: e.target.value })} placeholder="Acme Inc." />
            </div>
            <div>
              <label className={labelCls}>Contact Person *</label>
              <input required className={inputCls} value={form.contactName}
                onChange={e => setForm({ ...form, contactName: e.target.value })} placeholder="John Doe" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" className={inputCls} value={form.contactEmail}
                onChange={e => setForm({ ...form, contactEmail: e.target.value })} placeholder="john@acme.com" />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} value={form.contactPhone}
                onChange={e => setForm({ ...form, contactPhone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select className={inputCls} value={form.serviceCategory}
                onChange={e => setForm({ ...form, serviceCategory: e.target.value })}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Monthly Rate</label>
              <input type="number" step="0.01" className={inputCls} value={form.monthlyRate}
                onChange={e => setForm({ ...form, monthlyRate: e.target.value })} placeholder="0.00" />
            </div>
            <div>
              <label className={labelCls}>Contract Duration</label>
              <input className={inputCls} value={form.contractDuration}
                onChange={e => setForm({ ...form, contractDuration: e.target.value })} placeholder="12 months" />
            </div>
            <div>
              <label className={labelCls}>Payment Terms</label>
              <input className={inputCls} value={form.paymentTerms}
                onChange={e => setForm({ ...form, paymentTerms: e.target.value })} placeholder="Net 30" />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className={labelCls}>Notes</label>
              <textarea className={inputCls} rows={2} value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex gap-3 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm) }}
                className="px-4 py-2 text-sm text-white/60 hover:text-white border border-white/10 rounded-xl transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update Vendor' : 'Create Vendor'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input className={`${inputCls} pl-9`} placeholder="Search vendors..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className={`${inputCls} w-auto`} value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Vendor Table */}
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No vendors found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-white/50 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 w-8" />
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <VendorRow key={v.id} vendor={v} expanded={expandedId === v.id}
                  onToggle={() => setExpandedId(expandedId === v.id ? null : v.id)}
                  onEdit={() => startEdit(v)} onDeactivate={() => deactivate(v.id)} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function VendorRow({ vendor: v, expanded, onToggle, onEdit, onDeactivate }: {
  vendor: Vendor; expanded: boolean
  onToggle: () => void; onEdit: () => void; onDeactivate: () => void
}) {
  return (
    <>
      <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
        <td className="px-5 py-3">
          <button onClick={onToggle} className="text-white/40 hover:text-white">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </td>
        <td className="px-5 py-3">
          <p className="text-white font-medium">{v.companyName}</p>
          <p className="text-white/40 text-xs">{v.contactName}</p>
        </td>
        <td className="px-5 py-3">
          {v.contactEmail && (
            <span className="flex items-center gap-1.5 text-white/60 text-xs">
              <Mail className="w-3 h-3" />{v.contactEmail}
            </span>
          )}
          {v.contactPhone && (
            <span className="flex items-center gap-1.5 text-white/60 text-xs mt-0.5">
              <Phone className="w-3 h-3" />{v.contactPhone}
            </span>
          )}
        </td>
        <td className="px-5 py-3">{categoryBadge(v.serviceCategory)}</td>
        <td className="px-5 py-3">{statusBadge(v.status)}</td>
        <td className="px-5 py-3">
          <div className="flex items-center justify-end gap-2">
            <button onClick={onEdit} title="Edit"
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
              <Pencil className="w-4 h-4" />
            </button>
            {v.status !== 'INACTIVE' && (
              <button onClick={onDeactivate} title="Deactivate"
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors">
                <Ban className="w-4 h-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-white/5 bg-white/[0.01]">
          <td colSpan={6} className="px-8 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <Detail label="Contract Duration" value={v.contractDuration} />
              <Detail label="Payment Terms" value={v.paymentTerms} />
              <Detail label="Monthly Rate" value={v.monthlyRate != null ? `$${v.monthlyRate.toLocaleString()}` : null} />
              <Detail label="NDA Signed" value={v.ndaSigned ? 'Yes' : 'No'} icon={v.ndaSigned ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-red-400" />} />
              <Detail label="Contract Signed" value={v.contractSigned ? 'Yes' : 'No'} icon={v.contractSigned ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-red-400" />} />
              <Detail label="Created" value={formatDateDDMMYYYY(v.createdAt)} />
              <Detail label="Updated" value={formatDateDDMMYYYY(v.updatedAt)} />
              {v.notes && <div className="col-span-2 md:col-span-4"><span className="text-white/40">Notes:</span> <span className="text-white/70">{v.notes}</span></div>}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function Detail({ label, value, icon }: { label: string; value: string | null; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-white/40 mb-0.5">{label}</p>
      <p className="text-white/80 flex items-center gap-1">{icon}{value || '--'}</p>
    </div>
  )
}
