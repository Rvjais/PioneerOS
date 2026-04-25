import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { LeaderboardClient } from './LeaderboardClient'
import PageGuide from '@/client/components/ui/PageGuide'

async function getLeaderboardData(month: Date) {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)

  // Get all accountability scores for the month
  const scores = await prisma.accountabilityScore.findMany({
    where: { month: monthStart },
    include: {
      user: {
        select: {
          id: true,
          empId: true,
          firstName: true,
          lastName: true,
          department: true,
          role: true,
          profile: {
            select: { profilePicture: true },
          },
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

  return leaderboard
}

async function getTopPerformers(month: Date) {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)

  // Get top 3 by score
  const topScores = await prisma.accountabilityScore.findMany({
    where: { month: monthStart },
    include: {
      user: {
        select: {
          id: true,
          empId: true,
          firstName: true,
          lastName: true,
          department: true,
        },
      },
    },
    orderBy: { finalScore: 'desc' },
    take: 3,
  })

  // Get top achievement earners
  const topAchievers = await prisma.achievement.groupBy({
    by: ['userId'],
    where: {
      month: monthStart,
      status: 'APPROVED',
    },
    _sum: { pointsAwarded: true },
    orderBy: { _sum: { pointsAwarded: 'desc' } },
    take: 3,
  })

  // Get user details for top achievers
  const achieverDetails = await prisma.user.findMany({
    where: { id: { in: topAchievers.map(a => a.userId) } },
    select: {
      id: true,
      empId: true,
      firstName: true,
      lastName: true,
      department: true,
    },
  })

  const topAchieversWithDetails = topAchievers.map(a => ({
    user: achieverDetails.find(u => u.id === a.userId),
    points: a._sum.pointsAwarded || 0,
  }))

  return {
    topScores,
    topAchievers: topAchieversWithDetails,
  }
}

async function getRecentAchievements() {
  return prisma.achievement.findMany({
    where: { status: 'APPROVED' },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          department: true,
        },
      },
      client: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
}

async function getDepartmentStats(month: Date) {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)

  const scores = await prisma.accountabilityScore.findMany({
    where: { month: monthStart },
    include: {
      user: {
        select: { department: true },
      },
    },
  })

  // Group by department and calculate averages
  const deptStats: Record<string, { total: number; count: number }> = {}

  for (const score of scores) {
    const dept = score.user.department
    if (!deptStats[dept]) {
      deptStats[dept] = { total: 0, count: 0 }
    }
    deptStats[dept].total += score.finalScore
    deptStats[dept].count++
  }

  return Object.entries(deptStats)
    .map(([department, stats]) => ({
      department,
      averageScore: Math.round(stats.total / stats.count),
      employeeCount: stats.count,
    }))
    .sort((a, b) => b.averageScore - a.averageScore)
}

export default async function PerformancePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const currentMonth = new Date()

  const [leaderboard, topPerformers, recentAchievements, departmentStats] = await Promise.all([
    getLeaderboardData(currentMonth),
    getTopPerformers(currentMonth),
    getRecentAchievements(),
    getDepartmentStats(currentMonth),
  ])

  // Get testimonial user IDs for badges in podium
  const testimonialUsers = await prisma.achievement.findMany({
    where: {
      type: 'VIDEO_TESTIMONIAL',
      status: 'APPROVED',
    },
    select: { userId: true },
    distinct: ['userId'],
  })
  const testimonialUserIds = testimonialUsers.map(t => t.userId)

  const serializedData = {
    leaderboard: leaderboard.map(item => ({
      ...item,
    })),
    topPerformers: {
      topScores: topPerformers.topScores.map(s => ({
        ...s,
        month: s.month.toISOString(),
        calculatedAt: s.calculatedAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
      topAchievers: topPerformers.topAchievers,
    },
    recentAchievements: recentAchievements.map(a => ({
      ...a,
      month: a.month.toISOString(),
      createdAt: a.createdAt.toISOString(),
      approvedAt: a.approvedAt?.toISOString() || null,
    })),
    departmentStats,
    currentMonth: currentMonth.toISOString(),
    isManager: ['SUPER_ADMIN', 'MANAGER'].includes(session.user.role),
    testimonialUserIds,
  }

  return (
    <div className="space-y-6 pb-8">
      <PageGuide
        pageKey="performance"
        title="Performance Leaderboard"
        description="Track accountability scores, achievements, and team rankings."
        steps={[
          { label: 'View rankings', description: 'See how team members rank by accountability score' },
          { label: 'Check growth score breakdown', description: 'Understand unit score vs growth score components' },
          { label: 'Compare with peers', description: 'Review department averages and top performers' },
          { label: 'Understand scoring', description: 'Learn how final scores are calculated from deliverables and goals' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Performance Leaderboard</h1>
          <p className="text-slate-400 mt-1">Track accountability scores and achievements</p>
        </div>
      </div>

      <LeaderboardClient {...serializedData} />
    </div>
  )
}
