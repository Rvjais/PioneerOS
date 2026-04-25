import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { TacticalMeetingClient } from './TacticalMeetingClient'

function serializeData<T>(data: T): T {
  if (data === null || data === undefined) return data
  if (data instanceof Date) return data.toISOString() as unknown as T
  if (Array.isArray(data)) return data.map(item => serializeData(item)) as unknown as T
  if (typeof data === 'object') {
    const result: Record<string, unknown> = {}
    for (const key in data) {
      result[key] = serializeData((data as Record<string, unknown>)[key])
    }
    return result as T
  }
  return data
}

async function getCurrentMeeting(userId: string) {
  const now = new Date()
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const meeting = await prisma.tacticalMeeting.findUnique({
    where: {
      userId_month: {
        userId,
        month: currentMonth,
      },
    },
    include: {
      kpiEntries: {
        include: {
          client: { select: { id: true, name: true } },
          property: { select: { id: true, name: true, type: true } },
        },
      },
    },
  })

  return meeting ? serializeData(meeting) : null
}

async function getPreviousMeeting(userId: string) {
  const now = new Date()
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const meeting = await prisma.tacticalMeeting.findUnique({
    where: {
      userId_month: {
        userId,
        month: prevMonth,
      },
    },
    include: {
      kpiEntries: {
        include: {
          client: { select: { id: true, name: true } },
          property: { select: { id: true, name: true, type: true } },
        },
      },
    },
  })

  return meeting ? serializeData(meeting) : null
}

async function getAssignedClients(userId: string, isManager: boolean) {
  if (isManager) {
    return prisma.client.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        properties: {
          where: { isActive: true },
          select: { id: true, name: true, type: true, isPrimary: true },
        },
      },
      orderBy: { name: 'asc' },
    })
  }

  const assignments = await prisma.clientTeamMember.findMany({
    where: { userId },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          properties: {
            where: { isActive: true },
            select: { id: true, name: true, type: true, isPrimary: true },
          },
        },
      },
    },
  })

  return assignments.map(a => a.client)
}

async function getTeamMeetings(department: string) {
  const now = new Date()
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const meetings = await prisma.tacticalMeeting.findMany({
    where: {
      month: currentMonth,
      user: { department },
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          empId: true,
        },
      },
      kpiEntries: {
        include: {
          client: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { submittedAt: 'asc' },
  })

  return serializeData(meetings)
}

async function getYearlyData(userId: string, year: number) {
  const startOfYear = new Date(year, 0, 1)
  const endOfYear = new Date(year, 11, 31)

  const meetings = await prisma.tacticalMeeting.findMany({
    where: {
      userId,
      month: {
        gte: startOfYear,
        lte: endOfYear,
      },
      status: 'SUBMITTED',
    },
    include: {
      kpiEntries: true,
    },
    orderBy: { month: 'asc' },
  })

  return serializeData(meetings)
}

async function getLearningHours(userId: string) {
  const now = new Date()
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const logs = await prisma.learningLog.findMany({
    where: {
      userId,
      month: currentMonth,
    },
  })

  const totalMinutes = logs.reduce((sum, log) => sum + log.minutesWatched, 0)
  return totalMinutes / 60 // Return hours
}

export default async function TacticalMeetingPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id
  const department = session.user.department
  const userRole = session.user.role
  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(userRole)

  // Redirect department-specific users to their tactical pages
  if (department === 'HR' && !isManager) {
    redirect('/hr/reports/tactical')
  }
  if (department === 'SALES' && !isManager) {
    redirect('/sales/reports/tactical')
  }
  if (department === 'ACCOUNTS' && !isManager) {
    redirect('/accounts/reports/tactical')
  }

  const [currentMeeting, previousMeeting, clients, teamMeetings, yearlyData, learningHours] = await Promise.all([
    getCurrentMeeting(userId),
    getPreviousMeeting(userId),
    getAssignedClients(userId, isManager),
    isManager ? getTeamMeetings(department) : Promise.resolve([]),
    getYearlyData(userId, new Date().getFullYear()),
    getLearningHours(userId),
  ])

  // Calculate deadline status
  const now = new Date()
  const isBeforeDeadline = now.getDate() <= 3
  const daysUntilDeadline = isBeforeDeadline ? 3 - now.getDate() : 0

  return (
    <TacticalMeetingClient
      currentMeeting={currentMeeting as unknown as Parameters<typeof TacticalMeetingClient>[0]['currentMeeting']}
      previousMeeting={previousMeeting as unknown as Parameters<typeof TacticalMeetingClient>[0]['previousMeeting']}
      clients={clients}
      teamMeetings={teamMeetings as unknown as Parameters<typeof TacticalMeetingClient>[0]['teamMeetings']}
      yearlyData={yearlyData as unknown as Parameters<typeof TacticalMeetingClient>[0]['yearlyData']}
      department={department}
      isManager={isManager}
      currentUserId={userId}
      isBeforeDeadline={isBeforeDeadline}
      daysUntilDeadline={daysUntilDeadline}
      learningHours={learningHours}
    />
  )
}
