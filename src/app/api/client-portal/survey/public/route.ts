import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const surveySchema = z.object({
  token: z.string().min(1),
  overallSatisfaction: z.number().int().min(1).max(5),
  communicationRating: z.number().int().min(1).max(5),
  deliveryRating: z.number().int().min(1).max(5),
  valueRating: z.number().int().min(1).max(5),
  feedback: z.string().max(2000).optional().nullable(),
  improvements: z.string().max(2000).optional().nullable(),
})

async function getClientByToken(token: string) {
  // Look up client user by session token (used as survey token)
  const clientUser = await prisma.clientUser.findFirst({
    where: {
      OR: [
        { sessionToken: token },
        { id: token },
      ],
    },
    include: {
      client: { select: { id: true, name: true, accountManagerId: true } },
    },
  })

  if (clientUser?.client) {
    return { clientId: clientUser.client.id, clientName: clientUser.client.name, accountManagerId: clientUser.client.accountManagerId }
  }

  // Fallback: check if token is a client ID directly
  const client = await prisma.client.findUnique({
    where: { id: token },
    select: { id: true, name: true, accountManagerId: true },
  })

  if (client) {
    return { clientId: client.id, clientName: client.name, accountManagerId: client.accountManagerId }
  }

  return null
}

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

// GET - Validate token and return client info + survey status
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const clientData = await getClientByToken(token)
    if (!clientData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const existingSurvey = await prisma.clientFeedback.findUnique({
      where: {
        clientId_month: {
          clientId: clientData.clientId,
          month: monthStart,
        },
      },
    })

    return NextResponse.json({
      clientName: clientData.clientName,
      alreadyFilled: !!existingSurvey,
    })
  } catch (error) {
    console.error('Public survey GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Submit survey via public link
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = surveySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const {
      token,
      overallSatisfaction,
      communicationRating,
      deliveryRating,
      valueRating,
      feedback,
      improvements,
    } = validation.data

    const clientData = await getClientByToken(token)
    if (!clientData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

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
          clientId: clientData.clientId,
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
        collectedBy: 'PUBLIC_LINK',
        collectedAt: new Date(),
      },
      create: {
        clientId: clientData.clientId,
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
        collectedBy: 'PUBLIC_LINK',
      },
    })

    // Notify account manager
    if (clientData.accountManagerId) {
      const avgRating = (overallSatisfaction + communicationRating + deliveryRating + valueRating) / 4
      await prisma.notification.create({
        data: {
          userId: clientData.accountManagerId,
          title: 'Monthly Survey Submitted (Public Link)',
          message: `${clientData.clientName} submitted their monthly survey via public link (avg: ${avgRating.toFixed(1)}/5, NPS: ${npsCategory})`,
          type: 'NOTIFICATION',
          priority: avgRating < 2.5 ? 'HIGH' : avgRating < 3.5 ? 'MEDIUM' : 'NORMAL',
          link: `/clients/${clientData.clientId}`,
        },
      })
    }

    return NextResponse.json({
      success: true,
      survey: {
        id: survey.id,
        month: survey.month.toISOString(),
        npsCategory: survey.npsCategory,
      },
    })
  } catch (error) {
    console.error('Public survey POST error:', error)
    return NextResponse.json({ error: 'Failed to submit survey' }, { status: 500 })
  }
}
