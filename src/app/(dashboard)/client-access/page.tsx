'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { CLIENT_TEAM_ROLES, ACCESS_REQUEST_STATUS, getColorForValue, getLabelForValue } from '@/shared/constants/formConstants'
import { extractArrayData } from '@/server/apiResponse'

interface Client {
  id: string
  name: string
  brandName?: string | null
  tier: string
  status: string
}

interface AccessRequest {
  id: string
  clientId: string
  client: Client
  requestedRole: string
  purpose?: string | null
  status: string
  approvedAt?: string | null
  rejectionReason?: string | null
  createdAt: string
}

export default function ClientAccessPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [myRequests, setMyRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [purpose, setPurpose] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [clientsRes, requestsRes] = await Promise.all([
        fetch('/api/clients?limit=500'),
        fetch('/api/client-access-requests'),
      ])

      if (clientsRes.ok) {
        const data = await clientsRes.json()
        setClients(extractArrayData<Client>(data))
      }

      if (requestsRes.ok) {
        const data = await requestsRes.json()
        setMyRequests(extractArrayData<AccessRequest>(data))
      }
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedClient || !selectedRole) {
      setError('Please select a client and role')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/client-access-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient.id,
          requestedRole: selectedRole,
          purpose: purpose || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit request')
        return
      }

      setSuccess('Access request submitted successfully!')
      setSelectedClient(null)
      setSelectedRole('')
      setPurpose('')
      setSearchTerm('')
      fetchData()
    } catch {
      setError('Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Request Client Access</h1>
        <p className="text-blue-100">
          Search for a client and request access with the appropriate role
        </p>
      </div>

      {/* Request Form */}
      <div className="glass-card rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">New Access Request</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-200 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-200 rounded-lg text-green-400 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Search */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Search Client
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type client name..."
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Client dropdown */}
            {searchTerm && !selectedClient && (
              <div className="mt-2 max-h-48 overflow-y-auto glass-card border border-white/10 rounded-lg shadow-none">
                {filteredClients.length === 0 ? (
                  <p className="px-4 py-2 text-slate-400 text-sm">No clients found</p>
                ) : (
                  filteredClients.slice(0, 10).map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => {
                        setSelectedClient(client)
                        setSearchTerm('')
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-900/40 flex items-center justify-between"
                    >
                      <span className="font-medium text-white">
                        {client.name}
                        {client.brandName && (
                          <span className="text-slate-400 ml-2">({client.brandName})</span>
                        )}
                      </span>
                      <span className="text-xs text-slate-400">{client.tier}</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Selected client */}
            {selectedClient && (
              <div className="mt-2 flex items-center justify-between bg-blue-500/10 px-4 py-2 rounded-lg">
                <span className="font-medium text-blue-800">{selectedClient.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedClient(null)}
                  className="text-blue-400 hover:text-blue-800"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Requested Role
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

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Purpose (Optional)
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Why do you need access to this client?"
              rows={3}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!selectedClient || !selectedRole || submitting}
            className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Access Request'}
          </button>
        </form>
      </div>

      {/* My Requests */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">My Access Requests</h2>
        </div>

        {myRequests.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-400">
            You haven&apos;t made any access requests yet.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {myRequests.map((request) => (
              <div key={request.id} className="px-6 py-4 hover:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{request.client.name}</p>
                    <p className="text-sm text-slate-400">
                      Role: {getLabelForValue(CLIENT_TEAM_ROLES, request.requestedRole)}
                    </p>
                    {request.purpose && (
                      <p className="text-sm text-slate-400 mt-1">Purpose: {request.purpose}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getColorForValue(ACCESS_REQUEST_STATUS, request.status)}`}
                    >
                      {getLabelForValue(ACCESS_REQUEST_STATUS, request.status)}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDateDDMMYYYY(request.createdAt)}
                    </p>
                    {request.rejectionReason && (
                      <p className="text-xs text-red-500 mt-1">
                        Reason: {request.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
