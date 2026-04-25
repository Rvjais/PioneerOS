import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { checkClientAccess } from '@/server/services/clientAccess'
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

// POST - Team fills survey on behalf of client
export const POST = withAuth(
  async (req: NextRequest, { user, params }) => {
    try {
      const clientId = params?.clientId
      if (!clientId) {
        return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
      }

      const access = await checkClientAccess(user, clientId)
      if (!access.canView) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      const body = await req.json()
      const validation = surveySchema.safeParse(body)

      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
          { status: 400 }
        )
      }

      const {
        overallSatisfaction,
        communicationRating,
        deliveryRating,
        valueRating,
        feedback,
        improvements,
      } = validation.data

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
            clientId,
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
          collectedBy: `TEAM_${user.empId || user.id}`,
          collectedAt: new Date(),
        },
        create: {
          clientId,
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
          collectedBy: `TEAM_${user.empId || user.id}`,
        },
      })

      // Notify account manager
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { name: true, accountManagerId: true },
      })

      if (client?.accountManagerId && client.accountManagerId !== user.id) {
        const avgRating = (overallSatisfaction + communicationRating + deliveryRating + valueRating) / 4
        await prisma.notification.create({
          data: {
            userId: client.accountManagerId,
            title: 'Client Survey Recorded by Team',
            message: `${user.firstName || 'Team member'} recorded survey for ${client.name} (avg: ${avgRating.toFixed(1)}/5, NPS: ${npsCategory})`,
            type: 'NOTIFICATION',
            priority: avgRating < 2.5 ? 'HIGH' : avgRating < 3.5 ? 'MEDIUM' : 'NORMAL',
            link: `/clients/${clientId}`,
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
    } catch (error) {
      console.error('Client survey POST error:', error)
      return NextResponse.json({ error: 'Failed to submit survey' }, { status: 500 })
    }
  }
)

// GET - Return survey history for client (last 12 months)
export const GET = withAuth(
  async (req: NextRequest, { user, params }) => {
    try {
      const clientId = params?.clientId
      if (!clientId) {
        return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
      }

      const access = await checkClientAccess(user, clientId)
      if (!access.canView) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      const twelveMonthsAgo = new Date()
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
      twelveMonthsAgo.setDate(1)
      twelveMonthsAgo.setHours(0, 0, 0, 0)

      const surveys = await prisma.clientFeedback.findMany({
        where: {
          clientId,
          month: { gte: twelveMonthsAgo },
        },
        orderBy: { month: 'desc' },
      })

      return NextResponse.json({
        surveys: surveys.map((s) => ({
          ...s,
          collectedAt: s.collectedAt.toISOString(),
          month: s.month.toISOString(),
        })),
      })
    } catch (error) {
      console.error('Client survey GET error:', error)
      return NextResponse.json({ error: 'Failed to fetch surveys' }, { status: 500 })
    }
  }
)
