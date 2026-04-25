import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createLearningLogSchema = z.object({
  resourceUrl: z.string().min(1),
  resourceTitle: z.string().min(1),
  topic: z.string().optional(),
  minutesWatched: z.union([z.string(), z.number()]),
  notes: z.string().optional(),
})

// GET - Get learning logs for the current user
export const GET = withAuth(async (req, { user, params }) => {
    try {
        const logs = await prisma.learningLog.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        })

        // Calculate totals
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const thisMonthLogs = logs.filter(l => new Date(l.createdAt) >= monthStart)
        const thisMonthMinutes = thisMonthLogs.reduce((sum, l) => sum + l.minutesWatched, 0)
        const totalMinutes = logs.reduce((sum, l) => sum + l.minutesWatched, 0)

        return NextResponse.json({
            logs,
            thisMonthMinutes,
            totalMinutes,
            thisMonthHours: Math.round((thisMonthMinutes / 60) * 10) / 10,
            totalHours: Math.round((totalMinutes / 60) * 10) / 10,
        })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
})

// POST - Add a learning log entry
export const POST = withAuth(async (req, { user, params }) => {
    try {
        const raw = await req.json()
        const parsed = createLearningLogSchema.safeParse(raw)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
        }
        const { resourceUrl, resourceTitle, topic, minutesWatched, notes } = parsed.data

        const mins = parseFloat(String(minutesWatched))
        if (isNaN(mins) || mins < 1 || mins > 480) {
            return NextResponse.json({ error: 'Minutes must be between 1 and 480' }, { status: 400 })
        }

        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        const log = await prisma.learningLog.create({
            data: {
                userId: user.id,
                month: monthStart,
                resourceUrl,
                resourceTitle,
                topic: topic || null,
                minutesWatched: parseInt(String(minutesWatched)),
                notes,
            },
        })

        // Check if appraisal date needs pushing
        // Get all logs for this month
        const monthLogs = await prisma.learningLog.findMany({
            where: {
                userId: user.id,
                month: monthStart,
            },
        })
        const monthTotal = monthLogs.reduce((sum, l) => sum + l.minutesWatched, 0)

        return NextResponse.json({
            log,
            thisMonthMinutes: monthTotal,
            thisMonthHours: Math.round((monthTotal / 60) * 10) / 10,
            isCompliant: monthTotal >= 360, // 6 hours minimum
        }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
})

// PATCH - Update a learning log entry
export const PATCH = withAuth(async (req, { user, params }) => {
    try {
        const body = await req.json()
        const { logId, resourceUrl, resourceTitle, topic, minutesWatched, notes } = body

        if (!logId) {
            return NextResponse.json({ error: 'Log ID is required' }, { status: 400 })
        }

        // Verify ownership
        const existingLog = await prisma.learningLog.findUnique({
            where: { id: logId },
        })

        if (!existingLog) {
            return NextResponse.json({ error: 'Log not found' }, { status: 404 })
        }

        if (existingLog.userId !== user.id && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Prevent editing verified/evaluated logs
        if (existingLog.verificationId) {
            const verification = await prisma.learningVerification.findFirst({
                where: { id: existingLog.verificationId, status: 'EVALUATED' },
            })
            if (verification) {
                return NextResponse.json({ error: 'Cannot edit verified log' }, { status: 400 })
            }
        }

        const data: Record<string, unknown> = {}
        if (resourceUrl !== undefined) data.resourceUrl = resourceUrl
        if (resourceTitle !== undefined) data.resourceTitle = resourceTitle
        if (topic !== undefined) data.topic = topic
        if (minutesWatched !== undefined) {
            const mins = parseInt(minutesWatched)
            if (isNaN(mins) || mins < 1 || mins > 480) {
                return NextResponse.json({ error: 'Minutes must be between 1 and 480' }, { status: 400 })
            }
            data.minutesWatched = mins
        }
        if (notes !== undefined) data.notes = notes

        const log = await prisma.learningLog.update({
            where: { id: logId },
            data,
        })

        return NextResponse.json({ log })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
})

// DELETE - Delete a learning log entry
export const DELETE = withAuth(async (req, { user, params }) => {
    try {
        const { searchParams } = new URL(req.url)
        const logId = searchParams.get('logId')

        if (!logId) {
            return NextResponse.json({ error: 'Log ID is required' }, { status: 400 })
        }

        // Verify ownership
        const existingLog = await prisma.learningLog.findUnique({
            where: { id: logId },
        })

        if (!existingLog) {
            return NextResponse.json({ error: 'Log not found' }, { status: 404 })
        }

        if (existingLog.userId !== user.id && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await prisma.learningLog.delete({
            where: { id: logId },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
})
