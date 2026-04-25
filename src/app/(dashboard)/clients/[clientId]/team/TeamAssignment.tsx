'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

interface TeamMember {
  id: string
  userId: string
  role: string
  isPrimary: boolean
  user: {
    id: string
    firstName: string
    lastName: string
    empId: string
    department: string
  }
}

interface User {
  id: string
  firstName: string
  lastName: string
  empId: string
  department: string
  role: string
}

interface Props {
  client: {
    id: string
    name: string
    tier: string
    status: string
  }
  currentTeam: TeamMember[]
  availableUsers: User[]
}

const roles = [
  { value: 'ACCOUNT_MANAGER', label: 'Account Manager' },
  { value: 'SEO_SPECIALIST', label: 'SEO Specialist' },
  { value: 'ADS_SPECIALIST', label: 'Ads Specialist' },
  { value: 'SOCIAL_MANAGER', label: 'Social Media Manager' },
  { value: 'CONTENT_WRITER', label: 'Content Writer' },
  { value: 'DESIGNER', label: 'Designer' },
  { value: 'AUTOMATION_ENGINEER', label: 'Automation Engineer' },
]

const departmentColors: Record<string, string> = {
  WEB: 'bg-blue-500/20 text-blue-400',
  SEO: 'bg-green-500/20 text-green-400',
  ADS: 'bg-purple-500/20 text-purple-400',
  SOCIAL: 'bg-pink-500/20 text-pink-400',
  OPERATIONS: 'bg-amber-500/20 text-amber-400',
}

export function TeamAssignment({ client, currentTeam, availableUsers }: Props) {
  const router = useRouter()
  const [team, setTeam] = useState(currentTeam)
  const [isAdding, setIsAdding] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedRole, setSelectedRole] = useState('ACCOUNT_MANAGER')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAddMember = async () => {
    if (!selectedUser || !selectedRole) return

    setIsProcessing(true)
    try {
      const res = await fetch(`/api/clients/${client.id}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser,
          role: selectedRole,
          isPrimary: team.length === 0,
        }),
      })

      if (res.ok) {
        router.refresh()
        setIsAdding(false)
        setSelectedUser('')
      }
    } catch (error) {
      console.error('Failed to add team member:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this team member?')) return

    setIsProcessing(true)
    try {
      await fetch(`/api/clients/${client.id}/team?memberId=${memberId}`, {
        method: 'DELETE',
      })
      router.refresh()
    } catch (error) {
      console.error('Failed to remove team member:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSetPrimary = async (memberId: string) => {
    setIsProcessing(true)
    try {
      await fetch(`/api/clients/${client.id}/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrimary: true }),
      })
      router.refresh()
    } catch (error) {
      console.error('Failed to update primary contact:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const assignedUserIds = team.map(m => m.userId)
  const filteredUsers = availableUsers.filter(u => !assignedUserIds.includes(u.id))

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/clients/${client.id}`} className="text-sm text-blue-400 hover:underline mb-2 inline-block">
            ← Back to Client
          </Link>
          <h1 className="text-2xl font-bold text-white">Team Assignment</h1>
          <p className="text-slate-400 mt-1">{client.name}</p>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
          client.tier === 'ENTERPRISE' ? 'bg-purple-500/20 text-purple-400' :
          client.tier === 'GROWTH' ? 'bg-blue-500/20 text-blue-400' :
          'bg-slate-800/50 text-slate-200'
        }`}>
          {client.tier}
        </span>
      </div>

      {/* Current Team */}
      <div className="glass-card rounded-xl border border-white/10">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-white">Assigned Team ({team.length})</h2>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Member
          </button>
        </div>

        {team.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-slate-400">No team members assigned yet</p>
            <p className="text-sm text-slate-400 mt-1">Add team members to start working on this client</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {team.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <UserAvatar user={{ id: member.user.id || member.userId, firstName: member.user.firstName, lastName: member.user.lastName }} size="md" showPreview={false} />
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={`/team/${member.user.id}`} className="hover:underline">
                        <p className="font-medium text-white">
                          {member.user.firstName} {member.user.lastName}
                        </p>
                      </Link>
                      {member.isPrimary && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      {member.role.replace(/_/g, ' ')} • {member.user.empId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${departmentColors[member.user.department] || 'bg-slate-800/50 text-slate-200'}`}>
                    {member.user.department}
                  </span>
                  {!member.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(member.id)}
                      disabled={isProcessing}
                      className="text-sm text-blue-400 hover:text-blue-400 disabled:opacity-50"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={isProcessing}
                    className="text-sm text-red-400 hover:text-red-400 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add Team Member</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Select Team Member
                </label>
                {filteredUsers.length === 0 && (
                  <p className="text-sm text-slate-400 py-2">All team members are already assigned to this client.</p>
                )}
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a team member...</option>
                  {filteredUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsAdding(false)
                  setSelectedUser('')
                }}
                className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={!selectedUser || isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isProcessing ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
