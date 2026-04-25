import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { CommunicationCharterClient } from './CommunicationCharterClient'
import { getAllDepartments, getCharterByDepartment, type Department } from '@/shared/constants/communicationCharter'

export default async function CommunicationCharterPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userRole = session.user.role as string
  const userDepartment = (session.user.department as string || 'OPERATIONS').toUpperCase()

  // SUPER_ADMIN and MANAGER can see all departments
  const canViewAll = ['SUPER_ADMIN', 'MANAGER'].includes(userRole)

  // Get user's department charter (or default to OPERATIONS)
  const defaultDepartment = getAllDepartments().includes(userDepartment as Department)
    ? userDepartment as Department
    : 'OPERATIONS'

  const charter = getCharterByDepartment(defaultDepartment)
  const allDepartments = getAllDepartments()

  return (
    <CommunicationCharterClient
      initialDepartment={defaultDepartment}
      canViewAll={canViewAll}
      allDepartments={allDepartments}
      userName={session.user.name || 'User'}
    />
  )
}
