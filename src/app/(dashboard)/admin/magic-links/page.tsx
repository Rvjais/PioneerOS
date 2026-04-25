'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface MagicLinkData {
  role: string
  token: string
  user: string
  department?: string
}

export default function MagicLinksPage() {
  const [generating, setGenerating] = useState(false)
  const [links, setLinks] = useState<MagicLinkData[]>([])
  const [ipRestricted, setIpRestricted] = useState(false)
  const [currentIp, setCurrentIp] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [copiedToken, setCopiedToken] = useState('')

  const generateAllLinks = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/magic-link/generate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipRestricted }),
      })

      const data = await res.json()

      if (data.success) {
        setLinks(data.links)
        setCurrentIp(data.ipAddress || '')
        setExpiresAt(data.expiresAt)
      } else {
        toast.error(data.error || 'Failed to generate links')
      }
    } catch (error) {
      console.error('Error generating links:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/test-login?token=${token}`
    navigator.clipboard.writeText(url)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(''), 2000)
  }

  const copyAllLinks = () => {
    const allLinks = links.map(link => {
      const url = `${window.location.origin}/test-login?token=${link.token}`
      return `${link.role}: ${url}`
    }).join('\n')
    navigator.clipboard.writeText(allLinks)
    toast.success('All links copied to clipboard!')
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'HR': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'MANAGER': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'ACCOUNTS': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'SALES': return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      case 'EMPLOYEE': return 'bg-slate-900/20 text-slate-300 border-slate-500/30'
      case 'FREELANCER': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
      case 'INTERN': return 'bg-pink-500/20 text-pink-300 border-pink-500/30'
      case 'CLIENT': return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      default: return 'bg-slate-900/20 text-slate-300 border-slate-500/30'
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Magic Links</h1>
          <p className="text-slate-400 mt-1">Generate test login links for all roles</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <p className="text-blue-300 font-medium mb-1">How Magic Links Work</p>
            <ul className="text-blue-200/70 space-y-1">
              <li>Each link logs you in as a specific role without needing credentials</li>
              <li>Links expire after 24 hours and can only be used once</li>
              <li>IP restriction ensures links only work from your current IP address</li>
              <li>Use these for testing different dashboards on various devices</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Generate Section */}
      <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Generate Links</h2>

        <div className="flex items-center gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ipRestricted}
              onChange={(e) => setIpRestricted(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-slate-300">Restrict to current IP address</span>
          </label>

          <button
            onClick={generateAllLinks}
            disabled={generating}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Generate All Links
              </>
            )}
          </button>
        </div>

        {links.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                <p>Links expire: <span className="text-slate-300">{new Date(expiresAt).toLocaleString()}</span></p>
                {currentIp && <p>IP Restricted: <span className="text-slate-300">{currentIp}</span></p>}
              </div>
              <button
                onClick={copyAllLinks}
                className="px-4 py-1.5 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Copy All Links
              </button>
            </div>

            <div className="grid gap-3">
              {links.map((link) => (
                <div
                  key={link.token}
                  className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getRoleColor(link.role)}`}>
                      {link.role}
                    </span>
                    <div>
                      <p className="text-white text-sm font-medium">{link.user}</p>
                      {link.department && (
                        <p className="text-xs text-slate-400">{link.department}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/test-login?token=${link.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      Open
                    </a>
                    <button
                      onClick={() => copyLink(link.token)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        copiedToken === link.token
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'
                      }`}
                    >
                      {copiedToken === link.token ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QR Code Section */}
      {links.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Access</h2>
          <p className="text-sm text-slate-400 mb-4">
            Open these links on your mobile device or other browsers to test different roles.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((link) => (
              <div
                key={link.token}
                className="p-4 bg-gradient-to-br from-white/5 to-white/0 rounded-xl border border-white/10 text-center"
              >
                <div className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border mb-3 ${getRoleColor(link.role)}`}>
                  {link.role}
                </div>
                <p className="text-white text-sm font-medium mb-1">{link.user}</p>
                <p className="text-xs text-slate-400 mb-3 font-mono break-all">
                  ...{link.token.slice(-12)}
                </p>
                <div className="flex gap-2">
                  <a
                    href={`/test-login?token=${link.token}`}
                    className="flex-1 px-3 py-2 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Login
                  </a>
                  <button
                    onClick={() => copyLink(link.token)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
