'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDateShort } from '@/shared/utils/cn'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

interface Lead {
  id: string
  companyName: string
  contactName: string
  contactEmail: string | null
  contactPhone: string | null
  source: string
  leadCategory: string | null
  leadPriority: string
  stage: string
  pipeline: string | null
  value: number | null
  budgetRange: string | null
  location: string | null
  notes: string | null
  rfpStatus: string | null
  isHealthcare: boolean
  wonAt: string | null
  lostReason: string | null
  clientId: string | null
  nextFollowUp: string | null
  lastContactedAt: string | null
  followUpNotes: string | null
  callNotes: string | null
  assignedToId: string | null
  assignedTo: { id: string; firstName: string; lastName: string | null; email: string | null; phone: string } | null
  client: { id: string; name: string } | null
  createdAt: string
  updatedAt: string
}

interface Activity {
  id: string
  type: string
  title: string
  description: string | null
  outcome: string | null
  duration: number | null
  createdAt: string
  user: { firstName: string; lastName: string | null }
}

interface Proposal {
  id: string
  title: string
  value: number
  status: string
  validUntil: string
  createdAt: string
}

interface Meeting {
  id: string
  title: string
  meetingType: string
  scheduledAt: string
  status: string
  outcome: string | null
}

interface Reminder {
  id: string
  title: string
  notes: string | null
  scheduledAt: string
  priority: string
}

interface NurturingAction {
  id: string
  actionType: string
  channel: string | null
  createdAt: string
  response: string | null
}

interface Props {
  lead: Lead
  activities: Activity[]
  proposals: Proposal[]
  meetings: Meeting[]
  reminders: Reminder[]
  nurturingActions: NurturingAction[]
  users: { id: string; name: string }[]
}

const STAGES = [
  'LEAD_RECEIVED',
  'RFP_SENT',
  'RFP_COMPLETED',
  'PROPOSAL_SHARED',
  'FOLLOW_UP_ONGOING',
  'MEETING_SCHEDULED',
  'PROPOSAL_DISCUSSION',
  'WON',
  'LOST',
]

export function SalesLeadDetail({
  lead,
  activities,
  proposals,
  meetings,
  reminders,
  nurturingActions,
  users,
}: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'proposals' | 'meetings'>('overview')
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentStage, setCurrentStage] = useState(lead.stage)

  const formatDate = (dateStr: string) => formatDateShort(dateStr)

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleStageChange = async (newStage: string) => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/sales/leads/${lead.id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      if (res.ok) {
        setCurrentStage(newStage)
      }
    } catch (error) {
      console.error('Failed to update stage:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Stage Pipeline */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Pipeline Stage</h3>
          <div className="flex flex-wrap gap-2">
            {STAGES.map((stage) => (
              <button
                key={stage}
                onClick={() => handleStageChange(stage)}
                disabled={isUpdating || currentStage === stage}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  currentStage === stage
                    ? stage === 'WON' ? 'bg-green-500 text-white' :
                      stage === 'LOST' ? 'bg-red-500 text-white' :
                      'bg-orange-500 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
                }`}
              >
                {stage.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="flex border-b border-white/10">
            {(['overview', 'activity', 'proposals', 'meetings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-orange-500/10 text-orange-400 border-b-2 border-orange-500'
                    : 'text-slate-400 hover:bg-slate-900/40'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-4">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Source</p>
                    <p className="font-medium text-white">{lead.source}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Pipeline</p>
                    <p className="font-medium text-white">{lead.pipeline || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Category</p>
                    <p className="font-medium text-white">{lead.leadCategory || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Budget Range</p>
                    <p className="font-medium text-white">{lead.budgetRange || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Deal Value</p>
                    <p className="font-medium text-green-400">{formatCurrency(lead.value)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Location</p>
                    <p className="font-medium text-white">{lead.location || '-'}</p>
                  </div>
                </div>

                {lead.notes && (
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Notes</p>
                    <p className="text-slate-200 text-sm whitespace-pre-wrap">{lead.notes}</p>
                  </div>
                )}

                {lead.callNotes && (
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Call Notes</p>
                    <p className="text-slate-200 text-sm whitespace-pre-wrap">{lead.callNotes}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No activities recorded yet</p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 pb-4 border-b border-white/5 last:border-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'CALL' ? 'bg-green-500/20 text-green-400' :
                        activity.type === 'EMAIL' ? 'bg-blue-500/20 text-blue-400' :
                        activity.type === 'MEETING' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-slate-800/50 text-slate-300'
                      }`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{activity.title}</p>
                        {activity.description && (
                          <p className="text-sm text-slate-400 mt-1">{activity.description}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          {activity.user.firstName} {activity.user.lastName} - {formatDateTime(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'proposals' && (
              <div className="space-y-4">
                {proposals.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No proposals yet</p>
                    <Link
                      href={`/sales/proposals/new?leadId=${lead.id}`}
                      className="inline-block mt-2 text-orange-600 hover:underline text-sm"
                    >
                      Create Proposal
                    </Link>
                  </div>
                ) : (
                  proposals.map((proposal) => (
                    <div key={proposal.id} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{proposal.title}</p>
                        <p className="text-sm text-slate-400">
                          {formatCurrency(proposal.value)} - Valid until {formatDate(proposal.validUntil)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        proposal.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                        proposal.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                        proposal.status === 'SENT' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-800/50 text-slate-200'
                      }`}>
                        {proposal.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'meetings' && (
              <div className="space-y-4">
                {meetings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No meetings scheduled</p>
                    <Link
                      href={`/sales/meetings?leadId=${lead.id}`}
                      className="inline-block mt-2 text-orange-600 hover:underline text-sm"
                    >
                      Schedule Meeting
                    </Link>
                  </div>
                ) : (
                  meetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{meeting.title}</p>
                        <p className="text-sm text-slate-400">
                          {meeting.meetingType.replace(/_/g, ' ')} - {formatDateTime(meeting.scheduledAt)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        meeting.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                        meeting.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {meeting.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Contact Info */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="font-semibold text-white mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400">Name</p>
              <p className="font-medium text-white">{lead.contactName}</p>
            </div>
            {lead.contactEmail && (
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <a href={`mailto:${lead.contactEmail}`} className="text-blue-400 hover:underline">
                  {lead.contactEmail}
                </a>
              </div>
            )}
            {lead.contactPhone && (
              <div>
                <p className="text-xs text-slate-400">Phone</p>
                <a href={`tel:${lead.contactPhone}`} className="text-blue-400 hover:underline">
                  {lead.contactPhone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Assigned To */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="font-semibold text-white mb-4">Assigned To</h3>
          {lead.assignedTo ? (
            <div className="flex items-center gap-3">
              <UserAvatar user={{ id: lead.assignedTo.id, firstName: lead.assignedTo.firstName, lastName: lead.assignedTo.lastName, email: lead.assignedTo.email }} size="md" showPreview={false} />
              <div>
                <p className="font-medium text-white">
                  {lead.assignedTo.firstName} {lead.assignedTo.lastName || ''}
                </p>
                <p className="text-sm text-slate-400">{lead.assignedTo.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">Not assigned</p>
          )}
        </div>

        {/* Reminders */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="font-semibold text-white mb-4">Upcoming Reminders</h3>
          {reminders.length === 0 ? (
            <p className="text-slate-400 text-sm">No reminders</p>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="p-2 bg-amber-500/10 rounded-lg">
                  <p className="text-sm font-medium text-amber-800">{reminder.title}</p>
                  <p className="text-xs text-amber-400">{formatDateTime(reminder.scheduledAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              href={`/sales/proposals/new?leadId=${lead.id}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Create Proposal
            </Link>
            <a
              href={lead.contactPhone ? `tel:${lead.contactPhone}` : '#'}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                lead.contactPhone
                  ? 'border-green-500 text-green-400 hover:bg-green-500/10'
                  : 'border-white/10 text-slate-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Lead
            </a>
            <a
              href={lead.contactEmail ? `mailto:${lead.contactEmail}` : '#'}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                lead.contactEmail
                  ? 'border-blue-500 text-blue-400 hover:bg-blue-500/10'
                  : 'border-white/10 text-slate-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Email
            </a>
          </div>
        </div>

        {/* Meta Info */}
        <div className="text-xs text-slate-400 space-y-1">
          <p>Created: {formatDate(lead.createdAt)}</p>
          <p>Updated: {formatDate(lead.updatedAt)}</p>
          {lead.lastContactedAt && <p>Last Contact: {formatDate(lead.lastContactedAt)}</p>}
        </div>
      </div>
    </div>
  )
}
