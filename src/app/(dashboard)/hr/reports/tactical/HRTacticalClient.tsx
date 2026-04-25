'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  DEPARTMENT_KPIS,
  calculateGrowth,
  formatGrowth,
  getGrowthColor,
  formatMonth,
} from '@/shared/constants/kpiDefinitions'

interface KPIEntry {
  id: string
  department: string
  [key: string]: unknown
}

interface Meeting {
  id: string
  month: string
  reportingMonth: string
  status: string
  submittedAt?: string | null
  submittedOnTime: boolean
  overallScore?: number | null
  kpiEntries: KPIEntry[]
}

interface Props {
  currentMeeting: Meeting | null
  previousMeeting: Meeting | null
  yearlyData: Meeting[]
  currentUserId: string
  isBeforeDeadline: boolean
  daysUntilDeadline: number
  learningHours: number
}

interface KPIRowData {
  [key: string]: string | number | null | undefined
}

const HR_KPIS = DEPARTMENT_KPIS['HR']?.kpis || []

export function HRTacticalClient({
  currentMeeting,
  previousMeeting,
  yearlyData,
  currentUserId,
  isBeforeDeadline,
  daysUntilDeadline,
  learningHours,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [editingEntry, setEditingEntry] = useState(false)
  const [entry, setEntry] = useState<KPIRowData>(() => {
    if (currentMeeting?.kpiEntries?.[0]) {
      const e = currentMeeting.kpiEntries[0]
      const data: KPIRowData = {}
      Object.keys(e).forEach(key => {
        if (!['id', 'department', 'meetingId', 'clientId', 'propertyId'].includes(key)) {
          data[key] = e[key] as string | number | null
        }
      })
      return data
    }
    // Pre-fill with previous month's data
    if (previousMeeting?.kpiEntries?.[0]) {
      const prev = previousMeeting.kpiEntries[0]
      const data: KPIRowData = {}
      HR_KPIS.forEach(kpi => {
        const prevKey = `prev${kpi.id.charAt(0).toUpperCase()}${kpi.id.slice(1)}`
        data[prevKey] = prev[kpi.id] as number | null
      })
      return data
    }
    return {}
  })

  const isSubmitted = currentMeeting?.status === 'SUBMITTED'
  const reportingMonth = currentMeeting?.reportingMonth
    ? new Date(currentMeeting.reportingMonth)
    : new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)

  const updateEntry = (field: string, value: string | number | null) => {
    setEntry(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async (submit = false) => {
    setLoading(true)
    try {
      const now = new Date()
      const res = await fetch('/api/meetings/tactical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
          reportingMonth: reportingMonth.toISOString(),
          department: 'HR',
          kpiEntries: [{ ...entry, department: 'HR' }],
          submit,
        }),
      })

      if (res.ok) {
        router.refresh()
        setEditingEntry(false)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">HR Tactical Meeting</h1>
            <p className="text-indigo-100">Reporting: {formatMonth(reportingMonth)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-indigo-100">Deadline</p>
            <p className="text-xl font-bold">
              {isSubmitted ? 'Submitted' : isBeforeDeadline ? `${daysUntilDeadline}d left` : 'Overdue'}
            </p>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`rounded-xl border p-4 ${
          isBeforeDeadline
            ? 'bg-amber-500/10 border-amber-200'
            : isSubmitted
              ? 'bg-green-500/10 border-green-200'
              : 'bg-red-500/10 border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isBeforeDeadline ? 'bg-amber-500/20' : isSubmitted ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              <svg className={`w-5 h-5 ${
                isBeforeDeadline ? 'text-amber-400' : isSubmitted ? 'text-green-400' : 'text-red-400'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className={`font-semibold ${
                isBeforeDeadline ? 'text-amber-800' : isSubmitted ? 'text-green-800' : 'text-red-800'
              }`}>
                {isSubmitted ? 'Submitted' : isBeforeDeadline ? `${daysUntilDeadline}d left` : 'Overdue'}
              </p>
              <p className={`text-xs ${
                isBeforeDeadline ? 'text-amber-400' : isSubmitted ? 'text-green-400' : 'text-red-400'
              }`}>
                Due 3rd of month
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl border p-4 ${
          learningHours >= 6 ? 'bg-green-500/10 border-green-200' : 'bg-amber-500/10 border-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              learningHours >= 6 ? 'bg-green-500/20' : 'bg-amber-500/20'
            }`}>
              <svg className={`w-5 h-5 ${learningHours >= 6 ? 'text-green-400' : 'text-amber-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className={`font-semibold ${learningHours >= 6 ? 'text-green-800' : 'text-amber-800'}`}>
                {learningHours.toFixed(1)}h / 6h
              </p>
              <p className={`text-xs ${learningHours >= 6 ? 'text-green-400' : 'text-amber-400'}`}>
                Learning hours
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-white">HR</p>
              <p className="text-xs text-slate-300">Department</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-white">
                {currentMeeting?.overallScore ? `${currentMeeting.overallScore.toFixed(1)}%` : '-'}
              </p>
              <p className="text-xs text-slate-300">Overall score</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Entry Section */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">HR KPIs - {formatMonth(reportingMonth)}</h2>
            <p className="text-indigo-100 text-sm">Enter your monthly HR metrics with proof of progress</p>
          </div>
          {!isSubmitted && (
            <button
              onClick={() => setEditingEntry(!editingEntry)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                editingEntry
                  ? 'glass-card text-indigo-600'
                  : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
              }`}
            >
              {editingEntry ? 'Done Editing' : 'Edit KPIs'}
            </button>
          )}
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HR_KPIS.map(kpi => {
              const prevField = `prev${kpi.id.charAt(0).toUpperCase()}${kpi.id.slice(1)}`
              const proofField = `${kpi.id}Proof`
              const progressField = `${kpi.id}Progress`
              const currentVal = entry[kpi.id] as number | null
              const prevVal = entry[prevField] as number | null
              const growth = calculateGrowth(currentVal, prevVal)

              return (
                <div key={kpi.id} className="bg-slate-900/40 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-slate-200">{kpi.label}</p>
                    {growth !== null && (
                      <span className={`text-sm font-semibold ${getGrowthColor(growth)}`}>
                        {formatGrowth(growth)}
                      </span>
                    )}
                  </div>

                  {editingEntry ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Previous</label>
                          <input
                            type="number"
                            value={prevVal ?? ''}
                            onChange={(e) => updateEntry(prevField, e.target.value ? Number(e.target.value) : null)}
                            className="w-full px-3 py-2 text-sm border border-white/10 rounded-lg glass-card"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Current</label>
                          <input
                            type="number"
                            value={currentVal ?? ''}
                            onChange={(e) => updateEntry(kpi.id, e.target.value ? Number(e.target.value) : null)}
                            className="w-full px-3 py-2 text-sm border border-indigo-300 rounded-lg bg-indigo-50"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Progress Notes</label>
                        <textarea
                          value={(entry[progressField] as string) || ''}
                          onChange={(e) => updateEntry(progressField, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-white/10 rounded-lg glass-card resize-none"
                          rows={2}
                          placeholder="What progress was made this month..."
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Proof / Evidence</label>
                        <input
                          type="text"
                          value={(entry[proofField] as string) || ''}
                          onChange={(e) => updateEntry(proofField, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-white/10 rounded-lg glass-card"
                          placeholder="Link to report, screenshot, etc."
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-end justify-between mb-3">
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {currentVal !== null && currentVal !== undefined ? currentVal.toLocaleString() : '-'}
                            {kpi.suffix && <span className="text-sm text-slate-400 ml-0.5">{kpi.suffix}</span>}
                          </p>
                          <p className="text-xs text-slate-400">
                            prev: {prevVal !== null && prevVal !== undefined ? prevVal.toLocaleString() : '-'}
                          </p>
                        </div>
                      </div>
                      {((entry[progressField] as string) || (entry[proofField] as string)) && (
                        <div className="pt-2 border-t border-white/10 space-y-2">
                          {(entry[progressField] as string) && (
                            <div>
                              <p className="text-xs text-slate-400">Progress</p>
                              <p className="text-sm text-slate-200">{entry[progressField] as string}</p>
                            </div>
                          )}
                          {(entry[proofField] as string) && (
                            <div>
                              <p className="text-xs text-slate-400">Proof</p>
                              <a
                                href={entry[proofField] as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-indigo-600 hover:underline truncate block"
                              >
                                {entry[proofField] as string}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Additional Notes Section */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-sm font-medium text-slate-200 mb-3">Monthly Summary</h3>
            {editingEntry ? (
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Key Achievements</label>
                  <textarea
                    value={(entry.achievements as string) || ''}
                    onChange={(e) => updateEntry('achievements', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-white/10 rounded-lg resize-none"
                    rows={3}
                    placeholder="What went well this month..."
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Challenges Faced</label>
                  <textarea
                    value={(entry.challenges as string) || ''}
                    onChange={(e) => updateEntry('challenges', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-white/10 rounded-lg resize-none"
                    rows={3}
                    placeholder="What challenges did you face..."
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Next Month Plans</label>
                  <textarea
                    value={(entry.nextMonthPlan as string) || ''}
                    onChange={(e) => updateEntry('nextMonthPlan', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-white/10 rounded-lg resize-none"
                    rows={3}
                    placeholder="Plans for next month..."
                  />
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-green-500/10 rounded-lg p-3 border border-green-100">
                  <p className="text-xs text-green-400 font-medium mb-1">Achievements</p>
                  <p className="text-sm text-slate-200">{(entry.achievements as string) || '-'}</p>
                </div>
                <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-100">
                  <p className="text-xs text-amber-400 font-medium mb-1">Challenges</p>
                  <p className="text-sm text-slate-200">{(entry.challenges as string) || '-'}</p>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-100">
                  <p className="text-xs text-blue-400 font-medium mb-1">Next Month</p>
                  <p className="text-sm text-slate-200">{(entry.nextMonthPlan as string) || '-'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {!isSubmitted && (
          <div className="px-5 py-4 border-t border-white/10 flex justify-end gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={loading}
              className="px-6 py-2.5 border border-white/20 text-slate-200 rounded-lg hover:bg-slate-900/40 disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        )}
      </div>

      {/* Yearly Overview */}
      {yearlyData.length > 0 && (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Yearly Performance {new Date().getFullYear()}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/40">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-200">Month</th>
                  {HR_KPIS.slice(0, 4).map(kpi => (
                    <th key={kpi.id} className="px-4 py-3 text-center font-semibold text-slate-200">{kpi.label}</th>
                  ))}
                  <th className="px-4 py-3 text-center font-semibold text-slate-200">Submitted</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-200">Score</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.map(meeting => (
                  <tr key={meeting.id} className="border-b border-white/5 hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-medium text-white">
                      {formatMonth(new Date(meeting.reportingMonth))}
                    </td>
                    {HR_KPIS.slice(0, 4).map(kpi => {
                      const entry = meeting.kpiEntries[0]
                      const val = entry?.[kpi.id] as number | null
                      return (
                        <td key={kpi.id} className="px-4 py-3 text-center text-slate-300">
                          {val !== null && val !== undefined ? val.toLocaleString() : '-'}
                        </td>
                      )
                    })}
                    <td className="px-4 py-3 text-center">
                      {meeting.submittedOnTime ? (
                        <span className="text-green-400">On time</span>
                      ) : (
                        <span className="text-red-400">Late</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-white">
                      {meeting.overallScore ? `${meeting.overallScore.toFixed(0)}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
