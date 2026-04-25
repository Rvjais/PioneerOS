'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Appraisal {
  id: string
  userId: string
  cycleYear: number
  cyclePeriod: string
  status: string
  triggeredAt: string
  submittedAt: string | null
  completedAt: string | null
  overallRating: number | null
  keyAccomplishments: string | null
  challengesFaced: string | null
  goalsAchieved: string | null
  goalsMissed: string | null
  skillsImproved: string | null
  learningCompleted: string | null
  skillsToImprove: string | null
  roleClarity: number | null
  resourcesAdequate: number | null
  workloadBalance: number | null
  teamCollaboration: number | null
  managerSupport: number | null
  cultureFit: number | null
  nextYearGoals: string | null
  careerAspirations: string | null
  supportNeeded: string | null
  trainingRequests: string | null
  companyFeedback: string | null
  teamFeedback: string | null
  processFeedback: string | null
  managerComments: string | null
  managerRating: number | null
  finalRating: number | null
  incrementRecommendation: string | null
  promotionRecommendation: boolean
  learningHoursThisYear: number
  learningHoursRequired: number
}

interface User {
  id: string
  empId: string
  firstName: string
  lastName: string
  department: string
  joiningDate: string
  email: string
  phone: string
}

interface Achievement {
  id: string
  type: string
  title: string
  description: string | null
  pointsAwarded: number
}

interface Score {
  month: string
  unitScore: number
  growthScore: number
  finalScore: number
}

interface LearningLog {
  id: string
  resourceTitle: string
  minutesWatched: number
  createdAt: string
}

interface Props {
  appraisal: Appraisal
  user: User
  achievements: Achievement[]
  scores: Score[]
  learningLogs: LearningLog[]
}

function StarDisplay({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= (value || 0) ? 'text-amber-400' : 'text-slate-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </div>
  )
}

export function AppraisalReview({ appraisal, user, achievements, scores, learningLogs }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [managerRating, setManagerRating] = useState(appraisal.managerRating || null)
  const [managerComments, setManagerComments] = useState(appraisal.managerComments || '')
  const [finalRating, setFinalRating] = useState(appraisal.finalRating || null)
  const [incrementRecommendation, setIncrementRecommendation] = useState(appraisal.incrementRecommendation || 'STANDARD')
  const [promotionRecommendation, setPromotionRecommendation] = useState(appraisal.promotionRecommendation)

  const isCompleted = appraisal.status === 'COMPLETED'
  const canReview = appraisal.status === 'SUBMITTED' || appraisal.status === 'MANAGER_REVIEW'

  const handleComplete = async () => {
    if (!managerRating || !finalRating) {
      toast.error('Please provide manager rating and final rating')
      return
    }

    if (!confirm('Are you sure you want to complete this appraisal?')) return

    setSaving(true)
    try {
      const res = await fetch(`/api/hr/appraisals/${appraisal.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          managerRating,
          managerComments,
          finalRating,
          incrementRecommendation,
          promotionRecommendation,
        }),
      })

      const data = await res.json()
      if (data.success) {
        router.refresh()
      } else {
        toast.error('Failed to complete: ' + data.error)
      }
    } catch (error) {
      toast.error('Error completing appraisal')
    } finally {
      setSaving(false)
    }
  }

  const avgScore = scores.length > 0
    ? (scores.reduce((acc, s) => acc + s.finalScore, 0) / scores.length).toFixed(1)
    : 'N/A'

  return (
    <div className="space-y-6">
      {/* Employee Info Card */}
      <div className="glass-card border border-white/10 rounded-xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-slate-400">Employee ID</p>
            <p className="font-medium text-white">{user.empId}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Department</p>
            <p className="font-medium text-white">{user.department}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Joining Date</p>
            <p className="font-medium text-white">
              {new Date(user.joiningDate).toLocaleDateString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Tenure</p>
            <p className="font-medium text-white">
              {Math.floor((Date.now() - new Date(user.joiningDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
            </p>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card border border-white/10 rounded-xl p-6">
          <h3 className="font-semibold text-white mb-4">Self Rating</h3>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold text-amber-400">{appraisal.overallRating || '-'}</span>
            <span className="text-slate-400">/5</span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(star => (
              <svg
                key={star}
                className={`w-5 h-5 ${star <= (appraisal.overallRating || 0) ? 'text-amber-400' : 'text-slate-200'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>

        <div className="glass-card border border-white/10 rounded-xl p-6">
          <h3 className="font-semibold text-white mb-4">Avg Performance Score</h3>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold text-blue-400">{avgScore}</span>
            <span className="text-slate-400">%</span>
          </div>
          <p className="text-sm text-slate-400 mt-2">Based on {scores.length} monthly reviews</p>
        </div>

        <div className="glass-card border border-white/10 rounded-xl p-6">
          <h3 className="font-semibold text-white mb-4">Learning Hours</h3>
          <div className="flex items-center gap-2">
            <span className={`text-4xl font-bold ${
              appraisal.learningHoursThisYear >= appraisal.learningHoursRequired
                ? 'text-green-400'
                : 'text-amber-400'
            }`}>
              {appraisal.learningHoursThisYear.toFixed(0)}
            </span>
            <span className="text-slate-400">/ {appraisal.learningHoursRequired}h</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                appraisal.learningHoursThisYear >= appraisal.learningHoursRequired
                  ? 'bg-green-500'
                  : 'bg-amber-500'
              }`}
              style={{
                width: `${Math.min(100, (appraisal.learningHoursThisYear / appraisal.learningHoursRequired) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Self Assessment Sections */}
      <div className="glass-card border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Self Assessment</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Accomplishments */}
          <div>
            <h3 className="font-medium text-white mb-2">Key Accomplishments</h3>
            <div className="p-4 bg-slate-900/40 rounded-lg text-sm text-slate-200 whitespace-pre-wrap">
              {appraisal.keyAccomplishments || 'Not provided'}
            </div>
          </div>

          {/* Challenges */}
          <div>
            <h3 className="font-medium text-white mb-2">Challenges Faced</h3>
            <div className="p-4 bg-slate-900/40 rounded-lg text-sm text-slate-200 whitespace-pre-wrap">
              {appraisal.challengesFaced || 'Not provided'}
            </div>
          </div>

          {/* Goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-white mb-2">Goals Achieved</h3>
              <div className="p-4 bg-green-500/10 border border-green-200 rounded-lg text-sm text-slate-200 whitespace-pre-wrap">
                {appraisal.goalsAchieved || 'Not provided'}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">Goals Missed</h3>
              <div className="p-4 bg-red-500/10 border border-red-200 rounded-lg text-sm text-slate-200 whitespace-pre-wrap">
                {appraisal.goalsMissed || 'Not provided'}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-white mb-2">Skills Improved</h3>
              <div className="p-4 bg-slate-900/40 rounded-lg text-sm text-slate-200 whitespace-pre-wrap">
                {appraisal.skillsImproved || 'Not provided'}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">Areas to Improve</h3>
              <div className="p-4 bg-slate-900/40 rounded-lg text-sm text-slate-200 whitespace-pre-wrap">
                {appraisal.skillsToImprove || 'Not provided'}
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div>
            <h3 className="font-medium text-white mb-3">Environment Ratings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <StarDisplay label="Role Clarity" value={appraisal.roleClarity} />
              <StarDisplay label="Resources Adequate" value={appraisal.resourcesAdequate} />
              <StarDisplay label="Work-Life Balance" value={appraisal.workloadBalance} />
              <StarDisplay label="Team Collaboration" value={appraisal.teamCollaboration} />
              <StarDisplay label="Manager Support" value={appraisal.managerSupport} />
              <StarDisplay label="Culture Fit" value={appraisal.cultureFit} />
            </div>
          </div>

          {/* Future Goals */}
          <div>
            <h3 className="font-medium text-white mb-2">Next Year Goals</h3>
            <div className="p-4 bg-blue-500/10 border border-blue-200 rounded-lg text-sm text-slate-200 whitespace-pre-wrap">
              {appraisal.nextYearGoals || 'Not provided'}
            </div>
          </div>

          {/* Career Aspirations */}
          <div>
            <h3 className="font-medium text-white mb-2">Career Aspirations</h3>
            <div className="p-4 bg-slate-900/40 rounded-lg text-sm text-slate-200 whitespace-pre-wrap">
              {appraisal.careerAspirations || 'Not provided'}
            </div>
          </div>

          {/* Feedback */}
          {(appraisal.companyFeedback || appraisal.teamFeedback || appraisal.processFeedback) && (
            <div>
              <h3 className="font-medium text-white mb-3">Feedback</h3>
              <div className="space-y-3">
                {appraisal.companyFeedback && (
                  <div className="p-4 bg-amber-500/10 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-400 font-medium mb-1">Company Feedback</p>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">{appraisal.companyFeedback}</p>
                  </div>
                )}
                {appraisal.teamFeedback && (
                  <div className="p-4 bg-amber-500/10 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-400 font-medium mb-1">Team Feedback</p>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">{appraisal.teamFeedback}</p>
                  </div>
                )}
                {appraisal.processFeedback && (
                  <div className="p-4 bg-amber-500/10 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-400 font-medium mb-1">Process Suggestions</p>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">{appraisal.processFeedback}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="glass-card border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Achievements This Year</h2>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {achievements.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{a.title}</p>
                    <p className="text-sm text-slate-400">{a.type}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded">
                    +{a.pointsAwarded} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manager Review Section */}
      {canReview && (
        <div className="glass-card border border-blue-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-blue-200 bg-blue-500/10">
            <h2 className="font-semibold text-blue-900">Manager Review</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Manager Rating */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Manager Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setManagerRating(star)}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-8 h-8 transition-colors ${
                        star <= (managerRating || 0) ? 'text-blue-500' : 'text-slate-200 hover:text-blue-200'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Manager Comments */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Manager Comments</label>
              <textarea
                value={managerComments}
                onChange={(e) => setManagerComments(e.target.value)}
                rows={4}
                placeholder="Provide feedback and comments..."
                className="w-full px-4 py-3 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Final Rating */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Final Agreed Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFinalRating(star)}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-8 h-8 transition-colors ${
                        star <= (finalRating || 0) ? 'text-green-500' : 'text-slate-200 hover:text-green-200'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Increment Recommendation */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Increment Recommendation</label>
              <select
                value={incrementRecommendation}
                onChange={(e) => setIncrementRecommendation(e.target.value)}
                className="w-full px-4 py-2 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="NO_INCREMENT">No Increment</option>
                <option value="STANDARD">Standard Increment</option>
                <option value="ABOVE_STANDARD">Above Standard</option>
                <option value="EXCEPTIONAL">Exceptional</option>
              </select>
            </div>

            {/* Promotion */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="promotion"
                checked={promotionRecommendation}
                onChange={(e) => setPromotionRecommendation(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 text-blue-400 focus:ring-blue-500"
              />
              <label htmlFor="promotion" className="text-sm text-slate-200">
                Recommend for Promotion
              </label>
            </div>

            {/* Complete Button */}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={handleComplete}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Completing...' : 'Complete Appraisal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Review */}
      {isCompleted && (
        <div className="glass-card border border-green-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-green-200 bg-green-500/10">
            <h2 className="font-semibold text-green-900">Final Review</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/40 rounded-lg text-center">
                <p className="text-sm text-slate-400 mb-1">Self Rating</p>
                <p className="text-2xl font-bold text-amber-400">{appraisal.overallRating}/5</p>
              </div>
              <div className="p-4 bg-slate-900/40 rounded-lg text-center">
                <p className="text-sm text-slate-400 mb-1">Manager Rating</p>
                <p className="text-2xl font-bold text-blue-400">{appraisal.managerRating}/5</p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg text-center">
                <p className="text-sm text-green-400 mb-1">Final Rating</p>
                <p className="text-2xl font-bold text-green-400">{appraisal.finalRating}/5</p>
              </div>
              <div className="p-4 bg-slate-900/40 rounded-lg text-center">
                <p className="text-sm text-slate-400 mb-1">Increment</p>
                <p className="text-lg font-semibold text-white">
                  {appraisal.incrementRecommendation?.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            {appraisal.managerComments && (
              <div>
                <p className="text-sm font-medium text-slate-200 mb-2">Manager Comments</p>
                <div className="p-4 bg-slate-900/40 rounded-lg text-sm text-slate-200 whitespace-pre-wrap">
                  {appraisal.managerComments}
                </div>
              </div>
            )}

            {appraisal.promotionRecommendation && (
              <div className="p-4 bg-purple-500/10 border border-purple-200 rounded-lg">
                <p className="font-medium text-purple-800">Recommended for Promotion</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
