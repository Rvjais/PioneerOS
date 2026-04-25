import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { HRTacticalClient } from './HRTacticalClient'

interface SerializedKPIEntry {
  id: string
  department: string
  [key: string]: unknown
}

interface SerializedMeeting {
  id: string
  month: string
  reportingMonth: string
  status: string
  submittedAt?: string | null
  submittedOnTime: boolean
  overallScore?: number | null
  kpiEntries: SerializedKPIEntry[]
}

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
      kpiEntries: true,
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
      kpiEntries: true,
    },
  })

  return meeting ? serializeData(meeting) : null
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
  return totalMinutes / 60
}

export default async function HRTacticalPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id
  const userDept = session.user.department
  const userRole = session.user.role

  // Only HR users should access this
  if (userDept !== 'HR' && !['SUPER_ADMIN', 'MANAGER'].includes(userRole)) {
    redirect('/meetings/tactical')
  }

  const [currentMeeting, previousMeeting, yearlyData, learningHours] = await Promise.all([
    getCurrentMeeting(userId),
    getPreviousMeeting(userId),
    getYearlyData(userId, new Date().getFullYear()),
    getLearningHours(userId),
  ])

  const now = new Date()
  const isBeforeDeadline = now.getDate() <= 3
  const daysUntilDeadline = isBeforeDeadline ? 3 - now.getDate() : 0

  return (
    <HRTacticalClient
      currentMeeting={currentMeeting as unknown as SerializedMeeting | null}
      previousMeeting={previousMeeting as unknown as SerializedMeeting | null}
      yearlyData={yearlyData as unknown as SerializedMeeting[]}
      currentUserId={userId}
      isBeforeDeadline={isBeforeDeadline}
      daysUntilDeadline={daysUntilDeadline}
      learningHours={learningHours}
    />
  )
}
