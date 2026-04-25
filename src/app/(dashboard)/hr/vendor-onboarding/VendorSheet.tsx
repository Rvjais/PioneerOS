'use client'

import { useState } from 'react'

interface Vendor {
  id: string
  companyName: string
  contactName: string
  contactEmail: string | null
  contactPhone: string | null
  serviceCategory: string | null
  contractDuration: string | null
  paymentTerms: string | null
  monthlyRate: number | null
  ndaSigned: boolean
  contractSigned: boolean
  status: string
  notes: string | null
}

interface Props {
  initialVendors: Vendor[]
}

// Prefilled dropdown options
const SERVICE_CATEGORIES = [
  'Content Writing',
  'Graphic Design',
  'Video Production',
  'Web Development',
  'SEO Services',
  'Ads Management',
  'Social Media',
  'Photography',
  'Translation',
  'Consulting',
  'IT Support',
  'Legal Services',
  'Accounting',
  'HR Services',
  'Other',
]

const CONTRACT_DURATIONS = [
  '1 Month',
  '3 Months',
  '6 Months',
  '1 Year',
  '2 Years',
  'Project-Based',
  'Ongoing',
]

const PAYMENT_TERMS = [
  'Advance',
  'NET-7',
  'NET-15',
  'NET-30',
  'NET-45',
  'NET-60',
  'On Delivery',
  'Milestone-Based',
]

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: 'bg-amber-500/20 text-amber-300' },
  { value: 'NDA_SIGNED', label: 'NDA Signed', color: 'bg-blue-500/20 text-blue-300' },
  { value: 'CONTRACT_SIGNED', label: 'Contract Signed', color: 'bg-purple-500/20 text-purple-300' },
  { value: 'ACTIVE', label: 'Active', color: 'bg-emerald-500/20 text-emerald-300' },
  { value: 'ON_HOLD', label: 'On Hold', color: 'bg-slate-900/20 text-slate-300' },
  { value: 'TERMINATED', label: 'Terminated', color: 'bg-red-500/20 text-red-300' },
]

export function VendorSheet({ initialVendors }: Props) {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors)
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [isAdding, setIsAdding] = useState(false)
  const [newVendor, setNewVendor] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    serviceCategory: '',
    contractDuration: '',
    paymentTerms: '',
    monthlyRate: '',
    status: 'PENDING',
  })
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredVendors = vendors.filter(v =>
    v.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.serviceCategory?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const startEdit = (id: string, field: string, currentValue: string) => {
    setEditingCell({ id, field })
    setEditValue(currentValue || '')
  }

  const saveEdit = async () => {
    if (!editingCell) return

    setSaving(true)
    try {
      const res = await fetch('/api/vendors/' + editingCell.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [editingCell.field]: editValue }),
      })

      if (res.ok) {
        setVendors(prev =>
          prev.map(v =>
            v.id === editingCell.id ? { ...v, [editingCell.field]: editValue } : v
          )
        )
      }
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setSaving(false)
      setEditingCell(null)
    }
  }

  const updateField = async (id: string, field: string, value: string | number | boolean | null) => {
    setSaving(true)
    try {
      const res = await fetch('/api/vendors/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })

      if (res.ok) {
        setVendors(prev =>
          prev.map(v => (v.id === id ? { ...v, [field]: value } : v))
        )
      }
    } catch (error) {
      console.error('Failed to update:', error)
    } finally {
      setSaving(false)
    }
  }

  const addVendor = async () => {
    if (!newVendor.companyName || !newVendor.contactName) return

    setSaving(true)
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newVendor,
          monthlyRate: newVendor.monthlyRate ? parseFloat(newVendor.monthlyRate) : null,
        }),
      })

      if (res.ok) {
        const vendor = await res.json()
        setVendors(prev => [vendor, ...prev])
        setNewVendor({
          companyName: '',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          serviceCategory: '',
          contractDuration: '',
          paymentTerms: '',
          monthlyRate: '',
          status: 'PENDING',
        })
        setIsAdding(false)
      }
    } catch (error) {
      console.error('Failed to add vendor:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteVendor = async (id: string) => {
    if (!confirm('Delete this vendor?')) return

    try {
      const res = await fetch('/api/vendors/' + id, { method: 'DELETE' })
      if (res.ok) {
        setVendors(prev => prev.filter(v => v.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-slate-900/20 text-slate-300'
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search vendors..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Vendor
        </button>
      </div>

      {/* Sheet Table */}
      <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 backdrop-blur-sm border-b border-white/10">
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[180px]">Company</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[140px]">Contact</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[120px]">Phone</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[140px]">Category</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[100px]">Duration</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[100px]">Payment</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[100px]">Rate/Mo</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[50px]">NDA</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[120px]">Status</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[50px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {/* Add New Row */}
              {isAdding && (
                <tr className="bg-blue-500/10">
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={newVendor.companyName}
                      onChange={e => setNewVendor(p => ({ ...p, companyName: e.target.value }))}
                      placeholder="Company name*"
                      className="w-full px-2 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white text-sm"
                      autoFocus
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={newVendor.contactName}
                      onChange={e => setNewVendor(p => ({ ...p, contactName: e.target.value }))}
                      placeholder="Contact name*"
                      className="w-full px-2 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={newVendor.contactPhone}
                      onChange={e => setNewVendor(p => ({ ...p, contactPhone: e.target.value }))}
                      placeholder="Phone"
                      className="w-full px-2 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={newVendor.serviceCategory}
                      onChange={e => setNewVendor(p => ({ ...p, serviceCategory: e.target.value }))}
                      className="w-full px-2 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white text-sm"
                    >
                      <option value="">Select...</option>
                      {SERVICE_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={newVendor.contractDuration}
                      onChange={e => setNewVendor(p => ({ ...p, contractDuration: e.target.value }))}
                      className="w-full px-2 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white text-sm"
                    >
                      <option value="">Select...</option>
                      {CONTRACT_DURATIONS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={newVendor.paymentTerms}
                      onChange={e => setNewVendor(p => ({ ...p, paymentTerms: e.target.value }))}
                      className="w-full px-2 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white text-sm"
                    >
                      <option value="">Select...</option>
                      {PAYMENT_TERMS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={newVendor.monthlyRate}
                      onChange={e => setNewVendor(p => ({ ...p, monthlyRate: e.target.value }))}
                      placeholder="0"
                      className="w-full px-2 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white text-sm"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="text-slate-400">-</span>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={newVendor.status}
                      onChange={e => setNewVendor(p => ({ ...p, status: e.target.value }))}
                      className="w-full px-2 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white text-sm"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button
                        onClick={addVendor}
                        disabled={saving || !newVendor.companyName || !newVendor.contactName}
                        className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded disabled:opacity-50"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setIsAdding(false)}
                        className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Existing Vendors */}
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-12 text-center text-slate-400">
                    {searchTerm ? 'No vendors match your search' : 'No vendors yet. Click "Add Vendor" to get started.'}
                  </td>
                </tr>
              ) : (
                filteredVendors.map(vendor => (
                  <tr key={vendor.id} className="hover:bg-white/5 transition-colors group">
                    {/* Company Name */}
                    <td className="px-3 py-2">
                      {editingCell?.id === vendor.id && editingCell.field === 'companyName' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={e => e.key === 'Enter' && saveEdit()}
                          className="w-full px-2 py-1 bg-white/10 backdrop-blur-sm border border-blue-500 rounded text-white text-sm"
                          autoFocus
                        />
                      ) : (
                        <span
                          onClick={() => startEdit(vendor.id, 'companyName', vendor.companyName)}
                          className="text-white font-medium cursor-pointer hover:text-blue-400"
                        >
                          {vendor.companyName}
                        </span>
                      )}
                    </td>

                    {/* Contact Name */}
                    <td className="px-3 py-2">
                      {editingCell?.id === vendor.id && editingCell.field === 'contactName' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={e => e.key === 'Enter' && saveEdit()}
                          className="w-full px-2 py-1 bg-white/10 backdrop-blur-sm border border-blue-500 rounded text-white text-sm"
                          autoFocus
                        />
                      ) : (
                        <span
                          onClick={() => startEdit(vendor.id, 'contactName', vendor.contactName)}
                          className="text-slate-300 cursor-pointer hover:text-blue-400"
                        >
                          {vendor.contactName}
                        </span>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="px-3 py-2">
                      {editingCell?.id === vendor.id && editingCell.field === 'contactPhone' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={e => e.key === 'Enter' && saveEdit()}
                          className="w-full px-2 py-1 bg-white/10 backdrop-blur-sm border border-blue-500 rounded text-white text-sm"
                          autoFocus
                        />
                      ) : (
                        <span
                          onClick={() => startEdit(vendor.id, 'contactPhone', vendor.contactPhone || '')}
                          className="text-slate-400 cursor-pointer hover:text-blue-400"
                        >
                          {vendor.contactPhone || '-'}
                        </span>
                      )}
                    </td>

                    {/* Category Dropdown */}
                    <td className="px-3 py-2">
                      <select
                        value={vendor.serviceCategory || ''}
                        onChange={e => updateField(vendor.id, 'serviceCategory', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-white/20 rounded text-slate-300 text-sm cursor-pointer focus:border-blue-500 focus:bg-white/10 backdrop-blur-sm"
                      >
                        <option value="">-</option>
                        {SERVICE_CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </td>

                    {/* Duration Dropdown */}
                    <td className="px-3 py-2">
                      <select
                        value={vendor.contractDuration || ''}
                        onChange={e => updateField(vendor.id, 'contractDuration', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-white/20 rounded text-slate-300 text-sm cursor-pointer focus:border-blue-500 focus:bg-white/10 backdrop-blur-sm"
                      >
                        <option value="">-</option>
                        {CONTRACT_DURATIONS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </td>

                    {/* Payment Terms Dropdown */}
                    <td className="px-3 py-2">
                      <select
                        value={vendor.paymentTerms || ''}
                        onChange={e => updateField(vendor.id, 'paymentTerms', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-white/20 rounded text-slate-300 text-sm cursor-pointer focus:border-blue-500 focus:bg-white/10 backdrop-blur-sm"
                      >
                        <option value="">-</option>
                        {PAYMENT_TERMS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </td>

                    {/* Monthly Rate */}
                    <td className="px-3 py-2">
                      {editingCell?.id === vendor.id && editingCell.field === 'monthlyRate' ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => {
                            updateField(vendor.id, 'monthlyRate', editValue ? parseFloat(editValue) : null)
                            setEditingCell(null)
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              updateField(vendor.id, 'monthlyRate', editValue ? parseFloat(editValue) : null)
                              setEditingCell(null)
                            }
                          }}
                          className="w-full px-2 py-1 bg-white/10 backdrop-blur-sm border border-blue-500 rounded text-white text-sm"
                          autoFocus
                        />
                      ) : (
                        <span
                          onClick={() => startEdit(vendor.id, 'monthlyRate', vendor.monthlyRate?.toString() || '')}
                          className="text-emerald-400 cursor-pointer hover:text-emerald-300"
                        >
                          {vendor.monthlyRate ? `₹${vendor.monthlyRate.toLocaleString('en-IN')}` : '-'}
                        </span>
                      )}
                    </td>

                    {/* NDA Checkbox */}
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={vendor.ndaSigned}
                        onChange={e => updateField(vendor.id, 'ndaSigned', e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/10 backdrop-blur-sm text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                      />
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-3 py-2">
                      <select
                        value={vendor.status}
                        onChange={e => updateField(vendor.id, 'status', e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${getStatusColor(vendor.status)}`}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2">
                      <button
                        onClick={() => deleteVendor(vendor.id)}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saving indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-none flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Saving...
        </div>
      )}
    </div>
  )
}
