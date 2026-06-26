import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { WebBugsClient } from './WebBugsClient'

async function getBugs(userId: string, userRole: string) {
  const isManager = ['SUPER_ADMIN', 'MANAGER', 'WEB_MANAGER', 'OPERATIONS_HEAD'].includes(userRole)

  const where: Record<string, unknown> = {}
  if (!isManager) {
    where.OR = [
      { assignedToId: userId },
      { project: { client: { accountManagerId: userId } } },
    ]
  }

  const [bugs, projects, teamMembers] = await Promise.all([
    prisma.webBugReport.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            client: { select: { id: true, name: true } },
          },
        },
        User_WebBugReport_assignedToIdToUser: { select: { id: true, firstName: true, lastName: true } },
        User_WebBugReport_resolvedByIdToUser: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' },
      ],
      take: 100,
    }),
    prisma.webProject.findMany({
      where: { status: { in: ['IN_PROGRESS', 'PIPELINE', 'ON_HOLD'] } },
      select: { id: true, name: true, client: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: {
        department: 'WEB',
        status: { in: ['ACTIVE', 'PROBATION'] },
      },
      select: { id: true, firstName: true, lastName: true, role: true },
      orderBy: { firstName: 'asc' },
    }),
  ])

  const stats = {
    open: bugs.filter(b => ['OPEN', 'CONFIRMED'].includes(b.status)).length,
    critical: bugs.filter(b => b.priority === 'CRITICAL' && ['OPEN', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length,
    total: bugs.length,
  }

  // Map the long relation names to shorter ones for the client component
  const mappedBugs = bugs.map(bug => ({
    ...bug,
    createdAt: bug.createdAt.toISOString(),
    updatedAt: bug.updatedAt.toISOString(),
    resolvedAt: bug.resolvedAt?.toISOString() || null,
    assignedTo: (bug as any).User_WebBugReport_assignedToIdToUser,
    resolvedBy: (bug as any).User_WebBugReport_resolvedByIdToUser,
  }))

  const mappedTeamMembers = teamMembers.map(m => ({
    ...m,
    lastName: m.lastName || ''
  }))

  return { bugs: mappedBugs, projects, teamMembers: mappedTeamMembers, stats, isManager }
}

export default async function WebBugsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { bugs, projects, teamMembers, stats, isManager } = await getBugs(
    session.user.id,
    session.user.role as string
  )

  return (
    <WebBugsClient
      initialBugs={bugs}
      projects={projects}
      teamMembers={teamMembers}
      stats={stats}
      isManager={isManager}
      currentUserId={session.user.id}
    />
  )
}
