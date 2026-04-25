'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDateShort } from '@/shared/utils/cn'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'
import InfoTip from '@/client/components/ui/InfoTip'
import { toast } from 'sonner'

interface Candidate {
  id: string
  name: string
  email: string
  phone: string | null
  position: string
  department: string
}

interface User {
  id: string
  firstName: string
  lastName: string | null
  department: string
}

interface Interview {
  id: string
  candidateId: string
  candidate: Candidate
  stage: string
  scheduledAt: string
  duration: number
  location: string | null
  meetingLink: string | null
  interviewerId: string | null
  interviewer: User | null
  status: string
  feedback: string | null
  rating: number | null
  decision: string | null
  notes: string | null
}

interface PendingCandidate {
  id: string
  name: string
  email: string
  phone: string | null
  position: string
  department: string
}

const STAGE_COLORS: Record<string, string> = {
  'PHONE_SCREEN': 'bg-blue-500/20 text-blue-800 border-blue-300',
  'MANAGER_INTERVIEW': 'bg-purple-500/20 text-purple-800 border-purple-300',
  'TEST_TASK': 'bg-orange-500/20 text-orange-400 border-orange-300',
  'FOUNDER_INTERVIEW': 'bg-green-500/20 text-green-800 border-green-300',
}

const STATUS_COLORS: Record<string, string> = {
  'SCHEDULED': 'bg-blue-500/20 text-blue-400',
  'COMPLETED': 'bg-green-500/20 text-green-400',
  'CANCELLED': 'bg-red-500/20 text-red-400',
  'NO_SHOW': 'bg-slate-800/50 text-slate-200',
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [pendingCandidates, setPendingCandidates] = useState<PendingCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [schedulingCandidate, setSchedulingCandidate] = useState<PendingCandidate | null>(null)

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    setLoading(true)
    try {
      const [interviewsRes, candidatesRes] = await Promise.all([
        fetch('/api/hr/interviews'),
        fetch('/api/hr/interviews/pending-candidates'),
      ])

      if (interviewsRes.ok) {
        const data = await interviewsRes.json()
        setInterviews(data.interviews)
      }

      if (candidatesRes.ok) {
        const data = await candidatesRes.json()
        setPendingCandidates(data.candidates || [])
      }
    } catch (error) {
      console.error('Failed to fetch interviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSchedulePending = async (candidateId: string, scheduledAt: string, stage: string, interviewerId: string, duration: number, meetingLink: string) => {
    try {
      const res = await fetch('/api/hr/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, scheduledAt, stage, interviewerId, duration, meetingLink }),
      })
      if (res.ok) {
        toast.success('Interview scheduled successfully')
        setSchedulingCandidate(null)
        fetchInterviews()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to schedule interview')
      }
    } catch {
      toast.error('Failed to schedule interview')
    }
  }

  const filteredInterviews = interviews.filter(i => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return i.status === 'SCHEDULED' && new Date(i.scheduledAt) >= new Date()
    if (filter === 'completed') return i.status === 'COMPLETED'
    if (filter === 'today') {
      const today = new Date().toDateString()
      return new Date(i.scheduledAt).toDateString() === today
    }
    return true
  })

  const todayInterviews = interviews.filter(i => {
    const today = new Date().toDateString()
    return new Date(i.scheduledAt).toDateString() === today && i.status === 'SCHEDULED'
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Interview Schedule</h1>
            <InfoTooltip
              title="Managing Interviews"
              steps={[
                'View all scheduled interviews across stages',
                'Click on an interview to add feedback',
                'Use filters to find specific interviews',
                'Schedule new interviews from Hiring Pipeline'
              ]}
              tips={[
                'Prepare questions before interviews',
                'Add feedback immediately after each call',
                'Check Google Calendar for conflicts'
              ]}
            />
          </div>
          <p className="text-slate-400 text-sm mt-1">Manage candidate interviews across all stages</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-white/10 rounded-lg text-sm"
          >
            <option value="all">All Interviews</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
          <Link
            href="/hiring"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            View Pipeline
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total Interviews</p>
          <p className="text-2xl font-bold text-white">{interviews.length}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Today</p>
          <p className="text-2xl font-bold text-blue-400">{todayInterviews.length}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Completed</p>
          <p className="text-2xl font-bold text-green-400">
            {interviews.filter(i => i.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Upcoming</p>
          <p className="text-2xl font-bold text-purple-400">
            {interviews.filter(i => i.status === 'SCHEDULED').length}
          </p>
        </div>
        <div className="bg-orange-500/10 rounded-xl border border-orange-200 p-4">
          <p className="text-sm text-orange-400">Awaiting Schedule</p>
          <p className="text-2xl font-bold text-orange-400">
            {pendingCandidates.length}
          </p>
        </div>
      </div>

      {/* Today's Interviews Banner */}
      {todayInterviews.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
          <h3 className="font-semibold mb-2">Today&apos;s Interviews ({todayInterviews.length})</h3>
          <div className="flex flex-wrap gap-2">
            {todayInterviews.map(interview => (
              <div key={interview.id} className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                <p className="font-medium">{interview.candidate.name}</p>
                <p className="text-sm text-white/80">
                  {new Date(interview.scheduledAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} - {interview.stage.replace(/_/g, ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interview List */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/40 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Candidate</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Position</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Stage</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Date & Time</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Interviewer</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Decision</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {/* Pending Candidates (not yet scheduled) */}
              {pendingCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-orange-500/5">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{candidate.name}</p>
                      <p className="text-xs text-slate-400">{candidate.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-200">{candidate.position}</p>
                    <p className="text-xs text-slate-400">{candidate.department}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full border bg-orange-500/20 text-orange-400 border-orange-300">
                      INTERVIEW
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-400">Not scheduled</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-400">-</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">
                      AWAITING SCHEDULE
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-400">-</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSchedulingCandidate(candidate)}
                      className="text-sm text-orange-400 hover:text-orange-300 font-medium"
                    >
                      Schedule Interview
                    </button>
                  </td>
                </tr>
              ))}

              {/* Scheduled Interviews */}
              {filteredInterviews.length === 0 && pendingCandidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No interviews found
                  </td>
                </tr>
              ) : (
                filteredInterviews.map((interview) => (
                  <tr key={interview.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{interview.candidate.name}</p>
                        <p className="text-xs text-slate-400">{interview.candidate.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-200">{interview.candidate.position}</p>
                      <p className="text-xs text-slate-400">{interview.candidate.department}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${STAGE_COLORS[interview.stage] || 'bg-slate-800/50 text-slate-200'}`}>
                        {interview.stage.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-200">
                        {formatDateShort(interview.scheduledAt)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(interview.scheduledAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} ({interview.duration} min)
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {interview.interviewer ? (
                        <p className="text-sm text-slate-200">
                          {interview.interviewer.firstName} {interview.interviewer.lastName}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-400">Not assigned</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[interview.status] || 'bg-slate-800/50 text-slate-200'}`}>
                        {interview.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {interview.decision ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          interview.decision === 'ADVANCE' ? 'bg-green-500/20 text-green-400' :
                          interview.decision === 'REJECT' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {interview.decision}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedInterview(interview)}
                        className="text-sm text-blue-400 hover:text-blue-400"
                      >
                        {interview.status === 'SCHEDULED' ? 'Add Feedback' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback Modal */}
      {selectedInterview && (
        <FeedbackModal
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
          onSave={() => {
            setSelectedInterview(null)
            fetchInterviews()
          }}
        />
      )}

      {/* Schedule Interview Modal */}
      {schedulingCandidate && (
        <ScheduleInterviewModal
          candidate={schedulingCandidate}
          onClose={() => setSchedulingCandidate(null)}
          onSchedule={handleSchedulePending}
        />
      )}
    </div>
  )
}

// Feedback Modal Component
function FeedbackModal({
  interview,
  onClose,
  onSave
}: {
  interview: Interview
  onClose: () => void
  onSave: () => void
}) {
  const [feedback, setFeedback] = useState(interview.feedback || '')
  const [rating, setRating] = useState(interview.rating || 0)
  const [decision, setDecision] = useState(interview.decision || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/hr/interviews/${interview.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback,
          rating,
          decision,
          status: decision ? 'COMPLETED' : interview.status
        })
      })

      if (res.ok) {
        toast.success('Feedback saved successfully')
        onSave()
      } else {
        toast.error('Failed to save feedback')
      }
    } catch (error) {
      console.error('Failed to save feedback:', error)
      toast.error('Failed to save feedback')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Interview Feedback</h2>
          <p className="text-sm text-slate-400 mt-1">
            {interview.candidate.name} - {interview.stage.replace(/_/g, ' ')}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Rating<InfoTip text="1 = Definite No, 2 = Weak No, 3 = Maybe, 4 = Hire, 5 = Strong Hire." /></label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  onClick={() => setRating(r)}
                  className={`w-10 h-10 rounded-lg border-2 font-medium transition-all ${
                    rating >= r
                      ? 'bg-yellow-400 border-yellow-400 text-white'
                      : 'glass-card border-white/10 text-slate-400 hover:border-yellow-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Feedback<InfoTip text="Post-interview assessment. Include strengths, concerns, and hire recommendation." /></label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Share your observations about the candidate..."
            />
          </div>

          {/* Decision */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Decision<InfoTip text="ADVANCE = move to next round, HOLD = need more info, REJECT = not a fit." /></label>
            <div className="flex gap-2">
              <button
                onClick={() => setDecision('ADVANCE')}
                className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                  decision === 'ADVANCE'
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'glass-card border-white/10 text-slate-300 hover:border-green-300'
                }`}
              >
                Advance
              </button>
              <button
                onClick={() => setDecision('HOLD')}
                className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                  decision === 'HOLD'
                    ? 'bg-yellow-500 border-yellow-500 text-white'
                    : 'glass-card border-white/10 text-slate-300 hover:border-yellow-300'
                }`}
              >
                Hold
              </button>
              <button
                onClick={() => setDecision('REJECT')}
                className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                  decision === 'REJECT'
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'glass-card border-white/10 text-slate-300 hover:border-red-300'
                }`}
              >
                Reject
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-900/40"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Feedback'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Schedule Interview Modal for pending candidates
function ScheduleInterviewModal({
  candidate,
  onClose,
  onSchedule,
}: {
  candidate: PendingCandidate
  onClose: () => void
  onSchedule: (candidateId: string, scheduledAt: string, stage: string, interviewerId: string, duration: number, meetingLink: string) => Promise<void>
}) {
  const [stage, setStage] = useState('PHONE_SCREEN')
  const [scheduledAt, setScheduledAt] = useState('')
  const [duration, setDuration] = useState(30)
  const [meetingLink, setMeetingLink] = useState('')
  const [interviewerId, setInterviewerId] = useState('')
  const [interviewers, setInterviewers] = useState<{ id: string; firstName: string; lastName: string | null }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch team members who can conduct interviews
    const fetchInterviewers = async () => {
      try {
        const res = await fetch('/api/users?active=true')
        if (res.ok) {
          const data = await res.json()
          setInterviewers(data.filter((u: { role: string }) => ['SUPER_ADMIN', 'MANAGER', 'HR'].includes(u.role)))
        }
      } catch (error) {
        console.error('Failed to fetch interviewers:', error)
      }
    }
    fetchInterviewers()
  }, [])

  const handleSchedule = async () => {
    if (!scheduledAt || !stage) return
    setLoading(true)
    await onSchedule(candidate.id, scheduledAt, stage, interviewerId, duration, meetingLink)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Schedule Interview</h2>
          <p className="text-sm text-slate-400 mt-1">
            {candidate.name} - {candidate.position}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Stage */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Interview Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="PHONE_SCREEN">Phone Screen</option>
              <option value="MANAGER_INTERVIEW">Manager Interview</option>
              <option value="TEST_TASK">Test Task</option>
              <option value="FOUNDER_INTERVIEW">Founder Interview</option>
            </select>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Date & Time</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Duration (minutes)</label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-white/10 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </div>

          {/* Interviewer */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Interviewer (optional)</label>
            <select
              value={interviewerId}
              onChange={(e) => setInterviewerId(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select interviewer...</option>
              {interviewers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName || ''}
                </option>
              ))}
            </select>
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Meeting Link (optional)</label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full px-3 py-2 border border-white/10 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-900/40"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={loading || !scheduledAt}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Scheduling...' : 'Schedule Interview'}
          </button>
        </div>
      </div>
    </div>
  )
}

