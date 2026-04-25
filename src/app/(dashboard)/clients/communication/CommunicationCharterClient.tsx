'use client'

import { useState, useMemo } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'

// Types
interface Schedule {
  id: string
  name: string
  frequency: string
  type: string
  clientId: string
  templateId: string | null
  status: string
  lastSentAt: string | null
  nextDueAt: string | null
  createdAt: string
  updatedAt: string
  client: { id: string; name: string; tier: string; contactName: string | null; contactPhone: string | null }
  template: { id: string; name: string; subject: string | null; content: string } | null
  _count: { logs: number }
  [key: string]: unknown
}

interface Log {
  id: string
  type: string
  subject: string | null
  content: string
  clientId: string | null
  userId: string
  scheduleId: string | null
  status: string | null
  createdAt: string
  user: { id: string; firstName: string; lastName: string }
  client: { id: string; name: string } | null
  schedule: { id: string; name: string } | null
  sentiment?: string
  [key: string]: unknown
}

interface Template {
  id: string
  name: string
  subject: string | null
  content: string
  type: string
  category: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

interface Client {
  id: string
  name: string
  tier: string
}

interface Props {
  schedules: Schedule[]
  clients: Client[]
  templates: Template[]
  recentLogs: Log[]
  currentUserId: string
}

// SVG Icons as components
const icons = {
  whatsapp: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  email: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  call: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  meeting: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  videoCall: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  sms: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  template: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  logs: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  bell: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  refresh: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  positive: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  negative: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  neutral: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  escalation: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const getChannelIcon = (type: string) => {
  switch (type) {
    case 'WHATSAPP': return icons.whatsapp
    case 'EMAIL': return icons.email
    case 'CALL': return icons.call
    case 'MEETING': return icons.meeting
    case 'VIDEO_CALL': return icons.videoCall
    case 'SMS': return icons.sms
    default: return icons.email
  }
}

const getSentimentIcon = (sentiment: string) => {
  switch (sentiment) {
    case 'POSITIVE': return icons.positive
    case 'NEGATIVE': return icons.negative
    case 'ESCALATION': return icons.escalation
    default: return icons.neutral
  }
}

const frequencyLabels: Record<string, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Bi-Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
}

const tierColors: Record<string, string> = {
  ENTERPRISE: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  PREMIUM: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  STANDARD: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
}

const sentimentColors: Record<string, string> = {
  POSITIVE: 'text-emerald-400',
  NEUTRAL: 'text-slate-400',
  NEGATIVE: 'text-red-400',
  ESCALATION: 'text-orange-400',
}

export function CommunicationCharterClient({ schedules, clients, templates, recentLogs }: Props) {
  const [activeTab, setActiveTab] = useState<'schedules' | 'templates' | 'logs' | 'reminders'>('schedules')
  const [searchQuery, setSearchQuery] = useState('')
  const [channelFilter, setChannelFilter] = useState<string>('ALL')
  const [showLogForm, setShowLogForm] = useState(false)

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.client.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesChannel = channelFilter === 'ALL' || s.type === channelFilter
      return matchesSearch && matchesChannel
    })
  }, [schedules, searchQuery, channelFilter])

  const overdueSchedules = useMemo(() => {
    const now = new Date()
    return schedules.filter(s => s.nextDueAt && new Date(s.nextDueAt) < now && s.status === 'ACTIVE')
  }, [schedules])

  const upcomingSchedules = useMemo(() => {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return schedules.filter(s => {
      if (!s.nextDueAt) return false
      const dueDate = new Date(s.nextDueAt)
      return dueDate >= now && dueDate <= nextWeek && s.status === 'ACTIVE'
    })
  }, [schedules])

  const tabs = [
    { id: 'schedules' as const, label: 'Schedules', count: schedules.length, icon: icons.calendar },
    { id: 'templates' as const, label: 'Templates', count: templates.length, icon: icons.template },
    { id: 'logs' as const, label: 'Log History', count: recentLogs.length, icon: icons.logs },
    { id: 'reminders' as const, label: 'Reminders', count: overdueSchedules.length, icon: icons.bell },
  ]

  return (
    <div className="space-y-6">
      {/* Overdue Alert Banner */}
      {overdueSchedules.length > 0 && (
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400">
              {icons.warning}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-300">{overdueSchedules.length} Overdue Communications</h3>
              <p className="text-sm text-red-400/70">
                {overdueSchedules.slice(0, 3).map(s => s.client.name).join(', ')}
                {overdueSchedules.length > 3 && ` and ${overdueSchedules.length - 3} more`}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('reminders')}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-sm font-medium transition-colors"
            >
              View All
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white/5 backdrop-blur-sm backdrop-blur-xl rounded-2xl p-1.5 border border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <span className={activeTab === tab.id ? 'text-blue-400' : 'text-slate-400'}>{tab.icon}</span>
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/10 backdrop-blur-sm text-white' : 'bg-white/5 backdrop-blur-sm text-slate-400'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search schedules, clients, templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 [&>option]:text-white [&>option]:glass-card"
        >
          <option value="ALL">All Channels</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="EMAIL">Email</option>
          <option value="CALL">Call</option>
          <option value="MEETING">Meeting</option>
        </select>
        <button
          onClick={() => setShowLogForm(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-none hover:shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Log Communication
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'schedules' && (
        <div className="grid gap-4">
          {filteredSchedules.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-3 text-slate-400">{icons.calendar}</div>
              <p className="text-slate-400">No scheduled communications found</p>
            </div>
          ) : (
            filteredSchedules.map((schedule) => {
              const isOverdue = schedule.nextDueAt && new Date(schedule.nextDueAt) < new Date()
              return (
                <div
                  key={schedule.id}
                  className={`bg-white/5 backdrop-blur-sm backdrop-blur-xl border rounded-2xl p-5 hover:bg-white/10 transition-all ${isOverdue ? 'border-red-500/30' : 'border-white/10'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10 text-blue-400">
                        {getChannelIcon(schedule.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{schedule.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-slate-400">{schedule.client.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${tierColors[schedule.client.tier] || 'bg-slate-900/20 text-slate-300 border-slate-500/30'}`}>
                            {schedule.client.tier}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="text-slate-300">{icons.chart}</span>
                            {schedule._count.logs} logs
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-slate-300">{icons.refresh}</span>
                            {frequencyLabels[schedule.frequency] || schedule.frequency}
                          </span>
                          {schedule.template && (
                            <span className="flex items-center gap-1">
                              <span className="text-slate-300">{icons.template}</span>
                              {schedule.template.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {isOverdue ? (
                        <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium border border-red-500/30 flex items-center gap-1">
                          <span className="text-red-400">{icons.warning}</span>
                          Overdue
                        </span>
                      ) : schedule.nextDueAt ? (
                        <div>
                          <p className="text-xs text-slate-400">Next Due</p>
                          <p className="text-sm text-white font-medium">
                            {new Date(schedule.nextDueAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-white/10 text-amber-400">
                    {getChannelIcon(template.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{template.name}</h3>
                    <span className="text-xs text-slate-400">{template.category} - {template.type}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${template.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-900/20 text-slate-400'}`}>
                  {template.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-slate-400 font-medium mb-1">{template.subject}</p>
              <p className="text-xs text-slate-400 line-clamp-2">{template.content}</p>
            </div>
          ))}
          {templates.length === 0 && (
            <div className="col-span-2 bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-3 text-slate-400">{icons.template}</div>
              <p className="text-slate-400">No templates created yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 backdrop-blur-sm">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Client</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Subject</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Channel</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Sentiment</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400">No communication logs yet</td>
                  </tr>
                ) : (
                  recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 text-sm text-slate-300">
                        {formatDateDDMMYYYY(log.createdAt)}
                      </td>
                      <td className="px-5 py-3 text-sm text-white font-medium">{log.client?.name || '-'}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 bg-white/10 backdrop-blur-sm text-slate-300 rounded text-xs">{log.type}</span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-300 max-w-xs truncate">{log.subject}</td>
                      <td className="px-5 py-3 text-blue-400">{getChannelIcon(log.type)}</td>
                      <td className="px-5 py-3">
                        {log.sentiment && (
                          <span className={`flex items-center gap-1 text-sm ${sentimentColors[log.sentiment] || 'text-slate-400'}`}>
                            {getSentimentIcon(log.sentiment)}
                            {log.sentiment}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-400">{log.user.firstName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reminders' && (
        <div className="space-y-4">
          {overdueSchedules.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Overdue ({overdueSchedules.length})
              </h3>
              <div className="space-y-3">
                {overdueSchedules.map((s) => (
                  <div key={s.id} className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-red-400">{getChannelIcon(s.type)}</span>
                      <div>
                        <p className="font-medium text-white">{s.name}</p>
                        <p className="text-sm text-red-400">{s.client.name} - due {new Date(s.nextDueAt!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-colors">
                      Complete Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Upcoming This Week ({upcomingSchedules.length})
            </h3>
            <div className="space-y-3">
              {upcomingSchedules.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
                  <p className="text-slate-400">No upcoming communications this week</p>
                </div>
              ) : (
                upcomingSchedules.map((s) => (
                  <div key={s.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400">{getChannelIcon(s.type)}</span>
                      <div>
                        <p className="font-medium text-white">{s.name}</p>
                        <p className="text-sm text-slate-400">{s.client.name} - due {new Date(s.nextDueAt!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 bg-blue-500/10 text-blue-300 rounded-lg text-sm">
                      {frequencyLabels[s.frequency]}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Log Communication Modal */}
      {showLogForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLogForm(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">Log Communication</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowLogForm(false) }}>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Client</label>
                <select className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white [&>option]:text-white [&>option]:glass-card">
                  <option value="">Select client...</option>
                  {clients.length === 0 && <option disabled>No clients available</option>}
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Channel</label>
                  <select className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white [&>option]:text-white [&>option]:glass-card">
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="EMAIL">Email</option>
                    <option value="CALL">Call</option>
                    <option value="MEETING">Meeting</option>
                    <option value="VIDEO_CALL">Video Call</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Sentiment</label>
                  <select className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white [&>option]:text-white [&>option]:glass-card">
                    <option value="POSITIVE">Positive</option>
                    <option value="NEUTRAL">Neutral</option>
                    <option value="NEGATIVE">Negative</option>
                    <option value="ESCALATION">Escalation</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Subject</label>
                <input type="text" className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white" placeholder="Communication subject..." />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Notes</label>
                <textarea className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white h-24 resize-none" placeholder="Summary of the communication..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowLogForm(false)} className="flex-1 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 text-slate-300 rounded-xl hover:bg-white/10">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-none hover:shadow-blue-500/20">Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
