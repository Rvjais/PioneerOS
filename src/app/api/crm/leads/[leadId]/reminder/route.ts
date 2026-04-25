import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createReminderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  notes: z.string().max(2000).optional().nullable(),
  scheduledAt: z.string().min(1, 'Scheduled date is required'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().optional().nullable(),
  updateNextFollowUp: z.boolean().optional(),
})

export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { leadId } = await routeParams!

    const reminders = await prisma.followUpReminder.findMany({
      where: { leadId },
      include: { user: true },
      orderBy: { scheduledAt: 'asc' },
    })

    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Failed to fetch reminders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { leadId } = await routeParams!
    const body = await req.json()
    const parsed = createReminderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const { title, notes, scheduledAt, priority, assigneeId, updateNextFollowUp } = parsed.data

    // Create the reminder
    const reminder = await prisma.followUpReminder.create({
      data: {
        leadId,
        userId: assigneeId || user.id,
        title,
        notes,
        scheduledAt: new Date(scheduledAt),
        priority: priority || 'NORMAL',
      },
    })

    // Update lead's next follow-up if requested
    if (updateNextFollowUp) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { nextFollowUp: new Date(scheduledAt) },
      })
    }

    // Log the activity
    await prisma.leadActivity.create({
      data: {
        leadId,
        userId: user.id,
        type: 'NOTE',
        title: `Follow-up scheduled: ${title}`,
        description: `Scheduled for ${new Date(scheduledAt).toLocaleString('en-IN')}`,
      },
    })

    // Create notification for the assignee
    if (assigneeId && assigneeId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          type: 'GENERAL',
          title: 'Follow-up Assigned',
          message: `You have been assigned a follow-up: ${title}`,
          link: `/sales/leads/${leadId}`,
          priority: priority === 'URGENT' ? 'URGENT' : priority === 'HIGH' ? 'HIGH' : 'NORMAL',
        },
      })
    }

    return NextResponse.json(reminder, { status: 201 })
  } catch (error) {
    console.error('Failed to create reminder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
