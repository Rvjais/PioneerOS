'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/client/components/ui/Modal'
import { useSession } from 'next-auth/react'

interface CampaignCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  platform?: 'META' | 'GOOGLE' | 'LINKEDIN' | 'YOUTUBE'
  prefillClientId?: string
}

interface Client {
  id: string
  name: string
}

interface CampaignFormData {
  clientId: string
  name: string
  platform: 'META' | 'GOOGLE' | 'LINKEDIN' | 'YOUTUBE'
  campaignType: string
  objective: string
  dailyBudget: string
  startDate: string
  endDate: string
}

export function CampaignCreateModal({
  isOpen,
  onClose,
  onSuccess,
  platform = 'META',
  prefillClientId,
}: CampaignCreateModalProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clients, setClients] = useState<Client[]>([])

  const [formData, setFormData] = useState<CampaignFormData>({
    clientId: prefillClientId || '',
    name: '',
    platform,
    campaignType: '',
    objective: '',
    dailyBudget: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, platform, clientId: prefillClientId || prev.clientId }))
      fetchClients()
    }
  }, [isOpen, platform, prefillClientId])

  async function fetchClients() {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients || [])
      }
    } catch {
      setClients([])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ads/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          name: formData.name,
          platform: formData.platform,
          campaignType: formData.campaignType,
          objective: formData.objective,
          dailyBudget: formData.dailyBudget ? parseFloat(formData.dailyBudget) : undefined,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          status: 'DRAFT',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create campaign')
      }

      onSuccess()
      onClose()
      setFormData({
        clientId: prefillClientId || '',
        name: '',
        platform: 'META',
        campaignType: '',
        objective: '',
        dailyBudget: '',
        startDate: '',
        endDate: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  const platformColors: Record<string, string> = {
    META: 'border-blue-500 bg-blue-500/20 text-blue-400',
    GOOGLE: 'border-red-500 bg-red-500/20 text-red-400',
    LINKEDIN: 'border-sky-500 bg-sky-500/20 text-sky-400',
    YOUTUBE: 'border-red-600 bg-red-600/20 text-red-500',
  }

  const platformBgColors: Record<string, string> = {
    META: 'bg-blue-600 hover:bg-blue-700',
    GOOGLE: 'bg-red-600 hover:bg-red-700',
    LINKEDIN: 'bg-sky-600 hover:bg-sky-700',
    YOUTUBE: 'bg-red-600 hover:bg-red-700',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Campaign" size="lg">
      <form onSubmit={handleSubmit}>
        <ModalBody>
          {/* Client Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-200 mb-1.5">Client *</label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">Select a client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Campaign Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-200 mb-1.5">Campaign Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Summer Sale 2026"
              className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Platform Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-200 mb-2">Platform *</label>
            <div className="grid grid-cols-2 gap-3">
              {(['META', 'GOOGLE', 'LINKEDIN', 'YOUTUBE'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({ ...formData, platform: p })}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    formData.platform === p
                      ? platformColors[p]
                      : 'border-white/10 text-slate-300 hover:border-white/30'
                  }`}
                >
                  {p === 'META' && 'Meta (Facebook/Instagram)'}
                  {p === 'GOOGLE' && 'Google Ads'}
                  {p === 'LINKEDIN' && 'LinkedIn'}
                  {p === 'YOUTUBE' && 'YouTube'}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign Type & Objective Row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Campaign Type</label>
              <select
                value={formData.campaignType}
                onChange={(e) => setFormData({ ...formData, campaignType: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select type...</option>
                {formData.platform === 'GOOGLE' ? (
                  <>
                    <option value="SEARCH">Search</option>
                    <option value="DISPLAY">Display</option>
                    <option value="VIDEO">Video</option>
                    <option value="PERFORMANCE_MAX">Performance Max</option>
                  </>
                ) : (
                  <>
                    <option value="Awareness">Awareness</option>
                    <option value="Traffic">Traffic</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Leads">Lead Generation</option>
                    <option value="Conversions">Conversions</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Objective</label>
              <select
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select objective...</option>
                <option value="LEADS">Lead Generation</option>
                <option value="TRAFFIC">Traffic</option>
                <option value="CONVERSIONS">Conversions</option>
                <option value="BRAND_AWARENESS">Brand Awareness</option>
                <option value="ENGAGEMENT">Engagement</option>
              </select>
            </div>
          </div>

          {/* Budget & Dates Row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Daily Budget (INR)</label>
              <input
                type="number"
                value={formData.dailyBudget}
                onChange={(e) => setFormData({ ...formData, dailyBudget: e.target.value })}
                placeholder="5000"
                min="0"
                step="100"
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-200 mb-1.5">End Date (Optional)</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              min={formData.startDate}
              className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800/50 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.clientId || !formData.name}
            className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${platformBgColors[formData.platform]}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </>
            ) : (
              'Create Campaign'
            )}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}