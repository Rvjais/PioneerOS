'use client'

import React, { useState } from 'react'
import { getDepartmentInfo, getRoleDefinition, WORK_TYPE_LABELS } from '@/shared/constants/roleDefinitions'

interface ClientAssignment {
  clientId: string
  clientName: string
  role: string
  isPrimary: boolean
}

interface OrgChartMember {
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
  clientAssignments: ClientAssignment[]
  directReportsCount?: number
}

interface OrgChartCardProps {
  member: OrgChartMember
  onViewProfile: (userId: string) => void
  onSendMessage: (userId: string) => void
  onClientClick?: (clientId: string) => void
  isExpanded?: boolean
  onToggleExpand?: () => void
  isCompact?: boolean
}

export default function OrgChartCard({
  member,
  onViewProfile,
  onSendMessage,
  onClientClick,
  isExpanded = false,
  onToggleExpand,
  isCompact = false,
}: OrgChartCardProps) {
  const deptInfo = getDepartmentInfo(member.department)
  const roleDef = getRoleDefinition(member.role)

  const getInitials = (firstName: string, lastName?: string | null) => {
    return `${firstName.charAt(0)}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getFullName = () => {
    return `${member.firstName} ${member.lastName || ''}`.trim()
  }

  if (isCompact) {
    return (
      <button
        onClick={() => onViewProfile(member.id)}
        className="glass-card p-3 text-center border-slate-200 hover:border-blue-300 transition-all min-w-[140px]"
      >
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={getFullName()}
            className="w-10 h-10 rounded-full object-cover mx-auto"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium mx-auto">
            {getInitials(member.firstName, member.lastName)}
          </div>
        )}
        <p className="font-semibold text-sm text-slate-900 mt-2 truncate">{getFullName()}</p>
        <p className="text-xs text-slate-500 truncate">{roleDef?.title || member.role.replace(/_/g, ' ')}</p>
      </button>
    )
  }

  return (
    <div className={`glass-card border-slate-200 overflow-hidden transition-all ${isExpanded ? 'shadow-lg' : ''}`}>
      {/* Header - Always Visible */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <button
            onClick={() => onViewProfile(member.id)}
            className="flex-shrink-0"
          >
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={getFullName()}
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 hover:border-blue-500 transition-colors"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-slate-200 hover:border-blue-500 transition-colors">
                <span className="text-white font-bold text-lg">{getInitials(member.firstName, member.lastName)}</span>
              </div>
            )}
          </button>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 truncate">{getFullName()}</h3>
              {member.clientAssignments.length > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-xs rounded border border-blue-100">
                  {member.clientAssignments.length} client{member.clientAssignments.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">{roleDef?.title || member.role.replace(/_/g, ' ')}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${deptInfo.bgColor} ${deptInfo.color} border ${deptInfo.borderColor}`}>
              {deptInfo.label}
            </span>
          </div>

          {/* Expand Toggle */}
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-4 space-y-4 bg-slate-50/30">
          {/* Role Description */}
          {roleDef?.description && (
            <p className="text-sm text-slate-600 leading-relaxed">{roleDef.description}</p>
          )}

          {/* Responsibilities */}
          {roleDef?.responsibilities && roleDef.responsibilities.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Responsibilities
              </h4>
              <ul className="space-y-1">
                {roleDef.responsibilities.slice(0, 4).map((resp, idx) => (
                  <li key={`resp-${resp}-${idx}`} className="flex items-start gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Work Types
              </h4>
              <div className="flex flex-wrap gap-2">
                {roleDef.workTypes.map((workType) => {
                  const typeInfo = WORK_TYPE_LABELS[workType]
                  return (
                    <span
                      key={workType}
                      className="px-2 py-1 bg-white text-slate-600 text-xs rounded-full border border-slate-200"
                      title={typeInfo?.description}
                    >
                      {typeInfo?.label || workType}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Client Assignments */}
          {member.clientAssignments.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Assigned Clients ({member.clientAssignments.length})
              </h4>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {member.clientAssignments.map((assignment) => (
                  <button
                    key={`${assignment.clientId}-${assignment.role}`}
                    onClick={() => onClientClick?.(assignment.clientId)}
                    className="w-full flex items-center justify-between p-2 bg-white hover:bg-slate-50 rounded-lg transition-colors text-left border border-slate-100"
                  >
                    <span className="text-sm text-slate-900 truncate">{assignment.clientName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${assignment.isPrimary ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                      {assignment.role.replace(/_/g, ' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Direct Reports */}
          {member.directReportsCount !== undefined && member.directReportsCount > 0 && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs text-slate-500 font-medium">
                {member.directReportsCount} direct report{member.directReportsCount > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onViewProfile(member.id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              View Profile
            </button>
            <button
              onClick={() => onSendMessage(member.id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors border border-slate-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Message
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
