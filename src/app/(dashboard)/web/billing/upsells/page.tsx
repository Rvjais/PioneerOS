'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Link from 'next/link'

interface Client {
  id: string
  name: string
}

interface UpsellOpportunity {
  id: string
  clientId: string
  client: Client
  type: string
  title: string
  description: string | null
  estimatedValue: number
  probability: number
  status: string
  assignedTo: string | null
  pitchedDate: Date | null
  followUpDate: Date | null
  notes: string | null
  createdAt: Date
}

const statusColumns = [
  { id: 'IDENTIFIED', label: 'Identified', color: 'bg-slate-500' },
  { id: 'PITCHED', label: 'Pitched', color: 'bg-blue-500' },
  { id: 'NEGOTIATING', label: 'Negotiating', color: 'bg-amber-500' },
  { id: 'WON', label: 'Won', color: 'bg-green-500' },
  { id: 'LOST', label: 'Lost', color: 'bg-red-500' },
]

const upsellTypes = [
  { value: 'AMC', label: 'AMC Contract', icon: '🔧' },
  { value: 'SEO', label: 'SEO Services', icon: '📈' },
  { value: 'MARKETING', label: 'Marketing Package', icon: '📣' },
  { value: 'REDESIGN', label: 'Website Redesign', icon: '🎨' },
  { value: 'ECOMMERCE', label: 'E-commerce Features', icon: '🛒' },
  { value: 'APP', label: 'Mobile App', icon: '📱' },
  { value: 'HOSTING_UPGRADE', label: 'Hosting Upgrade', icon: '☁️' },
  { value: 'SECURITY', label: 'Security Package', icon: '🔒' },
]

const pitchTemplates = [
  {
    type: 'AMC',
    title: 'Annual Maintenance Contract',
    pitch: 'Your website needs regular updates, security patches, and performance optimization. Our AMC ensures your site stays secure, fast, and up-to-date year-round.',
    benefits: ['Priority support', 'Monthly backups', 'Security updates', 'Performance monitoring'],
  },
  {
    type: 'SEO',
    title: 'SEO & Digital Marketing',
    pitch: 'Your beautiful website deserves to be found. Let us optimize it for search engines and drive organic traffic to grow your business.',
    benefits: ['Keyword optimization', 'Content strategy', 'Link building', 'Monthly reports'],
  },
  {
    type: 'REDESIGN',
    title: 'Website Redesign',
    pitch: 'Web design trends evolve quickly. A fresh, modern design can increase engagement and conversions significantly.',
    benefits: ['Modern UI/UX', 'Mobile-first design', 'Faster load times', 'Better conversions'],
  },
]

export default function UpsellsPage() {
  const [opportunities, setOpportunities] = useState<UpsellOpportunity[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<typeof pitchTemplates[0] | null>(null)
  const [formData, setFormData] = useState({
    clientId: '',
    type: 'AMC',
    title: '',
    description: '',
    estimatedValue: '',
    probability: '50',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [oppsRes, clientsRes] = await Promise.all([
        fetch('/api/web/upsells'),
        fetch('/api/web/clients'),
      ])

      if (oppsRes.ok) {
        const oppsData = await oppsRes.json()
        setOpportunities(oppsData.opportunities || oppsData)
      }

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json()
        setClients(clientsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/web/upsells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedValue: parseFloat(formData.estimatedValue),
          probability: parseInt(formData.probability),
        }),
      })

      if (!response.ok) throw new Error('Failed to create opportunity')

      setShowForm(false)
      setFormData({
        clientId: '',
        type: 'AMC',
        title: '',
        description: '',
        estimatedValue: '',
        probability: '50',
      })
      fetchData()
    } catch (error) {
      console.error('Error creating opportunity:', error)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/web/upsells/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update status')
      fetchData()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  // Calculate stats
  const activeOpportunities = opportunities.filter(o => !['WON', 'LOST'].includes(o.status))
  const wonOpportunities = opportunities.filter(o => o.status === 'WON')
  const lostOpportunities = opportunities.filter(o => o.status === 'LOST')

  const pipelineValue = activeOpportunities.reduce((sum, o) => sum + o.estimatedValue, 0)
  const weightedPipeline = activeOpportunities.reduce(
    (sum, o) => sum + (o.estimatedValue * o.probability) / 100,
    0
  )
  const wonValue = wonOpportunities.reduce((sum, o) => sum + o.estimatedValue, 0)
  const winRate = opportunities.length > 0
    ? (wonOpportunities.length / (wonOpportunities.length + lostOpportunities.length)) * 100 || 0
    : 0

  const getOpportunitiesByStatus = (status: string) =>
    opportunities.filter((o) => o.status === status)

  const getTypeIcon = (type: string) =>
    upsellTypes.find((t) => t.value === type)?.icon || '💼'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Upsell Opportunities</h1>
          <p className="text-slate-400 mt-1">Track and manage sales opportunities with existing clients</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          + New Opportunity
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-white">{activeOpportunities.length}</p>
          <p className="text-sm text-slate-400">Active Opportunities</p>
        </div>
        <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-4">
          <p className="text-3xl font-bold text-indigo-400">
            ₹{pipelineValue.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-slate-400">Pipeline Value</p>
        </div>
        <div className="bg-slate-800/50 border border-amber-500/30 rounded-xl p-4">
          <p className="text-3xl font-bold text-amber-400">
            ₹{weightedPipeline.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-slate-400">Weighted Forecast</p>
        </div>
        <div className="bg-slate-800/50 border border-green-500/30 rounded-xl p-4">
          <p className="text-3xl font-bold text-green-400">
            ₹{wonValue.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-slate-400">Won This Year</p>
        </div>
        <div className="bg-slate-800/50 border border-blue-500/30 rounded-xl p-4">
          <p className="text-3xl font-bold text-blue-400">{winRate.toFixed(0)}%</p>
          <p className="text-sm text-slate-400">Win Rate</p>
        </div>
      </div>

      {/* Kanban Pipeline */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-4">
        <h2 className="text-lg font-semibold text-white mb-4">Pipeline</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusColumns.map((column) => {
            const columnOpps = getOpportunitiesByStatus(column.id)
            const columnValue = columnOpps.reduce((sum, o) => sum + o.estimatedValue, 0)

            return (
              <div key={column.id} className="flex-1 min-w-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.color}`} />
                    <span className="font-medium text-white">{column.label}</span>
                    <span className="text-xs text-slate-400">({columnOpps.length})</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    ₹{columnValue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {columnOpps.length === 0 ? (
                    <div className="p-4 bg-slate-700/30 border border-dashed border-white/10 rounded-lg text-center">
                      <p className="text-sm text-slate-500">No opportunities</p>
                    </div>
                  ) : (
                    columnOpps.map((opp) => (
                      <div
                        key={opp.id}
                        className="p-4 bg-slate-700/50 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-2xl">{getTypeIcon(opp.type)}</span>
                          <span className="text-xs px-2 py-1 bg-slate-600 text-slate-300 rounded">
                            {opp.probability}%
                          </span>
                        </div>
                        <h3 className="font-medium text-white mb-1">{opp.title}</h3>
                        <Link
                          href={`/web/clients/${opp.clientId}`}
                          className="text-sm text-indigo-400 hover:text-indigo-300"
                        >
                          {opp.client.name}
                        </Link>
                        <p className="text-lg font-semibold text-green-400 mt-2">
                          ₹{opp.estimatedValue.toLocaleString('en-IN')}
                        </p>
                        {opp.followUpDate && (
                          <p className="text-xs text-slate-400 mt-2">
                            Follow-up: {formatDateDDMMYYYY(opp.followUpDate)}
                          </p>
                        )}
                        {/* Status actions */}
                        <div className="flex gap-1 mt-3">
                          {column.id !== 'WON' && column.id !== 'LOST' && (
                            <>
                              {column.id === 'IDENTIFIED' && (
                                <button
                                  onClick={() => updateStatus(opp.id, 'PITCHED')}
                                  className="flex-1 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                                >
                                  Mark Pitched
                                </button>
                              )}
                              {column.id === 'PITCHED' && (
                                <button
                                  onClick={() => updateStatus(opp.id, 'NEGOTIATING')}
                                  className="flex-1 py-1 text-xs bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/30"
                                >
                                  Negotiating
                                </button>
                              )}
                              {column.id === 'NEGOTIATING' && (
                                <>
                                  <button
                                    onClick={() => updateStatus(opp.id, 'WON')}
                                    className="flex-1 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                                  >
                                    Won
                                  </button>
                                  <button
                                    onClick={() => updateStatus(opp.id, 'LOST')}
                                    className="flex-1 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                                  >
                                    Lost
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pitch Templates */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Pitch Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pitchTemplates.map((template) => (
            <div
              key={template.type}
              className="p-4 bg-slate-700/30 border border-white/10 rounded-xl hover:border-indigo-500/50 cursor-pointer transition-colors"
              onClick={() => setSelectedTemplate(template)}
            >
              <h3 className="font-medium text-white mb-2">{template.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-2 mb-3">{template.pitch}</p>
              <div className="flex flex-wrap gap-1">
                {template.benefits.slice(0, 2).map((benefit) => (
                  <span
                    key={benefit}
                    className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded"
                  >
                    {benefit}
                  </span>
                ))}
                {template.benefits.length > 2 && (
                  <span className="text-xs px-2 py-1 text-slate-400">
                    +{template.benefits.length - 2} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automatic Triggers Section */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Upsell Triggers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔧</span>
              <h3 className="font-medium text-amber-400">No AMC After Launch</h3>
            </div>
            <p className="text-sm text-slate-400 mb-3">
              Clients who launched websites without maintenance contracts
            </p>
            <button className="text-sm text-amber-400 hover:text-amber-300">
              View 0 clients →
            </button>
          </div>
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📈</span>
              <h3 className="font-medium text-blue-400">High Traffic Sites</h3>
            </div>
            <p className="text-sm text-slate-400 mb-3">
              Sites with growing traffic that could benefit from optimization
            </p>
            <button className="text-sm text-blue-400 hover:text-blue-300">
              View 0 clients →
            </button>
          </div>
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔒</span>
              <h3 className="font-medium text-red-400">No SSL Certificate</h3>
            </div>
            <p className="text-sm text-slate-400 mb-3">
              Websites running without SSL encryption
            </p>
            <button className="text-sm text-red-400 hover:text-red-300">
              View 0 clients →
            </button>
          </div>
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🎨</span>
              <h3 className="font-medium text-purple-400">Outdated Design</h3>
            </div>
            <p className="text-sm text-slate-400 mb-3">
              Websites older than 3 years that may need a refresh
            </p>
            <button className="text-sm text-purple-400 hover:text-purple-300">
              View 0 clients →
            </button>
          </div>
        </div>
      </div>

      {/* New Opportunity Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">New Upsell Opportunity</h2>
                <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Client <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Opportunity Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  {upsellTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., AMC for Example Corp website"
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Notes about this opportunity..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Estimated Value */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Estimated Value (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                    placeholder="50000"
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Probability */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Probability (%) <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="10">10% - Very Low</option>
                    <option value="25">25% - Low</option>
                    <option value="50">50% - Medium</option>
                    <option value="75">75% - High</option>
                    <option value="90">90% - Very High</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pitch Template Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">{selectedTemplate.title}</h2>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="p-2 text-slate-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Pitch</h3>
                <p className="text-white">{selectedTemplate.pitch}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Key Benefits</h3>
                <ul className="space-y-2">
                  {selectedTemplate.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-white">
                      <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${selectedTemplate.pitch}\n\nKey Benefits:\n${selectedTemplate.benefits.map(b => `• ${b}`).join('\n')}`
                    )
                  }}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      type: selectedTemplate.type,
                      title: selectedTemplate.title,
                      description: selectedTemplate.pitch,
                    })
                    setSelectedTemplate(null)
                    setShowForm(true)
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Opportunity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
