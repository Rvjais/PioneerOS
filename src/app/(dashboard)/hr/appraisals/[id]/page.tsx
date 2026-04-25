import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect, notFound } from 'next/navigation'
import { AppraisalReview } from './AppraisalReview'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AppraisalDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { id } = await params

  // Check if user is HR or Admin
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, department: true },
  })

  const isHR = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'MANAGER' || currentUser?.department === 'HR'
  if (!isHR) {
    redirect('/hr/appraisals')
  }

  // Get the appraisal
  const appraisal = await prisma.selfAppraisal.findUnique({
    where: { id },
  })

  if (!appraisal) {
    notFound()
  }

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: appraisal.userId },
    select: {
      id: true,
      empId: true,
      firstName: true,
      lastName: true,
      department: true,
      joiningDate: true,
      email: true,
      phone: true,
    },
  })

  if (!user) {
    notFound()
  }

  // Get achievements
  const achievements = await prisma.achievement.findMany({
    where: {
      userId: appraisal.userId,
      createdAt: {
        gte: new Date(appraisal.cycleYear, 0, 1),
      },
      status: 'APPROVED',
    },
  })

  // Get accountability scores
  const scores = await prisma.accountabilityScore.findMany({
    where: {
      userId: appraisal.userId,
      month: {
        gte: new Date(appraisal.cycleYear, 0, 1),
        lte: new Date(appraisal.cycleYear, 11, 31),
      },
    },
    orderBy: { month: 'asc' },
  })

  // Get learning logs
  const learningLogs = await prisma.learningLog.findMany({
    where: {
      userId: appraisal.userId,
      createdAt: {
        gte: new Date(appraisal.cycleYear, 0, 1),
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Appraisal Review: {user.firstName} {user.lastName || ''}
          </h1>
          <p className="text-slate-300 mt-1">
            {appraisal.cycleYear} {appraisal.cyclePeriod} Appraisal
          </p>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
          appraisal.status === 'SUBMITTED' ? 'bg-purple-500/20 text-purple-400' :
          appraisal.status === 'MANAGER_REVIEW' ? 'bg-indigo-500/20 text-indigo-400' :
          appraisal.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
          'bg-slate-800/50 text-slate-200'
        }`}>
          {appraisal.status.replace(/_/g, ' ')}
        </span>
      </div>

      <AppraisalReview
        appraisal={{
          id: appraisal.id,
          userId: appraisal.userId,
          cycleYear: appraisal.cycleYear,
          cyclePeriod: appraisal.cyclePeriod,
          status: appraisal.status,
          triggeredAt: appraisal.triggeredAt.toISOString(),
          submittedAt: appraisal.submittedAt?.toISOString() || null,
          completedAt: appraisal.completedAt?.toISOString() || null,
          overallRating: appraisal.overallRating,
          keyAccomplishments: appraisal.keyAccomplishments,
          challengesFaced: appraisal.challengesFaced,
          goalsAchieved: appraisal.goalsAchieved,
          goalsMissed: appraisal.goalsMissed,
          skillsImproved: appraisal.skillsImproved,
          learningCompleted: appraisal.learningCompleted,
          skillsToImprove: appraisal.skillsToImprove,
          roleClarity: appraisal.roleClarity,
          resourcesAdequate: appraisal.resourcesAdequate,
          workloadBalance: appraisal.workloadBalance,
          teamCollaboration: appraisal.teamCollaboration,
          managerSupport: appraisal.managerSupport,
          cultureFit: appraisal.cultureFit,
          nextYearGoals: appraisal.nextYearGoals,
          careerAspirations: appraisal.careerAspirations,
          supportNeeded: appraisal.supportNeeded,
          trainingRequests: appraisal.trainingRequests,
          companyFeedback: appraisal.companyFeedback,
          teamFeedback: appraisal.teamFeedback,
          processFeedback: appraisal.processFeedback,
          managerComments: appraisal.managerComments,
          managerRating: appraisal.managerRating,
          finalRating: appraisal.finalRating,
          incrementRecommendation: appraisal.incrementRecommendation,
          promotionRecommendation: appraisal.promotionRecommendation,
          learningHoursThisYear: appraisal.learningHoursThisYear,
          learningHoursRequired: appraisal.learningHoursRequired,
        }}
        user={{
          id: user.id,
          empId: user.empId,
          firstName: user.firstName,
          lastName: user.lastName || '',
          department: user.department,
          joiningDate: user.joiningDate.toISOString(),
          email: user.email || '',
          phone: user.phone,
        }}
        achievements={achievements.map(a => ({
          id: a.id,
          type: a.type,
          title: a.title,
          description: a.description,
          pointsAwarded: a.pointsAwarded,
        }))}
        scores={scores.map(s => ({
          month: s.month.toISOString(),
          unitScore: s.unitScore,
          growthScore: s.growthScore,
          finalScore: s.finalScore,
        }))}
        learningLogs={learningLogs.map(l => ({
          id: l.id,
          resourceTitle: l.resourceTitle,
          minutesWatched: l.minutesWatched,
          createdAt: l.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
