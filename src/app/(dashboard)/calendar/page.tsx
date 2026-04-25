import prisma from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { CalendarClient } from './CalendarClient'

function serializeDate(date: Date | null): string | null {
  return date ? date.toISOString() : null
}

async function getCalendarData(userId: string, department: string, isManager: boolean) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const [meetings, events, tasks, leaves, hrAnnouncements] = await Promise.all([
    // Meetings
    prisma.meeting.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        OR: [
          { participants: { some: { userId } } },
          ...(isManager ? [{ participants: { some: { user: { department } } } }] : []),
        ],
      },
      include: {
        client: { select: { id: true, name: true } },
        participants: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { date: 'asc' },
    }),

    // Events
    prisma.event.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: { date: 'asc' },
    }),

    // Tasks with deadlines
    prisma.task.findMany({
      where: {
        dueDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        OR: [
          { assigneeId: userId },
          { creatorId: userId },
          ...(isManager ? [{ assignee: { department } }] : []),
        ],
      },
      include: {
        client: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { dueDate: 'asc' },
    }),

    // Approved leaves
    prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        startDate: { lte: endOfMonth },
        endDate: { gte: startOfMonth },
        ...(isManager
          ? { user: { department } }
          : { userId }),
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { startDate: 'asc' },
    }),

    // HR Announcements
    prisma.post.findMany({
      where: {
        type: 'ANNOUNCEMENT',
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        type: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  return {
    meetings: meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.title,
      date: serializeDate(meeting.date)!,
      type: meeting.type,
      client: meeting.client,
      participants: meeting.participants?.map(p => ({
        user: {
          firstName: p.user.firstName,
          lastName: p.user.lastName,
        },
      })),
    })),
    events: events.map(event => ({
      id: event.id,
      title: event.title,
      date: serializeDate(event.date)!,
      type: event.type,
      isAllDay: event.isAllDay,
    })),
    tasks: tasks.map(task => ({
      id: task.id,
      title: task.title,
      dueDate: serializeDate(task.dueDate)!,
      priority: task.priority,
      client: task.client,
      assignee: task.assignee,
    })),
    leaves: leaves.map(leave => ({
      id: leave.id,
      type: leave.type,
      startDate: serializeDate(leave.startDate)!,
      endDate: serializeDate(leave.endDate)!,
      status: leave.status,
      user: {
        id: leave.user.id,
        firstName: leave.user.firstName,
        lastName: leave.user.lastName,
      },
    })),
    tacticalDeadlines: [{
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      dueDate: new Date(now.getFullYear(), now.getMonth(), 3).toISOString(),
      pendingCount: 0,
    }],
    hrAnnouncements: hrAnnouncements.map(announcement => ({
      id: announcement.id,
      title: announcement.content.substring(0, 100) + (announcement.content.length > 100 ? '...' : ''),
      date: serializeDate(announcement.createdAt)!,
      type: announcement.type,
    })),
  }
}

export default async function CalendarPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id
  const department = session.user.department
  const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(session.user.role)

  const calendarData = await getCalendarData(userId, department, isManager)

  return (
    <CalendarClient
      initialData={calendarData}
      currentUserId={userId}
      isManager={isManager}
    />
  )
}
