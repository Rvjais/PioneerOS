'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { CLIENT_TEAM_ROLES, ACCESS_REQUEST_STATUS, getColorForValue, getLabelForValue } from '@/shared/constants/formConstants'
import { extractArrayData } from '@/server/apiResponse'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

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
  status: string
}

interface AccessRequest {
  id: string
  clientId: string
  client: Client
  requestedBy: User
  requestedRole: string
  purpose?: string | null
  status: string
  approvedBy?: { firstName: string; lastName?: string | null } | null
  approvedAt?: string | null
  rejectionReason?: string | null
  createdAt: string
}

export default function AdminClientAccessRequestsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('PENDING')
  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean
    requestId: string | null
  }>({ isOpen: false, requestId: null })
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [statusFilter])

  async function fetchRequests() {
    try {
      setLoading(true)
      const res = await fetch(
        `/api/client-access-requests?status=${statusFilter}&limit=100`
      )
      if (res.ok) {
        const data = await res.json()
        setRequests(extractArrayData<AccessRequest>(data))
      }
    } catch {
      console.error('Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(requestId: string) {
    setProcessing(requestId)
    try {
      const res = await fetch(`/api/client-access-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE' }),
      })

      if (res.ok) {
        fetchRequests()
      }
    } catch {
      console.error('Failed to approve')
    } finally {
      setProcessing(null)
    }
  }

  async function handleReject() {
    if (!rejectionModal.requestId) return

    setProcessing(rejectionModal.requestId)
    try {
      const res = await fetch(
        `/api/client-access-requests/${rejectionModal.requestId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'REJECT',
            rejectionReason: rejectionReason || null,
          }),
        }
      )

      if (res.ok) {
        setRejectionModal({ isOpen: false, requestId: null })
        setRejectionReason('')
        fetchRequests()
      }
    } catch {
      console.error('Failed to reject')
    } finally {
      setProcessing(null)
    }
  }

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Client Access Requests</h1>
            <p className="text-purple-100">
              Review and approve employee requests for client access
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-purple-100">Pending</p>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="flex gap-2">
          {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
              }`}
            >
              {getLabelForValue(ACCESS_REQUEST_STATUS, status)}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No {statusFilter.toLowerCase()} requests found.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {requests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-slate-900/40">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <UserAvatar user={{ id: request.requestedBy.id, firstName: request.requestedBy.firstName, lastName: request.requestedBy.lastName }} size="md" showPreview={false} />
                      <div>
                        <p className="font-medium text-white">
                          {request.requestedBy.firstName}{' '}
                          {request.requestedBy.lastName || ''}
                        </p>
                        <p className="text-sm text-slate-400">
                          {request.requestedBy.empId} • {request.requestedBy.department}
                        </p>
                      </div>
                    </div>

                    <div className="ml-13 mt-3 space-y-1">
                      <p className="text-sm">
                        <span className="text-slate-400">Requesting access to:</span>{' '}
                        <span className="font-medium text-white">
                          {request.client.name}
                        </span>
                        <span
                          className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                            request.client.tier === 'ENTERPRISE'
                              ? 'bg-purple-500/20 text-purple-400'
                              : request.client.tier === 'PREMIUM'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-slate-800/50 text-slate-300'
                          }`}
                        >
                          {request.client.tier}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-slate-400">As:</span>{' '}
                        <span className="font-medium text-white">
                          {getLabelForValue(CLIENT_TEAM_ROLES, request.requestedRole)}
                        </span>
                      </p>
                      {request.purpose && (
                        <p className="text-sm text-slate-300 bg-slate-900/40 p-2 rounded mt-2">
                          {request.purpose}
                        </p>
                      )}
                    </div>

                    <div className="ml-13 mt-2">
                      <p className="text-xs text-slate-400">
                        Requested {formatDateDDMMYYYY(request.createdAt)} at{' '}
                        {new Date(request.createdAt).toLocaleTimeString()}
                      </p>
                      {request.approvedBy && request.approvedAt && (
                        <p className="text-xs text-slate-400 mt-1">
                          {request.status === 'APPROVED' ? 'Approved' : 'Rejected'} by{' '}
                          {request.approvedBy.firstName} {request.approvedBy.lastName || ''} on{' '}
                          {formatDateDDMMYYYY(request.approvedAt)}
                        </p>
                      )}
                      {request.rejectionReason && (
                        <p className="text-xs text-red-500 mt-1">
                          Reason: {request.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getColorForValue(ACCESS_REQUEST_STATUS, request.status)}`}
                    >
                      {getLabelForValue(ACCESS_REQUEST_STATUS, request.status)}
                    </span>

                    {request.status === 'PENDING' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={processing === request.id}
                          className="px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {processing === request.id ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() =>
                            setRejectionModal({ isOpen: true, requestId: request.id })
                          }
                          disabled={processing === request.id}
                          className="px-3 py-1.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectionModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Reject Access Request
            </h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              rows={3}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setRejectionModal({ isOpen: false, requestId: null })
                  setRejectionReason('')
                }}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-lg hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
