import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { meetingId } = await params
    const body = await req.json()
    const schema = z.object({
      status: z.string().max(50).optional(),
      outcome: z.string().max(100).optional(),
      outcomeNotes: z.string().max(2000).optional(),
      scheduledAt: z.string().optional(),
      location: z.string().max(500).optional(),
      meetingLink: z.string().max(1000).optional(),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['status', 'outcome', 'outcomeNotes', 'scheduledAt', 'location', 'meetingLink']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const meeting = await prisma.salesMeeting.update({
      where: { id: meetingId },
      data: updateData,
      include: {
        lead: {
          select: { id: true, companyName: true, contactName: true }
        },
      },
    })

    // Create activity log for status change
    if (body.status) {
      await prisma.leadActivity.create({
        data: {
          leadId: meeting.leadId,
          userId: session.user.id,
          type: 'MEETING',
          title: `Meeting ${body.status.toLowerCase()}: ${meeting.title}`,
          description: body.outcome ? `Outcome: ${body.outcome.replace(/_/g, ' ')}` : undefined,
        },
      })
    }

    return NextResponse.json(meeting)
  } catch (error) {
    console.error('Failed to update meeting:', error)
    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { meetingId } = await params

    await prisma.salesMeeting.delete({
      where: { id: meetingId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete meeting:', error)
    return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 })
  }
}
