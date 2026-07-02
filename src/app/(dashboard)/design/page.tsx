import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { DesignClient } from './DesignClient'

export const metadata = {
  title: 'Design Dashboard | PioneerOS',
  description: 'Manage creative requests and design workflows.',
}

function parseSpecs(specs: string | null): Record<string, unknown> {
  if (!specs) return {}
  try { return JSON.parse(specs) } catch { return { designType: specs } }
}

export default async function DesignDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = session.user
  const isAdmin = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(user.role as string)

  // Fetch creative requests for dashboard stats and recent list
  const requests = await prisma.contentApproval.findMany({
    where: { type: 'CREATIVE' },
    orderBy: { createdAt: 'desc' },
    take: 100, // Enough for stats
    include: {
      client: { select: { id: true, name: true } },
    },
  })

  // Basic stats
  const stats = {
    total: requests.length,
    requested: requests.filter(r => r.status === 'REQUESTED').length,
    inDesign: requests.filter(r => r.status === 'IN_DESIGN').length,
    delivered: requests.filter(r => r.status === 'DELIVERED').length,
  }

  // Recent requests mapping (top 5)
  const recentRequests = requests.slice(0, 5).map(r => {
    const specs = parseSpecs(r.specifications)
    return {
      id: r.id,
      title: r.title,
      status: r.status,
      priority: r.priority,
      dueDate: r.dueDate?.toISOString() ?? null,
      clientName: r.client?.name ?? 'No Client',
      designType: (specs.designType as string) ?? 'General',
    }
  })

  return (
    <DesignClient 
      stats={stats}
      recentRequests={recentRequests}
      isAdmin={isAdmin}
    />
  )
}
