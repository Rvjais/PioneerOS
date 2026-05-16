'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/client/components/ui/Modal'
import { toast } from 'sonner'

interface TechnicalDeliverable {
  id: string
  client: string
  issueType: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'IDENTIFIED' | 'IN_PROGRESS' | 'FIXED' | 'VERIFIED'
  assignedTo: string
  identifiedDate: string
  fixedDate?: string
}

export default function SeoTechnicalDeliverablesPage() {
  const [allItems, setAllItems] = useState<TechnicalDeliverable[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<TechnicalDeliverable | null>(null)
  const [issueFormData, setIssueFormData] = useState({ client: '', issueType: 'Core Web Vitals', description: '', priority: 'MEDIUM' })
  const [submitting, setSubmitting] = useState(false)

  const handleStatusUpdate = async (item: TechnicalDeliverable, newStatus: string) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/seo/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          status: newStatus
        })
      })
      if (!res.ok) throw new Error('Failed to update status')
      toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}`)
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message || 'Error updating status')
    } finally {
      setSubmitting(false)
    }
  }

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/seo/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: issueFormData.client,
          taskType: 'TECHNICAL',
          category: issueFormData.issueType,
          description: issueFormData.description || `Technical Issue: ${issueFormData.issueType}`,
          priority: issueFormData.priority
        })
      })

      if (!res.ok) throw new Error('Failed to create issue')

      toast.success('Technical issue tracked successfully')
      setShowIssueModal(false)
      setIssueFormData({ client: '', issueType: 'Core Web Vitals', description: '', priority: 'MEDIUM' })
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message || 'Error saving issue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewDetails = (item: TechnicalDeliverable) => {
    setSelectedIssue(item)
    setShowDetailsModal(true)
  }

  useEffect(() => {
    fetch('/api/seo/tasks')
      .then(res => res.json())
      .then(data => {
        const tasks = (data.tasks || []).filter((t: any) => t.taskType === 'TECHNICAL')
        const mapped: TechnicalDeliverable[] = tasks.map((t: any) => ({
          id: t.id,
          client: t.client?.name || '-',
          issueType: t.category || 'Technical',
          description: t.description || '',
          priority: t.priority || 'MEDIUM',
          status: t.status === 'TODO' ? 'IDENTIFIED' : t.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : t.status === 'REVIEW' ? 'FIXED' : t.status === 'DONE' ? 'VERIFIED' : 'IDENTIFIED',
          assignedTo: t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : '-',
          identifiedDate: t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : '',
          fixedDate: t.completedAt ? new Date(t.completedAt).toISOString().split('T')[0] : undefined,
        }))
        setAllItems(mapped)
      })
      .catch(() => { toast.error('Failed to load technical issues') })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  const filteredItems = filter === 'all' ? allItems : allItems.filter(t => t.status === filter)

  const identifiedCount = allItems.filter(t => t.status === 'IDENTIFIED').length
  const inProgressCount = allItems.filter(t => t.status === 'IN_PROGRESS').length
  const fixedCount = allItems.filter(t => t.status === 'FIXED').length
  const verifiedCount = allItems.filter(t => t.status === 'VERIFIED').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IDENTIFIED': return 'bg-red-500/20 text-red-400'
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400'
      case 'FIXED': return 'bg-amber-500/20 text-amber-400'
      case 'VERIFIED': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500 text-white'
      case 'HIGH': return 'bg-orange-500/20 text-orange-400'
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400'
      case 'LOW': return 'bg-slate-800/50 text-slate-200'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getIssueTypeColor = (type: string) => {
    switch (type) {
      case 'Page Speed': return 'bg-red-500/20 text-red-400'
      case 'Schema Markup': return 'bg-purple-500/20 text-purple-400'
      case 'Broken Links': return 'bg-amber-500/20 text-amber-400'
      case 'Mobile Optimization': return 'bg-blue-500/20 text-blue-400'
      case 'Core Web Vitals': return 'bg-pink-500/20 text-pink-400'
      case 'Indexing Issues': return 'bg-indigo-500/20 text-indigo-400'
      case 'SSL/Security': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Technical SEO Deliverables</h1>
            <p className="text-teal-200">Track technical improvements and fixes</p>
          </div>
          <button 
            onClick={() => setShowIssueModal(true)}
            className="px-4 py-2 bg-white text-teal-600 rounded-lg font-medium hover:bg-teal-50 transition-colors"
          >
            + Add Issue
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <button
          onClick={() => setFilter(filter === 'IDENTIFIED' ? 'all' : 'IDENTIFIED')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'IDENTIFIED' ? 'border-red-500 bg-red-500/10' : 'border-white/10 glass-card hover:border-red-300'
          }`}
        >
          <p className="text-sm text-slate-400">Identified</p>
          <p className="text-3xl font-bold text-red-400">{identifiedCount}</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'IN_PROGRESS' ? 'all' : 'IN_PROGRESS')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'IN_PROGRESS' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 glass-card hover:border-blue-300'
          }`}
        >
          <p className="text-sm text-slate-400">In Progress</p>
          <p className="text-3xl font-bold text-blue-400">{inProgressCount}</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'FIXED' ? 'all' : 'FIXED')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'FIXED' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 glass-card hover:border-amber-300'
          }`}
        >
          <p className="text-sm text-slate-400">Fixed</p>
          <p className="text-3xl font-bold text-amber-400">{fixedCount}</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'VERIFIED' ? 'all' : 'VERIFIED')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'VERIFIED' ? 'border-green-500 bg-green-500/10' : 'border-white/10 glass-card hover:border-green-300'
          }`}
        >
          <p className="text-sm text-slate-400">Verified</p>
          <p className="text-3xl font-bold text-green-400">{verifiedCount}</p>
        </button>
      </div>

      {/* Technical Issues Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">ISSUE TYPE</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">DESCRIPTION</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">PRIORITY</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">ASSIGNED</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id} className={`border-b border-white/5 hover:bg-slate-900/40 ${
                item.priority === 'CRITICAL' ? 'bg-red-500/10' : ''
              }`}>
                <td className="py-3 px-4 text-sm font-medium text-white">{item.client}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getIssueTypeColor(item.issueType)}`}>
                    {item.issueType}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-300">{item.description}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-300">{item.assignedTo}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(item.status)}`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {item.status === 'IDENTIFIED' && (
                      <button
                        onClick={() => handleStatusUpdate(item, 'IN_PROGRESS')}
                        disabled={submitting}
                        className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Start Fix
                      </button>
                    )}
                    {item.status === 'FIXED' && (
                      <button
                        onClick={() => handleStatusUpdate(item, 'VERIFIED')}
                        disabled={submitting}
                        className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showIssueModal} onClose={() => setShowIssueModal(false)} title="Track Technical Issue" size="md">
        <form onSubmit={handleIssueSubmit}>
          <ModalBody>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Client *</label>
              <input required type="text" value={issueFormData.client} onChange={e => setIssueFormData({...issueFormData, client: e.target.value})} className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200" placeholder="Client Name" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">Issue Type</label>
                <select value={issueFormData.issueType} onChange={e => setIssueFormData({...issueFormData, issueType: e.target.value})} className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200">
                  <option value="Core Web Vitals">Core Web Vitals</option>
                  <option value="Site Speed">Site Speed</option>
                  <option value="Indexation">Indexation</option>
                  <option value="Crawl Errors">Crawl Errors</option>
                  <option value="Schema Markup">Schema Markup</option>
                  <option value="Mobile Usability">Mobile Usability</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">Priority</label>
                <select value={issueFormData.priority} onChange={e => setIssueFormData({...issueFormData, priority: e.target.value})} className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Description</label>
              <textarea rows={3} value={issueFormData.description} onChange={e => setIssueFormData({...issueFormData, description: e.target.value})} className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 resize-none" placeholder="Describe the technical issue..." />
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" onClick={() => setShowIssueModal(false)} className="px-4 py-2 text-sm text-slate-200 bg-slate-800/50 rounded-lg">Cancel</button>
            <button type="submit" disabled={submitting} className="px-6 py-2 text-sm text-white bg-teal-600 rounded-lg disabled:opacity-50">{submitting ? 'Adding...' : 'Add Issue'}</button>
          </ModalFooter>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Technical Issue Details" size="lg">
        <ModalBody>
          {selectedIssue && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Client</p>
                  <p className="font-medium text-white">{selectedIssue.client}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Issue Type</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getIssueTypeColor(selectedIssue.issueType)}`}>
                    {selectedIssue.issueType}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Priority</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getPriorityColor(selectedIssue.priority)}`}>
                    {selectedIssue.priority}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(selectedIssue.status)}`}>
                    {selectedIssue.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Assigned To</p>
                  <p className="font-medium text-white">{selectedIssue.assignedTo}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Identified Date</p>
                  <p className="font-medium text-white">{selectedIssue.identifiedDate}</p>
                </div>
                {selectedIssue.fixedDate && (
                  <div>
                    <p className="text-sm text-slate-400">Fixed Date</p>
                    <p className="font-medium text-white">{selectedIssue.fixedDate}</p>
                  </div>
                )}
              </div>
              <div className="border-t border-white/10 pt-4 mt-4">
                <p className="text-sm text-slate-400 mb-1">Description</p>
                <p className="text-white">{selectedIssue.description || 'No description provided.'}</p>
              </div>
              <div className="border-t border-white/10 pt-4 mt-4 flex gap-2">
                {selectedIssue.status === 'IDENTIFIED' && (
                  <button
                    onClick={() => { handleStatusUpdate(selectedIssue, 'IN_PROGRESS'); setShowDetailsModal(false) }}
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Start Fix
                  </button>
                )}
                {selectedIssue.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => { handleStatusUpdate(selectedIssue, 'FIXED'); setShowDetailsModal(false) }}
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50"
                  >
                    Mark as Fixed
                  </button>
                )}
                {selectedIssue.status === 'FIXED' && (
                  <button
                    onClick={() => { handleStatusUpdate(selectedIssue, 'VERIFIED'); setShowDetailsModal(false) }}
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Verify Fix
                  </button>
                )}
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 text-sm text-slate-200 bg-slate-800/50 rounded-lg">Close</button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
