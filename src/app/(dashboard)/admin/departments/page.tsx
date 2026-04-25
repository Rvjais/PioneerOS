import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Define departments with metadata
const DEPARTMENTS = [
  { id: 'WEB', name: 'Web Development', icon: '🌐', color: 'from-blue-500 to-blue-600', activities: ['Website Updates', 'Bug Fixes', 'New Features', 'Code Review'] },
  { id: 'SEO', name: 'SEO', icon: '📈', color: 'from-green-500 to-green-600', activities: ['Keyword Research', 'On-Page SEO', 'Link Building', 'Technical SEO'] },
  { id: 'ADS', name: 'Paid Advertising', icon: '📣', color: 'from-amber-500 to-amber-600', activities: ['Campaign Setup', 'Ad Creation', 'Optimization', 'Reporting'] },
  { id: 'SOCIAL', name: 'Social Media', icon: '📱', color: 'from-pink-500 to-pink-600', activities: ['Content Creation', 'Posting', 'Engagement', 'Analytics'] },
  { id: 'DESIGN', name: 'Design', icon: '🎨', color: 'from-purple-500 to-purple-600', activities: ['Graphics', 'UI/UX', 'Branding', 'Video Thumbnails'] },
  { id: 'VIDEO_EDITING', name: 'Video Editing', icon: '🎬', color: 'from-red-500 to-red-600', activities: ['Video Editing', 'Motion Graphics', 'Reels', 'YouTube'] },
  { id: 'HR', name: 'Human Resources', icon: '👥', color: 'from-teal-500 to-teal-600', activities: ['Recruitment', 'Onboarding', 'Training', 'Appraisals'] },
  { id: 'SALES', name: 'Sales', icon: '💼', color: 'from-indigo-500 to-indigo-600', activities: ['Lead Gen', 'Proposals', 'Follow-ups', 'Closures'] },
  { id: 'ACCOUNTS', name: 'Accounts', icon: '💰', color: 'from-emerald-500 to-emerald-600', activities: ['Invoicing', 'Payments', 'Expenses', 'Reconciliation'] },
  { id: 'OPERATIONS', name: 'Operations', icon: '⚙️', color: 'from-slate-500 to-slate-600', activities: ['Process Management', 'Client Health', 'Escalations', 'QA'] },
]

export default async function DepartmentsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Check if user is impersonating - if so, check original admin role
  const isImpersonating = session.user.isImpersonating
  const roleToCheck = isImpersonating ? session.user.originalRole : session.user.role

  if (roleToCheck !== 'SUPER_ADMIN') redirect('/dashboard')

  // Get user counts per department
  const deptCounts = await prisma.user.groupBy({
    by: ['department'],
    _count: { _all: true },
    where: { status: 'ACTIVE' },
  })
  const countMap = new Map(deptCounts.map(d => [d.department, d._count._all]))

  // Get department heads (managers in each department)
  const managers = await prisma.user.findMany({
    where: {
      role: 'MANAGER',
      status: 'ACTIVE',
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      department: true,
    },
  })
  const managerMap = new Map(managers.map(m => [m.department, m]))

  // Get active client assignments per department
  const clientAssignments = await prisma.clientTeamMember.groupBy({
    by: ['role'],
    _count: true,
  })

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Departments</h1>
          <p className="text-slate-400 mt-1">Manage organizational departments and team structure</p>
        </div>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-sm">Total Departments</p>
          <p className="text-2xl font-bold text-white">{DEPARTMENTS.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-sm">Total Employees</p>
          <p className="text-2xl font-bold text-white">
            {Array.from(countMap.values()).reduce((a, b) => a + b, 0)}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-sm">Department Heads</p>
          <p className="text-2xl font-bold text-white">{managers.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-sm">Client-Facing</p>
          <p className="text-2xl font-bold text-white">6</p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-sm">Support Depts</p>
          <p className="text-2xl font-bold text-white">4</p>
        </div>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEPARTMENTS.map(dept => {
          const manager = managerMap.get(dept.id)
          const memberCount = countMap.get(dept.id) || 0

          return (
            <div key={dept.id} className="glass-card rounded-xl shadow-none overflow-hidden">
              <div className={`bg-gradient-to-r ${dept.color} px-4 py-4`}>
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{dept.icon}</span>
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded font-medium">
                    {memberCount} members
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-2">{dept.name}</h3>
                <p className="text-white/80 text-sm">{dept.id}</p>
              </div>
              <div className="p-4">
                {/* Department Head */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
                  <span className="text-sm text-slate-400">Department Head</span>
                  {manager ? (
                    <span className="text-sm font-medium text-white">
                      {manager.firstName} {manager.lastName}
                    </span>
                  ) : (
                    <span className="text-sm text-amber-400">Not Assigned</span>
                  )}
                </div>

                {/* Activities */}
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-2">KEY ACTIVITIES</p>
                  <div className="flex flex-wrap gap-1">
                    {dept.activities.map((activity, idx) => (
                      <span
                        key={activity}
                        className="px-2 py-0.5 bg-slate-800/50 text-slate-300 text-xs rounded"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                  <Link
                    href={`/admin/users?department=${dept.id}`}
                    className="flex-1 text-center px-3 py-1.5 bg-slate-800/50 text-slate-200 text-sm rounded hover:bg-white/10 transition-colors"
                  >
                    View Team
                  </Link>
                  <Link
                    href={`/tasks/daily?department=${dept.id}`}
                    className="flex-1 text-center px-3 py-1.5 bg-slate-800/50 text-slate-200 text-sm rounded hover:bg-white/10 transition-colors"
                  >
                    Tasks
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Department Hierarchy */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Department Structure</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client-Facing */}
          <div>
            <h3 className="text-sm font-medium text-purple-400 mb-3">Client-Facing Departments</h3>
            <div className="space-y-2">
              {['WEB', 'SEO', 'ADS', 'SOCIAL', 'DESIGN', 'VIDEO_EDITING'].map(deptId => {
                const dept = DEPARTMENTS.find(d => d.id === deptId)
                if (!dept) return null
                return (
                  <div key={deptId} className="flex items-center justify-between p-2 bg-slate-900/40 rounded">
                    <div className="flex items-center gap-2">
                      <span>{dept.icon}</span>
                      <span className="text-white">{dept.name}</span>
                    </div>
                    <span className="text-slate-400 text-sm">{countMap.get(deptId) || 0} members</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-medium text-green-400 mb-3">Support Departments</h3>
            <div className="space-y-2">
              {['HR', 'SALES', 'ACCOUNTS', 'OPERATIONS'].map(deptId => {
                const dept = DEPARTMENTS.find(d => d.id === deptId)
                if (!dept) return null
                return (
                  <div key={deptId} className="flex items-center justify-between p-2 bg-slate-900/40 rounded">
                    <div className="flex items-center gap-2">
                      <span>{dept.icon}</span>
                      <span className="text-white">{dept.name}</span>
                    </div>
                    <span className="text-slate-400 text-sm">{countMap.get(deptId) || 0} members</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
