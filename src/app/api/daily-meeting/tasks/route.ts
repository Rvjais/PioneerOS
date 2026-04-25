import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

// Exclude FREELANCER and INTERN from daily meeting task access
const MEETING_TASK_ROLES = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'OM', 'EMPLOYEE', 'SALES', 'ACCOUNTS', 'HR']

const createDailyTaskSchema = z.object({
  activity: z.string().min(1).max(200),
  company: z.string().max(200).optional(),
  client: z.string().max(100).optional().nullable(),
  description: z.string().max(2000).optional(),
  date: z.string().max(50).optional(),
})

export const GET = withAuth(async (req, { user }) => {
  try {

    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Find or create the daily plan for this date
    let plan = await prisma.dailyTaskPlan.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        tasks: {
          include: {
            client: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!plan) {
      return NextResponse.json({ tasks: [] })
    }

    // Transform to expected format
    const formattedTasks = plan.tasks.map(task => ({
      id: task.id,
      activity: task.activityType,
      company: task.company || 'Branding Pioneers',
      client: task.client?.name || task.clientId,
      description: task.description,
      startTime: task.actualStartTime?.toISOString() || null,
      endTime: task.actualEndTime?.toISOString() || null,
      status: task.status === 'COMPLETED' ? 'completed' :
              task.actualStartTime && !task.actualEndTime ? 'in_progress' : 'pending',
      reportedToManager: task.reportedToManager || false,
      duration: task.actualHours ? Math.round(task.actualHours * 60) : undefined,
      createdAt: task.createdAt.toISOString()
    }))

    return NextResponse.json({ tasks: formattedTasks })
  } catch (error) {
    console.error('Error fetching daily tasks:', error)
    return NextResponse.json({ tasks: [] })
  }
}, { roles: MEETING_TASK_ROLES })

export const POST = withAuth(async (req, { user }) => {
  try {

    const body = await req.json()
    const parsed = createDailyTaskSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { activity, company, client, description, date } = parsed.data

    const taskDate = date ? new Date(date) : new Date()
    const startOfDay = new Date(taskDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(taskDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Find or create daily plan
    let plan = await prisma.dailyTaskPlan.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    if (!plan) {
      plan = await prisma.dailyTaskPlan.create({
        data: {
          userId: user.id,
          date: startOfDay,
          status: 'DRAFT'
        }
      })
    }

    const task = await prisma.dailyTask.create({
      data: {
        planId: plan.id,
        activityType: activity,
        company: company,
        description: description || activity,
        clientId: client || null,
        status: 'PENDING',
        priority: 'MEDIUM'
      }
    })

    return NextResponse.json({
      success: true,
      task: {
        id: task.id,
        activity: task.activityType,
        company: task.company,
        client: client,
        description: task.description,
        startTime: null,
        endTime: null,
        status: 'pending',
        reportedToManager: false,
        duration: null,
        createdAt: task.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error creating daily task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}, { roles: MEETING_TASK_ROLES })
