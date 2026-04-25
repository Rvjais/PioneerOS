import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const timerActionSchema = z.object({
  action: z.enum(['START', 'STOP', 'PAUSE']),
  breakdownReason: z.string().max(1000).optional().nullable(),
  proofUrl: z.string().url('Invalid proof URL').max(2000).optional().nullable(),
})

type RouteParams = {
    params: Promise<{ taskId: string }>
}

export const POST = withAuth(async (req, { user, params: routeParams }) => {
    try {

        const { taskId } = await routeParams!
        const body = await req.json()
        const parsed = timerActionSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
        }
        const { action, breakdownReason, proofUrl } = parsed.data

        const existingTask = await prisma.task.findUnique({
            where: { id: taskId },
        })

        if (!existingTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        // Only allow assignee, creator, manager, or admin to modify the timer
        const isAuthorized =
            existingTask.assigneeId === user.id ||
            existingTask.creatorId === user.id ||
            ['SUPER_ADMIN', 'MANAGER'].includes(user.role)

        if (!isAuthorized) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
        }

        const now = new Date()

        if (action === 'START') {
            // If already started, do nothing
            if (existingTask.timerStartedAt) {
                return NextResponse.json({ error: 'Timer already running' }, { status: 400 })
            }

            const updatedTask = await prisma.task.update({
                where: { id: taskId },
                data: {
                    timerStartedAt: now,
                    status: existingTask.status === 'TODO' ? 'IN_PROGRESS' : existingTask.status,
                    // Set start date if not already set
                    startDate: existingTask.startDate || now,
                },
            })
            return NextResponse.json({ task: updatedTask })
        }

        if (action === 'STOP') {
            if (!existingTask.timerStartedAt) {
                return NextResponse.json({ error: 'Timer is not running' }, { status: 400 })
            }

            if (existingTask.status !== 'IN_PROGRESS') {
                return NextResponse.json({ error: 'Task must be IN_PROGRESS to complete via timer stop' }, { status: 400 })
            }

            if (!proofUrl) {
                return NextResponse.json({ error: 'Proof URL is required to close a task' }, { status: 400 })
            }

            // Calculate minutes spent (cap at 16 hours = 960 minutes per session)
            const diffMs = now.getTime() - new Date(existingTask.timerStartedAt).getTime()
            const MAX_SESSION_MINUTES = 16 * 60 // 16 hours
            let newMinutes = Math.floor(diffMs / 60000)
            let timerNote: string | null = null
            if (newMinutes > MAX_SESSION_MINUTES) {
              timerNote = `Timer session capped at 16 hours (actual elapsed: ${Math.floor(newMinutes / 60)}h ${newMinutes % 60}m)`
              newMinutes = MAX_SESSION_MINUTES
            }
            const totalTimeSpent = (existingTask.timeSpent || 0) + newMinutes

            // Determine Breakthrough (same-day completion) or Breakdown (rolled over without completion / not completed today)
            let taskOutcome = 'PENDING'
            const startDate = new Date(existingTask.startDate || existingTask.createdAt)

            const isSameDay =
                startDate.getFullYear() === now.getFullYear() &&
                startDate.getMonth() === now.getMonth() &&
                startDate.getDate() === now.getDate()

            if (isSameDay) {
                taskOutcome = 'BREAKTHROUGH'
            } else {
                taskOutcome = 'BREAKDOWN'
                if (!breakdownReason) {
                    return NextResponse.json({ error: 'Breakdown reason is required for tasks not completed on the same day' }, { status: 400 })
                }
            }

            const updatedTask = await prisma.task.update({
                where: { id: taskId },
                data: {
                    timerStartedAt: null,
                    timeSpent: totalTimeSpent,
                    status: 'COMPLETED',
                    completedAt: now,
                    taskOutcome,
                    breakdownReason: taskOutcome === 'BREAKDOWN' ? breakdownReason : null,
                    proofUrl,
                    ...(timerNote ? { notes: timerNote } : {}),
                },
            })
            return NextResponse.json({ task: updatedTask })
        }

        if (action === 'PAUSE') {
            if (!existingTask.timerStartedAt) {
                return NextResponse.json({ error: 'Timer is not running' }, { status: 400 })
            }

            // Calculate minutes spent (cap at 16 hours = 960 minutes per session)
            const diffMs = now.getTime() - new Date(existingTask.timerStartedAt).getTime()
            const MAX_SESSION_MINUTES = 16 * 60
            let newMinutes = Math.floor(diffMs / 60000)
            if (newMinutes > MAX_SESSION_MINUTES) {
              newMinutes = MAX_SESSION_MINUTES
            }
            const totalTimeSpent = (existingTask.timeSpent || 0) + newMinutes

            const updatedTask = await prisma.task.update({
                where: { id: taskId },
                data: {
                    timerStartedAt: null,
                    timeSpent: totalTimeSpent,
                    // Keep status as IN_PROGRESS (do not mark COMPLETED)
                },
            })
            return NextResponse.json({ task: updatedTask })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error) {
        console.error('Error handling timer:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
})
