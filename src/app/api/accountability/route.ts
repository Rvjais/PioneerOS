import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET - Get leaderboard data
export const GET = withAuth(async (req, { user, params }) => {
  try {
    const { searchParams } = new URL(req.url)
    const monthParam = searchParams.get('month')
    const department = searchParams.get('department')

    // Default to current month
    const month = monthParam ? new Date(monthParam) : new Date()
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)

    // Get all accountability scores for the month
    const whereClause: Record<string, unknown> = {
      month: monthStart,
    }

    if (department && department !== 'ALL') {
      whereClause.user = { department }
    }

    const scores = await prisma.accountabilityScore.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            empId: true,
            firstName: true,
            lastName: true,
            department: true,
            role: true,
          },
        },
      },
      orderBy: { finalScore: 'desc' },
    })

    // Get achievements count for each user this month
    const achievements = await prisma.achievement.groupBy({
      by: ['userId'],
      where: {
        month: monthStart,
        status: 'APPROVED',
      },
      _count: true,
      _sum: { pointsAwarded: true },
    })

    const achievementMap = new Map(
      achievements.map((a) => [a.userId, { count: a._count, points: a._sum.pointsAwarded || 0 }])
    )

    // Get users who have received video testimonials (ever, not just this month)
    const testimonialUsers = await prisma.achievement.findMany({
      where: {
        type: 'VIDEO_TESTIMONIAL',
        status: 'APPROVED',
      },
      select: { userId: true },
      distinct: ['userId'],
    })
    const testimonialUserIds = new Set(testimonialUsers.map(t => t.userId))

    // Combine data
    const leaderboard = scores.map((score, index) => ({
      rank: index + 1,
      id: score.id,
      user: score.user,
      unitScore: score.unitScore,
      growthScore: score.growthScore,
      finalScore: score.finalScore,
      deliveredUnits: score.deliveredUnits,
      expectedUnits: score.expectedUnits,
      goalsAchieved: score.goalsAchieved,
      totalGoals: score.totalGoals,
      achievements: achievementMap.get(score.userId) || { count: 0, points: 0 },
      hasVideoTestimonial: testimonialUserIds.has(score.userId),
    }))

    return NextResponse.json({
      month: monthStart.toISOString(),
      leaderboard,
      totalEmployees: scores.length,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
