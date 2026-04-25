import { NextRequest, NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const feedbackSchema = z.object({
  type: z.enum(['GENERAL', 'SERVICE_QUALITY', 'DELIVERABLES', 'COMMUNICATION', 'SUGGESTION', 'ISSUE']),
  rating: z.number().min(1).max(5),
  message: z.string().min(1).max(2000),
})

// POST /api/client-portal/feedback - Submit feedback
export const POST = withClientAuth(async (req: NextRequest, { user }) => {
  const body = await req.json()
  const validation = feedbackSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const { type, rating, message } = validation.data

  // Fetch client details for notification
  const client = await prisma.client.findUnique({
    where: { id: user.clientId },
    select: { name: true, accountManagerId: true },
  })

  // Create feedback record
  const feedback = await prisma.clientPortalFeedback.create({
    data: {
      clientId: user.clientId,
      clientUserId: user.id,
      type,
      rating,
      message,
      status: 'PENDING',
    },
  })

  // Log activity
  await prisma.clientUserActivity.create({
    data: {
      clientUserId: user.id,
      action: 'SUBMIT_FEEDBACK',
      resource: 'Feedback',
      resourceType: 'FEEDBACK',
      details: JSON.stringify({ type, rating, feedbackId: feedback.id }),
    },
  })

  // Create portal notification for account manager if assigned
  if (client?.accountManagerId) {
    await prisma.notification.create({
      data: {
        userId: client.accountManagerId,
        title: 'New Client Feedback',
        message: `${client.name} submitted ${type.toLowerCase().replace(/_/g, ' ')} feedback (${rating}/5 stars)`,
        type: 'NOTIFICATION',
        priority: rating <= 2 ? 'HIGH' : 'MEDIUM',
      },
    })
  }

  return NextResponse.json({
    success: true,
    feedback: {
      id: feedback.id,
      type: feedback.type,
      rating: feedback.rating,
      createdAt: feedback.createdAt.toISOString(),
    },
  })
}, { rateLimit: 'WRITE' })

// GET /api/client-portal/feedback - Get client's feedback history
export const GET = withClientAuth(async (_req, { user }) => {
  const feedbacks = await prisma.clientPortalFeedback.findMany({
    where: { clientId: user.clientId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      type: true,
      rating: true,
      message: true,
      status: true,
      response: true,
      respondedAt: true,
      createdAt: true,
    },
  })

  return NextResponse.json({
    feedbacks: feedbacks.map(f => ({
      ...f,
      createdAt: f.createdAt.toISOString(),
      respondedAt: f.respondedAt?.toISOString() || null,
    })),
  })
}, { rateLimit: 'READ' })
