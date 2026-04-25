import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { Breadcrumb } from '@/client/components/ui/Breadcrumb'

async function getPipelineTasks(userId: string) {
  // Get client assignments for this user
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
      type: { in: ['PROJECT', 'TASK'] },
      status: { notIn: ['COMPLETED', 'CANCELLED'] }
    },
    include: {
      client: { select: { id: true, name: true } },
      assignee: { select: { firstName: true, lastName: true, profile: { select: { profilePicture: true } } } }
    },
    orderBy: { dueDate: 'asc' }
  })

  return tasks
}

const COLUMNS = [
  { status: 'TODO', label: 'To Do', color: 'border-slate-500', headerBg: 'bg-slate-500/10', headerText: 'text-slate-400' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'border-blue-500', headerBg: 'bg-blue-500/10', headerText: 'text-blue-400' },
  { status: 'REVIEW', label: 'In Review', color: 'border-purple-500', headerBg: 'bg-purple-500/10', headerText: 'text-purple-400' },
  { status: 'REVISION', label: 'Revision', color: 'border-orange-500', headerBg: 'bg-orange-500/10', headerText: 'text-orange-400' },
  { status: 'BLOCKED', label: 'Blocked', color: 'border-red-500', headerBg: 'bg-red-500/10', headerText: 'text-red-400' },
]

const priorityColors: Record<string, string> = {
  URGENT: 'bg-red-500 text-red-300',
  HIGH: 'bg-orange-500 text-orange-300',
  MEDIUM: 'bg-amber-500 text-amber-300',
  LOW: 'bg-green-500 text-green-300',
}

export default async function WebPipelinePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const tasks = await getPipelineTasks(session.user.id)

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.status] = tasks.filter(t => t.status === col.status)
    return acc
  }, {} as Record<string, typeof tasks>)

  const totalTasks = tasks.length

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Web', href: '/web' },
        { label: 'Pipeline' },
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Pipeline</h1>
          <p className="text-slate-400 mt-1">{totalTasks} active tasks across all stages</p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const colTasks = tasksByStatus[col.status] || []
          return (
            <div key={col.status} className="flex-shrink-0 w-72">
              {/* Column Header */}
              <div className={`rounded-t-xl border-b-2 ${col.color} ${col.headerBg} px-4 py-3`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${col.headerText}`}>{col.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.headerText} ${col.headerBg}`}>
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-white/5 border border-t-0 border-white/10 rounded-b-xl min-h-[400px] p-3 space-y-3">
                {colTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-slate-600 text-sm">
                    No tasks
                  </div>
                ) : (
                  colTasks.map(task => (
                    <a
                      key={task.id}
                      href={`/projects/${task.id}`}
                      className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 transition-all hover:border-white/20 hover:shadow-lg hover:shadow-black/20 group"
                    >
                      {/* Client */}
                      {task.client && (
                        <p className="text-xs text-indigo-400 font-medium mb-1">
                          {task.client.name}
                        </p>
                      )}

                      {/* Title */}
                      <p className="text-sm font-medium text-white leading-snug group-hover:text-indigo-300">
                        {task.title}
                      </p>

                      {/* Description */}
                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${priorityColors[task.priority] || priorityColors.MEDIUM}`}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className="text-[10px] text-slate-500">
                            {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>

                      {/* Assignee */}
                      {task.assignee && (
                        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/5">
                          <div className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center text-[9px] font-bold text-indigo-300">
                            {task.assignee.firstName[0]}{task.assignee.lastName?.[0] || ''}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {task.assignee.firstName} {task.assignee.lastName}
                          </span>
                        </div>
                      )}
                    </a>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
