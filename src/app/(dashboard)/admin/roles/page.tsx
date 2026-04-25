import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Define system roles and their permissions
const SYSTEM_ROLES = [
  {
    id: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Full system access with all administrative privileges',
    color: 'bg-purple-500',
    permissions: [
      'View all dashboards',
      'Manage all users',
      'Manage all clients',
      'Access admin panel',
      'View audit logs',
      'Manage system settings',
      'Impersonate users',
      'Manage billing',
    ],
  },
  {
    id: 'MANAGER',
    name: 'Manager',
    description: 'Department head with team management capabilities',
    color: 'bg-blue-500',
    permissions: [
      'View department dashboard',
      'Manage team members',
      'View all department clients',
      'Approve tasks',
      'View team performance',
      'Schedule meetings',
      'Manage escalations',
    ],
  },
  {
    id: 'OPERATIONS_HEAD',
    name: 'Operations Head',
    description: 'Cross-department operational oversight',
    color: 'bg-green-500',
    permissions: [
      'View all departments',
      'Monitor operations',
      'Track client health',
      'View analytics',
      'Manage escalations',
      'WhatsApp view access',
    ],
  },
  {
    id: 'EMPLOYEE',
    name: 'Employee',
    description: 'Regular team member with assigned client access',
    color: 'bg-slate-900/40',
    permissions: [
      'View assigned clients',
      'Submit daily tasks',
      'Access knowledge base',
      'Submit expenses',
      'View own performance',
    ],
  },
  {
    id: 'SALES',
    name: 'Sales',
    description: 'Business development and lead management',
    color: 'bg-amber-500',
    permissions: [
      'Manage CRM leads',
      'Create proposals',
      'Track deals',
      'View sales dashboard',
      'Schedule client meetings',
    ],
  },
  {
    id: 'ACCOUNTS',
    name: 'Accounts',
    description: 'Financial operations and invoicing',
    color: 'bg-emerald-500',
    permissions: [
      'Manage invoices',
      'Process payments',
      'View financial reports',
      'Manage vendors',
      'Handle reimbursements',
    ],
  },
  {
    id: 'FREELANCER',
    name: 'Freelancer',
    description: 'External contractor with limited access',
    color: 'bg-orange-500',
    permissions: [
      'View assigned tasks',
      'Submit deliverables',
      'Track own hours',
      'Submit invoices',
    ],
  },
  {
    id: 'INTERN',
    name: 'Intern',
    description: 'Learning role with supervised access',
    color: 'bg-pink-500',
    permissions: [
      'View assigned tasks',
      'Access learning resources',
      'Submit daily logs',
      'Request guidance',
    ],
  },
]

export default async function RolesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role !== 'SUPER_ADMIN') redirect('/dashboard')

  // Get user counts per role
  const roleCounts = await prisma.user.groupBy({
    by: ['role'],
    _count: true,
  })
  const countMap = new Map(roleCounts.map(r => [r.role, r._count]))

  // Get custom roles
  const customRoles = await prisma.customRole.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { userAssignments: true } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <span>Roles & Permissions</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Roles & Permissions</h1>
          <p className="text-slate-400 mt-1">Manage system roles and access permissions</p>
        </div>
        <Link
          href="/admin/custom-roles"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Manage Custom Roles
        </Link>
      </div>

      {/* System Roles */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">System Roles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SYSTEM_ROLES.map(role => (
            <div key={role.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${role.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{role.id.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{role.name}</h3>
                    <p className="text-xs text-slate-400">{role.id}</p>
                  </div>
                </div>
                <span className="text-sm text-slate-400">
                  {countMap.get(role.id) || 0} users
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-3">{role.description}</p>
              <div className="border-t border-slate-700 pt-3">
                <p className="text-xs font-medium text-slate-400 mb-2">PERMISSIONS</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((perm, idx) => (
                    <span
                      key={perm}
                      className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Roles */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Custom Roles (Blended)</h2>
        {customRoles.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700">
            <p className="text-slate-400">No custom roles created yet.</p>
            <Link
              href="/admin/custom-roles"
              className="inline-block mt-3 text-purple-400 hover:text-purple-300"
            >
              Create your first custom role
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customRoles.map(role => (
              <div key={role.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{role.displayName}</h3>
                  <span className="text-xs text-slate-400">
                    {role._count.userAssignments} users
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">Code: {role.name}</p>
                <div className="flex flex-wrap gap-1">
                  {JSON.parse(role.departments).map((dept: string) => (
                    <span
                      key={dept}
                      className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permission Matrix */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 overflow-x-auto">
        <h2 className="text-lg font-semibold text-white mb-4">Permission Matrix</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 px-3 text-slate-400">Feature</th>
              {SYSTEM_ROLES.slice(0, 5).map(role => (
                <th key={role.id} className="text-center py-2 px-3 text-slate-400">{role.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { feature: 'View Dashboard', roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE', 'SALES'] },
              { feature: 'View All Clients', roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'] },
              { feature: 'Manage Users', roles: ['SUPER_ADMIN', 'MANAGER'] },
              { feature: 'Admin Panel', roles: ['SUPER_ADMIN'] },
              { feature: 'View Analytics', roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'] },
              { feature: 'WhatsApp Send', roles: ['SUPER_ADMIN', 'MANAGER', 'EMPLOYEE', 'SALES'] },
              { feature: 'Manage Invoices', roles: ['SUPER_ADMIN', 'MANAGER'] },
              { feature: 'CRM Access', roles: ['SUPER_ADMIN', 'MANAGER', 'SALES'] },
            ].map((row, idx) => (
              <tr key={row.feature} className="border-b border-slate-700/50">
                <td className="py-2 px-3 text-slate-300">{row.feature}</td>
                {SYSTEM_ROLES.slice(0, 5).map(role => (
                  <td key={role.id} className="text-center py-2 px-3">
                    {row.roles.includes(role.id) ? (
                      <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-slate-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
