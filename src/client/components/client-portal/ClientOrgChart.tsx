'use client'

import React, { useState } from 'react'
import TeamMemberProfileModal from './TeamMemberProfileModal'
import { CLIENT_TEAM_ROLE_DEFINITIONS, getDepartmentInfo } from '@/shared/constants/roleDefinitions'

interface TeamMember {
  id: string
  firstName: string
  lastName: string | null
  role: string
  department: string
  avatarUrl: string | null
  isPrimary: boolean
}

interface ClientOrgChartProps {
  teamMembers: TeamMember[]
  accountManager?: TeamMember | null
  accountsContact?: TeamMember | null
  clientWhatsApp?: string | null
}

export default function ClientOrgChart({
  teamMembers,
  accountManager,
  accountsContact,
  clientWhatsApp,
}: ClientOrgChartProps) {
  const [profileUserId, setProfileUserId] = useState<string | null>(null)

  const getFullName = (member: TeamMember) => {
    return `${member.firstName} ${member.lastName || ''}`.trim()
  }

  const getInitials = (member: TeamMember) => {
    return `${member.firstName.charAt(0)}${member.lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getRoleTitle = (role: string) => {
    return CLIENT_TEAM_ROLE_DEFINITIONS[role]?.title || role.replace(/_/g, ' ')
  }

  const getRoleDescription = (role: string) => {
    return CLIENT_TEAM_ROLE_DEFINITIONS[role]?.description || ''
  }

  // Filter out account manager and accounts contact from team members
  const otherMembers = teamMembers.filter(
    (m) =>
      m.id !== accountManager?.id &&
      m.id !== accountsContact?.id
  )

  // Group other members by department
  const membersByDept: Record<string, TeamMember[]> = {}
  otherMembers.forEach((m) => {
    if (!membersByDept[m.department]) {
      membersByDept[m.department] = []
    }
    membersByDept[m.department].push(m)
  })

  if (teamMembers.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-slate-400">Your team is being assigned</p>
        <p className="text-sm text-slate-400 mt-1">Check back soon to meet your team</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Primary Contact / Account Manager */}
      {accountManager && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded">
              PRIMARY CONTACT
            </span>
          </div>
          <button
            onClick={() => setProfileUserId(accountManager.id)}
            className="w-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border-2 border-blue-500/30 p-5 text-left hover:border-blue-400/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              {accountManager.avatarUrl ? (
                <img
                  src={accountManager.avatarUrl}
                  alt={getFullName(accountManager)}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/30"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-blue-500/30">
                  <span className="text-white font-bold text-xl">{getInitials(accountManager)}</span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{getFullName(accountManager)}</h3>
                <p className="text-blue-400 font-medium">{getRoleTitle(accountManager.role)}</p>
                <p className="text-sm text-slate-400 mt-1">
                  {getRoleDescription(accountManager.role)}
                </p>
              </div>
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      )}

      {/* Team Members */}
      {otherMembers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Your Team Members
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {otherMembers.map((member) => {
              const deptInfo = getDepartmentInfo(member.department)
              return (
                <button
                  key={member.id}
                  onClick={() => setProfileUserId(member.id)}
                  className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-left hover:border-slate-600 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={getFullName(member)}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-medium">{getInitials(member)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                        {getFullName(member)}
                      </p>
                      <p className="text-sm text-slate-400 truncate">{getRoleTitle(member.role)}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${deptInfo.bgColor} ${deptInfo.color}`}>
                        {member.department}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Escalation Contacts */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Escalation Contacts
        </h3>
        <div className="space-y-3">
          {/* Account Issues */}
          {accountManager && (
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Account Issues</p>
                <p className="text-xs text-slate-400">{getFullName(accountManager)}</p>
              </div>
              <button
                onClick={() => setProfileUserId(accountManager.id)}
                className="px-3 py-1.5 bg-blue-600/20 text-blue-400 text-sm rounded hover:bg-blue-600/30 transition-colors"
              >
                Contact
              </button>
            </div>
          )}

          {/* Billing Issues */}
          {accountsContact && (
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Billing Inquiries</p>
                <p className="text-xs text-slate-400">{getFullName(accountsContact)}</p>
              </div>
              <button
                onClick={() => setProfileUserId(accountsContact.id)}
                className="px-3 py-1.5 bg-teal-600/20 text-teal-400 text-sm rounded hover:bg-teal-600/30 transition-colors"
              >
                Contact
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Need Help */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5 text-center">
        <svg className="w-10 h-10 text-slate-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h4 className="font-medium text-white mb-1">Need Help?</h4>
        <p className="text-sm text-slate-400 mb-3">
          Have a question or concern? Create a support ticket.
        </p>
        <a
          href="/client-portal?tab=support&action=new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Support Ticket
        </a>
      </div>

      {/* Profile Modal */}
      {profileUserId && (
        <TeamMemberProfileModal
          userId={profileUserId}
          onClose={() => setProfileUserId(null)}
          clientWhatsApp={clientWhatsApp}
        />
      )}
    </div>
  )
}
