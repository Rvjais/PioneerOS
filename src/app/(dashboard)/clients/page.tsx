import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { ClientsClient } from './ClientsClient'
import { calculateHealthScore } from '@/server/services/clientIntegrity'

async function getClients(userId: string, isManagerOrAdmin: boolean) {
  // Managers and admins see all clients
  // Regular employees only see clients they are assigned to
  const whereClause = isManagerOrAdmin
    ? { parentClientId: null }
    : {
        parentClientId: null,
        teamMembers: { some: { userId } }
      }

  return prisma.client.findMany({
    where: whereClause,
    include: {
      teamMembers: {
        include: {
          user: {
            include: {
              profile: { select: { profilePicture: true } }
            }
          }
        }
      },
      subClients: {
        select: {
          id: true,
          name: true,
          brandName: true,
          logoUrl: true,
          tier: true,
          industry: true,
          status: true,
          paymentStatus: true,
          healthScore: true,
          healthStatus: true,
          clientSegment: true,
          teamMembers: {
            include: {
              user: {
                include: {
                  profile: { select: { profilePicture: true } }
                }
              }
            }
          },
          _count: { select: { tasks: true, meetings: true } }
        }
      },
      _count: { select: { tasks: true, meetings: true } }
    },
    orderBy: { name: 'asc' }
  })
}

export default async function ClientsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // HR department should not access client list - they only handle employee feedback
  const userRole = session.user?.role as string
  const userDepartment = session.user?.department as string
  const userId = session.user.id

  if (userDepartment === 'HR' && userRole !== 'SUPER_ADMIN' && userRole !== 'MANAGER') {
    redirect('/hr')
  }

  // OM (OPERATIONS_HEAD or OPERATIONS department) should see all clients like managers
  const isManagerOrAdmin = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'ACCOUNTS'].includes(userRole) || ['OPERATIONS', 'ACCOUNTS'].includes(userDepartment)
  let clients = await getClients(userId, isManagerOrAdmin)

  // Calculate health scores for clients that don't have them (lazy calculation)
  // This ensures health scores are populated even if the cron job hasn't run
  const clientsWithMissingScores = clients.filter(c => c.healthScore === null && c.status === 'ACTIVE')
  if (clientsWithMissingScores.length > 0) {
    // Calculate in parallel (batch of 10 to avoid overwhelming the DB)
    const batches: typeof clientsWithMissingScores[] = []
    for (let i = 0; i < clientsWithMissingScores.length; i += 10) {
      batches.push(clientsWithMissingScores.slice(i, i + 10))
    }
    for (const batch of batches) {
      await Promise.all(batch.map(c => calculateHealthScore(c.id).catch(() => {})))
    }
    // Refetch clients to get updated health scores
    clients = await getClients(userId, isManagerOrAdmin)
  }

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'ACTIVE').length,
    healthy: clients.filter(c => c.healthStatus === 'HEALTHY').length,
    atRisk: clients.filter(c => c.healthStatus === 'AT_RISK').length,
  }

  // Serialize clients for client component
  const serializedClients = clients.map(c => ({
    ...c,
    subClients: c.subClients || [],
  }))

  return <ClientsClient clients={serializedClients} stats={stats} />
}
