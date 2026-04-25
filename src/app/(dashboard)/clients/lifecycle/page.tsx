import { prisma } from '@/server/db/prisma'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { LifecycleClient } from './LifecycleClient'

async function getClientsWithLifecycle(userId: string, canSeeAllClients: boolean) {
  // Only show non-churned clients, filter by assignment for non-admins
  const whereClause: Prisma.ClientWhereInput = canSeeAllClients
    ? { status: { not: 'CHURNED' } }
    : {
        status: { not: 'CHURNED' },
        teamMembers: {
          some: {
            userId: userId
          }
        }
      }

  const clients = await prisma.client.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      tier: true,
      monthlyFee: true,
      healthScore: true,
      lifecycleStage: true,
      contactName: true,
      updatedAt: true,
      lifecycleEvents: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return clients.map(client => {
    // Calculate days in current stage
    const lastStageChange = client.lifecycleEvents[0]?.createdAt || client.updatedAt
    const daysInStage = Math.floor((Date.now() - new Date(lastStageChange).getTime()) / (1000 * 60 * 60 * 24))

    // Map lifecycle stage - default to ACTIVE for active clients without stage
    let stage = client.lifecycleStage
    if (!stage || stage === '') {
      // Infer stage from client status/data
      stage = 'ACTIVE' // Default for active clients
    }

    return {
      id: client.id,
      name: client.name,
      tier: client.tier,
      monthlyFee: client.monthlyFee,
      healthScore: client.healthScore,
      lifecycleStage: stage,
      daysInStage,
      contactName: client.contactName,
      lastActivity: formatLastActivity(client.updatedAt),
    }
  })
}

function formatLastActivity(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours} hours ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 14) return '1 week ago'
  return `${Math.floor(days / 7)} weeks ago`
}

export default async function ClientLifecyclePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userRole = session.user.role as string
  const userDepartment = session.user.department as string
  // OM (OPERATIONS_HEAD or OPERATIONS department) sees all clients like managers
  const canSeeAllClients = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(userRole) || userDepartment === 'OPERATIONS'
  const clients = await getClientsWithLifecycle(session.user.id, canSeeAllClients)

  return <LifecycleClient clients={clients} />
}
