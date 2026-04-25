/**
 * Growth Score Calculation System
 *
 * Formula:
 * Final Score = (Performance * 0.35) + (Accountability * 0.20) + (Discipline * 0.15) +
 *               (Learning * 0.15) + (Appreciation * 0.15) - Deductions
 *
 * Component Weights:
 * - Performance (35%): KPI growth from tactical data
 * - Accountability (20%): Clients managed / Client capacity
 * - Discipline (15%): On-time attendance percentage
 * - Learning (15%): Learning hours logged / Required hours
 * - Appreciation (15%): Recognition from managers, clients, testimonials
 *
 * Deductions:
 * - Escalations: -5 points per escalation
 * - Client churn: -10 points per lost client
 */

import { prisma } from '@/server/db/prisma'

// Score weights
const WEIGHTS = {
  performance: 0.35,
  accountability: 0.20,
  discipline: 0.15,
  learning: 0.15,
  appreciation: 0.15,
}

// Deduction values
const DEDUCTIONS = {
  perEscalation: 5,
  perChurnedClient: 10,
}

// Grade thresholds
const GRADES: { min: number; grade: string }[] = [
  { min: 95, grade: 'A+' },
  { min: 85, grade: 'A' },
  { min: 75, grade: 'B+' },
  { min: 65, grade: 'B' },
  { min: 55, grade: 'C' },
  { min: 45, grade: 'D' },
  { min: 0, grade: 'F' },
]

export interface GrowthScoreInput {
  userId: string
  month: Date // First day of the month
}

export interface GrowthScoreResult {
  performanceScore: number
  accountabilityScore: number
  disciplineScore: number
  learningScore: number
  appreciationScore: number
  escalationDeduction: number
  churnDeduction: number
  finalScore: number
  grade: string
  breakdown: {
    clientsManaged: number
    clientCapacity: number
    presentDays: number
    lateDays: number
    absentDays: number
    onTimePercentage: number
    learningHoursLogged: number
    learningHoursRequired: number
    managerAppreciations: number
    clientAppreciations: number
    testimonials: number
    escalationsCount: number
    clientsLost: number
    performanceBreakdown: Record<string, number>
  }
}

function getGrade(score: number): string {
  for (const { min, grade } of GRADES) {
    if (score >= min) return grade
  }
  return 'F'
}

/**
 * Calculate Performance Score from tactical KPI entries
 * Measures growth across all KPIs vs previous month
 */
async function calculatePerformanceScore(
  userId: string,
  monthStart: Date,
  monthEnd: Date
): Promise<{ score: number; breakdown: Record<string, number> }> {
  const meeting = await prisma.tacticalMeeting.findFirst({
    where: {
      userId,
      month: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
    include: {
      kpiEntries: true,
    },
  })

  if (!meeting || meeting.kpiEntries.length === 0) {
    return { score: 0, breakdown: {} }
  }

  const breakdown: Record<string, number> = {}
  let totalScore = 0
  let metricCount = 0

  // Helper to safely calculate growth and score, avoiding division by zero and clamping negatives
  const calcGrowth = (current: number | null | undefined, prev: number | null | undefined, key: string) => {
    if (!current || !prev || prev <= 0) return
    const growth = ((current - prev) / prev) * 100
    breakdown[key] = Math.max(0, Math.min(growth, 100))
    totalScore += Math.max(0, Math.min(growth * 2, 100))
    metricCount++
  }

  for (const entry of meeting.kpiEntries) {
    if (entry.department === 'SOCIAL') {
      calcGrowth(entry.followers, entry.prevFollowers, 'followerGrowth')
      calcGrowth(entry.reachTotal, entry.prevReachTotal, 'reachGrowth')
      calcGrowth(entry.engagement, entry.prevEngagement, 'engagementGrowth')
    }

    if (entry.department === 'SEO') {
      calcGrowth(entry.organicTraffic, entry.prevOrganicTraffic, 'trafficGrowth')
      calcGrowth(entry.leads, entry.prevLeads, 'leadsGrowth')
    }

    if (entry.department === 'ADS') {
      calcGrowth(entry.roas, entry.prevRoas, 'roasGrowth')
      calcGrowth(entry.conversions, entry.prevConversions, 'conversionsGrowth')
    }
  }

  const score = metricCount > 0 ? Math.min(totalScore / metricCount, 100) : 0
  return { score, breakdown }
}

/**
 * Calculate Accountability Score
 * Based on clients managed vs expected capacity
 */
async function calculateAccountabilityScore(
  userId: string
): Promise<{ score: number; clientsManaged: number; clientCapacity: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      clientAssignments: {
        include: {
          client: true,
        },
      },
    },
  })

  if (!user) {
    return { score: 0, clientsManaged: 0, clientCapacity: 10 }
  }

  // Count active clients
  const activeClients = user.clientAssignments.filter(
    (a) => a.client.status === 'ACTIVE'
  ).length

  const capacity = user.clientCapacity || 10 // Default to 10 if not set

  // Score is percentage of capacity filled, capped at 100
  const score = Math.min((activeClients / capacity) * 100, 100)

  return {
    score,
    clientsManaged: activeClients,
    clientCapacity: capacity,
  }
}

/**
 * Calculate Discipline Score from attendance data
 */
async function calculateDisciplineScore(
  userId: string,
  monthStart: Date,
  monthEnd: Date
): Promise<{
  score: number
  presentDays: number
  lateDays: number
  absentDays: number
  onTimePercentage: number
}> {
  const attendance = await prisma.attendance.findMany({
    where: {
      userId,
      date: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
  })

  if (attendance.length === 0) {
    // No attendance data - score is 0
    return {
      score: 0,
      presentDays: 0,
      lateDays: 0,
      absentDays: 0,
      onTimePercentage: 0,
    }
  }

  let presentDays = 0
  let lateDays = 0
  let absentDays = 0
  let onTimeDays = 0

  for (const record of attendance) {
    if (record.status === 'PRESENT' || record.status === 'WFH') {
      presentDays++

      // Check if late
      if (record.checkIn) {
        const checkInTime = new Date(record.checkIn)
        const checkInHour = checkInTime.getHours()
        const checkInMinute = checkInTime.getMinutes()
        const isLate = checkInHour > 11 || (checkInHour === 11 && checkInMinute > 5)

        if (isLate) {
          lateDays++
        } else {
          onTimeDays++
        }
      }
    } else if (record.status === 'ABSENT') {
      absentDays++
    } else if (record.status === 'HALF_DAY') {
      presentDays += 0.5
    }
  }

  const onTimePercentage = presentDays > 0 ? (onTimeDays / presentDays) * 100 : 0

  // Score based on on-time percentage
  const score = onTimePercentage

  return {
    score,
    presentDays,
    lateDays,
    absentDays,
    onTimePercentage,
  }
}

/**
 * Calculate Learning Score from learning logs
 */
async function calculateLearningScore(
  userId: string,
  monthStart: Date,
  monthEnd: Date
): Promise<{ score: number; hoursLogged: number; hoursRequired: number }> {
  const logs = await prisma.learningLog.findMany({
    where: {
      userId,
      month: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
  })

  const totalMinutes = logs.reduce((sum, log) => sum + log.minutesWatched, 0)
  const hoursLogged = totalMinutes / 60
  const hoursRequired = 6 // 6 hours per month

  // Score based on percentage of required hours completed, capped at 100
  const score = Math.min((hoursLogged / hoursRequired) * 100, 100)

  return {
    score,
    hoursLogged,
    hoursRequired,
  }
}

/**
 * Calculate Appreciation Score
 * From manager appreciations, client testimonials, and recognitions
 */
async function calculateAppreciationScore(
  userId: string,
  monthStart: Date,
  monthEnd: Date
): Promise<{
  score: number
  managerAppreciations: number
  clientAppreciations: number
  testimonials: number
}> {
  // Get appreciations from managers
  const appreciations = await prisma.employeeAppreciation.findMany({
    where: {
      employeeId: userId,
      createdAt: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
  })

  // Get client feedback that's positive
  const clientFeedback = await prisma.employeeClientFeedback.findMany({
    where: {
      employeeId: userId,
      createdAt: {
        gte: monthStart,
        lt: monthEnd,
      },
      overallRating: {
        gte: 4, // 4 or 5 stars is positive
      },
    },
  })

  // Get achievements/recognitions
  const achievements = await prisma.achievement.findMany({
    where: {
      userId,
      month: {
        gte: monthStart,
        lt: monthEnd,
      },
      status: 'APPROVED',
    },
  })

  const managerAppreciations = appreciations.length
  const clientAppreciations = clientFeedback.length
  const testimonials = achievements.filter(a => a.type === 'TESTIMONIAL').length

  // Client satisfaction survey bonus/penalty
  // Find clients assigned to this user and check their monthly surveys
  let clientSurveyPoints = 0
  const assignedClients = await prisma.clientTeamMember.findMany({
    where: { userId },
    select: { clientId: true },
  })

  if (assignedClients.length > 0) {
    const clientSurveys = await prisma.clientFeedback.findMany({
      where: {
        clientId: { in: assignedClients.map((c) => c.clientId) },
        month: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      select: { overallSatisfaction: true },
    })

    for (const survey of clientSurveys) {
      if (survey.overallSatisfaction !== null) {
        if (survey.overallSatisfaction >= 4) {
          clientSurveyPoints += 15
        } else if (survey.overallSatisfaction <= 2) {
          clientSurveyPoints -= 10
        }
      }
    }
  }

  // Scoring: Each appreciation/testimonial adds 20 points, max 100
  const rawScore = (managerAppreciations * 20) + (clientAppreciations * 25) + (testimonials * 30) + clientSurveyPoints
  const score = Math.min(Math.max(rawScore, 0), 100)

  return {
    score,
    managerAppreciations,
    clientAppreciations,
    testimonials,
  }
}

/**
 * Calculate deductions from escalations and client churn
 */
async function calculateDeductions(
  userId: string,
  monthStart: Date,
  monthEnd: Date
): Promise<{
  escalationsCount: number
  escalationDeduction: number
  clientsLost: number
  churnDeduction: number
}> {
  // Get escalations received
  const escalations = await prisma.employeeEscalation.findMany({
    where: {
      employeeId: userId,
      createdAt: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
  })

  // Get churned clients from feedback
  const churnedClients = await prisma.clientFeedback.findMany({
    where: {
      churnedThisMonth: true,
      month: {
        gte: monthStart,
        lt: monthEnd,
      },
      client: {
        teamMembers: {
          some: {
            userId,
          },
        },
      },
    },
  })

  const escalationsCount = escalations.length
  const clientsLost = churnedClients.length

  return {
    escalationsCount,
    escalationDeduction: escalationsCount * DEDUCTIONS.perEscalation,
    clientsLost,
    churnDeduction: clientsLost * DEDUCTIONS.perChurnedClient,
  }
}

/**
 * Calculate complete growth score for a user for a given month
 */
export async function calculateGrowthScore(
  input: GrowthScoreInput
): Promise<GrowthScoreResult> {
  const { userId, month } = input

  // Calculate month range
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 1)

  // Calculate all component scores
  const [
    performanceData,
    accountabilityData,
    disciplineData,
    learningData,
    appreciationData,
    deductionData,
  ] = await Promise.all([
    calculatePerformanceScore(userId, monthStart, monthEnd),
    calculateAccountabilityScore(userId),
    calculateDisciplineScore(userId, monthStart, monthEnd),
    calculateLearningScore(userId, monthStart, monthEnd),
    calculateAppreciationScore(userId, monthStart, monthEnd),
    calculateDeductions(userId, monthStart, monthEnd),
  ])

  // Calculate weighted final score
  const weightedScore =
    (performanceData.score * WEIGHTS.performance) +
    (accountabilityData.score * WEIGHTS.accountability) +
    (disciplineData.score * WEIGHTS.discipline) +
    (learningData.score * WEIGHTS.learning) +
    (appreciationData.score * WEIGHTS.appreciation)

  // Apply deductions
  const totalDeductions = deductionData.escalationDeduction + deductionData.churnDeduction
  const finalScore = Math.max(weightedScore - totalDeductions, 0)

  // Get grade
  const grade = getGrade(finalScore)

  return {
    performanceScore: performanceData.score,
    accountabilityScore: accountabilityData.score,
    disciplineScore: disciplineData.score,
    learningScore: learningData.score,
    appreciationScore: appreciationData.score,
    escalationDeduction: deductionData.escalationDeduction,
    churnDeduction: deductionData.churnDeduction,
    finalScore,
    grade,
    breakdown: {
      clientsManaged: accountabilityData.clientsManaged,
      clientCapacity: accountabilityData.clientCapacity,
      presentDays: disciplineData.presentDays,
      lateDays: disciplineData.lateDays,
      absentDays: disciplineData.absentDays,
      onTimePercentage: disciplineData.onTimePercentage,
      learningHoursLogged: learningData.hoursLogged,
      learningHoursRequired: learningData.hoursRequired,
      managerAppreciations: appreciationData.managerAppreciations,
      clientAppreciations: appreciationData.clientAppreciations,
      testimonials: appreciationData.testimonials,
      escalationsCount: deductionData.escalationsCount,
      clientsLost: deductionData.clientsLost,
      performanceBreakdown: performanceData.breakdown,
    },
  }
}

/**
 * Save growth score to database
 */
export async function saveGrowthScore(
  userId: string,
  month: Date,
  result: GrowthScoreResult,
  submittedOnTime: boolean = false
): Promise<void> {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)

  await prisma.monthlyGrowthScore.upsert({
    where: {
      userId_month: {
        userId,
        month: monthStart,
      },
    },
    update: {
      performanceScore: result.performanceScore,
      performanceBreakdown: JSON.stringify(result.breakdown.performanceBreakdown),
      accountabilityScore: result.accountabilityScore,
      clientsManaged: result.breakdown.clientsManaged,
      clientCapacity: result.breakdown.clientCapacity,
      disciplineScore: result.disciplineScore,
      presentDays: result.breakdown.presentDays,
      lateDays: result.breakdown.lateDays,
      absentDays: result.breakdown.absentDays,
      onTimePercentage: result.breakdown.onTimePercentage,
      learningScore: result.learningScore,
      learningHoursLogged: result.breakdown.learningHoursLogged,
      learningHoursRequired: result.breakdown.learningHoursRequired,
      appreciationScore: result.appreciationScore,
      managerAppreciations: result.breakdown.managerAppreciations,
      clientAppreciations: result.breakdown.clientAppreciations,
      testimonials: result.breakdown.testimonials,
      escalationsCount: result.breakdown.escalationsCount,
      escalationDeduction: result.escalationDeduction,
      clientsLost: result.breakdown.clientsLost,
      churnDeduction: result.churnDeduction,
      finalScore: result.finalScore,
      scoreGrade: result.grade,
      tacticalDataSubmitted: true,
      submittedAt: new Date(),
      submittedOnTime,
    },
    create: {
      userId,
      month: monthStart,
      performanceScore: result.performanceScore,
      performanceBreakdown: JSON.stringify(result.breakdown.performanceBreakdown),
      accountabilityScore: result.accountabilityScore,
      clientsManaged: result.breakdown.clientsManaged,
      clientCapacity: result.breakdown.clientCapacity,
      disciplineScore: result.disciplineScore,
      presentDays: result.breakdown.presentDays,
      lateDays: result.breakdown.lateDays,
      absentDays: result.breakdown.absentDays,
      onTimePercentage: result.breakdown.onTimePercentage,
      learningScore: result.learningScore,
      learningHoursLogged: result.breakdown.learningHoursLogged,
      learningHoursRequired: result.breakdown.learningHoursRequired,
      appreciationScore: result.appreciationScore,
      managerAppreciations: result.breakdown.managerAppreciations,
      clientAppreciations: result.breakdown.clientAppreciations,
      testimonials: result.breakdown.testimonials,
      escalationsCount: result.breakdown.escalationsCount,
      escalationDeduction: result.escalationDeduction,
      clientsLost: result.breakdown.clientsLost,
      churnDeduction: result.churnDeduction,
      finalScore: result.finalScore,
      scoreGrade: result.grade,
      tacticalDataSubmitted: true,
      submittedAt: new Date(),
      submittedOnTime,
    },
  })
}

/**
 * Get average growth score for appraisal period
 */
export async function getAppraisalPeriodScores(
  userId: string,
  monthsBack: number = 12
): Promise<{
  scores: Array<{
    month: Date
    finalScore: number
    grade: string
  }>
  averageScore: number
  averageGrade: string
  breakdown: {
    performance: number
    accountability: number
    discipline: number
    learning: number
    appreciation: number
    escalationDeduction: number
    churnDeduction: number
  }
}> {
  const now = new Date()
  const startMonth = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1)
  const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const scoreRecords = await prisma.monthlyGrowthScore.findMany({
    where: {
      userId,
      month: {
        gte: startMonth,
        lt: endMonth,
      },
    },
    orderBy: { month: 'asc' },
  })

  const scores = scoreRecords.map((s) => ({
    month: s.month,
    finalScore: s.finalScore,
    grade: s.scoreGrade || 'N/A',
  }))

  const averageScore =
    scoreRecords.length > 0
      ? scoreRecords.reduce((sum, s) => sum + s.finalScore, 0) / scoreRecords.length
      : 0

  // Calculate average breakdown across all months
  const breakdown = {
    performance: scoreRecords.length > 0
      ? scoreRecords.reduce((sum, s) => sum + s.performanceScore, 0) / scoreRecords.length
      : 0,
    accountability: scoreRecords.length > 0
      ? scoreRecords.reduce((sum, s) => sum + s.accountabilityScore, 0) / scoreRecords.length
      : 0,
    discipline: scoreRecords.length > 0
      ? scoreRecords.reduce((sum, s) => sum + s.disciplineScore, 0) / scoreRecords.length
      : 0,
    learning: scoreRecords.length > 0
      ? scoreRecords.reduce((sum, s) => sum + s.learningScore, 0) / scoreRecords.length
      : 0,
    appreciation: scoreRecords.length > 0
      ? scoreRecords.reduce((sum, s) => sum + s.appreciationScore, 0) / scoreRecords.length
      : 0,
    escalationDeduction: scoreRecords.reduce((sum, s) => sum + s.escalationDeduction, 0),
    churnDeduction: scoreRecords.reduce((sum, s) => sum + s.churnDeduction, 0),
  }

  return {
    scores,
    averageScore,
    averageGrade: getGrade(averageScore),
    breakdown,
  }
}
