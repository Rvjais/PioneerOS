'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import OrgChartTree from '@/client/components/org-chart/OrgChartTree'
import OrgChartCard from '@/client/components/org-chart/OrgChartCard'
import OrgChartProfileModal from '@/client/components/org-chart/OrgChartProfileModal'
import { getDepartmentInfo, getRoleLevel, WORK_TYPE_LABELS } from '@/shared/constants/roleDefinitions'

interface ClientAssignment {
  clientId: string
  clientName: string
  role: string
  isPrimary: boolean
}

interface OrgChartMember {
  id: string
  empId: string
  firstName: string
  lastName: string | null
  role: string
  department: string
  status: string
  avatarUrl: string | null
  email: string | null
  phone: string
  clientAssignments: ClientAssignment[]
  directReportsCount?: number
}

type ViewMode = 'tree' | 'grid' | 'role'

export default function OrgChartPage() {
  const router = useRouter()
  const [members, setMembers] = useState<OrgChartMember[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All')
  const [viewMode, setViewMode] = useState<ViewMode>('tree')
  const [searchQuery, setSearchQuery] = useState('')
  const [showClientsOnly, setShowClientsOnly] = useState(false)
  const [profileUserId, setProfileUserId] = useState<string | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchOrgChart()
  }, [])

  const fetchOrgChart = async () => {
    try {
      const res = await fetch('/api/org-chart')
      if (res.ok) {
        const data = await res.json()
        setMembers(data.users)
        setDepartments(data.departments)
      }
    } catch (error) {
      console.error('Failed to fetch org chart:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter members based on search and filters
  const filteredMembers = useMemo(() => {
    let result = members

    // Filter by department
    if (selectedDepartment !== 'All') {
      result = result.filter((m) => m.department === selectedDepartment)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (m) =>
          m.firstName.toLowerCase().includes(query) ||
          (m.lastName && m.lastName.toLowerCase().includes(query)) ||
          m.empId.toLowerCase().includes(query) ||
          m.role.toLowerCase().includes(query)
      )
    }

    // Filter by has clients
    if (showClientsOnly) {
      result = result.filter((m) => m.clientAssignments.length > 0)
    }

    return result
  }, [members, selectedDepartment, searchQuery, showClientsOnly])

  // Group members by role for role view
  const membersByRole = useMemo(() => {
    const grouped: Record<string, OrgChartMember[]> = {}
    filteredMembers.forEach((m) => {
      const level = getRoleLevel(m.role)
      const levelKey = level === 1 ? 'Leadership' : level === 2 ? 'Managers' : level === 4 ? 'Juniors' : 'Team Members'
      if (!grouped[levelKey]) grouped[levelKey] = []
      grouped[levelKey].push(m)
    })
    return grouped
  }, [filteredMembers])

  // Group members by department for grid view
  const membersByDepartment = useMemo(() => {
    const grouped: Record<string, OrgChartMember[]> = {}
    filteredMembers.forEach((m) => {
      if (!grouped[m.department]) grouped[m.department] = []
      grouped[m.department].push(m)
    })
    return grouped
  }, [filteredMembers])

  const handleViewProfile = (userId: string) => {
    setProfileUserId(userId)
  }

  const handleSendMessage = (userId: string) => {
    // Navigate to MASH with DM
    router.push(`/mash?dm=${userId}`)
  }

  const handleClientClick = (clientId: string) => {
    router.push(`/clients/${clientId}`)
  }

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Organization Chart
          </h1>
          <p className="text-slate-400 mt-1">
            {filteredMembers.length} team member{filteredMembers.length !== 1 ? 's' : ''}
            {selectedDepartment !== 'All' && ` in ${selectedDepartment}`}
          </p>
        </div>
        <Link
          href="/team"
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          Team Directory
        </Link>
      </div>

      {/* Filters & Controls */}
      <div className="glass-card p-4 space-y-4 shadow-sm border-slate-200">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, emp ID, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Department Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDepartment('All')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                selectedDepartment === 'All'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {departments.map((dept) => {
              const deptInfo = getDepartmentInfo(dept)
              return (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    selectedDepartment === dept
                      ? `${deptInfo.bgColor} ${deptInfo.color} border ${deptInfo.borderColor}`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {dept}
                </button>
              )
            })}
          </div>

          {/* Has Clients Filter */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showClientsOnly}
              onChange={(e) => setShowClientsOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="text-sm text-slate-600">Has clients</span>
          </label>

          {/* View Toggle */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setViewMode('tree')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'tree' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-500 hover:bg-slate-100'}`}
              title="Tree View"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-500 hover:bg-slate-100'}`}
              title="Grid View"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('role')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'role' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-500 hover:bg-slate-100'}`}
              title="Role View"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Org Chart Content */}
      <div className="glass-card p-6 overflow-x-auto shadow-sm border-slate-200">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-slate-500">No team members found matching your filters.</p>
            <button
              onClick={() => {
                setSelectedDepartment('All')
                setSearchQuery('')
                setShowClientsOnly(false)
              }}
              className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : viewMode === 'tree' ? (
          <OrgChartTree
            members={filteredMembers}
            onViewProfile={handleViewProfile}
            onSendMessage={handleSendMessage}
            onClientClick={handleClientClick}
            selectedDepartment={selectedDepartment}
          />
        ) : viewMode === 'grid' ? (
          <div className="space-y-6">
            {Object.entries(membersByDepartment).map(([dept, deptMembers]) => {
              const deptInfo = getDepartmentInfo(dept)
              return (
                <div
                  key={dept}
                  className={`rounded-xl border p-4 ${deptInfo.bgColor} ${deptInfo.borderColor}`}
                >
                  <h3 className={`text-lg font-semibold ${deptInfo.color} mb-4 flex items-center gap-2`}>
                    {deptInfo.label}
                    <span className="text-sm font-normal opacity-75">({deptMembers.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deptMembers.map((member) => (
                      <OrgChartCard
                        key={member.id}
                        member={member}
                        onViewProfile={handleViewProfile}
                        onSendMessage={handleSendMessage}
                        onClientClick={handleClientClick}
                        isExpanded={expandedCards.has(member.id)}
                        onToggleExpand={() => toggleExpand(member.id)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Role View */
          <div className="space-y-6">
            {['Leadership', 'Managers', 'Team Members', 'Juniors'].map((roleGroup) => {
              const groupMembers = membersByRole[roleGroup]
              if (!groupMembers || groupMembers.length === 0) return null

              return (
                <div key={roleGroup}>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    {roleGroup}
                    <span className="text-sm font-normal text-slate-500">({groupMembers.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupMembers.map((member) => (
                      <OrgChartCard
                        key={member.id}
                        member={member}
                        onViewProfile={handleViewProfile}
                        onSendMessage={handleSendMessage}
                        onClientClick={handleClientClick}
                        isExpanded={expandedCards.has(member.id)}
                        onToggleExpand={() => toggleExpand(member.id)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="glass-card p-4 shadow-sm border-slate-200">
        <h4 className="text-sm font-medium text-slate-600 mb-3">Legend</h4>
        <div className="flex flex-wrap gap-6">
          {/* Departments */}
          <div>
            <p className="text-xs text-slate-400 mb-2">Departments</p>
            <div className="flex flex-wrap gap-2">
              {departments.slice(0, 6).map((dept) => {
                const deptInfo = getDepartmentInfo(dept)
                return (
                  <span
                    key={dept}
                    className={`px-2 py-1 text-xs rounded ${deptInfo.bgColor} ${deptInfo.color}`}
                  >
                    {dept}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Work Types */}
          <div>
            <p className="text-xs text-slate-400 mb-2">Work Types</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(WORK_TYPE_LABELS).slice(0, 4).map(([key, info]) => (
                <span
                  key={key}
                  className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200"
                  title={info.description}
                >
                  {info.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {profileUserId && (
        <OrgChartProfileModal
          userId={profileUserId}
          onClose={() => setProfileUserId(null)}
          onSendMessage={handleSendMessage}
          onClientClick={handleClientClick}
        />
      )}
    </div>
  )
}
