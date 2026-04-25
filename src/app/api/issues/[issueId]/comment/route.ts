import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const commentSchema = z.object({
  comment: z.string().min(1, 'Comment is required').max(5000),
})

type RouteParams = {
  params: Promise<{ issueId: string }>
}

// POST - Add comment to issue
export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { issueId } = await routeParams!
    const body = await req.json()
    const parsed = commentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { comment } = parsed.data

    const issue = await prisma.supportTicket.findUnique({
      where: { id: issueId },
    })

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    const activity = await prisma.ticketActivity.create({
      data: {
        ticketId: issueId,
        type: 'COMMENT',
        description: 'Added a comment',
        userId: user.id,
        metadata: JSON.stringify({ comment: comment.trim() }),
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    return NextResponse.json({ activity }, { status: 201 })
  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
