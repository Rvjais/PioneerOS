import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const MeetingCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  type: z.string().max(50).optional(),
  category: z.enum(['CLIENT_MEETING', 'INTERNAL', 'STANDUP', 'REVIEW', 'ONE_ON_ONE', 'TRAINING', 'OTHER']),
  date: z.string().min(1, 'Date is required').refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
  duration: z.number().int().min(5, 'Duration must be at least 5 minutes').max(480, 'Duration must be 480 minutes or less').optional(),
  clientId: z.string().optional().nullable(),
  isOnline: z.boolean().optional(),
  meetingLink: z.string().url('Invalid meeting link URL').max(500).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  agenda: z.string().max(5000, 'Agenda must be 5000 characters or less').optional().nullable(),
  participantIds: z.array(z.string()).max(50, 'Cannot have more than 50 participants').optional(),
  noteTakerUrl: z.string().url().max(500).optional().nullable(),
  momSummary: z.string().max(10000).optional().nullable(),
  keyPointers: z.string().max(10000).optional().nullable(),
  status: z.string().max(50).optional(),
})

// GET /api/meetings - List meetings
export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')
    const limit = parseInt(searchParams.get('limit') || '50')

    // SECURITY FIX: Filter meetings based on user role
    // Admins/Managers can see all meetings
    // Regular users only see meetings they participate in or created
    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(user.role || '')

    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (status) where.status = status
    if (clientId) where.clientId = clientId

    // Non-admins see only meetings they participate in OR for their assigned clients
    if (!isAdmin) {
      const assignedClients = await prisma.clientTeamMember.findMany({
        where: { userId: user.id },
        select: { clientId: true },
      })
      const assignedClientIds = assignedClients.map(c => c.clientId)

      where.OR = [
        { participants: { some: { userId: user.id } } },
        ...(assignedClientIds.length > 0 ? [{ clientId: { in: assignedClientIds } }] : []),
      ]
    }

    const meetings = await prisma.meeting.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        participants: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, profile: { select: { profilePicture: true } } } },
          },
        },
        meetingActionItems: {
          include: {
            assignee: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
    })

    return NextResponse.json({
      meetings: meetings.map(m => ({
        ...m,
        date: m.date.toISOString(),
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Failed to fetch meetings:', error)
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 })
  }
})

// POST /api/meetings - Create a new meeting
export const POST = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const parseResult = MeetingCreateSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const {
      title,
      type,
      category,
      date,
      duration,
      clientId,
      isOnline,
      meetingLink,
      location,
      agenda,
      participantIds,
      // MoM fields
      noteTakerUrl,
      momSummary,
      keyPointers,
    } = parseResult.data

    // Warn if meeting is being created in the past (allow for backdating records)
    const meetingDate = new Date(date)
    const isPastMeeting = meetingDate < new Date()
    let pastDateWarning: string | undefined
    if (isPastMeeting && !['COMPLETED', 'CANCELLED'].includes(body.status || '')) {
      pastDateWarning = 'Meeting date is in the past. Consider setting status to COMPLETED if this is a past meeting record.'
    }

    // Create meeting
    const meeting = await prisma.meeting.create({
      data: {
        title,
        type: type || (category === 'CLIENT_MEETING' ? 'CLIENT_CALL' : 'INTERNAL'),
        category,
        date: new Date(date),
        duration: duration || 60,
        clientId: clientId || null,
        isOnline: isOnline ?? true,
        location: location || null,
        meetingLink: meetingLink || null,
        agenda: agenda || null,
        status: 'SCHEDULED',
        // MoM fields
        noteTakerUrl: noteTakerUrl || null,
        minutesSummary: momSummary || null,
        keyPointers: keyPointers || null,
        // Create participants if provided
        participants: participantIds?.length
          ? {
              create: participantIds.map((userId: string) => ({
                userId,
              })),
            }
          : undefined,
      },
      include: {
        client: { select: { id: true, name: true } },
        participants: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, profile: { select: { profilePicture: true } } } },
          },
        },
      },
    })

    // Auto-create in-app notifications for participants (excluding the creator)
    if (participantIds?.length) {
      await prisma.notification.createMany({
        data: participantIds.filter((id: string) => id !== user.id).map((userId: string) => ({
          userId,
          type: 'MEETING',
          title: `New Meeting: ${title}`,
          message: `You've been added to "${title}" on ${new Date(date).toLocaleDateString('en-IN')}`,
          link: `/meetings`,
        }))
      }).catch((err) => console.error('[Meetings] Failed to send notifications:', err))
    }

    return NextResponse.json(
      {
        meeting: {
          ...meeting,
          date: meeting.date.toISOString(),
          createdAt: meeting.createdAt.toISOString(),
          updatedAt: meeting.updatedAt.toISOString(),
        },
        ...(pastDateWarning && { warning: pastDateWarning }),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create meeting:', error)
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 })
  }
})

// PATCH /api/meetings - Update a meeting
export const PATCH = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const { meetingId, ...updateData } = body

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 })
    }

    // SECURITY FIX: Verify user can modify this meeting
    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(user.role || '')
    if (!isAdmin) {
      const isParticipant = await prisma.meetingParticipant.findFirst({
        where: { meetingId, userId: user.id }
      })
      if (!isParticipant) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const data: Record<string, unknown> = {}
    if (updateData.title !== undefined) data.title = updateData.title
    if (updateData.category !== undefined) data.category = updateData.category
    if (updateData.date !== undefined) data.date = new Date(updateData.date)
    if (updateData.duration !== undefined) data.duration = updateData.duration
    if (updateData.clientId !== undefined) data.clientId = updateData.clientId
    if (updateData.isOnline !== undefined) data.isOnline = updateData.isOnline
    if (updateData.meetingLink !== undefined) data.meetingLink = updateData.meetingLink
    if (updateData.location !== undefined) data.location = updateData.location
    if (updateData.agenda !== undefined) data.agenda = updateData.agenda
    if (updateData.status !== undefined) data.status = updateData.status
    if (updateData.notes !== undefined) data.notes = updateData.notes
    if (updateData.momRecorded !== undefined) data.momRecorded = updateData.momRecorded
    // MoM fields
    if (updateData.noteTakerUrl !== undefined) data.noteTakerUrl = updateData.noteTakerUrl
    if (updateData.minutesSummary !== undefined) data.minutesSummary = updateData.minutesSummary
    if (updateData.momSummary !== undefined) data.momSummary = updateData.momSummary
    if (updateData.keyPointers !== undefined) data.keyPointers = updateData.keyPointers

    const meeting = await prisma.meeting.update({
      where: { id: meetingId },
      data,
      include: {
        client: { select: { id: true, name: true } },
        participants: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, profile: { select: { profilePicture: true } } } },
          },
        },
      },
    })

    return NextResponse.json({
      meeting: {
        ...meeting,
        date: meeting.date.toISOString(),
        createdAt: meeting.createdAt.toISOString(),
        updatedAt: meeting.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to update meeting:', error)
    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 })
  }
})

// DELETE /api/meetings - Delete or cancel a meeting
export const DELETE = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const meetingId = searchParams.get('meetingId')
    const action = searchParams.get('action') || 'cancel' // 'cancel' or 'delete'

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 })
    }

    // SECURITY FIX: Only the meeting organizer or admins can delete/cancel
    const existingMeeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { participants: { where: { role: 'ORGANIZER' }, select: { userId: true } } },
    })
    if (!existingMeeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }
    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(user.role || '')
    const isOrganizer = existingMeeting.participants.some(p => p.userId === user.id)
    if (!isOrganizer && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Only the meeting organizer or admins can delete' }, { status: 403 })
    }

    if (action === 'delete') {
      // First delete participants and action items
      await prisma.meetingParticipant.deleteMany({
        where: { meetingId },
      })
      await prisma.meetingActionItem.deleteMany({
        where: { meetingId },
      })
      await prisma.meeting.delete({
        where: { id: meetingId },
      })
    } else {
      // Cancel the meeting
      await prisma.meeting.update({
        where: { id: meetingId },
        data: { status: 'CANCELLED' },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete/cancel meeting:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
})
