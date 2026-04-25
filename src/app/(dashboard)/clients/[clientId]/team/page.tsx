import prisma from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect, notFound } from 'next/navigation'
import { TeamAssignment } from './TeamAssignment'
import { Breadcrumb } from '@/client/components/ui/Breadcrumb'

async function getClient(clientId: string) {
  return prisma.client.findUnique({
    where: { id: clientId },
    include: {
      teamMembers: {
        include: { user: true },
      },
    },
  })
}

async function getAvailableUsers() {
  return prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      department: { in: ['WEB', 'SEO', 'ADS', 'SOCIAL', 'OPERATIONS'] },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      empId: true,
      department: true,
      role: true,
    },
    orderBy: { department: 'asc' },
  })
}

export default async function TeamAssignmentPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { clientId } = await params
  const [client, users] = await Promise.all([
    getClient(clientId),
    getAvailableUsers(),
  ])

  if (!client) notFound()

  return (
    <div>
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Clients', href: '/clients' },
        { label: client.name, href: `/clients/${client.id}` },
        { label: 'Team' },
      ]} />
    <TeamAssignment
      client={{
        id: client.id,
        name: client.name,
        tier: client.tier,
        status: client.status,
      }}
      currentTeam={client.teamMembers.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        isPrimary: m.isPrimary,
        user: {
          id: m.user.id,
          firstName: m.user.firstName,
          lastName: m.user.lastName || '',
          empId: m.user.empId,
          department: m.user.department,
        },
      }))}
      availableUsers={users.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName || '',
        empId: u.empId,
        department: u.department,
        role: u.role,
      }))}
    />
    </div>
  )
}
