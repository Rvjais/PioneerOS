'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Meeting {
  id: string
  leadId: string
  lead: {
    id: string
    companyName: string
    contactName: string
  }
  meetingType: string
  title: string
  description: string | null
  scheduledAt: string
  duration: number
  location: string | null
  meetingLink: string | null
  outcome: string | null
  outcomeNotes: string | null
  status: string
  recordingUrl?: string | null
}

interface Lead {
  id: string
  companyName: string
  contactName: string
}

const MEETING_TYPES = ['DISCOVERY_CALL', 'PROPOSAL_DISCUSSION', 'DEMO_CALL', 'NEGOTIATION']
const OUTCOMES = ['INTERESTED', 'NEEDS_FOLLOW_UP', 'BUDGET_CONSTRAINT', 'LOST']
const STATUSES = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showEndModal, setShowEndModal] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [endLoading, setEndLoading] = useState(false)
  const [endError, setEndError] = useState('')
  const [filter, setFilter] = useState<string>('upcoming')

  const [endMeetingData, setEndMeetingData] = useState({
    videoUrl: '',
    summary: '',
    outcome: 'INTERESTED',
  })

  const [newMeeting, setNewMeeting] = useState({
    leadId: '',
    meetingType: 'DISCOVERY_CALL',
    title: '',
    description: '',
    scheduledAt: '',
    duration: 30,
    location: '',
    meetingLink: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [meetingsRes, leadsRes] = await Promise.all([
        fetch('/api/sales/meetings'),
        fetch('/api/sales/leads'),
      ])
      if (meetingsRes.ok) setMeetings(await meetingsRes.json())
      if (leadsRes.ok) {
        const json = await leadsRes.json()
        setLeads(Array.isArray(json) ? json : json.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createMeeting = async () => {
    try {
      const res = await fetch('/api/sales/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeeting),
      })
      if (res.ok) {
        const created = await res.json()
        setMeetings([created, ...meetings])
        setShowModal(false)
        setNewMeeting({
          leadId: '',
          meetingType: 'DISCOVERY_CALL',
          title: '',
          description: '',
          scheduledAt: '',
          duration: 30,
          location: '',
          meetingLink: '',
        })
      }
    } catch (error) {
      console.error('Failed to create meeting:', error)
    }
  }

  const updateMeetingStatus = async (meetingId: string, status: string, outcome?: string) => {
    try {
      const res = await fetch(`/api/sales/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, outcome }),
      })
      if (res.ok) {
        const updated = await res.json()
        setMeetings(meetings.map(m => m.id === meetingId ? updated : m))
      }
    } catch (error) {
      console.error('Failed to update meeting:', error)
    }
  }

  const openEndMeetingModal = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setEndMeetingData({
      videoUrl: meeting.meetingLink || '',
      summary: '',
      outcome: 'INTERESTED',
    })
    setEndError('')
    setShowEndModal(true)
  }

  const handleEndMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMeeting) return

    if (!endMeetingData.videoUrl.trim()) {
      setEndError('Video meeting URL is required')
      return
    }
    if (!endMeetingData.summary.trim()) {
      setEndError('Meeting summary is required')
      return
    }

    setEndLoading(true)
    setEndError('')

    try {
      const res = await fetch(`/api/sales/meetings/${selectedMeeting.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'COMPLETED',
          outcome: endMeetingData.outcome,
          outcomeNotes: endMeetingData.summary,
          meetingLink: endMeetingData.videoUrl,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to complete meeting')
      }

      const updated = await res.json()
      setMeetings(meetings.map(m => m.id === selectedMeeting.id ? updated : m))
      setShowEndModal(false)
      setSelectedMeeting(null)
      setEndMeetingData({ videoUrl: '', summary: '', outcome: 'INTERESTED' })
    } catch (err) {
      setEndError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setEndLoading(false)
    }
  }

  const canEndMeeting = (meeting: Meeting) => {
    return meeting.status === 'SCHEDULED' && new Date(meeting.scheduledAt) < now
  }

  const now = new Date()
  const filteredMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.scheduledAt)
    if (filter === 'upcoming') return meetingDate >= now && m.status !== 'CANCELLED'
    if (filter === 'past') return meetingDate < now || m.status === 'COMPLETED'
    if (filter === 'cancelled') return m.status === 'CANCELLED'
    return true
  })

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Meeting Management</h1>
          <p className="text-sm text-slate-400">Track all sales meetings and discovery calls</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Schedule Meeting
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'past', label: 'Past' },
          { id: 'cancelled', label: 'Cancelled' },
          { id: 'all', label: 'All' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === tab.id
                ? 'bg-orange-500 text-white'
                : 'glass-card text-slate-300 border border-white/10 hover:bg-slate-900/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Meetings List */}
      <div className="space-y-3">
        {filteredMeetings.length === 0 ? (
          <div className="glass-card rounded-lg border border-white/10 p-12 text-center text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No meetings found</p>
          </div>
        ) : (
          filteredMeetings.map(meeting => (
            <div
              key={meeting.id}
              className={`glass-card rounded-lg border p-4 ${
                meeting.status === 'CANCELLED' ? 'border-red-200 bg-red-500/10' :
                meeting.status === 'COMPLETED' ? 'border-green-200' :
                'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      meeting.meetingType === 'DISCOVERY_CALL' ? 'bg-cyan-100 text-cyan-700' :
                      meeting.meetingType === 'PROPOSAL_DISCUSSION' ? 'bg-purple-500/20 text-purple-400' :
                      meeting.meetingType === 'DEMO_CALL' ? 'bg-indigo-500/20 text-indigo-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {meeting.meetingType.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      meeting.status === 'SCHEDULED' ? 'bg-blue-500/20 text-blue-400' :
                      meeting.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                      meeting.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {meeting.status}
                    </span>
                    {meeting.outcome && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        meeting.outcome === 'INTERESTED' ? 'bg-green-500/20 text-green-400' :
                        meeting.outcome === 'NEEDS_FOLLOW_UP' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {meeting.outcome.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-white">{meeting.title}</h3>
                  <Link
                    href={`/sales/leads/${meeting.lead.id}`}
                    className="text-sm text-orange-600 hover:underline"
                  >
                    {meeting.lead.companyName} - {meeting.lead.contactName}
                  </Link>
                  {meeting.description && (
                    <p className="text-sm text-slate-400 mt-1">{meeting.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDateTime(meeting.scheduledAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {meeting.duration} min
                    </span>
                    {meeting.location && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {meeting.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {meeting.meetingLink && new Date(meeting.scheduledAt) > now && (
                    <a
                      href={meeting.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Join
                    </a>
                  )}
                  {meeting.status === 'SCHEDULED' && (
                    <>
                      {canEndMeeting(meeting) ? (
                        <button
                          onClick={() => openEndMeetingModal(meeting)}
                          className="px-3 py-1.5 text-xs text-emerald-600 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 flex items-center gap-1 font-medium"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          End Meeting
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 text-xs text-slate-400 bg-slate-900/40 rounded-lg">
                          Upcoming
                        </span>
                      )}
                      <button
                        onClick={() => updateMeetingStatus(meeting.id, 'CANCELLED')}
                        className="px-3 py-1.5 text-xs text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {meeting.status === 'COMPLETED' && meeting.meetingLink && (
                    <a
                      href={meeting.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs text-purple-400 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Recording
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Meeting Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold text-white">Schedule Meeting</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Lead *</label>
                <select
                  value={newMeeting.leadId}
                  onChange={(e) => setNewMeeting({ ...newMeeting, leadId: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Lead...</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.companyName} - {lead.contactName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Meeting Type</label>
                  <select
                    value={newMeeting.meetingType}
                    onChange={(e) => setNewMeeting({ ...newMeeting, meetingType: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {MEETING_TYPES.map(t => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Duration (min)</label>
                  <select
                    value={newMeeting.duration}
                    onChange={(e) => setNewMeeting({ ...newMeeting, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Title *</label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Discovery call with..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={newMeeting.scheduledAt}
                  onChange={(e) => setNewMeeting({ ...newMeeting, scheduledAt: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Location</label>
                  <input
                    type="text"
                    value={newMeeting.location}
                    onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Office / Online"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Meeting Link</label>
                  <input
                    type="url"
                    value={newMeeting.meetingLink}
                    onChange={(e) => setNewMeeting({ ...newMeeting, meetingLink: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Zoom/Meet link"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
                <textarea
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={2}
                  placeholder="Meeting agenda..."
                />
              </div>
            </div>
            <div className="p-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={createMeeting}
                disabled={!newMeeting.leadId || !newMeeting.title || !newMeeting.scheduledAt}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-white/20 disabled:cursor-not-allowed"
              >
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Meeting Modal */}
      {showEndModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-emerald-50 to-green-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-white">End Meeting</h2>
                  <p className="text-sm text-slate-400">{selectedMeeting.title}</p>
                </div>
              </div>
              <button onClick={() => { setShowEndModal(false); setEndError('') }} className="text-slate-400 hover:text-slate-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEndMeeting} className="p-4 space-y-4">
              {endError && (
                <div className="p-3 bg-red-500/10 border border-red-200 rounded-lg text-red-400 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {endError}
                </div>
              )}

              {/* Meeting Info */}
              <div className="p-3 bg-slate-900/40 rounded-lg space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Lead</span>
                  <Link href={`/sales/leads/${selectedMeeting.lead.id}`} className="text-orange-600 hover:underline font-medium">
                    {selectedMeeting.lead.companyName}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Type</span>
                  <span className="text-slate-200">{selectedMeeting.meetingType.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Scheduled</span>
                  <span className="text-slate-200">
                    {new Date(selectedMeeting.scheduledAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {/* Video URL - Required */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Video Meeting URL / Recording *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={endMeetingData.videoUrl}
                    onChange={(e) => setEndMeetingData({ ...endMeetingData, videoUrl: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://meet.google.com/... or recording link"
                    required
                  />
                  <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-400 mt-1">Paste video call or recording URL for future reference</p>
              </div>

              {/* Outcome */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Meeting Outcome *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {OUTCOMES.map(outcome => (
                    <button
                      key={outcome}
                      type="button"
                      onClick={() => setEndMeetingData({ ...endMeetingData, outcome })}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        endMeetingData.outcome === outcome
                          ? outcome === 'INTERESTED' ? 'bg-green-500/20 border-green-300 text-green-400' :
                            outcome === 'NEEDS_FOLLOW_UP' ? 'bg-amber-500/20 border-amber-300 text-amber-400' :
                            outcome === 'BUDGET_CONSTRAINT' ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' :
                            'bg-red-500/20 border-red-300 text-red-400'
                          : 'glass-card border-white/10 text-slate-300 hover:bg-slate-900/40'
                      }`}
                    >
                      {outcome.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary - Required */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Meeting Summary *
                </label>
                <textarea
                  value={endMeetingData.summary}
                  onChange={(e) => setEndMeetingData({ ...endMeetingData, summary: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={4}
                  placeholder="Summarize what was discussed, key decisions, and next steps..."
                  required
                />
                <p className="text-xs text-slate-400 mt-1">Document key discussion points and outcomes</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowEndModal(false); setEndError('') }}
                  className="flex-1 px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-900/40"
                  disabled={endLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={endLoading || !endMeetingData.videoUrl || !endMeetingData.summary}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-white/20 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {endLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Completing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Complete Meeting
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
