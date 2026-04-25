'use client'

import React, { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { CLIENT_TEAM_ROLE_DEFINITIONS, getDepartmentInfo } from '@/shared/constants/roleDefinitions'

interface TeamMemberDetails {
  id: string
  firstName: string
  lastName: string | null
  department: string
  role: string
  avatarUrl: string | null
  isPrimary: boolean
  email: string | null
  roleDefinition: {
    title: string
    description: string
    responsibilities: string[]
    isPrimary?: boolean
    escalationContact?: boolean
    billingContact?: boolean
  } | null
  workStats: {
    tasksThisPeriod: number
    hoursThisPeriod: number
    lastActiveDate: string | null
  }
}

interface TeamMemberProfileModalProps {
  userId: string | null
  onClose: () => void
  clientWhatsApp?: string | null
}

export default function TeamMemberProfileModal({ userId, onClose, clientWhatsApp }: TeamMemberProfileModalProps) {
  const [member, setMember] = useState<TeamMemberDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      fetchMemberDetails()
    }
  }, [userId])

  const fetchMemberDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/client-portal/team/${userId}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setMember(data)
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to load team member details')
      }
    } catch (err) {
      console.error('Failed to fetch team member details:', err)
      setError('Failed to load team member details')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = () => {
    // For clients, we'll open WhatsApp with the client's WhatsApp number
    // Since we don't expose employee phone numbers to clients
    if (clientWhatsApp) {
      const message = encodeURIComponent(`Hi, I'd like to discuss something with ${member?.firstName || 'my team member'}`)
      window.open(`https://wa.me/${clientWhatsApp.replace(/[^0-9]/g, '')}?text=${message}`, '_blank', 'noopener,noreferrer')
    }
  }

  const handleRaiseIssue = () => {
    // Navigate to support ticket creation
    window.location.href = '/client-portal?tab=support&action=new'
  }

  const getFullName = () => {
    if (!member) return ''
    return `${member.firstName} ${member.lastName || ''}`.trim()
  }

  const getDeptInfo = () => {
    if (!member) return null
    return getDepartmentInfo(member.department)
  }

  const formatLastActive = (dateStr: string | null) => {
    if (!dateStr) return 'No recent activity'
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return formatDateDDMMYYYY(date)
  }

  if (!userId) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-slate-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-400">{error}</p>
            </div>
          ) : member ? (
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={getFullName()}
                  className="w-24 h-24 rounded-full object-cover border-4 border-slate-700 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-slate-700 shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {member.firstName?.charAt(0) || '?'}
                  </span>
                </div>
              )}

              {/* Primary badge */}
              {member.isPrimary && (
                <span className="mt-3 px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full border border-amber-500/30">
                  Primary Contact
                </span>
              )}

              {/* Name */}
              <h2 className="text-xl font-bold text-white mt-3">{getFullName()}</h2>

              {/* Role title */}
              <p className="text-blue-400 font-medium mt-1">
                {member.roleDefinition?.title || member.role.replace(/_/g, ' ')}
              </p>

              {/* Department badge */}
              {getDeptInfo() && (
                <span className={`mt-2 px-3 py-1 text-xs font-medium rounded-full ${getDeptInfo()!.bgColor} ${getDeptInfo()!.color} border ${getDeptInfo()!.borderColor}`}>
                  {getDeptInfo()!.label}
                </span>
              )}
            </div>
          ) : null}
        </div>

        {/* Content */}
        {!loading && !error && member && (
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            {/* Work Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-400">{member.workStats.tasksThisPeriod}</p>
                <p className="text-xs text-slate-400">Tasks</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-purple-400">{member.workStats.hoursThisPeriod}h</p>
                <p className="text-xs text-slate-400">Hours</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                <p className="text-sm font-medium text-green-400">
                  {formatLastActive(member.workStats.lastActiveDate)}
                </p>
                <p className="text-xs text-slate-400">Last Active</p>
              </div>
            </div>

            {/* Role Description */}
            {member.roleDefinition?.description && (
              <div className="mb-5">
                <p className="text-sm text-slate-300">{member.roleDefinition.description}</p>
              </div>
            )}

            {/* Responsibilities */}
            {member.roleDefinition?.responsibilities && member.roleDefinition.responsibilities.length > 0 && (
              <div className="mb-5">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Responsibilities
                </h4>
                <ul className="space-y-2">
                  {member.roleDefinition.responsibilities.map((resp, idx) => (
                    <li key={`resp-${resp}-${idx}`} className="flex items-start gap-2 text-sm text-slate-300">
                      <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              {member.roleDefinition?.escalationContact && (
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                  Escalation Contact
                </span>
              )}
              {member.roleDefinition?.billingContact && (
                <span className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded-full border border-teal-500/30">
                  Billing Contact
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {clientWhatsApp && (
                <button
                  onClick={handleSendMessage}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Send Message
                </button>
              )}
              <button
                onClick={handleRaiseIssue}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors border border-slate-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Raise Issue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
