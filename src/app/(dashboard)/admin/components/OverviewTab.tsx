import Link from 'next/link'
import { AdminStats, roleColors, formatTime } from './types'

interface OverviewTabProps {
  stats: AdminStats
  onSetActiveTab: (tab: 'security') => void
  onShowAddUser: () => void
}

export default function OverviewTab({ stats, onSetActiveTab, onShowAddUser }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-blue-400">{stats.totalUsers}</p>
          <p className="text-sm text-slate-400">Total Users</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-green-400">{stats.activeUsers}</p>
          <p className="text-sm text-slate-400">Active Users</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-purple-400">{stats.activeSessionsCount}</p>
          <p className="text-sm text-slate-400">Active Sessions</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-amber-400">{stats.totalClients}</p>
          <p className="text-sm text-slate-400">Total Clients</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-cyan-600">{stats.pendingLeads}</p>
          <p className="text-sm text-slate-400">Pending Leads</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-red-400">{stats.openIssues}</p>
          <p className="text-sm text-slate-400">Open Issues</p>
        </div>
      </div>

      {/* Suspicious Activity Alert */}
      {stats.suspiciousLogins > 0 && (
        <div className="bg-red-500/10 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="font-semibold text-red-800">{stats.suspiciousLogins} Suspicious Login(s) Detected</h3>
            <p className="text-sm text-red-400">Review the security tab for details</p>
          </div>
          <button
            onClick={() => onSetActiveTab('security')}
            className="ml-auto px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
          >
            Review
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <div className="glass-card rounded-xl border border-white/10 p-5">
          <h3 className="font-semibold text-white mb-4">Users by Role</h3>
          <div className="space-y-3">
            {stats.usersByRole.map(item => (
              <div key={item.role} className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-medium rounded ${roleColors[item.role] || 'bg-slate-800/50 text-slate-300'}`}>
                  {item.role}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(item.count / stats.totalUsers) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-300 w-8">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users by Department */}
        <div className="glass-card rounded-xl border border-white/10 p-5">
          <h3 className="font-semibold text-white mb-4">Users by Department</h3>
          <div className="space-y-3">
            {stats.usersByDepartment.map(item => (
              <div key={item.department} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{item.department}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${(item.count / stats.totalUsers) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-300 w-8">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Logins */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-white">Recent Logins</h3>
          <button
            onClick={() => onSetActiveTab('security')}
            className="text-sm text-blue-400 hover:text-blue-400"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/40">
                <th className="text-left px-4 py-2 font-medium text-slate-300">User</th>
                <th className="text-left px-4 py-2 font-medium text-slate-300">Time</th>
                <th className="text-left px-4 py-2 font-medium text-slate-300">Location</th>
                <th className="text-left px-4 py-2 font-medium text-slate-300">Device</th>
                <th className="text-center px-4 py-2 font-medium text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {stats.recentLogins.map(login => (
                <tr key={login.id} className={login.isSuspicious ? 'bg-red-500/10' : ''}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{login.userName}</p>
                    <p className="text-xs text-slate-400">{login.empId}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{formatTime(login.loginAt)}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {login.city && login.country ? `${login.city}, ${login.country}` : login.ipAddress || '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {login.browser || '-'} / {login.device || '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {login.isSuspicious ? (
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-500/20 text-red-400">Suspicious</span>
                    ) : login.isActive ? (
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-500/20 text-green-400">Active</span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-800/50 text-slate-300">Ended</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-xl border border-white/10 p-5">
        <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={onShowAddUser}
            className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-lg hover:bg-slate-800/50 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-200">Add User</span>
          </button>
          <Link
            href="/admin/entities"
            className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-200">Company Entities</span>
          </Link>
          <Link
            href="/hr/verifications"
            className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-200">Verifications</span>
          </Link>
          <Link
            href="/issues"
            className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-200">View Issues</span>
          </Link>
          <Link
            href="/admin/magic-links"
            className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-200">Magic Links</span>
          </Link>
          <Link
            href="/admin/freelancers"
            className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-200">Freelancers</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
