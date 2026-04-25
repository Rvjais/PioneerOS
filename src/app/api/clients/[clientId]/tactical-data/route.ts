import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import prisma from '@/server/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clientId } = await params

    // Get daily tasks for this client
    const dailyTasks = await prisma.dailyTask.findMany({
      where: { clientId },
      include: {
        plan: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, department: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Format the data for the frontend
    const tacticalData = dailyTasks.map(task => ({
      id: task.id,
      date: task.addedAt.toISOString(),
      userId: task.plan.user.id,
      userName: `${task.plan.user.firstName} ${task.plan.user.lastName || ''}`.trim(),
      department: task.plan.user.department || 'General',
      activityType: task.activityType || 'Task',
      description: task.description,
      status: task.status,
      hours: task.actualHours || task.plannedHours || 0
    }))

    return NextResponse.json(tacticalData)
  } catch (error) {
    console.error('Error fetching tactical data:', error)
    return NextResponse.json({ error: 'Failed to fetch tactical data' }, { status: 500 })
  }
}
