'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import InfoTip from '@/client/components/ui/InfoTip'

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

const categoryOptions = [
  { value: 'CLIENT_MEETING', label: 'Client Meeting', description: 'External client meetings with MoM' },
  { value: 'STRATEGIC', label: 'Strategic', description: 'Quarterly planning and strategy' },
  { value: 'TACTICAL', label: 'Tactical', description: 'Monthly client reviews' },
  { value: 'OPERATIONS', label: 'Operations', description: 'Weekly team sync' },
  { value: 'HUDDLE', label: '11AM Huddle', description: 'Daily standup' },
  { value: 'GENERAL', label: 'General', description: 'Other meetings' },
]

export default function NewMeetingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    category: 'GENERAL',
    date: '',
    time: '11:00',
    duration: 60,
    clientId: '',
    isOnline: true,
    meetingLink: '',
    location: '',
    agenda: '',
    participantIds: [] as string[],
    // MoM (Minutes of Meeting) fields for client meetings
    noteTakerUrl: '', // Noota/MeetGeek URL
    momSummary: '', // Meeting summary/minutes
    keyPointers: '', // Manual pointers for physical meetings
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, usersRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/users'),
        ])

        if (clientsRes.ok) {
          const data = await clientsRes.json()
          setClients(Array.isArray(data) ? data : (data.clients || []))
        }

        if (usersRes.ok) {
          const data = await usersRes.json()
          setUsers(Array.isArray(data) ? data : (data.users || []))
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [])

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
          // MoM fields
          noteTakerUrl: formData.noteTakerUrl || null,
          momSummary: formData.momSummary || null,
          keyPointers: formData.keyPointers || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create meeting')
      }

      router.push('/meetings')
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

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Schedule New Meeting</h1>
          <p className="text-slate-400 mt-1">Create a new meeting and invite participants</p>
        </div>
        <Link
          href="/meetings"
          className="px-4 py-2 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors"
        >
          Cancel
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Meeting Title * <InfoTip text="Clear subject line so attendees know the agenda. Include client name if applicable." />
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
            Category * <InfoTip text="STRATEGIC = quarterly big-picture, TACTICAL = monthly ops review, OPERATIONS = project-specific, HUDDLE = daily standup, GENERAL = anything else." />
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
              Date * <InfoTip text="Meeting date. Check attendee availability before scheduling." />
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
              Time * <InfoTip text="Start time. Respect lunch hours (1-2 PM) and end-of-day." />
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
            Duration (minutes) <InfoTip text="Expected length in minutes. Keep under 60 minutes when possible." />
          </label>
          <select
            value={formData.duration}
            onChange={e => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
            className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
            style={{ colorScheme: 'dark' }}
          >
            <option value={15} className="bg-slate-800 text-white">15 minutes</option>
            <option value={30} className="bg-slate-800 text-white">30 minutes</option>
            <option value={45} className="bg-slate-800 text-white">45 minutes</option>
            <option value={60} className="bg-slate-800 text-white">1 hour</option>
            <option value={90} className="bg-slate-800 text-white">1.5 hours</option>
            <option value={120} className="bg-slate-800 text-white">2 hours</option>
          </select>
        </div>

        {/* Client */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Client (optional) <InfoTip text="Link to a client if this meeting is about their account. Leave blank for internal." />
          </label>
          <select
            value={formData.clientId}
            onChange={e => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
            className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
            style={{ colorScheme: 'dark' }}
          >
            <option value="" className="bg-slate-800 text-white">No client (internal meeting)</option>
            {clients.map(client => (
              <option key={client.id} value={client.id} className="bg-slate-800 text-white">
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {/* Online/Physical Toggle */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Meeting Type <InfoTip text="Online = video call (paste link), In-Person = physical location." />
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
              Meeting Link <InfoTip text="Google Meet, Zoom, or Teams URL. Create the meeting room first, then paste link." />
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
              Location <InfoTip text="Physical room or office location for in-person meetings." />
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
            Agenda <InfoTip text="Topics to cover. Share at least 1 day before. No agenda = no meeting." />
          </label>
          <textarea
            value={formData.agenda}
            onChange={e => setFormData(prev => ({ ...prev, agenda: e.target.value }))}
            placeholder="Meeting agenda and topics to discuss..."
            rows={3}
            className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* MoM Section - Show for Client Meetings */}
        {formData.category === 'CLIENT_MEETING' && (
          <div className="space-y-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-sm font-semibold text-blue-300">Minutes of Meeting (MoM)</h3>
            </div>

            {/* Note Taker URL - for online meetings */}
            {formData.isOnline && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Note Taker URL (Noota / MeetGeek) <InfoTip text="Paste the call recording or meeting link for future reference and compliance." />
                </label>
                <input
                  type="url"
                  value={formData.noteTakerUrl}
                  onChange={e => setFormData(prev => ({ ...prev, noteTakerUrl: e.target.value }))}
                  placeholder="https://app.noota.io/... or https://meetgeek.ai/..."
                  className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Paste the Noota or MeetGeek link to auto-capture meeting notes
                </p>
              </div>
            )}

            {/* Key Pointers - for physical meetings */}
            {!formData.isOnline && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Key Discussion Pointers <InfoTip text="Action items with owners. Format: [Person] will [action] by [date]." />
                </label>
                <textarea
                  value={formData.keyPointers}
                  onChange={e => setFormData(prev => ({ ...prev, keyPointers: e.target.value }))}
                  placeholder="• Point 1: Discussion topic and outcome&#10;• Point 2: Action items agreed&#10;• Point 3: Next steps..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">
                  For in-person meetings, manually enter the key points discussed
                </p>
              </div>
            )}

            {/* MoM Summary */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Meeting Summary <InfoTip text="Key discussion points, decisions made, and outcomes. Be comprehensive." />
              </label>
              <textarea
                value={formData.momSummary}
                onChange={e => setFormData(prev => ({ ...prev, momSummary: e.target.value }))}
                placeholder="Paste the AI-generated summary from Noota/MeetGeek, or write key outcomes..."
                rows={4}
                className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                This summary will be visible to team members assigned to the client
              </p>
            </div>
          </div>
        )}

        {/* Participants */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Participants <InfoTip text="Who needs to attend. Include the decision-maker and anyone with action items." />
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
          <Link
            href="/meetings"
            className="flex-1 px-4 py-2.5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/5 transition-colors text-center"
          >
            Cancel
          </Link>
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
  )
}
