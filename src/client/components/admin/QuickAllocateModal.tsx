'use client'

import { useState, useEffect } from 'react'
import { CLIENT_TEAM_ROLES } from '@/shared/constants/formConstants'
import { extractArrayData } from '@/server/apiResponse'

interface User {
  id: string
  firstName: string
  lastName?: string | null
  empId: string
  department: string
}

interface Client {
  id: string
  name: string
  brandName?: string | null
  tier: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  preselectedClientId?: string
  onSuccess?: () => void
}

export function QuickAllocateModal({
  isOpen,
  onClose,
  preselectedClientId,
  onSuccess,
}: Props) {
  const [clients, setClients] = useState<Client[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [selectedClients, setSelectedClients] = useState<string[]>(
    preselectedClientId ? [preselectedClientId] : []
  )
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedRole, setSelectedRole] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)

  const [clientSearch, setClientSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchData()
      if (preselectedClientId) {
        setSelectedClients([preselectedClientId])
      }
    }
  }, [isOpen, preselectedClientId])

  async function fetchData() {
    try {
      setLoading(true)
      const [clientsRes, usersRes] = await Promise.all([
        fetch('/api/clients?limit=500'),
        fetch('/api/users?limit=500&status=ACTIVE'),
      ])

      if (clientsRes.ok) {
        const data = await clientsRes.json()
        setClients(extractArrayData<Client>(data))
      }

      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(extractArrayData<User>(data))
      }
    } catch {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedClients.length === 0 || selectedUsers.length === 0 || !selectedRole) {
      setError('Please select clients, employees, and a role')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/admin/quick-allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientIds: selectedClients,
          userIds: selectedUsers,
          role: selectedRole,
          isPrimary,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to allocate')
        return
      }

      setSuccess(data.message || 'Allocated successfully!')
      setTimeout(() => {
        onSuccess?.()
        onClose()
        resetForm()
      }, 1500)
    } catch {
      setError('Failed to allocate team members')
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setSelectedClients(preselectedClientId ? [preselectedClientId] : [])
    setSelectedUsers([])
    setSelectedRole('')
    setIsPrimary(false)
    setClientSearch('')
    setUserSearch('')
    setError(null)
    setSuccess(null)
  }

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.brandName?.toLowerCase().includes(clientSearch.toLowerCase())
  )

  const filteredUsers = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.empId.toLowerCase().includes(userSearch.toLowerCase())
  )

  const toggleClient = (id: string) => {
    setSelectedClients((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card rounded-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Quick Allocate</h2>
            <p className="text-sm text-slate-400">
              Assign team members to clients in one click
            </p>
          </div>
          <button
            onClick={() => {
              onClose()
              resetForm()
            }}
            className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-200 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-200 rounded-lg text-green-400 text-sm">
                  {success}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Clients Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Select Clients ({selectedClients.length} selected)
                  </label>
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Search clients..."
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="h-48 overflow-y-auto border border-white/10 rounded-lg">
                    {filteredClients.map((client) => (
                      <label
                        key={client.id}
                        className={`flex items-center px-3 py-2 cursor-pointer hover:bg-slate-900/40 ${
                          selectedClients.includes(client.id) ? 'bg-blue-500/10' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(client.id)}
                          onChange={() => toggleClient(client.id)}
                          className="rounded border-white/20 text-blue-400 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-slate-200">
                          {client.name}
                          {client.brandName && (
                            <span className="text-slate-400 ml-1">
                              ({client.brandName})
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Users Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Select Employees ({selectedUsers.length} selected)
                  </label>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search employees..."
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="h-48 overflow-y-auto border border-white/10 rounded-lg">
                    {filteredUsers.map((user) => (
                      <label
                        key={user.id}
                        className={`flex items-center px-3 py-2 cursor-pointer hover:bg-slate-900/40 ${
                          selectedUsers.includes(user.id) ? 'bg-blue-500/10' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUser(user.id)}
                          className="rounded border-white/20 text-blue-400 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-slate-200">
                          {user.firstName} {user.lastName || ''}{' '}
                          <span className="text-slate-400">
                            ({user.empId} - {user.department})
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a role...</option>
                  {CLIENT_TEAM_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary checkbox */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded border-white/20 text-blue-400 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-slate-200">
                  Set as primary team member
                </span>
              </label>

              {/* Summary */}
              {selectedClients.length > 0 && selectedUsers.length > 0 && selectedRole && (
                <div className="p-4 bg-blue-500/10 rounded-lg">
                  <p className="text-sm text-blue-800">
                    This will create{' '}
                    <span className="font-bold">
                      {selectedClients.length * selectedUsers.length}
                    </span>{' '}
                    allocation(s): {selectedUsers.length} employee(s) to{' '}
                    {selectedClients.length} client(s).
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    resetForm()
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-lg hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    selectedClients.length === 0 ||
                    selectedUsers.length === 0 ||
                    !selectedRole ||
                    submitting
                  }
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Allocating...' : 'Allocate'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
