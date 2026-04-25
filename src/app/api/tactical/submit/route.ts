import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { calculateGrowthScore, saveGrowthScore } from '@/server/services/growthScore'
import { isAdmin } from '@/shared/constants/roles'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const tacticalSubmitSchema = z.object({
  userId: z.string().min(1).max(100).optional(),
})

export const POST = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const parsed = tacticalSubmitSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const userId = parsed.data.userId || user.id

    // Security: Only allow submitting for self unless SUPER_ADMIN/MANAGER
    if (userId !== user.id && !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get current month boundaries
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // Check if already submitted
    const existingScore = await prisma.monthlyGrowthScore.findFirst({
      where: {
        userId,
        month: { gte: monthStart, lte: monthEnd },
        tacticalDataSubmitted: true,
      },
    })

    if (existingScore) {
      return NextResponse.json(
        { error: 'Tactical data already submitted for this month' },
        { status: 400 }
      )
    }

    // Calculate growth score
    const dayOfMonth = now.getDate()
    const submittedOnTime = dayOfMonth <= 5

    const scores = await calculateGrowthScore({ userId, month: monthStart })

    // Save growth score
    await saveGrowthScore(userId, monthStart, scores, submittedOnTime)

    // Get the saved score for response
    const savedScore = await prisma.monthlyGrowthScore.findFirst({
      where: {
        userId,
        month: monthStart,
      },
    })

    if (!savedScore) {
      return NextResponse.json({ error: 'Failed to save score' }, { status: 500 })
    }

    // Apply late penalty if submitted after 5th
    if (!submittedOnTime) {
      await prisma.monthlyGrowthScore.update({
        where: { id: savedScore.id },
        data: {
          finalScore: Math.max(0, savedScore.finalScore - 5),
        },
      })
    }

    // Notify managers about submission
    const managers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'SUPER_ADMIN' },
          { role: 'MANAGER' },
        ],
        status: 'ACTIVE',
        deletedAt: null,
        id: { not: userId },
      },
      select: { id: true },
    })

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    })

    const notificationPromises = managers.map(manager =>
      prisma.notification.create({
        data: {
          userId: manager.id,
          type: 'TACTICAL',
          title: 'Tactical Data Submitted',
          message: `${dbUser?.firstName} ${dbUser?.lastName || ''} submitted their tactical data for ${now.toLocaleString('en-IN', { month: 'long' })}`,
          link: `/meetings/tactical-sheet`,
        },
      })
    )

    await Promise.all(notificationPromises)

    return NextResponse.json({
      success: true,
      score: savedScore,
      submittedOnTime,
    })
  } catch (error) {
    console.error('Failed to submit tactical data:', error)
    return NextResponse.json(
      { error: 'Failed to submit tactical data' },
      { status: 500 }
    )
  }
})
