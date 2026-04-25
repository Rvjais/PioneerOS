import { NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'
import { generateTicketNumber } from '@/server/db/sequence'
import { z } from 'zod'

const createTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(1, 'Message is required').max(5000),
})

// Create a new support ticket
export const POST = withClientAuth(async (req, { user }) => {
  const body = await req.json()
  const parsed = createTicketSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const { subject, message } = parsed.data

  // Generate ticket number atomically (prevents race conditions)
  const ticketNumber = await generateTicketNumber()

  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber,
      clientId: user.clientId,
      clientUserId: user.id,
      title: subject,
      description: message,
      status: 'OPEN',
      priority: 'MEDIUM',
      type: 'REQUEST',
    },
  })

  return NextResponse.json({ ticket }, { status: 201 })
}, { rateLimit: 'WRITE' })

// Get tickets for client
export const GET = withClientAuth(async (req, { user }) => {
  const tickets = await prisma.supportTicket.findMany({
    where: { clientUserId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ tickets })
}, { rateLimit: 'READ' })
