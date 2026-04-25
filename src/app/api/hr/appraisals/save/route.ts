import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const AppraisalSaveSchema = z.object({
  cycleYear: z.number().int().min(2020, 'Cycle year must be 2020 or later').max(2100, 'Invalid cycle year'),
  selfRating: z.number().min(1, 'Self rating must be at least 1').max(5, 'Self rating must be at most 5').optional().nullable(),
  selfComments: z.string().max(5000, 'Self comments must be 5000 characters or less').optional().nullable(),
  goalsAchieved: z.string().max(5000, 'Goals achieved must be 5000 characters or less').optional().nullable(),
  challengesFaced: z.string().max(5000, 'Challenges faced must be 5000 characters or less').optional().nullable(),
  trainingNeeds: z.string().max(2000, 'Training needs must be 2000 characters or less').optional().nullable(),
  careerAspirations: z.string().max(2000, 'Career aspirations must be 2000 characters or less').optional().nullable(),
})

export const POST = withAuth(async (req, { user, params }) => {
  try {
// Freelancers and interns are not eligible for self-appraisals
    if (['FREELANCER', 'INTERN'].includes(user.role)) {
      return NextResponse.json({ error: 'Appraisals are for employees only' }, { status: 403 })
    }

    const rawData = await req.json()
    const parseResult = AppraisalSaveSchema.safeParse(rawData)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const { cycleYear, ...appraisalData } = parseResult.data

    // Get or create appraisal
    let appraisal = await prisma.selfAppraisal.findFirst({
      where: {
        userId: user.id,
        cycleYear,
        cyclePeriod: 'ANNUAL',
      },
    })

    if (appraisal) {
      // Update existing
      appraisal = await prisma.selfAppraisal.update({
        where: { id: appraisal.id },
        data: {
          status: appraisal.status === 'PENDING' ? 'IN_PROGRESS' : appraisal.status,
          startedAt: appraisal.startedAt || new Date(),
          selfRating: appraisalData.selfRating,
          selfComments: appraisalData.selfComments,
          goalsAchieved: appraisalData.goalsAchieved,
          challengesFaced: appraisalData.challengesFaced,
          trainingNeeds: appraisalData.trainingNeeds,
          careerAspirations: appraisalData.careerAspirations,
        },
      })
    } else {
      // Get learning hours
      const twelveMonthsAgo = new Date()
      twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)

      const learningLogs = await prisma.learningLog.aggregate({
        where: {
          userId: user.id,
          createdAt: { gte: twelveMonthsAgo },
        },
        _sum: { minutesWatched: true },
      })

      const learningHoursThisYear = (learningLogs._sum.minutesWatched || 0) / 60

      // Create new
      appraisal = await prisma.selfAppraisal.create({
        data: {
          userId: user.id,
          cycleYear,
          cyclePeriod: 'ANNUAL',
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          learningHoursThisYear,
          selfRating: appraisalData.selfRating,
          selfComments: appraisalData.selfComments,
          goalsAchieved: appraisalData.goalsAchieved,
          challengesFaced: appraisalData.challengesFaced,
          trainingNeeds: appraisalData.trainingNeeds,
          careerAspirations: appraisalData.careerAspirations,
        },
      })
    }

    return NextResponse.json({ success: true, appraisal })
  } catch (error) {
    console.error('Failed to save appraisal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
