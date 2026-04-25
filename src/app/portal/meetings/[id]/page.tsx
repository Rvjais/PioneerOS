'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getMeetingStatusColor, getPriorityColor, getTaskStatusColor } from '@/shared/constants/portal'
import { Breadcrumb } from '@/client/components/ui/Breadcrumb'
import PortalPageSkeleton from '@/client/components/portal/PortalPageSkeleton'

interface Participant {
  id: string
  role: string
  attended: boolean
  user: {
    id: string
    name: string
    role: string
    avatarUrl: string | null
  }
}

interface ActionItem {
  id: string
  title: string
  description: string | null
  assignee: {
    id: string
    name: string
  }
  dueDate: string | null
  priority: string
  status: string
  completedAt: string | null
}

interface Meeting {
  id: string
  title: string
  description: string | null
  type: string
  category: string
  date: string
  duration: number | null
  location: string | null
  status: string
  isOnline: boolean
  recurrence: string | null
  momRecorded: boolean
  agenda: string[]
  agendaRaw: string | null
  notes: string | null
  minutesSummary: string | null
  participants: Participant[]
  actionItems: ActionItem[]
  createdAt: string
  updatedAt: string
}

export default function MeetingDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchMeeting()
    }
  }, [id])

  const fetchMeeting = async () => {
    try {
      const res = await fetch(`/api/client-portal/meetings/${id}`)
      if (res.ok) {
        const data = await res.json()
        setMeeting(data.meeting)
      } else if (res.status === 404) {
        setError('Meeting not found or you don\'t have access to view it.')
      } else {
        setError('Failed to load meeting')
      }
    } catch (err) {
      console.error('Failed to fetch meeting:', err)
      setError('Failed to load meeting')
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

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return null
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  // Simple markdown renderer for MOM
  const renderMarkdown = (text: string) => {
    // Split by lines and process
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    let currentList: string[] = []
    let listType: 'ul' | 'ol' | null = null

    const flushList = () => {
      if (currentList.length > 0) {
        if (listType === 'ul') {
          elements.push(
            <ul key={elements.length} className="list-disc list-inside space-y-1 mb-4">
              {currentList.map((item, i) => (
                <li key={i} className="text-slate-200">{item}</li>
              ))}
            </ul>
          )
        } else {
          elements.push(
            <ol key={elements.length} className="list-decimal list-inside space-y-1 mb-4">
              {currentList.map((item, i) => (
                <li key={i} className="text-slate-200">{item}</li>
              ))}
            </ol>
          )
        }
        currentList = []
        listType = null
      }
    }

    lines.forEach((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        flushList()
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-white mt-4 mb-2">
            {line.slice(4)}
          </h3>
        )
      } else if (line.startsWith('## ')) {
        flushList()
        elements.push(
          <h2 key={index} className="text-xl font-bold text-white mt-6 mb-3">
            {line.slice(3)}
          </h2>
        )
      } else if (line.startsWith('# ')) {
        flushList()
        elements.push(
          <h1 key={index} className="text-2xl font-bold text-white mt-6 mb-4">
            {line.slice(2)}
          </h1>
        )
      }
      // Bullet points
      else if (line.match(/^[-*]\s/)) {
        if (listType !== 'ul') {
          flushList()
          listType = 'ul'
        }
        currentList.push(line.slice(2))
      }
      // Numbered lists
      else if (line.match(/^\d+\.\s/)) {
        if (listType !== 'ol') {
          flushList()
          listType = 'ol'
        }
        currentList.push(line.replace(/^\d+\.\s/, ''))
      }
      // Bold text - render safely without dangerouslySetInnerHTML
      else if (line.trim()) {
        flushList()
        // Split by bold markers and render safely
        const parts = line.split(/\*\*(.*?)\*\*/g)
        elements.push(
          <p key={index} className="text-slate-200 mb-2">
            {parts.map((part, i) =>
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </p>
        )
      }
      // Empty line
      else {
        flushList()
      }
    })

    flushList()
    return elements
  }

  if (loading) {
    return <PortalPageSkeleton titleWidth="w-48" statCards={0} listItems={3} showFilters={false} />
  }

  if (error || !meeting) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[
          { label: 'Portal', href: '/portal' },
          { label: 'Meetings', href: '/portal/meetings' },
          { label: 'Not Found' },
        ]} />

        <div className="glass-card rounded-xl p-8 text-center border border-white/10">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-1">{error || 'Meeting not found'}</h3>
          <p className="text-slate-400">This meeting may have been deleted or you may not have access to it.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Portal', href: '/portal' },
        { label: 'Meetings', href: '/portal/meetings' },
        { label: meeting.title },
      ]} />

      {/* Meeting Header */}
      <div className="glass-card rounded-xl shadow-none border border-white/10 overflow-hidden">
        <div className={`px-6 py-5 ${meeting.isOnline ? 'bg-purple-500/10' : 'bg-blue-500/10'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                meeting.isOnline ? 'bg-purple-500/20' : 'bg-blue-500/20'
              }`}>
                {meeting.isOnline ? (
                  <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${getMeetingStatusColor(meeting.status)}`}>
                    {meeting.status}
                  </span>
                  {meeting.momRecorded && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-500/20 text-purple-400">
                      MOM Available
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white">{meeting.title}</h1>
                <p className="text-slate-300 mt-1">
                  {formatDate(meeting.date)} at {formatTime(meeting.date)}
                  {meeting.duration && ` | ${formatDuration(meeting.duration)}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                meeting.isOnline ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {meeting.isOnline ? 'Online' : 'In Person'}
              </span>
            </div>
          </div>
        </div>

        {(meeting.description || meeting.location) && (
          <div className="px-6 py-4 border-t border-white/5">
            {meeting.description && (
              <div className="mb-3">
                <p className="text-sm text-slate-400 mb-1">Description</p>
                <p className="text-slate-200">{meeting.description}</p>
              </div>
            )}
            {meeting.location && (
              <div className="flex items-center gap-2 text-slate-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {meeting.isOnline ? (
                  <a
                    href={meeting.location}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Join Meeting
                  </a>
                ) : (
                  <span>{meeting.location}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agenda */}
          {meeting.agenda.length > 0 && (
            <div className="glass-card rounded-xl shadow-none border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">Agenda</h2>
              </div>
              <div className="px-6 py-4">
                <ol className="list-decimal list-inside space-y-2">
                  {meeting.agenda.map((item, index) => (
                    <li key={index} className="text-slate-200">{item}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Minutes of Meeting */}
          {meeting.minutesSummary && (
            <div className="glass-card rounded-xl shadow-none border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 bg-purple-500/10">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h2 className="text-lg font-semibold text-white">Minutes of Meeting</h2>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="prose prose-slate max-w-none">
                  {renderMarkdown(meeting.minutesSummary)}
                </div>
              </div>
            </div>
          )}

          {/* Meeting Notes (fallback if no MOM) */}
          {!meeting.minutesSummary && meeting.notes && (
            <div className="glass-card rounded-xl shadow-none border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">Meeting Notes</h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-slate-200 whitespace-pre-wrap">{meeting.notes}</p>
              </div>
            </div>
          )}

          {/* Action Items */}
          {meeting.actionItems.length > 0 && (
            <div className="glass-card rounded-xl shadow-none border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Action Items</h2>
                  <span className="px-2 py-1 text-xs font-medium bg-slate-800/50 text-slate-200 rounded">
                    {meeting.actionItems.filter(i => i.status === 'COMPLETED').length}/{meeting.actionItems.length} completed
                  </span>
                </div>
              </div>
              <div className="divide-y divide-white/10">
                {meeting.actionItems.map((item) => (
                  <div key={item.id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          item.status === 'COMPLETED' ? 'bg-green-500' : 'bg-white/20'
                        }`}>
                          {item.status === 'COMPLETED' && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className={`font-medium ${
                            item.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-white'
                          }`}>
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            <span className="text-slate-400">
                              Assigned to: <span className="font-medium text-slate-200">{item.assignee.name}</span>
                            </span>
                            {item.dueDate && (
                              <span className="text-slate-400">
                                Due: <span className="font-medium text-slate-200">{formatDate(item.dueDate)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTaskStatusColor(item.status)}`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Participants */}
          <div className="glass-card rounded-xl shadow-none border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Participants</h2>
            </div>
            <div className="divide-y divide-white/10">
              {meeting.participants.map((participant) => (
                <div key={participant.id} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {participant.user.avatarUrl ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={participant.user.avatarUrl}
                          alt={participant.user.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {participant.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{participant.user.name}</p>
                      {participant.role === 'ORGANIZER' && (
                        <p className="text-xs text-slate-400">Organizer</p>
                      )}
                    </div>
                  </div>
                  {meeting.status === 'COMPLETED' && (
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      participant.attended ? 'bg-green-500/20 text-green-400' : 'bg-slate-800/50 text-slate-400'
                    }`}>
                      {participant.attended ? 'Attended' : 'Absent'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Meeting Details */}
          <div className="glass-card rounded-xl shadow-none border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Details</h2>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Type</span>
                <span className="font-medium text-white">{meeting.type.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Category</span>
                <span className="font-medium text-white">{meeting.category}</span>
              </div>
              {meeting.recurrence && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Recurrence</span>
                  <span className="font-medium text-white">{meeting.recurrence}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Created</span>
                <span className="font-medium text-white">{formatDate(meeting.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
