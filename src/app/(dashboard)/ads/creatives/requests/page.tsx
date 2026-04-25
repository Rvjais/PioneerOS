'use client'

import { useState, useEffect, useCallback } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/client/components/ui/Modal'

interface CreativeRequest {
  id: string
  client: string
  clientId: string
  title: string
  description: string
  designType: string
  status: 'REQUESTED' | 'IN_DESIGN' | 'REVIEW' | 'DELIVERED' | 'CHANGES_NEEDED'
  priority: string
  dueDate: string
  assignedDesigner: string
  requestDate: string
  createdBy: string
}

interface Client {
  id: string
  name: string
}

export default function CreativeRequestsPage() {
  const [requests, setRequests] = useState<CreativeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewRequest, setShowNewRequest] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    designType: 'IMAGE',
    priority: 'NORMAL',
    dueDate: '',
  })

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/ads/creative-requests')
      if (!res.ok) throw new Error('Failed to fetch creative requests')
      const data = await res.json()
      setRequests(data.requests || [])
    } catch (err) {
      // Show empty state instead of error
      setRequests([])
      setError(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  useEffect(() => {
    if (showNewRequest) {
      fetch('/api/clients')
        .then(res => res.json())
        .then(data => setClients(data.clients || []))
        .catch(() => setClients([]))
    }
  }, [showNewRequest])

  async function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/ads/creative-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed to create request')
      setShowNewRequest(false)
      setFormData({ clientId: '', title: '', description: '', designType: 'IMAGE', priority: 'NORMAL', dueDate: '' })
      fetchRequests()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="space-y-4">{Array.from({length:3}).map((_,i) => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}</div>
  if (error) return <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">{error}</div>

  const statusCounts = {
    requested: requests.filter(r => r.status === 'REQUESTED').length,
    inDesign: requests.filter(r => r.status === 'IN_DESIGN').length,
    review: requests.filter(r => r.status === 'REVIEW').length,
    delivered: requests.filter(r => r.status === 'DELIVERED').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'bg-slate-800/50 text-slate-200'
      case 'IN_DESIGN': return 'bg-blue-500/20 text-blue-400'
      case 'REVIEW': return 'bg-amber-500/20 text-amber-400'
      case 'DELIVERED': return 'bg-green-500/20 text-green-400'
      case 'CHANGES_NEEDED': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getDesignTypeColor = (type: string) => {
    switch (type) {
      case 'IMAGE': case 'STATIC': return 'bg-blue-500/20 text-blue-400'
      case 'VIDEO': case 'ANIMATED': return 'bg-pink-500/20 text-pink-400'
      case 'CAROUSEL': return 'bg-purple-500/20 text-purple-400'
      case 'PRINT': return 'bg-green-500/20 text-green-400'
      case 'BRANDING': return 'bg-amber-500/20 text-amber-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Creative Requests</h1>
            <p className="text-red-200">Design requests for ad creatives</p>
          </div>
          <button onClick={() => setShowNewRequest(true)} className="px-4 py-2 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors">
            + New Request
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300">Requested</p>
          <p className="text-3xl font-bold text-slate-200">{statusCounts.requested}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">In Design</p>
          <p className="text-3xl font-bold text-blue-400">{statusCounts.inDesign}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">In Review</p>
          <p className="text-3xl font-bold text-amber-400">{statusCounts.review}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Delivered</p>
          <p className="text-3xl font-bold text-green-400">{statusCounts.delivered}</p>
        </div>
      </div>

      {/* Request List */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">All Requests</h2>
        </div>
        {requests.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p className="text-lg">No creative requests found</p>
            <p className="text-sm mt-1">Click "New Request" to submit a design request to the Design team</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {requests.map(request => (
              <div key={request.id} className="p-4 hover:bg-slate-900/40">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-white">{request.title}</h3>
                    <p className="text-sm text-slate-400">{request.client} - by {request.createdBy}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getDesignTypeColor(request.designType)}`}>
                      {request.designType || 'Image'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(request.status)}`}>
                      {request.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                {request.description && (
                  <p className="text-sm text-slate-300 mb-3">{request.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Designer: <span className="text-slate-200 font-medium">{request.assignedDesigner}</span></span>
                  {request.dueDate && (
                    <span className="text-slate-400">Due: <span className={`font-medium ${new Date(request.dueDate) < new Date() ? 'text-red-400' : 'text-slate-200'}`}>
                      {new Date(request.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Guidelines */}
      <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
        <h3 className="font-semibold text-red-800 mb-3">Creative Request Guidelines</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-red-400">
          <div>
            <p className="font-medium mb-1">Request Details</p>
            <ul className="space-y-1">
              <li>• Include reference images</li>
              <li>• Specify ad platform</li>
              <li>• List all text content</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Turnaround Time</p>
            <ul className="space-y-1">
              <li>• Static Image: 1 day</li>
              <li>• Carousel: 2 days</li>
              <li>• Video: 3-5 days</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Approval Process</p>
            <ul className="space-y-1">
              <li>• Review within 24 hours</li>
              <li>• One revision included</li>
              <li>• Final approval required</li>
            </ul>
          </div>
        </div>
      </div>

      {/* New Request Modal */}
      <Modal isOpen={showNewRequest} onClose={() => setShowNewRequest(false)} title="New Creative Request" size="lg">
        <form onSubmit={handleSubmitRequest}>
          <ModalBody>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Client *</label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-red-500"
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Summer Sale Banner"
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Describe what you need, include any specific requirements, colors, text, etc."
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">Design Type</label>
                <select
                  value={formData.designType}
                  onChange={(e) => setFormData({ ...formData, designType: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-red-500"
                >
                  <option value="IMAGE">Static Image</option>
                  <option value="VIDEO">Video</option>
                  <option value="ANIMATED">Animated/GIF</option>
                  <option value="CAROUSEL">Carousel</option>
                  <option value="PRINT">Print Design</option>
                  <option value="BRANDING">Branding</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-red-500"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <button
              type="button"
              onClick={() => setShowNewRequest(false)}
              className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800/50 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.clientId || !formData.title}
              className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}