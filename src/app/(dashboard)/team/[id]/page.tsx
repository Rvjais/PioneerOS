import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatRoleLabel } from '@/shared/utils/utils'
import { EditProfileButton } from './EditProfileButton'
import { TeamMemberHeader } from './TeamMemberHeader'
import { TestimonialBadges } from '@/client/components/testimonials/TestimonialBadges'

async function getTeamMember(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      rbcPot: true,
      clientAssignments: {
        include: {
          client: {
            select: { id: true, name: true, tier: true },
          },
        },
      },
      assignedTasks: {
        where: { status: { not: 'COMPLETED' } },
        take: 5,
        orderBy: { dueDate: 'asc' },
      },
      certifications: {
        include: { certification: true },
      },
      achievements: {
        where: { status: 'APPROVED' },
        include: {
          client: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!user) return null

  // Fetch today's daily tasks from DailyTaskPlan
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayPlan = await prisma.dailyTaskPlan.findFirst({
    where: {
      userId: id,
      date: today,
    },
    include: {
      tasks: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  // Also fetch recent daily tasks (last 30 days) if no today tasks
  const monthAgo = new Date(today)
  monthAgo.setDate(monthAgo.getDate() - 30)

  const recentTasks = await prisma.dailyTask.findMany({
    where: {
      plan: {
        userId: id,
        date: { gte: monthAgo },
      },
    },
    include: {
      client: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return {
    ...user,
    todayPlan,
    recentDailyTasks: recentTasks,
  }
}

export default async function TeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { id } = await params
  const user = await getTeamMember(id)

  if (!user) {
    notFound()
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const isOwnProfile = session.user.id === user.id

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      SUPER_ADMIN: 'bg-purple-500/20 text-purple-400',
      MANAGER: 'bg-blue-500/20 text-blue-400',
      EMPLOYEE: 'bg-green-500/20 text-green-400',
      SALES: 'bg-amber-500/20 text-amber-400',
      ACCOUNTS: 'bg-teal-500/20 text-teal-400',
      FREELANCER: 'bg-slate-800/50 text-slate-200',
      INTERN: 'bg-pink-500/20 text-pink-400',
    }
    return colors[role] || 'bg-slate-800/50 text-slate-200'
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Back Button */}
      <Link href="/team" className="inline-flex items-center text-sm text-blue-400 hover:text-blue-400">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Team Directory
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <TeamMemberHeader
            userId={user.id}
            firstName={user.firstName}
            lastName={user.lastName}
            empId={user.empId}
            department={user.department}
            role={user.role}
            status={user.status}
            profilePicture={user.profile?.profilePicture || null}
            isOwnProfile={isOwnProfile}
          />
        </div>
        {session.user.role === 'SUPER_ADMIN' && (
          <EditProfileButton
            user={{
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
              role: user.role,
              department: user.department,
              status: user.status,
              capacity: user.capacity,
            }}
          />
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Contact Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="font-medium text-white">{user.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Phone</p>
                <p className="font-medium text-white">{user.phone}</p>
              </div>
              {user.profile?.linkedIn && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-slate-400">LinkedIn</p>
                  <a
                    href={user.profile.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-400 hover:text-blue-400"
                  >
                    View Profile
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Work Info */}
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Work Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400">Department</p>
                <p className="font-medium text-white">{user.department}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Role</p>
                <p className="font-medium text-white">{formatRoleLabel(user.role)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Joining Date</p>
                <p className="font-medium text-white">{formatDate(user.joiningDate)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Employee Type</p>
                <p className="font-medium text-white">{user.employeeType.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Task Capacity</p>
                <p className="font-medium text-white">{user.capacity} units/month</p>
              </div>
              {user.languages && (
                <div>
                  <p className="text-sm text-slate-400">Languages</p>
                  <p className="font-medium text-white">{user.languages}</p>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Clients */}
          {user.clientAssignments.length > 0 && (
            <div className="glass-card rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Assigned Clients</h2>
              <div className="space-y-3">
                {user.clientAssignments.map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={`/clients/${assignment.client.id}`}
                    className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg hover:bg-slate-800/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-white">{assignment.client.name}</p>
                      <p className="text-sm text-slate-400">{assignment.role.replace(/_/g, ' ')}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      assignment.client.tier === 'ENTERPRISE' ? 'bg-purple-500/20 text-purple-400' :
                      assignment.client.tier === 'GROWTH' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-800/50 text-slate-200'
                    }`}>
                      {assignment.client.tier}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Daily Tasks - Shows employee's daily planner tasks */}
          {(user.todayPlan?.tasks?.length > 0 || user.recentDailyTasks?.length > 0) && (
            <div className="glass-card rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Daily Tasks</h2>

              {/* Today's Tasks */}
              {user.todayPlan?.tasks?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Today&apos;s Plan
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      user.todayPlan.status === 'SUBMITTED' ? 'bg-green-500/20 text-green-400' :
                      user.todayPlan.status === 'DRAFT' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-800/50 text-slate-300'
                    }`}>
                      {user.todayPlan.status}
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {user.todayPlan.tasks.map((task: any) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg border border-white/5">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm truncate">{task.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">{task.activityType}</span>
                            {task.client?.name && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="text-xs text-slate-400 truncate">{task.client.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            task.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                            task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                            task.status === 'BREAKDOWN' ? 'bg-red-500/20 text-red-400' :
                            'bg-slate-800/50 text-slate-300'
                          }`}>
                            {task.status}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            task.priority === 'HIGH' || task.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                            task.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-slate-800/50 text-slate-400'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                    <span>{user.todayPlan.totalPlannedHours}h planned</span>
                    <span>{user.todayPlan.totalActualHours}h actual</span>
                  </div>
                </div>
              )}

              {/* Recent Tasks (if no today tasks or additional) */}
              {user.todayPlan?.tasks?.length === 0 && user.recentDailyTasks?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Recent Tasks (Last 30 Days)</h3>
                  <div className="space-y-2">
                    {user.recentDailyTasks.slice(0, 20).map((task: any) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg border border-white/5">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm truncate">{task.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">{task.activityType}</span>
                            {task.client?.name && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="text-xs text-slate-400 truncate">{task.client.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          task.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                          task.status === 'BREAKDOWN' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-800/50 text-slate-300'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Legacy Active Tasks (from assignedTasks model) */}
          {user.assignedTasks.length > 0 && (
            <div className="glass-card rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Assigned Project Tasks</h2>
              <div className="space-y-3">
                {user.assignedTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{task.title}</p>
                      <p className="text-sm text-slate-400">{task.department}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                      task.status === 'REVIEW' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-slate-800/50 text-slate-300'
                    }`}>
                      {task.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Video Testimonials Badges */}
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Video Testimonials</h2>
            <TestimonialBadges userId={user.id} showStats={true} maxDisplay={6} size="md" />
          </div>

          {/* Achievements & Badges */}
          {user.achievements.length > 0 && (
            <div className="glass-card rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Achievements</h2>
              <div className="space-y-3">
                {/* Video Testimonials Count */}
                {user.achievements.filter(a => a.type === 'VIDEO_TESTIMONIAL').length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-lg">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-amber-800">Video Testimonials</p>
                      <p className="text-sm text-amber-400">{user.achievements.filter(a => a.type === 'VIDEO_TESTIMONIAL').length} collected</p>
                    </div>
                  </div>
                )}
                {/* Client Appreciation */}
                {user.achievements.filter(a => a.type === 'CLIENT_APPRECIATION').length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
                    <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-pink-800">Client Appreciation</p>
                      <p className="text-sm text-pink-600">{user.achievements.filter(a => a.type === 'CLIENT_APPRECIATION').length} received</p>
                    </div>
                  </div>
                )}
                {/* Google Reviews */}
                {user.achievements.filter(a => a.type === 'GOOGLE_REVIEW').length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">Google Reviews</p>
                      <p className="text-sm text-blue-400">{user.achievements.filter(a => a.type === 'GOOGLE_REVIEW').length} generated</p>
                    </div>
                  </div>
                )}
                {/* Referrals */}
                {(user.achievements.filter(a => a.type === 'CLIENT_REFERRAL' || a.type === 'EMPLOYEE_REFERRAL').length > 0) && (
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-green-800">Referrals</p>
                      <p className="text-sm text-green-400">{user.achievements.filter(a => a.type === 'CLIENT_REFERRAL' || a.type === 'EMPLOYEE_REFERRAL').length} successful</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {user.profile?.skills && (
            <div className="glass-card rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {(() => { try { const s = JSON.parse(user.profile.skills); return Array.isArray(s) ? s : []; } catch { return []; } })().map((skill: string) => (
                  <span key={`skill-${skill}`} className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Certifications</h2>
            {user.certifications.length === 0 ? (
              <p className="text-center text-slate-400 py-4">No certifications</p>
            ) : (
              <div className="space-y-3">
                {user.certifications.map((cert) => (
                  <div key={cert.id} className="p-3 bg-slate-900/40 rounded-lg">
                    <p className="font-medium text-white">{cert.certification.name}</p>
                    <p className="text-sm text-slate-400">{cert.certification.provider}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bio */}
          {user.profile?.bio && (
            <div className="glass-card rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">About</h2>
              <p className="text-slate-300">{user.profile.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
