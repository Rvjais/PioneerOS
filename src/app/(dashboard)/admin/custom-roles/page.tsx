import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { CustomRolesClient } from './CustomRolesClient'

export default async function CustomRolesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Only super admins can access this page
  if (session.user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard')
  }

  // Fetch custom roles
  const customRoles = await prisma.customRole.findMany({
    include: {
      userAssignments: {
        include: {
          user: {
            select: {
              id: true,
              empId: true,
              firstName: true,
              lastName: true,
              department: true,
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Fetch all users for assignment
  const users = await prisma.user.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      empId: true,
      firstName: true,
      lastName: true,
      department: true,
      role: true,
    },
    orderBy: { firstName: 'asc' },
  })

  // Serialize data
  const serializedRoles = customRoles.map(r => ({
    id: r.id,
    name: r.name,
    displayName: r.displayName,
    baseRoles: JSON.parse(r.baseRoles || '[]'),
    departments: JSON.parse(r.departments || '[]'),
    permissions: r.permissions ? JSON.parse(r.permissions) : null,
    isActive: r.isActive,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    userAssignments: r.userAssignments.map(a => ({
      id: a.id,
      userId: a.userId,
      user: a.user,
      assignedAt: a.assignedAt.toISOString(),
    })),
  }))

  return (
    <CustomRolesClient
      initialRoles={serializedRoles}
      users={users}
    />
  )
}
