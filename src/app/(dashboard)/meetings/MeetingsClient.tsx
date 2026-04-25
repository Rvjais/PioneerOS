'use client'

import { useState } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Client {
  id: string
  name: string
}

interface User {
  id: string
  firstName: string
  lastName: string | null
  department: string
}

interface Meeting {
  id: string
  title: string
  category: string
  date: string
  duration: number
  status: string
  isOnline: boolean
  meetingLink: string | null
  noteTakerUrl: string | null
  minutesSummary: string | null
  keyPointers: string | null
  client: { id: string; name: string } | null
  participants: { user: { id: string; firstName: string; lastName: string | null } }[]
}

interface Props {
  clients: Client[]
  users: User[]
  meetings?: Meeting[]
}

const categoryOptions = [
  { value: 'STRATEGIC', label: 'Strategic', description: 'Quarterly planning and strategy' },
  { value: 'TACTICAL', label: 'Tactical', description: 'Monthly client reviews' },
  { value: 'OPERATIONS', label: 'Operations', description: 'Weekly team sync' },
  { value: 'HUDDLE', label: '11AM Huddle', description: 'Daily standup' },
  { value: 'GENERAL', label: 'General', description: 'Other meetings' },
]

export function MeetingsClient({ clients, users, meetings = [] }: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [showEndModal, setShowEndModal] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [endMeetingData, setEndMeetingData] = useState({
    videoUrl: '',
    summary: '',
    keyPointers: '',
  })

  const [formData, setFormData] = useState({
    title: '',
    category: 'TACTICAL',
    date: '',
    time: '11:00',
    duration: 60,
    clientId: '',
    isOnline: true,
    meetingLink: '',
    location: '',
    agenda: '',
    participantIds: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`)

      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          date: dateTime.toISOString(),
          duration: formData.duration,
          clientId: formData.clientId || null,
          isOnline: formData.isOnline,
          meetingLink: formData.meetingLink || null,
          location: formData.location || null,
          agenda: formData.agenda || null,
          participantIds: formData.participantIds,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create meeting')
      }

      setShowModal(false)
      setFormData({
        title: '',
        category: 'TACTICAL',
        date: '',
        time: '11:00',
        duration: 60,
        clientId: '',
        isOnline: true,
        meetingLink: '',
        location: '',
        agenda: '',
        participantIds: [],
      })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleParticipant = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      participantIds: prev.participantIds.includes(userId)
        ? prev.participantIds.filter(id => id !== userId)
        : [...prev.participantIds, userId],
    }))
  }

  const openEndMeetingModal = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setEndMeetingData({
      videoUrl: meeting.noteTakerUrl || meeting.meetingLink || '',
      summary: meeting.minutesSummary || '',
      keyPointers: meeting.keyPointers || '',
    })
    setShowEndModal(true)
  }

  const handleEndMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMeeting) return

    if (!endMeetingData.videoUrl.trim()) {
      setError('Video meeting URL is required to end the meeting')
      return
    }
    if (!endMeetingData.summary.trim()) {
      setError('Meeting summary is required to end the meeting')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/meetings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: selectedMeeting.id,
          status: 'COMPLETED',
          noteTakerUrl: endMeetingData.videoUrl,
          minutesSummary: endMeetingData.summary,
          keyPointers: endMeetingData.keyPointers || null,
          momRecorded: true,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to end meeting')
      }

      setShowEndModal(false)
      setSelectedMeeting(null)
      setEndMeetingData({ videoUrl: '', summary: '', keyPointers: '' })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Get meetings that can be ended (past scheduled meetings)
  const now = new Date()
  const endableMeetings = meetings.filter(m =>
    m.status === 'SCHEDULED' && new Date(m.date) < now
  )

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-none hover:shadow-blue-500/20 transition-all"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Schedule Meeting
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Schedule Meeting</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Monthly Client Review - ABC Clinic"
                  className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categoryOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: opt.value }))}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.category === opt.value
                          ? 'border-blue-500 bg-blue-500/20 text-white'
                          : 'border-white/10 bg-white/5 backdrop-blur-sm text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-xs opacity-70">{opt.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Duration (minutes)
                </label>
                <select
                  value={formData.duration}
                  onChange={e => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Client (optional)
                </label>
                <select
                  value={formData.clientId}
                  onChange={e => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">No client (internal meeting)</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Online/Physical Toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Meeting Type
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isOnline: true }))}
                    className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      formData.isOnline
                        ? 'border-blue-500 bg-blue-500/20 text-white'
                        : 'border-white/10 bg-white/5 backdrop-blur-sm text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Online
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isOnline: false }))}
                    className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      !formData.isOnline
                        ? 'border-blue-500 bg-blue-500/20 text-white'
                        : 'border-white/10 bg-white/5 backdrop-blur-sm text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    In-Person
                  </button>
                </div>
              </div>

              {/* Meeting Link or Location */}
              {formData.isOnline ? (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    value={formData.meetingLink}
                    onChange={e => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Conference Room A"
                    className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* Agenda */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Agenda
                </label>
                <textarea
                  value={formData.agenda}
                  onChange={e => setFormData(prev => ({ ...prev, agenda: e.target.value }))}
                  placeholder="Meeting agenda and topics to discuss..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Participants */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Participants
                </label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                  {users.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => toggleParticipant(user.id)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        formData.participantIds.includes(user.id)
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 backdrop-blur-sm text-slate-400 hover:bg-white/20'
                      }`}
                    >
                      {user.firstName} {user.lastName || ''}
                    </button>
                  ))}
                </div>
                {formData.participantIds.length > 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    {formData.participantIds.length} participant(s) selected
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/5 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.title || !formData.date}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-none hover:shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Schedule Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* End Meeting Modal */}
      {showEndModal && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-green-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">End Meeting</h2>
                    <p className="text-sm text-slate-400">{selectedMeeting.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowEndModal(false); setError('') }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleEndMeeting} className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Meeting Info */}
              <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Date</span>
                  <span className="text-white">
                    {formatDateDDMMYYYY(selectedMeeting.date)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-white">{selectedMeeting.duration} mins</span>
                </div>
                {selectedMeeting.client && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Client</span>
                    <Link href={`/clients/${selectedMeeting.client.id}`} className="text-blue-400 hover:underline">
                      {selectedMeeting.client.name}
                    </Link>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Participants</span>
                  <span className="text-white">{selectedMeeting.participants.length} attendee(s)</span>
                </div>
              </div>

              {/* Video Meeting URL - Required */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Video Meeting URL / Recording Link *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={endMeetingData.videoUrl}
                    onChange={e => setEndMeetingData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://meet.google.com/... or recording link"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-400 mt-1">Paste the video call URL or recording link for future reference</p>
              </div>

              {/* Meeting Summary - Required */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Meeting Summary *
                </label>
                <textarea
                  value={endMeetingData.summary}
                  onChange={e => setEndMeetingData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Summarize what was discussed, decisions made, and outcomes..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 resize-none"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">Provide a comprehensive summary of the meeting discussion</p>
              </div>

              {/* Key Pointers - Optional */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Key Pointers / Action Items
                </label>
                <textarea
                  value={endMeetingData.keyPointers}
                  onChange={e => setEndMeetingData(prev => ({ ...prev, keyPointers: e.target.value }))}
                  placeholder="- Follow up on proposal&#10;- Send revised pricing&#10;- Schedule next meeting"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">List key action items or important points from the meeting</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => { setShowEndModal(false); setError('') }}
                  className="flex-1 px-4 py-2.5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/5 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !endMeetingData.videoUrl || !endMeetingData.summary}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-medium hover:shadow-none hover:shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Completing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    </>
  )
}

// Export the function to open end meeting modal for use in parent component
export function EndMeetingButton({ meeting, onEndMeeting }: { meeting: Meeting; onEndMeeting: (meeting: Meeting) => void }) {
  return (
    <button
      onClick={() => onEndMeeting(meeting)}
      className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      End Meeting
    </button>
  )
}
