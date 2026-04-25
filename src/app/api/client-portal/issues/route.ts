import { NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'
import { generateIssueNumber } from '@/server/db/sequence'
import { z } from 'zod'

const createIssueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(5000),
  type: z.enum(['BUG', 'REQUEST', 'FEEDBACK', 'QUESTION']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
})

// GET - List client's issues
export const GET = withClientAuth(async (req, { user }) => {
  const issues = await prisma.supportTicket.findMany({
    where: { clientId: user.clientId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      ticketNumber: true,
      title: true,
      type: true,
      status: true,
      priority: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ issues })
}, { rateLimit: 'READ' })

// POST - Create new issue
export const POST = withClientAuth(async (req, { user }) => {
  const body = await req.json()
  const parsed = createIssueSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const { title, description, type, priority } = parsed.data

  // Generate ticket number atomically (prevents race conditions)
  const ticketNumber = await generateIssueNumber()

  const issue = await prisma.supportTicket.create({
    data: {
      ticketNumber,
      title,
      description,
      type: type || 'REQUEST',
      priority: priority || 'MEDIUM',
      status: 'OPEN',
      clientId: user.clientId,
      clientUserId: user.id,
    },
  })

  // Create activity log
  await prisma.ticketActivity.create({
    data: {
      ticketId: issue.id,
      type: 'CREATED',
      description: `Issue created by client: ${user.client.name}`,
    },
  })

  // Notify account manager if assigned
  const client = await prisma.client.findUnique({
    where: { id: user.clientId },
    select: { accountManagerId: true, name: true },
  })

  if (client?.accountManagerId) {
    await prisma.notification.create({
      data: {
        userId: client.accountManagerId,
        type: 'GENERAL',
        title: 'New Support Request',
        message: `${client.name} submitted: ${title}`,
        link: `/issues/${issue.id}`,
        priority: priority === 'HIGH' || priority === 'URGENT' ? 'HIGH' : 'NORMAL',
      },
    })
  }

  return NextResponse.json({ issue }, { status: 201 })
}, { rateLimit: 'WRITE' })
