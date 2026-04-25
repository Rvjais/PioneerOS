import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const submitAppraisalSchema = z.object({
  cycleYear: z.number().int().min(2020).max(2030),
  selfRating: z.number().min(0).max(5).optional(),
  selfComments: z.string().max(5000).optional(),
  goalsAchieved: z.string().max(5000).optional(),
  challengesFaced: z.string().max(5000).optional(),
  trainingNeeds: z.string().max(5000).optional(),
  careerAspirations: z.string().max(5000).optional(),
  overallRating: z.number().min(0).max(5),
  keyAccomplishments: z.string().min(1, 'Key accomplishments are required').max(5000),
})

export const POST = withAuth(async (req, { user, params }) => {
  try {
const rawData = await req.json()
    const parsed = submitAppraisalSchema.safeParse(rawData)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { cycleYear, ...appraisalData } = parsed.data

    // Get existing appraisal
    let appraisal = await prisma.selfAppraisal.findFirst({
      where: {
        userId: user.id,
        cycleYear,
        cyclePeriod: 'ANNUAL',
      },
    })

    if (!appraisal) {
      return NextResponse.json({ error: 'No appraisal found' }, { status: 404 })
    }

    if (appraisal.status === 'SUBMITTED' || appraisal.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Appraisal already submitted' }, { status: 400 })
    }

    // Update and submit
    appraisal = await prisma.selfAppraisal.update({
      where: { id: appraisal.id },
      data: {
        selfRating: appraisalData.selfRating,
        selfComments: appraisalData.selfComments,
        goalsAchieved: appraisalData.goalsAchieved,
        challengesFaced: appraisalData.challengesFaced,
        trainingNeeds: appraisalData.trainingNeeds,
        careerAspirations: appraisalData.careerAspirations,
        overallRating: appraisalData.overallRating,
        keyAccomplishments: appraisalData.keyAccomplishments,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    })

    // Get user info for notification
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { firstName: true, lastName: true, empId: true, department: true },
    })

    // Notify HR and managers
    const hrUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'SUPER_ADMIN' },
          { role: 'MANAGER' },
          { department: 'HR' },
        ],
        deletedAt: null,
      },
      select: { id: true },
    })

    await prisma.notification.createMany({
      data: hrUsers.map(hr => ({
        userId: hr.id,
        type: 'GENERAL',
        title: 'Self-Appraisal Submitted',
        message: `${dbUser?.firstName} ${dbUser?.lastName || ''} (${dbUser?.empId}) has submitted their ${cycleYear} self-appraisal.`,
        link: `/hr/appraisals/${appraisal!.id}`,
        priority: 'NORMAL',
      })),
    })

    return NextResponse.json({ success: true, appraisal })
  } catch (error) {
    console.error('Failed to submit appraisal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
