'use client'

import { useState, useMemo } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { downloadCSV } from '@/client/utils/downloadCSV'

interface ExportEmployee {
  empId: string
  department: string
  status: string
  role: string
  joiningDate: string
}

export function ExportEmployeesButton({ employees }: { employees: ExportEmployee[] }) {
  const handleExport = () => {
    if (!employees.length) return
    const rows = employees.map(e => ({
      'Employee ID': e.empId,
      Department: e.department,
      Status: e.status,
      Role: e.role,
      'Joining Date': new Date(e.joiningDate).toLocaleDateString('en-IN'),
    }))
    downloadCSV(rows, 'employees.csv')
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export CSV
    </button>
  )
}

interface Employee {
  id: string
  empId: string
  department: string
  status: string
  role: string
  joiningDate: string
  profile?: { ndaSigned: boolean } | null
  rbcPot?: { totalAccrued: number } | null
}

const statusColors: Record<string, string> = {
  PERMANENT: 'bg-green-500/20 text-green-400',
  PROBATION: 'bg-yellow-500/20 text-yellow-400',
  PIP: 'bg-red-500/20 text-red-400',
}

const deptColors: Record<string, string> = {
  WEB: 'bg-purple-500/20 text-purple-400',
  SEO: 'bg-blue-500/20 text-blue-400',
  ADS: 'bg-orange-500/20 text-orange-400',
  SOCIAL: 'bg-pink-500/20 text-pink-400',
  HR: 'bg-green-500/20 text-green-400',
  SALES: 'bg-cyan-500/20 text-cyan-400',
  ADMIN: 'bg-slate-900/20 text-slate-400',
}

function formatDateShort(date: string | Date) {
  return formatDateDDMMYYYY(date)
}

const DEPARTMENT_TABS = ['ALL', 'WEB', 'SEO', 'ADS', 'SOCIAL', 'HR', 'ACCOUNTS', 'SALES', 'OPERATIONS'] as const

export function EmployeesListClient({ employees }: { employees: Employee[] }) {
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ column }: { column: string }) => (
    <svg className={`w-3.5 h-3.5 inline ml-1 ${sortBy === column ? 'text-white' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {sortBy === column && sortDir === 'desc'
        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      }
    </svg>
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    let result = employees
    if (deptFilter !== 'ALL') {
      result = result.filter(e => e.department === deptFilter)
    }
    if (q) {
      result = result.filter(e =>
        e.empId.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q)
      )
    }
    return [...result].sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'name':
          cmp = a.empId.localeCompare(b.empId)
          break
        case 'department':
          cmp = a.department.localeCompare(b.department)
          break
        case 'status':
          cmp = a.status.localeCompare(b.status)
          break
        default:
          cmp = 0
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [employees, search, deptFilter, sortBy, sortDir])

  return (
    <div>
      {/* Search + Sort Controls */}
      <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center gap-3">
        <h3 className="font-semibold text-white">Team Members</h3>
        <div className="flex-1" />
        <input
          type="text"
          placeholder="Search by ID, department, or role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-72 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Department Filter Tabs */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 flex-wrap">
        {DEPARTMENT_TABS.map(dept => (
          <button
            key={dept}
            onClick={() => setDeptFilter(dept)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              deptFilter === dept
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Sortable Column Headers */}
      <div className="hidden sm:grid grid-cols-[1fr_auto] px-4 py-2 bg-white/5 border-b border-white/10">
        <div className="flex gap-6 text-xs font-medium text-slate-400 uppercase">
          <button onClick={() => toggleSort('name')} className="hover:text-white transition-colors">
            Name / ID <SortIcon column="name" />
          </button>
          <button onClick={() => toggleSort('department')} className="hover:text-white transition-colors">
            Department <SortIcon column="department" />
          </button>
          <button onClick={() => toggleSort('status')} className="hover:text-white transition-colors">
            Status <SortIcon column="status" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {search || deptFilter !== 'ALL' ? 'No Matching Employees' : 'No Employees Found'}
          </h3>
          <p className="text-sm text-slate-400">
            {search
              ? `No results found for "${search}"${deptFilter !== 'ALL' ? ` in ${deptFilter}` : ''}. Try adjusting your search terms.`
              : deptFilter !== 'ALL'
                ? `No employees found in the ${deptFilter} department.`
                : 'Employees will appear here once added to the system.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
          {filtered.map((employee) => (
            <div key={employee.id} className="p-4 hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      {employee.empId.slice(-2)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{employee.empId}</p>
                      {!employee.profile?.ndaSigned && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                          NDA Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      Joined {formatDateShort(employee.joiningDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs ${deptColors[employee.department] || 'bg-slate-900/20 text-slate-400'}`}>
                    {employee.department}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[employee.status] || 'bg-slate-900/20 text-slate-400'}`}>
                    {employee.status}
                  </span>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-slate-400">Role</p>
                    <p className="text-sm text-white">{employee.role}</p>
                  </div>
                  {employee.rbcPot && (
                    <div className="text-right hidden md:block">
                      <p className="text-sm text-slate-400">RBC Pot</p>
                      <p className="text-sm text-green-400">
                        ₹{employee.rbcPot.totalAccrued.toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
