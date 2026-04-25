import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { StrategicMeetingClient } from './StrategicMeetingClient'

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

function getCurrentQuarter(): { quarter: number; year: number } {
  const now = new Date()
  const month = now.getMonth()
  const quarter = Math.floor(month / 3) + 1
  return { quarter, year: now.getFullYear() }
}

async function getCurrentStrategicMeeting(department: string) {
  const { quarter, year } = getCurrentQuarter()

  const meeting = await prisma.strategicMeeting.findUnique({
    where: {
      quarter_year_department: {
        quarter,
        year,
        department,
      },
    },
    include: {
      goals: true,
      peerReviews: true,
    },
  })

  return meeting ? serializeData(meeting) : null
}

async function getPreviousStrategicMeeting(department: string) {
  const { quarter, year } = getCurrentQuarter()
  const prevQuarter = quarter === 1 ? 4 : quarter - 1
  const prevYear = quarter === 1 ? year - 1 : year

  const meeting = await prisma.strategicMeeting.findUnique({
    where: {
      quarter_year_department: {
        quarter: prevQuarter,
        year: prevYear,
        department,
      },
    },
    include: {
      goals: true,
      peerReviews: true,
    },
  })

  return meeting ? serializeData(meeting) : null
}

async function getTeamMembers(department: string) {
  const members = await prisma.user.findMany({
    where: {
      department,
      status: 'ACTIVE',
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      empId: true,
      role: true,
    },
    orderBy: { firstName: 'asc' },
  })

  return members
}

async function getQuarterlyKPIData(userId: string, quarter: number, year: number) {
  // Get the months for this quarter
  const startMonth = (quarter - 1) * 3
  const months = [
    new Date(year, startMonth, 1),
    new Date(year, startMonth + 1, 1),
    new Date(year, startMonth + 2, 1),
  ]

  const meetings = await prisma.tacticalMeeting.findMany({
    where: {
      userId,
      month: { in: months },
      status: 'SUBMITTED',
    },
    include: {
      kpiEntries: true,
    },
    orderBy: { month: 'asc' },
  })

  return serializeData(meetings)
}

async function getMyPeerReviews(userId: string, meetingId: string | null) {
  if (!meetingId) return { given: [], received: [] }

  const [given, received] = await Promise.all([
    prisma.peerReview.findMany({
      where: { meetingId, reviewerId: userId },
    }),
    prisma.peerReview.findMany({
      where: { meetingId, revieweeId: userId, isPublic: true },
    }),
  ])

  return serializeData({ given, received })
}

async function getEmployeeScorecard(userId: string) {
  const now = new Date()
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const scorecard = await prisma.employeeScorecard.findUnique({
    where: {
      userId_month: {
        userId,
        month: currentMonth,
      },
    },
  })

  return scorecard ? serializeData(scorecard) : null
}

export default async function StrategicMeetingPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id
  const department = session.user.department
  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(session.user.role)
  const { quarter, year } = getCurrentQuarter()

  const [currentMeeting, previousMeeting, teamMembers, quarterlyData, scorecard] = await Promise.all([
    getCurrentStrategicMeeting(department),
    getPreviousStrategicMeeting(department),
    getTeamMembers(department),
    getQuarterlyKPIData(userId, quarter, year),
    getEmployeeScorecard(userId),
  ])

  const peerReviews = await getMyPeerReviews(userId, currentMeeting?.id || null)

  return (
    <StrategicMeetingClient
      currentMeeting={currentMeeting as unknown as Parameters<typeof StrategicMeetingClient>[0]['currentMeeting']}
      previousMeeting={previousMeeting as unknown as Parameters<typeof StrategicMeetingClient>[0]['previousMeeting']}
      teamMembers={teamMembers}
      quarterlyData={quarterlyData as unknown as Parameters<typeof StrategicMeetingClient>[0]['quarterlyData']}
      peerReviews={peerReviews as unknown as Parameters<typeof StrategicMeetingClient>[0]['peerReviews']}
      scorecard={scorecard as unknown as Parameters<typeof StrategicMeetingClient>[0]['scorecard']}
      currentUserId={userId}
      department={department}
      isManager={isManager}
      quarter={quarter}
      year={year}
    />
  )
}
