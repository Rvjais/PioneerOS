import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const meetings = await prisma.salesMeeting.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        lead: {
          select: { id: true, companyName: true, contactName: true }
        },
      },
      orderBy: { scheduledAt: 'desc' },
    })

    return NextResponse.json(meetings)
  } catch (error) {
    console.error('Failed to fetch meetings:', error)
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const schema = z.object({
      leadId: z.string().min(1),
      meetingType: z.string().max(50).optional(),
      title: z.string().min(1).max(500),
      description: z.string().max(2000).optional(),
      scheduledAt: z.string().min(1),
      duration: z.number().int().min(1).max(480).optional(),
      location: z.string().max(500).optional(),
      meetingLink: z.string().max(1000).optional(),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const {
      leadId,
      meetingType,
      title,
      description,
      scheduledAt,
      duration,
      location,
      meetingLink,
    } = result.data

    const meeting = await prisma.salesMeeting.create({
      data: {
        leadId,
        userId: session.user.id,
        meetingType: meetingType || 'DISCOVERY_CALL',
        title,
        description: description || null,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 30,
        location: location || null,
        meetingLink: meetingLink || null,
        status: 'SCHEDULED',
      },
      include: {
        lead: {
          select: { id: true, companyName: true, contactName: true }
        },
      },
    })

    // Create activity log
    await prisma.leadActivity.create({
      data: {
        leadId,
        userId: session.user.id,
        type: 'MEETING',
        title: `Meeting scheduled: ${title}`,
        description: `${(meetingType ?? 'DISCOVERY_CALL').replace(/_/g, ' ')} scheduled for ${new Date(scheduledAt).toLocaleString()}`,
      },
    })

    return NextResponse.json(meeting)
  } catch (error) {
    console.error('Failed to create meeting:', error)
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 })
  }
}
