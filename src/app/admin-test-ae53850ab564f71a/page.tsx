'use client'

import { useState, useEffect } from 'react'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

const SECRET_KEY = 'ae53850ab564f71ac0d46ea8654af455'

interface User {
  id: string
  empId: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string
  role: string
  department: string
  profile?: { profilePicture: string | null } | null
  status: string
}

interface ClientUser {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  client: { id: string; name: string }
}

export default function AdminTestPage() {
  const [users, setUsers] = useState<User[]>([])
  const [clients, setClients] = useState<ClientUser[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingFor, setGeneratingFor] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [tab, setTab] = useState<'employees' | 'clients' | 'forms'>('employees')

  useEffect(() => {
    fetch(`/api/admin/test-access?key=${SECRET_KEY}`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || [])
        setClients(data.clients || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const generateLink = async (userId: string, type: 'employee' | 'client') => {
    setGeneratingFor(userId)
    try {
      const res = await fetch(`/api/admin/test-access?key=${SECRET_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type }),
      })
      const data = await res.json()
      if (data.magicLink) {
        window.open(data.magicLink, '_blank')
      } else {
        alert(data.error || 'Failed to generate link')
      }
    } catch {
      alert('Failed to generate link')
    } finally {
      setGeneratingFor(null)
    }
  }

  const filteredUsers = users.filter(u =>
    `${u.empId} ${u.firstName} ${u.lastName || ''} ${u.role} ${u.department} ${u.email || ''}`
      .toLowerCase()
      .includes(filter.toLowerCase())
  )

  const filteredClients = clients.filter(c =>
    `${c.name} ${c.email} ${c.role} ${c.client.name}`
      .toLowerCase()
      .includes(filter.toLowerCase())
  )

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-500/20 text-red-400',
    MANAGER: 'bg-purple-500/20 text-purple-400',
    EMPLOYEE: 'bg-blue-500/20 text-blue-400',
    SALES: 'bg-green-500/20 text-green-400',
    ACCOUNTS: 'bg-amber-500/20 text-amber-400',
    FREELANCER: 'bg-cyan-500/20 text-cyan-400',
    INTERN: 'bg-slate-500/20 text-slate-400',
  }

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-500/20 text-green-400',
    PROBATION: 'bg-amber-500/20 text-amber-400',
    PIP: 'bg-orange-500/20 text-orange-400',
    INACTIVE: 'bg-red-500/20 text-red-400',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Admin Test Access</h1>
          <p className="text-slate-400 text-sm mt-1">Click any user to open a login link in a new tab. Employee links valid 24h, client links valid 7 days.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('employees')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${tab === 'employees' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            Employees ({users.length})
          </button>
          <button
            onClick={() => setTab('clients')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${tab === 'clients' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            Clients ({clients.length})
          </button>
          <button
            onClick={() => setTab('forms')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${tab === 'forms' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            Public Forms
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder={tab === 'employees' ? 'Search by name, role, department, email...' : 'Search by name, email, company...'}
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-blue-500"
        />

        {/* Employees Tab */}
        {tab === 'employees' && (
          <div className="space-y-2">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No employees found</p>
            ) : (
              filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => generateLink(user.id, 'employee')}
                  disabled={generatingFor === user.id}
                  className="w-full flex items-center gap-4 p-4 bg-slate-900/60 border border-white/5 rounded-xl hover:border-blue-500/30 hover:bg-slate-800/60 transition-all text-left disabled:opacity-50"
                >
                  <div className="shrink-0">
                    <UserAvatar user={{ id: user.id, firstName: user.firstName, lastName: user.lastName, profile: user.profile }} size="md" showPreview={false} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{user.firstName} {user.lastName || ''}</span>
                      <span className="text-xs text-slate-500">{user.empId}</span>
                    </div>
                    <div className="text-sm text-slate-400">{user.email || user.phone}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${roleColors[user.role] || 'bg-slate-700 text-slate-300'}`}>
                    {user.role}
                  </span>
                  <span className="text-xs text-slate-500 hidden sm:inline">{user.department}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[user.status] || 'bg-slate-700 text-slate-300'}`}>
                    {user.status}
                  </span>
                  {generatingFor === user.id ? (
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full shrink-0" />
                  ) : (
                    <span className="text-slate-600 text-sm shrink-0">&#8599;</span>
                  )}
                </button>
              ))
            )}
          </div>
        )}

        {/* Clients Tab */}
        {tab === 'clients' && (
          <div className="space-y-2">
            {filteredClients.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No client users found</p>
            ) : (
              filteredClients.map(cu => (
                <button
                  key={cu.id}
                  onClick={() => generateLink(cu.id, 'client')}
                  disabled={generatingFor === cu.id}
                  className="w-full flex items-center gap-4 p-4 bg-slate-900/60 border border-white/5 rounded-xl hover:border-green-500/30 hover:bg-slate-800/60 transition-all text-left disabled:opacity-50"
                >
                  <div className="shrink-0">
                    <UserAvatar user={{ id: cu.id, firstName: cu.name }} size="md" showPreview={false} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{cu.name}</span>
                    </div>
                    <div className="text-sm text-slate-400">{cu.email} &middot; {cu.client.name}</div>
                  </div>
                  <span className="text-xs text-slate-500 hidden sm:inline">{cu.role}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${cu.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {cu.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {generatingFor === cu.id ? (
                    <div className="animate-spin w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full shrink-0" />
                  ) : (
                    <span className="text-slate-600 text-sm shrink-0">&#8599;</span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
        {/* Public Forms Tab */}
        {tab === 'forms' && (
          <div className="space-y-6">
            {/* Public Forms - No Login Required */}
            <div>
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Public Forms (No Login Required)</h3>
              <div className="space-y-2">
                {[
                  { name: 'Careers / Job Application', url: '/careers', desc: 'Apply for open positions at Branding Pioneers', icon: '💼' },
                  { name: 'Client Onboarding (Welcome)', url: '/welcome', desc: 'New client prospect onboarding form', icon: '👋' },
                  { name: 'Exit Interview', url: '/exit-interview', desc: 'Employee exit feedback survey', icon: '🚪' },
                ].map(form => (
                  <a
                    key={form.url}
                    href={form.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-slate-900/60 border border-white/5 rounded-xl hover:border-amber-500/30 hover:bg-slate-800/60 transition-all"
                  >
                    <span className="text-2xl shrink-0">{form.icon}</span>
                    <div className="flex-1">
                      <span className="font-medium text-white">{form.name}</span>
                      <p className="text-sm text-slate-400">{form.desc}</p>
                    </div>
                    <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">Public</span>
                    <span className="text-slate-600 text-sm shrink-0">&#8599;</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Embeddable Forms (iFrame) */}
            <div>
              <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-3">Embeddable Forms (iFrame Ready)</h3>
              <div className="space-y-2">
                {[
                  { name: 'Embed — Client Onboarding', url: '/embed/client-onboarding', desc: 'For embedding on client-facing websites', icon: '🌐' },
                  { name: 'Embed — RFP / Request for Proposal', url: '/embed/rfp', desc: 'Embedded RFP submission form', icon: '📋' },
                  { name: 'Embed — Careers', url: '/embed/careers', desc: 'Embedded job application form', icon: '📄' },
                  { name: 'Embed — Support Request', url: '/embed/support', desc: 'Client support ticket form', icon: '🎧' },
                  { name: 'Embed — Bug Report', url: '/embed/bug-report', desc: 'Bug reporting from client websites', icon: '🐛' },
                  { name: 'Embed — Welcome', url: '/embed/welcome', desc: 'Welcome/prospect form for embedding', icon: '✨' },
                ].map(form => (
                  <a
                    key={form.url}
                    href={form.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-slate-900/60 border border-white/5 rounded-xl hover:border-purple-500/30 hover:bg-slate-800/60 transition-all"
                  >
                    <span className="text-2xl shrink-0">{form.icon}</span>
                    <div className="flex-1">
                      <span className="font-medium text-white">{form.name}</span>
                      <p className="text-sm text-slate-400">{form.desc}</p>
                    </div>
                    <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">Embed</span>
                    <span className="text-slate-600 text-sm shrink-0">&#8599;</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Token-Based Forms */}
            <div>
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3">Token-Based Forms (Require Valid Token)</h3>
              <div className="space-y-2">
                {[
                  { name: 'Employee Onboarding Wizard', url: '/join-team/[token]', desc: '7-step onboarding: NDA, Bond, Policies, Documents, KYC', icon: '🧑‍💼', note: 'Generate token from Admin > Employee Onboarding' },
                  { name: 'Client Onboarding (Token)', url: '/onboarding/[token]', desc: 'Client onboarding with pre-filled proposal details', icon: '🏢', note: 'Generate token from Accounts > Onboarding' },
                  { name: 'RFP Submission (Token)', url: '/rfp/[token]', desc: '6-step RFP form with token-based access', icon: '📑', note: 'Generate token from Sales > RFP Manager' },
                  { name: 'Candidate Assessment', url: '/assessment/[token]', desc: '8-step candidate assessment form', icon: '📝', note: 'Generate token from HR > Assessment Pipeline' },
                ].map(form => (
                  <div
                    key={form.url}
                    className="flex items-center gap-4 p-4 bg-slate-900/60 border border-white/5 rounded-xl"
                  >
                    <span className="text-2xl shrink-0">{form.icon}</span>
                    <div className="flex-1">
                      <span className="font-medium text-white">{form.name}</span>
                      <p className="text-sm text-slate-400">{form.desc}</p>
                      <p className="text-xs text-cyan-400/70 mt-1">{form.note}</p>
                    </div>
                    <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">Token</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Login Pages */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Login Pages</h3>
              <div className="space-y-2">
                {[
                  { name: 'Employee Login', url: '/login', desc: 'Magic link login for employees', icon: '🔐' },
                  { name: 'Client Portal Login', url: '/client-login', desc: 'OTP-based login for client users', icon: '🔑' },
                ].map(form => (
                  <a
                    key={form.url}
                    href={form.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-slate-900/60 border border-white/5 rounded-xl hover:border-slate-500/30 hover:bg-slate-800/60 transition-all"
                  >
                    <span className="text-2xl shrink-0">{form.icon}</span>
                    <div className="flex-1">
                      <span className="font-medium text-white">{form.name}</span>
                      <p className="text-sm text-slate-400">{form.desc}</p>
                    </div>
                    <span className="text-slate-600 text-sm shrink-0">&#8599;</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
