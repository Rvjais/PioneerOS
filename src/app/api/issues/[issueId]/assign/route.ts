import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const assignIssueSchema = z.object({
  assignedToId: z.string().min(1, 'assignedToId is required').max(100),
})

type RouteParams = {
  params: Promise<{ issueId: string }>
}

// POST - Assign issue to team member
export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { issueId } = await routeParams!
    const body = await req.json()
    const parsed = assignIssueSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { assignedToId } = parsed.data

    const existingIssue = await prisma.supportTicket.findUnique({
      where: { id: issueId },
      include: {
        assignedTo: {
          select: { firstName: true, lastName: true },
        },
      },
    })

    if (!existingIssue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Get the new assignee's name
    const newAssignee = await prisma.user.findUnique({
      where: { id: assignedToId },
      select: { firstName: true, lastName: true },
    })

    if (!newAssignee) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const issue = await prisma.supportTicket.update({
      where: { id: issueId },
      data: { assignedToId },
      include: {
        client: {
          select: { id: true, name: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    // Log assignment change
    const oldAssigneeName = existingIssue.assignedTo
      ? `${existingIssue.assignedTo.firstName} ${existingIssue.assignedTo.lastName}`
      : 'Unassigned'
    const newAssigneeName = `${newAssignee.firstName} ${newAssignee.lastName}`

    await prisma.ticketActivity.create({
      data: {
        ticketId: issueId,
        type: 'ASSIGNMENT',
        description: `Reassigned from ${oldAssigneeName} to ${newAssigneeName}`,
        userId: user.id,
        metadata: JSON.stringify({
          oldAssignee: existingIssue.assignedToId,
          newAssignee: assignedToId,
        }),
      },
    })

    return NextResponse.json({ issue })
  } catch (error) {
    console.error('Error assigning issue:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
