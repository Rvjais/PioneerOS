import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await params
    const body = await req.json()
    const patchSchema = z.object({
      status: z.string().max(50).optional(),
      title: z.string().max(500).optional(),
      taskType: z.string().max(50).optional(),
      priority: z.string().max(20).optional(),
      description: z.string().max(2000).optional(),
    })
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['status', 'title', 'taskType', 'priority', 'description']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (body.status === 'DONE') {
      updateData.completedAt = new Date()
    }

    const task = await prisma.salesDailyTask.update({
      where: { id: taskId },
      data: updateData,
      include: {
        lead: {
          select: { id: true, companyName: true }
        },
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to update daily task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await params

    await prisma.salesDailyTask.delete({
      where: { id: taskId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete daily task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
