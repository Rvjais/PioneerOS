'use client'

import { useState, useEffect, use } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PhaseTracker } from '@/client/components/web/PhaseTracker'
import { MAINTENANCE_CONTRACT_TYPES, MAINTENANCE_CONTRACT_STATUS, getColorForValue, getLabelForValue } from '@/shared/constants/formConstants'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

interface WebProjectPhase {
  id: string
  phase: string
  status: string
  order: number
  notes?: string | null
  proofUrl?: string | null
  startedAt?: string | null
  completedAt?: string | null
  user?: {
    id: string
    firstName: string
    lastName?: string | null
  } | null
}

interface MaintenanceContract {
  id: string
  type: string
  startDate: string
  endDate: string
  renewalDate?: string | null
  amount: number
  status: string
  autoRenew: boolean
  notes?: string | null
}

interface TeamMember {
  id: string
  role: string
  isPrimary: boolean
  user: {
    id: string
    firstName: string
    lastName?: string | null
    empId: string
    department: string
  }
}

interface WebClient {
  id: string
  name: string
  brandName?: string | null
  contactName?: string | null
  contactPhone?: string | null
  contactEmail?: string | null
  websiteUrl?: string | null
  status: string
  clientType: string
  notes?: string | null
  webProjectStatus?: string | null
  websiteType?: string | null
  webProjectStartDate?: string | null
  webProjectEndDate?: string | null
  webProjectPhases: WebProjectPhase[]
  maintenanceContracts: MaintenanceContract[]
  teamMembers: TeamMember[]
  createdAt: string
}

const PROJECT_STATUS_OPTIONS = [
  { value: 'PIPELINE', label: 'Pipeline', color: 'bg-amber-500/20 text-amber-400' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400' },
  { value: 'MAINTENANCE', label: 'Maintenance', color: 'bg-purple-500/20 text-purple-400' },
]

export default function WebClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: clientId } = use(params)
  const router = useRouter()
  const [client, setClient] = useState<WebClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [showContractModal, setShowContractModal] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchClient()
  }, [clientId])

  async function fetchClient() {
    try {
      setLoading(true)
      const res = await fetch(`/api/web-clients/${clientId}`)
      if (res.ok) {
        const data = await res.json()
        setClient(data)
      }
    } catch (error) {
      console.error('Failed to fetch client:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateProjectStatus(newStatus: string) {
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/web-clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webProjectStatus: newStatus }),
      })
      if (res.ok) {
        fetchClient()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Client not found</p>
        <Link href="/web/clients" className="text-teal-600 hover:underline mt-2 inline-block">
          Back to clients
        </Link>
      </div>
    )
  }

  const completedPhases = client.webProjectPhases.filter((p) => p.status === 'COMPLETED').length
  const totalPhases = client.webProjectPhases.length
  const allPhasesComplete = completedPhases === totalPhases && totalPhases > 0
  const activeContracts = client.maintenanceContracts?.filter((c) => c.status === 'ACTIVE') || []

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/web/clients"
            className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{client.name}</h1>
              {client.brandName && (
                <span className="text-lg text-slate-400">({client.brandName})</span>
              )}
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  client.clientType === 'RECURRING'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-orange-500/20 text-orange-400'
                }`}
              >
                {client.clientType === 'RECURRING' ? 'Recurring' : 'One-Time'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-400">Project Status:</span>
              <select
                value={client.webProjectStatus || 'IN_PROGRESS'}
                onChange={(e) => updateProjectStatus(e.target.value)}
                disabled={updatingStatus}
                className={`text-sm px-2 py-1 rounded-lg border-0 cursor-pointer ${
                  PROJECT_STATUS_OPTIONS.find(o => o.value === (client.webProjectStatus || 'IN_PROGRESS'))?.color || 'bg-slate-800/50'
                }`}
              >
                {PROJECT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {updatingStatus && (
                <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {client.clientType === 'ONE_TIME' && allPhasesComplete && (
            <button
              onClick={() => setShowConvertModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Convert to Recurring
            </button>
          )}
          <button
            onClick={() => setShowContractModal(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Add Contract
          </button>
        </div>
      </div>

      {/* Client Info Card */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-teal-100 text-sm">Contact</p>
            <p className="font-medium">{client.contactName || 'Not set'}</p>
            {client.contactPhone && (
              <p className="text-sm text-teal-100">{client.contactPhone}</p>
            )}
            {client.contactEmail && (
              <p className="text-sm text-teal-100">{client.contactEmail}</p>
            )}
          </div>
          <div>
            <p className="text-teal-100 text-sm">Website</p>
            {client.websiteUrl ? (
              <a
                href={client.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline flex items-center gap-1"
              >
                {client.websiteUrl.replace(/^https?:\/\//, '')}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <p className="font-medium">Not set</p>
            )}
          </div>
          <div>
            <p className="text-teal-100 text-sm">Status</p>
            <span
              className={`inline-block mt-1 px-3 py-1 text-sm font-medium rounded-full ${
                client.status === 'ACTIVE'
                  ? 'bg-white/20 backdrop-blur-sm text-white'
                  : 'bg-amber-400/20 text-amber-100'
              }`}
            >
              {client.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Phase Tracker - Main Content */}
        <div className="lg:col-span-2">
          <PhaseTracker
            clientId={clientId}
            phases={client.webProjectPhases}
            onUpdate={fetchClient}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Members */}
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 bg-slate-900/40">
              <h3 className="font-semibold text-white">Team Members</h3>
            </div>
            <div className="p-4">
              {client.teamMembers && client.teamMembers.length > 0 ? (
                <div className="space-y-3">
                  {client.teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <UserAvatar user={{ id: member.user.id || member.id, firstName: member.user.firstName, lastName: member.user.lastName }} size="sm" showPreview={false} />
                      <div className="flex-1">
                        <Link href={`/team/${member.user.id}`} className="hover:underline">
                          <p className="text-sm font-medium text-white">
                            {member.user.firstName} {member.user.lastName || ''}
                            {member.isPrimary && (
                              <span className="ml-2 text-xs text-teal-600">(Primary)</span>
                            )}
                          </p>
                        </Link>
                        <p className="text-xs text-slate-400">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No team members assigned</p>
              )}
            </div>
          </div>

          {/* Active Contracts */}
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 bg-slate-900/40">
              <h3 className="font-semibold text-white">Maintenance Contracts</h3>
            </div>
            <div className="p-4">
              {activeContracts.length > 0 ? (
                <div className="space-y-3">
                  {activeContracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="p-3 bg-slate-900/40 rounded-lg border border-white/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">
                          {getLabelForValue(MAINTENANCE_CONTRACT_TYPES, contract.type)}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${getColorForValue(MAINTENANCE_CONTRACT_STATUS, contract.status)}`}
                        >
                          {getLabelForValue(MAINTENANCE_CONTRACT_STATUS, contract.status)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Amount: ₹{contract.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">
                        Ends: {formatDateDDMMYYYY(contract.endDate)}
                      </p>
                      {contract.renewalDate && (
                        <p className="text-xs text-amber-400">
                          Renewal: {formatDateDDMMYYYY(contract.renewalDate)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No active contracts</p>
              )}
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 bg-slate-900/40">
                <h3 className="font-semibold text-white">Project Notes</h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{client.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contract Modal */}
      {showContractModal && (
        <ContractModal
          clientId={clientId}
          onClose={() => setShowContractModal(false)}
          onSuccess={() => {
            setShowContractModal(false)
            fetchClient()
          }}
        />
      )}

      {/* Convert Modal */}
      {showConvertModal && (
        <ConvertModal
          clientId={clientId}
          onClose={() => setShowConvertModal(false)}
          onSuccess={() => {
            setShowConvertModal(false)
            fetchClient()
          }}
        />
      )}
    </div>
  )
}

function ContractModal({
  clientId,
  onClose,
  onSuccess,
}: {
  clientId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: 'MONTHLY_MAINTENANCE',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    amount: '',
    autoRenew: false,
    notes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/maintenance-contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, clientId }),
      })

      if (res.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Failed to create contract:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-white mb-4">Add Maintenance Contract</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Contract Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {MAINTENANCE_CONTRACT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="5000"
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.autoRenew}
              onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
              className="rounded border-white/20 text-teal-600 focus:ring-teal-500"
            />
            <span className="ml-2 text-sm text-slate-200">Auto-renew</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-lg hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConvertModal({
  clientId,
  onClose,
  onSuccess,
}: {
  clientId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    serviceSegment: 'MARKETING',
    billingType: 'MONTHLY',
    monthlyFee: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch(`/api/web-clients/${clientId}/convert-recurring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Failed to convert client:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-white mb-4">Convert to Recurring Client</h3>

        <p className="text-sm text-slate-300 mb-4">
          This will change the client type from one-time to recurring, enabling monthly billing and retainer tracking.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Service Segment
            </label>
            <select
              value={formData.serviceSegment}
              onChange={(e) => setFormData({ ...formData, serviceSegment: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="MARKETING">Marketing Retainer</option>
              <option value="WEBSITE">Website Maintenance</option>
              <option value="AMC">Annual Maintenance Contract</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Billing Type
            </label>
            <select
              value={formData.billingType}
              onChange={(e) => setFormData({ ...formData, billingType: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="ANNUAL">Annual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Monthly Fee (₹)
            </label>
            <input
              type="number"
              value={formData.monthlyFee}
              onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
              placeholder="25000"
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-lg hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? 'Converting...' : 'Convert to Recurring'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
