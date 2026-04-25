'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LeadActivityFeed } from '@/client/components/crm/LeadActivityFeed'
import { FollowUpScheduler } from '@/client/components/crm/FollowUpScheduler'
import { CallNotesForm } from '@/client/components/crm/CallNotesForm'

interface Lead {
  id: string
  companyName: string
  contactName: string
  contactEmail: string
  contactPhone: string
  source: string
  value: number
  notes: string
  stage: string
  lostReason: string
  wonAt: string | null
  clientId: string | null
  nextFollowUp: string | null
  lastContactedAt: string | null
  followUpNotes: string
  callNotes: string
  assignedToId: string
  assignedTo: { firstName: string; lastName: string } | null
  createdAt: string
  updatedAt: string
}

interface Activity {
  id: string
  type: string
  title: string
  description: string
  outcome: string
  duration: number
  createdAt: string
  user: { firstName: string; lastName: string }
}

interface Reminder {
  id: string
  title: string
  notes: string
  scheduledAt: string
  priority: string
  user: { firstName: string; lastName: string }
}

interface Proposal {
  id: string
  title: string
  value: number
  status: string
  validUntil: string
}

interface User {
  id: string
  name: string
  empId: string
}

interface Props {
  lead: Lead
  activities: Activity[]
  reminders: Reminder[]
  proposals: Proposal[]
  users: User[]
  currentUserId: string
}

const stages = ['LEAD', 'DISCOVERY_CALL', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST']

const stageColors: Record<string, string> = {
  LEAD: 'bg-slate-900/40',
  DISCOVERY_CALL: 'bg-blue-500',
  PROPOSAL_SENT: 'bg-purple-500',
  NEGOTIATION: 'bg-amber-500',
  WON: 'bg-green-500',
  LOST: 'bg-red-500',
}

export function LeadDetail({ lead, activities, reminders, proposals, users, currentUserId }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'activity' | 'notes' | 'proposals'>('activity')
  const [showCallForm, setShowCallForm] = useState(false)
  const [showFollowUpForm, setShowFollowUpForm] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [showLostModal, setShowLostModal] = useState(false)
  const [lostReason, setLostReason] = useState('')

  const handleStageChange = async (newStage: string) => {
    if (newStage === 'WON') {
      setShowConvertModal(true)
      return
    }
    if (newStage === 'LOST') {
      setShowLostModal(true)
      return
    }

    setIsUpdating(true)
    try {
      const res = await fetch(`/api/crm/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('Failed to update stage:', data.error || res.statusText)
        return
      }
      router.refresh()
    } catch (error) {
      console.error('Failed to update stage:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleConvert = async () => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/crm/leads/${lead.id}/convert`, {
        method: 'POST',
      })
      if (res.ok) {
        setShowConvertModal(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to convert lead:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleMarkLost = async () => {
    setIsUpdating(true)
    try {
      await fetch(`/api/crm/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'LOST', lostReason }),
      })
      setShowLostModal(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to mark as lost:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const currentStageIndex = stages.indexOf(lead.stage)

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/crm" className="text-sm text-blue-400 hover:underline mb-2 inline-block">
            ← Back to Pipeline
          </Link>
          <h1 className="text-2xl font-bold text-white">{lead.companyName}</h1>
          <p className="text-slate-400 mt-1">{lead.contactName}</p>
        </div>
        <div className="flex items-center gap-3">
          {lead.stage === 'WON' && lead.clientId && (
            <Link
              href={`/clients/${lead.clientId}`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              View Client
            </Link>
          )}
          <button
            onClick={() => setShowCallForm(true)}
            className="px-4 py-2 border border-white/20 rounded-lg hover:bg-slate-900/40 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Log Call
          </button>
          <button
            onClick={() => setShowFollowUpForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Schedule Follow-up
          </button>
        </div>
      </div>

      {/* Stage Progress */}
      <div className="glass-card rounded-xl border border-white/10 p-6">
        <h3 className="text-sm font-medium text-slate-400 mb-4">Pipeline Stage</h3>
        <div className="flex items-center">
          {stages.map((stage, index) => (
            <div key={stage} className="flex-1 flex items-center">
              <button
                onClick={() => handleStageChange(stage)}
                disabled={isUpdating || lead.stage === 'WON' || lead.stage === 'LOST'}
                className={`w-full relative ${
                  index <= currentStageIndex && lead.stage !== 'LOST'
                    ? stageColors[stage]
                    : 'bg-white/10'
                } h-2 rounded-full transition-colors ${
                  isUpdating || lead.stage === 'WON' || lead.stage === 'LOST'
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer hover:opacity-80'
                }`}
              >
                <span className={`absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap ${
                  index === currentStageIndex ? 'text-white' : 'text-slate-400'
                }`}>
                  {stage.replace(/_/g, ' ')}
                </span>
              </button>
              {index < stages.length - 1 && <div className="w-2" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="glass-card rounded-xl border border-white/10">
            <div className="border-b border-white/10">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'activity'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Activity
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'notes'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Notes
                </button>
                <button
                  onClick={() => setActiveTab('proposals')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'proposals'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Proposals ({proposals.length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'activity' && (
                <LeadActivityFeed activities={activities} />
              )}
              {activeTab === 'notes' && (
                <div className="prose prose-slate max-w-none">
                  <h4>General Notes</h4>
                  <p className="whitespace-pre-wrap">{lead.notes || 'No notes added yet.'}</p>

                  {lead.callNotes && (
                    <>
                      <h4 className="mt-6">Call Notes</h4>
                      <div className="space-y-2">
                        {JSON.parse(lead.callNotes).map((note: { date: string; content: string }, i: number) => (
                          <div key={note.date} className="bg-slate-900/40 p-3 rounded-lg">
                            <p className="text-xs text-slate-400 mb-1">
                              {new Date(note.date).toLocaleDateString('en-IN')}
                            </p>
                            <p className="text-sm">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              {activeTab === 'proposals' && (
                <div className="space-y-4">
                  {proposals.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No proposals yet</p>
                  ) : (
                    proposals.map((proposal) => (
                      <div
                        key={proposal.id}
                        className="flex items-center justify-between p-4 bg-slate-900/40 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-white">{proposal.title}</p>
                          <p className="text-sm text-slate-400">
                            Valid until {new Date(proposal.validUntil).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-400">
                            ₹{(proposal.value / 1000).toFixed(0)}K
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            proposal.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                            proposal.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                            proposal.status === 'SENT' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-800/50 text-slate-200'
                          }`}>
                            {proposal.status}
                          </span>
                        </div>
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
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h3 className="font-semibold text-white mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Email</p>
                <a href={`mailto:${lead.contactEmail}`} className="text-blue-400 hover:underline">
                  {lead.contactEmail || '-'}
                </a>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Phone</p>
                <a href={`tel:${lead.contactPhone}`} className="text-blue-400 hover:underline">
                  {lead.contactPhone || '-'}
                </a>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Source</p>
                <p className="text-white">{lead.source}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Deal Value</p>
                <p className="text-2xl font-bold text-green-400">
                  ₹{lead.value ? (lead.value / 1000).toFixed(0) + 'K' : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Follow-up Info */}
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h3 className="font-semibold text-white mb-4">Follow-up</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Next Follow-up</p>
                {lead.nextFollowUp ? (
                  <p className="text-white">
                    {new Date(lead.nextFollowUp).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                ) : (
                  <p className="text-amber-400">Not scheduled</p>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Last Contacted</p>
                <p className="text-white">
                  {lead.lastContactedAt
                    ? new Date(lead.lastContactedAt).toLocaleDateString('en-IN')
                    : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Assigned To</p>
                <p className="text-white">
                  {lead.assignedTo
                    ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`
                    : 'Unassigned'}
                </p>
              </div>
            </div>
          </div>

          {/* Upcoming Reminders */}
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h3 className="font-semibold text-white mb-4">Reminders</h3>
            {reminders.length === 0 ? (
              <p className="text-sm text-slate-400">No upcoming reminders</p>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-start gap-3 p-3 bg-slate-900/40 rounded-lg"
                  >
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      reminder.priority === 'URGENT' ? 'bg-red-500' :
                      reminder.priority === 'HIGH' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium text-sm text-white">{reminder.title}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(reminder.scheduledAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call Notes Modal */}
      {showCallForm && (
        <CallNotesForm
          leadId={lead.id}
          onClose={() => setShowCallForm(false)}
          onSuccess={() => {
            setShowCallForm(false)
            router.refresh()
          }}
        />
      )}

      {/* Follow-up Scheduler Modal */}
      {showFollowUpForm && (
        <FollowUpScheduler
          leadId={lead.id}
          users={users}
          currentUserId={currentUserId}
          onClose={() => setShowFollowUpForm(false)}
          onSuccess={() => {
            setShowFollowUpForm(false)
            router.refresh()
          }}
        />
      )}

      {/* Convert to Client Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Convert to Client</h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to mark this lead as WON? This will create a new client record and send an onboarding email to {lead.contactEmail}.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConvertModal(false)}
                className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConvert}
                disabled={isUpdating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isUpdating ? 'Converting...' : 'Convert to Client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Lost Modal */}
      {showLostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Mark as Lost</h3>
            <p className="text-slate-300 mb-4">
              Please provide a reason for losing this deal.
            </p>
            <textarea
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={3}
              placeholder="e.g., Budget constraints, Competitor chosen, Project cancelled..."
            />
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setShowLostModal(false)
                  setLostReason('')
                }}
                className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkLost}
                disabled={!lostReason || isUpdating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Mark as Lost'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
