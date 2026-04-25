'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

interface TeamMember {
  id: string
  empId: string
  firstName: string
  lastName?: string
  email?: string
  phone: string
  role: string
  department: string
  status: string
  joiningDate: string
  profilePicture?: string | null
  profile?: {
    profilePicture?: string | null
  } | null
}

const departments = ['All', 'WEB', 'SEO', 'ADS', 'SOCIAL', 'HR', 'ACCOUNTS', 'SALES', 'OPERATIONS']

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      }
    } catch (error) {
      console.error('Failed to fetch team:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesDepartment = selectedDepartment === 'All' || member.department === selectedDepartment
    const matchesSearch =
      `${member.firstName} ${member.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.empId.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDepartment && matchesSearch
  })

  const departmentCounts = departments.reduce((acc, dept) => {
    acc[dept] = dept === 'All'
      ? members.length
      : members.filter(m => m.department === dept).length
    return acc
  }, {} as Record<string, number>)

  const getInitials = (firstName: string, lastName?: string) => {
    return `${firstName.charAt(0)}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'SUPER_ADMIN': 'bg-purple-500/20 text-purple-400',
      'MANAGER': 'bg-blue-500/20 text-blue-400',
      'EMPLOYEE': 'bg-green-500/20 text-green-400',
      'SALES': 'bg-amber-500/20 text-amber-400',
      'ACCOUNTS': 'bg-teal-500/20 text-teal-400',
      'FREELANCER': 'bg-slate-800/50 text-slate-200',
    }
    return colors[role] || 'bg-slate-800/50 text-slate-200'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ACTIVE': 'bg-green-500',
      'PROBATION': 'bg-amber-500',
      'PIP': 'bg-red-500',
      'INACTIVE': 'bg-slate-400',
    }
    return colors[status] || 'bg-slate-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Directory</h1>
          <p className="text-slate-400">{members.length} team members</p>
        </div>
        <Link
          href="/hr"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          HR Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or employee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Department Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                selectedDepartment === dept
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
              }`}
            >
              {dept} ({departmentCounts[dept]})
            </button>
          ))}
        </div>
      </div>

      {/* Team Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMembers.map(member => (
            <Link
              key={member.id}
              href={`/team/${member.id}`}
              className="glass-card rounded-xl border border-white/10 p-4 hover:border-blue-300 hover:shadow-none transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="relative" onClick={(e) => e.preventDefault()}>
                  <UserAvatar
                    user={{
                      id: member.id,
                      firstName: member.firstName,
                      lastName: member.lastName,
                      email: member.email,
                      phone: member.phone,
                      role: member.role,
                      department: member.department,
                      empId: member.empId,
                      profile: member.profile || (member.profilePicture ? { profilePicture: member.profilePicture } : null)
                    }}
                    size="lg"
                  />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">
                    {member.firstName} {member.lastName}
                  </h3>
                  <p className="text-xs text-slate-400">{member.empId}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getRoleColor(member.role)}`}>
                  {member.role.replace(/_/g, ' ')}
                </span>
                {/* Only show department if different from role */}
                {member.department !== member.role && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-800/50 text-slate-300">
                    {member.department}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900/40 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredMembers.map(member => (
                <tr key={member.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        user={{
                          id: member.id,
                          firstName: member.firstName,
                          lastName: member.lastName,
                          email: member.email,
                          phone: member.phone,
                          role: member.role,
                          department: member.department,
                          empId: member.empId,
                          profile: member.profile || (member.profilePicture ? { profilePicture: member.profilePicture } : null)
                        }}
                        size="sm"
                      />
                      <Link href={`/team/${member.id}`}>
                        <p className="font-medium text-white">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-slate-400">{member.empId}</p>
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getRoleColor(member.role)}`}>
                      {member.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{member.department}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {member.email && <p className="text-xs">{member.email}</p>}
                    <p className="text-xs text-slate-400">{member.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${
                      member.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                      member.status === 'PROBATION' ? 'bg-amber-500/20 text-amber-400' :
                      member.status === 'PIP' ? 'bg-red-500/20 text-red-400' :
                      'bg-slate-800/50 text-slate-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(member.status)}`}></span>
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 glass-card rounded-xl border border-white/10">
          <p className="text-slate-400">No team members found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
