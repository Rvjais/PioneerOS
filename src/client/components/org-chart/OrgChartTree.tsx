'use client'

import React, { useState } from 'react'
import OrgChartCard from './OrgChartCard'
import { getDepartmentInfo, getRoleLevel } from '@/shared/constants/roleDefinitions'

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

interface OrgChartTreeProps {
  members: OrgChartMember[]
  onViewProfile: (userId: string) => void
  onSendMessage: (userId: string) => void
  onClientClick?: (clientId: string) => void
  selectedDepartment?: string
}

// Leadership configuration
const FOUNDERS = [
  { name: 'Arush', departments: ['WEB', 'SEO', 'AI'] },
  { name: 'Nishu', departments: ['SOCIAL', 'ADS'] },
]

const MANAGERS = [
  { firstName: 'Himanshu', title: 'Operations Head', departments: ['OPERATIONS'] },
  { firstName: 'Manish', title: 'Team Lead', departments: ['WEB'] },
]

export default function OrgChartTree({
  members,
  onViewProfile,
  onSendMessage,
  onClientClick,
  selectedDepartment = 'All',
}: OrgChartTreeProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

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

  // Filter members by department if selected
  const filteredMembers = selectedDepartment === 'All'
    ? members
    : members.filter((m) => m.department === selectedDepartment)

  // Separate members by level
  const founders = filteredMembers.filter((m) => m.role === 'SUPER_ADMIN')
  const managers = filteredMembers.filter((m) => m.role === 'MANAGER' || m.role === 'OM')
  const employees = filteredMembers.filter((m) => getRoleLevel(m.role) >= 3)

  // Group employees by department
  const employeesByDept: Record<string, OrgChartMember[]> = {}
  employees.forEach((emp) => {
    if (!employeesByDept[emp.department]) {
      employeesByDept[emp.department] = []
    }
    employeesByDept[emp.department].push(emp)
  })

  // Get departments with employees
  const departmentsWithEmployees = Object.keys(employeesByDept).sort()

  if (filteredMembers.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        No team members found for this department.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Level 1: Founders */}
      {founders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Leadership</h3>
            <span className="text-sm text-slate-500">({founders.length})</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {founders.map((founder) => {
              const founderConfig = FOUNDERS.find((f) =>
                founder.firstName.toLowerCase().includes(f.name.toLowerCase())
              )
              return (
                <div key={founder.id} className="flex flex-col items-center">
                  <div className="w-64">
                    <OrgChartCard
                      member={founder}
                      onViewProfile={onViewProfile}
                      onSendMessage={onSendMessage}
                      onClientClick={onClientClick}
                      isExpanded={expandedCards.has(founder.id)}
                      onToggleExpand={() => toggleExpand(founder.id)}
                    />
                  </div>
                  {founderConfig && (
                    <div className="mt-2 flex flex-wrap justify-center gap-1">
                      {founderConfig.departments.map((dept) => {
                        const deptInfo = getDepartmentInfo(dept)
                        return (
                          <span
                            key={dept}
                            className={`px-2 py-0.5 text-xs rounded ${deptInfo.bgColor} ${deptInfo.color}`}
                          >
                            {dept}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Connector Line */}
      {founders.length > 0 && managers.length > 0 && (
        <div className="flex justify-center">
          <div className="w-0.5 h-8 bg-slate-300"></div>
        </div>
      )}

      {/* Level 2: Managers */}
      {managers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Department Heads</h3>
            <span className="text-sm text-slate-500">({managers.length})</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {managers.map((manager) => {
              const managerConfig = MANAGERS.find((m) =>
                manager.firstName.toLowerCase().includes(m.firstName.toLowerCase())
              )
              return (
                <div key={manager.id} className="flex flex-col items-center">
                  <div className="w-64">
                    <OrgChartCard
                      member={manager}
                      onViewProfile={onViewProfile}
                      onSendMessage={onSendMessage}
                      onClientClick={onClientClick}
                      isExpanded={expandedCards.has(manager.id)}
                      onToggleExpand={() => toggleExpand(manager.id)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Connector Line */}
      {(founders.length > 0 || managers.length > 0) && departmentsWithEmployees.length > 0 && (
        <div className="flex justify-center">
          <div className="w-0.5 h-8 bg-slate-300"></div>
        </div>
      )}

      {/* Level 3: Team Members by Department */}
      {departmentsWithEmployees.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Team Members</h3>
            <span className="text-sm text-slate-500">({employees.length})</span>
          </div>

          <div className="grid gap-6">
            {departmentsWithEmployees.map((dept) => {
              const deptInfo = getDepartmentInfo(dept)
              const deptMembers = employeesByDept[dept]

              return (
                <div
                  key={dept}
                  className={`rounded-xl border p-4 ${deptInfo.bgColor} ${deptInfo.borderColor}`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className={`font-semibold ${deptInfo.color}`}>{deptInfo.label}</h4>
                    <span className="text-sm text-slate-500 opacity-75">({deptMembers.length})</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {deptMembers.map((member) => (
                      <OrgChartCard
                        key={member.id}
                        member={member}
                        onViewProfile={onViewProfile}
                        onSendMessage={onSendMessage}
                        onClientClick={onClientClick}
                        isCompact
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
