'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
}

// Provider data with logos and colors
const providers = [
  { value: 'AWS', label: 'AWS', logo: '🟠', color: 'amber' },
  { value: 'DigitalOcean', label: 'DigitalOcean', logo: '🔵', color: 'blue' },
  { value: 'Hostinger', label: 'Hostinger', logo: '🟣', color: 'purple' },
  { value: 'Vercel', label: 'Vercel', logo: '⚫', color: 'slate' },
  { value: 'Netlify', label: 'Netlify', logo: '🟢', color: 'emerald' },
  { value: 'GoDaddy', label: 'GoDaddy', logo: '🟡', color: 'yellow' },
  { value: 'Cloudflare', label: 'Cloudflare', logo: '🟠', color: 'orange' },
  { value: 'Bluehost', label: 'Bluehost', logo: '🔷', color: 'blue' },
  { value: 'SiteGround', label: 'SiteGround', logo: '🔴', color: 'red' },
  { value: 'Other', label: 'Other', logo: '⚪', color: 'slate' },
]

const planTypes = [
  { value: 'Shared', label: 'Shared', description: 'Budget-friendly', icon: '👥' },
  { value: 'VPS', label: 'VPS', description: 'Virtual private', icon: '📦' },
  { value: 'Dedicated', label: 'Dedicated', description: 'Full server', icon: '🖥️' },
  { value: 'Cloud', label: 'Cloud', description: 'Scalable', icon: '☁️' },
  { value: 'Serverless', label: 'Serverless', description: 'Pay per use', icon: '⚡' },
  { value: 'Managed WordPress', label: 'Managed WP', description: 'WordPress optimized', icon: '📝' },
]

const serverLocations = [
  { value: 'US-East', label: 'US East', flag: '🇺🇸' },
  { value: 'US-West', label: 'US West', flag: '🇺🇸' },
  { value: 'EU-West', label: 'EU West', flag: '🇪🇺' },
  { value: 'EU-Central', label: 'EU Central', flag: '🇪🇺' },
  { value: 'AP-South (Mumbai)', label: 'Mumbai', flag: '🇮🇳' },
  { value: 'AP-Southeast (Singapore)', label: 'Singapore', flag: '🇸🇬' },
  { value: 'Other', label: 'Other', flag: '🌍' },
]

const statusOptions = [
  { value: 'ACTIVE', label: 'Active', color: 'emerald', icon: '✓' },
  { value: 'SUSPENDED', label: 'Suspended', color: 'amber', icon: '⏸' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red', icon: '✗' },
  { value: 'PENDING', label: 'Pending', color: 'blue', icon: '⏳' },
]

// Collapsible section component
function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
  badge
}: {
  title: string
  icon: string
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <span className="font-medium text-white">{title}</span>
          {badge}
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-4 bg-slate-900/50 space-y-4">
          {children}
        </div>
      </div>
    </div>
  )
}

// Days calculator
function calculateDaysUntil(dateString: string): { days: number; label: string; color: string } {
  if (!dateString) return { days: 0, label: '', color: 'slate' }

  const now = new Date()
  const target = new Date(dateString)
  const diffTime = target.getTime() - now.getTime()
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (days < 0) return { days: Math.abs(days), label: `Expired ${Math.abs(days)} days ago`, color: 'red' }
  if (days <= 30) return { days, label: `Renews in ${days} days`, color: 'red' }
  if (days <= 60) return { days, label: `Renews in ${days} days`, color: 'amber' }
  if (days <= 90) return { days, label: `Renews in ${days} days`, color: 'yellow' }
  return { days, label: `Renews in ${days} days`, color: 'emerald' }
}

export function AddHostingModal() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [costMode, setCostMode] = useState<'monthly' | 'annual'>('monthly')
  const [formData, setFormData] = useState({
    clientId: '',
    provider: '',
    planType: '',
    planName: '',
    serverLocation: '',
    monthlyCost: '',
    renewalDate: '',
    storageGB: '',
    bandwidthGB: '',
    ipAddress: '',
    cpanelUrl: '',
    sshAccess: false,
    sshHost: '',
    sshPort: '22',
    purchasedBy: 'AGENCY',
    status: 'ACTIVE',
    loginUrl: '',
    notes: '',
  })

  useEffect(() => {
    if (isOpen) {
      fetchClients()
    }
  }, [isOpen])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients?isWebTeamClient=true')
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  // Renewal date calculation
  const renewalInfo = useMemo(() => calculateDaysUntil(formData.renewalDate), [formData.renewalDate])

  // Cost calculations
  const monthlyCost = parseFloat(formData.monthlyCost) || 0
  const annualCost = monthlyCost * 12
  const displayCost = costMode === 'monthly' ? monthlyCost : annualCost

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/web/hosting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          monthlyCost: parseFloat(formData.monthlyCost),
          storageGB: formData.storageGB ? parseFloat(formData.storageGB) : null,
          bandwidthGB: formData.bandwidthGB ? parseFloat(formData.bandwidthGB) : null,
          sshPort: formData.sshPort ? parseInt(formData.sshPort) : null,
        }),
      })

      if (!response.ok) throw new Error('Failed to create hosting account')

      setIsOpen(false)
      setFormData({
        clientId: '',
        provider: '',
        planType: '',
        planName: '',
        serverLocation: '',
        monthlyCost: '',
        renewalDate: '',
        storageGB: '',
        bandwidthGB: '',
        ipAddress: '',
        cpanelUrl: '',
        sshAccess: false,
        sshHost: '',
        sshPort: '22',
        purchasedBy: 'AGENCY',
        status: 'ACTIVE',
        loginUrl: '',
        notes: '',
      })
      router.refresh()
    } catch (error) {
      console.error('Error creating hosting account:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedProvider = providers.find(p => p.value === formData.provider)
  const selectedStatus = statusOptions.find(s => s.value === formData.status)
  const selectedPlanType = planTypes.find(p => p.value === formData.planType)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium transition-all shadow-lg shadow-indigo-500/25"
      >
        + Add Hosting
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-white/10 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🖥️</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Add Hosting Account</h2>
                    <p className="text-sm text-slate-400">Configure server and hosting details</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Client Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Client <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" className="bg-slate-800 text-white">Select Client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id} className="bg-slate-800 text-white">
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Provider Section */}
              <CollapsibleSection title="Provider & Plan" icon="☁️" defaultOpen={true}>
                {/* Provider Grid with Logos */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Hosting Provider <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {providers.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, provider: p.value })}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          formData.provider === p.value
                            ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20'
                            : 'border-white/10 bg-slate-800/50 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xl block mb-1">{p.logo}</span>
                        <span className="text-xs text-slate-300 line-clamp-1">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plan Type Cards */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Plan Type <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {planTypes.map((plan) => (
                      <button
                        key={plan.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, planType: plan.value })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          formData.planType === plan.value
                            ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20'
                            : 'border-white/10 bg-slate-800/50 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{plan.icon}</span>
                          <span className="text-sm font-medium text-white">{plan.label}</span>
                        </div>
                        <span className="text-xs text-slate-400">{plan.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plan Name & Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Plan Name</label>
                    <input
                      type="text"
                      value={formData.planName}
                      onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                      placeholder="e.g., Basic, Pro, Enterprise"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Server Location</label>
                    <select
                      value={formData.serverLocation}
                      onChange={(e) => setFormData({ ...formData, serverLocation: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="" className="bg-slate-800 text-white">Select Location</option>
                      {serverLocations.map((l) => (
                        <option key={l.value} value={l.value} className="bg-slate-800 text-white">
                          {l.flag} {l.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Server Specs Section */}
              <CollapsibleSection
                title="Server Specifications"
                icon="📊"
                badge={
                  (formData.storageGB || formData.bandwidthGB) && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-slate-500/20 text-slate-400">
                      {formData.storageGB && `${formData.storageGB}GB`}
                      {formData.storageGB && formData.bandwidthGB && ' / '}
                      {formData.bandwidthGB && `${formData.bandwidthGB}GB BW`}
                    </span>
                  )
                }
              >
                {/* Storage & Bandwidth Visual */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Storage (GB)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.storageGB}
                        onChange={(e) => setFormData({ ...formData, storageGB: e.target.value })}
                        placeholder="10"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all pr-12"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">GB</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Bandwidth (GB)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.bandwidthGB}
                        onChange={(e) => setFormData({ ...formData, bandwidthGB: e.target.value })}
                        placeholder="100"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all pr-12"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">GB</span>
                    </div>
                  </div>
                </div>

                {/* Specs Visual Display */}
                {(formData.storageGB || formData.bandwidthGB || formData.ipAddress) && (
                  <div className="grid grid-cols-3 gap-3">
                    {formData.storageGB && (
                      <div className="p-3 bg-slate-800/50 rounded-xl text-center">
                        <span className="text-2xl block mb-1">💾</span>
                        <span className="text-lg font-semibold text-white">{formData.storageGB}</span>
                        <span className="text-xs text-slate-400 block">GB Storage</span>
                      </div>
                    )}
                    {formData.bandwidthGB && (
                      <div className="p-3 bg-slate-800/50 rounded-xl text-center">
                        <span className="text-2xl block mb-1">📶</span>
                        <span className="text-lg font-semibold text-white">{formData.bandwidthGB}</span>
                        <span className="text-xs text-slate-400 block">GB Bandwidth</span>
                      </div>
                    )}
                    {formData.ipAddress && (
                      <div className="p-3 bg-slate-800/50 rounded-xl text-center">
                        <span className="text-2xl block mb-1">🌐</span>
                        <span className="text-sm font-mono font-semibold text-white truncate">{formData.ipAddress}</span>
                        <span className="text-xs text-slate-400 block">IP Address</span>
                      </div>
                    )}
                  </div>
                )}

                {/* IP Address */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">IP Address</label>
                  <input
                    type="text"
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                    placeholder="123.456.789.012"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                  />
                </div>
              </CollapsibleSection>

              {/* SSH Access Section */}
              <CollapsibleSection
                title="SSH Access"
                icon="🔑"
                badge={formData.sshAccess && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400">Enabled</span>
                )}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, sshAccess: !formData.sshAccess })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.sshAccess ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        formData.sshAccess ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-slate-300">SSH Access Available</span>
                </div>

                {formData.sshAccess && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">SSH Host</label>
                      <input
                        type="text"
                        value={formData.sshHost}
                        onChange={(e) => setFormData({ ...formData, sshHost: e.target.value })}
                        placeholder="server.example.com"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">SSH Port</label>
                      <input
                        type="number"
                        value={formData.sshPort}
                        onChange={(e) => setFormData({ ...formData, sshPort: e.target.value })}
                        placeholder="22"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                      />
                    </div>
                  </div>
                )}
              </CollapsibleSection>

              {/* Billing Section */}
              <CollapsibleSection
                title="Billing & Renewal"
                icon="💰"
                defaultOpen={true}
                badge={formData.renewalDate && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    renewalInfo.color === 'red' ? 'bg-red-500/20 text-red-400' :
                    renewalInfo.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                    renewalInfo.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {renewalInfo.label}
                  </span>
                )}
              >
                {/* Cost Calculator */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Cost <span className="text-red-400">*</span>
                    </label>
                    <div className="flex bg-slate-800 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => setCostMode('monthly')}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                          costMode === 'monthly' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setCostMode('annual')}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                          costMode === 'annual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Annual
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input
                      type="number"
                      value={formData.monthlyCost}
                      onChange={(e) => setFormData({ ...formData, monthlyCost: e.target.value })}
                      placeholder="500"
                      required
                      className="w-full pl-8 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  {monthlyCost > 0 && (
                    <div className="mt-2 p-3 bg-slate-800/50 rounded-xl">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Monthly</span>
                        <span className="text-white">₹{monthlyCost.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-slate-400">Annual</span>
                        <span className="text-emerald-400 font-medium">₹{annualCost.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Renewal Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Renewal Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.renewalDate}
                    onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                {/* Renewal Indicator */}
                {formData.renewalDate && (
                  <div className={`p-3 rounded-xl ${
                    renewalInfo.color === 'red' ? 'bg-red-500/10 border border-red-500/30' :
                    renewalInfo.color === 'amber' ? 'bg-amber-500/10 border border-amber-500/30' :
                    renewalInfo.color === 'yellow' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                    'bg-emerald-500/10 border border-emerald-500/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {renewalInfo.days < 0 ? '⚠️' : renewalInfo.days <= 30 ? '🔴' : renewalInfo.days <= 60 ? '🟡' : '🟢'}
                      </span>
                      <span className={`text-sm font-medium ${
                        renewalInfo.color === 'red' ? 'text-red-400' :
                        renewalInfo.color === 'amber' ? 'text-amber-400' :
                        renewalInfo.color === 'yellow' ? 'text-yellow-400' :
                        'text-emerald-400'
                      }`}>
                        {renewalInfo.label}
                      </span>
                    </div>
                  </div>
                )}

                {/* Purchased By & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Purchased By</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['AGENCY', 'CLIENT'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setFormData({ ...formData, purchasedBy: option })}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            formData.purchasedBy === option
                              ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20'
                              : 'border-white/10 bg-slate-800/50 hover:border-white/20'
                          }`}
                        >
                          <span className="text-lg block mb-1">{option === 'AGENCY' ? '🏢' : '👤'}</span>
                          <span className="text-xs text-slate-300">{option === 'AGENCY' ? 'Agency' : 'Client'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {statusOptions.map((status) => (
                        <button
                          key={status.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, status: status.value })}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            formData.status === status.value
                              ? status.color === 'emerald' ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20' :
                                status.color === 'amber' ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20' :
                                status.color === 'red' ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/20' :
                                'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20'
                              : 'border-white/10 bg-slate-800/50 hover:border-white/20'
                          }`}
                        >
                          <span className={`text-sm ${
                            status.color === 'emerald' ? 'text-emerald-400' :
                            status.color === 'amber' ? 'text-amber-400' :
                            status.color === 'red' ? 'text-red-400' :
                            'text-blue-400'
                          }`}>{status.icon} {status.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Access URLs Section */}
              <CollapsibleSection title="Access URLs" icon="🔗">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">cPanel URL</label>
                    <input
                      type="url"
                      value={formData.cpanelUrl}
                      onChange={(e) => setFormData({ ...formData, cpanelUrl: e.target.value })}
                      placeholder="https://cpanel.example.com"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Dashboard URL</label>
                    <input
                      type="url"
                      value={formData.loginUrl}
                      onChange={(e) => setFormData({ ...formData, loginUrl: e.target.value })}
                      placeholder="https://dashboard.example.com"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional notes..."
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </CollapsibleSection>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg shadow-indigo-500/25"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Create Hosting Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
