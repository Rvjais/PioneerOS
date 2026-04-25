'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getMeetingStatusColor } from '@/shared/constants/portal'
import PageGuide from '@/client/components/ui/PageGuide'
import PortalPageSkeleton from '@/client/components/portal/PortalPageSkeleton'

interface Participant {
  id: string
  role: string
  attended: boolean
  user: {
    id: string
    name: string
    role: string
  }
}

interface Meeting {
  id: string
  title: string
  description: string | null
  type: string
  category: string
  date: string
  duration: number
  location: string | null
  status: string
  agenda: string | null
  notes: string | null
  isOnline: boolean
  momRecorded: boolean
  participants: Participant[]
  createdAt: string
}

interface Summary {
  upcoming: number
  completed: number
  cancelled: number
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPast, setShowPast] = useState(false)
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMeetings()
  }, [showPast])

  const fetchMeetings = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (showPast) params.append('past', 'true')

      const res = await fetch(`/api/client-portal/meetings?${params}`)
      if (res.ok) {
        const data = await res.json()
        setMeetings(data.meetings || [])
        setSummary(data.summary || null)
      } else {
        setError('Failed to load meetings')
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
      setError('Failed to load meetings')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const weekday = date.toLocaleDateString('en-IN', { weekday: 'long' })
    return `${weekday}, ${day}-${month}-${date.getFullYear()}`
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const isPast = (dateStr: string) => new Date(dateStr) < new Date()

  return (
    <div className="space-y-6">
      <PageGuide
        title="Meetings"
        description="Track all scheduled and completed meetings with your account team."
        pageKey="portal-meetings"
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Meetings</h1>
        <p className="text-slate-300 mt-1">View your scheduled meetings and past sessions</p>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4 shadow-none border border-white/10">
            <p className="text-sm text-slate-400">Upcoming</p>
            <p className="text-2xl font-bold text-blue-400">{summary.upcoming}</p>
          </div>
          <div className="glass-card rounded-xl p-4 shadow-none border border-white/10">
            <p className="text-sm text-slate-400">Completed</p>
            <p className="text-2xl font-bold text-green-400">{summary.completed}</p>
          </div>
          <div className="glass-card rounded-xl p-4 shadow-none border border-white/10">
            <p className="text-sm text-slate-400">Cancelled</p>
            <p className="text-2xl font-bold text-slate-400">{summary.cancelled}</p>
          </div>
        </div>
      )}

      {/* Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowPast(false)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            !showPast ? 'bg-blue-600 text-white' : 'glass-card text-slate-300 border border-white/20 hover:bg-slate-900/40'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setShowPast(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showPast ? 'bg-blue-600 text-white' : 'glass-card text-slate-300 border border-white/20 hover:bg-slate-900/40'
          }`}
        >
          Past Meetings
        </button>
      </div>

      {/* Error State */}
      {error ? (
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => { setError(null); fetchMeetings() }} className="px-4 py-2 bg-orange-500 text-white rounded-lg">Try Again</button>
        </div>
      ) : null}

      {/* Meetings List */}
      {!error && loading ? (
        <PortalPageSkeleton titleWidth="w-36" statCards={3} listItems={4} />
      ) : !error && meetings.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center border border-white/10">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-1">
            No {showPast ? 'Past' : 'Upcoming'} Meetings
          </h3>
          <p className="text-slate-400">
            {showPast
              ? 'Your past meetings will appear here.'
              : 'You have no upcoming meetings scheduled.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="glass-card rounded-xl shadow-none border border-white/10 overflow-hidden"
            >
              <div
                className="px-6 py-4 cursor-pointer hover:bg-slate-900/40 transition-colors"
                onClick={() => setExpandedMeeting(expandedMeeting === meeting.id ? null : meeting.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      meeting.isOnline ? 'bg-purple-500/20' : 'bg-blue-500/20'
                    }`}>
                      {meeting.isOnline ? (
                        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{meeting.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        {formatDate(meeting.date)} at {formatTime(meeting.date)} | {formatDuration(meeting.duration)}
                      </p>
                      {meeting.location && (
                        <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {meeting.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getMeetingStatusColor(meeting.status)}`}>
                      {meeting.status}
                    </span>
                    {meeting.momRecorded && (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-purple-500/20 text-purple-400">
                        MOM Available
                      </span>
                    )}
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        expandedMeeting === meeting.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedMeeting === meeting.id && (
                <div className="px-6 py-4 border-t border-white/5 bg-slate-900/40">
                  {meeting.description && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-200 mb-1">Description</h4>
                      <p className="text-slate-300">{meeting.description}</p>
                    </div>
                  )}

                  {meeting.agenda && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-200 mb-1">Agenda</h4>
                      {(() => {
                        try {
                          const items = JSON.parse(meeting.agenda)
                          return Array.isArray(items) ? (
                            <ul className="list-disc list-inside text-slate-300 space-y-1">
                              {items.map((item: string, i: number) => <li key={`${item}-${i}`}>{item}</li>)}
                            </ul>
                          ) : (
                            <p className="text-slate-300 whitespace-pre-wrap">{meeting.agenda}</p>
                          )
                        } catch {
                          return <p className="text-slate-300 whitespace-pre-wrap">{meeting.agenda}</p>
                        }
                      })()}
                    </div>
                  )}

                  {meeting.notes && isPast(meeting.date) && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-200 mb-1">Meeting Notes</h4>
                      <p className="text-slate-300 whitespace-pre-wrap">{meeting.notes}</p>
                    </div>
                  )}

                  {meeting.participants.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-200 mb-2">Participants</h4>
                      <div className="flex flex-wrap gap-2">
                        {meeting.participants.map((p) => (
                          <span
                            key={p.id}
                            className={`px-3 py-1 text-sm rounded-full ${
                              p.attended
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-slate-800/50 text-slate-300'
                            }`}
                          >
                            {p.user.name}
                            {p.role === 'ORGANIZER' && ' (Organizer)'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View MOM Link */}
                  {meeting.status === 'COMPLETED' && meeting.momRecorded && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <Link
                        href={`/portal/meetings/${meeting.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Minutes of Meeting
                      </Link>
                    </div>
                  )}

                  {/* View Details Link for meetings without MOM */}
                  {meeting.status === 'COMPLETED' && !meeting.momRecorded && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <Link
                        href={`/portal/meetings/${meeting.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Meeting Details
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
