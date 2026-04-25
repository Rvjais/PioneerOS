import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { DailyTaskPlannerClient } from './DailyTaskPlannerClient'
import { cookies } from 'next/headers'

// Role-specific view type
type ViewType = 'default' | 'bd' | 'hr' | 'ops'

function getRoleView(role: string, department: string): ViewType {
  if (department === 'SALES' || role === 'SALES') return 'bd'
  if (department === 'HR') return 'hr'
  if (department === 'OPERATIONS' || role === 'OPERATIONS_HEAD') return 'ops'
  return 'default'
}

// Helper to serialize dates in objects
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

async function getDailyPlan(userId: string, date: Date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const plan = await prisma.dailyTaskPlan.findUnique({
    where: {
      userId_date: {
        userId,
        date: startOfDay,
      },
    },
    include: {
      tasks: {
        include: {
          client: { select: { id: true, name: true } },
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      },
    },
  })

  return plan ? serializeData(plan) : null
}

async function getClients(userId: string, role: string, department: string, isManager: boolean) {
  // HR department doesn't work with clients - return empty
  if (department === 'HR') {
    return []
  }

  // Managers (SUPER_ADMIN, MANAGER), ACCOUNTS, SEO, and ADS departments can see all active clients
  // SEO and ADS work across multiple clients, so they need access to all active clients
  if (isManager || department === 'ACCOUNTS' || role === 'ACCOUNTS' ||
      department === 'SEO' || role === 'SEO' ||
      department === 'ADS' || role === 'ADS') {
    return prisma.client.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    })
  }

  // All other roles only see clients they're allocated/assigned to
  const assignments = await prisma.clientTeamMember.findMany({
    where: { userId },
    select: { clientId: true },
  })

  const clientIds = assignments.map(a => a.clientId)

  // If no clients allocated, return empty array
  if (clientIds.length === 0) {
    return []
  }

  return prisma.client.findMany({
    where: {
      id: { in: clientIds },
      status: 'ACTIVE',
    },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

async function getTeamPlans(date: Date, department: string, isManager: boolean) {
  if (!isManager) return []

  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const plans = await prisma.dailyTaskPlan.findMany({
    where: {
      date: startOfDay,
      user: { department },
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, department: true },
      },
      tasks: {
        include: {
          client: { select: { id: true, name: true } },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return serializeData(plans)
}

async function getEscalations(date: Date, isManager: boolean, department: string) {
  if (!isManager) return { underFourHours: [], breakdowns: [] }

  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const underFourHours = await prisma.dailyTaskPlan.findMany({
    where: {
      date: startOfDay,
      hasUnder4Hours: true,
      user: { department },
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  const breakdowns = await prisma.dailyTask.findMany({
    where: {
      isBreakdown: true,
      plan: {
        date: startOfDay,
        user: { department },
      },
    },
    include: {
      plan: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      client: { select: { name: true } },
    },
  })

  return serializeData({ underFourHours, breakdowns })
}

// Fetch leads for BD/Sales view
async function getLeads(userId: string, isSales: boolean) {
  if (!isSales) return []

  const leads = await prisma.lead.findMany({
    where: {
      assignedToId: userId,
      stage: { not: 'LOST' },
      deletedAt: null,
    },
    select: {
      id: true,
      companyName: true,
      contactName: true,
      stage: true,
      value: true,
      nextFollowUp: true,
      lastContactedAt: true,
    },
    orderBy: { nextFollowUp: 'asc' },
    take: 50,
  })

  return serializeData(leads)
}

// Fetch HR pipeline tasks
async function getHRPipelineTasks(userId: string, isHR: boolean) {
  if (!isHR) return []

  const tasks = await prisma.hRPipelineTask.findMany({
    orderBy: [{ startDate: 'asc' }, { createdAt: 'desc' }],
    take: 50,
  })

  return serializeData(tasks)
}

// Fetch tasks pending manager review
async function getPendingReviewTasks(department: string, isManager: boolean) {
  if (!isManager) return []

  const tasks = await prisma.dailyTask.findMany({
    where: {
      status: 'COMPLETED',
      proofUrl: { not: null },
      managerReviewed: false,
      plan: {
        user: { department },
      },
    },
    include: {
      plan: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      client: { select: { id: true, name: true } },
    },
    orderBy: { completedAt: 'desc' },
  })

  return serializeData(tasks.map(task => ({
    id: task.id,
    description: task.description,
    activityType: task.activityType,
    status: task.status,
    plannedHours: task.plannedHours,
    actualHours: task.actualHours,
    proofUrl: task.proofUrl,
    deliverable: task.deliverable,
    clientName: task.client?.name || null,
    completedAt: task.completedAt,
    managerReviewed: task.managerReviewed,
    managerRating: task.managerRating,
    managerFeedback: task.managerFeedback,
    user: {
      id: task.plan.user.id,
      firstName: task.plan.user.firstName,
      lastName: task.plan.user.lastName,
    },
  })))
}

export default async function DailyTaskPlannerPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Check for viewAs param in cookies (set when admin clicks "Access Dashboard")
  const cookieStore = await cookies()
  const viewAsUserId = cookieStore.get('viewAsUserId')?.value || undefined

  // When admin is viewing as another user, show that user's plan
  const effectiveUserId = viewAsUserId || session.user.id
  const userId = session.user.id
  const department = session.user.department
  const role = session.user.role
  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(role)

  // Determine role-specific view
  const viewType = getRoleView(role, effectiveUserId !== userId ? 'EMPLOYEE' : department) // Use viewed user's department
  const isSales = viewType === 'bd'
  const isHR = viewType === 'hr'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [myPlan, clients, teamPlans, escalations, leads, hrPipelineTasks, pendingReviewTasks] = await Promise.all([
    getDailyPlan(effectiveUserId, today), // Use effective user for their plan
    getClients(effectiveUserId, role, effectiveUserId !== userId ? 'EMPLOYEE' : department, isManager),
    getTeamPlans(today, effectiveUserId !== userId ? 'EMPLOYEE' : department, isManager),
    getEscalations(today, isManager, effectiveUserId !== userId ? 'EMPLOYEE' : department),
    getLeads(effectiveUserId, isSales),
    getHRPipelineTasks(effectiveUserId, isHR),
    getPendingReviewTasks(effectiveUserId !== userId ? 'EMPLOYEE' : department, isManager),
  ])

  // Ensure MASH channel exists for company announcements
  const mashChannel = await prisma.chatChannel.findFirst({
    where: { isMash: true },
  })

  if (!mashChannel) {
    await prisma.chatChannel.create({
      data: {
        name: 'MASH',
        slug: 'mash',
        description: 'Management & Assistance System Hub - Official company announcements',
        type: 'MASH',
        isMash: true,
        isReadOnly: true,
        icon: 'megaphone',
      },
    })
  }

  // Type-safe serialized data for client component
  type SerializedPlan = {
    id: string
    date: string
    status: string
    submittedAt: string | null
    submittedBeforeHuddle: boolean
    totalPlannedHours: number
    totalActualHours: number
    hasUnder4Hours: boolean
    tasks: Array<{
      id: string
      clientId: string | null
      client: { id: string; name: string } | null
      clientName: string | null
      activityType: string
      description: string
      plannedStartTime: string | null
      plannedHours: number
      actualStartTime: string | null
      actualEndTime: string | null
      actualHours: number | null
      addedAt: string
      startedAt: string | null
      completedAt: string | null
      status: string
      isBreakdown: boolean
      breakdownReason: string | null
      priority: string
      sortOrder: number
      notes: string | null
    }>
  }

  type SerializedTeamPlan = SerializedPlan & {
    user: { id: string; firstName: string; lastName: string | null; department: string }
  }

  type SerializedLead = {
    id: string
    companyName: string
    contactName: string
    stage: string
    value: number | null
    nextFollowUp: string | null
    lastContactedAt: string | null
  }

  type SerializedHRTask = {
    id: string
    userId: string
    candidateId?: string
    employeeId?: string
    taskType: string
    title: string
    startDate: string
    endDate?: string | null
    duration?: number
    progress: number
    dependencies?: string
    status: string
  }

  type SerializedPendingReviewTask = {
    id: string
    description: string
    activityType: string
    status: string
    plannedHours: number
    actualHours: number | null
    proofUrl: string | null
    deliverable: string | null
    clientName: string | null
    completedAt: string | null
    managerReviewed: boolean
    managerRating: number | null
    managerFeedback: string | null
    user: {
      id: string
      firstName: string
      lastName: string | null
    }
  }

  return (
    <DailyTaskPlannerClient
      initialPlan={myPlan as unknown as SerializedPlan | null}
      clients={clients}
      teamPlans={teamPlans as unknown as SerializedTeamPlan[]}
      escalations={escalations}
      currentUserId={userId}
      department={effectiveUserId !== userId ? 'viewed' : department}
      role={role}
      isManager={isManager}
      viewType={viewType}
      leads={leads as unknown as SerializedLead[]}
      hrPipelineTasks={hrPipelineTasks as unknown as SerializedHRTask[]}
      pendingReviewTasks={pendingReviewTasks as unknown as SerializedPendingReviewTask[]}
      viewAsUserId={effectiveUserId !== userId ? effectiveUserId : undefined}
    />
  )
}
