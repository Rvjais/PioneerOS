import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth, isManagerOrAbove } from '@/server/auth/withAuth'
import { getPaginationParams, paginatedResponse, getSortParams } from '@/shared/utils/pagination'
import { createTaskSchema } from '@/shared/validation/validation'
import { notifyTaskAssignment } from '@/server/notifications'

// GET - List all tasks with pagination
export const GET = withAuth(async (req, { user }) => {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const assigneeId = searchParams.get('assigneeId')
  const department = searchParams.get('department')
  const clientId = searchParams.get('clientId')

  // Pagination
  const { skip, take, page, limit } = getPaginationParams(req)
  const { orderBy } = getSortParams(req, 'createdAt', 'desc')

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (priority) where.priority = priority
  if (clientId) where.clientId = clientId

  // RBAC: Filter tasks based on user's role
  const canViewAllTasks = isManagerOrAbove(user)

  if (!canViewAllTasks) {
    if (['FREELANCER', 'INTERN'].includes(user.role)) {
      // Freelancers and interns can only see tasks assigned to them or created by them
      where.OR = [
        { assigneeId: user.id },
        { creatorId: user.id },
      ]
    } else {
      // Other non-admin users can also see tasks in their department
      where.OR = [
        { assigneeId: user.id },
        { creatorId: user.id },
        { department: user.department },
      ]
    }
  } else {
    // Admins can filter by assignee and department
    if (assigneeId) where.assigneeId = assigneeId
    if (department) where.department = department
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take,
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            role: true,
            profile: {
              select: { profilePicture: true }
            }
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: {
              select: { profilePicture: true }
            }
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: {
              select: { profilePicture: true }
            }
          },
        },
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy,
    }),
    prisma.task.count({ where }),
  ])

  // Custom sort order for status field (string sort is not meaningful)
  const { searchParams: sp } = new URL(req.url)
  if (sp.get('sortBy') === 'status') {
    const statusOrder: Record<string, number> = {
      TODO: 1, IN_PROGRESS: 2, REVIEW: 3, REVISION: 4, COMPLETED: 5, CANCELLED: 6,
    }
    const sortDir = (sp.get('sortOrder') || 'desc') === 'asc' ? 1 : -1
    tasks.sort((a, b) => {
      const aOrder = statusOrder[(a as Record<string, unknown>).status as string] ?? 99
      const bOrder = statusOrder[(b as Record<string, unknown>).status as string] ?? 99
      return (aOrder - bOrder) * sortDir
    })
  }

  return NextResponse.json(paginatedResponse(tasks, total, page, limit))
})

// POST - Create new task
export const POST = withAuth(async (req, { user }) => {
  const body = await req.json()

  // Validate request body
  const result = createTaskSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const {
    title,
    description,
    department,
    priority,
    status,
    dueDate,
    startDate,
    assigneeId,
    reviewerId,
    clientId,
    type,
    estimatedHours,
    startTimer,
  } = result.data

  const nowDate = new Date()

  // NOTE: Deadlines are intentionally not enforced — tasks may need to stay open
  // past their deadline for tracking and accountability purposes. Overdue tasks
  // should be surfaced in the UI but not auto-closed.

  // Warn if due date is in the past (allow for backdating but flag it)
  let dueDateWarning: string | null = null
  if (dueDate) {
    const parsedDueDate = new Date(dueDate)
    if (parsedDueDate < nowDate) {
      dueDateWarning = 'Due date is in the past. Task was created but may need attention.'
    }
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      department,
      priority,
      status,
      type,
      dueDate: dueDate ? new Date(dueDate) : null,
      startDate: startTimer ? nowDate : (startDate ? new Date(startDate) : null),
      assigneeId,
      reviewerId,
      clientId,
      creatorId: user.id,
      estimatedHours,
      timerStartedAt: startTimer ? nowDate : undefined,
    },
    include: {
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          department: true,
          role: true,
          profile: {
            select: { profilePicture: true }
          }
        },
      },
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profile: {
            select: { profilePicture: true }
          }
        },
      },
      client: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  // Create notification for assignee
  if (assigneeId && assigneeId !== user.id) {
    await prisma.notification.create({
      data: {
        userId: assigneeId,
        type: 'TASK',
        title: 'New Task Assigned',
        message: `You have been assigned: ${title}`,
        link: `/tasks/${task.id}`,
        priority: priority === 'URGENT' ? 'URGENT' : 'NORMAL',
      },
    })

    // Send WhatsApp/in-app notification via notification service
    const clientName = task.client?.name || 'Internal'
    try {
      await notifyTaskAssignment(assigneeId, title, clientName)
    } catch (notifyError) {
      console.error('Failed to send task assignment notification:', notifyError)
      // Don't fail the request if notification fails
    }
  }

  return NextResponse.json({ task, ...(dueDateWarning ? { warning: dueDateWarning } : {}) }, { status: 201 })
})
