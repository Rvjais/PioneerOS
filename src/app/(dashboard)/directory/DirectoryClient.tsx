'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { UserAvatar } from '@/client/components/ui/UserAvatar'
import PageGuide from '@/client/components/ui/PageGuide'
import DataDiscovery from '@/client/components/ui/DataDiscovery'

interface Employee {
  id: string
  empId: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string
  role: string
  department: string
  employeeType: string
  profilePicture: string | null
  profile: {
    ndaSigned?: boolean
  } | null
}

const departmentColors: Record<string, string> = {
  WEB: 'bg-blue-500/20 text-blue-400',
  SEO: 'bg-green-500/20 text-green-400',
  ADS: 'bg-purple-500/20 text-purple-400',
  SOCIAL: 'bg-pink-500/20 text-pink-400',
  HR: 'bg-yellow-500/20 text-yellow-400',
  ACCOUNTS: 'bg-orange-500/20 text-orange-400',
  SALES: 'bg-cyan-100 text-cyan-700',
  OPERATIONS: 'bg-slate-800/50 text-slate-200',
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  MASH: 'MASH Lead',
  OPS: 'Operations',
  FREELANCER: 'Freelancer',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
  INTERN: 'Intern',
}

export function DirectoryClient({ employees }: { employees: Employee[] }) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter employees based on search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) {
      return employees
    }

    const query = searchQuery.toLowerCase()
    return employees.filter(emp =>
      emp.firstName.toLowerCase().includes(query) ||
      (emp.lastName?.toLowerCase() || '').includes(query) ||
      emp.empId.toLowerCase().includes(query) ||
      (emp.email?.toLowerCase() || '').includes(query) ||
      emp.department.toLowerCase().includes(query) ||
      emp.role.toLowerCase().includes(query)
    )
  }, [employees, searchQuery])

  // Group filtered employees by department
  const byDepartment = useMemo(() => {
    return filteredEmployees.reduce((acc: Record<string, Employee[]>, emp) => {
      if (!acc[emp.department]) acc[emp.department] = []
      acc[emp.department].push(emp)
      return acc
    }, {})
  }, [filteredEmployees])

  return (
    <div className="space-y-8 pb-8">
      <PageGuide
        pageKey="directory"
        title="Team Directory"
        description="Browse and search the company team directory."
        steps={[
          { label: 'Search team members', description: 'Find colleagues by name, ID, or email' },
          { label: 'Filter by department', description: 'Narrow down results to specific departments' },
          { label: 'View profiles', description: 'Click on a team member to see their full profile' },
          { label: 'Find contact info', description: 'Quickly access phone numbers and email addresses' },
        ]}
      />
      <DataDiscovery dataType="employees" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Directory</h1>
          <p className="text-slate-400 mt-1">Find and connect with your colleagues</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-white">{filteredEmployees.length}</p>
          <p className="text-sm text-slate-400">{searchQuery ? 'Matching' : 'Total'} Team Members</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-white">{Object.keys(byDepartment).length}</p>
          <p className="text-sm text-slate-400">Departments</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-white">{filteredEmployees.filter(e => e.employeeType === 'FULL_TIME').length}</p>
          <p className="text-sm text-slate-400">Full-time</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-white">{filteredEmployees.filter(e => e.employeeType === 'FREELANCER').length}</p>
          <p className="text-sm text-slate-400">Freelancers</p>
        </div>
      </div>

      {/* Directory by Department */}
      {filteredEmployees.length === 0 ? (
        <div className="glass-card rounded-2xl border border-white/10 p-12 text-center">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-slate-400">No team members found matching &quot;{searchQuery}&quot;</p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-4 text-blue-400 hover:text-blue-400 text-sm font-medium"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byDepartment).map(([department, deptEmployees]) => (
            <div key={department} className="glass-card rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-5 border-b border-white/5 bg-slate-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${departmentColors[department] || 'bg-slate-800/50 text-slate-200'}`}>
                    {department}
                  </span>
                  <span className="text-sm text-slate-400">{deptEmployees.length} member{deptEmployees.length > 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                {deptEmployees.map((employee) => (
                  <Link
                    key={employee.id}
                    href={`/team/${employee.id}`}
                    className="flex items-center gap-4 p-4 border border-white/10 rounded-xl hover:border-blue-200 hover:shadow-none transition-all"
                  >
                    <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                      <UserAvatar
                        user={{
                          id: employee.id,
                          firstName: employee.firstName,
                          lastName: employee.lastName,
                          email: employee.email,
                          department: employee.department,
                          role: employee.role,
                          empId: employee.empId,
                          profile: { profilePicture: employee.profilePicture }
                        }}
                        size="lg"
                        showPreview={true}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate" title={`${employee.firstName} ${employee.lastName || ''}`}>
                        {employee.firstName} {employee.lastName || ''}
                      </p>
                      <p className="text-sm text-slate-400">{roleLabels[employee.role] || employee.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">{employee.empId}</span>
                        {employee.profile?.ndaSigned && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">NDA</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2" onClick={(e) => e.preventDefault()}>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `tel:${employee.phone}` }} className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors" title="Call">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </button>
                      {employee.email && (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `mailto:${employee.email}` }} className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors" title="Email">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
