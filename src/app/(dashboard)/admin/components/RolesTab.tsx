'use client'

import { AdminStats, ROLES, roleColors } from './types'

interface RolesTabProps {
  stats: AdminStats
}

export default function RolesTab({ stats }: RolesTabProps) {
  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl border border-white/10 p-5">
        <h3 className="font-semibold text-white mb-4">Role Permissions</h3>
        <p className="text-sm text-slate-400 mb-6">Manage what each role can access in the system</p>

        <div className="space-y-4">
          {ROLES.map(role => {
            const userCount = stats.usersByRole.find(r => r.role === role)?.count || 0
            return (
              <div key={role} className="border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-sm font-medium rounded ${roleColors[role]}`}>
                      {role}
                    </span>
                    <span className="text-sm text-slate-400">{userCount} user(s)</span>
                  </div>
                  <button className="text-sm text-blue-400 hover:text-blue-400">
                    Edit Permissions
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {role === 'SUPER_ADMIN' && (
                    <>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Full Access</span>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">User Management</span>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">System Settings</span>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Finance Data</span>
                    </>
                  )}
                  {role === 'MANAGER' && (
                    <>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Team Management</span>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Client Access</span>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Reports</span>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Appraisals</span>
                    </>
                  )}
                  {role === 'EMPLOYEE' && (
                    <>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Own Tasks</span>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Assigned Clients</span>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Own Profile</span>
                    </>
                  )}
                  {role === 'SALES' && (
                    <>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">CRM Access</span>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Lead Management</span>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Sales Reports</span>
                    </>
                  )}
                  {role === 'ACCOUNTS' && (
                    <>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Finance Access</span>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Invoices</span>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Expenses</span>
                    </>
                  )}
                  {role === 'FREELANCER' && (
                    <>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Own Tasks</span>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Work Reports</span>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Payments</span>
                    </>
                  )}
                  {role === 'INTERN' && (
                    <>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Own Tasks</span>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Handbook</span>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">Learning</span>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation Visibility */}
      <div className="glass-card rounded-xl border border-white/10 p-5">
        <h3 className="font-semibold text-white mb-4">Navigation Access</h3>
        <p className="text-sm text-slate-400 mb-6">Control which menu sections each role can see</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 font-medium text-slate-300">Section</th>
                {ROLES.map(role => (
                  <th key={role} className="text-center py-2 font-medium text-slate-300 px-2">
                    <span className={`px-2 py-0.5 text-xs rounded ${roleColors[role]}`}>{role.substring(0, 3)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {['Main', 'Admin', 'Workspace', 'People', 'Performance', 'Finance', 'Growth', 'Culture', 'Knowledge'].map(section => (
                <tr key={section}>
                  <td className="py-2 text-slate-200">{section}</td>
                  {ROLES.map(role => {
                    const hasAccess = (
                      (role === 'SUPER_ADMIN') ||
                      (role === 'MANAGER' && ['Main', 'Workspace', 'People', 'Performance', 'Finance', 'Growth', 'Culture', 'Knowledge'].includes(section)) ||
                      (role === 'SALES' && ['Main', 'Growth', 'Workspace', 'Performance', 'Culture'].includes(section)) ||
                      (role === 'ACCOUNTS' && ['Main', 'Finance', 'Workspace', 'Performance', 'Culture'].includes(section)) ||
                      (role === 'EMPLOYEE' && ['Main', 'Workspace', 'Performance', 'Culture', 'Knowledge'].includes(section)) ||
                      (role === 'FREELANCER' && ['Main', 'Culture'].includes(section)) ||
                      (role === 'INTERN' && ['Main', 'Culture', 'Knowledge'].includes(section))
                    )
                    return (
                      <td key={role} className="text-center py-2">
                        {hasAccess ? (
                          <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-slate-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
