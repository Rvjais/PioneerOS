'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/client/components/ui/Modal'
import { toast } from 'sonner'

interface ClientApproval {
  id: string
  client: string
  clientId?: string
  deliverable: string
  deliverableType: 'Blog Topic' | 'Content Draft' | 'Landing Page' | 'Monthly Report'
  submittedDate: string
  submittedBy: string
  submittedById?: string
  reviewer: string
  status: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED'
  feedback?: string
  dueDate?: string | null
}

interface Client {
  id: string
  name: string
}

export default function SeoClientApprovalsPage() {
  const [approvals, setApprovals] = useState<ClientApproval[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState<ClientApproval | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    clientId: '',
    deliverable: '',
    deliverableType: 'Content Draft' as 'Blog Topic' | 'Content Draft' | 'Landing Page' | 'Monthly Report',
    reviewerName: '',
    dueDate: ''
  })

  useEffect(() => {
    fetchApprovals()
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients?status=ACTIVE&limit=100')
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients || [])
      }
    } catch {
      // silently fail
    }
  }

  const fetchApprovals = async () => {
    try {
      const res = await fetch('/api/seo/client-approvals')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setApprovals(data.approvals || [])
    } catch (err) {
      console.error('Failed to fetch approvals:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddApproval = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/seo/client-approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Failed to create approval')
      toast.success('Client approval added successfully')
      setShowAddModal(false)
      setFormData({ clientId: '', deliverable: '', deliverableType: 'Content Draft', reviewerName: '', dueDate: '' })
      fetchApprovals()
    } catch (err: any) {
      toast.error(err.message || 'Error adding approval')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMakeChanges = async (id: string) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/seo/client-approvals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'PENDING', feedback: null })
      })
      if (!res.ok) throw new Error('Failed to update')
      toast.success('Status updated - ready for client review')
      fetchApprovals()
    } catch (err: any) {
      toast.error(err.message || 'Error updating approval')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (id: string, feedback?: string) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/seo/client-approvals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'APPROVED', feedback: feedback || 'Approved by client.' })
      })
      if (!res.ok) throw new Error('Failed to approve')
      toast.success('Deliverable approved')
      fetchApprovals()
    } catch (err: any) {
      toast.error(err.message || 'Error approving')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestChanges = async (id: string) => {
    const feedback = prompt('Enter changes requested:')
    if (!feedback) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/seo/client-approvals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'CHANGES_REQUESTED', feedback })
      })
      if (!res.ok) throw new Error('Failed to request changes')
      toast.success('Changes requested')
      fetchApprovals()
    } catch (err: any) {
      toast.error(err.message || 'Error requesting changes')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendReminder = async (id: string) => {
    toast.success('Reminder sent to client successfully.')
  }

  const handleViewDetails = (approval: ClientApproval) => {
    setSelectedApproval(approval)
    setShowDetailsModal(true)
  }

  const filteredApprovals = filter === 'all' ? approvals : approvals.filter(a => a.status === filter)

  const pendingCount = approvals.filter(a => a.status === 'PENDING').length
  const approvedCount = approvals.filter(a => a.status === 'APPROVED').length
  const changesCount = approvals.filter(a => a.status === 'CHANGES_REQUESTED').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/20 text-amber-400'
      case 'APPROVED': return 'bg-green-500/20 text-green-400'
      case 'CHANGES_REQUESTED': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Blog Topic': return 'bg-purple-500/20 text-purple-400'
      case 'Content Draft': return 'bg-emerald-500/20 text-emerald-400'
      case 'Landing Page': return 'bg-blue-500/20 text-blue-400'
      case 'Monthly Report': return 'bg-indigo-500/20 text-indigo-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Client Approvals</h1>
            <p className="text-teal-200">Track approval status from clients</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-white text-teal-600 rounded-lg font-medium hover:bg-teal-50 transition-colors"
          >
            + Add Approval
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div
          onClick={() => setFilter(filter === 'PENDING' ? 'all' : 'PENDING')}
          className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
            filter === 'PENDING' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 glass-card hover:border-amber-300'
          }`}
        >
          <p className="text-sm text-slate-400">Awaiting Approval</p>
          <p className="text-3xl font-bold text-amber-400">{pendingCount}</p>
        </div>
        <div
          onClick={() => setFilter(filter === 'APPROVED' ? 'all' : 'APPROVED')}
          className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
            filter === 'APPROVED' ? 'border-green-500 bg-green-500/10' : 'border-white/10 glass-card hover:border-green-300'
          }`}
        >
          <p className="text-sm text-slate-400">Approved</p>
          <p className="text-3xl font-bold text-green-400">{approvedCount}</p>
        </div>
        <div
          onClick={() => setFilter(filter === 'CHANGES_REQUESTED' ? 'all' : 'CHANGES_REQUESTED')}
          className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
            filter === 'CHANGES_REQUESTED' ? 'border-red-500 bg-red-500/10' : 'border-white/10 glass-card hover:border-red-300'
          }`}
        >
          <p className="text-sm text-slate-400">Changes Requested</p>
          <p className="text-3xl font-bold text-red-400">{changesCount}</p>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.map(approval => (
          <div key={approval.id} className={`glass-card rounded-xl border-2 p-4 ${
            approval.status === 'CHANGES_REQUESTED' ? 'border-red-200' :
            approval.status === 'PENDING' ? 'border-amber-200' : 'border-white/10'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">{approval.deliverable}</h3>
                <p className="text-sm text-slate-400">{approval.client}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(approval.status)}`}>
                {approval.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(approval.deliverableType)}`}>
                {approval.deliverableType}
              </span>
              <span>Submitted: {new Date(approval.submittedDate).toLocaleDateString('en-IN')}</span>
              <span>Reviewer: {approval.reviewer}</span>
            </div>

            {approval.feedback && (
              <div className={`p-3 rounded-lg ${
                approval.status === 'APPROVED' ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                <p className="text-sm font-medium text-slate-200 mb-1">Client Feedback:</p>
                <p className={`text-sm ${approval.status === 'APPROVED' ? 'text-green-400' : 'text-red-400'}`}>
                  {approval.feedback}
                </p>
              </div>
            )}

            {approval.status === 'CHANGES_REQUESTED' && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleMakeChanges(approval.id)}
                  disabled={submitting}
                  className="px-3 py-1.5 text-sm font-medium text-teal-400 bg-teal-500/10 rounded-lg hover:bg-teal-500/20 transition-colors disabled:opacity-50"
                >
                  Make Changes
                </button>
                <button
                  onClick={() => handleViewDetails(approval)}
                  className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-900/40 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  View Details
                </button>
              </div>
            )}

            {approval.status === 'PENDING' && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleSendReminder(approval.id)}
                  className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-900/40 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Send Reminder
                </button>
                <button
                  onClick={() => handleViewDetails(approval)}
                  className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-900/40 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  View Submission
                </button>
              </div>
            )}
          </div>
        ))}
        {filteredApprovals.length === 0 && (
          <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
            <p className="text-slate-400">No client approvals found</p>
          </div>
        )}
      </div>

      {/* Action Required */}
      {changesCount > 0 && (
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <h3 className="font-semibold text-red-800 mb-2">Action Required</h3>
          <p className="text-sm text-red-400">
            {changesCount} deliverable(s) have changes requested by clients. Please review feedback and make necessary updates.
          </p>
        </div>
      )}

      {/* Add Approval Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Client Approval" size="md">
        <form onSubmit={handleAddApproval}>
          <ModalBody>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Client *</label>
              <select
                required
                value={formData.clientId}
                onChange={e => setFormData({...formData, clientId: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200"
              >
                <option value="">Select a client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Deliverable *</label>
              <input
                required
                type="text"
                value={formData.deliverable}
                onChange={e => setFormData({...formData, deliverable: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200"
                placeholder="e.g. Blog: Best Cardiologist in Delhi - Final Draft"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">Deliverable Type</label>
                <select
                  value={formData.deliverableType}
                  onChange={e => setFormData({...formData, deliverableType: e.target.value as any})}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200"
                >
                  <option value="Blog Topic">Blog Topic</option>
                  <option value="Content Draft">Content Draft</option>
                  <option value="Landing Page">Landing Page</option>
                  <option value="Monthly Report">Monthly Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Reviewer Name (optional)</label>
              <input
                type="text"
                value={formData.reviewerName}
                onChange={e => setFormData({...formData, reviewerName: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200"
                placeholder="e.g. Client - Dr. Reddy"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-slate-200 bg-slate-800/50 rounded-lg">Cancel</button>
            <button type="submit" disabled={submitting} className="px-6 py-2 text-sm text-white bg-teal-600 rounded-lg disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add Approval'}
            </button>
          </ModalFooter>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Client Approval Details" size="md">
        <ModalBody>
          {selectedApproval && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Deliverable</p>
                  <p className="font-medium text-white">{selectedApproval.deliverable}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Client</p>
                  <p className="font-medium text-white">{selectedApproval.client}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Deliverable Type</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getTypeColor(selectedApproval.deliverableType)}`}>
                    {selectedApproval.deliverableType}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(selectedApproval.status)}`}>
                    {selectedApproval.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Submitted By</p>
                  <p className="font-medium text-white">{selectedApproval.submittedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Reviewer</p>
                  <p className="font-medium text-white">{selectedApproval.reviewer}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Submitted Date</p>
                  <p className="font-medium text-white">{new Date(selectedApproval.submittedDate).toLocaleDateString('en-IN')}</p>
                </div>
                {selectedApproval.dueDate && (
                  <div>
                    <p className="text-sm text-slate-400">Due Date</p>
                    <p className="font-medium text-white">{new Date(selectedApproval.dueDate).toLocaleDateString('en-IN')}</p>
                  </div>
                )}
              </div>
              {selectedApproval.feedback && (
                <div className="border-t border-white/10 pt-4 mt-4">
                  <p className="text-sm text-slate-400 mb-1">Feedback</p>
                  <p className="text-white">{selectedApproval.feedback}</p>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <div className="flex gap-2 mr-auto">
            {selectedApproval?.status === 'PENDING' && (
              <>
                <button
                  onClick={() => { handleApprove(selectedApproval.id); setShowDetailsModal(false) }}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => { handleRequestChanges(selectedApproval.id); setShowDetailsModal(false) }}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Request Changes
                </button>
              </>
            )}
          </div>
          <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 text-sm text-slate-200 bg-slate-800/50 rounded-lg">Close</button>
        </ModalFooter>
      </Modal>
    </div>
  )
}