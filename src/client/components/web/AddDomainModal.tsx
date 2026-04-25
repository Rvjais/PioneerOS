'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
}

// Registrar data with logos
const registrars = [
  { value: 'GoDaddy', label: 'GoDaddy', logo: '🟠' },
  { value: 'Namecheap', label: 'Namecheap', logo: '🔴' },
  { value: 'Google Domains', label: 'Google Domains', logo: '🔵' },
  { value: 'Cloudflare', label: 'Cloudflare', logo: '🟡' },
  { value: 'Name.com', label: 'Name.com', logo: '🟢' },
  { value: 'BigRock', label: 'BigRock', logo: '🔷' },
  { value: 'Hostinger', label: 'Hostinger', logo: '🟣' },
  { value: 'Other', label: 'Other', logo: '⚪' },
]

const dnsProviders = ['Cloudflare', 'AWS Route 53', 'Google Cloud DNS', 'Namecheap', 'Same as Registrar', 'Other']

const sslProviders = ["Let's Encrypt", 'Cloudflare', 'Comodo', 'DigiCert', 'GoDaddy', 'Other']

const sslStatusOptions = [
  { value: 'ACTIVE', label: 'Active', color: 'emerald', icon: '✓' },
  { value: 'EXPIRED', label: 'Expired', color: 'red', icon: '✗' },
  { value: 'PENDING', label: 'Pending', color: 'amber', icon: '⏳' },
  { value: 'NONE', label: 'None', color: 'slate', icon: '−' },
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

// Domain validation helper
function validateDomain(domain: string): { valid: boolean; message: string } {
  if (!domain) return { valid: false, message: '' }

  // Remove protocol if present
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]

  // Basic domain regex
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/

  if (!domainRegex.test(cleanDomain)) {
    return { valid: false, message: 'Invalid domain format. Example: example.com' }
  }

  return { valid: true, message: 'Valid domain format' }
}

// Days calculator
function calculateDaysUntil(dateString: string): { days: number; label: string; color: string } {
  if (!dateString) return { days: 0, label: '', color: 'slate' }

  const now = new Date()
  const target = new Date(dateString)
  const diffTime = target.getTime() - now.getTime()
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (days < 0) return { days: Math.abs(days), label: `Expired ${Math.abs(days)} days ago`, color: 'red' }
  if (days <= 30) return { days, label: `Expires in ${days} days`, color: 'red' }
  if (days <= 60) return { days, label: `Expires in ${days} days`, color: 'amber' }
  if (days <= 90) return { days, label: `Expires in ${days} days`, color: 'yellow' }
  return { days, label: `Expires in ${days} days`, color: 'emerald' }
}

export function AddDomainModal() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    clientId: '',
    domainName: '',
    registrar: '',
    registrationDate: '',
    expiryDate: '',
    autoRenew: true,
    nameservers: '',
    dnsProvider: '',
    sslStatus: 'NONE',
    sslExpiryDate: '',
    sslProvider: '',
    purchasedBy: 'AGENCY',
    annualCost: '',
    loginUrl: '',
    notes: '',
  })

  useEffect(() => {
    if (isOpen) {
      // Reset form data when modal opens
      setFormData({
        clientId: '',
        domainName: '',
        registrar: '',
        registrationDate: '',
        expiryDate: '',
        autoRenew: true,
        nameservers: '',
        dnsProvider: '',
        sslStatus: 'NONE',
        sslExpiryDate: '',
        sslProvider: '',
        purchasedBy: 'AGENCY',
        annualCost: '',
        loginUrl: '',
        notes: '',
      })
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

  // Domain validation
  const domainValidation = useMemo(() => validateDomain(formData.domainName), [formData.domainName])

  // Expiry calculations
  const domainExpiry = useMemo(() => calculateDaysUntil(formData.expiryDate), [formData.expiryDate])
  const sslExpiry = useMemo(() => calculateDaysUntil(formData.sslExpiryDate), [formData.sslExpiryDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domainValidation.valid) return

    setLoading(true)

    try {
      const response = await fetch('/api/web/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          annualCost: formData.annualCost ? parseFloat(formData.annualCost) : null,
          nameservers: formData.nameservers
            ? formData.nameservers.split('\n').filter((ns) => ns.trim())
            : null,
        }),
      })

      if (!response.ok) throw new Error('Failed to create domain')

      setIsOpen(false)
      setFormData({
        clientId: '',
        domainName: '',
        registrar: '',
        registrationDate: '',
        expiryDate: '',
        autoRenew: true,
        nameservers: '',
        dnsProvider: '',
        sslStatus: 'NONE',
        sslExpiryDate: '',
        sslProvider: '',
        purchasedBy: 'AGENCY',
        annualCost: '',
        loginUrl: '',
        notes: '',
      })
      router.refresh()
    } catch (error) {
      console.error('Error creating domain:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedRegistrar = registrars.find(r => r.value === formData.registrar)
  const selectedSslStatus = sslStatusOptions.find(s => s.value === formData.sslStatus)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium transition-all shadow-lg shadow-indigo-500/25"
      >
        + Add Domain
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-white/10 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🌐</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Add New Domain</h2>
                    <p className="text-sm text-slate-400">Register domain details and tracking</p>
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
              {/* Client & Domain Section - Always Open */}
              <div className="space-y-4">
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

                {/* Domain Name with Validation */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Domain Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.domainName}
                      onChange={(e) => setFormData({ ...formData, domainName: e.target.value })}
                      placeholder="example.com"
                      required
                      className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all ${
                        formData.domainName
                          ? domainValidation.valid
                            ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                            : 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                      }`}
                    />
                    {formData.domainName && (
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${domainValidation.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                        {domainValidation.valid ? '✓' : '✗'}
                      </span>
                    )}
                  </div>
                  {formData.domainName && (
                    <p className={`text-xs mt-1.5 ${domainValidation.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                      {domainValidation.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Registrar Section */}
              <CollapsibleSection title="Registrar & DNS" icon="🏢" defaultOpen={true}>
                {/* Registrar Selection with Logos */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Registrar <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {registrars.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, registrar: r.value })}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          formData.registrar === r.value
                            ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20'
                            : 'border-white/10 bg-slate-800/50 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xl block mb-1">{r.logo}</span>
                        <span className="text-xs text-slate-300">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* DNS Provider */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">DNS Provider</label>
                  <select
                    value={formData.dnsProvider}
                    onChange={(e) => setFormData({ ...formData, dnsProvider: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-slate-800 text-white">Select DNS Provider</option>
                    {dnsProviders.map((d) => (
                      <option key={d} value={d} className="bg-slate-800 text-white">{d}</option>
                    ))}
                  </select>
                </div>

                {/* Nameservers */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nameservers (one per line)</label>
                  <textarea
                    value={formData.nameservers}
                    onChange={(e) => setFormData({ ...formData, nameservers: e.target.value })}
                    placeholder="ns1.example.com&#10;ns2.example.com"
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono text-sm"
                  />
                </div>
              </CollapsibleSection>

              {/* Dates Section */}
              <CollapsibleSection
                title="Registration & Expiry"
                icon="📅"
                defaultOpen={true}
                badge={formData.expiryDate && (
                  <span className={`px-2 py-0.5 text-xs rounded-full bg-${domainExpiry.color}-500/20 text-${domainExpiry.color}-400`}>
                    {domainExpiry.label}
                  </span>
                )}
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Registration Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Registration Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.registrationDate}
                      onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Expiry Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Expiry Indicator */}
                {formData.expiryDate && (
                  <div className={`p-3 rounded-xl bg-${domainExpiry.color}-500/10 border border-${domainExpiry.color}-500/30`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-${domainExpiry.color}-400 text-lg`}>
                        {domainExpiry.days < 0 ? '⚠️' : domainExpiry.days <= 30 ? '🔴' : domainExpiry.days <= 60 ? '🟡' : '🟢'}
                      </span>
                      <span className={`text-sm font-medium text-${domainExpiry.color}-400`}>
                        {domainExpiry.label}
                      </span>
                    </div>
                  </div>
                )}

                {/* Auto Renew Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, autoRenew: !formData.autoRenew })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.autoRenew ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        formData.autoRenew ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-slate-300">Auto-Renew Enabled</span>
                </div>
              </CollapsibleSection>

              {/* SSL Section */}
              <CollapsibleSection
                title="SSL Certificate"
                icon="🔒"
                badge={selectedSslStatus && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    selectedSslStatus.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                    selectedSslStatus.color === 'red' ? 'bg-red-500/20 text-red-400' :
                    selectedSslStatus.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {selectedSslStatus.icon} {selectedSslStatus.label}
                  </span>
                )}
              >
                {/* SSL Status Cards */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">SSL Status</label>
                  <div className="grid grid-cols-4 gap-2">
                    {sslStatusOptions.map((status) => (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, sslStatus: status.value })}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          formData.sslStatus === status.value
                            ? status.color === 'emerald' ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20' :
                              status.color === 'red' ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/20' :
                              status.color === 'amber' ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20' :
                              'border-slate-500 bg-slate-500/10 ring-2 ring-slate-500/20'
                            : 'border-white/10 bg-slate-800/50 hover:border-white/20'
                        }`}
                      >
                        <span className={`text-xl block mb-1 ${
                          status.color === 'emerald' ? 'text-emerald-400' :
                          status.color === 'red' ? 'text-red-400' :
                          status.color === 'amber' ? 'text-amber-400' :
                          'text-slate-400'
                        }`}>{status.icon}</span>
                        <span className="text-xs text-slate-300">{status.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {formData.sslStatus !== 'NONE' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {/* SSL Provider */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">SSL Provider</label>
                        <select
                          value={formData.sslProvider}
                          onChange={(e) => setFormData({ ...formData, sslProvider: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                          style={{ colorScheme: 'dark' }}
                        >
                          <option value="" className="bg-slate-800 text-white">Select Provider</option>
                          {sslProviders.map((s) => (
                            <option key={s} value={s} className="bg-slate-800 text-white">{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* SSL Expiry */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">SSL Expiry Date</label>
                        <input
                          type="date"
                          value={formData.sslExpiryDate}
                          onChange={(e) => setFormData({ ...formData, sslExpiryDate: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* SSL Expiry Indicator */}
                    {formData.sslExpiryDate && (
                      <div className={`p-3 rounded-xl ${
                        sslExpiry.color === 'red' ? 'bg-red-500/10 border border-red-500/30' :
                        sslExpiry.color === 'amber' ? 'bg-amber-500/10 border border-amber-500/30' :
                        sslExpiry.color === 'yellow' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                        'bg-emerald-500/10 border border-emerald-500/30'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {sslExpiry.days < 0 ? '⚠️' : sslExpiry.days <= 30 ? '🔴' : sslExpiry.days <= 60 ? '🟡' : '🟢'}
                          </span>
                          <span className={`text-sm font-medium ${
                            sslExpiry.color === 'red' ? 'text-red-400' :
                            sslExpiry.color === 'amber' ? 'text-amber-400' :
                            sslExpiry.color === 'yellow' ? 'text-yellow-400' :
                            'text-emerald-400'
                          }`}>
                            SSL {sslExpiry.label}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CollapsibleSection>

              {/* Billing Section */}
              <CollapsibleSection title="Billing & Access" icon="💰">
                <div className="grid grid-cols-2 gap-4">
                  {/* Purchased By */}
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

                  {/* Annual Cost */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Annual Cost</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                      <input
                        type="number"
                        value={formData.annualCost}
                        onChange={(e) => setFormData({ ...formData, annualCost: e.target.value })}
                        placeholder="1,500"
                        className="w-full pl-8 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Login URL */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Registrar Login URL</label>
                  <input
                    type="url"
                    value={formData.loginUrl}
                    onChange={(e) => setFormData({ ...formData, loginUrl: e.target.value })}
                    placeholder="https://godaddy.com/..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
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
                  disabled={loading || !domainValidation.valid}
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
                    'Create Domain'
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
