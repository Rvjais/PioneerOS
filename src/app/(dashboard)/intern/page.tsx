import { prisma } from '@/server/db/prisma'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PageGuide from '@/client/components/ui/PageGuide'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

async function getInternData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      department: true,
      joiningDate: true,
      buddyId: true,
      buddy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  })

  const startDate = user?.joiningDate || new Date()
  const expectedEndDate = new Date(startDate)
  expectedEndDate.setMonth(expectedEndDate.getMonth() + 3) // Default 3 months

  const internProfile = await prisma.internProfile.upsert({
    where: { userId },
    create: {
      userId,
      startDate,
      expectedEndDate,
    },
    update: {},
  })

  // Get assigned tasks
  const tasks = await prisma.task.findMany({
    where: { assigneeId: userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  const taskStats = {
    total: await prisma.task.count({ where: { assigneeId: userId } }),
    completed: await prisma.task.count({ where: { assigneeId: userId, status: 'COMPLETED' } }),
    inProgress: await prisma.task.count({ where: { assigneeId: userId, status: 'IN_PROGRESS' } }),
  }

  // Get trainings
  const trainings = await prisma.userTraining.findMany({
    where: { userId },
    include: { training: true },
    orderBy: { startedAt: 'desc' },
  })

  return {
    user,
    internProfile,
    tasks,
    taskStats,
    trainings,
  }
}

export default async function InternDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  if (session.user.role !== 'INTERN' && session.user.role !== 'SUPER_ADMIN') {
    redirect('/')
  }

  const { user, internProfile, tasks, taskStats, trainings } = await getInternData(session.user.id)

  const formatDate = (date: Date | null) =>
    date ? formatDateDDMMYYYY(date) : '-'

  const now = new Date()
  const daysRemaining = internProfile
    ? Math.max(0, Math.ceil((new Date(internProfile.expectedEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  const statusColors: Record<string, string> = {
    TODO: 'bg-yellow-500/20 text-yellow-400',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
    REVIEW: 'bg-purple-500/20 text-purple-400',
    COMPLETED: 'bg-green-500/20 text-green-400',
  }

  const internTypeLabels: Record<string, string> = {
    PAID_OWN_LAPTOP: 'Paid (Own Laptop) - Rs.10,000/month',
    PAID_COMPANY_LAPTOP: 'Paid (Company Laptop) - Rs.8,000/month',
    UNPAID: 'Unpaid Internship',
  }

  return (
    <div className="space-y-6 pb-8">
      <PageGuide
        pageKey="intern"
        title="Intern Dashboard"
        description="Track your internship progress, tasks, and learning."
        steps={[
          { label: 'Check assigned tasks', description: 'View tasks assigned by your mentor or team lead' },
          { label: 'Log learning', description: 'Record training sessions and learning activities' },
          { label: 'Follow daily plan', description: 'Stay on track with your daily task plan' },
          { label: 'Access handbook', description: 'Review intern policies, procedures, and guidelines' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Intern Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome, {user?.firstName}! Track your internship progress.</p>
        </div>
      </div>

      {/* Internship Info */}
      <div className="bg-black rounded-xl p-6 text-white">
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <p className="text-slate-300 text-sm">Internship Type</p>
            <p className="font-semibold">{internTypeLabels[internProfile?.internshipType || 'UNPAID']}</p>
          </div>
          <div>
            <p className="text-slate-300 text-sm">Start Date</p>
            <p className="font-semibold">{formatDate(internProfile?.startDate || null)}</p>
          </div>
          <div>
            <p className="text-slate-300 text-sm">Expected End Date</p>
            <p className="font-semibold">{formatDate(internProfile?.expectedEndDate || null)}</p>
          </div>
          <div>
            <p className="text-slate-300 text-sm">Days Remaining</p>
            <p className="text-2xl font-bold">{daysRemaining}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-white">{taskStats.total}</p>
          <p className="text-sm text-slate-400">Total Tasks</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-green-400">{taskStats.completed}</p>
          <p className="text-sm text-slate-400">Completed</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-blue-400">{taskStats.inProgress}</p>
          <p className="text-sm text-slate-400">In Progress</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-purple-400">{trainings.filter(t => t.status === 'COMPLETED').length}</p>
          <p className="text-sm text-slate-400">Trainings Done</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Assigned Tasks */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">My Tasks</h2>
            <Link href="/tasks" className="text-sm text-blue-400 hover:text-blue-400">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No tasks assigned yet</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="font-medium text-white">{task.title}</p>
                    <p className="text-sm text-slate-400">{task.department}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>
                    {task.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mentor & Buddy */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Support Network</h2>
          <div className="space-y-4">
            {user?.buddy && (
              <div className="flex items-center gap-4 p-3 bg-slate-900/40 rounded-lg">
                <UserAvatar user={{ id: user.buddy.id, firstName: user.buddy.firstName, lastName: user.buddy.lastName }} size="md" showPreview={false} />
                <div className="flex-1">
                  <p className="font-medium text-white">{user.buddy.firstName} {user.buddy.lastName || ''}</p>
                  <p className="text-sm text-slate-400">Your Buddy</p>
                </div>
                <Link
                  href="/meetings/new"
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule 1:1
                </Link>
              </div>
            )}
            {!user?.buddy && (
              <p className="text-sm text-slate-400 text-center py-4">Buddy will be assigned soon</p>
            )}

            {/* Schedule 1:1 Meeting */}
            <Link
              href="/meetings/new"
              className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              style={{ color: '#ffffff' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Schedule 1:1 Meeting
            </Link>
          </div>
        </div>
      </div>

      {/* Important Policies */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-4">Important Intern Policies</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-yellow-700">
          <div className="space-y-2">
            <p><strong>Duration:</strong> 3-6 months based on performance</p>
            <p><strong>Leaves:</strong> No regular leaves except medical emergencies</p>
            <p><strong>Work Mode:</strong> Office-based (remote only for emergencies)</p>
          </div>
          <div className="space-y-2">
            <p><strong>Reviews:</strong> Monthly performance reviews</p>
            <p><strong>Conversion:</strong> Based on performance and vacancy</p>
            <p><strong>Certificate:</strong> Issued upon successful completion</p>
          </div>
        </div>
        {!internProfile?.handbookAcknowledged && (
          <Link
            href="/intern/handbook"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Read & Acknowledge Handbook
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-4 gap-4">
        <Link href="/tasks" className="glass-card rounded-xl border border-white/10 p-4 hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-white">Tasks</p>
              <p className="text-sm text-slate-400">View assigned work</p>
            </div>
          </div>
        </Link>
        <Link href="/training" className="glass-card rounded-xl border border-white/10 p-4 hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-white">Training</p>
              <p className="text-sm text-slate-400">Continue learning</p>
            </div>
          </div>
        </Link>
        <Link href="/sop" className="glass-card rounded-xl border border-white/10 p-4 hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-white">SOPs</p>
              <p className="text-sm text-slate-400">Standard procedures</p>
            </div>
          </div>
        </Link>
        <Link href="/intern/handbook" className="glass-card rounded-xl border border-white/10 p-4 hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-white">Handbook</p>
              <p className="text-sm text-slate-400">Intern policies</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
