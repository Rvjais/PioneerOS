'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { CredentialCard } from './CredentialCard'
import { CredentialForm } from './CredentialForm'

interface ProviderField {
  key: string
  label: string
  type: 'text' | 'password' | 'url'
  required: boolean
  placeholder?: string
  helpText?: string
}

interface Provider {
  key: string
  name: string
  type: string
  category: string
  description: string
  docsUrl?: string
  fields: ProviderField[]
}

interface Credential {
  id: string
  provider: string
  credentialType: string
  name: string
  status: string
  environment: string
  lastVerifiedAt: string | null
  lastError: string | null
  usageCount: number
  lastUsedAt: string | null
  createdAt: string
  credentials: Record<string, string>
}

const categoryLabels: Record<string, string> = {
  oauth: 'OAuth Providers',
  payment: 'Payment Gateways',
  communication: 'Communication',
  ai: 'AI Services',
}

const categoryColors: Record<string, string> = {
  oauth: 'blue',
  payment: 'green',
  communication: 'purple',
  ai: 'orange',
}

type StatusFilter = 'all' | 'active' | 'invalid' | 'not-configured'
type CategoryFilter = 'all' | 'oauth' | 'payment' | 'communication' | 'ai'

export function ApiCredentialsTab() {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [migrating, setMigrating] = useState(false)

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

  // Bulk operations state
  const [bulkVerifying, setBulkVerifying] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 })

  useEffect(() => {
    fetchCredentials()
  }, [])

  async function fetchCredentials() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/api-credentials')
      if (!response.ok) throw new Error('Failed to fetch credentials')
      const data = await response.json()
      setCredentials(data.credentials)
      setProviders(data.providers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load credentials')
    } finally {
      setLoading(false)
    }
  }

  async function handleMigrateFromEnv() {
    if (!confirm('This will migrate credentials from .env variables to the database. Continue?')) {
      return
    }

    setMigrating(true)
    try {
      const response = await fetch('/api/admin/api-credentials/migrate', {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      toast.success(
        `Migration complete! Migrated: ${data.migrated.join(', ') || 'None'}. Skipped: ${data.skipped.join(', ') || 'None'}. Errors: ${data.errors.length > 0 ? data.errors.map((e: { provider: string }) => e.provider).join(', ') : 'None'}`
      )
      fetchCredentials()
    } catch (err) {
      toast.error('Migration failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setMigrating(false)
    }
  }

  async function handleBulkVerify() {
    const configuredCredentials = credentials.filter((c) => c.status !== 'NOT_CONFIGURED')
    if (configuredCredentials.length === 0) {
      toast.error('No credentials to verify')
      return
    }

    if (!confirm(`This will verify ${configuredCredentials.length} credential(s). Continue?`)) {
      return
    }

    setBulkVerifying(true)
    setBulkProgress({ current: 0, total: configuredCredentials.length })

    const results: Array<{ provider: string; success: boolean; message: string }> = []

    for (let i = 0; i < configuredCredentials.length; i++) {
      const cred = configuredCredentials[i]
      setBulkProgress({ current: i + 1, total: configuredCredentials.length })

      try {
        const response = await fetch(`/api/admin/api-credentials/${cred.id}/verify`, {
          method: 'POST',
        })
        const data = await response.json()
        results.push({
          provider: cred.name,
          success: data.success,
          message: data.message,
        })
      } catch {
        results.push({
          provider: cred.name,
          success: false,
          message: 'Request failed',
        })
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setBulkVerifying(false)
    setBulkProgress({ current: 0, total: 0 })

    const passed = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    if (failed > 0) {
      toast.error(`Verification complete: ${passed} passed, ${failed} failed. Failed: ${results.filter((r) => !r.success).map((r) => `${r.provider}: ${r.message}`).join(', ')}`)
    } else {
      toast.success(`Verification complete! All ${passed} credentials passed.`)
    }

    fetchCredentials()
  }

  function handleAddCredential(provider: Provider) {
    setSelectedProvider(provider)
    setEditingCredential(null)
    setShowForm(true)
  }

  function handleEditCredential(credential: Credential) {
    const provider = providers.find((p) => p.key === credential.provider)
    if (provider) {
      setSelectedProvider(provider)
      setEditingCredential(credential)
      setShowForm(true)
    }
  }

  function handleFormClose() {
    setShowForm(false)
    setSelectedProvider(null)
    setEditingCredential(null)
  }

  function handleFormSuccess() {
    handleFormClose()
    fetchCredentials()
  }

  // Filter and search logic
  const credentialsByProvider = useMemo(
    () => new Map(credentials.map((c) => [c.provider, c])),
    [credentials]
  )

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const credential = credentialsByProvider.get(provider.key)

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = provider.name.toLowerCase().includes(query)
        const matchesDescription = provider.description.toLowerCase().includes(query)
        const matchesKey = provider.key.toLowerCase().includes(query)
        if (!matchesName && !matchesDescription && !matchesKey) return false
      }

      // Category filter
      if (categoryFilter !== 'all' && provider.category !== categoryFilter) {
        return false
      }

      // Status filter
      if (statusFilter !== 'all') {
        const status = credential?.status?.toLowerCase() || 'not-configured'
        if (statusFilter === 'not-configured' && credential) return false
        if (statusFilter === 'active' && status !== 'active') return false
        if (statusFilter === 'invalid' && !['invalid', 'expired'].includes(status)) return false
      }

      return true
    })
  }, [providers, credentialsByProvider, searchQuery, statusFilter, categoryFilter])

  const providersByCategory = useMemo(() => {
    return filteredProviders.reduce(
      (acc, provider) => {
        if (!acc[provider.category]) acc[provider.category] = []
        acc[provider.category].push(provider)
        return acc
      },
      {} as Record<string, Provider[]>
    )
  }, [filteredProviders])

  // Stats
  const stats = useMemo(() => {
    const total = providers.length
    const configured = credentials.length
    const active = credentials.filter((c) => c.status === 'ACTIVE').length
    const failing = credentials.filter((c) => ['INVALID', 'EXPIRED'].includes(c.status)).length
    return { total, configured, active, failing }
  }, [providers, credentials])

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-400">Loading credentials...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={fetchCredentials}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">API Credentials</h2>
          <p className="text-sm text-slate-400">
            {stats.configured}/{stats.total} configured
            {stats.failing > 0 && (
              <span className="text-red-500 ml-2">({stats.failing} failing)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkVerify}
            disabled={bulkVerifying || credentials.length === 0}
            className="px-4 py-2 text-sm text-blue-400 border border-blue-300 rounded-lg hover:bg-blue-500/10 disabled:opacity-50"
          >
            {bulkVerifying
              ? `Verifying (${bulkProgress.current}/${bulkProgress.total})...`
              : 'Verify All'}
          </button>
          <button
            onClick={handleMigrateFromEnv}
            disabled={migrating}
            className="px-4 py-2 text-sm border border-white/20 rounded-lg hover:bg-slate-900/40 disabled:opacity-50"
          >
            {migrating ? 'Migrating...' : 'Migrate from .env'}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="invalid">Failing</option>
          <option value="not-configured">Not Configured</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
          className="px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="oauth">OAuth Providers</option>
          <option value="payment">Payment Gateways</option>
          <option value="communication">Communication</option>
          <option value="ai">AI Services</option>
        </select>
      </div>

      {/* Results count */}
      {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            Showing {filteredProviders.length} of {providers.length} providers
          </span>
          {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setCategoryFilter('all')
              }}
              className="text-blue-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Categories */}
      {filteredProviders.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          No providers match your filters
        </div>
      ) : (
        Object.entries(providersByCategory).map(([category, categoryProviders]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              {categoryLabels[category] || category}
              <span className="ml-2 text-slate-400 font-normal">
                ({categoryProviders.length})
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryProviders.map((provider) => {
                const credential = credentialsByProvider.get(provider.key)
                return (
                  <CredentialCard
                    key={provider.key}
                    provider={provider}
                    credential={credential}
                    onAdd={() => handleAddCredential(provider)}
                    onEdit={() => credential && handleEditCredential(credential)}
                    onRefresh={fetchCredentials}
                    color={categoryColors[category]}
                  />
                )
              })}
            </div>
          </div>
        ))
      )}

      {/* Form Modal */}
      {showForm && selectedProvider && (
        <CredentialForm
          provider={selectedProvider}
          credential={editingCredential}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
