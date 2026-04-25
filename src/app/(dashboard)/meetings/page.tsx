import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { MeetingsClient } from './MeetingsClient'
import { MeetingsTableClient } from './MeetingsTableClient'
import PageGuide from '@/client/components/ui/PageGuide'

async function getMeetings(userId: string, userRole: string) {
  const isAdmin = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(userRole)

  const where: Record<string, unknown> = {}
  if (!isAdmin) {
    // Employees only see meetings they participate in or for their assigned clients
    const assigned = await prisma.clientTeamMember.findMany({
      where: { userId },
      select: { clientId: true },
    })
    const clientIds = assigned.map(a => a.clientId)

    where.OR = [
      { participants: { some: { userId } } },
      ...(clientIds.length > 0 ? [{ clientId: { in: clientIds } }] : []),
    ]
  }

  return prisma.meeting.findMany({
    where,
    include: {
      client: { select: { id: true, name: true } },
      participants: { include: { user: { select: { id: true, firstName: true, lastName: true, profile: { select: { profilePicture: true } } } } } },
      meetingActionItems: { include: { assignee: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { date: 'desc' },
    take: 50,
  })
}

async function getUsers() {
  return prisma.user.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, firstName: true, lastName: true, department: true },
    orderBy: { firstName: 'asc' },
  })
}

async function getClientsMissingMeetings(userId: string, role: string) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const fullAccessRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'OPERATIONS_HEAD']
  const teamFilter = fullAccessRoles.includes(role) ? {} : { teamMembers: { some: { userId } } }

  return prisma.client.findMany({
    where: {
      NOT: { status: 'LEAD' },
      deletedAt: null,
      ...teamFilter,
      meetings: {
        none: {
          date: { gte: thirtyDaysAgo }
        }
      }
    },
    select: { id: true, name: true }
  })
}

async function getAllClients(userId: string, role: string) {
  const fullAccessRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'OPERATIONS_HEAD']
  const teamFilter = fullAccessRoles.includes(role) ? {} : { teamMembers: { some: { userId } } }

  return prisma.client.findMany({
    where: { NOT: { status: 'LEAD' }, deletedAt: null, ...teamFilter },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

// Server-side category config (with JSX icons)
const categoryConfig: Record<string, { label: string; color: string; icon: React.ReactNode; frequency: string }> = {
  STRATEGIC: { label: 'Strategic', color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, frequency: 'Monthly' },
  TACTICAL: { label: 'Tactical', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, frequency: 'Weekly' },
  OPERATIONS: { label: 'Operations', color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, frequency: 'Daily' },
  HUDDLE: { label: '11AM Huddle', color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, frequency: 'Daily' },
  GENERAL: { label: 'General', color: 'from-slate-500/20 to-gray-500/20 border-slate-500/30', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, frequency: '-' },
}


const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  COMPLETED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  CANCELLED: 'bg-red-500/20 text-red-300 border-red-500/30',
}

export default async function MeetingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = (session.user as any).id
  const userRole = (session.user as any).role || 'EMPLOYEE'

  const [meetings, users, missingMeetingsClients, allClients] = await Promise.all([
    getMeetings(userId, userRole),
    getUsers(),
    getClientsMissingMeetings(userId, userRole),
    getAllClients(userId, userRole),
  ])
  const now = new Date()

  // Group meetings by STOP category
  const byCategory: Record<string, typeof meetings> = {}
  for (const m of meetings) {
    const cat = m.category || 'GENERAL'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(m)
  }

  // Stats
  const upcoming = meetings.filter(m => new Date(m.date) >= now && m.status === 'SCHEDULED')
  const totalActionItems = meetings.reduce((sum, m) => sum + m.meetingActionItems.length, 0)
  const pendingActions = meetings.reduce((sum, m) => sum + m.meetingActionItems.filter(a => a.status === 'PENDING').length, 0)

  return (
    <div className="space-y-6 pb-8">
      <PageGuide
        pageKey="meetings"
        title="Meetings"
        description="Schedule, track, and manage all team and client meetings."
        steps={[
          { label: 'Schedule meetings', description: 'Create new meetings with participants and agendas' },
          { label: 'Track action items', description: 'Monitor pending actions from past meetings' },
          { label: 'End meetings', description: 'Record summary and key pointers when done' },
        ]}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">STOP Meeting Framework</h1>
          <p className="text-slate-400 mt-1">Strategic • Tactical • Operations • Huddle</p>
        </div>
        <MeetingsClient clients={allClients} users={users} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{meetings.length}</p>
          <p className="text-sm text-slate-400">Total Meetings</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <p className="text-3xl font-bold text-blue-400">{upcoming.length}</p>
          <p className="text-sm text-slate-400">Upcoming</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <p className="text-3xl font-bold text-purple-400">{totalActionItems}</p>
          <p className="text-sm text-slate-400">Action Items</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <p className="text-3xl font-bold text-amber-400">{pendingActions}</p>
          <p className="text-sm text-slate-400">Pending Actions</p>
        </div>
        <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-4">
          <p className="text-3xl font-bold text-red-400">{missingMeetingsClients.length}</p>
          <p className="text-sm text-slate-300">Missing 30d MoM</p>
        </div>
      </div>

      {/* STOP Category Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['STRATEGIC', 'TACTICAL', 'OPERATIONS', 'HUDDLE'].map((cat) => {
          const config = categoryConfig[cat]
          const catMeetings = byCategory[cat] || []
          const nextMeeting = catMeetings.find(m => new Date(m.date) >= now && m.status === 'SCHEDULED')
          return (
            <div key={cat} className={`bg-gradient-to-br ${config.color} backdrop-blur-xl border rounded-2xl p-5`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{config.icon}</span>
                <div>
                  <h3 className="font-semibold text-white">{config.label}</h3>
                  <p className="text-xs text-slate-400">{config.frequency}</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{catMeetings.length}</p>
              <p className="text-xs text-slate-400 mt-1">
                {nextMeeting
                  ? `Next: ${new Date(nextMeeting.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                  : 'No upcoming'
                }
              </p>
            </div>
          )
        })}
      </div>

      {/* All Meetings Table */}
      <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">All Meetings</h2>
        </div>
        <MeetingsTableClient
          meetings={meetings.map(m => ({
            ...m,
            date: m.date.toISOString(),
          }))}
        />
      </div>
    </div>
  )
}
