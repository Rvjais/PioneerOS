'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Modal, ModalBody, ModalFooter } from '@/client/components/ui/Modal'
import { toast } from 'sonner'

const SOCIAL_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SOCIAL_MEDIA']

interface CreativeRequest {
  id: string
  client: string
  postTopic: string
  designType: 'Static Post' | 'Carousel' | 'Reel' | 'Story' | 'Cover Image'
  designInstructions: string
  assignedDesigner: string
  status: 'REQUESTED' | 'IN_DESIGN' | 'REVIEW' | 'DELIVERED' | 'CHANGES_NEEDED'
  requestDate: string
  dueDate: string
}

export default function CreativeRequestsPage() {
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || ''
  const canEdit = SOCIAL_ROLES.includes(userRole)

  const [requests, setRequests] = useState<CreativeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    clientId: '',
    postTopic: '',
    designType: 'Static Post',
    designInstructions: '',
    dueDate: '',
  })
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => setClients(data.clients || []))
      .catch((error) => { console.error('Failed to load clients:', error); toast.error('Failed to load clients. Please try again.') })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/social/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          title: formData.postTopic,
          description: formData.designInstructions,
          type: 'CREATIVE',
          contentType: formData.designType,
          dueDate: formData.dueDate || undefined,
          status: 'PENDING',
          priority: 'NORMAL',
        }),
      })
      if (!res.ok) throw new Error('Failed to create request')
      setShowAddModal(false)
      setFormData({ clientId: '', postTopic: '', designType: 'Static Post', designInstructions: '', dueDate: '' })
      // Refresh
      const result = await (await fetch('/api/social/approvals?type=CREATIVE')).json()
      const items = result.approvals || result.data || []
      const mapped: CreativeRequest[] = items.map((item: any) => ({
        id: item.id,
        client: item.client?.name || '',
        postTopic: item.title || '',
        designType: item.contentType || 'Static Post',
        designInstructions: item.description || '',
        assignedDesigner: item.reviewedBy?.name || '',
        status: item.status === 'PENDING' ? 'REQUESTED' : item.status === 'APPROVED' ? 'DELIVERED' : item.status === 'REVISION_REQUESTED' ? 'CHANGES_NEEDED' : 'IN_DESIGN',
        requestDate: item.createdAt || '',
        dueDate: item.dueDate || '',
      }))
      setRequests(mapped)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    fetch('/api/social/approvals?type=CREATIVE')
      .then(res => res.json())
      .then(result => {
        const items = result.approvals || result.data || []
        const mapped: CreativeRequest[] = items.map((item: any) => ({
          id: item.id,
          client: item.client?.name || '',
          postTopic: item.title || '',
          designType: item.contentType || 'Static Post',
          designInstructions: item.description || '',
          assignedDesigner: item.reviewedBy?.name || '',
          status: item.status === 'PENDING' ? 'REQUESTED' : item.status === 'APPROVED' ? 'DELIVERED' : item.status === 'REVISION_REQUESTED' ? 'CHANGES_NEEDED' : 'IN_DESIGN',
          requestDate: item.createdAt || '',
          dueDate: item.dueDate || '',
        }))
        setRequests(mapped)
      })
      .catch((error) => { console.error('Failed to load creative requests:', error); toast.error('Failed to load creative requests. Please try again.') })
      .finally(() => setLoading(false))
  }, [])

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
      case 'Carousel': return 'bg-pink-500/20 text-pink-400'
      case 'Reel': return 'bg-fuchsia-100 text-fuchsia-700'
      case 'Story': return 'bg-orange-500/20 text-orange-400'
      case 'Cover Image': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-blue-500/20 text-blue-400'
    }
  }

  const statusCounts = {
    requested: requests.filter(r => r.status === 'REQUESTED').length,
    inDesign: requests.filter(r => r.status === 'IN_DESIGN').length,
    review: requests.filter(r => r.status === 'REVIEW').length,
    delivered: requests.filter(r => r.status === 'DELIVERED').length,
    changesNeeded: requests.filter(r => r.status === 'CHANGES_NEEDED').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Creative Requests</h1>
            <p className="text-pink-200">Design requests sent to the design team</p>
          </div>
          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-white text-pink-600 rounded-lg font-medium hover:bg-pink-50 transition-colors"
            >
              + New Request
            </button>
          )}
        </div>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300">Requested</p>
          <p className="text-3xl font-bold text-slate-200">{statusCounts.requested}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">In Design</p>
          <p className="text-3xl font-bold text-blue-400">{statusCounts.inDesign}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Review</p>
          <p className="text-3xl font-bold text-amber-400">{statusCounts.review}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Delivered</p>
          <p className="text-3xl font-bold text-green-400">{statusCounts.delivered}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Changes Needed</p>
          <p className="text-3xl font-bold text-red-400">{statusCounts.changesNeeded}</p>
        </div>
      </div>

      {/* Requests List */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">All Requests</h2>
        </div>
        <div className="divide-y divide-white/10">
          {requests.map(request => (
            <div key={request.id} className="p-4 hover:bg-slate-900/40">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-white">{request.postTopic}</h3>
                  <p className="text-sm text-slate-400">{request.client}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getDesignTypeColor(request.designType)}`}>
                    {request.designType}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(request.status)}`}>
                    {request.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-3">{request.designInstructions}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Designer: <span className="text-slate-200 font-medium">{request.assignedDesigner}</span></span>
                <span className="text-slate-400">Due: <span className={`font-medium ${new Date(request.dueDate) < new Date() ? 'text-red-400' : 'text-slate-200'}`}>
                  {new Date(request.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request Guidelines */}
      <div className="bg-pink-50 rounded-xl border border-pink-200 p-4">
        <h3 className="font-semibold text-pink-800 mb-3">Creative Request Guidelines</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-pink-700">
          <div>
            <p className="font-medium mb-1">Request Details</p>
            <ul className="space-y-1">
              <li>• Include reference images</li>
              <li>• Specify exact dimensions</li>
              <li>• List all text content</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Turnaround Time</p>
            <ul className="space-y-1">
              <li>• Static Post: 1 day</li>
              <li>• Carousel: 2 days</li>
              <li>• Reel/Video: 3 days</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Review Process</p>
            <ul className="space-y-1">
              <li>• Review within 24 hours</li>
              <li>• One revision included</li>
              <li>• Tag designer for changes</li>
            </ul>
          </div>
        </div>
      </div>
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Creative Request" size="lg">
        <form onSubmit={handleSubmit}>
          <ModalBody>
            {error && <div className="mb-4 text-red-400 text-sm bg-red-500/10 p-3 rounded">{error}</div>}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Client *</label>
              <select required value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200">
                <option value="">Select a client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Post Topic / Title *</label>
              <input required type="text" value={formData.postTopic} onChange={e => setFormData({...formData, postTopic: e.target.value})} className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">Design Type</label>
                <select value={formData.designType} onChange={e => setFormData({...formData, designType: e.target.value as CreativeRequest['designType']})} className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200">
                  <option value="Static Post">Static Post</option>
                  <option value="Carousel">Carousel</option>
                  <option value="Reel">Reel</option>
                  <option value="Story">Story</option>
                  <option value="Cover Image">Cover Image</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">Due Date</label>
                <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Design Instructions</label>
              <textarea rows={3} value={formData.designInstructions} onChange={e => setFormData({...formData, designInstructions: e.target.value})} className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 resize-none" placeholder="Include text, color preferences, references..." />
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-slate-200 bg-slate-800/50 rounded-lg">Cancel</button>
            <button type="submit" disabled={submitting} className="px-6 py-2 text-sm text-white bg-pink-600 rounded-lg disabled:opacity-50">{submitting ? 'Creating...' : 'Submit Request'}</button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}
