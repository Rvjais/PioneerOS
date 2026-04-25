'use client'

import Image from 'next/image'
import { AccountManager, TeamMember } from './types'

interface TeamSectionProps {
  accountManager: AccountManager | null
  teamMembers?: TeamMember[]
  selectedTeamMember: TeamMember | AccountManager | null
  setSelectedTeamMember: (member: TeamMember | AccountManager | null) => void
}

export default function TeamSection({ accountManager, teamMembers, selectedTeamMember, setSelectedTeamMember }: TeamSectionProps) {
  return (
    <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Your Team</h3>

      {/* Account Manager */}
      {accountManager && (
        <div className="mb-6">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Account Manager</p>
          <button
            onClick={() => setSelectedTeamMember(accountManager)}
            className="flex items-center gap-4 w-full text-left hover:bg-slate-900/40 rounded-lg p-2 -m-2 transition-colors"
          >
            {accountManager.avatarUrl ? (
              <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={accountManager.avatarUrl}
                  alt={accountManager.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-white">
                  {accountManager.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white">{accountManager.name}</h4>
              <p className="text-sm text-slate-400">Account Manager</p>
            </div>
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Team Members */}
      {teamMembers && teamMembers.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Team Working on Your Project</p>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedTeamMember(member)}
                className="flex items-center gap-4 w-full text-left hover:bg-slate-900/40 rounded-lg p-2 -m-2 transition-colors"
              >
                {member.avatarUrl ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={member.avatarUrl}
                      alt={member.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">{member.name}</h4>
                    {member.isPrimary && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">Primary</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{member.role.replace(/_/g, ' ')} • {member.department}</p>
                </div>
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {!accountManager && (!teamMembers || teamMembers.length === 0) && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-slate-400">Team assignment in progress</p>
          <p className="text-sm text-slate-400 mt-1">Your team will be assigned soon</p>
        </div>
      )}

      {/* Quick Contact */}
      {accountManager && (
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-sm font-medium text-slate-200 mb-3">Quick Contact</p>
          <div className="flex gap-3">
            <a
              href={`mailto:${accountManager.email}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
            {accountManager.phone && (
              <a
                href={`tel:${accountManager.phone}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
