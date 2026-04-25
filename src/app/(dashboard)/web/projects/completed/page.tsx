import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { Breadcrumb } from '@/client/components/ui/Breadcrumb'

async function getCompletedTasks(userId: string) {
  const assignments = await prisma.clientTeamMember.findMany({
    where: { userId },
    include: { client: { select: { id: true, name: true } } }
  })
  const clientIds = assignments.map(a => a.clientId)

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { assigneeId: userId },
        { clientId: { in: clientIds } }
      ],
      department: { in: ['DEVELOPMENT', 'WEB', 'DESIGN'] },
      status: 'COMPLETED'
    },
    include: {
      client: { select: { id: true, name: true } },
      assignee: { select: { firstName: true, lastName: true } }
    },
    orderBy: { completedAt: 'desc' }
  })

  return tasks
}

export default async function WebCompletedPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const completedTasks = await getCompletedTasks(session.user.id)

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Web', href: '/web' },
        { label: 'Completed' },
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Completed Projects</h1>
          <p className="text-slate-400 mt-1">{completedTasks.length} completed tasks</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-green-400">{completedTasks.length}</p>
          <p className="text-sm text-slate-400">Total Completed</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-blue-400">
            {completedTasks.filter(t => t.client).length}
          </p>
          <p className="text-sm text-slate-400">Client Projects</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-purple-400">
            {completedTasks.filter(t => !t.client).length}
          </p>
          <p className="text-sm text-slate-400">Internal Tasks</p>
        </div>
      </div>

      {/* Completed List */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">All Completed</h2>
        </div>
        <div className="divide-y divide-white/5">
          {completedTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No completed tasks yet.
            </div>
          ) : (
            completedTasks.map(task => (
              <div key={task.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{task.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {task.client && (
                      <span className="text-xs text-indigo-400">{task.client.name}</span>
                    )}
                    <span className="text-xs text-slate-500">
                      {task.completedAt
                        ? `Completed ${new Date(task.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  {task.assignee && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center text-[10px] font-bold text-green-300">
                        {task.assignee.firstName[0]}{task.assignee.lastName?.[0] || ''}
                      </div>
                      <span className="text-xs text-slate-500">
                        {task.assignee.firstName}
                      </span>
                    </div>
                  )}
                  <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                    Done
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
