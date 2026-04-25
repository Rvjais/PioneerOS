'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useRouter } from 'next/navigation'
import PageGuide from '@/client/components/ui/PageGuide'
import InfoTip from '@/client/components/ui/InfoTip'

interface Verification {
  id: string
  status: string
  aiScore: number | null
  isVerified: boolean
}

interface Log {
  id: string
  resourceUrl: string
  resourceTitle: string
  topic: string | null
  minutesWatched: number
  notes: string | null
  month: string
  createdAt: string
  verification?: Verification | null
  verificationId?: string | null
}

interface VerificationTask {
  id: string
  taskPrompt: string
  taskType: string
  difficulty: string
  hints?: string[]
  expectedOutcome?: string
}

interface VerificationResult {
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
  isVerified: boolean
}

interface MonthlyAudit {
  id: string
  month: string
  monthDate: string
  totalEntries: number
  totalMinutes: number
  totalHours: number
  verifiedEntries: number
  averageScore: number | null
  summary?: string
  recommendations?: string[]
  verdict?: string
  auditedAt: string
}

interface MonthlyBreakdown {
  month: string
  monthLabel: string
  minutes: number
  hours: number
  isCompliant: boolean
  entries: number
}

interface Stats {
  thisMonthMinutes: number
  thisMonthHours: number
  totalMinutes: number
  totalHours: number
  pushMonths: number
  deficitMonths: string[]
  streak: number
  daysRemaining: number
  hoursRemaining: number
  hoursPerDay: number
}

interface Props {
  logs: Log[]
  stats: Stats
  appraisalDate: string
  joiningDate: string
  monthlyBreakdown: MonthlyBreakdown[]
  userName: string
}

export function LearningClient({ logs, stats, appraisalDate, joiningDate, monthlyBreakdown, userName }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'log' | 'breakdown' | 'audit'>('log')
  const [showAdd, setShowAdd] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    resourceUrl: '',
    resourceTitle: '',
    topic: '',
    minutesWatched: '',
    notes: ''
  })

  // Verification states
  const [showVerification, setShowVerification] = useState(false)
  const [verificationTask, setVerificationTask] = useState<VerificationTask | null>(null)
  const [verificationResponse, setVerificationResponse] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [currentLogForVerification, setCurrentLogForVerification] = useState<{ id: string; topic: string; resourceTitle: string } | null>(null)

  // Audit states
  const [audits, setAudits] = useState<MonthlyAudit[]>([])
  const [loadingAudits, setLoadingAudits] = useState(false)
  const [generatingAudit, setGeneratingAudit] = useState(false)

  // Load audits when audit tab is selected
  useEffect(() => {
    if (activeTab === 'audit') {
      loadAudits()
    }
  }, [activeTab])

  const loadAudits = async () => {
    setLoadingAudits(true)
    try {
      const res = await fetch('/api/learning/audit')
      if (res.ok) {
        const data = await res.json()
        setAudits(data.audits || [])
      }
    } catch (error) {
      console.error('Failed to load audits:', error)
    } finally {
      setLoadingAudits(false)
    }
  }

  const generateAudit = async (month?: string) => {
    setGeneratingAudit(true)
    try {
      const res = await fetch('/api/learning/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month }),
      })
      if (res.ok) {
        await loadAudits()
      }
    } catch (error) {
      console.error('Failed to generate audit:', error)
    } finally {
      setGeneratingAudit(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.resourceUrl || !form.resourceTitle || !form.minutesWatched) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/learning/log', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { logId: editingId, ...form } : form),
      })
      if (res.ok) {
        const data = await res.json()
        const savedLog = data.log

        // Store form values before clearing
        const savedTopic = form.topic || 'General Learning'
        const savedTitle = form.resourceTitle
        const savedMinutes = parseInt(form.minutesWatched)

        setForm({ resourceUrl: '', resourceTitle: '', topic: '', minutesWatched: '', notes: '' })
        setShowAdd(false)
        setEditingId(null)
        router.refresh()

        // Only trigger verification for new entries (not edits)
        if (!editingId && savedLog?.id) {
          triggerVerification(savedLog.id, savedTopic, savedTitle, savedMinutes)
        }
      }
    } catch (error) {
      console.error('Failed to save log:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const triggerVerification = async (logId: string, topic: string, resourceTitle: string, minutesWatched: number) => {
    try {
      const res = await fetch('/api/learning/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learningLogId: logId,
          topic,
          resourceTitle,
          minutesWatched
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setVerificationTask({
          id: data.verification.id,
          taskPrompt: data.verification.taskPrompt,
          taskType: data.verification.taskType,
          difficulty: data.verification.difficulty,
          hints: data.verification.hints,
          expectedOutcome: data.verification.expectedOutcome
        })
        setCurrentLogForVerification({ id: logId, topic, resourceTitle })
        setVerificationResponse('')
        setVerificationResult(null)
        setShowVerification(true)
      }
    } catch (error) {
      console.error('Failed to generate verification task:', error)
    }
  }

  const submitVerification = async () => {
    if (!verificationTask || !verificationResponse.trim()) return
    setIsEvaluating(true)
    try {
      const res = await fetch('/api/learning/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: verificationTask.id,
          userResponse: verificationResponse
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setVerificationResult(data.evaluation)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to submit verification:', error)
    } finally {
      setIsEvaluating(false)
    }
  }

  const skipVerification = async () => {
    if (!verificationTask) return
    try {
      await fetch('/api/learning/verify', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationId: verificationTask.id }),
      })
      setShowVerification(false)
      setVerificationTask(null)
      setVerificationResponse('')
      setVerificationResult(null)
      router.refresh()
    } catch (error) {
      console.error('Failed to skip verification:', error)
    }
  }

  const closeVerification = () => {
    setShowVerification(false)
    setVerificationTask(null)
    setVerificationResponse('')
    setVerificationResult(null)
    setCurrentLogForVerification(null)
  }

  const handleEdit = (log: Log) => {
    setForm({
      resourceUrl: log.resourceUrl,
      resourceTitle: log.resourceTitle,
      topic: log.topic || '',
      minutesWatched: String(log.minutesWatched),
      notes: log.notes || ''
    })
    setEditingId(log.id)
    setShowAdd(true)
  }

  const handleDelete = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return
    setDeletingId(logId)
    try {
      const res = await fetch(`/api/learning/log?logId=${logId}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to delete log:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const cancelEdit = () => {
    setForm({ resourceUrl: '', resourceTitle: '', topic: '', minutesWatched: '', notes: '' })
    setShowAdd(false)
    setEditingId(null)
  }

  const progressPercent = Math.min((stats.thisMonthHours / 6) * 100, 100)
  const isCompliant = stats.thisMonthHours >= 6
  const appraisalDateObj = new Date(appraisalDate)

  return (
    <div className="space-y-6 pb-8">
      <PageGuide
        pageKey="learning"
        title="Learning Dashboard"
        description="Track learning hours and maintain appraisal eligibility."
        steps={[
          { label: 'Log learning hours', description: 'Record time spent on courses, videos, and resources' },
          { label: 'Check yearly target', description: 'Aim for 72 hours (6 hrs/month) to stay eligible' },
          { label: 'Upload proof', description: 'Add resource URLs and notes for verification' },
          { label: 'View verification status', description: 'Check AI verification scores on your entries' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Learning Goals</h1>
          <p className="text-slate-400 mt-1">Track your learning hours and maintain your appraisal eligibility</p>
        </div>
        <a
          href="/learning/resources"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Resources
        </a>
      </div>

      {/* Progress Hero Card */}
      <div className={`rounded-2xl p-6 bg-black border ${isCompliant ? 'border-emerald-500/50' : 'border-amber-500/50'}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-sm font-medium opacity-90 text-white">This Month's Progress</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-bold text-white">{stats.thisMonthHours}</span>
              <span className="text-2xl text-slate-300">/ 6 hours</span>
            </div>
            <div className="mt-4 w-full max-w-xs">
              <div className="h-3 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden">
                <div
                  className="h-full glass-card rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs mt-2 opacity-90 text-slate-300">
                {isCompliant
                  ? 'You\'ve met your learning goal this month!'
                  : `${stats.hoursRemaining} hours remaining (${stats.hoursPerDay}h/day for ${stats.daysRemaining} days)`
                }
              </p>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/10">
              <p className="text-xs font-medium text-slate-400">Total Lifetime</p>
              <p className="text-2xl font-bold text-white">{stats.totalHours}h</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/10">
              <p className="text-xs font-medium text-slate-400">Streak</p>
              <p className="text-2xl font-bold text-white">{stats.streak} mo</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/10">
              <p className="text-xs font-medium text-slate-400">Entries</p>
              <p className="text-2xl font-bold text-white">{logs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Appraisal Card */}
      <div className={`rounded-xl border p-5 ${stats.pushMonths > 0 ? 'bg-red-500/10 border-red-200' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.pushMonths > 0 ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
              <svg className={`w-6 h-6 ${stats.pushMonths > 0 ? 'text-red-400' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className={`font-semibold ${stats.pushMonths > 0 ? 'text-red-800' : 'text-emerald-800'}`}>
                Appraisal Eligibility
              </h3>
              <p className={`text-sm ${stats.pushMonths > 0 ? 'text-red-400' : 'text-emerald-700'}`}>
                Next appraisal: <span className="font-bold">
                  {formatDateDDMMYYYY(appraisalDateObj)}
                </span>
              </p>
              {stats.pushMonths > 0 && (
                <p className="text-xs text-red-400 mt-1">
                  Pushed by {stats.pushMonths} month{stats.pushMonths > 1 ? 's' : ''} due to learning deficit
                  {stats.deficitMonths.length > 0 && ` (${stats.deficitMonths.slice(0, 3).join(', ')}${stats.deficitMonths.length > 3 ? '...' : ''})`}
                </p>
              )}
            </div>
          </div>
          <div className={`text-center px-6 py-3 rounded-lg ${stats.pushMonths > 0 ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
            <p className={`text-3xl font-bold ${stats.pushMonths > 0 ? 'text-red-400' : 'text-emerald-700'}`}>
              {stats.pushMonths}
            </p>
            <p className={`text-xs ${stats.pushMonths > 0 ? 'text-red-400' : 'text-emerald-600'}`}>
              Months Pushed
            </p>
          </div>
        </div>
      </div>

      {/* Warning Alert */}
      {!isCompliant && (
        <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">Learning Deficit Warning</p>
            <p className="text-xs text-amber-400 mt-0.5">
              You need {stats.hoursRemaining} more hours this month to prevent your appraisal date from being pushed.
              That's approximately {stats.hoursPerDay} hours per day for the next {stats.daysRemaining} days.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('log')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'log'
              ? 'border-blue-600 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Learning Log
        </button>
        <button
          onClick={() => setActiveTab('breakdown')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'breakdown'
              ? 'border-blue-600 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Monthly Breakdown
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          AI Audits
        </button>
      </div>

      {/* Learning Log Tab */}
      {activeTab === 'log' && (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden shadow-none">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h3 className="font-semibold text-white">Learning Entries</h3>
            <button
              onClick={() => { setShowAdd(!showAdd); setEditingId(null); setForm({ resourceUrl: '', resourceTitle: '', topic: '', minutesWatched: '', notes: '' }); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Entry
            </button>
          </div>

          {/* Inline Add/Edit Form */}
          {showAdd && (
            <div className="bg-blue-500/10 border-b border-blue-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-blue-800">
                  {editingId ? 'Edit Entry' : 'Log New Learning'}
                </p>
                <button onClick={cancelEdit} className="text-blue-400 hover:text-blue-800" title="Cancel editing">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Topic/Category *<InfoTip text="What subject you learned about. Be specific - e.g., 'GA4 Event Tracking' not just 'Analytics'." /></label>
                  <input
                    type="text"
                    value={form.topic}
                    onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm glass-card"
                    placeholder="e.g. React, SEO, Design"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Resource Title *<InfoTip text="Title of the learning resource (course name, article title, etc.)." /></label>
                  <input
                    type="text"
                    value={form.resourceTitle}
                    onChange={e => setForm(f => ({ ...f, resourceTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm glass-card"
                    placeholder="e.g. React Advanced Patterns"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">URL (YouTube/Coaching) *<InfoTip text="Link to the course, video, or article you completed." /></label>
                  <input
                    type="url"
                    value={form.resourceUrl}
                    onChange={e => setForm(f => ({ ...f, resourceUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm glass-card"
                    placeholder="https://youtube.com/... or coaching URL"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Minutes *<InfoTip text="Time spent learning. Minimum 30 minutes. You need 72 hours/year for appraisal." /></label>
                  <input
                    type="number"
                    value={form.minutesWatched}
                    onChange={e => setForm(f => ({ ...f, minutesWatched: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm glass-card"
                    placeholder="e.g. 45"
                    min="1"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes (optional)<InfoTip text="Key takeaways - what you learned that you can apply to your work." /></label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm glass-card"
                  placeholder="What did you learn?"
                />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !form.resourceTitle || !form.resourceUrl || !form.minutesWatched}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-white/20 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-900/40"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/40 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">#</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Topic</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Resource</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase text-center">Duration</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase text-center">Verified</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {logs.map((log, i) => (
                  <tr key={log.id} className="hover:bg-blue-500/10 transition-colors group">
                    <td className="px-4 py-3 text-sm text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-400 rounded">
                        {log.topic || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={log.resourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-blue-400 hover:underline"
                      >
                        {log.resourceTitle}
                      </a>
                      {log.notes && <p className="text-xs text-slate-400 mt-0.5">{log.notes}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-200 text-center">
                      <span className="font-medium">{log.minutesWatched}</span>
                      <span className="text-slate-400 ml-1">min</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {log.verification ? (
                        log.verification.status === 'EVALUATED' ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${
                            log.verification.isVerified
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {log.verification.isVerified ? (
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                              </svg>
                            )}
                            {log.verification.aiScore}%
                          </span>
                        ) : log.verification.status === 'SKIPPED' ? (
                          <span className="px-2 py-0.5 text-xs font-medium bg-slate-500/20 text-slate-400 rounded">
                            Skipped
                          </span>
                        ) : (
                          <button
                            onClick={() => triggerVerification(log.id, log.topic || 'General', log.resourceTitle, log.minutesWatched)}
                            className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                          >
                            Pending
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => triggerVerification(log.id, log.topic || 'General', log.resourceTitle, log.minutesWatched)}
                          className="px-2 py-0.5 text-xs font-medium bg-slate-500/20 text-slate-400 rounded hover:bg-slate-500/30 transition-colors"
                        >
                          Verify
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {formatDateDDMMYYYY(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(log)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          disabled={deletingId === log.id}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === log.id ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      <svg className="w-12 h-12 text-slate-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <p>No learning entries yet.</p>
                      <p className="text-sm mt-1">Click &quot;Add Entry&quot; to start tracking your learning.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly Breakdown Tab */}
      {activeTab === 'breakdown' && (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden shadow-none">
          <div className="p-4 border-b border-white/5">
            <h3 className="font-semibold text-white">Last 12 Months</h3>
            <p className="text-sm text-slate-400">Track your monthly learning compliance</p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {monthlyBreakdown.map((month, idx) => (
                <div
                  key={month.month}
                  className={`rounded-xl p-4 border-2 transition-all ${
                    idx === 0
                      ? 'border-blue-300 bg-blue-500/10'
                      : month.isCompliant
                        ? 'border-emerald-500/30 bg-emerald-500/10'
                        : 'border-red-200 bg-red-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-300">{month.monthLabel}</p>
                    {month.isCompliant ? (
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : month.hours > 0 ? (
                      <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <p className={`text-2xl font-bold ${
                    idx === 0 ? 'text-blue-400' : month.isCompliant ? 'text-emerald-700' : 'text-red-400'
                  }`}>
                    {month.hours}h
                  </p>
                  <div className="mt-2">
                    <div className="h-1.5 glass-card rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          idx === 0 ? 'bg-blue-500' : month.isCompliant ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((month.hours / 6) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {month.entries} {month.entries === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="px-4 py-3 bg-slate-900/40 border-t border-white/10 flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Compliant (6+ hours)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-slate-300">Deficit (&lt;6 hours)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-300">Current Month</span>
            </div>
          </div>
        </div>
      )}

      {/* AI Audits Tab */}
      {activeTab === 'audit' && (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden shadow-none">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div>
              <h3 className="font-semibold text-white">AI Learning Audits</h3>
              <p className="text-sm text-slate-400">Monthly AI reviews of your learning progress</p>
            </div>
            <button
              onClick={() => generateAudit()}
              disabled={generatingAudit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {generatingAudit ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Generate Audit
                </>
              )}
            </button>
          </div>

          {loadingAudits ? (
            <div className="p-12 text-center">
              <svg className="w-8 h-8 animate-spin mx-auto text-slate-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-slate-400 mt-2">Loading audits...</p>
            </div>
          ) : audits.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p>No AI audits yet.</p>
              <p className="text-sm mt-1">Click &quot;Generate Audit&quot; to create your first monthly audit.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {audits.map((audit) => (
                <div key={audit.id} className="p-4 hover:bg-blue-500/5 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-white">{audit.month}</h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          audit.verdict === 'EXCELLENT' ? 'bg-emerald-500/20 text-emerald-400' :
                          audit.verdict === 'GOOD' ? 'bg-blue-500/20 text-blue-400' :
                          audit.verdict === 'NEEDS_IMPROVEMENT' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {audit.verdict?.replace(/_/g, ' ') || 'PENDING'}
                        </span>
                      </div>
                      {audit.summary && (
                        <p className="text-sm text-slate-300 mb-3">{audit.summary}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {audit.totalHours}h logged
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {audit.totalEntries} entries
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {audit.verifiedEntries} verified
                        </span>
                        {audit.averageScore !== null && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            {Math.round(audit.averageScore)}% avg
                          </span>
                        )}
                      </div>
                      {audit.recommendations && audit.recommendations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/5">
                          <p className="text-xs font-medium text-slate-400 mb-1">Recommendations:</p>
                          <ul className="text-sm text-slate-300 space-y-1">
                            {audit.recommendations.map((rec, i) => (
                              <li key={`rec-${rec}-${i}`} className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(audit.auditedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Policy Info */}
      <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-xl border border-red-200 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-red-800 text-lg">Learning Policy - 360 Minutes (6 Hours) Mandatory</h4>
            <p className="text-sm text-red-400 mt-1">
              Your appraisal will be <strong>delayed by 1 month</strong> for every month you fail to complete the minimum 360 minutes (6 hours) of learning.
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-red-100">
            <h5 className="font-semibold text-slate-800 text-sm mb-2">Accepted Resources</h5>
            <ul className="text-sm text-slate-600 space-y-1">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                YouTube tutorials with valid URL
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Coaching/Training program URLs
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Udemy/Coursera courses
              </li>
            </ul>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-red-100">
            <h5 className="font-semibold text-slate-800 text-sm mb-2">Requirements</h5>
            <ul className="text-sm text-slate-600 space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center font-bold">1</span>
                Minimum 360 minutes (6 hours) per month
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center font-bold">2</span>
                Include topic/category for each entry
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center font-bold">3</span>
                Valid URL required for verification
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerification && verificationTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Verify Your Learning</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {currentLogForVerification?.resourceTitle}
                  </p>
                </div>
                <button
                  onClick={closeVerification}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Close verification"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {!verificationResult ? (
              <div className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        verificationTask.difficulty === 'EASY' ? 'bg-emerald-500/20 text-emerald-400' :
                        verificationTask.difficulty === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {verificationTask.difficulty}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded">
                        {verificationTask.taskType}
                      </span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{verificationTask.taskPrompt}</p>
                  </div>
                </div>

                {verificationTask.hints && verificationTask.hints.length > 0 && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-blue-400 mb-1">Hints:</p>
                    <ul className="text-sm text-slate-300 space-y-1">
                      {verificationTask.hints.map((hint, i) => (
                        <li key={`hint-${hint}-${i}`} className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          {hint}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Your Response</label>
                  <textarea
                    value={verificationResponse}
                    onChange={(e) => setVerificationResponse(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Describe what you learned and how you would apply it..."
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Minimum 20 characters. Be specific and include examples.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={submitVerification}
                    disabled={isEvaluating || verificationResponse.trim().length < 20}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isEvaluating ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Submit for Verification
                      </>
                    )}
                  </button>
                  <button
                    onClick={skipVerification}
                    className="px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/10 font-medium rounded-lg transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                {/* Result Display */}
                <div className={`rounded-xl p-6 mb-6 ${
                  verificationResult.isVerified
                    ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30'
                    : 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        verificationResult.isVerified ? 'bg-emerald-500/30' : 'bg-amber-500/30'
                      }`}>
                        {verificationResult.isVerified ? (
                          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${
                          verificationResult.isVerified ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {verificationResult.isVerified ? 'Verified!' : 'Not Quite Verified'}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {verificationResult.isVerified
                            ? 'Great job demonstrating your learning!'
                            : 'Keep learning and try again next time'}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className={`text-4xl font-bold ${
                        verificationResult.isVerified ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {verificationResult.score}%
                      </p>
                      <p className="text-xs text-slate-500">Score</p>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm">{verificationResult.feedback}</p>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {verificationResult.strengths.length > 0 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Strengths
                      </h4>
                      <ul className="text-sm text-slate-300 space-y-1">
                        {verificationResult.strengths.map((s, i) => (
                          <li key={`strength-${s}-${i}`}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {verificationResult.improvements.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Areas to Improve
                      </h4>
                      <ul className="text-sm text-slate-300 space-y-1">
                        {verificationResult.improvements.map((i, idx) => (
                          <li key={`improve-${i}-${idx}`}>• {i}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  onClick={closeVerification}
                  className="w-full px-4 py-2.5 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
