'use client'

import { Client, formatTime } from './types'

interface ClientsTabProps {
  clients: Client[]
  filteredClients: Client[]
  clientSearch: string
  onClientSearchChange: (search: string) => void
  showOnlyWithPortal: boolean
  onShowOnlyWithPortalChange: (show: boolean) => void
}

export default function ClientsTab({
  clients,
  filteredClients,
  clientSearch,
  onClientSearchChange,
  showOnlyWithPortal,
  onShowOnlyWithPortalChange,
}: ClientsTabProps) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by client name or email..."
              value={clientSearch}
              onChange={(e) => onClientSearchChange(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900/40 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={showOnlyWithPortal}
              onChange={(e) => onShowOnlyWithPortalChange(e.target.checked)}
              className="rounded border-white/20"
            />
            Only with portal users
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-blue-400">{clients.length}</p>
          <p className="text-sm text-slate-400">Total Clients</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-green-400">{clients.filter(c => c.clientUsers.length > 0).length}</p>
          <p className="text-sm text-slate-400">With Portal Access</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-purple-400">{clients.reduce((sum, c) => sum + c.clientUsers.length, 0)}</p>
          <p className="text-sm text-slate-400">Total Portal Users</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-amber-400">{clients.reduce((sum, c) => sum + c.clientUsers.filter(u => u.isActive).length, 0)}</p>
          <p className="text-sm text-slate-400">Active Portal Users</p>
        </div>
      </div>

      {/* Clients List */}
      <div className="space-y-4">
        {filteredClients.length === 0 ? (
          <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
            <p className="text-slate-400">No clients found matching your criteria</p>
          </div>
        ) : (
          filteredClients.map(client => (
            <div key={client.id} className="glass-card rounded-xl border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white">{client.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      client.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                      client.status === 'ONBOARDING' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-800/50 text-slate-300'
                    }`}>
                      {client.status}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-500/20 text-purple-400">
                      {client.lifecycleStage}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    {client.email && <p className="text-sm text-slate-400">{client.email}</p>}
                    {client.accountManager && (
                      <p className="text-sm text-slate-400">AM: {client.accountManager}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-200">
                    {client.clientUsers.length} portal user{client.clientUsers.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {client.clientUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-900/40">
                        <th className="text-left px-4 py-2 font-medium text-slate-300">User</th>
                        <th className="text-left px-4 py-2 font-medium text-slate-300">Role</th>
                        <th className="text-left px-4 py-2 font-medium text-slate-300">Contact</th>
                        <th className="text-left px-4 py-2 font-medium text-slate-300">Last Login</th>
                        <th className="text-center px-4 py-2 font-medium text-slate-300">Status</th>
                        <th className="text-right px-4 py-2 font-medium text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {client.clientUsers.map(cu => (
                        <tr key={cu.id} className="hover:bg-slate-900/40">
                          <td className="px-4 py-3">
                            <p className="font-medium text-white">{cu.name}</p>
                            <p className="text-xs text-slate-400">{cu.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                              cu.role === 'PRIMARY' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/50 text-slate-300'
                            }`}>
                              {cu.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">{cu.phone || '-'}</td>
                          <td className="px-4 py-3 text-slate-300">
                            {cu.lastLoginAt ? formatTime(cu.lastLoginAt) : 'Never'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                              cu.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {cu.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs">-</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-slate-400">
                  No portal users configured for this client
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
