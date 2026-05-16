import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserManagementClient } from './UserManagementClient'
import { Suspense } from 'react'

async function getUsers(departmentFilter?: string) {
  const where: any = { deletedAt: null }
  if (departmentFilter) where.department = departmentFilter
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      empId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      department: true,
      employeeType: true,
      status: true,
      joiningDate: true,
      createdAt: true,
      profile: {
        select: {
          profilePicture: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return users
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ department?: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  if (session.user.role !== 'SUPER_ADMIN') {
    redirect('/')
  }

  const params = await searchParams
  const departmentFilter = params.department
  const users = await getUsers(departmentFilter)

  const usersByRole = {
    SUPER_ADMIN: users.filter((u) => u.role === 'SUPER_ADMIN'),
    MANAGER: users.filter((u) => u.role === 'MANAGER'),
    EMPLOYEE: users.filter((u) => u.role === 'EMPLOYEE'),
    SALES: users.filter((u) => u.role === 'SALES'),
    ACCOUNTS: users.filter((u) => u.role === 'ACCOUNTS'),
    FREELANCER: users.filter((u) => u.role === 'FREELANCER'),
    INTERN: users.filter((u) => u.role === 'INTERN'),
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all organization users, roles, and permissions.</p>
        </div>
        <Link
          href="/employee-onboarding"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#c96442] hover:bg-[#b5563a] text-white rounded-xl shadow-sm hover:shadow-md transition-all font-bold text-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Employee
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {Object.entries(usersByRole).map(([role, roleUsers]) => (
          <div key={role} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-slate-900">{roleUsers.length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{role.replace(/_/g, ' ')}</p>
          </div>
        ))}
      </div>

      {/* User Management Client Component */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <UserManagementClient users={users} />
      </div>
    </div>
  )
}
