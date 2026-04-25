'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { safeJsonParse } from '@/shared/utils/safeJson'
import {
  Users, Clock, CheckCircle2, XCircle, Star, CalendarDays, FileText,
  ClipboardList, Award, Briefcase, MapPin, IndianRupee, ExternalLink,
  ChevronDown, ChevronUp, X, Loader2, Search, Filter, Eye,
  Send, MessageSquare, AlertCircle, Building2, Phone, Mail,
  Globe, Linkedin, Github, GraduationCap, Heart, RefreshCw,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Candidate {
  id: string
  name: string
  email: string
  phone: string | null
  position: string | null
  department: string | null
  source: string | null
  status: string
  currentStage: string | null
}

interface CandidateAssessment {
  id: string
  token: string
  completed: boolean
  hrStatus: string
  fullName: string | null
  email: string | null
  phone: string | null
  currentCity: string | null
  dateOfBirth: string | null
  totalExperience: number | null
  currentCompany: string | null
  currentRole: string | null
  currentSalary: number | null
  expectedSalary: number | null
  noticePeriod: string | null
  reasonForLeaving: string | null
  canWorkFromOffice: boolean | null
  commuteDetails: string | null
  readyForTrial: boolean | null
  trialAvailability: string | null
  joiningTimeline: string | null
  hasHealthcareExp: boolean | null
  healthcareDetails: string | null
  healthcareClients: string | null
  primarySkills: string | null
  tools: string | null
  certifications: string | null
  languagesKnown: string | null
  resumeUrl: string | null
  linkedInUrl: string | null
  portfolioUrl: string | null
  githubUrl: string | null
  caseStudyUrl: string | null
  workSampleUrls: string | null
  whyThisRole: string | null
  biggestAchievement: string | null
  challengeExample: string | null
  teamWorkStyle: string | null
  learningApproach: string | null
  salaryNegotiable: boolean | null
  availableForCalls: boolean | null
  preferredCallTime: string | null
  relevanceRating: number | null
  strengthAreas: string | null
  improvementAreas: string | null
  referenceContacts: string | null
  additionalInfo: string | null
  questionsForUs: string | null
  hrNotes: string | null
  shortlistedAt: string | null
  shortlistedBy: string | null
  interviewDate: string | null
  interviewMode: string | null
  interviewNotes: string | null
  interviewRating: number | null
  taskTitle: string | null
  taskDescription: string | null
  taskDeadline: string | null
  taskAssignedAt: string | null
  taskSubmissionUrl: string | null
  taskSubmittedAt: string | null
  taskScore: number | null
  taskFeedback: string | null
  finalRoundDate: string | null
  finalRoundNotes: string | null
  finalRoundDecision: string | null
  offerSalary: number | null
  offerDate: string | null
  offerAccepted: boolean | null
  joiningDate: string | null
  createdAt: string
  candidate: Candidate
}

interface PipelineStats {
  total: number
  pending: number
  completed: number
  shortlisted: number
  interviewScheduled: number
  taskAssigned: number
  taskSubmitted: number
  finalRound: number
  selected: number
  rejected: number
}

type ModalType =
  | 'interview'
  | 'task'
  | 'reviewTask'
  | 'finalRound'
  | 'reject'
  | 'offer'
  | null

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_OPTIONS = [
  'All',
  'PENDING_REVIEW',
  'SHORTLISTED',
  'INTERVIEW_SCHEDULED',
  'TASK_ASSIGNED',
  'TASK_SUBMITTED',
  'FINAL_ROUND',
  'SELECTED',
  'REJECTED',
] as const

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_REVIEW: { label: 'Pending Review', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30' },
  SHORTLISTED: { label: 'Shortlisted', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' },
  INTERVIEW_SCHEDULED: { label: 'Interview', color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30' },
  TASK_ASSIGNED: { label: 'Task Assigned', color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/30' },
  TASK_SUBMITTED: { label: 'Task Submitted', color: 'text-cyan-400', bg: 'bg-cyan-500/20 border-cyan-500/30' },
  FINAL_ROUND: { label: 'Final Round', color: 'text-indigo-400', bg: 'bg-indigo-500/20 border-indigo-500/30' },
  SELECTED: { label: 'Selected', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' },
  REJECTED: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' },
}

const STAT_CARDS = [
  { key: 'pending', label: 'Pending Review', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { key: 'shortlisted', label: 'Shortlisted', icon: Star, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { key: 'interviewScheduled', label: 'Interview', icon: CalendarDays, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { key: 'taskAssigned', label: 'Task Assigned', icon: ClipboardList, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { key: 'taskSubmitted', label: 'Task Submitted', icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { key: 'finalRound', label: 'Final Round', icon: Award, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { key: 'selected', label: 'Selected', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
  { key: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
] as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatSalary(amount: number | null): string {
  if (amount == null) return '-'
  if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
  return amount.toString()
}

function statusLabel(status: string): string {
  return STATUS_CONFIG[status]?.label ?? status.replace(/_/g, ' ')
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AssessmentPipelinePage() {
  const [assessments, setAssessments] = useState<CandidateAssessment[]>([])
  const [stats, setStats] = useState<PipelineStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [filterDepartment, setFilterDepartment] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Modal state
  const [modalType, setModalType] = useState<ModalType>(null)
  const [modalAssessment, setModalAssessment] = useState<CandidateAssessment | null>(null)

  // Modal form data
  const [interviewForm, setInterviewForm] = useState({ date: '', time: '', mode: 'Office', notes: '' })
  const [taskForm, setTaskForm] = useState({ title: '', description: '', deadline: '' })
  const [reviewTaskForm, setReviewTaskForm] = useState({ score: 5, feedback: '' })
  const [finalRoundForm, setFinalRoundForm] = useState({ notes: '', decision: '' })
  const [rejectForm, setRejectForm] = useState({ reason: '' })
  const [offerForm, setOfferForm] = useState({ salary: '', joiningDate: '' })

  // Editable HR Notes
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null)
  const [notesValue, setNotesValue] = useState('')

  // -----------------------------------------------------------------------
  // Fetch data
  // -----------------------------------------------------------------------

  const fetchPipeline = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'All') params.set('status', filterStatus)
      if (filterDepartment !== 'All') params.set('department', filterDepartment)

      const res = await fetch(`/api/hr/assessment/pipeline?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setAssessments(data.assessments ?? [])
      setStats(data.stats ?? null)
    } catch (err) {
      console.error('Pipeline fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterDepartment])

  useEffect(() => {
    fetchPipeline()
  }, [fetchPipeline])

  // -----------------------------------------------------------------------
  // PATCH helper
  // -----------------------------------------------------------------------

  const patchAssessment = async (token: string, body: Record<string, unknown>) => {
    setActionLoading(token)
    try {
      const res = await fetch(`/api/hr/assessment/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Update failed')
      }
      await fetchPipeline()
    } catch (err) {
      console.error('Patch error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setActionLoading(null)
    }
  }

  // -----------------------------------------------------------------------
  // Quick actions
  // -----------------------------------------------------------------------

  const handleShortlist = (a: CandidateAssessment) =>
    patchAssessment(a.token, { hrStatus: 'SHORTLISTED' })

  const handleQuickReject = (a: CandidateAssessment) => {
    setModalAssessment(a)
    setRejectForm({ reason: '' })
    setModalType('reject')
  }

  const handleMarkTaskSubmitted = (a: CandidateAssessment) =>
    patchAssessment(a.token, { hrStatus: 'TASK_SUBMITTED', taskSubmittedAt: new Date().toISOString() })

  const handleMoveToTask = (a: CandidateAssessment) => {
    setModalAssessment(a)
    setTaskForm({ title: '', description: '', deadline: '' })
    setModalType('task')
  }

  const handleScheduleInterview = (a: CandidateAssessment) => {
    setModalAssessment(a)
    setInterviewForm({ date: '', time: '', mode: 'Office', notes: '' })
    setModalType('interview')
  }

  const handleReviewTask = (a: CandidateAssessment) => {
    setModalAssessment(a)
    setReviewTaskForm({ score: a.taskScore ?? 5, feedback: a.taskFeedback ?? '' })
    setModalType('reviewTask')
  }

  const handleMoveToFinalRound = (a: CandidateAssessment) =>
    patchAssessment(a.token, { hrStatus: 'FINAL_ROUND' })

  const handleFinalRound = (a: CandidateAssessment) => {
    setModalAssessment(a)
    setFinalRoundForm({ notes: '', decision: '' })
    setModalType('finalRound')
  }

  const handleSelect = (a: CandidateAssessment) =>
    patchAssessment(a.token, { hrStatus: 'SELECTED', finalRoundDecision: 'SELECTED' })

  const handleHold = (a: CandidateAssessment) =>
    patchAssessment(a.token, { finalRoundDecision: 'HOLD', finalRoundNotes: 'On hold' })

  const handleSendOffer = (a: CandidateAssessment) => {
    setModalAssessment(a)
    setOfferForm({ salary: a.expectedSalary?.toString() ?? '', joiningDate: '' })
    setModalType('offer')
  }

  // -----------------------------------------------------------------------
  // Modal submissions
  // -----------------------------------------------------------------------

  const submitInterview = async () => {
    if (!modalAssessment || !interviewForm.date || !interviewForm.time) return
    const dateTime = new Date(`${interviewForm.date}T${interviewForm.time}`)
    await patchAssessment(modalAssessment.token, {
      hrStatus: 'INTERVIEW_SCHEDULED',
      interviewDate: dateTime.toISOString(),
      interviewMode: interviewForm.mode,
      interviewNotes: interviewForm.notes,
    })
    setModalType(null)
  }

  const submitTask = async () => {
    if (!modalAssessment || !taskForm.title) return
    await patchAssessment(modalAssessment.token, {
      hrStatus: 'TASK_ASSIGNED',
      taskTitle: taskForm.title,
      taskDescription: taskForm.description,
      taskDeadline: taskForm.deadline ? new Date(taskForm.deadline).toISOString() : undefined,
    })
    setModalType(null)
  }

  const submitReviewTask = async () => {
    if (!modalAssessment) return
    await patchAssessment(modalAssessment.token, {
      taskScore: reviewTaskForm.score,
      taskFeedback: reviewTaskForm.feedback,
    })
    setModalType(null)
  }

  const submitFinalRound = async () => {
    if (!modalAssessment || !finalRoundForm.decision) return
    const body: Record<string, unknown> = {
      finalRoundNotes: finalRoundForm.notes,
      finalRoundDecision: finalRoundForm.decision,
    }
    if (finalRoundForm.decision === 'SELECTED') body.hrStatus = 'SELECTED'
    if (finalRoundForm.decision === 'REJECTED') body.hrStatus = 'REJECTED'
    await patchAssessment(modalAssessment.token, body)
    setModalType(null)
  }

  const submitReject = async () => {
    if (!modalAssessment) return
    await patchAssessment(modalAssessment.token, {
      hrStatus: 'REJECTED',
      hrNotes: rejectForm.reason
        ? `${modalAssessment.hrNotes ? modalAssessment.hrNotes + '\n' : ''}Rejection reason: ${rejectForm.reason}`
        : modalAssessment.hrNotes,
    })
    setModalType(null)
  }

  const submitOffer = async () => {
    if (!modalAssessment || !offerForm.salary) return
    await patchAssessment(modalAssessment.token, {
      offerSalary: parseFloat(offerForm.salary),
      offerDate: new Date().toISOString(),
      joiningDate: offerForm.joiningDate ? new Date(offerForm.joiningDate).toISOString() : undefined,
    })
    setModalType(null)
  }

  const saveHrNotes = async (a: CandidateAssessment) => {
    await patchAssessment(a.token, { hrNotes: notesValue })
    setEditingNotesId(null)
  }

  // -----------------------------------------------------------------------
  // Derived
  // -----------------------------------------------------------------------

  const departments = Array.from(
    new Set(assessments.map((a) => a.candidate?.department).filter(Boolean))
  ) as string[]

  const filtered = assessments.filter((a) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const name = (a.fullName || a.candidate?.name || '').toLowerCase()
      const pos = (a.candidate?.position || '').toLowerCase()
      const email = (a.email || a.candidate?.email || '').toLowerCase()
      if (!name.includes(q) && !pos.includes(q) && !email.includes(q)) return false
    }
    return true
  })

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------

  const renderStatusBadge = (status: string) => {
    const cfg = STATUS_CONFIG[status]
    if (!cfg) return <span className="text-xs text-slate-400">{status}</span>
    return (
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
        {cfg.label}
      </span>
    )
  }

  const renderCompletionBadge = (completed: boolean) => (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
        completed
          ? 'bg-green-500/20 border border-green-500/30 text-green-400'
          : 'bg-slate-500/20 border border-slate-500/30 text-slate-400'
      }`}
    >
      {completed ? 'Completed' : 'Incomplete'}
    </span>
  )

  const renderActionButtons = (a: CandidateAssessment) => {
    const isLoading = actionLoading === a.token
    const btnBase =
      'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5'

    const buttons: React.ReactElement[] = []

    switch (a.hrStatus) {
      case 'PENDING_REVIEW':
        buttons.push(
          <button key="shortlist" disabled={isLoading} onClick={() => handleShortlist(a)} className={`${btnBase} bg-green-500/20 text-green-400 hover:bg-green-500/30`}>
            <CheckCircle2 size={14} /> Shortlist
          </button>,
          <button key="reject" disabled={isLoading} onClick={() => handleQuickReject(a)} className={`${btnBase} bg-red-500/20 text-red-400 hover:bg-red-500/30`}>
            <XCircle size={14} /> Reject
          </button>,
          <button key="view" onClick={() => setExpandedId(expandedId === a.id ? null : a.id)} className={`${btnBase} bg-blue-500/20 text-blue-400 hover:bg-blue-500/30`}>
            <Eye size={14} /> View Assessment
          </button>,
        )
        break
      case 'SHORTLISTED':
        buttons.push(
          <button key="interview" disabled={isLoading} onClick={() => handleScheduleInterview(a)} className={`${btnBase} bg-purple-500/20 text-purple-400 hover:bg-purple-500/30`}>
            <CalendarDays size={14} /> Schedule Interview
          </button>,
          <button key="task" disabled={isLoading} onClick={() => handleMoveToTask(a)} className={`${btnBase} bg-orange-500/20 text-orange-400 hover:bg-orange-500/30`}>
            <ClipboardList size={14} /> Assign Task
          </button>,
          <button key="view" onClick={() => setExpandedId(expandedId === a.id ? null : a.id)} className={`${btnBase} bg-blue-500/20 text-blue-400 hover:bg-blue-500/30`}>
            <Eye size={14} /> View Assessment
          </button>,
        )
        break
      case 'INTERVIEW_SCHEDULED':
        buttons.push(
          <button key="notes" disabled={isLoading} onClick={() => { setEditingNotesId(a.id); setNotesValue(a.interviewNotes || '') }} className={`${btnBase} bg-blue-500/20 text-blue-400 hover:bg-blue-500/30`}>
            <MessageSquare size={14} /> Add Interview Notes
          </button>,
          <button key="task" disabled={isLoading} onClick={() => handleMoveToTask(a)} className={`${btnBase} bg-orange-500/20 text-orange-400 hover:bg-orange-500/30`}>
            <ClipboardList size={14} /> Move to Task
          </button>,
          <button key="reject" disabled={isLoading} onClick={() => handleQuickReject(a)} className={`${btnBase} bg-red-500/20 text-red-400 hover:bg-red-500/30`}>
            <XCircle size={14} /> Reject
          </button>,
        )
        break
      case 'TASK_ASSIGNED':
        buttons.push(
          <button key="viewTask" onClick={() => setExpandedId(expandedId === a.id ? null : a.id)} className={`${btnBase} bg-blue-500/20 text-blue-400 hover:bg-blue-500/30`}>
            <Eye size={14} /> View Task
          </button>,
          <button key="submitted" disabled={isLoading} onClick={() => handleMarkTaskSubmitted(a)} className={`${btnBase} bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30`}>
            <FileText size={14} /> Mark Task Submitted
          </button>,
        )
        break
      case 'TASK_SUBMITTED':
        buttons.push(
          <button key="review" disabled={isLoading} onClick={() => handleReviewTask(a)} className={`${btnBase} bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30`}>
            <Star size={14} /> Review Task
          </button>,
          <button key="final" disabled={isLoading} onClick={() => handleMoveToFinalRound(a)} className={`${btnBase} bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30`}>
            <Award size={14} /> Move to Final Round
          </button>,
          <button key="reject" disabled={isLoading} onClick={() => handleQuickReject(a)} className={`${btnBase} bg-red-500/20 text-red-400 hover:bg-red-500/30`}>
            <XCircle size={14} /> Reject
          </button>,
        )
        break
      case 'FINAL_ROUND':
        buttons.push(
          <button key="select" disabled={isLoading} onClick={() => handleSelect(a)} className={`${btnBase} bg-green-500/20 text-green-400 hover:bg-green-500/30`}>
            <CheckCircle2 size={14} /> Select
          </button>,
          <button key="reject" disabled={isLoading} onClick={() => handleQuickReject(a)} className={`${btnBase} bg-red-500/20 text-red-400 hover:bg-red-500/30`}>
            <XCircle size={14} /> Reject
          </button>,
          <button key="hold" disabled={isLoading} onClick={() => handleHold(a)} className={`${btnBase} bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30`}>
            <Clock size={14} /> Hold
          </button>,
        )
        break
      case 'SELECTED':
        buttons.push(
          <button key="offer" disabled={isLoading} onClick={() => handleSendOffer(a)} className={`${btnBase} bg-green-500/20 text-green-400 hover:bg-green-500/30`}>
            <Send size={14} /> Send Offer
          </button>,
        )
        break
    }

    return <div className="flex flex-wrap gap-2">{buttons}</div>
  }

  // -----------------------------------------------------------------------
  // Assessment detail panel
  // -----------------------------------------------------------------------

  const renderDetailPanel = (a: CandidateAssessment) => {
    const skills = safeJsonParse<string[]>(a.primarySkills, [])
    const toolsList = safeJsonParse<string[]>(a.tools, [])
    const strengths = safeJsonParse<string[]>(a.strengthAreas, [])
    const improvements = safeJsonParse<string[]>(a.improvementAreas, [])
    const languages = safeJsonParse<string[]>(a.languagesKnown, [])
    const workSamples = safeJsonParse<string[]>(a.workSampleUrls, [])
    const references = safeJsonParse<Array<{ name?: string; contact?: string; relation?: string }>>(a.referenceContacts, [])

    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white border-b border-white/10 pb-2">{title}</h4>
        {children}
      </div>
    )

    const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-sm text-slate-300">{value || '-'}</span>
      </div>
    )

    return (
      <div className="border-t border-white/10 bg-slate-900/60 p-6 space-y-6 animate-in slide-in-from-top-2">
        {/* Personal Info */}
        <Section title="Personal Information">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Full Name" value={a.fullName} />
            <Field label="Email" value={a.email} />
            <Field label="Phone" value={a.phone} />
            <Field label="City" value={a.currentCity} />
            <Field label="Date of Birth" value={formatDate(a.dateOfBirth)} />
          </div>
          <div className="flex gap-3 mt-2">
            {a.linkedInUrl && (
              <a href={a.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs">
                <Linkedin size={14} /> LinkedIn
              </a>
            )}
            {a.portfolioUrl && (
              <a href={a.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs">
                <Globe size={14} /> Portfolio
              </a>
            )}
            {a.githubUrl && (
              <a href={a.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs">
                <Github size={14} /> GitHub
              </a>
            )}
          </div>
        </Section>

        {/* Professional */}
        <Section title="Professional Background">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Experience" value={a.totalExperience != null ? `${a.totalExperience} years` : null} />
            <Field label="Current Company" value={a.currentCompany} />
            <Field label="Current Role" value={a.currentRole} />
            <Field label="Current Salary" value={a.currentSalary != null ? `${formatSalary(a.currentSalary)}/yr` : null} />
            <Field label="Expected Salary" value={a.expectedSalary != null ? `${formatSalary(a.expectedSalary)}/yr` : null} />
            <Field label="Notice Period" value={a.noticePeriod} />
            <Field label="Reason for Leaving" value={a.reasonForLeaving} />
            <Field label="Joining Timeline" value={a.joiningTimeline} />
          </div>
        </Section>

        {/* Skills */}
        <Section title="Skills & Tools">
          <div className="space-y-3">
            {skills.length > 0 && (
              <div>
                <span className="text-xs text-slate-500 block mb-1">Primary Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s, i) => (
                    <span key={`skill-${s}-${i}`} className="text-xs bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {toolsList.length > 0 && (
              <div>
                <span className="text-xs text-slate-500 block mb-1">Tools</span>
                <div className="flex flex-wrap gap-1.5">
                  {toolsList.map((t, i) => (
                    <span key={`tool-${t}-${i}`} className="text-xs bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            )}
            {a.certifications && <Field label="Certifications" value={a.certifications} />}
            {languages.length > 0 && (
              <Field label="Languages" value={languages.join(', ')} />
            )}
          </div>
        </Section>

        {/* Role Fit */}
        <Section title="Role Fit">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Can Work from Office" value={a.canWorkFromOffice != null ? (a.canWorkFromOffice ? 'Yes' : 'No') : null} />
            <Field label="Commute Details" value={a.commuteDetails} />
            <Field label="Ready for Trial" value={a.readyForTrial != null ? (a.readyForTrial ? 'Yes' : 'No') : null} />
            <Field label="Trial Availability" value={a.trialAvailability} />
          </div>
        </Section>

        {/* Healthcare */}
        {(a.hasHealthcareExp != null) && (
          <Section title="Healthcare Experience">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Has Healthcare Exp" value={a.hasHealthcareExp ? 'Yes' : 'No'} />
              <Field label="Details" value={a.healthcareDetails} />
              <Field label="Clients" value={a.healthcareClients} />
            </div>
          </Section>
        )}

        {/* Work Samples */}
        {(workSamples.length > 0 || a.caseStudyUrl) && (
          <Section title="Work Samples">
            <div className="space-y-1">
              {workSamples.map((url, i) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1">
                  <ExternalLink size={12} /> {url}
                </a>
              ))}
              {a.caseStudyUrl && (
                <a href={a.caseStudyUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1">
                  <ExternalLink size={12} /> Case Study
                </a>
              )}
            </div>
          </Section>
        )}

        {/* Screening Answers */}
        <Section title="Screening Questions">
          <div className="space-y-4">
            <Field label="Why This Role?" value={a.whyThisRole} />
            <Field label="Biggest Achievement" value={a.biggestAchievement} />
            <Field label="Challenge Example" value={a.challengeExample} />
            <Field label="Team Work Style" value={a.teamWorkStyle} />
            <Field label="Learning Approach" value={a.learningApproach} />
            <Field label="Salary Negotiable" value={a.salaryNegotiable != null ? (a.salaryNegotiable ? 'Yes' : 'No') : null} />
            <Field label="Available for Calls" value={a.availableForCalls != null ? (a.availableForCalls ? 'Yes' : 'No') : null} />
            <Field label="Preferred Call Time" value={a.preferredCallTime} />
          </div>
        </Section>

        {/* Self Assessment */}
        <Section title="Self Assessment">
          <div className="space-y-3">
            <Field label="Relevance Rating" value={a.relevanceRating != null ? `${a.relevanceRating}/10` : null} />
            {strengths.length > 0 && (
              <div>
                <span className="text-xs text-slate-500 block mb-1">Strength Areas</span>
                <div className="flex flex-wrap gap-1.5">
                  {strengths.map((s, i) => (
                    <span key={`strength-${s}-${i}`} className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {improvements.length > 0 && (
              <div>
                <span className="text-xs text-slate-500 block mb-1">Improvement Areas</span>
                <div className="flex flex-wrap gap-1.5">
                  {improvements.map((s, i) => (
                    <span key={`improve-${s}-${i}`} className="text-xs bg-yellow-500/15 text-yellow-400 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* References */}
        {references.length > 0 && (
          <Section title="References">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {references.map((r, i) => (
                <div key={`ref-${r.name || i}`} className="bg-slate-800/50 rounded-lg p-3 text-xs space-y-1">
                  <div className="text-white font-medium">{r.name || 'Unknown'}</div>
                  {r.relation && <div className="text-slate-400">{r.relation}</div>}
                  {r.contact && <div className="text-slate-400">{r.contact}</div>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Additional */}
        {(a.additionalInfo || a.questionsForUs) && (
          <Section title="Additional">
            {a.additionalInfo && <Field label="Additional Info" value={a.additionalInfo} />}
            {a.questionsForUs && <Field label="Questions for Us" value={a.questionsForUs} />}
          </Section>
        )}

        {/* HR Pipeline Info */}
        {(a.interviewDate || a.taskTitle || a.finalRoundNotes || a.offerSalary != null) && (
          <Section title="Pipeline Progress">
            <div className="space-y-3">
              {a.interviewDate && (
                <div className="bg-purple-500/10 rounded-lg p-3 space-y-1">
                  <div className="text-xs font-medium text-purple-400">Interview</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <Field label="Date" value={formatDate(a.interviewDate)} />
                    <Field label="Mode" value={a.interviewMode} />
                    <Field label="Rating" value={a.interviewRating != null ? `${a.interviewRating}/10` : null} />
                    <Field label="Notes" value={a.interviewNotes} />
                  </div>
                </div>
              )}
              {a.taskTitle && (
                <div className="bg-orange-500/10 rounded-lg p-3 space-y-1">
                  <div className="text-xs font-medium text-orange-400">Task</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <Field label="Title" value={a.taskTitle} />
                    <Field label="Deadline" value={formatDate(a.taskDeadline)} />
                    <Field label="Score" value={a.taskScore != null ? `${a.taskScore}/10` : null} />
                    <Field label="Feedback" value={a.taskFeedback} />
                  </div>
                  {a.taskDescription && <Field label="Description" value={a.taskDescription} />}
                  {a.taskSubmissionUrl && (
                    <a href={a.taskSubmissionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 mt-1">
                      <ExternalLink size={12} /> Submission
                    </a>
                  )}
                </div>
              )}
              {a.offerSalary != null && (
                <div className="bg-green-500/10 rounded-lg p-3 space-y-1">
                  <div className="text-xs font-medium text-green-400">Offer</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <Field label="Offer Salary" value={formatSalary(a.offerSalary)} />
                    <Field label="Offer Date" value={formatDate(a.offerDate)} />
                    <Field label="Accepted" value={a.offerAccepted != null ? (a.offerAccepted ? 'Yes' : 'No') : 'Pending'} />
                    <Field label="Joining Date" value={formatDate(a.joiningDate)} />
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // Modals
  // -----------------------------------------------------------------------

  const renderModal = () => {
    if (!modalType || !modalAssessment) return null

    const candidateName = modalAssessment.fullName || modalAssessment.candidate?.name || 'Candidate'
    const isSubmitting = actionLoading === modalAssessment.token

    const Overlay = ({ title, children, onSubmit }: { title: string; children: React.ReactNode; onSubmit: () => void }) => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="p-5 space-y-4">{children}</div>
          <div className="flex justify-end gap-3 p-5 border-t border-white/10">
            <button onClick={() => setModalType(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Confirm
            </button>
          </div>
        </div>
      </div>
    )

    const inputClass = 'w-full bg-slate-800/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50'
    const labelClass = 'block text-sm font-medium text-slate-300 mb-1'

    switch (modalType) {
      case 'interview':
        return (
          <Overlay title={`Schedule Interview - ${candidateName}`} onSubmit={submitInterview}>
            <div>
              <label className={labelClass}>Date *</label>
              <input type="date" value={interviewForm.date} onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Time *</label>
              <input type="time" value={interviewForm.time} onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Mode</label>
              <select value={interviewForm.mode} onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })} className={inputClass}>
                <option value="Office">Office</option>
                <option value="Video">Video Call</option>
                <option value="Phone">Phone</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Notes</label>
              <textarea value={interviewForm.notes} onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })} rows={3} className={inputClass} placeholder="Interview notes..." />
            </div>
          </Overlay>
        )
      case 'task':
        return (
          <Overlay title={`Assign Task - ${candidateName}`} onSubmit={submitTask}>
            <div>
              <label className={labelClass}>Task Title *</label>
              <input type="text" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className={inputClass} placeholder="e.g. Build a landing page" />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} rows={4} className={inputClass} placeholder="Task description and requirements..." />
            </div>
            <div>
              <label className={labelClass}>Deadline</label>
              <input type="date" value={taskForm.deadline} onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })} className={inputClass} />
            </div>
          </Overlay>
        )
      case 'reviewTask':
        return (
          <Overlay title={`Review Task - ${candidateName}`} onSubmit={submitReviewTask}>
            <div>
              <label className={labelClass}>Score (1-10)</label>
              <input
                type="range"
                min={1}
                max={10}
                value={reviewTaskForm.score}
                onChange={(e) => setReviewTaskForm({ ...reviewTaskForm, score: parseInt(e.target.value) })}
                className="w-full accent-blue-500"
              />
              <div className="text-center text-2xl font-bold text-white mt-1">{reviewTaskForm.score}</div>
            </div>
            <div>
              <label className={labelClass}>Feedback</label>
              <textarea value={reviewTaskForm.feedback} onChange={(e) => setReviewTaskForm({ ...reviewTaskForm, feedback: e.target.value })} rows={4} className={inputClass} placeholder="Task review feedback..." />
            </div>
          </Overlay>
        )
      case 'finalRound':
        return (
          <Overlay title={`Final Round Decision - ${candidateName}`} onSubmit={submitFinalRound}>
            <div>
              <label className={labelClass}>Decision *</label>
              <select value={finalRoundForm.decision} onChange={(e) => setFinalRoundForm({ ...finalRoundForm, decision: e.target.value })} className={inputClass}>
                <option value="">Select decision...</option>
                <option value="SELECTED">Select</option>
                <option value="REJECTED">Reject</option>
                <option value="HOLD">Hold</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Notes</label>
              <textarea value={finalRoundForm.notes} onChange={(e) => setFinalRoundForm({ ...finalRoundForm, notes: e.target.value })} rows={4} className={inputClass} placeholder="Final round notes..." />
            </div>
          </Overlay>
        )
      case 'reject':
        return (
          <Overlay title={`Reject - ${candidateName}`} onSubmit={submitReject}>
            <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span className="text-sm text-red-300">This will move the candidate to Rejected status.</span>
            </div>
            <div>
              <label className={labelClass}>Rejection Reason</label>
              <textarea value={rejectForm.reason} onChange={(e) => setRejectForm({ reason: e.target.value })} rows={4} className={inputClass} placeholder="Reason for rejection..." />
            </div>
          </Overlay>
        )
      case 'offer':
        return (
          <Overlay title={`Send Offer - ${candidateName}`} onSubmit={submitOffer}>
            <div>
              <label className={labelClass}>Offer Salary (Annual) *</label>
              <input type="number" value={offerForm.salary} onChange={(e) => setOfferForm({ ...offerForm, salary: e.target.value })} className={inputClass} placeholder="e.g. 800000" />
              {modalAssessment.expectedSalary != null && (
                <p className="text-xs text-slate-500 mt-1">Expected: {formatSalary(modalAssessment.expectedSalary)}/yr</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Proposed Joining Date</label>
              <input type="date" value={offerForm.joiningDate} onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })} className={inputClass} />
            </div>
          </Overlay>
        )
      default:
        return null
    }
  }

  // -----------------------------------------------------------------------
  // Skeleton
  // -----------------------------------------------------------------------

  const renderSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`skeleton-stat-${i}`} className="bg-slate-900/40 border border-white/5 rounded-xl p-4 h-20" />
        ))}
      </div>
      <div className="h-12 bg-slate-900/40 rounded-xl" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={`skeleton-card-${i}`} className="bg-slate-900/40 border border-white/5 rounded-xl p-6 h-48" />
      ))}
    </div>
  )

  // -----------------------------------------------------------------------
  // Main render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="text-blue-400" size={28} />
            Assessment Pipeline
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track and manage candidate assessments through the hiring pipeline
          </p>
        </div>
        <button
          onClick={fetchPipeline}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 border border-white/10 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        renderSkeleton()
      ) : (
        <>
          {/* Stats Bar */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {STAT_CARDS.map((sc) => {
                const Icon = sc.icon
                const count = stats[sc.key as keyof PipelineStats] ?? 0
                return (
                  <button
                    key={sc.key}
                    onClick={() => {
                      const statusKey = sc.key === 'pending' ? 'PENDING_REVIEW'
                        : sc.key === 'interviewScheduled' ? 'INTERVIEW_SCHEDULED'
                        : sc.key === 'taskAssigned' ? 'TASK_ASSIGNED'
                        : sc.key === 'taskSubmitted' ? 'TASK_SUBMITTED'
                        : sc.key === 'finalRound' ? 'FINAL_ROUND'
                        : sc.key.toUpperCase()
                      setFilterStatus(filterStatus === statusKey ? 'All' : statusKey)
                    }}
                    className={`${sc.bg} border rounded-xl p-3 text-left transition-all hover:scale-[1.02] ${
                      filterStatus === (sc.key === 'pending' ? 'PENDING_REVIEW'
                        : sc.key === 'interviewScheduled' ? 'INTERVIEW_SCHEDULED'
                        : sc.key === 'taskAssigned' ? 'TASK_ASSIGNED'
                        : sc.key === 'taskSubmitted' ? 'TASK_SUBMITTED'
                        : sc.key === 'finalRound' ? 'FINAL_ROUND'
                        : sc.key.toUpperCase())
                        ? 'border-white/30 ring-1 ring-white/20'
                        : 'border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon size={16} className={sc.color} />
                      <span className={`text-xl font-bold ${sc.color}`}>{count}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 truncate">{sc.label}</div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/40 border border-white/10 rounded-xl p-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, position, or email..."
                className="w-full bg-slate-800/60 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-500 shrink-0" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-800/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === 'All' ? 'All Statuses' : statusLabel(s)}
                  </option>
                ))}
              </select>
            </div>
            {/* Department Filter */}
            {departments.length > 0 && (
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="bg-slate-800/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="All">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}
            {/* Count */}
            <div className="flex items-center text-xs text-slate-500 whitespace-nowrap">
              {filtered.length} candidate{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Candidate Cards */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users size={48} className="text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-1">No assessments found</h3>
              <p className="text-sm text-slate-500">
                {filterStatus !== 'All' || filterDepartment !== 'All' || searchQuery
                  ? 'Try adjusting your filters or search query.'
                  : 'Assessments will appear here once candidates submit them.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((a) => {
                const name = a.fullName || a.candidate?.name || 'Unknown'
                const position = a.candidate?.position || '-'
                const dept = a.candidate?.department || '-'
                const source = a.candidate?.source || '-'
                const isExpanded = expandedId === a.id

                return (
                  <div
                    key={a.id}
                    className="bg-slate-900/40 border border-white/10 rounded-xl overflow-hidden transition-all hover:border-white/15"
                  >
                    {/* Card Header */}
                    <div className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Left: Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-base font-semibold text-white truncate">{name}</h3>
                            {renderCompletionBadge(a.completed)}
                            {renderStatusBadge(a.hrStatus)}
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mb-3">
                            <span className="flex items-center gap-1">
                              <Briefcase size={12} /> {position}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 size={12} /> {dept}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe size={12} /> {source}
                            </span>
                            {a.email && (
                              <span className="flex items-center gap-1">
                                <Mail size={12} /> {a.email}
                              </span>
                            )}
                            {a.phone && (
                              <span className="flex items-center gap-1">
                                <Phone size={12} /> {a.phone}
                              </span>
                            )}
                          </div>

                          {/* Key Info Pills */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {a.expectedSalary != null && (
                              <span className="text-xs bg-slate-800 border border-white/5 rounded-full px-2.5 py-0.5 text-slate-300 flex items-center gap-1">
                                <IndianRupee size={10} /> {formatSalary(a.expectedSalary)}/yr
                              </span>
                            )}
                            {a.totalExperience != null && (
                              <span className="text-xs bg-slate-800 border border-white/5 rounded-full px-2.5 py-0.5 text-slate-300 flex items-center gap-1">
                                <GraduationCap size={10} /> {a.totalExperience} yrs
                              </span>
                            )}
                            {a.canWorkFromOffice != null && (
                              <span className={`text-xs rounded-full px-2.5 py-0.5 flex items-center gap-1 ${a.canWorkFromOffice ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                <MapPin size={10} /> {a.canWorkFromOffice ? 'Office OK' : 'Remote Only'}
                              </span>
                            )}
                            {a.readyForTrial != null && (
                              <span className={`text-xs rounded-full px-2.5 py-0.5 ${a.readyForTrial ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                {a.readyForTrial ? 'Trial Ready' : 'No Trial'}
                              </span>
                            )}
                            {a.hasHealthcareExp && (
                              <span className="text-xs bg-pink-500/10 text-pink-400 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                                <Heart size={10} /> Healthcare Exp
                              </span>
                            )}
                            {a.noticePeriod && (
                              <span className="text-xs bg-slate-800 border border-white/5 rounded-full px-2.5 py-0.5 text-slate-300">
                                Notice: {a.noticePeriod}
                              </span>
                            )}
                          </div>

                          {/* Resume + Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2">
                            {a.resumeUrl && (
                              <a
                                href={a.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors border border-white/5"
                              >
                                <FileText size={14} /> Resume
                                <ExternalLink size={10} />
                              </a>
                            )}
                            {renderActionButtons(a)}
                          </div>
                        </div>

                        {/* Right: HR Notes + Expand */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="text-[11px] text-slate-500">
                            {formatDate(a.createdAt)}
                          </div>

                          {/* HR Notes */}
                          {editingNotesId === a.id ? (
                            <div className="flex flex-col gap-2 w-64">
                              <textarea
                                value={notesValue}
                                onChange={(e) => setNotesValue(e.target.value)}
                                rows={3}
                                className="w-full bg-slate-800/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="HR notes..."
                              />
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => setEditingNotesId(null)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
                                <button onClick={() => saveHrNotes(a)} className="text-xs text-blue-400 hover:text-blue-300 font-medium">Save</button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingNotesId(a.id); setNotesValue(a.hrNotes || '') }}
                              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                            >
                              <MessageSquare size={12} />
                              {a.hrNotes ? 'Edit Notes' : 'Add Notes'}
                            </button>
                          )}

                          {a.hrNotes && editingNotesId !== a.id && (
                            <div className="max-w-[250px] bg-slate-800/40 rounded-lg p-2 text-xs text-slate-400 line-clamp-2">
                              {a.hrNotes}
                            </div>
                          )}

                          {/* Expand button */}
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : a.id)}
                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-400 transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {isExpanded ? 'Collapse' : 'Details'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detail Panel */}
                    {isExpanded && renderDetailPanel(a)}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {renderModal()}
    </div>
  )
}
