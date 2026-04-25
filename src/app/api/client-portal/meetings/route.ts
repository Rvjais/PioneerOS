import { NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'

// GET /api/client-portal/meetings - Get meetings for client
export const GET = withClientAuth(async (req, { user }) => {
  const clientId = user.clientId

  // Get query params
  const { searchParams } = new URL(req.url)
  const onlyPast = searchParams.get('past') === 'true'
  const onlyUpcoming = searchParams.get('upcoming') === 'true'

  // Build filter - exclude internal meetings from client portal
  const where: Record<string, unknown> = { clientId, type: { not: 'INTERNAL' } }

  if (onlyPast) {
    where.date = { lt: new Date() }
  } else if (onlyUpcoming) {
    where.date = { gte: new Date() }
  }
  // If neither specified, fetch all meetings

  // Fetch meetings
  const meetings = await prisma.meeting.findMany({
    where,
    orderBy: { date: 'desc' },
    take: 50,
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      },
    },
  })

  // Separate upcoming and past meetings
  const now = new Date()
  const upcomingMeetings = meetings.filter(m => new Date(m.date) >= now)
  const pastMeetings = meetings.filter(m => new Date(m.date) < now)

  return NextResponse.json({
    meetings: meetings.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      type: m.type,
      category: m.category,
      date: m.date.toISOString(),
      duration: m.duration,
      location: m.location,
      status: m.status,
      agenda: m.agenda,
      notes: m.notes,
      isOnline: m.isOnline,
      momRecorded: m.momRecorded,
      participants: m.participants.map(p => ({
        id: p.id,
        role: p.role,
        attended: p.attended,
        user: {
          id: p.user.id,
          name: `${p.user.firstName} ${p.user.lastName || ''}`.trim(),
          role: p.user.role,
        },
      })),
      createdAt: m.createdAt.toISOString(),
    })),
    summary: {
      upcoming: upcomingMeetings.length,
      completed: pastMeetings.filter(m => m.status === 'COMPLETED').length,
      cancelled: pastMeetings.filter(m => m.status === 'CANCELLED').length,
    },
  })
}, { rateLimit: 'READ' })
