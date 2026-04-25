import { prisma } from '@/server/db/prisma'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { LearningClient } from './LearningClient'

interface MonthlyBreakdown {
  month: string
  monthLabel: string
  minutes: number
  hours: number
  isCompliant: boolean
  entries: number
}

export default async function LearningPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id

  // Get user data for appraisal date
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      joiningDate: true,
      appraisalDate: true,
      firstName: true,
    },
  })

  // Calculate appraisal date (default: joiningDate + 12 months)
  const joiningDate = user?.joiningDate ? new Date(user.joiningDate) : new Date()
  let appraisalDate = user?.appraisalDate
    ? new Date(user.appraisalDate)
    : new Date(joiningDate.getFullYear() + 1, joiningDate.getMonth(), joiningDate.getDate())

  // Get all learning logs with verification data
  const logs = await prisma.learningLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      verification: {
        select: {
          id: true,
          status: true,
          aiScore: true,
          isVerified: true,
        }
      }
    }
  })

  // Calculate monthly totals and track months with < 6 hours
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonthLogs = logs.filter(l => new Date(l.createdAt) >= monthStart)
  const thisMonthMinutes = thisMonthLogs.reduce((sum, l) => sum + l.minutesWatched, 0)
  const totalMinutes = logs.reduce((sum, l) => sum + l.minutesWatched, 0)

  // Build monthly map for breakdown
  const monthlyMap: Record<string, { minutes: number; entries: number }> = {}
  for (const log of logs) {
    const d = new Date(log.month)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyMap[key]) monthlyMap[key] = { minutes: 0, entries: 0 }
    monthlyMap[key].minutes += log.minutesWatched
    monthlyMap[key].entries += 1
  }

  // Count months where < 6 hours of learning (push appraisal by 1 month each)
  // Fresh start date - no deficits counted before this
  const FRESH_START_DATE = new Date('2026-04-01')

  // Start checking from the later of joining date or fresh start date
  const joiningMonthStart = new Date(joiningDate.getFullYear(), joiningDate.getMonth(), 1)
  const freshStartMonthStart = new Date(FRESH_START_DATE.getFullYear(), FRESH_START_DATE.getMonth(), 1)
  const startCheckDate = new Date(Math.max(joiningMonthStart.getTime(), freshStartMonthStart.getTime()))

  let pushMonths = 0
  const deficitMonths: string[] = []
  const checkDate = new Date(startCheckDate)
  while (checkDate < monthStart) {
    const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}`
    const monthHours = (monthlyMap[key]?.minutes || 0) / 60
    if (monthHours < 6) {
      pushMonths++
      deficitMonths.push(formatDateDDMMYYYY(checkDate))
    }
    checkDate.setMonth(checkDate.getMonth() + 1)
  }

  // Push appraisal date by number of deficit months
  if (pushMonths > 0) {
    appraisalDate = new Date(appraisalDate)
    appraisalDate.setMonth(appraisalDate.getMonth() + pushMonths)
  }

  // If appraisal date changed, update in DB
  if (user && (!user.appraisalDate || new Date(user.appraisalDate).getTime() !== appraisalDate.getTime())) {
    await prisma.user.update({
      where: { id: userId },
      data: { appraisalDate },
    })
  }

  // Build monthly breakdown for last 12 months
  const monthlyBreakdown: MonthlyBreakdown[] = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const data = monthlyMap[key] || { minutes: 0, entries: 0 }
    monthlyBreakdown.push({
      month: key,
      monthLabel: formatDateDDMMYYYY(d),
      minutes: data.minutes,
      hours: Math.round((data.minutes / 60) * 10) / 10,
      isCompliant: data.minutes >= 360,
      entries: data.entries,
    })
  }

  const serializedLogs = logs.map(l => ({
    id: l.id,
    resourceUrl: l.resourceUrl,
    resourceTitle: l.resourceTitle,
    topic: l.topic,
    minutesWatched: l.minutesWatched,
    notes: l.notes,
    month: l.month.toISOString(),
    createdAt: l.createdAt.toISOString(),
    verificationId: l.verificationId,
    verification: l.verification ? {
      id: l.verification.id,
      status: l.verification.status,
      aiScore: l.verification.aiScore,
      isVerified: l.verification.isVerified,
    } : null,
  }))

  // Calculate streak
  let streak = 0
  for (let i = 1; i < monthlyBreakdown.length; i++) {
    if (monthlyBreakdown[i].isCompliant) streak++
    else break
  }

  // Days remaining in month
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysRemaining = daysInMonth - now.getDate()

  // Hours needed per day to hit target
  const hoursRemaining = Math.max(0, 6 - thisMonthMinutes / 60)
  const hoursPerDay = daysRemaining > 0 ? hoursRemaining / daysRemaining : hoursRemaining

  return (
    <LearningClient
      logs={serializedLogs}
      stats={{
        thisMonthMinutes,
        thisMonthHours: Math.round((thisMonthMinutes / 60) * 10) / 10,
        totalMinutes,
        totalHours: Math.round((totalMinutes / 60) * 10) / 10,
        pushMonths,
        deficitMonths,
        streak,
        daysRemaining,
        hoursRemaining: Math.round(hoursRemaining * 10) / 10,
        hoursPerDay: Math.round(hoursPerDay * 100) / 100,
      }}
      appraisalDate={appraisalDate.toISOString()}
      joiningDate={joiningDate.toISOString()}
      monthlyBreakdown={monthlyBreakdown}
      userName={user?.firstName || 'User'}
    />
  )
}
