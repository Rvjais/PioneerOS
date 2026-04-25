import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const SALES_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SALES', 'OPERATIONS_HEAD']

export const GET = withAuth(async (req, { user }) => {
  try {

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const tasks = await prisma.salesDailyTask.findMany({
      where: {
        userId: user.id,
        dueDate: { gte: startOfToday },
      },
      include: {
        lead: {
          select: { id: true, companyName: true }
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Failed to fetch daily tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}, { roles: SALES_ROLES })

export const POST = withAuth(async (req, { user }) => {
  try {

    const body = await req.json()
    const schema = z.object({
      title: z.string().min(1).max(500),
      taskType: z.string().max(50).optional(),
      description: z.string().max(2000).optional(),
      dueDate: z.string().optional(),
      priority: z.string().max(20).optional(),
      leadId: z.string().min(1).optional(),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const {
      title,
      taskType,
      description,
      dueDate,
      priority,
      leadId,
    } = result.data

    const task = await prisma.salesDailyTask.create({
      data: {
        userId: user.id,
        leadId: leadId || null,
        taskType: taskType || 'OTHER',
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        priority: priority || 'MEDIUM',
        status: 'TODO',
      },
      include: {
        lead: {
          select: { id: true, companyName: true }
        },
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to create daily task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}, { roles: SALES_ROLES })
