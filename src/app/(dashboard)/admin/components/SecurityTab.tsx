import Link from 'next/link'
import { AdminStats, formatTime } from './types'

interface SecurityTabProps {
  stats: AdminStats
}

export default function SecurityTab({ stats }: SecurityTabProps) {
  return (
    <div className="space-y-6">
      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-green-400">{stats.activeSessionsCount}</p>
          <p className="text-sm text-slate-400">Active Sessions</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-red-400">{stats.suspiciousLogins}</p>
          <p className="text-sm text-slate-400">Suspicious Logins</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-blue-400">{stats.recentLogins.length}</p>
          <p className="text-sm text-slate-400">Recent Logins</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-slate-300">{stats.totalUsers - stats.activeUsers}</p>
          <p className="text-sm text-slate-400">Inactive Users</p>
        </div>
      </div>

      {/* All Sessions */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-white">All Login Sessions</h3>
          <Link href="/admin/sessions" className="text-sm text-blue-400 hover:text-blue-400">
            View Full History
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/40">
                <th className="text-left px-4 py-3 font-medium text-slate-300">User</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Login Time</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">IP Address</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Location</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Device</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Browser</th>
                <th className="text-center px-4 py-3 font-medium text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {stats.recentLogins.map(login => (
                <tr key={login.id} className={`hover:bg-slate-900/40 ${login.isSuspicious ? 'bg-red-500/10' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{login.userName}</p>
                    <p className="text-xs text-slate-400">{login.empId}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{formatTime(login.loginAt)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-300">{login.ipAddress || '-'}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {login.city && login.country ? `${login.city}, ${login.country}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{login.device || '-'}</td>
                  <td className="px-4 py-3 text-slate-300">{login.browser || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {login.isSuspicious && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-500/20 text-red-400">Suspicious</span>
                      )}
                      {login.isActive && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-500/20 text-green-400">Active</span>
                      )}
                      {!login.isActive && !login.isSuspicious && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-800/50 text-slate-300">Ended</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
