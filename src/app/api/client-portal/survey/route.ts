import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { z } from 'zod'

const surveySchema = z.object({
  overallSatisfaction: z.number().int().min(1).max(5),
  communicationRating: z.number().int().min(1).max(5),
  deliveryRating: z.number().int().min(1).max(5),
  valueRating: z.number().int().min(1).max(5),
  feedback: z.string().max(2000).optional().nullable(),
  improvements: z.string().max(2000).optional().nullable(),
})

function calculateNps(overallSatisfaction: number) {
  let npsCategory: string
  if (overallSatisfaction >= 4) {
    npsCategory = 'PROMOTER'
  } else if (overallSatisfaction === 3) {
    npsCategory = 'PASSIVE'
  } else {
    npsCategory = 'DETRACTOR'
  }
  const npsScore = (overallSatisfaction - 3) * 50
  return { npsScore, npsCategory }
}

function calculateChurnRisk(ratings: number[]) {
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
  if (avg < 2.5) return 'HIGH'
  if (avg < 3.5) return 'MEDIUM'
  return 'LOW'
}

// GET - Check if current month's survey exists
export const GET = withClientAuth(async (req, { user }) => {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const survey = await prisma.clientFeedback.findUnique({
    where: {
      clientId_month: {
        clientId: user.clientId,
        month: monthStart,
      },
    },
  })

  return NextResponse.json({
    hasPendingSurvey: !survey,
    survey: survey
      ? {
          ...survey,
          collectedAt: survey.collectedAt.toISOString(),
          month: survey.month.toISOString(),
        }
      : null,
  })
}, { rateLimit: 'READ' })

// POST - Submit monthly survey
export const POST = withClientAuth(async (req, { user }) => {
  const body = await req.json()
  const validation = surveySchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { overallSatisfaction, communicationRating, deliveryRating, valueRating, feedback, improvements } =
    validation.data

  const { npsScore, npsCategory } = calculateNps(overallSatisfaction)
  const churnRisk = calculateChurnRisk([
    overallSatisfaction,
    communicationRating,
    deliveryRating,
    valueRating,
  ])

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const survey = await prisma.clientFeedback.upsert({
    where: {
      clientId_month: {
        clientId: user.clientId,
        month: monthStart,
      },
    },
    update: {
      overallSatisfaction,
      communicationRating,
      deliveryRating,
      valueRating,
      feedback: feedback || null,
      improvements: improvements || null,
      npsScore,
      npsCategory,
      churnRisk,
      collectedBy: 'CLIENT_PORTAL',
      collectedAt: new Date(),
    },
    create: {
      clientId: user.clientId,
      month: monthStart,
      overallSatisfaction,
      communicationRating,
      deliveryRating,
      valueRating,
      feedback: feedback || null,
      improvements: improvements || null,
      npsScore,
      npsCategory,
      churnRisk,
      collectedBy: 'CLIENT_PORTAL',
    },
  })

  // Create notification for account manager - need to fetch it
  const client = await prisma.client.findUnique({
    where: { id: user.clientId },
    select: { name: true, accountManagerId: true },
  })

  if (client?.accountManagerId) {
    const avgRating = (overallSatisfaction + communicationRating + deliveryRating + valueRating) / 4
    await prisma.notification.create({
      data: {
        userId: client.accountManagerId,
        title: 'Monthly Client Survey Submitted',
        message: `${client.name} submitted their monthly survey (avg: ${avgRating.toFixed(1)}/5, NPS: ${npsCategory})`,
        type: 'NOTIFICATION',
        priority: avgRating < 2.5 ? 'HIGH' : avgRating < 3.5 ? 'MEDIUM' : 'NORMAL',
        link: `/clients/${user.clientId}`,
      },
    })
  }

  return NextResponse.json({
    success: true,
    survey: {
      ...survey,
      collectedAt: survey.collectedAt.toISOString(),
      month: survey.month.toISOString(),
    },
  })
}, { rateLimit: 'WRITE' })
