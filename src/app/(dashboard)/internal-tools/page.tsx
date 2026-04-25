'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { saasToolCategories, type SaasTool } from '@/shared/constants/saasTools'
import { AddToolModal } from '@/client/components/admin/AddToolModal'

export default function InternalToolsPage() {
  const router = useRouter()
  const [tools, setTools] = useState<SaasTool[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [canViewCredentials, setCanViewCredentials] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedTool, setExpandedTool] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTool, setEditingTool] = useState<SaasTool | null>(null)

  async function fetchTools() {
    try {
      setLoading(true)
      const res = await fetch('/api/saas-tools')
      if (!res.ok) throw new Error('Failed to fetch tools')
      const data = await res.json()
      setTools(data.tools || [])
      setCategories(data.categories || saasToolCategories)
      setCanViewCredentials(data.canViewCredentials || false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tools')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTools()
  }, [])

  const filteredTools = tools.filter(tool => {
    const matchesCategory = !selectedCategory || tool.category === selectedCategory
    const matchesSearch = !searchTerm ||
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tool.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const getLoginTypeBadge = (type: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      team: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Team Use' },
      subaccount: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Sub Account' },
      whitelabel: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Whitelabel' },
      free: { bg: 'bg-slate-800/50', text: 'text-slate-300', label: 'Free' },
    }
    const badge = badges[type] || badges.team
    return <span className={`px-2 py-0.5 text-xs rounded ${badge.bg} ${badge.text}`}>{badge.label}</span>
  }

  const categoryCounts = (categories.length > 0 ? categories : saasToolCategories).map(cat => ({
    name: cat,
    count: tools.filter(t => t.category === cat).length
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading tools...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-slate-200 font-medium">{error}</p>
          <button
            onClick={() => router.refresh()}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Company Tools Directory</h1>
            <p className="text-emerald-100">All SaaS tools and credentials in one place</p>
          </div>
          <div className="flex items-center gap-4">
            {canViewCredentials && (
              <button
                onClick={() => {
                  setEditingTool(null)
                  setShowAddModal(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Tool
              </button>
            )}
            <div className="text-right">
              <p className="text-4xl font-bold">{tools.length}</p>
              <p className="text-emerald-100 text-sm">Tools Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Guide */}
      <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-4">
        <h3 className="font-semibold text-amber-800 mb-2">How to Use This Directory</h3>
        <ul className="text-sm text-amber-400 space-y-1">
          <li>Click on any tool card to reveal login credentials</li>
          <li><span className="px-1 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">Team Use</span> - Shared account for the whole team</li>
          <li><span className="px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">Sub Account</span> - Create sub-accounts for clients</li>
          <li><span className="px-1 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">Whitelabel</span> - Can be branded for clients</li>
          {!canViewCredentials && (
            <li className="text-red-400 font-medium">Note: Credentials are only visible to managers and admins</li>
          )}
        </ul>
      </div>

      {/* Search and Filters */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search tools by name, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                !selectedCategory
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
              }`}
            >
              All ({tools.length})
            </button>
            {categoryCounts.filter(c => c.count > 0).map(({ name, count }) => (
              <button
                key={name}
                onClick={() => setSelectedCategory(name)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  selectedCategory === name
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
                }`}
              >
                {name} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      {tools.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-xl border border-white/10">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-slate-400 mb-2">No tools have been added yet</p>
          <p className="text-sm text-slate-400">Contact admin to add company tools</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map(tool => (
            <div
              key={tool.id}
              className={`glass-card rounded-xl border transition-all cursor-pointer ${
                expandedTool === tool.id
                  ? 'border-emerald-400 shadow-none'
                  : 'border-white/10 hover:border-emerald-300 hover:shadow-none'
              }`}
              onClick={() => setExpandedTool(expandedTool === tool.id ? null : tool.id)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-emerald-600">{tool.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{tool.name}</h3>
                      <p className="text-xs text-slate-400">{tool.category}</p>
                    </div>
                  </div>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                <p className="text-sm text-slate-300 mb-3">{tool.description}</p>

                <div className="flex items-center gap-2">
                  {getLoginTypeBadge(tool.loginType)}
                  {canViewCredentials && (tool.email || tool.password) && (
                    <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">Has Credentials</span>
                  )}
                </div>

                {/* Expanded Content */}
                {expandedTool === tool.id && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-3" onClick={(e) => e.stopPropagation()}>
                    {canViewCredentials ? (
                      <>
                        {tool.email && (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-slate-400">Email</p>
                              <p className="text-sm font-mono text-white">{tool.email}</p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(tool.email!, `${tool.id}-email`)}
                              className="px-2 py-1 text-xs bg-slate-800/50 hover:bg-white/10 text-slate-300 rounded transition-colors"
                            >
                              {copiedField === `${tool.id}-email` ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        )}
                        {tool.password && (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-slate-400">Password</p>
                              <p className="text-sm font-mono text-white">{tool.password}</p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(tool.password!, `${tool.id}-password`)}
                              className="px-2 py-1 text-xs bg-slate-800/50 hover:bg-white/10 text-slate-300 rounded transition-colors"
                            >
                              {copiedField === `${tool.id}-password` ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-3 bg-slate-900/40 rounded-lg text-center">
                        <p className="text-sm text-slate-400">Credentials hidden</p>
                        <p className="text-xs text-slate-400">Only managers can view</p>
                      </div>
                    )}
                    {tool.notes && (
                      <div className="p-2 bg-slate-900/40 rounded-lg">
                        <p className="text-xs text-slate-400">Notes</p>
                        <p className="text-sm text-slate-200">{tool.notes}</p>
                      </div>
                    )}
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Open Tool
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredTools.length === 0 && tools.length > 0 && (
        <div className="text-center py-12 glass-card rounded-xl border border-white/10">
          <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-slate-400">No tools found matching your search</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory(null); }}
            className="mt-2 text-emerald-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Add/Edit Tool Modal */}
      <AddToolModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setEditingTool(null)
        }}
        onSuccess={() => {
          setShowAddModal(false)
          setEditingTool(null)
          fetchTools()
        }}
        editTool={editingTool}
        categories={categories.length > 0 ? categories : saasToolCategories}
      />
    </div>
  )
}
