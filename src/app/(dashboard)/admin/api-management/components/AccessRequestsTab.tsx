'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { toast } from 'sonner'

interface Client {
  id: string
  name: string
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  whatsapp: string | null
}

interface AccessRequest {
  id: string
  clientId: string
  client: Client
  platform: string
  serviceType: string
  targetEmail: string
  status: string
  instructionsSentAt: string | null
  accessVerifiedAt: string | null
  notes: string | null
  createdAt: string
}

const statusColors: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  GRANTED: { bg: 'bg-green-500/20', text: 'text-green-400' },
  DENIED: { bg: 'bg-red-500/20', text: 'text-red-400' },
}

export function AccessRequestsTab() {
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [instructionsModal, setInstructionsModal] = useState<{
    request: AccessRequest
    channel: 'whatsapp' | 'email'
    data?: { phone?: string; email?: string; subject?: string; message?: string; note?: string }
  } | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [filterStatus])

  async function fetchRequests() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterStatus) params.set('status', filterStatus)

      const response = await fetch(`/api/admin/access-requests?${params}`)
      if (!response.ok) throw new Error('Failed to fetch requests')
      const data = await response.json()
      setRequests(data.requests)
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  async function handleSendInstructions(request: AccessRequest, channel: 'whatsapp' | 'email') {
    setActionLoading(request.id)
    try {
      const response = await fetch(`/api/admin/access-requests/${request.id}/send-instructions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel }),
      })
      const data = await response.json()

      if (data.success) {
        setInstructionsModal({ request, channel, data })
        fetchRequests()
      } else {
        toast.error(`Failed: ${data.error}`)
      }
    } catch {
      toast.error('Failed to prepare instructions')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleVerify(id: string, granted: boolean) {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/access-requests/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ granted }),
      })
      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        fetchRequests()
      } else {
        toast.error(`Failed: ${data.error}`)
      }
    } catch {
      toast.error('Failed to verify access')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this request?')) return

    try {
      const response = await fetch(`/api/admin/access-requests/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')
      fetchRequests()
    } catch {
      toast.error('Failed to delete request')
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-400">Loading access requests...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={fetchRequests}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header & Stats */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Access Requests</h2>
          <p className="text-sm text-slate-400">Track client access delegation requests</p>
        </div>
        <div className="flex gap-4">
          {Object.entries(stats).map(([status, count]) => (
            <div key={status} className={`text-center px-4 py-2 rounded-lg ${statusColors[status]?.bg || 'bg-slate-800/50'}`}>
              <p className="text-xl font-bold">{count}</p>
              <p className={`text-xs ${statusColors[status]?.text || 'text-slate-200'}`}>{status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-white/20 rounded-lg text-sm"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="GRANTED">Granted</option>
          <option value="DENIED">Denied</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Client</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Platform / Service</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Target Email</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Sent</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No access requests found
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="border-b border-white/5 hover:bg-slate-900/40">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-white">{request.client.name}</p>
                      {request.client.contactName && (
                        <p className="text-xs text-slate-400">{request.client.contactName}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{request.platform}</p>
                      <p className="text-xs text-slate-400">{request.serviceType}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-200">{request.targetEmail}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status]?.bg || 'bg-slate-800/50'} ${statusColors[request.status]?.text || 'text-slate-200'}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-200">
                    {request.instructionsSentAt ? (
                      formatDateDDMMYYYY(request.instructionsSentAt)
                    ) : (
                      <span className="text-slate-400">Not sent</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      {request.status === 'PENDING' && (
                        <>
                          {request.client.whatsapp && (
                            <button
                              onClick={() => handleSendInstructions(request, 'whatsapp')}
                              disabled={actionLoading === request.id}
                              className="px-2 py-1 text-xs text-green-400 hover:bg-green-500/10 rounded disabled:opacity-50"
                              title="Send via WhatsApp"
                            >
                              WhatsApp
                            </button>
                          )}
                          {request.client.contactEmail && (
                            <button
                              onClick={() => handleSendInstructions(request, 'email')}
                              disabled={actionLoading === request.id}
                              className="px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/10 rounded disabled:opacity-50"
                              title="Send via Email"
                            >
                              Email
                            </button>
                          )}
                          <button
                            onClick={() => handleVerify(request.id, true)}
                            disabled={actionLoading === request.id}
                            className="px-2 py-1 text-xs text-green-400 hover:bg-green-500/10 rounded disabled:opacity-50"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleVerify(request.id, false)}
                            disabled={actionLoading === request.id}
                            className="px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded disabled:opacity-50"
                          >
                            Deny
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(request.id)}
                        className="px-2 py-1 text-xs text-slate-400 hover:bg-slate-800/50 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Instructions Modal */}
      {instructionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Send Instructions via {instructionsModal.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}
                </h3>
                <button
                  onClick={() => setInstructionsModal(null)}
                  className="text-slate-400 hover:text-slate-300"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-200">To:</p>
                <p className="text-sm text-slate-300">
                  {instructionsModal.channel === 'whatsapp'
                    ? instructionsModal.data?.phone
                    : instructionsModal.data?.email}
                </p>
              </div>
              {instructionsModal.channel === 'email' && (
                <div>
                  <p className="text-sm font-medium text-slate-200">Subject:</p>
                  <p className="text-sm text-slate-300">{instructionsModal.data?.subject}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-slate-200 mb-2">Message:</p>
                <pre className="text-sm text-slate-300 bg-slate-900/40 p-4 rounded-lg whitespace-pre-wrap font-sans">
                  {instructionsModal.data?.message}
                </pre>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(instructionsModal.data?.message || '')
                    toast.success('Message copied to clipboard!')
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Copy Message
                </button>
                {instructionsModal.channel === 'whatsapp' && (
                  <a
                    href={`https://wa.me/${instructionsModal.data?.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(instructionsModal.data?.message || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center"
                  >
                    Open WhatsApp
                  </a>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-4">{instructionsModal.data?.note}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
