'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Users, CheckCircle, Loader2, UserPlus, Shield,
  Mail, Phone, Building2, Globe, Share2, Megaphone, MapPin,
  ChevronDown, ChevronUp, Rocket
} from 'lucide-react'

interface OnboardingDetails {
  brandName?: string
  brandVoice?: string
  targetAudience?: string
  communicationStyle?: string
  reportingFrequency?: string
  primaryContactName?: string
  primaryContactPhone?: string
  preferredChannel?: string
  seoDetails?: Record<string, unknown> | null
  socialDetails?: Record<string, unknown> | null
  adsDetails?: Record<string, unknown> | null
  webDetails?: Record<string, unknown> | null
  gbpDetails?: Record<string, unknown> | null
  doNotDo?: string
  mustDo?: string
  additionalNotes?: string
}

interface Props {
  proposal: {
    id: string
    prospectName: string
    clientName: string
    clientEmail: string
    clientPhone: string | null
    services: Array<{ serviceId: string; name: string }>
    entity: string
    totalPrice: number
    onboardingDetails: OnboardingDetails | null
  }
  accountManagers: Array<{ id: string; name: string; email: string | null; role: string; department: string | null }>
  teamMembers: Array<{ id: string; name: string; email: string | null; department: string | null }>
}

export default function ManagerReviewClient({ proposal, accountManagers, teamMembers }: Props) {
  const router = useRouter()
  const [showDetails, setShowDetails] = useState(false)
  const [accountManagerId, setAccountManagerId] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<Array<{ userId: string; role: string }>>([])
  const [activatePortal, setActivatePortal] = useState(true)
  const [generatePassword, setGeneratePassword] = useState(true)
  const [customPassword, setCustomPassword] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const details = proposal.onboardingDetails

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Group team members by department
  const teamByDept = teamMembers.reduce((acc, member) => {
    const dept = member.department || 'OTHER'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(member)
    return acc
  }, {} as Record<string, typeof teamMembers>)

  const toggleTeamMember = (userId: string, role: string = 'MEMBER') => {
    const exists = selectedTeam.find(t => t.userId === userId)
    if (exists) {
      setSelectedTeam(selectedTeam.filter(t => t.userId !== userId))
    } else {
      setSelectedTeam([...selectedTeam, { userId, role }])
    }
  }

  const handleSubmit = async () => {
    if (!accountManagerId) {
      setError('Please select an account manager')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/accounts/onboarding/${proposal.id}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountManagerId,
          teamMembers: selectedTeam,
          activatePortal,
          generatePassword,
          clientPassword: generatePassword ? undefined : customPassword,
          clientEmail: proposal.clientEmail,
          internalNotes,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to activate client')
      }

      // Show success and redirect
      router.push(`/accounts/onboarding/${proposal.id}?activated=true`)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/accounts/onboarding/${proposal.id}`}
          className="inline-flex items-center text-sm text-gray-400 hover:text-gray-200 mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Proposal
        </Link>
        <h1 className="text-2xl font-bold text-white">Manager Review</h1>
        <p className="text-gray-400">Review onboarding details, allocate team, and activate portal</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-200 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Client Summary */}
      <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{proposal.clientName}</h2>
            <p className="text-gray-400">{proposal.entity}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-300">
              <span className="flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                {proposal.clientEmail}
              </span>
              <span className="flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                {proposal.clientPhone}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Contract Value</p>
            <p className="text-xl font-bold text-white">{formatCurrency(proposal.totalPrice)}</p>
          </div>
        </div>

        {/* Services */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-gray-400 mb-2">Services</p>
          <div className="flex flex-wrap gap-2">
            {proposal.services.map(service => (
              <span
                key={service.serviceId}
                className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm"
              >
                {service.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Onboarding Details */}
      {details && (
        <div className="glass-card rounded-xl shadow-none border border-white/10">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between p-6"
          >
            <h2 className="text-lg font-semibold text-white">Onboarding Details</h2>
            {showDetails ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {showDetails && (
            <div className="px-6 pb-6 space-y-6 border-t border-white/10 pt-4">
              {/* Brand Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  Brand Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Brand Name</p>
                    <p className="font-medium">{details.brandName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Brand Voice</p>
                    <p className="font-medium">{details.brandVoice || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400">Target Audience</p>
                    <p className="font-medium">{details.targetAudience || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Communication */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Communication Preferences
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Primary Contact</p>
                    <p className="font-medium">{details.primaryContactName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Preferred Channel</p>
                    <p className="font-medium">{details.preferredChannel || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Communication Style</p>
                    <p className="font-medium">{details.communicationStyle || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Reporting Frequency</p>
                    <p className="font-medium">{details.reportingFrequency || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {(details.doNotDo || details.mustDo || details.additionalNotes) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Special Instructions</h3>
                  {details.mustDo && (
                    <div className="mb-2 p-3 bg-green-500/10 rounded-lg">
                      <p className="text-xs text-green-400 font-medium">MUST DO</p>
                      <p className="text-sm text-green-800">{details.mustDo}</p>
                    </div>
                  )}
                  {details.doNotDo && (
                    <div className="mb-2 p-3 bg-red-500/10 rounded-lg">
                      <p className="text-xs text-red-400 font-medium">DO NOT DO</p>
                      <p className="text-sm text-red-800">{details.doNotDo}</p>
                    </div>
                  )}
                  {details.additionalNotes && (
                    <div className="p-3 bg-gray-900/40 rounded-lg">
                      <p className="text-xs text-gray-300 font-medium">ADDITIONAL NOTES</p>
                      <p className="text-sm text-white">{details.additionalNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Account Manager */}
      <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-gray-400" />
          Account Manager
        </h2>
        <select
          value={accountManagerId}
          onChange={e => setAccountManagerId(e.target.value)}
          className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Account Manager</option>
          {accountManagers.map(manager => (
            <option key={manager.id} value={manager.id}>
              {manager.name} ({manager.role})
            </option>
          ))}
        </select>
      </div>

      {/* Team Allocation */}
      <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <UserPlus className="w-5 h-5 mr-2 text-gray-400" />
          Team Allocation
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Select team members to work on this account
        </p>

        <div className="space-y-4">
          {Object.entries(teamByDept).map(([dept, members]) => (
            <div key={dept}>
              <h3 className="text-sm font-medium text-gray-200 mb-2">{dept}</h3>
              <div className="flex flex-wrap gap-2">
                {members.map(member => {
                  const isSelected = selectedTeam.some(t => t.userId === member.id)
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleTeamMember(member.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        isSelected
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-300'
                          : 'bg-gray-800/50 text-gray-300 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {isSelected && <CheckCircle className="w-3 h-3 inline mr-1" />}
                      {member.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {selectedTeam.length > 0 && (
          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
            <p className="text-sm text-blue-400">
              {selectedTeam.length} team member(s) selected
            </p>
          </div>
        )}
      </div>

      {/* Portal Settings */}
      <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-gray-400" />
          Portal Settings
        </h2>

        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={activatePortal}
              onChange={e => setActivatePortal(e.target.checked)}
              className="w-4 h-4 text-blue-400 border-white/20 rounded"
            />
            <span className="text-gray-200">Activate client portal immediately</span>
          </label>

          {activatePortal && (
            <div className="ml-7 space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  checked={generatePassword}
                  onChange={() => setGeneratePassword(true)}
                  className="w-4 h-4 text-blue-400 border-white/20"
                />
                <span className="text-gray-200">Generate random password</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  checked={!generatePassword}
                  onChange={() => setGeneratePassword(false)}
                  className="w-4 h-4 text-blue-400 border-white/20"
                />
                <span className="text-gray-200">Set custom password</span>
              </label>

              {!generatePassword && (
                <input
                  type="text"
                  value={customPassword}
                  onChange={e => setCustomPassword(e.target.value)}
                  placeholder="Enter custom password (min 8 characters)"
                  className="w-full px-4 py-2 border border-white/20 rounded-lg ml-7"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Internal Notes */}
      <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Internal Notes</h2>
        <textarea
          value={internalNotes}
          onChange={e => setInternalNotes(e.target.value)}
          rows={3}
          placeholder="Add any internal notes about this client..."
          className="w-full px-4 py-2.5 border border-white/20 rounded-lg"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Link
          href={`/accounts/onboarding/${proposal.id}`}
          className="px-6 py-2.5 border border-white/20 text-gray-200 rounded-lg hover:bg-gray-900/40"
        >
          Cancel
        </Link>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !accountManagerId}
          className="inline-flex items-center px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Activating...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              Activate Client
            </>
          )}
        </button>
      </div>
    </div>
  )
}
