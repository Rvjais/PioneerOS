import { NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'

// GET /api/client-portal/meetings/[id] - Get single meeting with full details
export const GET = withClientAuth(async (request, { user }, routeContext) => {
  const { id } = await routeContext!.params
  const clientId = user.clientId

  // Fetch the meeting
  const meeting = await prisma.meeting.findFirst({
    where: {
      id,
      clientId,
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
      },
      meetingActionItems: {
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  if (!meeting) {
    return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
  }

  // Parse agenda items if JSON
  let agendaItems: string[] = []
  if (meeting.agenda) {
    try {
      agendaItems = JSON.parse(meeting.agenda)
    } catch {
      // If not JSON, split by newlines
      agendaItems = meeting.agenda.split('\n').filter(item => item.trim())
    }
  }

  return NextResponse.json({
    meeting: {
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      type: meeting.type,
      category: meeting.category,
      date: meeting.date.toISOString(),
      duration: meeting.duration,
      location: meeting.location,
      status: meeting.status,
      isOnline: meeting.isOnline,
      recurrence: meeting.recurrence,
      momRecorded: meeting.momRecorded,
      agenda: agendaItems,
      agendaRaw: meeting.agenda,
      notes: meeting.notes,
      minutesSummary: meeting.minutesSummary,
      participants: meeting.participants.map(p => ({
        id: p.id,
        role: p.role,
        attended: p.attended,
        user: {
          id: p.user.id,
          name: `${p.user.firstName} ${p.user.lastName || ''}`.trim(),
          role: p.user.role,
          avatarUrl: p.user.profile?.profilePicture || null,
        },
      })),
      actionItems: meeting.meetingActionItems.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        assignee: {
          id: item.assignee.id,
          name: `${item.assignee.firstName} ${item.assignee.lastName || ''}`.trim(),
        },
        dueDate: item.dueDate?.toISOString() || null,
        priority: item.priority,
        status: item.status,
        completedAt: item.completedAt?.toISOString() || null,
      })),
      createdAt: meeting.createdAt.toISOString(),
      updatedAt: meeting.updatedAt.toISOString(),
    },
  })
}, { rateLimit: 'READ' })
