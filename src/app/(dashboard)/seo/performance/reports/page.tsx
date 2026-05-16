'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/client/components/ui/Modal'
import { toast } from 'sonner'

interface SeoReport {
  id: string
  title: string
  client: string
  clientId?: string
  reportType: string
  period?: string | null
  status: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED'
  metrics?: {
    organicTraffic?: number
    keywordRankings?: number
    backlinksBuilt?: number
    contentPublished?: number
    technicalFixes?: number
  } | null
  createdAt: string
  updatedAt: string
  publishedAt?: string | null
}

interface Client {
  id: string
  name: string
}

export default function SeoReportsPage() {
  const [reports, setReports] = useState<SeoReport[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<SeoReport | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    reportType: 'Monthly SEO Report',
    period: ''
  })

  useEffect(() => {
    fetchReports()
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

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/seo/reports')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setReports(data.reports || [])
    } catch (err) {
      console.error('Failed to fetch SEO reports:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/seo/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Failed to create report')
      toast.success('SEO Report created successfully')
      setShowAddModal(false)
      setFormData({ clientId: '', title: '', reportType: 'Monthly SEO Report', period: '' })
      fetchReports()
    } catch (err: any) {
      toast.error(err.message || 'Error creating report')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (report: SeoReport, newStatus: string) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/seo/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: report.id, status: newStatus })
      })
      if (!res.ok) throw new Error('Failed to update')
      toast.success('Report status updated')
      fetchReports()
    } catch (err: any) {
      toast.error(err.message || 'Error updating report')
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewDetails = (report: SeoReport) => {
    setSelectedReport(report)
    setShowDetailsModal(true)
  }

  const filteredReports = filter === 'all' ? reports : reports.filter(r => r.status === filter)

  const draftCount = reports.filter(r => r.status === 'DRAFT').length
  const reviewCount = reports.filter(r => r.status === 'IN_REVIEW').length
  const publishedCount = reports.filter(r => r.status === 'PUBLISHED').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-800/50 text-slate-200'
      case 'IN_REVIEW': return 'bg-amber-500/20 text-amber-400'
      case 'PUBLISHED': return 'bg-green-500/20 text-green-400'
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
            <h1 className="text-2xl font-bold">SEO Reports</h1>
            <p className="text-teal-200">Monthly reports shared with clients</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-white text-teal-600 rounded-lg font-medium hover:bg-teal-50 transition-colors"
          >
            + Create Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setFilter(filter === 'DRAFT' ? 'all' : 'DRAFT')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'DRAFT' ? 'border-slate-500 bg-slate-500/10' : 'border-white/10 glass-card hover:border-slate-300'
          }`}
        >
          <p className="text-sm text-slate-400">In Draft</p>
          <p className="text-3xl font-bold text-slate-200">{draftCount}</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'IN_REVIEW' ? 'all' : 'IN_REVIEW')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'IN_REVIEW' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 glass-card hover:border-amber-300'
          }`}
        >
          <p className="text-sm text-slate-400">In Review</p>
          <p className="text-3xl font-bold text-amber-400">{reviewCount}</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'PUBLISHED' ? 'all' : 'PUBLISHED')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'PUBLISHED' ? 'border-green-500 bg-green-500/10' : 'border-white/10 glass-card hover:border-green-300'
          }`}
        >
          <p className="text-sm text-slate-400">Published</p>
          <p className="text-3xl font-bold text-green-400">{publishedCount}</p>
        </button>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map(report => (
          <div key={report.id} className="glass-card rounded-xl border border-white/10 p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">{report.title}</h3>
                <p className="text-sm text-slate-400">
                  {report.client} {report.reportType ? `• ${report.reportType}` : ''}
                  {report.period ? ` • ${report.period}` : ''}
                </p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(report.status)}`}>
                {report.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-900/40 rounded-lg">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-200">Created</p>
                <p className="text-xs text-slate-400">
                  {new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-200">
                  {report.publishedAt ? 'Published' : 'Last Updated'}
                </p>
                <p className="text-xs text-slate-400">
                  {report.publishedAt
                    ? new Date(report.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : new Date(report.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {report.metrics && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {report.metrics.organicTraffic && (
                  <div className="bg-blue-500/10 rounded-lg p-2 text-center">
                    <p className="text-xs text-blue-400">Traffic</p>
                    <p className="text-sm font-bold text-white">{report.metrics.organicTraffic}</p>
                  </div>
                )}
                {report.metrics.keywordRankings && (
                  <div className="bg-green-500/10 rounded-lg p-2 text-center">
                    <p className="text-xs text-green-400">Rankings</p>
                    <p className="text-sm font-bold text-white">{report.metrics.keywordRankings}</p>
                  </div>
                )}
                {report.metrics.backlinksBuilt && (
                  <div className="bg-purple-500/10 rounded-lg p-2 text-center">
                    <p className="text-xs text-purple-400">Backlinks</p>
                    <p className="text-sm font-bold text-white">{report.metrics.backlinksBuilt}</p>
                  </div>
                )}
                {report.metrics.contentPublished && (
                  <div className="bg-amber-500/10 rounded-lg p-2 text-center">
                    <p className="text-xs text-amber-400">Content</p>
                    <p className="text-sm font-bold text-white">{report.metrics.contentPublished}</p>
                  </div>
                )}
                {report.metrics.technicalFixes && (
                  <div className="bg-red-500/10 rounded-lg p-2 text-center">
                    <p className="text-xs text-red-400">Tech Fixes</p>
                    <p className="text-sm font-bold text-white">{report.metrics.technicalFixes}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleViewDetails(report)}
                className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-900/40 rounded-lg hover:bg-slate-800 transition-colors"
              >
                View Details
              </button>
              {report.status === 'DRAFT' && (
                <button
                  onClick={() => handleStatusUpdate(report, 'IN_REVIEW')}
                  disabled={submitting}
                  className="px-3 py-1.5 text-sm font-medium text-amber-400 bg-amber-500/10 rounded-lg hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                >
                  Submit for Review
                </button>
              )}
              {report.status === 'IN_REVIEW' && (
                <button
                  onClick={() => handleStatusUpdate(report, 'PUBLISHED')}
                  disabled={submitting}
                  className="px-3 py-1.5 text-sm font-medium text-green-400 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
                >
                  Publish Report
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredReports.length === 0 && (
          <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
            <p className="text-slate-400">No SEO reports found</p>
          </div>
        )}
      </div>

      {/* Report Contents */}
      <div className="bg-teal-500/10 rounded-xl border border-teal-500/30 p-4">
        <h3 className="font-semibold text-teal-800 mb-3">Report Includes</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-teal-700">
          <div>
            <p className="font-medium mb-1">Traffic Analysis</p>
            <ul className="space-y-1">
              <li>- Organic traffic trends</li>
              <li>- Top landing pages</li>
              <li>- User behavior metrics</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Keyword Rankings</p>
            <ul className="space-y-1">
              <li>- Ranking improvements</li>
              <li>- New keywords added</li>
              <li>- Competitor comparison</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Backlinks</p>
            <ul className="space-y-1">
              <li>- New backlinks built</li>
              <li>- Domain authority</li>
              <li>- Link sources</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Work Completed</p>
            <ul className="space-y-1">
              <li>- Blogs published</li>
              <li>- Technical fixes</li>
              <li>- On-page optimizations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Report Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create SEO Report" size="md">
        <form onSubmit={handleCreateReport}>
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
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Report Title *</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200"
                placeholder="e.g. March 2024 Performance"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">Report Type</label>
                <select
                  value={formData.reportType}
                  onChange={e => setFormData({...formData, reportType: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200"
                >
                  <option value="Monthly SEO Report">Monthly SEO Report</option>
                  <option value="Technical Audit">Technical Audit</option>
                  <option value="Content Strategy">Content Strategy</option>
                  <option value="Quarterly Review">Quarterly Review</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">Period (optional)</label>
                <input
                  type="text"
                  value={formData.period}
                  onChange={e => setFormData({...formData, period: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200"
                  placeholder="e.g. March 2024"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-slate-200 bg-slate-800/50 rounded-lg">Cancel</button>
            <button type="submit" disabled={submitting} className="px-6 py-2 text-sm text-white bg-teal-600 rounded-lg disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </ModalFooter>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Report Details" size="lg">
        <ModalBody>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-sm text-slate-400">Title</p>
                  <p className="font-medium text-white">{selectedReport.title}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Client</p>
                  <p className="font-medium text-white">{selectedReport.client}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Report Type</p>
                  <p className="font-medium text-white">{selectedReport.reportType}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Period</p>
                  <p className="font-medium text-white">{selectedReport.period || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Created</p>
                  <p className="font-medium text-white">
                    {new Date(selectedReport.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Last Updated</p>
                  <p className="font-medium text-white">
                    {new Date(selectedReport.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {selectedReport.metrics && (
                <div className="border-t border-white/10 pt-4 mt-4">
                  <h4 className="font-medium text-white mb-3">Report Metrics</h4>
                  <div className="grid grid-cols-5 gap-3">
                    {selectedReport.metrics.organicTraffic && (
                      <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-400">{selectedReport.metrics.organicTraffic}</p>
                        <p className="text-xs text-blue-300">Organic Traffic</p>
                      </div>
                    )}
                    {selectedReport.metrics.keywordRankings && (
                      <div className="bg-green-500/10 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-400">{selectedReport.metrics.keywordRankings}</p>
                        <p className="text-xs text-green-300">Keywords Ranked</p>
                      </div>
                    )}
                    {selectedReport.metrics.backlinksBuilt && (
                      <div className="bg-purple-500/10 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-purple-400">{selectedReport.metrics.backlinksBuilt}</p>
                        <p className="text-xs text-purple-300">Backlinks</p>
                      </div>
                    )}
                    {selectedReport.metrics.contentPublished && (
                      <div className="bg-amber-500/10 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-amber-400">{selectedReport.metrics.contentPublished}</p>
                        <p className="text-xs text-amber-300">Content</p>
                      </div>
                    )}
                    {selectedReport.metrics.technicalFixes && (
                      <div className="bg-red-500/10 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-red-400">{selectedReport.metrics.technicalFixes}</p>
                        <p className="text-xs text-red-300">Tech Fixes</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t border-white/10 pt-4 mt-4 flex gap-2">
                {selectedReport.status === 'DRAFT' && (
                  <button
                    onClick={() => { handleStatusUpdate(selectedReport, 'IN_REVIEW'); setShowDetailsModal(false) }}
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50"
                  >
                    Submit for Review
                  </button>
                )}
                {selectedReport.status === 'IN_REVIEW' && (
                  <button
                    onClick={() => { handleStatusUpdate(selectedReport, 'PUBLISHED'); setShowDetailsModal(false) }}
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Publish Report
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