'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { toast } from 'sonner'
import Link from 'next/link'
import { extractArrayData } from '@/server/apiResponse'

interface WebClient {
  id: string
  name: string
  brandName?: string | null
  contactName?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  websiteUrl?: string | null
  webProjectStatus?: string | null
  websiteType?: string | null
  webProjectStartDate?: string | null
  webProjectEndDate?: string | null
  phaseProgress: {
    completed: number
    total: number
    percentage: number
  }
  hasActiveContract: boolean
  createdAt: string
}

// Simple status configuration - clear language everyone understands
const STATUS_CONFIG: Record<string, { label: string; description: string; color: string; bgColor: string }> = {
  PIPELINE: {
    label: 'Upcoming',
    description: 'Project not started yet',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    description: 'Currently working on this',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  COMPLETED: {
    label: 'Completed',
    description: 'Project delivered',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-500/20',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    description: 'Ongoing support contract',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
}

const WEBSITE_TYPES: Record<string, string> = {
  ECOMMERCE: 'Online Store',
  CORPORATE: 'Company Website',
  PORTFOLIO: 'Portfolio',
  LANDING: 'Landing Page',
  BLOG: 'Blog',
  CUSTOM: 'Custom App',
}

type TabType = 'ALL' | 'PIPELINE' | 'IN_PROGRESS' | 'COMPLETED' | 'MAINTENANCE'

export default function WebClientsPage() {
  const [clients, setClients] = useState<WebClient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('ALL')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [activeTab])

  async function fetchClients() {
    try {
      setLoading(true)
      const params = new URLSearchParams({ limit: '100' })
      if (activeTab !== 'ALL') {
        params.set('webProjectStatus', activeTab)
      }
      const res = await fetch(`/api/web-clients?${params}`)
      if (res.ok) {
        const data = await res.json()
        setClients(extractArrayData<WebClient>(data))
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.brandName?.toLowerCase().includes(search.toLowerCase()) ||
    c.contactName?.toLowerCase().includes(search.toLowerCase())
  )

  // Simple stats
  const stats = {
    upcoming: clients.filter((c) => c.webProjectStatus === 'PIPELINE').length,
    inProgress: clients.filter((c) => c.webProjectStatus === 'IN_PROGRESS' || !c.webProjectStatus).length,
    completed: clients.filter((c) => c.webProjectStatus === 'COMPLETED').length,
    maintenance: clients.filter((c) => c.webProjectStatus === 'MAINTENANCE').length,
  }

  if (loading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Website Projects</h1>
          <p className="text-slate-400">All client website projects in one place</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {/* Stats - Simple counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.upcoming}</p>
              <p className="text-sm text-slate-400">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
              <p className="text-sm text-slate-400">In Progress</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
              <p className="text-sm text-slate-400">Completed</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.maintenance}</p>
              <p className="text-sm text-slate-400">Maintenance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Simple Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL' as TabType, label: 'All' },
              { id: 'PIPELINE' as TabType, label: 'Upcoming' },
              { id: 'IN_PROGRESS' as TabType, label: 'In Progress' },
              { id: 'COMPLETED' as TabType, label: 'Completed' },
              { id: 'MAINTENANCE' as TabType, label: 'Maintenance' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-4 py-2 bg-slate-800/50 text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Project List - Clean Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-slate-400 mb-4">No projects found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add First Project
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredClients.map((client) => {
              const statusConfig = STATUS_CONFIG[client.webProjectStatus || 'IN_PROGRESS']
              const progress = client.phaseProgress?.percentage || 0

              return (
                <Link
                  key={client.id}
                  href={`/web/clients/${client.id}`}
                  className="flex items-center gap-4 p-5 hover:bg-slate-900/40 transition-colors"
                >
                  {/* Client Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="font-semibold text-white">{client.name}</h3>
                      {client.brandName && (
                        <span className="text-slate-400">({client.brandName})</span>
                      )}
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      {client.websiteType && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-800/50 text-slate-300">
                          {WEBSITE_TYPES[client.websiteType] || client.websiteType}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      {client.contactName && <span>{client.contactName}</span>}
                      {client.websiteUrl && (
                        <a
                          href={client.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-400 hover:underline"
                        >
                          Visit Site
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Progress - Only for In Progress */}
                  {(client.webProjectStatus === 'IN_PROGRESS' || !client.webProjectStatus) && (
                    <div className="hidden sm:flex items-center gap-3 w-40">
                      <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-300 w-10">{progress}%</span>
                    </div>
                  )}

                  {/* Completion Date - For Completed */}
                  {client.webProjectStatus === 'COMPLETED' && client.webProjectEndDate && (
                    <span className="hidden sm:block text-sm text-slate-400">
                      {formatDateDDMMYYYY(client.webProjectEndDate)}
                    </span>
                  )}

                  {/* Contract Badge - For Maintenance */}
                  {client.hasActiveContract && (
                    <span className="hidden sm:block px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                      Active Contract
                    </span>
                  )}

                  {/* Arrow */}
                  <svg className="w-5 h-5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl border border-blue-500/20 p-6">
        <h3 className="font-bold text-white mb-4">How Projects Work</h3>
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center shrink-0">
              <span className="text-amber-400 font-bold text-sm">1</span>
            </div>
            <div>
              <p className="font-medium text-white">Upcoming</p>
              <p className="text-sm text-slate-400">Project booked but not started</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
              <span className="text-blue-400 font-bold text-sm">2</span>
            </div>
            <div>
              <p className="font-medium text-white">In Progress</p>
              <p className="text-sm text-slate-400">Team is actively working</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
              <span className="text-emerald-700 font-bold text-sm">3</span>
            </div>
            <div>
              <p className="font-medium text-white">Completed</p>
              <p className="text-sm text-slate-400">Website delivered to client</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center shrink-0">
              <span className="text-purple-400 font-bold text-sm">4</span>
            </div>
            <div>
              <p className="font-medium text-white">Maintenance</p>
              <p className="text-sm text-slate-400">Ongoing support & updates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <AddProjectModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            fetchClients()
          }}
        />
      )}
    </div>
  )
}

// Simplified Add Project Modal
function AddProjectModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    websiteUrl: '',
    webProjectStatus: 'IN_PROGRESS',
    websiteType: '',
    notes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/web-clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        onSuccess()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="glass-card rounded-2xl shadow-none w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">New Website Project</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-800/50 rounded-lg">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., ABC Company"
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Status</label>
              <select
                value={formData.webProjectStatus}
                onChange={(e) => setFormData({ ...formData, webProjectStatus: e.target.value })}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PIPELINE">Upcoming</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Website Type</label>
              <select
                value={formData.websiteType}
                onChange={(e) => setFormData({ ...formData, websiteType: e.target.value })}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type</option>
                <option value="ECOMMERCE">Online Store</option>
                <option value="CORPORATE">Company Website</option>
                <option value="PORTFOLIO">Portfolio</option>
                <option value="LANDING">Landing Page</option>
                <option value="BLOG">Blog</option>
                <option value="CUSTOM">Custom App</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Contact Name</label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Email</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Website URL</label>
            <input
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Any additional details..."
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-slate-300 hover:bg-slate-900/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
