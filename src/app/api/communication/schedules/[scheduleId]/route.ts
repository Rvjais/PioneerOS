import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const patchScheduleSchema = z.object({
  action: z.string().max(50).optional(),
  content: z.string().max(5000).optional(),
  outcome: z.string().max(2000).optional(),
  duration: z.number().min(0).optional(),
  actionItems: z.array(z.unknown()).optional(),
  name: z.string().max(200).optional(),
  type: z.string().max(100).optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'QUARTERLY', 'ONE_TIME']).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  preferredTime: z.string().max(10).optional(),
  templateId: z.string().max(100).optional(),
  status: z.string().max(50).optional(),
  notes: z.string().max(2000).optional(),
  clientId: z.string().max(100).optional(),
})

// Helper to calculate next due date based on frequency
function calculateNextDueDate(frequency: string, dayOfWeek?: number, dayOfMonth?: number, preferredTime?: string): Date {
  const now = new Date()
  let nextDue = new Date()

  if (preferredTime) {
    const [hours, minutes] = preferredTime.split(':').map(Number)
    nextDue.setHours(hours, minutes, 0, 0)
  }

  switch (frequency) {
    case 'DAILY':
      nextDue.setDate(now.getDate() + 1)
      break
    case 'WEEKLY':
      const daysUntil = dayOfWeek !== undefined
        ? (dayOfWeek - now.getDay() + 7) % 7 || 7
        : 7
      nextDue.setDate(now.getDate() + daysUntil)
      break
    case 'BI_WEEKLY':
      nextDue.setDate(now.getDate() + 14)
      break
    case 'MONTHLY':
      nextDue.setMonth(now.getMonth() + 1)
      if (dayOfMonth) {
        nextDue.setDate(Math.min(dayOfMonth, new Date(nextDue.getFullYear(), nextDue.getMonth() + 1, 0).getDate()))
      }
      break
    case 'QUARTERLY':
      nextDue.setMonth(now.getMonth() + 3)
      break
    default:
      nextDue.setDate(now.getDate() + 7)
  }

  return nextDue
}

// GET - Get a single schedule with logs
export const GET = withAuth(async (req, { user, params: routeParams }) => {

  const { scheduleId } = await routeParams!

  try {
    const schedule = await prisma.communicationSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        client: { select: { id: true, name: true, tier: true, contactName: true, contactEmail: true, contactPhone: true } },
        template: true,
        logs: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Failed to fetch schedule:', error)
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 })
  }
})

// PATCH - Update or mark as completed
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {

  const { scheduleId } = await routeParams!

  try {
    const body = await req.json()
    const parsed = patchScheduleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { action } = parsed.data

    // If action is "complete", log the communication and update schedule
    if (action === 'complete') {
      const { content, outcome, duration, actionItems } = parsed.data

      const schedule = await prisma.communicationSchedule.findUnique({
        where: { id: scheduleId },
      })

      if (!schedule) {
        return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
      }

      // Create communication log
      await prisma.communicationLog.create({
        data: {
          clientId: schedule.clientId,
          userId: user.id,
          scheduleId,
          type: schedule.type,
          subject: schedule.name,
          content: content || 'Completed as scheduled',
          outcome,
          duration,
          actionItems: actionItems ? JSON.stringify(actionItems) : null,
        },
      })

      // Update schedule with next due date
      const nextDueAt = schedule.frequency === 'ONE_TIME'
        ? null
        : calculateNextDueDate(schedule.frequency, schedule.dayOfWeek ?? undefined, schedule.dayOfMonth ?? undefined, schedule.preferredTime ?? undefined)

      const updated = await prisma.communicationSchedule.update({
        where: { id: scheduleId },
        data: {
          lastSentAt: new Date(),
          nextDueAt,
          completedCount: { increment: 1 },
          status: schedule.frequency === 'ONE_TIME' ? 'COMPLETED' : 'ACTIVE',
        },
        include: {
          client: { select: { id: true, name: true } },
        },
      })

      return NextResponse.json(updated)
    }

    // Regular update - whitelist allowed fields to prevent mass assignment
    const { name, type, frequency, dayOfWeek, dayOfMonth, preferredTime,
            templateId, status: scheduleStatus, notes: scheduleNotes, clientId } = parsed.data
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (type !== undefined) updateData.type = type
    if (frequency !== undefined) updateData.frequency = frequency
    if (dayOfWeek !== undefined) updateData.dayOfWeek = dayOfWeek
    if (dayOfMonth !== undefined) updateData.dayOfMonth = dayOfMonth
    if (preferredTime !== undefined) updateData.preferredTime = preferredTime
    if (templateId !== undefined) updateData.templateId = templateId
    if (scheduleStatus !== undefined) updateData.status = scheduleStatus
    if (scheduleNotes !== undefined) updateData.notes = scheduleNotes
    if (clientId !== undefined) updateData.clientId = clientId

    const updated = await prisma.communicationSchedule.update({
      where: { id: scheduleId },
      data: updateData,
      include: {
        client: { select: { id: true, name: true } },
        template: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update schedule:', error)
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 })
  }
})

// DELETE - Remove a schedule
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  if (!['SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { scheduleId } = await routeParams!

  try {
    await prisma.communicationSchedule.delete({
      where: { id: scheduleId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete schedule:', error)
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 })
  }
})
