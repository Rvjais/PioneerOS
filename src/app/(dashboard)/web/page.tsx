import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

// Role-specific data fetching functions
async function getManagerData(userId: string) {
  const [
    activeProjects,
    pendingApprovals,
    upcomingRenewals,
    teamMembers,
    recentBugs,
    upsellOpportunities,
  ] = await Promise.all([
    // Active projects with phase info
    prisma.webProject.findMany({
      where: { status: { in: ['IN_PROGRESS', 'PIPELINE'] } },
      include: {
        client: { select: { id: true, name: true, logoUrl: true } },
        phases: { where: { status: { not: 'COMPLETED' } }, orderBy: { order: 'asc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
    // Pending design approvals
    prisma.webDesignApproval.count({
      where: { status: 'PENDING' },
    }),
    // Domain/hosting renewals in next 30 days
    prisma.domain.findMany({
      where: {
        expiryDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
      },
      include: { client: { select: { name: true } } },
      orderBy: { expiryDate: 'asc' },
      take: 5,
    }),
    // Team members in WEB department
    prisma.user.findMany({
      where: {
        department: 'WEB',
        status: { in: ['ACTIVE', 'PROBATION'] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    }),
    // Recent bug reports
    prisma.webBugReport.findMany({
      where: { status: { in: ['OPEN', 'CONFIRMED'] } },
      include: { project: { select: { name: true, client: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    // Upsell opportunities
    prisma.upsellOpportunity.findMany({
      where: { status: { in: ['IDENTIFIED', 'QUALIFIED', 'PITCHED'] } },
      include: { client: { select: { name: true } } },
      orderBy: { estimatedValue: 'desc' },
      take: 5,
    }),
  ])

  return {
    activeProjects,
    pendingApprovals,
    upcomingRenewals,
    teamMembers,
    recentBugs,
    upsellOpportunities,
  }
}

async function getDeveloperData(userId: string) {
  const [myProjects, myBugs, myChangeRequests, recentDeployments] = await Promise.all([
    // Projects assigned to developer
    prisma.webProject.findMany({
      where: {
        OR: [{ leadDeveloperId: userId }, { phases: { some: { assignedToId: userId } } }],
        status: { in: ['IN_PROGRESS', 'PIPELINE'] },
      },
      include: {
        client: { select: { name: true } },
        phases: { where: { status: { not: 'COMPLETED' } }, orderBy: { order: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
    // Bugs assigned to developer
    prisma.webBugReport.findMany({
      where: { assignedToId: userId, status: { in: ['OPEN', 'CONFIRMED', 'IN_PROGRESS'] } },
      include: { project: { select: { name: true } } },
      orderBy: { priority: 'asc' },
      take: 10,
    }),
    // Change requests assigned
    prisma.webChangeRequest.findMany({
      where: { assignedToId: userId, status: { in: ['PENDING', 'CLIENT_APPROVED', 'IN_PROGRESS'] } },
      include: { project: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    // Recent deployments (placeholder for now)
    [],
  ])

  return { myProjects, myBugs, myChangeRequests, recentDeployments }
}

async function getDesignerData(userId: string) {
  const [designQueue, pendingFeedback, myProjects] = await Promise.all([
    // Designs pending creation
    prisma.webProjectPhaseItem.findMany({
      where: {
        phase: 'DESIGN',
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        OR: [{ assignedToId: userId }, { assignedToId: null }],
      },
      include: { project: { select: { name: true, client: { select: { name: true } } } } },
      orderBy: { createdAt: 'asc' },
      take: 10,
    }),
    // Designs awaiting client feedback
    prisma.webDesignApproval.findMany({
      where: { designerId: userId, status: 'PENDING' },
      include: { project: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    // Designer's projects
    prisma.webProject.findMany({
      where: { leadDesignerId: userId, status: { in: ['IN_PROGRESS', 'PIPELINE'] } },
      include: { client: { select: { name: true } } },
      take: 5,
    }),
  ])

  return { designQueue, pendingFeedback, myProjects }
}

// Status color helpers
const statusColors: Record<string, string> = {
  PIPELINE: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ON_HOLD: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const priorityColors: Record<string, string> = {
  CRITICAL: 'bg-red-500/20 text-red-400',
  HIGH: 'bg-orange-500/20 text-orange-400',
  MEDIUM: 'bg-amber-500/20 text-amber-400',
  LOW: 'bg-green-500/20 text-green-400',
}

const phaseColors: Record<string, string> = {
  CONTENT: 'bg-purple-500',
  DESIGN: 'bg-pink-500',
  MEDIA: 'bg-orange-500',
  DEVELOPMENT: 'bg-blue-500',
  TESTING: 'bg-amber-500',
  DEPLOYMENT: 'bg-green-500',
}

// Manager Dashboard Component
function ManagerDashboard({ data }: { data: Awaited<ReturnType<typeof getManagerData>> }) {
  const { activeProjects, pendingApprovals, upcomingRenewals, teamMembers, recentBugs, upsellOpportunities } = data

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-white">{activeProjects.length}</p>
          <p className="text-sm text-slate-400">Active Projects</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-amber-400">{pendingApprovals}</p>
          <p className="text-sm text-slate-400">Pending Approvals</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-red-400">{upcomingRenewals.length}</p>
          <p className="text-sm text-slate-400">Renewals Due</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-green-400">{teamMembers.length}</p>
          <p className="text-sm text-slate-400">Team Members</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Pipeline */}
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Project Pipeline</h2>
            <Link href="/web/projects" className="text-sm text-indigo-400 hover:text-indigo-300">
              View All
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {activeProjects.length === 0 ? (
              <div className="p-4 text-center text-slate-400">No active projects</div>
            ) : (
              activeProjects.slice(0, 5).map((project) => (
                <div key={project.id} className="p-4 hover:bg-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{project.name}</p>
                      <p className="text-sm text-slate-400">{project.client?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.currentPhase && (
                        <span
                          className={`px-2 py-1 text-xs text-white rounded-full ${phaseColors[project.currentPhase] || 'bg-slate-500'}`}
                        >
                          {project.currentPhase}
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 text-xs rounded-full border ${statusColors[project.status] || statusColors.PIPELINE}`}
                      >
                        {project.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Domain/Hosting Renewals */}
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Upcoming Renewals</h2>
            <Link href="/web/infrastructure/domains" className="text-sm text-indigo-400 hover:text-indigo-300">
              Manage
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {upcomingRenewals.length === 0 ? (
              <div className="p-4 text-center text-slate-400">No upcoming renewals</div>
            ) : (
              upcomingRenewals.map((domain) => {
                const daysUntilExpiry = Math.ceil(
                  (new Date(domain.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )
                return (
                  <div key={domain.id} className="p-4 hover:bg-slate-700/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{domain.domainName}</p>
                        <p className="text-sm text-slate-400">{domain.client?.name}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${daysUntilExpiry <= 7 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}
                      >
                        {daysUntilExpiry} days
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Bugs */}
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Open Bugs</h2>
            <span className="text-sm text-indigo-400">
              View All
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {recentBugs.length === 0 ? (
              <div className="p-4 text-center text-slate-400">No open bugs</div>
            ) : (
              recentBugs.map((bug) => (
                <div key={bug.id} className="p-4 hover:bg-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{bug.title}</p>
                      <p className="text-sm text-slate-400">
                        {bug.project?.name} - {bug.project?.client?.name}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[bug.priority] || priorityColors.MEDIUM}`}>
                      {bug.priority}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upsell Opportunities */}
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Upsell Opportunities</h2>
            <Link href="/web/billing/upsells" className="text-sm text-indigo-400 hover:text-indigo-300">
              View All
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {upsellOpportunities.length === 0 ? (
              <div className="p-4 text-center text-slate-400">No upsell opportunities</div>
            ) : (
              upsellOpportunities.map((opp) => (
                <div key={opp.id} className="p-4 hover:bg-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{opp.title}</p>
                      <p className="text-sm text-slate-400">{opp.client?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-400">
                        ₹{opp.estimatedValue.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-slate-400">{opp.probability}% probability</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Team Workload */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Team Workload</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-slate-700/30 rounded-xl p-4 text-center">
                <div className="mx-auto w-fit">
                  <UserAvatar user={{ id: member.id, firstName: member.firstName, lastName: member.lastName, role: member.role }} size="lg" showPreview={false} />
                </div>
                <p className="mt-2 font-medium text-white">
                  {member.firstName} {member.lastName}
                </p>
                <p className="text-sm text-slate-400">{member.role.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Developer Dashboard Component
function DeveloperDashboard({ data }: { data: Awaited<ReturnType<typeof getDeveloperData>> }) {
  const { myProjects, myBugs, myChangeRequests } = data

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-white">{myProjects.length}</p>
          <p className="text-sm text-slate-400">My Projects</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-red-400">{myBugs.length}</p>
          <p className="text-sm text-slate-400">Bugs Assigned</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-amber-400">{myChangeRequests.length}</p>
          <p className="text-sm text-slate-400">Change Requests</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-green-400">0</p>
          <p className="text-sm text-slate-400">Deployments Today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Projects */}
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">My Projects</h2>
            <Link href="/web/projects" className="text-sm text-indigo-400 hover:text-indigo-300">
              View All
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {myProjects.length === 0 ? (
              <div className="p-4 text-center text-slate-400">No projects assigned</div>
            ) : (
              myProjects.slice(0, 5).map((project) => (
                <div key={project.id} className="p-4 hover:bg-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{project.name}</p>
                      <p className="text-sm text-slate-400">{project.client?.name}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs text-white rounded-full ${phaseColors[project.currentPhase] || 'bg-slate-500'}`}
                    >
                      {project.currentPhase}
                    </span>
                  </div>
                  {/* Phase progress */}
                  {project.phases.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-400">
                        Current: {project.phases[0]?.phase} - {project.phases[0]?.status}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Bugs */}
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Bugs Assigned to Me</h2>
            <span className="text-sm text-indigo-400">
              View All
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {myBugs.length === 0 ? (
              <div className="p-4 text-center text-slate-400">No bugs assigned</div>
            ) : (
              myBugs.slice(0, 5).map((bug) => (
                <div key={bug.id} className="p-4 hover:bg-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{bug.title}</p>
                      <p className="text-sm text-slate-400">{bug.project?.name}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[bug.priority] || priorityColors.MEDIUM}`}>
                      {bug.priority}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Change Requests */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Change Requests</h2>
            <span className="text-sm text-indigo-400">
              View All
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {myChangeRequests.length === 0 ? (
              <div className="p-4 text-center text-slate-400">No change requests</div>
            ) : (
              myChangeRequests.map((req) => (
                <div key={req.id} className="p-4 hover:bg-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{req.title}</p>
                      <p className="text-sm text-slate-400">{req.project?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs bg-slate-600/50 text-slate-300 rounded-full">
                        {req.type}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${req.status === 'CLIENT_APPROVED' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}
                      >
                        {req.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Designer Dashboard Component
function DesignerDashboard({ data }: { data: Awaited<ReturnType<typeof getDesignerData>> }) {
  const { designQueue, pendingFeedback, myProjects } = data

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-white">{designQueue.length}</p>
          <p className="text-sm text-slate-400">In Design Queue</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-amber-400">{pendingFeedback.length}</p>
          <p className="text-sm text-slate-400">Awaiting Feedback</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-green-400">{myProjects.length}</p>
          <p className="text-sm text-slate-400">Active Projects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Design Queue */}
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Design Queue</h2>
            <span className="text-sm text-indigo-400">
              View All
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {designQueue.length === 0 ? (
              <div className="p-4 text-center text-slate-400">No designs in queue</div>
            ) : (
              designQueue.slice(0, 5).map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{item.project?.name}</p>
                      <p className="text-sm text-slate-400">{item.project?.client?.name}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${item.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'}`}
                    >
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Awaiting Feedback */}
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Awaiting Client Feedback</h2>
            <span className="text-sm text-indigo-400">
              View All
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {pendingFeedback.length === 0 ? (
              <div className="p-4 text-center text-slate-400">No pending feedback</div>
            ) : (
              pendingFeedback.slice(0, 5).map((approval) => (
                <div key={approval.id} className="p-4 hover:bg-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{approval.title}</p>
                      <p className="text-sm text-slate-400">{approval.project?.name}</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded-full">
                      v{approval.version}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function WebDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userRole = session.user.role
  const userId = session.user.id

  // Determine which dashboard to show based on role
  const isManager = ['SUPER_ADMIN', 'MANAGER', 'WEB_MANAGER', 'OPERATIONS_HEAD'].includes(userRole)
  const isDesigner = userRole === 'WEB_DESIGNER'
  const isDeveloper = ['WEB_DEVELOPER', 'EMPLOYEE'].includes(userRole)

  let dashboardData
  if (isManager) {
    dashboardData = await getManagerData(userId)
  } else if (isDesigner) {
    dashboardData = await getDesignerData(userId)
  } else {
    dashboardData = await getDeveloperData(userId)
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isManager ? 'Web Team Dashboard' : isDesigner ? 'Design Dashboard' : 'Developer Dashboard'}
          </h1>
          <p className="text-slate-400 mt-1">
            {isManager
              ? 'Overview of projects, infrastructure, and team performance'
              : isDesigner
                ? 'Your design queue and client feedback'
                : 'Your projects, bugs, and tasks'}
          </p>
        </div>
        <Link
          href="/web/projects"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Project
        </Link>
      </div>

      {/* Role-specific Dashboard */}
      {isManager && <ManagerDashboard data={dashboardData as Awaited<ReturnType<typeof getManagerData>>} />}
      {isDesigner && <DesignerDashboard data={dashboardData as Awaited<ReturnType<typeof getDesignerData>>} />}
      {isDeveloper && !isManager && !isDesigner && (
        <DeveloperDashboard data={dashboardData as Awaited<ReturnType<typeof getDeveloperData>>} />
      )}
    </div>
  )
}
