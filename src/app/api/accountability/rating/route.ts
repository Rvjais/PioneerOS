import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

// PATCH - Update manager rating for an employee
export const PATCH = withAuth(async (req, { user, params }) => {
  try {
    // Only managers can rate
    if (!['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(user.role)) {
      return NextResponse.json({ error: 'Only managers can submit ratings' }, { status: 403 })
    }

    const body = await req.json()
    const schema = z.object({
      userId: z.string().min(1),
      month: z.string().min(1),
      managerRating: z.number().min(1).max(10).optional(),
      managerNotes: z.string().max(2000).optional(),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { userId, month, managerRating, managerNotes } = result.data

    const monthStart = new Date(month)
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    // Check if accountability score exists for this user/month
    let score = await prisma.accountabilityScore.findUnique({
      where: {
        userId_month: {
          userId,
          month: monthStart,
        },
      },
    })

    if (!score) {
      // Create a new accountability score if one doesn't exist
      score = await prisma.accountabilityScore.create({
        data: {
          userId,
          month: monthStart,
          expectedUnits: 0,
          deliveredUnits: 0,
          unitScore: 0,
          goalsAchieved: 0,
          totalGoals: 0,
          growthScore: 0,
          finalScore: 0,
          managerRating,
          managerNotes,
        },
      })
    } else {
      // Update existing score
      const updateData: Record<string, unknown> = {}

      if (managerRating !== undefined) {
        updateData.managerRating = managerRating
      }

      if (managerNotes !== undefined) {
        updateData.managerNotes = managerNotes
      }

      // Recalculate final score with manager rating
      // Formula: (unitScore * 0.4) + (managerRating * 10 * 0.3) + (growthScore * 0.3)
      if (managerRating !== undefined) {
        const managerRatingNorm = managerRating * 10 // Scale 1-10 to 10-100
        const newFinalScore = (score.unitScore * 0.4) + (managerRatingNorm * 0.3) + (score.growthScore * 0.3)
        updateData.finalScore = Math.round(newFinalScore * 100) / 100
      }

      score = await prisma.accountabilityScore.update({
        where: { id: score.id },
        data: updateData,
      })
    }

    return NextResponse.json({
      success: true,
      score,
    })
  } catch (error) {
    console.error('Error updating manager rating:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
