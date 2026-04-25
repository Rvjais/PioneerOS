import prisma from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { OperationsCalendarClient } from './CalendarClient'

function serializeDate(date: Date | null): string | null {
  return date ? date.toISOString() : null
}

async function getCalendarData(userId: string, department: string, isManager: boolean) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const [meetings, events, tasks, deployments, milestones] = await Promise.all([
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

    // Deployments - using tasks with type DEPLOYMENT
    prisma.task.findMany({
      where: {
        dueDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        type: 'DEPLOYMENT',
      },
      include: {
        client: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { dueDate: 'asc' },
    }),

    // Milestones
    prisma.task.findMany({
      where: {
        dueDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        type: 'MILESTONE',
      },
      include: {
        client: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { dueDate: 'asc' },
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
    deployments: deployments.map(deployment => ({
      id: deployment.id,
      title: deployment.title,
      dueDate: serializeDate(deployment.dueDate)!,
      status: deployment.status,
      client: deployment.client,
      assignee: deployment.assignee,
    })),
    milestones: milestones.map(milestone => ({
      id: milestone.id,
      title: milestone.title,
      dueDate: serializeDate(milestone.dueDate)!,
      status: milestone.status,
      client: milestone.client,
      assignee: milestone.assignee,
    })),
  }
}

export default async function OperationsCalendarPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id
  const department = session.user.department
  const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(session.user.role)

  const calendarData = await getCalendarData(userId, department, isManager)

  return (
    <OperationsCalendarClient
      initialData={calendarData}
      currentUserId={userId}
      isManager={isManager}
    />
  )
}
