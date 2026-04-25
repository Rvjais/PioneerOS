import prisma from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { DirectoryClient } from './DirectoryClient'

async function getEmployees() {
  return prisma.user.findMany({
    include: { profile: true },
    orderBy: [{ department: 'asc' }, { firstName: 'asc' }]
  })
}

export default async function DirectoryPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const employees = await getEmployees()

  return (
    <DirectoryClient
      employees={employees.map(emp => ({
        id: emp.id,
        empId: emp.empId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        phone: emp.phone,
        role: emp.role,
        department: emp.department,
        employeeType: emp.employeeType,
        profilePicture: emp.profile?.profilePicture || null,
        profile: emp.profile ? { ndaSigned: emp.profile.ndaSigned } : null,
      }))}
    />
  )
}
