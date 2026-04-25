import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const linkTaskSchema = z.object({
  dailyTaskId: z.string().optional(),
  workEntryId: z.string().optional(),
  contributionWeight: z.number().optional(),
  notes: z.string().optional(),
})

// Link a task to a goal
export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id: goalId } = await routeParams!
    const raw = await req.json()
    const parsed = linkTaskSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { dailyTaskId, workEntryId, contributionWeight = 1, notes } = parsed.data

    // Validate goal exists
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      select: { id: true, title: true, level: true },
    })

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // At least one task type must be provided
    if (!dailyTaskId && !workEntryId) {
      return NextResponse.json(
        { error: 'Either dailyTaskId or workEntryId must be provided' },
        { status: 400 }
      )
    }

    // Validate daily task if provided
    if (dailyTaskId) {
      const task = await prisma.dailyTask.findUnique({
        where: { id: dailyTaskId },
        select: { id: true },
      })

      if (!task) {
        return NextResponse.json({ error: 'Daily task not found' }, { status: 404 })
      }
    }

    // Validate work entry if provided
    if (workEntryId) {
      const entry = await prisma.workEntry.findUnique({
        where: { id: workEntryId },
        select: { id: true },
      })

      if (!entry) {
        return NextResponse.json({ error: 'Work entry not found' }, { status: 404 })
      }
    }

    // Check if link already exists
    const existingLink = await prisma.taskGoalLink.findFirst({
      where: {
        goalId,
        ...(dailyTaskId && { dailyTaskId }),
        ...(workEntryId && { workEntryId }),
      },
    })

    if (existingLink) {
      return NextResponse.json(
        { error: 'This task is already linked to this goal' },
        { status: 400 }
      )
    }

    // Create the link
    const link = await prisma.taskGoalLink.create({
      data: {
        goalId,
        dailyTaskId,
        workEntryId,
        contributionWeight,
        notes,
      },
      include: {
        goal: {
          select: { id: true, title: true, level: true },
        },
        dailyTask: {
          select: { id: true, description: true, status: true },
        },
        workEntry: {
          select: { id: true, description: true, status: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      link: {
        ...link,
        createdAt: link.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to link task to goal:', error)
    return NextResponse.json(
      { error: 'Failed to link task to goal' },
      { status: 500 }
    )
  }
})

// Remove task link from goal
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id: goalId } = await routeParams!
    const { searchParams } = new URL(req.url)
    const linkId = searchParams.get('linkId')

    if (!linkId) {
      return NextResponse.json({ error: 'linkId is required' }, { status: 400 })
    }

    // Verify the link belongs to this goal
    const link = await prisma.taskGoalLink.findFirst({
      where: {
        id: linkId,
        goalId,
      },
    })

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    await prisma.taskGoalLink.delete({
      where: { id: linkId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to unlink task from goal:', error)
    return NextResponse.json(
      { error: 'Failed to unlink task from goal' },
      { status: 500 }
    )
  }
})
