import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { AppraisalsDashboard } from './AppraisalsDashboard'

async function getAppraisalsData() {
  const currentYear = new Date().getFullYear()

  const [appraisals, stats, upcomingUsers] = await Promise.all([
    // Get all appraisals for current year with user info
    prisma.selfAppraisal.findMany({
      where: { cycleYear: currentYear },
      orderBy: { triggeredAt: 'desc' },
    }),
    // Get stats
    prisma.selfAppraisal.groupBy({
      by: ['status'],
      where: { cycleYear: currentYear },
      _count: { status: true },
    }),
    // Get users due for appraisal in next 30 days
    prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        appraisalDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
      },
      select: {
        id: true,
        empId: true,
        firstName: true,
        lastName: true,
        department: true,
        joiningDate: true,
        appraisalDate: true,
      },
      orderBy: { appraisalDate: 'asc' },
    }),
  ])

  // Get user info for appraisals
  const userIds = appraisals.map(a => a.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      empId: true,
      firstName: true,
      lastName: true,
      department: true,
      joiningDate: true,
    },
  })
  const userMap = new Map(users.map(u => [u.id, u]))

  const appraisalsWithUsers = appraisals.map(a => ({
    ...a,
    user: userMap.get(a.userId),
  }))

  // Transform stats
  const statusCounts: Record<string, number> = {}
  stats.forEach(s => {
    statusCounts[s.status] = s._count.status
  })

  return {
    appraisals: appraisalsWithUsers,
    stats: {
      pending: statusCounts['PENDING'] || 0,
      inProgress: statusCounts['IN_PROGRESS'] || 0,
      submitted: statusCounts['SUBMITTED'] || 0,
      managerReview: statusCounts['MANAGER_REVIEW'] || 0,
      completed: statusCounts['COMPLETED'] || 0,
      total: appraisals.length,
    },
    upcomingUsers: upcomingUsers.map(u => ({
      ...u,
      joiningDate: u.joiningDate.toISOString(),
      appraisalDate: u.appraisalDate?.toISOString() || null,
    })),
  }
}

export default async function HRAppraisalsPage() {
  // RBAC is enforced by the HR layout - only SUPER_ADMIN, MANAGER, OPERATIONS_HEAD, HR can access
  const { appraisals, stats, upcomingUsers } = await getAppraisalsData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Appraisal Management</h1>
        <p className="text-slate-300 mt-1">Manage annual self-appraisals and performance reviews</p>
      </div>

      <AppraisalsDashboard
        appraisals={appraisals.map(a => ({
          id: a.id,
          userId: a.userId,
          cycleYear: a.cycleYear,
          cyclePeriod: a.cyclePeriod,
          status: a.status,
          triggeredAt: a.triggeredAt.toISOString(),
          submittedAt: a.submittedAt?.toISOString() || null,
          completedAt: a.completedAt?.toISOString() || null,
          overallRating: a.overallRating,
          managerRating: a.managerRating,
          finalRating: a.finalRating,
          learningHoursThisYear: a.learningHoursThisYear,
          learningHoursRequired: a.learningHoursRequired,
          user: a.user ? {
            id: a.user.id,
            empId: a.user.empId,
            firstName: a.user.firstName,
            lastName: a.user.lastName || '',
            department: a.user.department,
            joiningDate: a.user.joiningDate.toISOString(),
          } : null,
        }))}
        stats={stats}
        upcomingUsers={upcomingUsers}
      />
    </div>
  )
}
