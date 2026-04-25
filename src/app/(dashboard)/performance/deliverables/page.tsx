import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { DeliverablesClient } from './DeliverablesClient'

async function getDeliverables(userId: string, isManager: boolean) {
  const currentMonth = new Date()
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

  const whereClause: Record<string, unknown> = {
    month: { gte: monthStart, lte: monthEnd },
  }

  if (!isManager) {
    whereClause.userId = userId
  }

  return prisma.workDeliverable.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          department: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

async function getStats(userId: string) {
  const currentMonth = new Date()
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

  const deliverables = await prisma.workDeliverable.aggregate({
    where: {
      userId,
      month: { gte: monthStart, lte: monthEnd },
      status: 'COMPLETED',
    },
    _sum: {
      quantity: true,
      totalValue: true,
    },
    _count: true,
  })

  return {
    totalDeliverables: deliverables._count || 0,
    totalQuantity: deliverables._sum.quantity || 0,
    totalValue: deliverables._sum.totalValue || 0,
  }
}

async function getClients() {
  return prisma.client.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  })
}

export default async function DeliverablesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(session.user.role)
  const [deliverables, stats, clients] = await Promise.all([
    getDeliverables(session.user.id, isManager),
    getStats(session.user.id),
    getClients(),
  ])

  const serializedDeliverables = deliverables.map(d => ({
    ...d,
    month: d.month.toISOString(),
    createdAt: d.createdAt.toISOString(),
    approvedAt: d.approvedAt?.toISOString() || null,
  }))

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Work Deliverables</h1>
          <p className="text-slate-400 mt-1">Track your work output and incentives</p>
        </div>
      </div>

      <DeliverablesClient
        deliverables={serializedDeliverables}
        stats={stats}
        clients={clients}
        userId={session.user.id}
        isManager={isManager}
      />
    </div>
  )
}
