import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { AdsClientsClient } from './AdsClientsClient'

async function getAssignedClients(userId: string, isManager: boolean) {
  if (isManager) {
    return prisma.client.findMany({
      where: {
        status: 'ACTIVE',
        teamMembers: {
          some: {
            role: { in: ['ADS_SPECIALIST', 'ACCOUNT_MANAGER'] }
          }
        }
      },
      include: {
        teamMembers: {
          where: {
            role: { in: ['ADS_SPECIALIST', 'ACCOUNT_MANAGER'] }
          },
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })
  }

  return prisma.client.findMany({
    where: {
      status: 'ACTIVE',
      teamMembers: {
        some: {
          userId: userId,
          role: { in: ['ADS_SPECIALIST', 'ACCOUNT_MANAGER'] }
        }
      }
    },
    include: {
      teamMembers: {
        where: {
          role: { in: ['ADS_SPECIALIST', 'ACCOUNT_MANAGER'] }
        },
        include: {
          user: {
            select: { firstName: true, lastName: true }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export default async function AdsClientAccountsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id
  const userRole = session.user.role as string
  const userDept = session.user.department as string

  // Only Ads department or managers can access
  if (userDept !== 'ADS' && !['SUPER_ADMIN', 'MANAGER'].includes(userRole)) {
    redirect('/')
  }

  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(userRole)
  const clients = await getAssignedClients(userId, isManager)

  const clientsData = clients.map(c => ({
    id: c.id,
    name: c.name,
    industry: c.industry || 'Healthcare',
    tier: c.tier,
    status: c.status,
    healthScore: c.healthScore || 0,
    adsSpecialist: c.teamMembers.find(tm => tm.role === 'ADS_SPECIALIST')?.user
      ? `${c.teamMembers.find(tm => tm.role === 'ADS_SPECIALIST')?.user.firstName} ${c.teamMembers.find(tm => tm.role === 'ADS_SPECIALIST')?.user.lastName || ''}`.trim()
      : 'Unassigned',
  }))

  return <AdsClientsClient clients={clientsData} isManager={isManager} />
}
