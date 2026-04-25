'use client'

import { useState } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatGrowth, getGrowthColor } from '@/shared/constants/kpiDefinitions'

interface TeamMember {
  id: string
  firstName: string
  lastName: string | null
  empId: string
  role: string
}

interface Goal {
  id: string
  title: string
  description?: string | null
  targetMetric?: string | null
  targetValue?: number | null
  currentValue?: number | null
  status: string
  deadline?: string | null
}

interface PeerReview {
  id: string
  reviewerId: string
  revieweeId: string
  collaborationRating?: number | null
  communicationRating?: number | null
  deliveryRating?: number | null
  innovationRating?: number | null
  overallRating?: number | null
  didWell?: string | null
  needsImprovement?: string | null
  shouldDoDifferently?: string | null
  isPublic: boolean
}

interface Meeting {
  id: string
  quarter: number
  year: number
  conductedAt?: string | null
  quarterlyData?: string | null
  summary?: string | null
  goals: Goal[]
  peerReviews: PeerReview[]
}

interface TacticalMeeting {
  id: string
  month: string
  performanceScore?: number | null
  kpiEntries: Array<{
    trafficGrowth?: number | null
    leadsGrowth?: number | null
  }>
}

interface Scorecard {
  id: string
  performanceScore: number
  accountabilityScore: number
  clientSatisfactionScore: number
  overallScore: number
  learningHoursCompleted: number
  learningCompliant: boolean
  appraisalDelayMonths: number
  departmentRank?: number | null
  companyRank?: number | null
}

interface Props {
  currentMeeting: Meeting | null
  previousMeeting: Meeting | null
  teamMembers: TeamMember[]
  quarterlyData: TacticalMeeting[]
  peerReviews: { given: PeerReview[]; received: PeerReview[] }
  scorecard: Scorecard | null
  currentUserId: string
  department: string
  isManager: boolean
  quarter: number
  year: number
}

const QUARTER_NAMES = ['Q1', 'Q2', 'Q3', 'Q4']

export function StrategicMeetingClient({
  currentMeeting,
  previousMeeting,
  teamMembers,
  quarterlyData,
  peerReviews,
  scorecard,
  currentUserId,
  department,
  isManager,
  quarter,
  year,
}: Props) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'overview' | 'goals' | 'reviews' | 'scores'>('overview')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedReviewee, setSelectedReviewee] = useState<string | null>(null)
  const [reviewForm, setReviewForm] = useState({
    collaborationRating: 0,
    communicationRating: 0,
    deliveryRating: 0,
    innovationRating: 0,
    overallRating: 0,
    didWell: '',
    needsImprovement: '',
    shouldDoDifferently: '',
    isPublic: true,
  })
  const [loading, setLoading] = useState(false)

  // Calculate quarterly average growth
  const quarterlyGrowth = quarterlyData.length > 0
    ? quarterlyData.reduce((sum, m) => {
        const growths = m.kpiEntries.map(e => e.trafficGrowth).filter(v => v !== null) as number[]
        const avg = growths.length > 0 ? growths.reduce((a, b) => a + b, 0) / growths.length : 0
        return sum + avg
      }, 0) / quarterlyData.length
    : null

  const handleSubmitReview = async () => {
    if (!selectedReviewee || !currentMeeting) return

    setLoading(true)
    try {
      const res = await fetch('/api/meetings/strategic/peer-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: currentMeeting.id,
          revieweeId: selectedReviewee,
          ...reviewForm,
        }),
      })

      if (res.ok) {
        setShowReviewModal(false)
        setSelectedReviewee(null)
        setReviewForm({
          collaborationRating: 0,
          communicationRating: 0,
          deliveryRating: 0,
          innovationRating: 0,
          overallRating: 0,
          didWell: '',
          needsImprovement: '',
          shouldDoDifferently: '',
          isPublic: true,
        })
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit review')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  const getTeamMemberName = (id: string) => {
    const member = teamMembers.find(m => m.id === id)
    return member ? `${member.firstName} ${member.lastName || ''}` : 'Unknown'
  }

  const hasReviewedMember = (memberId: string) => {
    return peerReviews.given.some(r => r.revieweeId === memberId)
  }

  const getAvgRating = (review: PeerReview) => {
    const ratings = [
      review.collaborationRating,
      review.communicationRating,
      review.deliveryRating,
      review.innovationRating,
      review.overallRating,
    ].filter(r => r !== null) as number[]
    return ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Strategic Meeting</h1>
          <p className="text-slate-300">
            {QUARTER_NAMES[quarter - 1]} {year} | {department} Department
          </p>
        </div>
        <div className="flex rounded-lg border border-white/10 overflow-hidden">
          {(['overview', 'goals', 'reviews', 'scores'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 text-sm font-medium transition-colors capitalize ${
                viewMode === mode ? 'bg-blue-600 text-white' : 'glass-card text-slate-200 hover:bg-slate-900/40'
              } ${mode !== 'overview' ? 'border-l border-white/10' : ''}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Score Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300 mb-1">Performance Score</p>
          <p className="text-2xl font-bold text-white">
            {scorecard?.performanceScore.toFixed(1) || '-'}
          </p>
          <p className="text-xs text-slate-400">Based on client growth</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300 mb-1">Accountability Score</p>
          <p className="text-2xl font-bold text-white">
            {scorecard?.accountabilityScore.toFixed(1) || '-'}
          </p>
          <p className="text-xs text-slate-400">Projects managed vs expected</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300 mb-1">Client Satisfaction</p>
          <p className="text-2xl font-bold text-white">
            {scorecard?.clientSatisfactionScore.toFixed(1) || '-'}
          </p>
          <p className="text-xs text-slate-400">NPS + feedback score</p>
        </div>
        <div className={`rounded-xl border p-4 ${
          scorecard?.overallScore && scorecard.overallScore >= 70
            ? 'bg-green-500/10 border-green-200'
            : scorecard?.overallScore && scorecard.overallScore >= 50
              ? 'bg-amber-500/10 border-amber-200'
              : 'glass-card border-white/10'
        }`}>
          <p className="text-sm text-slate-300 mb-1">Overall Score</p>
          <p className={`text-2xl font-bold ${
            scorecard?.overallScore && scorecard.overallScore >= 70
              ? 'text-green-400'
              : scorecard?.overallScore && scorecard.overallScore >= 50
                ? 'text-amber-400'
                : 'text-white'
          }`}>
            {scorecard?.overallScore.toFixed(1) || '-'}
          </p>
          <p className="text-xs text-slate-400">
            {scorecard?.departmentRank ? `#${scorecard.departmentRank} in department` : 'Weighted average'}
          </p>
        </div>
      </div>

      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quarterly Performance */}
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-white">Quarterly Performance</h2>
              <p className="text-sm text-slate-300">Monthly breakdown for {QUARTER_NAMES[quarter - 1]}</p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-900/40">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-200">Month</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-200">Clients</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-200">Avg Growth</th>
                </tr>
              </thead>
              <tbody>
                {quarterlyData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                      No tactical meeting data for this quarter
                    </td>
                  </tr>
                ) : (
                  quarterlyData.map(meeting => {
                    const growths = meeting.kpiEntries.map(e => e.trafficGrowth).filter(v => v !== null) as number[]
                    const avgGrowth = growths.length > 0 ? growths.reduce((a, b) => a + b, 0) / growths.length : null

                    return (
                      <tr key={meeting.id} className="border-b border-white/5">
                        <td className="px-4 py-3 font-medium text-white">
                          {new Date(meeting.month).toLocaleDateString('en-IN', { month: 'long' })}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-300">
                          {meeting.kpiEntries.length}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={avgGrowth !== null ? getGrowthColor(avgGrowth) : 'text-slate-400'}>
                            {avgGrowth !== null ? formatGrowth(avgGrowth) : '-'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
              <tfoot className="bg-slate-900/40">
                <tr>
                  <td className="px-4 py-3 font-semibold text-white">Quarter Average</td>
                  <td className="px-4 py-3 text-center text-slate-300">
                    {quarterlyData.reduce((sum, m) => sum + m.kpiEntries.length, 0)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={quarterlyGrowth !== null ? getGrowthColor(quarterlyGrowth) : 'text-slate-400'}>
                      {quarterlyGrowth !== null ? formatGrowth(quarterlyGrowth) : '-'}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Learning & Appraisal Status */}
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-white">Learning & Appraisal Status</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className={`rounded-lg p-4 ${
                scorecard?.learningCompliant ? 'bg-green-500/10' : 'bg-amber-500/10'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-white">Learning Hours</p>
                  <p className={`font-bold ${scorecard?.learningCompliant ? 'text-green-400' : 'text-amber-400'}`}>
                    {scorecard?.learningHoursCompleted.toFixed(1) || 0}h / 6h per month
                  </p>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${scorecard?.learningCompliant ? 'bg-green-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min((scorecard?.learningHoursCompleted || 0) / 6 * 100, 100)}%` }}
                  />
                </div>
              </div>

              {(scorecard?.appraisalDelayMonths || 0) > 0 && (
                <div className="bg-red-500/10 rounded-lg p-4">
                  <p className="font-medium text-red-800">Appraisal Delayed</p>
                  <p className="text-sm text-red-400">
                    Your appraisal is delayed by {scorecard?.appraisalDelayMonths} month(s) due to incomplete learning requirements.
                  </p>
                </div>
              )}

              <div className="border-t border-white/10 pt-4">
                <h3 className="font-medium text-white mb-3">Score Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Performance (40%)</span>
                    <span className="font-medium">{scorecard?.performanceScore.toFixed(1) || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Accountability (30%)</span>
                    <span className="font-medium">{scorecard?.accountabilityScore.toFixed(1) || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Client Satisfaction (30%)</span>
                    <span className="font-medium">{scorecard?.clientSatisfactionScore.toFixed(1) || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'goals' && (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">Quarterly Goals</h2>
              <p className="text-sm text-slate-300">Goals set for {QUARTER_NAMES[quarter - 1]} {year}</p>
            </div>
            {isManager && (
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                Add Goal
              </button>
            )}
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-900/40">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-200">Goal</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-200">Target</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-200">Progress</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-200">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-200">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {(!currentMeeting?.goals || currentMeeting.goals.length === 0) ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No goals set for this quarter
                  </td>
                </tr>
              ) : (
                currentMeeting.goals.map(goal => {
                  const progress = goal.targetValue && goal.currentValue
                    ? (goal.currentValue / goal.targetValue) * 100
                    : 0

                  return (
                    <tr key={goal.id} className="border-b border-white/5">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{goal.title}</p>
                        {goal.description && (
                          <p className="text-xs text-slate-400">{goal.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {goal.targetMetric || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-24 bg-white/10 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                progress >= 100 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{progress.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          goal.status === 'ACHIEVED' ? 'bg-green-500/20 text-green-400' :
                          goal.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                          goal.status === 'MISSED' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-800/50 text-slate-200'
                        }`}>
                          {goal.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {goal.deadline ? formatDateDDMMYYYY(goal.deadline) : '-'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* Previous Quarter Goals Comparison */}
          {previousMeeting?.goals && previousMeeting.goals.length > 0 && (
            <div className="border-t border-white/10">
              <div className="p-4 bg-slate-900/40">
                <h3 className="font-medium text-slate-200">Previous Quarter Results ({QUARTER_NAMES[(quarter - 2 + 4) % 4]})</h3>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {previousMeeting.goals.map(goal => (
                    <tr key={goal.id} className="border-b border-white/5">
                      <td className="px-4 py-3 text-slate-300">{goal.title}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          goal.status === 'ACHIEVED' ? 'bg-green-500/20 text-green-400' :
                          goal.status === 'MISSED' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-800/50 text-slate-200'
                        }`}>
                          {goal.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {viewMode === 'reviews' && (
        <div className="space-y-6">
          {/* Give Reviews */}
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-white">Give Peer Reviews</h2>
              <p className="text-sm text-slate-300">Rate your team members for {QUARTER_NAMES[quarter - 1]}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {teamMembers.filter(m => m.id !== currentUserId).map(member => {
                const hasReviewed = hasReviewedMember(member.id)
                return (
                  <div key={member.id} className={`border rounded-lg p-4 ${
                    hasReviewed ? 'border-green-200 bg-green-500/10' : 'border-white/10'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-slate-400">{member.empId}</p>
                      </div>
                      {hasReviewed ? (
                        <span className="text-green-400 text-sm">Reviewed</span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedReviewee(member.id)
                            setShowReviewModal(true)
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Received Reviews */}
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-white">Reviews Received</h2>
              <p className="text-sm text-slate-300">Feedback from your peers</p>
            </div>
            <div className="divide-y divide-white/10">
              {peerReviews.received.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No reviews received yet
                </div>
              ) : (
                peerReviews.received.map(review => (
                  <div key={review.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-medium text-white">
                        {review.isPublic ? 'Anonymous' : getTeamMemberName(review.reviewerId)}
                      </p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= getAvgRating(review) ? 'text-amber-400' : 'text-slate-200'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-2 text-sm text-slate-300">{getAvgRating(review).toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      {review.didWell && (
                        <div>
                          <span className="text-green-400 font-medium">Did Well: </span>
                          <span className="text-slate-300">{review.didWell}</span>
                        </div>
                      )}
                      {review.needsImprovement && (
                        <div>
                          <span className="text-amber-400 font-medium">Needs Improvement: </span>
                          <span className="text-slate-300">{review.needsImprovement}</span>
                        </div>
                      )}
                      {review.shouldDoDifferently && (
                        <div>
                          <span className="text-blue-400 font-medium">Do Differently: </span>
                          <span className="text-slate-300">{review.shouldDoDifferently}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'scores' && (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Team Quarterly Scores</h2>
            <p className="text-sm text-slate-300">Compare performance across the team</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-900/40">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-200">Employee</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-200">Performance</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-200">Accountability</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-200">Satisfaction</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-200">Overall</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-200">Rank</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member, index) => {
                // In real implementation, fetch actual scores for each member
                const isCurrentUser = member.id === currentUserId
                return (
                  <tr key={member.id} className={`border-b border-white/5 ${isCurrentUser ? 'bg-blue-500/10' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">
                        {member.firstName} {member.lastName}
                        {isCurrentUser && <span className="ml-2 text-xs text-blue-400">(You)</span>}
                      </p>
                      <p className="text-xs text-slate-400">{member.empId}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isCurrentUser ? scorecard?.performanceScore.toFixed(1) || '-' : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isCurrentUser ? scorecard?.accountabilityScore.toFixed(1) || '-' : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isCurrentUser ? scorecard?.clientSatisfactionScore.toFixed(1) || '-' : '-'}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      {isCurrentUser ? scorecard?.overallScore.toFixed(1) || '-' : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isCurrentUser && scorecard?.departmentRank ? `#${scorecard.departmentRank}` : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedReviewee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-white">
                Review {getTeamMemberName(selectedReviewee)}
              </h2>
            </div>
            <div className="p-4 space-y-4">
              {/* Ratings */}
              {[
                { id: 'collaborationRating', label: 'Collaboration' },
                { id: 'communicationRating', label: 'Communication' },
                { id: 'deliveryRating', label: 'Delivery' },
                { id: 'innovationRating', label: 'Innovation' },
                { id: 'overallRating', label: 'Overall' },
              ].map(rating => (
                <div key={rating.id}>
                  <label className="block text-sm font-medium text-slate-200 mb-1">{rating.label}</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, [rating.id]: star })}
                        className="p-1"
                      >
                        <svg
                          className={`w-8 h-8 ${
                            star <= (reviewForm[rating.id as keyof typeof reviewForm] as number)
                              ? 'text-amber-400'
                              : 'text-slate-200'
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
              ))}

              {/* Text Feedback */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">What did they do well?</label>
                <textarea
                  value={reviewForm.didWell}
                  onChange={(e) => setReviewForm({ ...reviewForm, didWell: e.target.value })}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  rows={2}
                  placeholder="Highlight their strengths..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">What needs improvement?</label>
                <textarea
                  value={reviewForm.needsImprovement}
                  onChange={(e) => setReviewForm({ ...reviewForm, needsImprovement: e.target.value })}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  rows={2}
                  placeholder="Areas for growth..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">What should they do differently?</label>
                <textarea
                  value={reviewForm.shouldDoDifferently}
                  onChange={(e) => setReviewForm({ ...reviewForm, shouldDoDifferently: e.target.value })}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg"
                  rows={2}
                  placeholder="Suggestions for the future..."
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reviewForm.isPublic}
                  onChange={(e) => setReviewForm({ ...reviewForm, isPublic: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-slate-200">Make this review visible to the team</span>
              </label>
            </div>
            <div className="p-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReviewModal(false)
                  setSelectedReviewee(null)
                }}
                className="px-4 py-2 border border-white/20 text-slate-200 rounded-lg hover:bg-slate-900/40"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
