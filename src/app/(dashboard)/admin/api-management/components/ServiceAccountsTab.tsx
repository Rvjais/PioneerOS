'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface ServiceAccount {
  id: string
  platform: string
  serviceType: string
  email: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface AccessInstruction {
  title: string
  steps: string[]
  targetEmail: string
}

const platformColors: Record<string, { bg: string; text: string }> = {
  GOOGLE: { bg: 'bg-red-500/20', text: 'text-red-400' },
  META: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  LINKEDIN: { bg: 'bg-sky-100', text: 'text-sky-700' },
  TWITTER: { bg: 'bg-slate-800/50', text: 'text-slate-200' },
}

export function ServiceAccountsTab() {
  const [accounts, setAccounts] = useState<ServiceAccount[]>([])
  const [instructions, setInstructions] = useState<Record<string, AccessInstruction>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<ServiceAccount>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAccount, setNewAccount] = useState({
    platform: 'GOOGLE',
    serviceType: '',
    email: '',
    name: '',
    description: '',
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

  async function fetchAccounts() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/service-accounts')
      if (!response.ok) throw new Error('Failed to fetch service accounts')
      const data = await response.json()
      setAccounts(data.serviceAccounts)
      setInstructions(data.instructions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load service accounts')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(id: string) {
    try {
      const response = await fetch(`/api/admin/service-accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      })

      if (!response.ok) throw new Error('Failed to update')

      setEditingId(null)
      setEditValues({})
      fetchAccounts()
    } catch {
      toast.error('Failed to update service account')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this service account?')) return

    try {
      const response = await fetch(`/api/admin/service-accounts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      fetchAccounts()
    } catch {
      toast.error('Failed to delete service account')
    }
  }

  async function handleAdd() {
    if (!newAccount.serviceType || !newAccount.email || !newAccount.name) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('/api/admin/service-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create')
      }

      setShowAddForm(false)
      setNewAccount({
        platform: 'GOOGLE',
        serviceType: '',
        email: '',
        name: '',
        description: '',
      })
      fetchAccounts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create service account')
    }
  }

  function startEditing(account: ServiceAccount) {
    setEditingId(account.id)
    setEditValues({
      email: account.email,
      name: account.name,
      description: account.description || '',
    })
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-400">Loading service accounts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={fetchAccounts}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Service Accounts</h2>
          <p className="text-sm text-slate-400">
            Agency email accounts for receiving delegated access from clients
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Account
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-slate-900/40 rounded-xl p-4 border border-white/10">
          <h3 className="font-medium text-white mb-4">Add Service Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Platform</label>
              <select
                value={newAccount.platform}
                onChange={(e) => setNewAccount({ ...newAccount, platform: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg"
              >
                <option value="GOOGLE">Google</option>
                <option value="META">Meta</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="TWITTER">Twitter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Service Type</label>
              <input
                type="text"
                value={newAccount.serviceType}
                onChange={(e) => setNewAccount({ ...newAccount, serviceType: e.target.value })}
                placeholder="e.g., GOOGLE_ANALYTICS"
                className="w-full px-3 py-2 border border-white/20 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Email</label>
              <input
                type="email"
                value={newAccount.email}
                onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                placeholder="seowithbp@gmail.com"
                className="w-full px-3 py-2 border border-white/20 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Name</label>
              <input
                type="text"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                placeholder="Branding Pioneers SEO"
                className="w-full px-3 py-2 border border-white/20 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
              <input
                type="text"
                value={newAccount.description}
                onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
                placeholder="Description of this service account"
                className="w-full px-3 py-2 border border-white/20 rounded-lg"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Account
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Platform</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Service Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Email</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No service accounts configured yet
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.id} className="border-b border-white/5 hover:bg-slate-900/40">
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${platformColors[account.platform]?.bg || 'bg-slate-800/50'} ${platformColors[account.platform]?.text || 'text-slate-200'}`}>
                      {account.platform}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-200">{account.serviceType}</td>
                  <td className="py-3 px-4">
                    {editingId === account.id ? (
                      <input
                        type="email"
                        value={editValues.email || ''}
                        onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                        className="w-full px-2 py-1 border border-white/20 rounded"
                      />
                    ) : (
                      <span className="text-sm text-slate-200">{account.email}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === account.id ? (
                      <input
                        type="text"
                        value={editValues.name || ''}
                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                        className="w-full px-2 py-1 border border-white/20 rounded"
                      />
                    ) : (
                      <span className="text-sm text-slate-200">{account.name}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${account.isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-800/50 text-slate-200'}`}>
                      {account.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {editingId === account.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingId(null)
                            setEditValues({})
                          }}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSave(account.id)}
                          className="text-blue-400 hover:text-blue-400"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEditing(account)}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(account.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Instructions Reference */}
      {Object.keys(instructions).length > 0 && (
        <div className="mt-8">
          <h3 className="font-medium text-white mb-4">Access Instructions Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(instructions).map(([key, instruction]) => (
              <div key={key} className="bg-slate-900/40 rounded-xl p-4 border border-white/10">
                <h4 className="font-medium text-white mb-2">{instruction.title}</h4>
                <p className="text-xs text-slate-400 mb-2">Target: {instruction.targetEmail}</p>
                <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside">
                  {instruction.steps.slice(0, 3).map((step, i) => (
                    <li key={`step-${i}`} className="truncate">{step}</li>
                  ))}
                  {instruction.steps.length > 3 && (
                    <li className="text-slate-400">...and {instruction.steps.length - 3} more steps</li>
                  )}
                </ol>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
