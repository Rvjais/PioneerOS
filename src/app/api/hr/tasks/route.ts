import { NextRequest, NextResponse } from 'next/server'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createHrTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.string().optional(),
  dueDate: z.string().optional(),
})

const updateHrTaskSchema = z.object({
  taskId: z.string().min(1),
  status: z.string().min(1),
})

const HR_ROLES = ['SUPER_ADMIN', 'MANAGER', 'HR']

export const GET = withAuth(async (req, { user, params }) => {
  try {
const userRole = (user as any).role
    const userDept = (user as any).department
    if (!HR_ROLES.includes(userRole) && userDept !== 'HR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch tasks assigned to the current user in HR department
    const tasks = await prisma.task.findMany({
      where: {
        department: 'HR',
        OR: [
          { assigneeId: user.id },
          { creatorId: user.id },
        ],
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
        assignee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    })

    // Also fetch pending leave requests that need approval
    const pendingLeaves = await prisma.leaveRequest.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Fetch pending interview schedules
    const upcomingInterviews = await prisma.interview.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          gte: new Date(),
        },
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
      take: 10,
    })

    // Transform all data into a unified task format
    const formattedTasks = [
      // Regular tasks
      ...tasks.map(task => ({
        id: task.id,
        title: task.title,
        taskType: 'OTHER',
        description: task.description,
        dueDate: task.dueDate?.toISOString() || new Date().toISOString(),
        priority: task.priority,
        status: task.status === 'COMPLETED' ? 'DONE' : 'TODO',
        completedAt: task.completedAt?.toISOString() || null,
        createdAt: task.createdAt.toISOString(),
        relatedTo: task.client ? {
          type: 'EMPLOYEE' as const,
          name: task.client.name,
          id: task.clientId!,
        } : null,
      })),

      // Leave approvals as tasks
      ...pendingLeaves.map(leave => ({
        id: `leave-${leave.id}`,
        title: `Review leave request - ${leave.user.firstName}`,
        taskType: 'LEAVE_APPROVAL',
        description: `${leave.type} leave: ${formatDateDDMMYYYY(leave.startDate)} - ${formatDateDDMMYYYY(leave.endDate)}`,
        dueDate: new Date().toISOString(),
        priority: 'MEDIUM',
        status: 'TODO',
        completedAt: null,
        createdAt: leave.createdAt.toISOString(),
        relatedTo: {
          type: 'LEAVE' as const,
          name: `${leave.user.firstName} ${leave.user.lastName || ''}`,
          id: leave.id,
        },
      })),

      // Interview tasks
      ...upcomingInterviews.map(interview => ({
        id: `interview-${interview.id}`,
        title: `Interview - ${interview.candidate?.name || 'Candidate'}`,
        taskType: 'INTERVIEW',
        description: `${interview.stage} - ${interview.candidate?.position || 'Position'}`,
        dueDate: interview.scheduledAt.toISOString(),
        priority: 'HIGH',
        status: 'TODO',
        completedAt: null,
        createdAt: interview.createdAt.toISOString(),
        relatedTo: {
          type: 'CANDIDATE' as const,
          name: interview.candidate?.name || 'Candidate',
          id: interview.candidateId,
        },
      })),
    ]

    return NextResponse.json({ tasks: formattedTasks })
  } catch (error) {
    console.error('Failed to fetch HR tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = withAuth(async (req, { user, params }) => {
  try {
const userRole = (user as any).role
    const userDept = (user as any).department
    if (!HR_ROLES.includes(userRole) && userDept !== 'HR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const raw = await req.json()
    const parsed = createHrTaskSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const data = parsed.data

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        department: 'HR',
        priority: data.priority || 'MEDIUM',
        status: 'TODO',
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
        creatorId: user.id,
        assigneeId: user.id,
      },
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Failed to create HR task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const PATCH = withAuth(async (req, { user, params }) => {
  try {
const userRole = (user as any).role
    const userDept = (user as any).department
    if (!HR_ROLES.includes(userRole) && userDept !== 'HR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const raw = await req.json()
    const parsed = updateHrTaskSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { taskId, status } = parsed.data

    // Verify ownership or HR role before allowing update
    const existingTask = await prisma.task.findUnique({ where: { id: taskId } })
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    if (existingTask.assigneeId !== user.id && existingTask.creatorId !== user.id && !HR_ROLES.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: status === 'DONE' ? 'COMPLETED' : 'TODO',
        completedAt: status === 'DONE' ? new Date() : null,
      },
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Failed to update HR task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
