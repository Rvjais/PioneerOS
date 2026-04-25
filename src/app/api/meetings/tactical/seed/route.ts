import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// KPI type mapping based on role - used when department alone is insufficient
// to determine the correct KPI category for an employee
const ROLE_KPI_TYPE: Record<string, string> = {
  'SUPER_ADMIN': 'MANAGER',
  'MANAGER': 'MANAGER',
  'SALES': 'SALES',
  'ACCOUNTS': 'ACCOUNTS',
  'FREELANCER': 'VIDEO_EDITING',
}

// Seed tactical meeting dummy data for Jan & Feb 2026
export const POST = withAuth(async (req, { user }) => {
  try {
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all employees with their departments and KPI type overrides
    const employees = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        role: { in: ['EMPLOYEE', 'SALES', 'ACCOUNTS', 'MANAGER', 'SUPER_ADMIN', 'FREELANCER'] }
      },
      select: {
        id: true,
        empId: true,
        firstName: true,
        lastName: true,
        department: true,
        role: true,
      }
    })

    // Get all clients
    const clients = await prisma.client.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: { id: true, name: true },
    })

    // Get existing client team assignments
    const clientAssignments = await prisma.clientTeamMember.findMany({
      select: {
        userId: true,
        clientId: true,
      }
    })

    // Create assignment map
    const assignmentMap = new Map<string, string[]>()
    clientAssignments.forEach(a => {
      if (!assignmentMap.has(a.userId)) {
        assignmentMap.set(a.userId, [])
      }
      assignmentMap.get(a.userId)!.push(a.clientId)
    })

    // Define months to seed
    const months = [
      { month: new Date('2026-01-01'), reportingMonth: new Date('2025-12-01'), label: 'January' },
      { month: new Date('2026-02-01'), reportingMonth: new Date('2026-01-01'), label: 'February' },
    ]

    let created = 0
    let assignmentsCreated = 0

    for (const employee of employees) {
      // Determine KPI type from role override or fall back to department
      const kpiType = ROLE_KPI_TYPE[employee.role] || employee.department

      // Get assigned clients or assign some if none
      let employeeClients = assignmentMap.get(employee.id) || []

      // If no assignments, assign some random clients based on role
      if (employeeClients.length === 0 && clients.length > 0) {
        // Different client counts based on role
        let clientCount = 3
        if (['MANAGER', 'SUPER_ADMIN'].includes(employee.role)) {
          clientCount = 6
        } else if (employee.department === 'OPERATIONS') {
          clientCount = 5
        } else if (['FREELANCER'].includes(employee.role)) {
          clientCount = 2
        }

        const shuffled = [...clients].sort(() => Math.random() - 0.5)
        employeeClients = shuffled.slice(0, Math.min(clientCount, shuffled.length)).map(c => c.id)

        // Create client assignments
        for (const clientId of employeeClients) {
          try {
            await prisma.clientTeamMember.create({
              data: {
                userId: employee.id,
                clientId,
                role: getRoleForDepartment(kpiType),
              }
            })
            assignmentsCreated++
          } catch {
            // Already exists, ignore
          }
        }
      }

      if (employeeClients.length === 0) continue

      for (const monthData of months) {
        // Check if meeting already exists
        const existing = await prisma.tacticalMeeting.findUnique({
          where: {
            userId_month: {
              userId: employee.id,
              month: monthData.month,
            }
          }
        })

        if (existing) continue

        // Generate dummy KPI data based on KPI type
        const kpiEntries = generateDummyKPIs(
          kpiType,
          employeeClients,
          monthData.label
        )

        // Create tactical meeting
        await prisma.tacticalMeeting.create({
          data: {
            userId: employee.id,
            month: monthData.month,
            reportingMonth: monthData.reportingMonth,
            status: 'SUBMITTED',
            submittedAt: new Date(monthData.month.getTime() + 2 * 24 * 60 * 60 * 1000),
            submittedOnTime: true,
            performanceScore: Math.random() * 20 + 70,
            accountabilityScore: Math.random() * 20 + 75,
            clientSatisfactionScore: Math.random() * 15 + 80,
            overallScore: Math.random() * 15 + 78,
            kpiEntries: {
              create: kpiEntries.map(entry => ({
                clientId: entry.clientId,
                department: kpiType,
                ...entry.data
              }))
            }
          }
        })

        created++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${created} tactical meetings with KPI data. Created ${assignmentsCreated} client assignments.`,
      employees: employees.length,
      clients: clients.length
    })

  } catch (error) {
    console.error('Error seeding tactical meetings:', error)
    return NextResponse.json({ error: 'Failed to seed data: ' + (error as Error).message }, { status: 500 })
  }
})

function getRoleForDepartment(dept: string): string {
  const roleMap: Record<string, string> = {
    'SEO': 'SEO_SPECIALIST',
    'ADS': 'ADS_SPECIALIST',
    'SOCIAL': 'SOCIAL_MANAGER',
    'WEB': 'WEB_DEVELOPER',
    'OPERATIONS': 'ACCOUNT_MANAGER',
    'MANAGER': 'ACCOUNT_MANAGER',
    'HR': 'HR_PARTNER',
    'ACCOUNTS': 'ACCOUNTS_MANAGER',
    'SALES': 'BD_EXECUTIVE',
    'YOUTUBE': 'YOUTUBE_MANAGER',
    'VIDEO_EDITING': 'VIDEO_EDITOR',
    'DESIGN': 'DESIGNER',
  }
  return roleMap[dept] || 'TEAM_MEMBER'
}

function generateDummyKPIs(kpiType: string, clientIds: string[], month: string) {
  const isJan = month === 'January'
  const baseMultiplier = isJan ? 1 : 1.1

  return clientIds.map(clientId => {
    const data: Record<string, number | string | null> = {}

    switch (kpiType) {
      case 'SEO':
        data.organicTraffic = Math.floor((Math.random() * 5000 + 2000) * baseMultiplier)
        data.prevOrganicTraffic = Math.floor(Math.random() * 4500 + 1800)
        data.leads = Math.floor((Math.random() * 50 + 20) * baseMultiplier)
        data.prevLeads = Math.floor(Math.random() * 45 + 15)
        data.gbpCalls = Math.floor((Math.random() * 100 + 30) * baseMultiplier)
        data.prevGbpCalls = Math.floor(Math.random() * 90 + 25)
        data.gbpDirections = Math.floor((Math.random() * 80 + 20) * baseMultiplier)
        data.prevGbpDirections = Math.floor(Math.random() * 70 + 15)
        data.keywordsTop3 = Math.floor((Math.random() * 20 + 5) * baseMultiplier)
        data.prevKeywordsTop3 = Math.floor(Math.random() * 18 + 3)
        data.keywordsTop10 = Math.floor((Math.random() * 50 + 20) * baseMultiplier)
        data.prevKeywordsTop10 = Math.floor(Math.random() * 45 + 15)
        data.keywordsTop20 = Math.floor((Math.random() * 80 + 30) * baseMultiplier)
        data.prevKeywordsTop20 = Math.floor(Math.random() * 70 + 25)
        data.backlinksBuilt = Math.floor((Math.random() * 30 + 10) * baseMultiplier)
        data.prevBacklinksBuilt = Math.floor(Math.random() * 25 + 8)
        data.trafficGrowth = calculateGrowth(data.organicTraffic as number, data.prevOrganicTraffic as number)
        data.leadsGrowth = calculateGrowth(data.leads as number, data.prevLeads as number)
        break

      case 'ADS':
        data.adSpend = Math.floor((Math.random() * 100000 + 20000) * baseMultiplier)
        data.prevAdSpend = Math.floor(Math.random() * 90000 + 18000)
        data.impressions = Math.floor((Math.random() * 500000 + 100000) * baseMultiplier)
        data.prevImpressions = Math.floor(Math.random() * 450000 + 90000)
        data.clicks = Math.floor((Math.random() * 5000 + 1000) * baseMultiplier)
        data.prevClicks = Math.floor(Math.random() * 4500 + 900)
        data.conversions = Math.floor((Math.random() * 100 + 30) * baseMultiplier)
        data.prevConversions = Math.floor(Math.random() * 90 + 25)
        data.costPerConversion = Math.floor((data.adSpend as number) / ((data.conversions as number) || 1))
        data.prevCostPerConversion = Math.floor((data.prevAdSpend as number) / ((data.prevConversions as number) || 1))
        data.roas = parseFloat(((Math.random() * 3 + 2) * baseMultiplier).toFixed(2))
        data.prevRoas = parseFloat((Math.random() * 2.8 + 1.8).toFixed(2))
        break

      case 'SOCIAL':
        data.followers = Math.floor((Math.random() * 50000 + 10000) * baseMultiplier)
        data.prevFollowers = Math.floor(Math.random() * 45000 + 9000)
        data.engagement = parseFloat(((Math.random() * 5 + 2) * baseMultiplier).toFixed(2))
        data.prevEngagement = parseFloat((Math.random() * 4.5 + 1.8).toFixed(2))
        data.postsPublished = Math.floor((Math.random() * 30 + 15) * baseMultiplier)
        data.prevPostsPublished = Math.floor(Math.random() * 28 + 12)
        data.reachTotal = Math.floor((Math.random() * 200000 + 50000) * baseMultiplier)
        data.prevReachTotal = Math.floor(Math.random() * 180000 + 45000)
        data.videoViews = Math.floor((Math.random() * 100000 + 20000) * baseMultiplier)
        data.prevVideoViews = Math.floor(Math.random() * 90000 + 18000)
        data.reelsPublished = Math.floor((Math.random() * 15 + 5) * baseMultiplier)
        data.prevReelsPublished = Math.floor(Math.random() * 12 + 4)
        data.storiesPublished = Math.floor((Math.random() * 40 + 20) * baseMultiplier)
        data.prevStoriesPublished = Math.floor(Math.random() * 35 + 18)
        break

      case 'YOUTUBE':
        data.videosPublished = Math.floor((Math.random() * 10 + 4) * baseMultiplier)
        data.prevVideosPublished = Math.floor(Math.random() * 8 + 3)
        data.shortsPublished = Math.floor((Math.random() * 20 + 10) * baseMultiplier)
        data.prevShortsPublished = Math.floor(Math.random() * 18 + 8)
        data.subscribers = Math.floor((Math.random() * 5000 + 1000) * baseMultiplier)
        data.prevSubscribers = Math.floor(Math.random() * 4500 + 900)
        data.totalViews = Math.floor((Math.random() * 100000 + 20000) * baseMultiplier)
        data.prevTotalViews = Math.floor(Math.random() * 90000 + 18000)
        data.watchTimeHours = Math.floor((Math.random() * 500 + 100) * baseMultiplier)
        data.prevWatchTimeHours = Math.floor(Math.random() * 450 + 90)
        data.avgViewDuration = parseFloat(((Math.random() * 5 + 2) * baseMultiplier).toFixed(1))
        data.prevAvgViewDuration = parseFloat((Math.random() * 4.5 + 1.8).toFixed(1))
        data.ctr = parseFloat(((Math.random() * 8 + 3) * baseMultiplier).toFixed(1))
        data.prevCtr = parseFloat((Math.random() * 7 + 2.5).toFixed(1))
        break

      case 'VIDEO_EDITING':
        data.videosEdited = Math.floor((Math.random() * 15 + 8) * baseMultiplier)
        data.prevVideosEdited = Math.floor(Math.random() * 13 + 6)
        data.shortsEdited = Math.floor((Math.random() * 25 + 15) * baseMultiplier)
        data.prevShortsEdited = Math.floor(Math.random() * 22 + 12)
        data.thumbnailsCreated = Math.floor((Math.random() * 20 + 10) * baseMultiplier)
        data.prevThumbnailsCreated = Math.floor(Math.random() * 18 + 8)
        data.revisionRate = parseFloat((Math.random() * 15 + 5).toFixed(1))
        data.prevRevisionRate = parseFloat((Math.random() * 18 + 6).toFixed(1))
        data.onTimeDelivery = parseFloat((Math.random() * 10 + 85).toFixed(1))
        data.prevOnTimeDelivery = parseFloat((Math.random() * 12 + 82).toFixed(1))
        break

      case 'DESIGN':
        data.postsDesigned = Math.floor((Math.random() * 40 + 20) * baseMultiplier)
        data.prevPostsDesigned = Math.floor(Math.random() * 35 + 18)
        data.creativeAssets = Math.floor((Math.random() * 30 + 15) * baseMultiplier)
        data.prevCreativeAssets = Math.floor(Math.random() * 27 + 12)
        data.brandsManaged = Math.floor((Math.random() * 6 + 3) * baseMultiplier)
        data.prevBrandsManaged = Math.floor(Math.random() * 5 + 2)
        data.revisionRate = parseFloat((Math.random() * 12 + 3).toFixed(1))
        data.prevRevisionRate = parseFloat((Math.random() * 15 + 4).toFixed(1))
        data.onTimeDelivery = parseFloat((Math.random() * 8 + 88).toFixed(1))
        data.prevOnTimeDelivery = parseFloat((Math.random() * 10 + 85).toFixed(1))
        break

      case 'WEB':
        data.pageSpeed = Math.floor(Math.random() * 20 + 75)
        data.prevPageSpeed = Math.floor(Math.random() * 18 + 70)
        data.bounceRate = parseFloat((Math.random() * 20 + 30).toFixed(2))
        data.prevBounceRate = parseFloat((Math.random() * 22 + 32).toFixed(2))
        data.avgSessionDuration = parseFloat((Math.random() * 120 + 60).toFixed(0))
        data.prevAvgSessionDuration = parseFloat((Math.random() * 100 + 55).toFixed(0))
        data.pagesBuilt = Math.floor((Math.random() * 10 + 2) * baseMultiplier)
        data.prevPagesBuilt = Math.floor(Math.random() * 8 + 1)
        data.bugsFixed = Math.floor((Math.random() * 15 + 5) * baseMultiplier)
        data.prevBugsFixed = Math.floor(Math.random() * 12 + 4)
        break

      case 'SALES':
        data.leadsGenerated = Math.floor((Math.random() * 50 + 20) * baseMultiplier)
        data.prevLeadsGenerated = Math.floor(Math.random() * 45 + 15)
        data.callsMade = Math.floor((Math.random() * 200 + 100) * baseMultiplier)
        data.prevCallsMade = Math.floor(Math.random() * 180 + 90)
        data.meetingsScheduled = Math.floor((Math.random() * 30 + 10) * baseMultiplier)
        data.prevMeetingsScheduled = Math.floor(Math.random() * 25 + 8)
        data.proposalsSent = Math.floor((Math.random() * 20 + 5) * baseMultiplier)
        data.prevProposalsSent = Math.floor(Math.random() * 18 + 4)
        data.dealsWon = Math.floor((Math.random() * 8 + 2) * baseMultiplier)
        data.prevDealsWon = Math.floor(Math.random() * 6 + 1)
        data.revenueGenerated = Math.floor((Math.random() * 500000 + 100000) * baseMultiplier)
        data.prevRevenueGenerated = Math.floor(Math.random() * 450000 + 80000)
        data.conversionRate = parseFloat(((Math.random() * 15 + 10) * baseMultiplier).toFixed(1))
        data.prevConversionRate = parseFloat((Math.random() * 13 + 8).toFixed(1))
        break

      case 'HR':
        data.candidatesSourced = Math.floor((Math.random() * 50 + 20) * baseMultiplier)
        data.prevCandidatesSourced = Math.floor(Math.random() * 45 + 15)
        data.interviewsConducted = Math.floor((Math.random() * 30 + 10) * baseMultiplier)
        data.prevInterviewsConducted = Math.floor(Math.random() * 25 + 8)
        data.offersExtended = Math.floor((Math.random() * 10 + 2) * baseMultiplier)
        data.prevOffersExtended = Math.floor(Math.random() * 8 + 1)
        data.joineesOnboarded = Math.floor((Math.random() * 5 + 1) * baseMultiplier)
        data.prevJoineesOnboarded = Math.floor(Math.random() * 4 + 0)
        data.employeeNPS = Math.floor(Math.random() * 20 + 70)
        data.prevEmployeeNPS = Math.floor(Math.random() * 18 + 68)
        data.attritionRate = parseFloat((Math.random() * 5 + 2).toFixed(1))
        data.prevAttritionRate = parseFloat((Math.random() * 6 + 3).toFixed(1))
        data.trainingHoursDelivered = Math.floor((Math.random() * 20 + 10) * baseMultiplier)
        data.prevTrainingHoursDelivered = Math.floor(Math.random() * 18 + 8)
        break

      case 'ACCOUNTS':
        data.invoicesGenerated = Math.floor((Math.random() * 50 + 20) * baseMultiplier)
        data.prevInvoicesGenerated = Math.floor(Math.random() * 45 + 15)
        data.paymentsCollected = Math.floor((Math.random() * 1000000 + 200000) * baseMultiplier)
        data.prevPaymentsCollected = Math.floor(Math.random() * 900000 + 180000)
        data.outstandingAmount = Math.floor(Math.random() * 300000 + 50000)
        data.prevOutstandingAmount = Math.floor(Math.random() * 350000 + 60000)
        data.clientsServiced = Math.floor((Math.random() * 30 + 15) * baseMultiplier)
        data.prevClientsServiced = Math.floor(Math.random() * 28 + 12)
        data.onboardingsCompleted = Math.floor((Math.random() * 5 + 1) * baseMultiplier)
        data.prevOnboardingsCompleted = Math.floor(Math.random() * 4 + 0)
        data.collectionRate = parseFloat((Math.random() * 10 + 85).toFixed(1))
        data.prevCollectionRate = parseFloat((Math.random() * 12 + 82).toFixed(1))
        break

      case 'OPERATIONS':
        data.clientsManaged = Math.floor((Math.random() * 12 + 5) * baseMultiplier)
        data.prevClientsManaged = Math.floor(Math.random() * 10 + 4)
        data.clientNPS = Math.floor(Math.random() * 15 + 75)
        data.prevClientNPS = Math.floor(Math.random() * 12 + 72)
        data.tasksCompleted = Math.floor((Math.random() * 100 + 50) * baseMultiplier)
        data.prevTasksCompleted = Math.floor(Math.random() * 90 + 45)
        data.escalationsResolved = Math.floor((Math.random() * 15 + 5) * baseMultiplier)
        data.prevEscalationsResolved = Math.floor(Math.random() * 12 + 4)
        data.deliverablesMet = parseFloat((Math.random() * 10 + 85).toFixed(1))
        data.prevDeliverablesMet = parseFloat((Math.random() * 12 + 82).toFixed(1))
        data.clientRetention = parseFloat((Math.random() * 5 + 92).toFixed(1))
        data.prevClientRetention = parseFloat((Math.random() * 7 + 90).toFixed(1))
        data.responseTime = Math.floor(Math.random() * 4 + 2)
        data.prevResponseTime = Math.floor(Math.random() * 5 + 3)
        break

      case 'MANAGER':
        data.teamSize = Math.floor(Math.random() * 10 + 5)
        data.prevTeamSize = Math.floor(Math.random() * 9 + 4)
        data.teamProductivity = parseFloat((Math.random() * 15 + 80).toFixed(1))
        data.prevTeamProductivity = parseFloat((Math.random() * 17 + 77).toFixed(1))
        data.projectsDelivered = Math.floor((Math.random() * 20 + 10) * baseMultiplier)
        data.prevProjectsDelivered = Math.floor(Math.random() * 18 + 8)
        data.clientSatisfaction = parseFloat((Math.random() * 2 + 7.5).toFixed(1))
        data.prevClientSatisfaction = parseFloat((Math.random() * 2.2 + 7.2).toFixed(1))
        data.revenueManaged = Math.floor((Math.random() * 2000000 + 500000) * baseMultiplier)
        data.prevRevenueManaged = Math.floor(Math.random() * 1800000 + 450000)
        data.teamRetention = parseFloat((Math.random() * 5 + 92).toFixed(1))
        data.prevTeamRetention = parseFloat((Math.random() * 7 + 90).toFixed(1))
        data.processImprovements = Math.floor((Math.random() * 5 + 1) * baseMultiplier)
        data.prevProcessImprovements = Math.floor(Math.random() * 4 + 0)
        break

      case 'OM_BLENDED':
        // HR KPIs
        data.candidatesSourced = Math.floor((Math.random() * 30 + 10) * baseMultiplier)
        data.prevCandidatesSourced = Math.floor(Math.random() * 25 + 8)
        data.interviewsConducted = Math.floor((Math.random() * 20 + 5) * baseMultiplier)
        data.prevInterviewsConducted = Math.floor(Math.random() * 18 + 4)
        data.joineesOnboarded = Math.floor((Math.random() * 3 + 1) * baseMultiplier)
        data.prevJoineesOnboarded = Math.floor(Math.random() * 2 + 0)
        // Social CS KPIs
        data.clientsManaged = Math.floor((Math.random() * 10 + 5) * baseMultiplier)
        data.prevClientsManaged = Math.floor(Math.random() * 8 + 4)
        data.clientNPS = Math.floor(Math.random() * 15 + 75)
        data.prevClientNPS = Math.floor(Math.random() * 12 + 72)
        data.deliverablesMet = parseFloat((Math.random() * 10 + 85).toFixed(1))
        data.prevDeliverablesMet = parseFloat((Math.random() * 12 + 82).toFixed(1))
        data.escalationsResolved = Math.floor((Math.random() * 10 + 3) * baseMultiplier)
        data.prevEscalationsResolved = Math.floor(Math.random() * 8 + 2)
        break

      default:
        // Generic KPIs
        data.tasksCompleted = Math.floor((Math.random() * 50 + 20) * baseMultiplier)
        data.prevTasksCompleted = Math.floor(Math.random() * 45 + 18)
        data.deliverablesMet = parseFloat((Math.random() * 10 + 85).toFixed(1))
        data.prevDeliverablesMet = parseFloat((Math.random() * 12 + 82).toFixed(1))
        break
    }

    // Add notes
    data.achievements = generateAchievement(kpiType)
    data.challenges = generateChallenge(kpiType)
    data.nextMonthPlan = generatePlan(kpiType)

    return { clientId, data }
  })
}

function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

function generateAchievement(kpiType: string): string {
  const achievements: Record<string, string[]> = {
    SEO: [
      'Achieved 25% traffic growth for healthcare clients',
      'Ranked 3 new keywords in top 3 positions',
      'Improved GBP calls by 40% through optimization',
    ],
    ADS: [
      'Reduced cost per conversion by 15%',
      'Achieved 4.5x ROAS on Meta campaigns',
      'Generated 120+ leads with optimized targeting',
    ],
    SOCIAL: [
      'Viral reel crossed 1M views',
      'Increased engagement rate by 35%',
      'Successfully launched 3 new brand accounts',
    ],
    YOUTUBE: [
      'Video crossed 100K views organically',
      'Improved CTR to 8.5% on thumbnails',
      'Gained 2000+ new subscribers',
    ],
    HR: [
      'Successfully onboarded 3 new team members',
      'Reduced time-to-hire by 20%',
      'Achieved 85 employee NPS score',
    ],
    SALES: [
      'Closed 5 new deals worth ₹8L MRR',
      'Improved conversion rate to 18%',
      'Generated 50+ qualified leads',
    ],
    ACCOUNTS: [
      'Achieved 95% collection rate',
      'Onboarded 4 new clients smoothly',
      'Reduced outstanding by 30%',
    ],
    OPERATIONS: [
      'Maintained 95% client satisfaction',
      'Resolved 15 escalations within SLA',
      'Improved response time to under 2 hours',
    ],
    default: [
      'Exceeded targets by 15%',
      'Improved efficiency in key areas',
      'Received positive client feedback',
    ],
  }
  const list = achievements[kpiType] || achievements.default
  return list[Math.floor(Math.random() * list.length)]
}

function generateChallenge(kpiType: string): string {
  const challenges: Record<string, string[]> = {
    SEO: ['Algorithm update impacted some rankings', 'Resource constraints for content creation'],
    ADS: ['Rising CPCs in competitive niches', 'iOS tracking limitations'],
    SOCIAL: ['Platform algorithm changes', 'Content approval delays'],
    YOUTUBE: ['Increased competition in niche', 'Production delays'],
    HR: ['Candidate availability challenges', 'Competitive hiring market'],
    SALES: ['Longer sales cycles', 'Budget constraints from prospects'],
    ACCOUNTS: ['Payment delays from some clients', 'Documentation backlogs'],
    OPERATIONS: ['Multiple client escalations', 'Team bandwidth constraints'],
    default: ['Resource constraints', 'Timeline pressures'],
  }
  const list = challenges[kpiType] || challenges.default
  return list[Math.floor(Math.random() * list.length)]
}

function generatePlan(kpiType: string): string {
  const plans: Record<string, string[]> = {
    SEO: ['Focus on E-E-A-T improvements', 'Launch local SEO campaign for 5 GBPs'],
    ADS: ['Test new audience segments', 'Implement conversion API for better tracking'],
    SOCIAL: ['Launch UGC campaign', 'Increase Reels frequency to 5/week'],
    YOUTUBE: ['Implement Shorts strategy', 'Improve thumbnail A/B testing'],
    HR: ['Streamline onboarding process', 'Launch employee wellness program'],
    SALES: ['Focus on upselling existing clients', 'Improve proposal templates'],
    ACCOUNTS: ['Automate invoice reminders', 'Improve client onboarding documentation'],
    OPERATIONS: ['Implement client health dashboard', 'Reduce average response time'],
    default: ['Focus on process improvements', 'Enhance client communication'],
  }
  const list = plans[kpiType] || plans.default
  return list[Math.floor(Math.random() * list.length)]
}
