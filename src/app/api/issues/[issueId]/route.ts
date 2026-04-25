import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const updateIssueSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(10000).optional(),
})

type RouteParams = {
  params: Promise<{ issueId: string }>
}

// GET - Get single issue
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { issueId } = await routeParams!

    const issue = await prisma.supportTicket.findUnique({
      where: { id: issueId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    return NextResponse.json({ issue })
  } catch (error) {
    console.error('Error fetching issue:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PATCH - Update issue
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { issueId } = await routeParams!
    const body = await req.json()
    const parsed = updateIssueSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { status, priority, title, description } = parsed.data

    const existingIssue = await prisma.supportTicket.findUnique({
      where: { id: issueId },
    })

    if (!existingIssue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (title) updateData.title = title
    if (description) updateData.description = description

    const issue = await prisma.supportTicket.update({
      where: { id: issueId },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Log status change
    if (status && status !== existingIssue.status) {
      await prisma.ticketActivity.create({
        data: {
          ticketId: issueId,
          type: 'STATUS_CHANGE',
          description: `Status changed from ${existingIssue.status} to ${status}`,
          userId: user.id,
          metadata: JSON.stringify({
            oldStatus: existingIssue.status,
            newStatus: status,
          }),
        },
      })
    }

    return NextResponse.json({ issue })
  } catch (error) {
    console.error('Error updating issue:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
