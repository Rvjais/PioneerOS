import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import DepartmentTacticalClient from './DepartmentTacticalClient'
import { DEPARTMENT_KPIS } from '@/shared/constants/kpiDefinitions'

export default async function DepartmentTacticalPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id
  const userDept = session.user.department as string
  const userRole = session.user.role as string
  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(userRole)

  // Get current and previous month boundaries
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      department: true,
      clientCapacity: true,
    },
  })

  // Get assigned clients based on department/role
  const clientWhere = isManager
    ? { status: 'ACTIVE' }
    : {
        status: 'ACTIVE',
        teamMembers: { some: { userId } },
      }

  const clients = await prisma.client.findMany({
    where: clientWhere,
    select: {
      id: true,
      name: true,
      brandName: true,
      platform: true,
      services: true,
      selectedServices: true,
      tier: true,
      monthlyFee: true,
    },
    orderBy: { name: 'asc' },
  })

  // Get ClientScope deliverables for current month
  const deliverables = await prisma.clientScope.findMany({
    where: {
      clientId: { in: clients.map(c => c.id) },
      month: { gte: currentMonthStart, lte: currentMonthEnd },
    },
    include: {
      client: { select: { id: true, name: true, brandName: true } },
    },
  })

  // Get tactical meeting data for current month
  const tacticalMeeting = await prisma.tacticalMeeting.findFirst({
    where: {
      userId,
      month: { gte: currentMonthStart, lte: currentMonthEnd },
    },
    include: {
      kpiEntries: {
        include: {
          client: { select: { id: true, name: true, brandName: true } },
        },
      },
    },
  })

  // Get previous month's tactical data for comparison
  const prevTacticalMeeting = await prisma.tacticalMeeting.findFirst({
    where: {
      userId,
      month: { gte: prevMonthStart, lte: prevMonthEnd },
    },
    include: {
      kpiEntries: true,
    },
  })

  // Get work deliverables submitted by user
  const workDeliverables = await prisma.workDeliverable.findMany({
    where: {
      userId,
      month: { gte: currentMonthStart, lte: currentMonthEnd },
    },
    include: {
      client: { select: { id: true, name: true, brandName: true } },
    },
  })

  // Get department KPI definitions
  const departmentKpis = DEPARTMENT_KPIS[userDept] || DEPARTMENT_KPIS['OPERATIONS']

  // Calculate summary stats
  const totalDeliverables = deliverables.length
  const completedDeliverables = deliverables.filter(d => d.status === 'ON_TRACK' || d.status === 'OVER_DELIVERY').length
  const underDelivery = deliverables.filter(d => d.status === 'UNDER_DELIVERY').length

  const monthName = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
  const prevMonthName = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  // Transform KPI entries for easier access
  const currentKpis = tacticalMeeting?.kpiEntries.reduce((acc, entry) => {
    acc[entry.clientId] = entry
    return acc
  }, {} as Record<string, typeof tacticalMeeting.kpiEntries[0]>) || {}

  const prevKpis = prevTacticalMeeting?.kpiEntries.reduce((acc, entry) => {
    acc[entry.clientId] = entry
    return acc
  }, {} as Record<string, typeof prevTacticalMeeting.kpiEntries[0]>) || {}

  return (
    <DepartmentTacticalClient
      userId={userId}
      userName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
      department={userDept}
      departmentLabel={departmentKpis.label}
      kpiDefinitions={departmentKpis.kpis}
      isManager={isManager}
      monthName={monthName}
      prevMonthName={prevMonthName}
      clients={clients.map(c => ({
        ...c,
        services: c.services ? (typeof c.services === 'string' ? JSON.parse(c.services) : c.services) : [],
        selectedServices: c.selectedServices ? (typeof c.selectedServices === 'string' ? JSON.parse(c.selectedServices) : c.selectedServices) : [],
      }))}
      deliverables={deliverables}
      workDeliverables={workDeliverables}
      currentKpis={currentKpis}
      prevKpis={prevKpis}
      tacticalMeetingId={tacticalMeeting?.id || null}
      tacticalMeetingStatus={tacticalMeeting?.status || 'DRAFT'}
      stats={{
        totalDeliverables,
        completedDeliverables,
        underDelivery,
        clientsManaged: clients.length,
        clientCapacity: user?.clientCapacity || 10,
      }}
    />
  )
}
