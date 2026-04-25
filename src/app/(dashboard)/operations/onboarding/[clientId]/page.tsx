'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Service {
  serviceId: string
  name: string
  isSelected: boolean
}

interface ScopeItem {
  id: string
  category: string
  item: string
  quantity: number
}

interface Client {
  id: string
  name: string
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  whatsapp: string | null
  websiteUrl: string | null
  selectedServices: Service[]
  paymentConfirmedAt: string
  entityType: string
  tier: string
  credentials: Record<string, unknown>
  facebookUrl: string | null
  instagramUrl: string | null
  linkedinUrl: string | null
}

interface Checklist {
  [key: string]: string | number | boolean | null | Service[] | ScopeItem[]
  id: string
  selectedServices: Service[]
  scopeItems: ScopeItem[]
  completionPercentage: number
  status: string
  kickoffMeetingDone: boolean
  brandGuidelinesReceived: boolean
  websiteAccessGranted: boolean
  analyticsAccessGranted: boolean
  socialMediaAccess: boolean
  adsAccountAccess: boolean
  trackingSetup: boolean
  pixelsInstalled: boolean
  communicationChannelSetup: boolean
  teamIntroductionDone: boolean
  firstStrategyCallDone: boolean
  contentCalendarShared: boolean
  managerNotes: string | null
  operationsAssignedAt: string | null
  kickoffScheduledAt: string | null
}

// Define checklist items based on services
const getChecklistItems = (services: string[]) => {
  const baseItems = [
    { key: 'kickoffMeetingDone', label: 'Kickoff Meeting', description: 'Schedule and complete kickoff call', required: true },
    { key: 'communicationChannelSetup', label: 'Communication Channel', description: 'Set up WhatsApp group or Slack', required: true },
    { key: 'teamIntroductionDone', label: 'Team Introduction', description: 'Introduce client to assigned team members', required: true },
  ]

  const serviceItems: Record<string, Array<{ key: string; label: string; description: string; required: boolean }>> = {
    seo: [
      { key: 'websiteAccessGranted', label: 'Website Access', description: 'Get CMS/FTP access for website changes', required: false },
      { key: 'analyticsAccessGranted', label: 'Analytics Access', description: 'Google Analytics & Search Console access', required: false },
      { key: 'trackingSetup', label: 'Tracking Setup', description: 'Set up rank tracking and reporting', required: false },
    ],
    social: [
      { key: 'socialMediaAccess', label: 'Social Media Access', description: 'Get access to all social accounts', required: false },
      { key: 'brandGuidelinesReceived', label: 'Brand Guidelines', description: 'Receive brand colors, fonts, and style', required: false },
      { key: 'contentCalendarShared', label: 'Content Calendar', description: 'Share monthly content calendar', required: false },
    ],
    ads: [
      { key: 'adsAccountAccess', label: 'Ads Account Access', description: 'Get Google/Meta Ads account access', required: false },
      { key: 'pixelsInstalled', label: 'Pixels Installed', description: 'Install tracking pixels on website', required: false },
    ],
    web: [
      { key: 'websiteAccessGranted', label: 'Hosting Access', description: 'Get hosting and domain access', required: false },
      { key: 'brandGuidelinesReceived', label: 'Brand Assets', description: 'Collect logo, images, and content', required: false },
    ],
  }

  const items = [...baseItems]
  services.forEach(serviceId => {
    if (serviceItems[serviceId]) {
      serviceItems[serviceId].forEach(item => {
        if (!items.find(i => i.key === item.key)) {
          items.push(item)
        }
      })
    }
  })

  items.push({ key: 'firstStrategyCallDone', label: 'First Strategy Call', description: 'Complete strategy discussion', required: false })

  return items
}

export default function ClientOnboardingPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)
  const { data: session } = useSession()
  const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'ACCOUNTS']
  const canEdit = allowedRoles.includes(session?.user?.role || '')
  const [client, setClient] = useState<Client | null>(null)
  const [checklist, setChecklist] = useState<Checklist | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchData()
  }, [clientId])

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/operations/onboarding/${clientId}`)
      if (res.ok) {
        const data = await res.json()
        setClient(data.client)
        setChecklist(data.checklist)
        setNotes(data.checklist?.managerNotes || '')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateChecklist = async (key: string, value: boolean) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/operations/onboarding/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      })
      if (res.ok) {
        const data = await res.json()
        setChecklist(prev => prev ? {
          ...prev,
          [key]: value,
          completionPercentage: data.completionPercentage,
          status: data.status,
        } : null)
      }
    } catch (error) {
      console.error('Error updating checklist:', error)
    } finally {
      setSaving(false)
    }
  }

  const saveNotes = async () => {
    setSaving(true)
    try {
      await fetch(`/api/operations/onboarding/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerNotes: notes }),
      })
    } catch (error) {
      console.error('Error saving notes:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!client || !checklist) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Client or checklist not found</p>
        <Link href="/operations/pending-onboarding" className="text-emerald-400 hover:underline mt-2 inline-block">
          Back to Pending Onboarding
        </Link>
      </div>
    )
  }

  const selectedServiceIds = (checklist.selectedServices || client.selectedServices)
    .filter(s => s.isSelected)
    .map(s => s.serviceId)

  const checklistItems = getChecklistItems(selectedServiceIds)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/operations/pending-onboarding" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
            &larr; Back to Pending
          </Link>
          <h1 className="text-2xl font-bold text-white">{client.name}</h1>
          <p className="text-slate-400 mt-1">Onboarding Checklist</p>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-3">
            <div className="w-32 h-3 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${checklist.completionPercentage}%` }}
              />
            </div>
            <span className="text-white font-bold">{checklist.completionPercentage}%</span>
          </div>
          <p className={`text-sm mt-1 ${
            checklist.status === 'COMPLETED' ? 'text-emerald-400' :
            checklist.status === 'IN_PROGRESS' ? 'text-blue-400' : 'text-slate-400'
          }`}>
            {checklist.status}
          </p>
        </div>
      </div>

      {/* Client Info */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Client Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-400">Contact</p>
            <p className="text-white">{client.contactName}</p>
            <p className="text-slate-400 text-sm">{client.contactEmail}</p>
            <p className="text-slate-400 text-sm">{client.contactPhone}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Links</p>
            {client.websiteUrl && (
              <a href={client.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline text-sm block">
                Website
              </a>
            )}
            {client.facebookUrl && (
              <a href={client.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm block">
                Facebook
              </a>
            )}
            {client.instagramUrl && (
              <a href={client.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline text-sm block">
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Services & Scope */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Contracted Services & Scope</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {(checklist.selectedServices || client.selectedServices)
            .filter(s => s.isSelected)
            .map(service => (
              <span key={service.serviceId} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">
                {service.name}
              </span>
            ))}
        </div>
        {checklist.scopeItems && checklist.scopeItems.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {checklist.scopeItems.map((item, i) => (
              <div key={item.item} className="p-3 bg-white/5 backdrop-blur-sm rounded-lg">
                <p className="text-white font-medium">{item.item}</p>
                <p className="text-emerald-400 text-lg font-bold">{item.quantity}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Onboarding Tasks</h2>
        <div className="space-y-3">
          {checklistItems.map(item => {
            const isChecked = !!checklist[item.key]
            return (
              <div
                key={item.key}
                className={`p-4 rounded-xl border transition-all ${
                  !canEdit ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                } ${
                  isChecked
                    ? 'bg-emerald-600/20 border-emerald-500'
                    : 'bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20'
                }`}
                onClick={() => canEdit && updateChecklist(item.key, !isChecked)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isChecked ? 'bg-emerald-600 border-emerald-600' : 'border-white/30'
                  }`}>
                    {isChecked && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isChecked ? 'text-emerald-400' : 'text-white'}`}>
                      {item.label}
                    </p>
                    <p className="text-sm text-slate-400">{item.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Notes</h2>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          disabled={!canEdit}
          placeholder="Add notes about this client's onboarding..."
          className={`w-full h-32 px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none resize-none ${!canEdit ? 'cursor-not-allowed opacity-75' : ''}`}
        />
        <button
          onClick={saveNotes}
          disabled={saving || !canEdit}
          className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : 'Save Notes'}
        </button>
      </div>

      {/* Complete Button */}
      {checklist.completionPercentage === 100 && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Onboarding Complete!</h3>
          <p className="text-slate-400">
            All tasks have been completed. The client has been moved to Active status.
          </p>
        </div>
      )}
    </div>
  )
}
