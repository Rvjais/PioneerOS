import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { z } from 'zod'

const createCommentSchema = z.object({
  resourceId: z.string().min(1),
  content: z.string().min(1),
  rating: z.union([z.string(), z.number()]).optional(),
})

// GET - List comments for a resource
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const resourceId = searchParams.get('resourceId')

  if (!resourceId) {
    return NextResponse.json({ error: 'resourceId is required' }, { status: 400 })
  }

  try {
    const comments = await prisma.learningResourceComment.findMany({
      where: { resourceId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST - Add a comment
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const raw = await req.json()
    const parsed = createCommentSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { resourceId, content, rating } = parsed.data

    const comment = await prisma.learningResourceComment.create({
      data: {
        resourceId,
        userId: session.user.id,
        content,
        rating: rating ? parseInt(String(rating)) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}

// DELETE - Remove a comment
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const commentId = searchParams.get('id')

  if (!commentId) {
    return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
  }

  try {
    // Check ownership
    const comment = await prisma.learningResourceComment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const isOwner = comment.userId === session.user.id
    const isAdmin = session.user.role === 'SUPER_ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized to delete this comment' }, { status: 403 })
    }

    await prisma.learningResourceComment.delete({
      where: { id: commentId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
