'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'

interface User {
  id: string
  empId: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  role: string
  department: string
  status: string
}

export default function BrandingMagicLinksPage() {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [sentEmail, setSentEmail] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.filter((u: User) => ['ACTIVE', 'PROBATION'].includes(u.status)))
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendLink = async (user: User) => {
    if (!user.email) {
      toast.error('No email on file for this user')
      return
    }

    setSending(user.id)
    try {
      const res = await fetch('/api/admin/branding-magic-link/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success(data.message)
        setSentEmail(user.id)
        setTimeout(() => setSentEmail(null), 5000)
      } else {
        toast.error(data.error || 'Failed to send link')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setSending(null)
    }
  }

  const filteredUsers = users.filter((user) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      user.firstName.toLowerCase().includes(q) ||
      (user.lastName?.toLowerCase() || '').includes(q) ||
      user.empId.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.role.toLowerCase().includes(q) ||
      user.department.toLowerCase().includes(q)
    )
  })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'ADMIN': return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      case 'HR': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'MANAGER': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'ACCOUNTS': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'SALES': return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      case 'EMPLOYEE': return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
      case 'FREELANCER': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
      case 'INTERN': return 'bg-pink-500/20 text-pink-300 border-pink-500/30'
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Branding Pioneers Magic Links</h1>
        <p className="text-slate-400 mt-1">Send magic login links with Branding Pioneers branding to any user</p>
      </div>

      {/* Branding Banner */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-4">
          <img
            src="https://media.licdn.com/dms/image/v2/D560BAQGT-4AkgFOddw/company-logo_200_200/company-logo_200_200/0/1707465236952/branding_pioneers_logo?e=2147483647&v=beta&t=ija9ZpUW4n7IqvXbi0baAKUyo2q20DBV2dDH5g5rJm8"
            alt="Branding Pioneers"
            className="w-12 h-12 rounded-xl"
          />
          <div>
            <h2 className="text-lg font-semibold text-white">Branding Pioneers Admin Portal</h2>
            <p className="text-slate-400 text-sm">Links are sent from <strong className="text-white">brandingpioneers.in</strong> with your company branding</p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <p className="text-blue-300 font-medium mb-1">How It Works</p>
            <ul className="text-blue-200/70 space-y-1">
              <li>Search for any active employee and send them a magic login link</li>
              <li>The email uses <strong className="text-blue-200">Branding Pioneers</strong> branding from <strong className="text-blue-200">brandingpioneers.in</strong></li>
              <li>Links expire in 24 hours and can only be used once</li>
              <li>The link redirects to <strong className="text-blue-200">https://brandingpioneers.in/auth/magic?token=...</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, employee ID, email, role, or department..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading employees...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    {search ? 'No employees match your search' : 'No employees found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{user.firstName} {user.lastName || ''}</p>
                        <p className="text-slate-400 text-sm">{user.empId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300 text-sm">{user.department || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300 text-sm">{user.email || <span className="text-red-400">No email</span>}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleSendLink(user)}
                        disabled={sending === user.id || !user.email}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                          sentEmail === user.id
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white hover:opacity-90'
                        }`}
                      >
                        {sending === user.id ? (
                          <span className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Sending...
                          </span>
                        ) : sentEmail === user.id ? (
                          '✓ Sent!'
                        ) : (
                          'Send Magic Link'
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length > 0 && (
        <p className="text-center text-slate-500 text-sm">
          Showing {filteredUsers.length} of {users.length} active employees
        </p>
      )}
    </div>
  )
}
