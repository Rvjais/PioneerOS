import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createScheduleSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required').max(100),
  templateId: z.string().max(100).optional().nullable(),
  name: z.string().min(1, 'Name is required').max(200),
  type: z.string().min(1, 'Type is required').max(100),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'QUARTERLY', 'ONE_TIME']),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  preferredTime: z.string().max(10).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  assignedToId: z.string().max(100).optional().nullable(),
})

// Helper to calculate next due date based on frequency
function calculateNextDueDate(frequency: string, dayOfWeek?: number, dayOfMonth?: number, preferredTime?: string | null): Date {
  const now = new Date()
  let nextDue = new Date()

  // Set preferred time if provided
  if (preferredTime && typeof preferredTime === 'string') {
    const [hours, minutes] = preferredTime.split(':').map(Number)
    if (!isNaN(hours) && !isNaN(minutes)) {
      nextDue.setHours(hours, minutes, 0, 0)
    }
  }

  switch (frequency) {
    case 'DAILY':
      nextDue.setDate(now.getDate() + 1)
      break
    case 'WEEKLY':
      // Find next occurrence of dayOfWeek (0 = Sunday)
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
    case 'ONE_TIME':
      // For one-time, return the same date
      break
    default:
      nextDue.setDate(now.getDate() + 7)
  }

  return nextDue
}

// GET - List schedules (optionally filtered by client)
export const GET = withAuth(async (req, { user, params }) => {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const status = searchParams.get('status')
  const overdue = searchParams.get('overdue')

  try {
    const whereClause: Record<string, unknown> = {}
    if (clientId) whereClause.clientId = clientId
    if (status) whereClause.status = status
    if (overdue === 'true') {
      whereClause.nextDueAt = { lt: new Date() }
      whereClause.status = 'ACTIVE'
    }

    const schedules = await prisma.communicationSchedule.findMany({
      where: whereClause,
      include: {
        client: { select: { id: true, name: true, tier: true } },
        template: { select: { id: true, name: true, subject: true } },
        _count: { select: { logs: true } },
      },
      orderBy: [{ nextDueAt: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Failed to fetch schedules:', error)
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
  }
})

// POST - Create a new schedule
export const POST = withAuth(async (req, { user, params }) => {
  try {
    const body = await req.json()
    const parsed = createScheduleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { clientId, templateId, name, type, frequency, dayOfWeek, dayOfMonth, preferredTime, description, assignedToId } = parsed.data

    const nextDueAt = calculateNextDueDate(frequency, dayOfWeek, dayOfMonth, preferredTime ?? undefined)

    const schedule = await prisma.communicationSchedule.create({
      data: {
        clientId,
        templateId,
        name,
        type,
        frequency,
        dayOfWeek,
        dayOfMonth,
        preferredTime,
        description,
        assignedToId,
        nextDueAt,
      },
      include: {
        client: { select: { id: true, name: true } },
        template: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Failed to create schedule:', error)
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 })
  }
})
