'use client'

import React, { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Link from 'next/link'
import { getDepartmentInfo, getRoleDefinition, WORK_TYPE_LABELS } from '@/shared/constants/roleDefinitions'

interface ClientAssignment {
  clientId: string
  clientName: string
  role: string
  isPrimary: boolean
}

interface ProfileData {
  id: string
  empId: string
  firstName: string
  lastName: string | null
  role: string
  department: string
  status: string
  avatarUrl: string | null
  email: string | null
  phone: string
  joiningDate: string | null
  clientAssignments: ClientAssignment[]
  directReportsCount: number
  recentActivity: {
    tasksCompleted: number
    hoursWorked: number
    lastActive: string | null
  }
}

interface OrgChartProfileModalProps {
  userId: string | null
  onClose: () => void
  onSendMessage: (userId: string) => void
  onClientClick?: (clientId: string) => void
}

export default function OrgChartProfileModal({
  userId,
  onClose,
  onSendMessage,
  onClientClick,
}: OrgChartProfileModalProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      fetchProfile()
    }
  }, [userId])

  const fetchProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/org-chart/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to load profile')
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (!userId) return null

  const getFullName = () => {
    if (!profile) return ''
    return `${profile.firstName} ${profile.lastName || ''}`.trim()
  }

  const getInitials = () => {
    if (!profile) return '?'
    return `${profile.firstName.charAt(0)}${profile.lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const deptInfo = profile ? getDepartmentInfo(profile.department) : null
  const roleDef = profile ? getRoleDefinition(profile.role) : null

  const formatJoiningDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return formatDateDDMMYYYY(date)
  }

  const formatLastActive = (dateStr: string | null) => {
    if (!dateStr) return 'No recent activity'
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-hidden shadow-xl">
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
          ) : profile ? (
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={getFullName()}
                  className="w-24 h-24 rounded-full object-cover border-4 border-slate-700 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-slate-700 shadow-lg">
                  <span className="text-white font-bold text-2xl">{getInitials()}</span>
                </div>
              )}

              {/* Status badge */}
              <span className={`mt-3 px-3 py-1 text-xs font-medium rounded-full ${
                profile.status === 'ACTIVE'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : profile.status === 'PROBATION'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
              }`}>
                {profile.status}
              </span>

              {/* Name and Emp ID */}
              <h2 className="text-xl font-bold text-white mt-3">{getFullName()}</h2>
              <p className="text-sm text-slate-400">{profile.empId}</p>

              {/* Role title */}
              <p className="text-blue-400 font-medium mt-1">
                {roleDef?.title || profile.role.replace(/_/g, ' ')}
              </p>

              {/* Department badge */}
              {deptInfo && (
                <span className={`mt-2 px-3 py-1 text-xs font-medium rounded-full ${deptInfo.bgColor} ${deptInfo.color} border ${deptInfo.borderColor}`}>
                  {deptInfo.label}
                </span>
              )}
            </div>
          ) : null}
        </div>

        {/* Content */}
        {!loading && !error && profile && (
          <div className="p-6 overflow-y-auto max-h-[50vh] space-y-5">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-400">{profile.recentActivity.tasksCompleted}</p>
                <p className="text-xs text-slate-400">Tasks (30d)</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-purple-400">{profile.recentActivity.hoursWorked}h</p>
                <p className="text-xs text-slate-400">Hours (30d)</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                <p className="text-sm font-medium text-green-400">
                  {formatLastActive(profile.recentActivity.lastActive)}
                </p>
                <p className="text-xs text-slate-400">Last Active</p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-xs text-slate-400">Joined</p>
                <p className="text-sm text-white font-medium">{formatJoiningDate(profile.joiningDate)}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-xs text-slate-400">Direct Reports</p>
                <p className="text-sm text-white font-medium">{profile.directReportsCount}</p>
              </div>
            </div>

            {/* Role Description */}
            {roleDef?.description && (
              <div>
                <p className="text-sm text-slate-300">{roleDef.description}</p>
              </div>
            )}

            {/* Responsibilities */}
            {roleDef?.responsibilities && roleDef.responsibilities.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Responsibilities
                </h4>
                <ul className="space-y-1.5">
                  {roleDef.responsibilities.map((resp, idx) => (
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

            {/* Work Types */}
            {roleDef?.workTypes && roleDef.workTypes.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Work Types
                </h4>
                <div className="flex flex-wrap gap-2">
                  {roleDef.workTypes.map((workType) => {
                    const typeInfo = WORK_TYPE_LABELS[workType]
                    return (
                      <span
                        key={workType}
                        className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full border border-slate-600"
                        title={typeInfo?.description}
                      >
                        {typeInfo?.label || workType}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* App Functions */}
            {roleDef?.appFunctions && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Permissions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {roleDef.appFunctions.approvesWork && (
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                      Can Approve
                    </span>
                  )}
                  {roleDef.appFunctions.reviewsDeliverables && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                      Reviews Work
                    </span>
                  )}
                  {roleDef.appFunctions.managesClients && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Manages Clients
                    </span>
                  )}
                  {roleDef.appFunctions.handlesEscalations && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                      Handles Escalations
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Client Assignments */}
            {profile.clientAssignments.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Assigned Clients ({profile.clientAssignments.length})
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {profile.clientAssignments.map((assignment) => (
                    <button
                      key={`${assignment.clientId}-${assignment.role}`}
                      onClick={() => onClientClick?.(assignment.clientId)}
                      className="w-full flex items-center justify-between p-2 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors text-left"
                    >
                      <span className="text-sm text-white truncate">{assignment.clientName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${assignment.isPrimary ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-600 text-slate-300'}`}>
                        {assignment.role.replace(/_/g, ' ')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Link
                href={`/team/${profile.id}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Full Profile
              </Link>
              <button
                onClick={() => onSendMessage(profile.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors border border-slate-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
