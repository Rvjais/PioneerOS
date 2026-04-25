import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import TacticalSheetClient from './TacticalSheetClient'

export default async function TacticalSheetPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id
  const userDept = session.user.department as string
  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(session.user.role)

  // Get current month boundaries
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  // Get assigned clients for non-managers, all SOCIAL clients for managers
  const clientWhere = isManager && userDept === 'SOCIAL'
    ? { status: 'ACTIVE' }
    : {
        status: 'ACTIVE',
        teamMembers: { some: { userId, role: { in: ['LEAD', 'MEMBER'] } } }
      }

  const clients = await prisma.client.findMany({
    where: clientWhere,
    select: {
      id: true,
      name: true,
      brandName: true,
      platform: true,
      facebookUrl: true,
      instagramUrl: true,
      linkedinUrl: true,
      twitterUrl: true,
      youtubeUrl: true,
    },
    orderBy: { name: 'asc' },
  })

  // Get social media posts for current month
  const posts = await prisma.socialMediaPost.findMany({
    where: {
      userId,
      month: { gte: monthStart, lte: monthEnd },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get page metrics for current month
  const pageMetrics = await prisma.socialMediaPageMetrics.findMany({
    where: {
      userId,
      month: { gte: monthStart, lte: monthEnd },
    },
  })

  // Get current month's growth score if exists
  const growthScore = await prisma.monthlyGrowthScore.findFirst({
    where: {
      userId,
      month: { gte: monthStart, lte: monthEnd },
    },
  })

  // Get user's capacity
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      clientCapacity: true,
      firstName: true,
      lastName: true,
    },
  })

  // Get learning hours for current month
  const learningEntries = await prisma.learningLog.findMany({
    where: {
      userId,
      month: { gte: monthStart, lte: monthEnd },
    },
    select: { minutesWatched: true },
  })

  const totalLearningHours = learningEntries.reduce((sum, e) => sum + (e.minutesWatched || 0), 0) / 60

  // Get appreciations count
  const appreciationsCount = await prisma.recognition.count({
    where: {
      receiverId: userId,
      createdAt: { gte: monthStart, lte: monthEnd },
    },
  })

  // Get escalations count using EmployeeEscalation
  const escalationsCount = await prisma.employeeEscalation.count({
    where: {
      employeeId: userId,
      createdAt: { gte: monthStart, lte: monthEnd },
    },
  })

  // Get churned clients count using ClientFeedback
  const clientsLost = await prisma.clientFeedback.count({
    where: {
      churnedThisMonth: true,
      month: { gte: monthStart, lte: monthEnd },
      client: { teamMembers: { some: { userId } } },
    },
  })

  const monthName = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
  const dayOfMonth = now.getDate()
  const isReminderPeriod = dayOfMonth >= 1 && dayOfMonth <= 5

  return (
    <TacticalSheetClient
      userId={userId}
      userName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
      department={userDept}
      isManager={isManager}
      monthName={monthName}
      dayOfMonth={dayOfMonth}
      isReminderPeriod={isReminderPeriod}
      clients={clients}
      posts={posts}
      pageMetrics={pageMetrics}
      growthScore={growthScore}
      clientCapacity={user?.clientCapacity || 10}
      assignedClientsCount={clients.length}
      learningHours={totalLearningHours}
      appreciationsCount={appreciationsCount}
      escalationsCount={escalationsCount}
      clientsLost={clientsLost}
    />
  )
}
