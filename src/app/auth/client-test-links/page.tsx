'use client'

import { useState, useEffect } from 'react'

interface ClientLink {
  clientId: string
  clientUserId: string
  clientName: string
  email: string
  services: string[]
  status: string
  paymentStatus: string | null
  hasWebsiteAccess: boolean
  hasMarketingAccess: boolean
  magicLink: string
}

export default function ClientTestLinksPage() {
  const [links, setLinks] = useState<ClientLink[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'website' | 'marketing'>('all')

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/auth/client-magic')
      if (res.ok) {
        const data = await res.json()
        setLinks(data.links || [])
      }
    } catch (error) {
      console.error('Failed to fetch links:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const filteredLinks = links.filter(link => {
    if (filter === 'all') return true
    if (filter === 'website') return link.hasWebsiteAccess || link.services.includes('WEB')
    if (filter === 'marketing') return link.hasMarketingAccess || (link.services.some(s => ['SM', 'SEO', 'ADS', 'GMB'].includes(s)) && !link.hasWebsiteAccess)
    return true
  })

  const websiteClients = links.filter(l => l.hasWebsiteAccess || l.services.includes('WEB'))
  const marketingClients = links.filter(l => l.hasMarketingAccess || (l.services.some(s => ['SM', 'SEO', 'ADS', 'GMB'].includes(s)) && !l.hasWebsiteAccess))

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Client Portal Test Links</h1>
          <p className="text-slate-400">Magic links for testing client dashboards</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
            <p className="text-3xl font-bold text-white">{links.length}</p>
            <p className="text-sm text-slate-400">Total Clients</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl border border-purple-500/20 p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">{websiteClients.length}</p>
            <p className="text-sm text-slate-400">Website Projects</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl border border-blue-500/20 p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{marketingClients.length}</p>
            <p className="text-sm text-slate-400">Marketing Clients</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {[
            { value: 'all', label: 'All Clients' },
            { value: 'website', label: 'Website Projects' },
            { value: 'marketing', label: 'Marketing Clients' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as 'all' | 'website' | 'marketing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Links Grid */}
        <div className="grid gap-4">
          {filteredLinks.map((client) => (
            <div
              key={client.clientUserId}
              className={`rounded-xl border p-5 transition-all hover:shadow-none ${
                client.services.includes('WEB')
                  ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40'
                  : 'bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border-blue-500/20 hover:border-blue-500/40'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    client.services.includes('WEB')
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {client.clientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{client.clientName}</h3>
                    <p className="text-sm text-slate-400 mb-2">{client.email}</p>
                    <div className="flex flex-wrap gap-2">
                      {client.services.map((s) => (
                        <span key={s} className={`text-xs px-2 py-1 rounded-full font-medium ${
                          s === 'WEB' ? 'bg-purple-500/20 text-purple-400' :
                          s === 'SEO' ? 'bg-emerald-500/20 text-emerald-400' :
                          s === 'SM' ? 'bg-blue-500/20 text-blue-400' :
                          s === 'ADS' ? 'bg-amber-500/20 text-amber-400' :
                          s === 'GMB' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-600 text-slate-300'
                        }`}>
                          {s === 'WEB' ? 'Website' :
                           s === 'SEO' ? 'SEO' :
                           s === 'SM' ? 'Social Media' :
                           s === 'ADS' ? 'Paid Ads' :
                           s === 'GMB' ? 'Google Business' : s}
                        </span>
                      ))}
                      {client.paymentStatus && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          client.paymentStatus === 'DONE'
                            ? 'bg-green-500/20 text-green-400'
                            : client.paymentStatus === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-400'
                            : client.paymentStatus === 'PARTIAL'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-slate-600 text-slate-300'
                        }`}>
                          {client.paymentStatus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(client.magicLink, client.clientUserId)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        copied === client.clientUserId
                          ? 'bg-green-500 text-white'
                          : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                      }`}
                    >
                      {copied === client.clientUserId ? 'Copied!' : 'Copy Link'}
                    </button>
                    <a
                      href={client.magicLink}
                      target="_blank"
                      className="px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      Open Portal
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                  {/* Show Web Portal badge for website clients */}
                  {client.hasWebsiteAccess && (
                    <span className="text-xs px-2 py-1 bg-teal-500/20 text-teal-400 rounded-full">
                      Has Web Portal Access
                    </span>
                  )}
                  <code className="text-xs text-slate-400 max-w-[300px] truncate">
                    {client.magicLink}
                  </code>
                </div>
              </div>
            </div>
          ))}

          {filteredLinks.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              No clients found for this filter
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <a
            href="/auth/test-links"
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            ← Back to Employee Test Links
          </a>
        </div>
      </div>
    </div>
  )
}
