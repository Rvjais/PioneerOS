import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { NewProjectButton } from './WebProjectsClient'
import { Breadcrumb } from '@/client/components/ui/Breadcrumb'

async function getProjects(userId: string, userRole: string) {
  // Check if user is a manager/admin
  const isManagerOrAdmin = ['SUPER_ADMIN', 'MANAGER', 'WEB_MANAGER', 'OPERATIONS_HEAD'].includes(userRole)

  // Get client assignments for this user
  const assignments = await prisma.clientTeamMember.findMany({
    where: { userId },
    include: { client: { select: { id: true, name: true } } }
  })

  const clientIds = assignments.map(a => a.clientId)

  // For managers/admins, show all web projects
  // For regular users, show projects they're assigned to or have client access to
  const projects = await prisma.task.findMany({
    where: {
      department: { in: ['DEVELOPMENT', 'WEB', 'DESIGN'] },
      type: { in: ['PROJECT', 'TASK'] },
      ...(isManagerOrAdmin
        ? {}
        : {
            OR: [
              { assigneeId: userId },
              { clientId: { in: clientIds } }
            ]
          })
    },
    include: {
      client: { select: { id: true, name: true } },
      assignee: { select: { firstName: true, lastName: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return { projects, isManagerOrAdmin }
}

const statusColors: Record<string, string> = {
  TODO: 'bg-slate-900/20 text-slate-400 border-slate-500/30',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  IN_REVIEW: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  DONE: 'bg-green-500/20 text-green-400 border-green-500/30',
  BLOCKED: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const priorityColors: Record<string, string> = {
  URGENT: 'bg-red-500/20 text-red-400',
  HIGH: 'bg-orange-500/20 text-orange-400',
  MEDIUM: 'bg-amber-500/20 text-amber-400',
  LOW: 'bg-green-500/20 text-green-400',
}

export default async function WebProjectsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { projects, isManagerOrAdmin } = await getProjects(session.user.id, session.user.role as string)

  const activeProjects = projects.filter(p => !['DONE', 'CANCELLED'].includes(p.status))
  const completedProjects = projects.filter(p => p.status === 'DONE')

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Web', href: '/web' },
        { label: 'Projects' },
      ]} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Projects</h1>
          <p className="text-slate-400 mt-1">Web development projects and tasks</p>
        </div>
        <NewProjectButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-white">{activeProjects.length}</p>
          <p className="text-sm text-slate-400">Active Projects</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-blue-400">
            {projects.filter(p => p.status === 'IN_PROGRESS').length}
          </p>
          <p className="text-sm text-slate-400">In Progress</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-purple-400">
            {projects.filter(p => p.status === 'IN_REVIEW').length}
          </p>
          <p className="text-sm text-slate-400">In Review</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-green-400">{completedProjects.length}</p>
          <p className="text-sm text-slate-400">Completed</p>
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Active Projects</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 backdrop-blur-sm">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Project</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activeProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No active projects. Click &quot;+ New Project&quot; to create one.
                  </td>
                </tr>
              ) : (
                activeProjects.map(project => (
                  <tr key={project.id} className="hover:bg-white/5">
                    <td className="px-4 py-4">
                      <p className="font-medium text-white">{project.title}</p>
                      {project.description && (
                        <p className="text-sm text-slate-400 truncate max-w-xs">{project.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-400">
                      {project.client?.name || 'Internal'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full border ${statusColors[project.status] || statusColors.TODO}`}>
                        {project.status?.replace(/_/g, ' ') || 'TODO'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[project.priority] || priorityColors.MEDIUM}`}>
                        {project.priority || 'MEDIUM'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-400">
                      {project.dueDate
                        ? new Date(project.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : '-'}
                    </td>
                    <td className="px-4 py-4">
                      <button className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recently Completed */}
      {completedProjects.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Recently Completed</h2>
          </div>
          <div className="divide-y divide-white/5">
            {completedProjects.slice(0, 5).map(project => (
              <div key={project.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{project.title}</p>
                  <p className="text-sm text-slate-400">{project.client?.name || 'Internal'}</p>
                </div>
                <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
