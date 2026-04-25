import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { Breadcrumb } from '@/client/components/ui/Breadcrumb'

async function getOnHoldTasks(userId: string) {
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
      status: 'BLOCKED'
    },
    include: {
      client: { select: { id: true, name: true } },
      assignee: { select: { firstName: true, lastName: true } }
    },
    orderBy: { updatedAt: 'desc' }
  })

  return tasks
}

const priorityColors: Record<string, string> = {
  URGENT: 'bg-red-500/20 text-red-400 border border-red-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  MEDIUM: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  LOW: 'bg-green-500/20 text-green-400 border border-green-500/30',
}

export default async function WebOnHoldPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const onHoldTasks = await getOnHoldTasks(session.user.id)

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Web', href: '/web' },
        { label: 'On Hold' },
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">On Hold</h1>
          <p className="text-slate-400 mt-1">{onHoldTasks.length} blocked tasks need attention</p>
        </div>
      </div>

      {/* Alert Banner */}
      {onHoldTasks.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-red-300">
            These tasks are blocked and waiting for action. Resolve dependencies to move them forward.
          </p>
        </div>
      )}

      {/* On Hold List */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Blocked Tasks</h2>
        </div>
        <div className="divide-y divide-white/5">
          {onHoldTasks.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-slate-400">No blocked tasks. Great job!</p>
            </div>
          ) : (
            onHoldTasks.map(task => (
              <div key={task.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${priorityColors[task.priority] || priorityColors.MEDIUM}`}>
                        {task.priority}
                      </span>
                      {task.client && (
                        <span className="text-xs text-indigo-400">{task.client.name}</span>
                      )}
                    </div>
                    <p className="font-medium text-white">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      {task.dueDate && (
                        <span className="text-xs text-slate-500">
                          Due: {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      <span className="text-xs text-red-400">
                        Blocked
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    {task.assignee && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-red-500/30 flex items-center justify-center text-[10px] font-bold text-red-300">
                          {task.assignee.firstName[0]}{task.assignee.lastName?.[0] || ''}
                        </div>
                        <span className="text-xs text-slate-500">
                          {task.assignee.firstName}
                        </span>
                      </div>
                    )}
                    <button className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 border border-red-500/20">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
