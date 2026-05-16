import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async () => {
  const clients = await prisma.client.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      status: true,
      healthScore: true,
      healthStatus: true,
      paymentStatus: true,
      paymentDueDay: true,
      monthlyFee: true,
      tier: true,
      pendingAmount: true,
      lifecycleStage: true,
      operationsLogs: {
        orderBy: { date: 'desc' },
        take: 1,
        select: { npsScore: true, date: true },
      },
      whatsAppGroups: {
        where: { isActive: true },
        select: { id: true, name: true, groupType: true, joinLink: true, isActive: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  const mapped = clients.map(c => ({
    id: c.id,
    name: c.name,
    healthScore: c.healthScore,
    healthStatus: c.healthStatus || 'GREEN',
    paymentStatus: c.paymentStatus || 'PENDING',
    paymentDueDay: c.paymentDueDay,
    monthlyFee: c.monthlyFee,
    tier: c.tier,
    pendingAmount: c.pendingAmount,
    npsScore: c.operationsLogs[0]?.npsScore ?? null,
    lastNpsDate: c.operationsLogs[0]?.date.toISOString() ?? null,
    whatsAppGroups: c.whatsAppGroups,
  }))

  return NextResponse.json({ clients: mapped })
})