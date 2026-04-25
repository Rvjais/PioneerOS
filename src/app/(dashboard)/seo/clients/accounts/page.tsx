import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { SeoClientsClient } from './SeoClientsClient'

async function getAssignedClients(userId: string, isManager: boolean) {
  if (isManager) {
    // Managers can see all SEO clients
    return prisma.client.findMany({
      where: {
        status: 'ACTIVE',
        teamMembers: {
          some: {
            role: { in: ['SEO_SPECIALIST', 'ACCOUNT_MANAGER'] }
          }
        }
      },
      include: {
        teamMembers: {
          where: {
            role: { in: ['SEO_SPECIALIST', 'ACCOUNT_MANAGER'] }
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

  // Regular users only see their assigned clients
  return prisma.client.findMany({
    where: {
      status: 'ACTIVE',
      teamMembers: {
        some: {
          userId: userId,
          role: { in: ['SEO_SPECIALIST', 'ACCOUNT_MANAGER'] }
        }
      }
    },
    include: {
      teamMembers: {
        where: {
          role: { in: ['SEO_SPECIALIST', 'ACCOUNT_MANAGER'] }
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

export default async function SeoClientAccountsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id
  const userRole = session.user.role as string
  const userDept = session.user.department as string

  // Only SEO department or managers can access
  if (userDept !== 'SEO' && !['SUPER_ADMIN', 'MANAGER'].includes(userRole)) {
    redirect('/')
  }

  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(userRole)
  const clients = await getAssignedClients(userId, isManager)

  // Transform for client component
  const clientsData = clients.map(c => ({
    id: c.id,
    name: c.name,
    industry: c.industry || 'Healthcare',
    tier: c.tier,
    status: c.status,
    healthScore: c.healthScore || 0,
    seoExecutive: c.teamMembers.find(tm => tm.role === 'SEO_SPECIALIST')?.user
      ? `${c.teamMembers.find(tm => tm.role === 'SEO_SPECIALIST')?.user.firstName} ${c.teamMembers.find(tm => tm.role === 'SEO_SPECIALIST')?.user.lastName || ''}`.trim()
      : 'Unassigned',
    accountManager: c.teamMembers.find(tm => tm.role === 'ACCOUNT_MANAGER')?.user
      ? `${c.teamMembers.find(tm => tm.role === 'ACCOUNT_MANAGER')?.user.firstName} ${c.teamMembers.find(tm => tm.role === 'ACCOUNT_MANAGER')?.user.lastName || ''}`.trim()
      : 'Unassigned',
  }))

  return <SeoClientsClient clients={clientsData} isManager={isManager} />
}
