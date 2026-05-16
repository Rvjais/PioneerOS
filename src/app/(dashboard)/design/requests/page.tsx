import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { DesignRequestsClient } from './DesignRequestsClient'
import { Suspense } from 'react'

export const metadata = {
  title: 'Design Requests | PioneerOS',
  description: 'View and manage creative design requests.',
}

function parseSpecs(specs: string | null): Record<string, unknown> {
  if (!specs) return {}
  try { return JSON.parse(specs) } catch { return { designType: specs } }
}

export default async function DesignRequestsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = session.user
  const isAdmin = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'OM'].includes(user.role as string)

  // Fetch all CREATIVE type approvals
  const rawRequests = await prisma.contentApproval.findMany({
    where: { type: 'CREATIVE' },
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      client: { select: { id: true, name: true } },
    },
  })

  // Gather all user IDs for bulk fetch
  const userIds = new Set<string>()
  rawRequests.forEach((r) => {
    if (r.createdById) userIds.add(r.createdById)
    const specs = parseSpecs(r.specifications)
    if (specs.assignedDesignerId) userIds.add(specs.assignedDesignerId as string)
  })

  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(userIds) } },
    select: { id: true, firstName: true, lastName: true, department: true, role: true },
  })
  const usersMap = Object.fromEntries(users.map((u) => [u.id, u]))

  // Fetch all DESIGN dept employees for the assign dropdown
  const designTeam = await prisma.user.findMany({
    where: {
      status: { in: ['ACTIVE', 'PROBATION'] },
      OR: [
        { department: 'DESIGN' },
        { role: { in: ['DESIGNER', 'DESIGN_LEAD'] } },
      ],
    },
    select: { id: true, firstName: true, lastName: true, role: true },
    orderBy: { firstName: 'asc' },
  })

  // Map requests
  const mapped = rawRequests.map((r) => {
    const specs = parseSpecs(r.specifications)
    const requester = r.createdById ? usersMap[r.createdById] : null
    const designer = specs.assignedDesignerId ? usersMap[specs.assignedDesignerId as string] : null
    return {
      id: r.id,
      title: r.title,
      description: r.description ?? null,
      status: r.status,
      priority: r.priority,
      dueDate: r.dueDate?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
      clientId: r.client?.id ?? null,
      clientName: r.client?.name ?? null,
      designType: (specs.designType as string) ?? null,
      referenceUrls: (specs.referenceUrls as string[]) ?? [],
      contentUrl: r.contentUrl ?? null,
      reviewNote: r.reviewNote ?? null,
      assignedDesignerId: (specs.assignedDesignerId as string) ?? null,
      assignedDesignerName: designer
        ? `${designer.firstName} ${designer.lastName ?? ''}`.trim()
        : null,
      requestedById: r.createdById,
      requestedByName: requester
        ? `${requester.firstName} ${requester.lastName ?? ''}`.trim()
        : 'Unknown',
    }
  })

  // If non-admin, filter to only their relevant requests
  const filtered = isAdmin
    ? mapped
    : mapped.filter(
        (r) => r.assignedDesignerId === user.id || r.requestedById === user.id
      )

  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-medium">Loading design requests...</div>}>
      <DesignRequestsClient
        requests={filtered}
        designTeam={designTeam.map((u) => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName ?? ''}`.trim(),
          role: u.role,
        }))}
        currentUserId={user.id as string}
        currentUserRole={user.role as string}
        isAdmin={isAdmin}
      />
    </Suspense>
  )
}
