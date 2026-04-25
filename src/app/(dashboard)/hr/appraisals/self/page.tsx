import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { checkAppraisalEligibility, getOrCreateAppraisal, getLearningHoursByMonth } from '@/server/services/appraisal'
import { getAppraisalPeriodScores } from '@/server/services/growthScore'
import { SelfAppraisalForm } from './SelfAppraisalForm'

export default async function SelfAppraisalPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id
  const currentYear = new Date().getFullYear()

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      empId: true,
      firstName: true,
      lastName: true,
      department: true,
      joiningDate: true,
      appraisalDate: true,
      status: true,
    },
  })

  if (!user) redirect('/login')

  // Check eligibility
  const eligibility = await checkAppraisalEligibility(userId)

  // Get learning hours breakdown
  const learningHours = await getLearningHoursByMonth(userId, 12)

  // Get existing appraisal if any
  const existingAppraisal = await prisma.selfAppraisal.findFirst({
    where: {
      userId,
      cycleYear: currentYear,
    },
  })

  // Get previous appraisals for reference
  const previousAppraisals = await prisma.selfAppraisal.findMany({
    where: {
      userId,
      cycleYear: { lt: currentYear },
      status: 'COMPLETED',
    },
    orderBy: { cycleYear: 'desc' },
    take: 3,
  })

  // Get achievements this year
  const achievements = await prisma.achievement.findMany({
    where: {
      userId,
      createdAt: {
        gte: new Date(currentYear, 0, 1),
      },
      status: 'APPROVED',
    },
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      pointsAwarded: true,
    },
  })

  // Get goals for this year
  const goals = await prisma.tacticalGoal.findMany({
    where: {
      userId,
      month: {
        gte: new Date(currentYear, 0, 1),
        lte: new Date(currentYear, 11, 31),
      },
    },
    select: {
      id: true,
      title: true,
      status: true,
      targetValue: true,
      currentValue: true,
    },
  })

  // Get growth scores for appraisal period (last 12 months)
  const growthScoreData = await getAppraisalPeriodScores(userId, 12)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Self-Appraisal {currentYear}</h1>
        <p className="text-slate-300 mt-1">Complete your annual self-assessment form</p>
      </div>

      {/* Learning Hours Progress */}
      <div className="glass-card border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Learning Hours Progress</h2>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            eligibility.learningHours >= eligibility.requiredHours
              ? 'bg-green-500/20 text-green-400'
              : 'bg-amber-500/20 text-amber-400'
          }`}>
            {eligibility.learningHours.toFixed(1)}h / {eligibility.requiredHours}h
          </span>
        </div>

        {/* Monthly Breakdown */}
        <div className="flex items-end gap-2 h-32 mb-4">
          {learningHours.map((month, idx) => (
            <div key={month.month} className="flex-1 flex flex-col items-center">
              <div className="w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-t ${
                    month.hours >= month.required ? 'bg-green-500' : 'bg-amber-500'
                  }`}
                  style={{ height: `${Math.min(100, (month.hours / month.required) * 100)}%` }}
                />
              </div>
              <div className="text-xs text-slate-400 mt-1 truncate w-full text-center">
                {month.month.split(' ')[0]}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span>Met (6h+)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-500 rounded" />
            <span>Below Target</span>
          </div>
        </div>

        {eligibility.blockers.length > 0 && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-200 rounded-lg">
            <h3 className="font-medium text-red-800 mb-2">Appraisal Blockers</h3>
            <ul className="space-y-1">
              {eligibility.blockers.map((blocker, idx) => (
                <li key={`blocker-${blocker}-${idx}`} className="text-sm text-red-400 flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {blocker}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Growth Score Breakdown */}
      {growthScoreData.scores.length > 0 && (
        <div className="glass-card border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-white">Growth Score (Last 12 Months)</h2>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${
                growthScoreData.averageScore >= 80 ? 'text-emerald-600' :
                growthScoreData.averageScore >= 60 ? 'text-blue-400' :
                growthScoreData.averageScore >= 40 ? 'text-amber-400' :
                'text-red-400'
              }`}>
                {growthScoreData.averageScore.toFixed(0)}
              </span>
              <span className="text-sm text-slate-400">avg</span>
            </div>
          </div>

          {/* Score Components */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="p-4 bg-blue-500/10 rounded-lg">
              <p className="text-xs text-blue-400 font-medium mb-1">Performance</p>
              <p className="text-xl font-bold text-blue-800">{growthScoreData.breakdown.performance.toFixed(0)}</p>
              <p className="text-xs text-blue-500">35% weight</p>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-lg">
              <p className="text-xs text-purple-400 font-medium mb-1">Accountability</p>
              <p className="text-xl font-bold text-purple-800">{growthScoreData.breakdown.accountability.toFixed(0)}</p>
              <p className="text-xs text-purple-500">20% weight</p>
            </div>
            <div className="p-4 bg-amber-500/10 rounded-lg">
              <p className="text-xs text-amber-400 font-medium mb-1">Discipline</p>
              <p className="text-xl font-bold text-amber-800">{growthScoreData.breakdown.discipline.toFixed(0)}</p>
              <p className="text-xs text-amber-500">15% weight</p>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-lg">
              <p className="text-xs text-emerald-600 font-medium mb-1">Learning</p>
              <p className="text-xl font-bold text-emerald-800">{growthScoreData.breakdown.learning.toFixed(0)}</p>
              <p className="text-xs text-emerald-500">15% weight</p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <p className="text-xs text-pink-600 font-medium mb-1">Appreciation</p>
              <p className="text-xl font-bold text-pink-800">{growthScoreData.breakdown.appreciation.toFixed(0)}</p>
              <p className="text-xs text-pink-500">15% weight</p>
            </div>
          </div>

          {/* Monthly Score Chart */}
          <div className="flex items-end gap-2 h-24 mb-4">
            {growthScoreData.scores.map((score, idx) => {
              const monthName = new Date(score.month).toLocaleString('en-IN', { month: 'short' })
              const heightPct = Math.min(100, score.finalScore)
              const color = score.finalScore >= 80 ? 'bg-emerald-500' :
                           score.finalScore >= 60 ? 'bg-blue-500' :
                           score.finalScore >= 40 ? 'bg-amber-500' :
                           'bg-red-500'
              return (
                <div key={String(score.month)} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t ${color}`}
                      style={{ height: `${heightPct}%` }}
                      title={`${monthName}: ${score.finalScore}`}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mt-1 truncate w-full text-center">
                    {monthName}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Deductions Summary */}
          {(growthScoreData.breakdown.escalationDeduction > 0 || growthScoreData.breakdown.churnDeduction > 0) && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">Deductions Applied</h3>
              <div className="flex gap-6 text-sm">
                {growthScoreData.breakdown.escalationDeduction > 0 && (
                  <div className="text-red-400">
                    Escalations: <span className="font-bold">-{growthScoreData.breakdown.escalationDeduction}</span>
                  </div>
                )}
                {growthScoreData.breakdown.churnDeduction > 0 && (
                  <div className="text-red-400">
                    Client Churn: <span className="font-bold">-{growthScoreData.breakdown.churnDeduction}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Grade Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-emerald-500 rounded" />
              <span>A (80+)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span>B (60-79)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-amber-500 rounded" />
              <span>C (40-59)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span>D/F (&lt;40)</span>
            </div>
          </div>
        </div>
      )}

      {/* Appraisal Form or Status */}
      {!existingAppraisal && !eligibility.isEligible ? (
        <div className="glass-card border border-white/10 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Appraisal Not Yet Due</h2>
          <p className="text-slate-300 mb-4">
            {eligibility.appraisalDueDate ? (
              <>Your appraisal is scheduled for {new Date(eligibility.appraisalDueDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}</>
            ) : (
              'Your appraisal date has not been set yet.'
            )}
          </p>
          {eligibility.daysTillAppraisal !== null && eligibility.daysTillAppraisal > 0 && (
            <p className="text-sm text-slate-400">
              {eligibility.daysTillAppraisal} days until your appraisal
            </p>
          )}
        </div>
      ) : existingAppraisal?.status === 'COMPLETED' ? (
        <div className="glass-card border border-green-200 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Appraisal Completed</h2>
          <p className="text-slate-300 mb-4">
            Your {currentYear} self-appraisal has been completed on{' '}
            {existingAppraisal.completedAt ? new Date(existingAppraisal.completedAt).toLocaleDateString('en-IN') : 'N/A'}.
          </p>
          {existingAppraisal.finalRating && (
            <div className="flex items-center justify-center gap-1">
              <span className="text-slate-300 mr-2">Final Rating:</span>
              {[1, 2, 3, 4, 5].map(star => (
                <svg
                  key={star}
                  className={`w-6 h-6 ${
                    star <= existingAppraisal.finalRating!
                      ? 'text-amber-400'
                      : 'text-slate-200'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          )}
        </div>
      ) : existingAppraisal?.status === 'SUBMITTED' || existingAppraisal?.status === 'MANAGER_REVIEW' ? (
        <div className="glass-card border border-purple-200 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Appraisal Submitted</h2>
          <p className="text-slate-300 mb-4">
            Your self-appraisal has been submitted and is pending manager review.
          </p>
          <p className="text-sm text-slate-400">
            Submitted on {existingAppraisal.submittedAt ? new Date(existingAppraisal.submittedAt).toLocaleDateString('en-IN') : 'N/A'}
          </p>
        </div>
      ) : (
        <SelfAppraisalForm
          user={{
            id: user.id,
            empId: user.empId,
            firstName: user.firstName,
            lastName: user.lastName || '',
            department: user.department,
            joiningDate: user.joiningDate.toISOString(),
          }}
          appraisal={existingAppraisal ? {
            id: existingAppraisal.id,
            status: existingAppraisal.status,
            overallRating: existingAppraisal.overallRating,
            keyAccomplishments: existingAppraisal.keyAccomplishments,
            challengesFaced: existingAppraisal.challengesFaced,
            goalsAchieved: existingAppraisal.goalsAchieved,
            goalsMissed: existingAppraisal.goalsMissed,
            skillsImproved: existingAppraisal.skillsImproved,
            learningCompleted: existingAppraisal.learningCompleted,
            skillsToImprove: existingAppraisal.skillsToImprove,
            roleClarity: existingAppraisal.roleClarity,
            resourcesAdequate: existingAppraisal.resourcesAdequate,
            workloadBalance: existingAppraisal.workloadBalance,
            teamCollaboration: existingAppraisal.teamCollaboration,
            managerSupport: existingAppraisal.managerSupport,
            cultureFit: existingAppraisal.cultureFit,
            nextYearGoals: existingAppraisal.nextYearGoals,
            careerAspirations: existingAppraisal.careerAspirations,
            supportNeeded: existingAppraisal.supportNeeded,
            trainingRequests: existingAppraisal.trainingRequests,
            companyFeedback: existingAppraisal.companyFeedback,
            teamFeedback: existingAppraisal.teamFeedback,
            processFeedback: existingAppraisal.processFeedback,
          } : null}
          achievements={achievements}
          goals={goals}
          cycleYear={currentYear}
        />
      )}

      {/* Previous Appraisals */}
      {previousAppraisals.length > 0 && (
        <div className="glass-card border border-white/10 rounded-xl p-6">
          <h2 className="font-semibold text-white mb-4">Previous Appraisals</h2>
          <div className="space-y-3">
            {previousAppraisals.map(appraisal => (
              <div
                key={appraisal.id}
                className="flex items-center justify-between p-4 bg-slate-900/40 rounded-lg"
              >
                <div>
                  <p className="font-medium text-white">{appraisal.cycleYear} - {appraisal.cyclePeriod}</p>
                  <p className="text-sm text-slate-400">
                    Completed on {appraisal.completedAt?.toLocaleDateString('en-IN') || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {appraisal.finalRating && (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
                            star <= appraisal.finalRating!
                              ? 'text-amber-400'
                              : 'text-slate-200'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  )}
                  <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded">
                    {appraisal.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
