import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async (req, { user, params }) => {
    try {
        const searchParams = req.nextUrl.searchParams
        const userIdQuery = searchParams.get('userId')

        // Only allow managers/admins to fetch other users' stats
        const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user.role)
        const targetUserId = (isManager && userIdQuery) ? userIdQuery : user.id

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date()
        endOfDay.setHours(23, 59, 59, 999)

        // Find tasks completed or rolled over TODAY
        const tasksToday = await prisma.task.findMany({
            where: {
                assigneeId: targetUserId,
                OR: [
                    {
                        // Tasks completed today
                        completedAt: {
                            gte: startOfDay,
                            lte: endOfDay
                        }
                    },
                    {
                        // Tasks that were marked as breakdown today
                        updatedAt: {
                            gte: startOfDay,
                            lte: endOfDay
                        },
                        taskOutcome: 'BREAKDOWN'
                    }
                ]
            },
            select: {
                taskOutcome: true,
                timeSpent: true
            }
        })

        let breakthroughs = 0
        let breakdowns = 0
        let totalTimeSpent = 0

        tasksToday.forEach((task: { taskOutcome: string, timeSpent: number }) => {
            if (task.taskOutcome === 'BREAKTHROUGH') breakthroughs++
            if (task.taskOutcome === 'BREAKDOWN') breakdowns++
            totalTimeSpent += (task.timeSpent || 0)
        })

        return NextResponse.json({
            breakthroughs,
            breakdowns,
            totalTimeSpent
        })
    } catch (error) {
        console.error('Error fetching daily report:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
})
