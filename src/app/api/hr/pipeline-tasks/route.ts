import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createPipelineTaskSchema = z.object({
  taskType: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  candidateName: z.string().optional(),
  employeeName: z.string().optional(),
  candidateId: z.string().optional(),
  employeeId: z.string().optional(),
  startDate: z.string().optional(),
  duration: z.number().optional(),
  dependencies: z.array(z.string()).optional(),
  status: z.string().optional(),
})

// GET /api/hr/pipeline-tasks - Get all HR pipeline tasks for the user
export const GET = withAuth(async (req, { user, params }) => {
  try {
const isHR = user.department === 'HR' || ['SUPER_ADMIN', 'MANAGER'].includes(user.role)

    const tasks = await prisma.hRPipelineTask.findMany({
      where: isHR ? {} : { userId: user.id },
      orderBy: [
        { startDate: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    // Serialize dates
    const serializedTasks = tasks.map(task => ({
      ...task,
      startDate: task.startDate.toISOString(),
      endDate: task.endDate?.toISOString() || null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }))

    return NextResponse.json({ tasks: serializedTasks })
  } catch (error) {
    console.error('Failed to fetch HR pipeline tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
})

// POST /api/hr/pipeline-tasks - Create a new HR pipeline task
export const POST = withAuth(async (req, { user, params }) => {
  try {
// Only HR or managers can create pipeline tasks
    const isAuthorized = user.department === 'HR' || ['SUPER_ADMIN', 'MANAGER'].includes(user.role)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const raw = await req.json()
    const parsed = createPipelineTaskSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const {
      taskType,
      title,
      description,
      candidateName,
      employeeName,
      candidateId,
      employeeId,
      startDate,
      duration,
      dependencies,
      status = 'PLANNED',
    } = parsed.data

    // Calculate end date based on duration
    const start = new Date(startDate || new Date())
    const end = new Date(start)
    end.setDate(end.getDate() + (duration || 1))

    const task = await prisma.hRPipelineTask.create({
      data: {
        userId: user.id,
        taskType,
        title,
        description,
        candidateId,
        employeeId,
        startDate: start,
        endDate: end,
        duration: duration || 1,
        dependencies: dependencies ? JSON.stringify(dependencies) : null,
        status,
        progress: 0,
      },
    })

    // Add candidateName/employeeName to the response
    const serializedTask = {
      ...task,
      candidateName,
      employeeName,
      startDate: task.startDate.toISOString(),
      endDate: task.endDate?.toISOString() || null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }

    return NextResponse.json({ task: serializedTask }, { status: 201 })
  } catch (error) {
    console.error('Failed to create HR pipeline task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
})
