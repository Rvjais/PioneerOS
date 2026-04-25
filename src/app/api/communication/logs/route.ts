import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const CommunicationLogSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  type: z.enum(['EMAIL', 'CALL', 'MEETING', 'CHAT', 'VIDEO_CALL', 'OTHER']),
  subject: z.string().max(200, 'Subject must be 200 characters or less').optional().nullable(),
  content: z.string().min(1, 'Content is required').max(10000, 'Content must be 10000 characters or less'),
  outcome: z.string().max(1000, 'Outcome must be 1000 characters or less').optional().nullable(),
  duration: z.number().int().min(0, 'Duration cannot be negative').max(1440, 'Duration must be 1440 minutes or less').optional().nullable(),
  actionItems: z.array(z.unknown()).optional().nullable(),
  attachments: z.array(z.unknown()).optional().nullable(),
})

// GET - List communication logs
export const GET = withAuth(async (req, { user, params }) => {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const type = searchParams.get('type')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50') || 50, 200)

  try {
    const whereClause: Record<string, unknown> = {}
    if (clientId) whereClause.clientId = clientId
    if (type) whereClause.type = type

    const logs = await prisma.communicationLog.findMany({
      where: whereClause,
      include: {
        client: { select: { id: true, name: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
        schedule: { select: { id: true, name: true, frequency: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Failed to fetch logs:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
})

// POST - Create an ad-hoc communication log (not from schedule)
export const POST = withAuth(async (req, { user, params }) => {
  try {
    const body = await req.json()
    const parseResult = CommunicationLogSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const { clientId, type, subject, content, outcome, duration, actionItems, attachments } = parseResult.data

    const log = await prisma.communicationLog.create({
      data: {
        clientId,
        userId: user.id,
        type,
        subject,
        content,
        outcome,
        duration,
        actionItems: actionItems ? JSON.stringify(actionItems) : null,
        attachments: attachments ? JSON.stringify(attachments) : null,
      },
      include: {
        client: { select: { id: true, name: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json(log)
  } catch (error) {
    console.error('Failed to create log:', error)
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 })
  }
})
