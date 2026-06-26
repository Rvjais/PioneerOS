import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async (req, { user }) => {
  const tickets = await prisma.supportTicket.findMany({
    where: { assignedToId: user.role === 'SUPER_ADMIN' ? undefined : user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const mapped = tickets.map(t => ({
    id: t.ticketNumber,
    title: t.title,
    status: t.status.toLowerCase(),
    priority: t.priority.toLowerCase(),
    createdAt: t.createdAt.toISOString(),
  }))

  return NextResponse.json({ tickets: mapped })
})

export const POST = withAuth(async (req, { user }) => {
  const body = await req.json()
  const { title, description, priority = 'MEDIUM', type = 'REQUEST' } = body

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const ticketNumber = `TKT-${Date.now()}`
  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber,
      title,
      description: description || '',
      type,
      priority: priority.toUpperCase(),
      status: 'OPEN',
      clientId: body.clientId || (await getDefaultClient()),
      assignedToId: user.id,
    },
  })

  const ticketData = { ...ticket, id: ticket.ticketNumber }
  return NextResponse.json({ ticket: ticketData }, { status: 201 })
})

async function getDefaultClient(): Promise<string> {
  const existing = await prisma.client.findFirst({ where: { name: 'Internal' } })
  if (existing) return existing.id
  const created = await prisma.client.create({ data: { name: 'Internal', status: 'ACTIVE', clientType: 'INTERNAL', entityType: 'BRANDING_PIONEERS' } })
  return created.id
}
