import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { z } from 'zod'

const updateDailyTaskSchema = z.object({
  startTime: z.string().max(50).optional(),
  endTime: z.string().max(50).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  reportedToManager: z.boolean().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await params
    const body = await req.json()
    const parsed = updateDailyTaskSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Calculate duration if ending task
    let actualHours: number | undefined
    if (parsed.data.endTime && parsed.data.status === 'completed') {
      const task = await prisma.dailyTask.findUnique({
        where: { id: taskId }
      })
      if (task?.actualStartTime) {
        const start = new Date(task.actualStartTime)
        const end = new Date(parsed.data.endTime!)
        actualHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60) // hours
      }
    }

    const validData = parsed.data
    const updatedTask = await prisma.dailyTask.update({
      where: { id: taskId },
      data: {
        ...(validData.startTime && { actualStartTime: new Date(validData.startTime) }),
        ...(validData.endTime && { actualEndTime: new Date(validData.endTime) }),
        ...(validData.status && { status: validData.status === 'completed' ? 'COMPLETED' : validData.status === 'in_progress' ? 'IN_PROGRESS' : 'PENDING' }),
        ...(typeof validData.reportedToManager === 'boolean' && { reportedToManager: validData.reportedToManager }),
        ...(actualHours !== undefined && { actualHours })
      }
    })

    return NextResponse.json({
      success: true,
      task: {
        id: updatedTask.id,
        status: updatedTask.status === 'COMPLETED' ? 'completed' :
                updatedTask.actualStartTime && !updatedTask.actualEndTime ? 'in_progress' : 'pending',
        startTime: updatedTask.actualStartTime?.toISOString() || null,
        endTime: updatedTask.actualEndTime?.toISOString() || null,
        duration: updatedTask.actualHours ? Math.round(updatedTask.actualHours * 60) : null,
        reportedToManager: updatedTask.reportedToManager
      }
    })
  } catch (error) {
    console.error('Error updating daily task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
