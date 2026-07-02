import { NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'

export const GET = withClientAuth(async (req, { user }) => {
  const tickets = await prisma.supportTicket.findMany({
    where: { clientId: user.clientId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      ticketNumber: true,
      title: true,
      status: true,
      createdAt: true,
    },
  })

  const mapped = tickets.map(t => ({
    id: t.id,
    ticketNumber: t.ticketNumber,
    subject: t.title,
    status: t.status.toLowerCase(),
    createdAt: t.createdAt.toISOString(),
  }))

  return NextResponse.json({ tickets: mapped })
})
