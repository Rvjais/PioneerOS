import prisma from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'

async function getSessions() {
  return prisma.loginSession.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          empId: true,
          department: true,
        },
      },
    },
    orderBy: { loginAt: 'desc' },
    take: 200,
  })
}

export default async function SessionsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Check if user is SUPER_ADMIN
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Access Restricted</h1>
          <p className="text-slate-300">Login sessions are only accessible to Super Admin users.</p>
        </div>
      </div>
    )
  }

  const sessions = await getSessions()

  // Group sessions by status
  const activeSessions = sessions.filter(s => s.isActive)
  const suspiciousSessions = sessions.filter(s => s.isSuspicious)
  const newDeviceSessions = sessions.filter(s => s.isNewDevice && s.loginAt > new Date(Date.now() - 24 * 60 * 60 * 1000))

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const deviceIcons: Record<string, string> = {
    DESKTOP: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    MOBILE: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
    TABLET: 'M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Login Sessions</h1>
          <p className="text-sm text-slate-400">Monitor user login activity and device access</p>
        </div>
        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm font-medium rounded-full">
          Super Admin View
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-green-400">{activeSessions.length}</p>
          <p className="text-sm text-slate-400">Active Sessions</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-blue-400">{newDeviceSessions.length}</p>
          <p className="text-sm text-slate-400">New Devices (24h)</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-amber-400">{suspiciousSessions.length}</p>
          <p className="text-sm text-slate-400">Suspicious Logins</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-slate-300">{sessions.length}</p>
          <p className="text-sm text-slate-400">Total Sessions</p>
        </div>
      </div>

      {/* Suspicious Sessions Alert */}
      {suspiciousSessions.length > 0 && (
        <div className="bg-red-500/10 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-semibold text-red-800">Suspicious Activity Detected</h3>
          </div>
          <div className="space-y-2">
            {suspiciousSessions.slice(0, 5).map((s) => {
              const u = s.user
              return (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="text-red-400">
                    {u?.firstName} {u?.lastName || ''} ({u?.empId})
                  </span>
                  <span className="text-red-400">{s.suspiciousReason}</span>
                  <span className="text-red-500">{s.ipAddress} - {s.city}, {s.country}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Sessions Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/40 border-b border-white/10">
                <th className="text-left px-4 py-3 font-medium text-slate-300">User</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Device</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Location</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">IP Address</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Login Time</th>
                <th className="text-center px-4 py-3 font-medium text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No login sessions recorded yet
                  </td>
                </tr>
              ) : (
                sessions.map((s) => {
                  const u = s.user
                  return (
                    <tr key={s.id} className={`hover:bg-slate-900/40 ${s.isSuspicious ? 'bg-red-500/10' : ''}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">
                            {u?.firstName} {u?.lastName || ''}
                          </p>
                          <p className="text-xs text-slate-400">{u?.empId} - {u?.department}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={deviceIcons[s.deviceType || 'DESKTOP']} />
                          </svg>
                          <div>
                            <p className="text-slate-200">{s.browser} {s.browserVersion}</p>
                            <p className="text-xs text-slate-400">{s.os} {s.osVersion}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-slate-200">{s.city || 'Unknown'}, {s.country || 'Unknown'}</p>
                          <p className="text-xs text-slate-400">{s.region} - {s.isp}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-300">
                        {s.ipAddress}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {formatDate(s.loginAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {s.isActive && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-500/20 text-green-400">
                              Active
                            </span>
                          )}
                          {s.isNewDevice && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-500/20 text-blue-400">
                              New
                            </span>
                          )}
                          {s.isSuspicious && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-500/20 text-red-400">
                              Suspicious
                            </span>
                          )}
                          {!s.isActive && !s.isSuspicious && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-800/50 text-slate-300">
                              Ended
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
