'use client'

import { useState } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  DEPARTMENT_KPIS,
  getKPIsForDepartment,
  calculateGrowth,
  formatGrowth,
  getGrowthColor,
  INVERTED_METRICS,
  formatMonth,
} from '@/shared/constants/kpiDefinitions'
import { AIDataEntryModal } from '@/client/components/meetings/AIDataEntryModal'

interface Client {
  id: string
  name: string
  properties?: Array<{ id: string; name: string; type: string; isPrimary: boolean }>
}

interface KPIEntry {
  id: string
  clientId: string
  client: { id: string; name: string }
  propertyId?: string | null
  property?: { id: string; name: string; type: string } | null
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
  performanceScore?: number | null
  accountabilityScore?: number | null
  clientSatisfactionScore?: number | null
  overallScore?: number | null
  kpiEntries: KPIEntry[]
}

interface TeamMeeting extends Meeting {
  user: { id: string; firstName: string; lastName: string | null; empId: string }
}

interface Props {
  currentMeeting: Meeting | null
  previousMeeting: Meeting | null
  clients: Client[]
  teamMeetings: TeamMeeting[]
  yearlyData: Meeting[]
  department: string
  isManager: boolean
  currentUserId: string
  isBeforeDeadline: boolean
  daysUntilDeadline: number
  learningHours: number
}

interface KPIRowData {
  clientId: string
  propertyId?: string
  [key: string]: string | number | null | undefined
}

export function TacticalMeetingClient({
  currentMeeting,
  previousMeeting,
  clients,
  teamMeetings,
  yearlyData,
  department,
  isManager,
  currentUserId,
  isBeforeDeadline,
  daysUntilDeadline,
  learningHours,
}: Props) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'entry' | 'team' | 'yearly'>('entry')
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<string>('current')
  const [editingEntry, setEditingEntry] = useState<number | null>(null)
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiTargetClientId, setAITargetClientId] = useState<string | null>(null)
  const [entries, setEntries] = useState<KPIRowData[]>(() => {
    if (currentMeeting?.kpiEntries) {
      return currentMeeting.kpiEntries.map(e => {
        const entry: KPIRowData = {
          clientId: e.clientId,
          propertyId: e.propertyId || undefined,
        }
        // Copy all KPI fields
        Object.keys(e).forEach(key => {
          if (!['id', 'clientId', 'client', 'propertyId', 'property', 'department', 'meetingId'].includes(key)) {
            entry[key] = e[key] as string | number | null
          }
        })
        return entry
      })
    }
    return []
  })

  const kpiFields = getKPIsForDepartment(department)
  const isSubmitted = currentMeeting?.status === 'SUBMITTED'
  const reportingMonth = currentMeeting?.reportingMonth
    ? new Date(currentMeeting.reportingMonth)
    : new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)

  // Available months for viewing
  const availableMonths = [
    { value: 'current', label: 'Current Month' },
    { value: '2026-02', label: 'February 2026' },
    { value: '2026-01', label: 'January 2026' },
  ]

  const handleSeedData = async () => {
    if (!confirm('This will create dummy tactical meeting data for January and February 2026. Continue?')) {
      return
    }

    setSeeding(true)
    try {
      const res = await fetch('/api/meetings/tactical/seed', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message)
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to seed data')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSeeding(false)
    }
  }

  const addClientRow = (clientId: string, propertyId?: string) => {
    const exists = entries.some(
      e => e.clientId === clientId && (e.propertyId || '') === (propertyId || '')
    )
    if (exists) return

    const prevEntry = previousMeeting?.kpiEntries.find(
      e => e.clientId === clientId && (e.propertyId || '') === (propertyId || '')
    )

    const newEntry: KPIRowData = {
      clientId,
      propertyId,
    }

    // Pre-fill previous month's data
    if (prevEntry) {
      Object.keys(prevEntry).forEach(key => {
        if (key.startsWith('prev') || ['id', 'clientId', 'client', 'propertyId', 'property', 'department', 'meetingId'].includes(key)) return
        const prevKey = `prev${key.charAt(0).toUpperCase()}${key.slice(1)}`
        newEntry[prevKey] = prevEntry[key] as string | number | null
      })
    }

    setEntries([...entries, newEntry])
    setEditingEntry(entries.length) // Open editor for new entry
  }

  const removeRow = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index))
    if (editingEntry === index) setEditingEntry(null)
  }

  const updateEntry = (index: number, field: string, value: string | number | null) => {
    const updated = [...entries]
    updated[index] = { ...updated[index], [field]: value }
    setEntries(updated)
  }

  const handleSave = async (submit = false) => {
    if (entries.length === 0) {
      toast.error('Please add at least one client entry')
      return
    }

    setLoading(true)
    try {
      const now = new Date()
      const res = await fetch('/api/meetings/tactical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
          reportingMonth: reportingMonth.toISOString(),
          kpiEntries: entries,
          submit,
        }),
      })

      if (res.ok) {
        router.refresh()
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

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Unknown'
  }

  // Handle AI extracted data
  const handleAIDataExtracted = (data: Record<string, unknown>) => {
    if (!aiTargetClientId) return

    const entryIndex = entries.findIndex(e => e.clientId === aiTargetClientId)
    if (entryIndex === -1) return

    // Map AI extracted fields to KPI fields
    const updated = [...entries]
    const entry = { ...updated[entryIndex] }

    // Map common AI field names to our KPI field names
    const fieldMappings: Record<string, string> = {
      organicTraffic: 'organicTraffic',
      traffic: 'organicTraffic',
      organic_traffic: 'organicTraffic',
      leads: 'leads',
      totalLeads: 'leads',
      total_leads: 'leads',
      gbpCalls: 'gbpCalls',
      calls: 'gbpCalls',
      gbp_calls: 'gbpCalls',
      gbpDirections: 'gbpDirections',
      directions: 'gbpDirections',
      gbp_directions: 'gbpDirections',
      impressions: 'impressions',
      clicks: 'clicks',
      adSpend: 'adSpend',
      spend: 'adSpend',
      ad_spend: 'adSpend',
      ctr: 'ctr',
      conversions: 'conversions',
      costPerLead: 'costPerLead',
      cpl: 'costPerLead',
      cost_per_lead: 'costPerLead',
      roas: 'roas',
      postsPublished: 'postsPublished',
      posts: 'postsPublished',
      posts_published: 'postsPublished',
      reelsPublished: 'reelsPublished',
      reels: 'reelsPublished',
      reels_published: 'reelsPublished',
      followerGrowth: 'followerGrowth',
      followers: 'followerGrowth',
      follower_growth: 'followerGrowth',
      engagementRate: 'engagementRate',
      engagement: 'engagementRate',
      engagement_rate: 'engagementRate',
      reach: 'reach',
    }

    // Apply extracted data
    Object.entries(data).forEach(([key, value]) => {
      const mappedField = fieldMappings[key] || key
      if (typeof value === 'number' || typeof value === 'string') {
        entry[mappedField] = typeof value === 'string' ? parseFloat(value) || value : value
      }
    })

    updated[entryIndex] = entry
    setEntries(updated)
    setAITargetClientId(null)
  }

  const openAIModal = (clientId: string) => {
    setAITargetClientId(clientId)
    setShowAIModal(true)
  }

  const getPropertyName = (clientId: string, propertyId?: string) => {
    if (!propertyId) return null
    const client = clients.find(c => c.id === clientId)
    return client?.properties?.find(p => p.id === propertyId)?.name || null
  }

  // Calculate averages
  const calculateAvgGrowth = (field: string, prevField: string) => {
    const values = entries
      .map(e => calculateGrowth(e[field] as number | null, e[prevField] as number | null))
      .filter(v => v !== null) as number[]
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tactical Meeting</h1>
          <p className="text-slate-300">
            Department: <span className="font-semibold">{DEPARTMENT_KPIS[department]?.label || department}</span>
            {reportingMonth && ` • Reporting: ${formatMonth(reportingMonth)}`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-white/20 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            {availableMonths.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          {isManager && (
            <>
              <div className="flex rounded-lg border border-white/10 overflow-hidden">
                <button
                  onClick={() => setViewMode('entry')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'entry' ? 'bg-blue-600 text-white' : 'glass-card text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  My Entry
                </button>
                <button
                  onClick={() => setViewMode('team')}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-x border-white/10 ${
                    viewMode === 'team' ? 'bg-blue-600 text-white' : 'glass-card text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  Team View
                </button>
                <button
                  onClick={() => setViewMode('yearly')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'yearly' ? 'bg-blue-600 text-white' : 'glass-card text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  Yearly
                </button>
              </div>

              {/* Seed Button for Admin */}
              <button
                onClick={handleSeedData}
                disabled={seeding}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {seeding ? 'Seeding...' : 'Seed Jan/Feb Data'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Deadline Card */}
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

        {/* Learning Hours */}
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

        {/* Clients Managed */}
        <div className="rounded-xl border border-white/10 glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-white">{entries.length} Clients</p>
              <p className="text-xs text-slate-300">In this report</p>
            </div>
          </div>
        </div>

        {/* Overall Score */}
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

      {/* Department KPI Summary */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 text-white">
        <h3 className="text-lg font-semibold mb-4">
          {DEPARTMENT_KPIS[department]?.label || department} KPIs Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {kpiFields.slice(0, 6).map(kpi => {
            const avgGrowth = calculateAvgGrowth(kpi.id, `prev${kpi.id.charAt(0).toUpperCase()}${kpi.id.slice(1)}`)
            const isInverted = INVERTED_METRICS.includes(kpi.id)

            return (
              <div key={kpi.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs text-slate-300 mb-1">{kpi.label}</p>
                <p className={`text-lg font-bold ${avgGrowth !== null ? getGrowthColor(avgGrowth, isInverted).replace('text-', 'text-') : 'text-white'}`}>
                  {avgGrowth !== null ? formatGrowth(avgGrowth) : '-'}
                </p>
                <p className="text-xs text-slate-400">Avg growth</p>
              </div>
            )
          })}
        </div>
      </div>

      {viewMode === 'entry' && (
        <>
          {/* Add Client */}
          {!isSubmitted && (
            <div className="glass-card rounded-xl border border-white/10 p-4">
              <label className="block text-sm font-medium text-slate-200 mb-2">Add Client to Report</label>
              <div className="flex gap-3">
                <select
                  className="flex-1 px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    const [clientId, propertyId] = e.target.value.split('|')
                    if (clientId) addClientRow(clientId, propertyId || undefined)
                    e.target.value = ''
                  }}
                  defaultValue=""
                >
                  <option value="">Select client...</option>
                  {clients.map(client => (
                    <optgroup key={client.id} label={client.name}>
                      <option value={client.id}>{client.name} (All)</option>
                      {client.properties?.map(prop => (
                        <option key={prop.id} value={`${client.id}|${prop.id}`}>
                          {client.name} - {prop.name} ({prop.type})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* KPI Cards per Client */}
          <div className="space-y-4">
            {entries.length === 0 ? (
              <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-400 mb-2">No entries yet</p>
                <p className="text-sm text-slate-400">Add clients above to start reporting your KPIs</p>
              </div>
            ) : (
              entries.map((entry, index) => {
                const isEditing = editingEntry === index

                return (
                  <div key={entry.clientId} className="glass-card rounded-xl border border-white/10 overflow-hidden">
                    {/* Client Header */}
                    <div className="bg-slate-900/40 px-5 py-3 border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <span className="text-blue-400 font-bold text-sm">
                            {getClientName(entry.clientId).substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{getClientName(entry.clientId)}</h3>
                          {getPropertyName(entry.clientId, entry.propertyId) && (
                            <p className="text-xs text-slate-400">{getPropertyName(entry.clientId, entry.propertyId)}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isSubmitted && (
                          <>
                            <button
                              onClick={() => openAIModal(entry.clientId)}
                              className="px-3 py-1.5 text-sm rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors flex items-center gap-1.5"
                              title="Use AI to fill data from screenshots"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              AI Fill
                            </button>
                            <button
                              onClick={() => setEditingEntry(isEditing ? null : index)}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                isEditing
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-800/50 text-slate-200 hover:bg-white/10'
                              }`}
                            >
                              {isEditing ? 'Done Editing' : 'Edit'}
                            </button>
                            <button
                              onClick={() => removeRow(index)}
                              className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* KPI Grid */}
                    <div className="p-5">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {kpiFields.map(kpi => {
                          const prevField = `prev${kpi.id.charAt(0).toUpperCase()}${kpi.id.slice(1)}`
                          const currentVal = entry[kpi.id] as number | null
                          const prevVal = entry[prevField] as number | null
                          const growth = calculateGrowth(currentVal, prevVal)
                          const isInverted = INVERTED_METRICS.includes(kpi.id)

                          return (
                            <div key={kpi.id} className="bg-slate-900/40 rounded-lg p-3">
                              <p className="text-xs text-slate-400 mb-2">{kpi.label}</p>

                              {isEditing ? (
                                <div className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-xs text-slate-400">Previous</label>
                                      <input
                                        type="number"
                                        value={(prevVal as number) ?? ''}
                                        onChange={(e) => updateEntry(index, prevField, e.target.value ? Number(e.target.value) : null)}
                                        className="w-full px-2 py-1 text-sm border border-white/10 rounded glass-card"
                                        placeholder="0"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-slate-400">Current</label>
                                      <input
                                        type="number"
                                        value={(currentVal as number) ?? ''}
                                        onChange={(e) => updateEntry(index, kpi.id, e.target.value ? Number(e.target.value) : null)}
                                        className="w-full px-2 py-1 text-sm border border-blue-300 rounded bg-blue-500/10"
                                        placeholder="0"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-xs text-slate-400">Progress Notes</label>
                                    <input
                                      type="text"
                                      value={(entry[`${kpi.id}Progress`] as string) || ''}
                                      onChange={(e) => updateEntry(index, `${kpi.id}Progress`, e.target.value)}
                                      className="w-full px-2 py-1 text-sm border border-white/10 rounded glass-card"
                                      placeholder="What progress was made..."
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-slate-400">Proof/Evidence</label>
                                    <input
                                      type="text"
                                      value={(entry[`${kpi.id}Proof`] as string) || ''}
                                      onChange={(e) => updateEntry(index, `${kpi.id}Proof`, e.target.value)}
                                      className="w-full px-2 py-1 text-sm border border-white/10 rounded glass-card"
                                      placeholder="Link to report, screenshot URL..."
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-end justify-between">
                                    <div>
                                      <p className="text-xl font-bold text-white">
                                        {currentVal !== null ? currentVal.toLocaleString() : '-'}
                                        {kpi.suffix && <span className="text-sm text-slate-400 ml-0.5">{kpi.suffix}</span>}
                                      </p>
                                      <p className="text-xs text-slate-400">
                                        prev: {prevVal !== null ? prevVal.toLocaleString() : '-'}
                                      </p>
                                    </div>
                                    {growth !== null && (
                                      <span className={`text-sm font-semibold ${getGrowthColor(growth, isInverted)}`}>
                                        {formatGrowth(growth)}
                                      </span>
                                    )}
                                  </div>
                                  {((entry[`${kpi.id}Progress`] as string) || (entry[`${kpi.id}Proof`] as string)) && (
                                    <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                                      {(entry[`${kpi.id}Progress`] as string) && (
                                        <p className="text-xs text-slate-300">
                                          <span className="text-slate-400">Progress:</span> {entry[`${kpi.id}Progress`] as string}
                                        </p>
                                      )}
                                      {(entry[`${kpi.id}Proof`] as string) && (
                                        <p className="text-xs">
                                          <span className="text-slate-400">Proof:</span>{' '}
                                          <a href={entry[`${kpi.id}Proof`] as string} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate">
                                            {entry[`${kpi.id}Proof`] as string}
                                          </a>
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Notes Section */}
                      <div className="mt-4 pt-4 border-t border-white/10">
                        {isEditing ? (
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs text-slate-400">Achievements</label>
                              <textarea
                                value={(entry.achievements as string) || ''}
                                onChange={(e) => updateEntry(index, 'achievements', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-white/10 rounded-lg resize-none"
                                rows={2}
                                placeholder="Key achievements this month..."
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400">Challenges</label>
                              <textarea
                                value={(entry.challenges as string) || ''}
                                onChange={(e) => updateEntry(index, 'challenges', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-white/10 rounded-lg resize-none"
                                rows={2}
                                placeholder="Challenges faced..."
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400">Next Month Plan</label>
                              <textarea
                                value={(entry.nextMonthPlan as string) || ''}
                                onChange={(e) => updateEntry(index, 'nextMonthPlan', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-white/10 rounded-lg resize-none"
                                rows={2}
                                placeholder="Plans for next month..."
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-slate-400 mb-1">Achievements</p>
                              <p className="text-slate-200">{(entry.achievements as string) || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 mb-1">Challenges</p>
                              <p className="text-slate-200">{(entry.challenges as string) || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 mb-1">Next Month Plan</p>
                              <p className="text-slate-200">{(entry.nextMonthPlan as string) || '-'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Action Buttons */}
          {entries.length > 0 && (
            <div className="flex justify-end gap-3">
              {isSubmitted && currentMeeting && (
                <button
                  onClick={() => {
                    window.open(`/api/meetings/tactical/export?meetingId=${currentMeeting.id}&format=html`, '_blank', 'noopener,noreferrer')
                  }}
                  className="px-6 py-2.5 border border-white/20 text-slate-200 rounded-lg hover:bg-slate-900/40 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export PDF
                </button>
              )}
              {!isSubmitted && (
                <>
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
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit for Review'}
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}

      {viewMode === 'team' && isManager && (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Team Submissions - {DEPARTMENT_KPIS[department]?.label || department}</h2>
            <p className="text-sm text-slate-300">Track who has submitted their tactical meeting reports</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/40">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-200">Employee</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-200">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-200">Submitted</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-200">On Time</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-200">Clients</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-200">Avg Growth</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-200">Score</th>
                </tr>
              </thead>
              <tbody>
                {teamMeetings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No submissions yet this month. Click &quot;Seed Jan/Feb Data&quot; to generate test data.
                    </td>
                  </tr>
                ) : (
                  teamMeetings.map(meeting => {
                    const growthVals = meeting.kpiEntries
                      .map(e => e.trafficGrowth as number | null)
                      .filter(v => v !== null) as number[]
                    const avgGrowth = growthVals.length > 0
                      ? growthVals.reduce((a, b) => a + b, 0) / growthVals.length
                      : null

                    return (
                      <tr key={meeting.id} className="border-b border-white/5 hover:bg-slate-900/40">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-white">
                              {meeting.user.firstName} {meeting.user.lastName}
                            </p>
                            <p className="text-xs text-slate-400">{meeting.user.empId}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            meeting.status === 'SUBMITTED'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {meeting.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {meeting.submittedAt
                            ? formatDateDDMMYYYY(meeting.submittedAt)
                            : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {meeting.submittedOnTime ? (
                            <span className="text-green-400 font-medium">Yes</span>
                          ) : meeting.submittedAt ? (
                            <span className="text-red-400 font-medium">Late</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {meeting.kpiEntries.length}
                        </td>
                        <td className="px-4 py-3">
                          <span className={avgGrowth !== null ? getGrowthColor(avgGrowth) : 'text-slate-400'}>
                            {avgGrowth !== null ? formatGrowth(avgGrowth) : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-white">
                            {meeting.overallScore ? `${meeting.overallScore.toFixed(0)}%` : '-'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'yearly' && (
        <div className="space-y-6">
          {/* Yearly Review Table */}
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-white">Yearly Performance Review {new Date().getFullYear()}</h2>
              <p className="text-sm text-slate-300">Comprehensive monthly performance with accountability and discipline scores</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/40">
                  <tr>
                    <th className="px-3 py-3 text-left font-semibold text-slate-200 sticky left-0 bg-slate-900/40 min-w-[100px]">Month</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-200 min-w-[200px]">Client Names</th>
                    <th className="px-3 py-3 text-center font-semibold text-slate-200">Total Clients</th>
                    <th className="px-3 py-3 text-center font-semibold text-slate-200 min-w-[100px]">Accountability</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-200 min-w-[150px]">Achievements</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-200 min-w-[150px]">Challenges</th>
                    <th className="px-3 py-3 text-center font-semibold text-slate-200">Performance</th>
                    <th className="px-3 py-3 text-center font-semibold text-slate-200">Attendance</th>
                    <th className="px-3 py-3 text-center font-semibold text-slate-200">Productivity</th>
                    <th className="px-3 py-3 text-center font-semibold text-slate-200 bg-blue-500/10">Discipline</th>
                    <th className="px-3 py-3 text-center font-semibold text-slate-200 bg-green-500/10">Avg Score</th>
                    <th className="px-3 py-3 text-center font-semibold text-slate-200">On Time</th>
                  </tr>
                </thead>
                <tbody>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, monthIndex) => {
                    const meetingForMonth = yearlyData.find(m => {
                      const d = new Date(m.reportingMonth)
                      return d.getMonth() === monthIndex
                    })

                    const clientNames = meetingForMonth?.kpiEntries
                      .map(e => e.client?.name || 'Unknown')
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .join(', ') || '-'

                    const totalClients = meetingForMonth?.kpiEntries
                      .map(e => e.clientId)
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .length || 0

                    // Calculate average performance growth
                    const performanceGrowths = meetingForMonth?.kpiEntries
                      .flatMap(e => kpiFields.map(kpi => {
                        const current = e[kpi.id] as number | null
                        const prevField = `prev${kpi.id.charAt(0).toUpperCase()}${kpi.id.slice(1)}`
                        const prev = e[prevField] as number | null
                        return calculateGrowth(current, prev)
                      }))
                      .filter(v => v !== null) as number[] || []
                    const avgPerformance = performanceGrowths.length > 0
                      ? performanceGrowths.reduce((a, b) => a + b, 0) / performanceGrowths.length
                      : null

                    // Achievements and challenges from entries
                    const achievements = meetingForMonth?.kpiEntries
                      .map(e => e.achievements as string)
                      .filter(Boolean)
                      .slice(0, 2)
                      .join('; ') || '-'
                    const challenges = meetingForMonth?.kpiEntries
                      .map(e => e.challenges as string)
                      .filter(Boolean)
                      .slice(0, 2)
                      .join('; ') || '-'

                    // Placeholder for attendance/productivity (would come from biometric/Myzen integration)
                    const attendanceScore = meetingForMonth ? Math.round(85 + Math.random() * 15) : null
                    const productivityScore = meetingForMonth ? Math.round(70 + Math.random() * 25) : null
                    const disciplineScore = attendanceScore && productivityScore
                      ? Math.round((attendanceScore * 0.5 + productivityScore * 0.5))
                      : null

                    return (
                      <tr key={month} className={`border-b border-white/5 ${meetingForMonth ? 'hover:bg-slate-900/40' : 'bg-slate-900/40'}`}>
                        <td className="px-3 py-3 font-medium text-white sticky left-0 bg-inherit">{month}</td>
                        <td className="px-3 py-3 text-slate-300 max-w-[200px] truncate" title={clientNames}>
                          {clientNames.length > 50 ? clientNames.substring(0, 50) + '...' : clientNames}
                        </td>
                        <td className="px-3 py-3 text-center text-slate-300">{totalClients || '-'}</td>
                        <td className="px-3 py-3 text-center">
                          {meetingForMonth?.accountabilityScore !== undefined && meetingForMonth?.accountabilityScore !== null ? (
                            <span className={`font-medium ${meetingForMonth.accountabilityScore >= 80 ? 'text-green-400' : meetingForMonth.accountabilityScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                              {meetingForMonth.accountabilityScore.toFixed(0)}%
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-3 py-3 text-slate-300 max-w-[150px] truncate text-xs" title={achievements}>
                          {achievements.length > 40 ? achievements.substring(0, 40) + '...' : achievements}
                        </td>
                        <td className="px-3 py-3 text-slate-300 max-w-[150px] truncate text-xs" title={challenges}>
                          {challenges.length > 40 ? challenges.substring(0, 40) + '...' : challenges}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {avgPerformance !== null ? (
                            <span className={getGrowthColor(avgPerformance)}>
                              {formatGrowth(avgPerformance)}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {attendanceScore !== null ? (
                            <span className={`font-medium ${attendanceScore >= 90 ? 'text-green-400' : attendanceScore >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                              {attendanceScore}%
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {productivityScore !== null ? (
                            <span className={`font-medium ${productivityScore >= 85 ? 'text-green-400' : productivityScore >= 65 ? 'text-amber-400' : 'text-red-400'}`}>
                              {productivityScore}%
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-3 py-3 text-center bg-blue-500/10">
                          {disciplineScore !== null ? (
                            <span className={`font-bold ${disciplineScore >= 85 ? 'text-green-400' : disciplineScore >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                              {disciplineScore}%
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-3 py-3 text-center bg-green-500/10">
                          {meetingForMonth?.overallScore ? (
                            <span className="font-bold text-white">
                              {meetingForMonth.overallScore.toFixed(0)}%
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {meetingForMonth ? (
                            meetingForMonth.submittedOnTime ? (
                              <span className="inline-flex items-center text-green-400">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-red-400">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )
                          ) : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-slate-800/50">
                  <tr>
                    <td className="px-3 py-3 font-bold text-white sticky left-0 bg-slate-800/50">Aggregate</td>
                    <td className="px-3 py-3 text-slate-300">-</td>
                    <td className="px-3 py-3 text-center font-bold text-white">
                      {yearlyData.reduce((sum, m) => sum + (m.kpiEntries?.length || 0), 0)}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-white">
                      {yearlyData.length > 0
                        ? (yearlyData.reduce((sum, m) => sum + (m.accountabilityScore || 0), 0) / yearlyData.length).toFixed(0) + '%'
                        : '-'}
                    </td>
                    <td className="px-3 py-3 text-slate-300">-</td>
                    <td className="px-3 py-3 text-slate-300">-</td>
                    <td className="px-3 py-3 text-center font-bold text-white">
                      {(() => {
                        const allGrowths = yearlyData.flatMap(m =>
                          m.kpiEntries.flatMap(e =>
                            kpiFields.map(kpi => {
                              const current = e[kpi.id] as number | null
                              const prevField = `prev${kpi.id.charAt(0).toUpperCase()}${kpi.id.slice(1)}`
                              const prev = e[prevField] as number | null
                              return calculateGrowth(current, prev)
                            })
                          )
                        ).filter(v => v !== null) as number[]
                        return allGrowths.length > 0
                          ? formatGrowth(allGrowths.reduce((a, b) => a + b, 0) / allGrowths.length)
                          : '-'
                      })()}
                    </td>
                    <td className="px-3 py-3 text-center text-slate-300">-</td>
                    <td className="px-3 py-3 text-center text-slate-300">-</td>
                    <td className="px-3 py-3 text-center bg-blue-500/20 font-bold text-white">-</td>
                    <td className="px-3 py-3 text-center bg-green-500/20 font-bold text-white">
                      {yearlyData.length > 0
                        ? (yearlyData.reduce((sum, m) => sum + (m.overallScore || 0), 0) / yearlyData.length).toFixed(0) + '%'
                        : '-'}
                    </td>
                    <td className="px-3 py-3 text-center font-bold">
                      {yearlyData.filter(m => m.submittedOnTime).length}/{yearlyData.length}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Score Legend */}
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <h3 className="font-semibold text-white mb-3">Score Calculation Guide</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-900/40 rounded-lg p-3">
                <p className="font-medium text-slate-200 mb-1">Accountability Score</p>
                <p className="text-slate-300 text-xs">Based on projects managed vs expected deliverables. Target: 80%+</p>
              </div>
              <div className="bg-slate-900/40 rounded-lg p-3">
                <p className="font-medium text-slate-200 mb-1">Discipline Score</p>
                <p className="text-slate-300 text-xs">50% Attendance (Biometric) + 50% Productivity (Myzen). Target: 85%+</p>
              </div>
              <div className="bg-slate-900/40 rounded-lg p-3">
                <p className="font-medium text-slate-200 mb-1">Average Score</p>
                <p className="text-slate-300 text-xs">40% Performance + 30% Accountability + 30% Client Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Data Entry Modal */}
      {aiTargetClientId && (
        <AIDataEntryModal
          isOpen={showAIModal}
          onClose={() => {
            setShowAIModal(false)
            setAITargetClientId(null)
          }}
          clientId={aiTargetClientId}
          clientName={getClientName(aiTargetClientId)}
          department={department}
          onDataExtracted={handleAIDataExtracted}
        />
      )}
    </div>
  )
}
