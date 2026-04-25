'use client'

import { useState, useEffect, use } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Link from 'next/link'

interface PortalUser {
  id: string
  email: string
  name: string
  phone: string | null
  role: string
  isActive: boolean
  lastLoginAt: string | null
  hasMarketingAccess: boolean
  hasWebsiteAccess: boolean
  createdAt: string
}

export default function PortalAccessPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [users, setUsers] = useState<PortalUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    role: 'VIEWER',
  })
  const [submitting, setSubmitting] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [resolvedParams.id])

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/web-clients/${resolvedParams.id}/portal-access`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.name) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/web-clients/${resolvedParams.id}/portal-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        setGeneratedLink(data.magicLink)
        setFormData({ email: '', name: '', phone: '', role: 'VIEWER' })
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to add user:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const generateMagicLink = async (userId: string) => {
    try {
      const res = await fetch(`/api/web-clients/${resolvedParams.id}/portal-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_magic_link', userId }),
      })

      if (res.ok) {
        const data = await res.json()
        setGeneratedLink(data.magicLink)
      }
    } catch (error) {
      console.error('Failed to generate link:', error)
    }
  }

  const toggleAccess = async (userId: string, field: 'hasMarketingAccess' | 'hasWebsiteAccess' | 'isActive', value: boolean) => {
    try {
      await fetch(`/api/web-clients/${resolvedParams.id}/portal-access`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, [field]: value }),
      })
      fetchUsers()
    } catch (error) {
      console.error('Failed to update access:', error)
    }
  }

  const copyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/web/clients/${resolvedParams.id}`}
            className="p-2 hover:bg-slate-800/50 rounded-lg"
          >
            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Portal Access</h1>
            <p className="text-slate-400">Manage client portal users and access</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true)
            setGeneratedLink(null)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Add Portal User
        </button>
      </div>

      {/* Users List */}
      <div className="glass-card rounded-xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/40">
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">User</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Role</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Access</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Last Login</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.length > 0 ? users.map(user => (
                <tr key={user.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium text-white">{user.name}</span>
                      <p className="text-sm text-slate-400">{user.email}</p>
                      {user.phone && <p className="text-xs text-slate-400">{user.phone}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.role === 'PRIMARY' ? 'bg-purple-500/20 text-purple-400' :
                      user.role === 'SECONDARY' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-800/50 text-slate-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAccess(user.id, 'hasWebsiteAccess', !user.hasWebsiteAccess)}
                        className={`text-xs px-2 py-1 rounded ${
                          user.hasWebsiteAccess ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-800/50 text-slate-400'
                        }`}
                      >
                        Website
                      </button>
                      <button
                        onClick={() => toggleAccess(user.id, 'hasMarketingAccess', !user.hasMarketingAccess)}
                        className={`text-xs px-2 py-1 rounded ${
                          user.hasMarketingAccess ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/50 text-slate-400'
                        }`}
                      >
                        Marketing
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAccess(user.id, 'isActive', !user.isActive)}
                      className={`text-xs px-2 py-1 rounded-full ${
                        user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {user.lastLoginAt ? (
                      <span className="text-sm text-slate-400">
                        {formatDateDDMMYYYY(user.lastLoginAt)}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">Never</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => generateMagicLink(user.id)}
                      className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-400"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Magic Link
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No portal users yet. Add a user to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generated Link Display */}
      {generatedLink && (
        <div className="bg-green-500/10 rounded-lg border border-green-200 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-green-900">Magic Link Generated</h3>
              <p className="text-sm text-green-400 mt-1">Share this link with the user to give them portal access.</p>
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="flex-1 px-3 py-2 glass-card border border-green-200 rounded text-sm"
                />
                <button
                  onClick={copyLink}
                  className={`px-3 py-2 rounded text-sm font-medium ${
                    copySuccess ? 'bg-green-600 text-white' : 'bg-green-500/20 text-green-400 hover:bg-green-200'
                  }`}
                >
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-green-400 mt-2">Link expires in 7 days</p>
            </div>
            <button
              onClick={() => setGeneratedLink(null)}
              className="text-green-400 hover:text-green-400"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Add Portal User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                  placeholder="John Smith"
                  className="w-full px-3 py-2 border border-white/10 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 border border-white/10 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border border-white/10 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData(d => ({ ...d, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg"
                >
                  <option value="PRIMARY">Primary</option>
                  <option value="SECONDARY">Secondary</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.email || !formData.name}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create & Generate Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
