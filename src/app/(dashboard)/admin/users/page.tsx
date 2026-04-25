import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserManagementClient } from './UserManagementClient'
import { Suspense } from 'react'

async function getUsers(departmentFilter?: string) {
  const where = departmentFilter ? { department: departmentFilter } : {}
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
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 mt-1">Manage all users and their roles</p>
        </div>
        <Link
          href="/employee-onboarding"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {Object.entries(usersByRole).map(([role, roleUsers]) => (
          <div key={role} className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-2xl font-bold text-white">{roleUsers.length}</p>
            <p className="text-xs text-slate-400 uppercase">{role.replace(/_/g, ' ')}</p>
          </div>
        ))}
      </div>

      {/* User Management Client Component */}
      <UserManagementClient users={users} />
    </div>
  )
}
