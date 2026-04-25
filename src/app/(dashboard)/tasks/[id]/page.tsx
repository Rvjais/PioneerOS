import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { TaskDetailClient } from './TaskDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

const MANAGER_ROLES = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD']

async function getTask(taskId: string, userId: string, userRole: string, userDepartment: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          department: true,
          role: true,
          empId: true,
          profile: { select: { profilePicture: true } }
        }
      },
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profile: { select: { profilePicture: true } }
        }
      },
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profile: { select: { profilePicture: true } }
        }
      },
      client: {
        select: {
          id: true,
          name: true,
          brandName: true,
          logoUrl: true,
        }
      },
      subtasks: {
        orderBy: { createdAt: 'asc' }
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profile: { select: { profilePicture: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!task) return null

  // Check access
  const isManager = MANAGER_ROLES.includes(userRole)
  const isAssignee = task.assigneeId === userId
  const isCreator = task.creatorId === userId
  const isReviewer = task.reviewerId === userId
  const sameDepartment = task.department === userDepartment

  if (!isManager && !isAssignee && !isCreator && !isReviewer && !sameDepartment) {
    return null
  }

  return task
}

async function getUsers() {
  return prisma.user.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      department: true,
    },
    orderBy: { firstName: 'asc' },
  })
}

export default async function TaskDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { id } = await params
  const userRole = session.user.role || 'EMPLOYEE'
  const userDepartment = session.user.department || 'WEB'

  const [task, users] = await Promise.all([
    getTask(id, session.user.id, userRole, userDepartment),
    getUsers()
  ])

  if (!task) {
    notFound()
  }

  const isManager = MANAGER_ROLES.includes(userRole) || userDepartment === 'OPERATIONS'

  const serializedTask = {
    ...task,
    dueDate: task.dueDate?.toISOString() || null,
    startDate: task.startDate?.toISOString() || null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    completedAt: task.completedAt?.toISOString() || null,
    timerStartedAt: task.timerStartedAt?.toISOString() || null,
    qaReviewedAt: task.qaReviewedAt?.toISOString() || null,
    subtasks: task.subtasks.map(st => ({
      ...st,
      createdAt: st.createdAt.toISOString(),
      completedAt: st.completedAt?.toISOString() || null,
    })),
    comments: task.comments.map(c => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/tasks" className="hover:text-white transition-colors">
          Tasks
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-white">{task.title.slice(0, 50)}{task.title.length > 50 ? '...' : ''}</span>
      </div>

      <TaskDetailClient
        task={serializedTask}
        users={users}
        currentUserId={session.user.id}
        isManager={isManager}
      />
    </div>
  )
}
