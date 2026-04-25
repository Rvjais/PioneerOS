import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

async function getTrainings() {
  const trainings = await prisma.training.findMany({
    include: {
      userTrainings: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              department: true,
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return trainings
}

async function getTrainingStats() {
  const [totalTrainings, totalEnrollments, completedCount] = await Promise.all([
    prisma.training.count(),
    prisma.userTraining.count(),
    prisma.userTraining.count({ where: { status: 'COMPLETED' } })
  ])

  return {
    totalTrainings,
    totalEnrollments,
    completedCount,
    completionRate: totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100) : 0
  }
}

export default async function TrainingPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const [trainings, stats] = await Promise.all([
    getTrainings(),
    getTrainingStats()
  ])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Training Management</h1>
          <p className="text-slate-300">Manage employee training and certifications</p>
        </div>
        <div className="px-4 py-2 bg-slate-700/50 text-slate-400 rounded-lg flex items-center gap-2 cursor-not-allowed">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Training
          <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">Coming Soon</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalTrainings}</p>
              <p className="text-sm text-slate-400">Total Courses</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalEnrollments}</p>
              <p className="text-sm text-slate-400">Total Enrollments</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.completedCount}</p>
              <p className="text-sm text-slate-400">Completed</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.completionRate}%</p>
              <p className="text-sm text-slate-400">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trainings List */}
      <div className="glass-card rounded-xl border border-white/10">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-white">Training Courses</h2>
          <div className="flex gap-2">
            <select className="px-3 py-1.5 text-sm border border-white/10 rounded-lg">
              <option>All Types</option>
              <option>Course</option>
              <option>Workshop</option>
              <option>Certification</option>
            </select>
            <select className="px-3 py-1.5 text-sm border border-white/10 rounded-lg">
              <option>All Departments</option>
              <option>HR</option>
              <option>SEO</option>
              <option>WEB</option>
              <option>SALES</option>
            </select>
          </div>
        </div>

        {trainings.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-4xl">📚</span>
            <p className="mt-2 text-slate-300">No trainings found</p>
            <p className="text-sm text-slate-400">Create your first training course</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {trainings.map(training => {
              const enrolled = training.userTrainings.length
              const completed = training.userTrainings.filter(ut => ut.status === 'COMPLETED').length
              const inProgress = training.userTrainings.filter(ut => ut.status === 'IN_PROGRESS').length

              return (
                <div key={training.id} className="p-4 hover:bg-slate-900/40">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        training.type === 'CERTIFICATION'
                          ? 'bg-amber-500/20'
                          : training.type === 'WORKSHOP'
                            ? 'bg-purple-500/20'
                            : 'bg-blue-500/20'
                      }`}>
                        <svg className={`w-6 h-6 ${
                          training.type === 'CERTIFICATION'
                            ? 'text-amber-400'
                            : training.type === 'WORKSHOP'
                              ? 'text-purple-400'
                              : 'text-blue-400'
                        }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {training.type === 'CERTIFICATION' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          )}
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{training.title}</h3>
                          {training.isRequired && (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Required</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-300 mt-1">{training.description || 'No description'}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                          <span className="capitalize">{training.type.toLowerCase()}</span>
                          {training.duration && <span>{training.duration}h duration</span>}
                          {training.department && <span>{training.department}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">{enrolled} enrolled</span>
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded">{inProgress} in progress</span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">{completed} completed</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {enrolled > 0 && (
                    <div className="mt-4 pl-16">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(completed / enrolled) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">
                          {Math.round((completed / enrolled) * 100)}% completion
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Enrolled users preview */}
                  {training.userTrainings.length > 0 && (
                    <div className="mt-3 pl-16 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {training.userTrainings.slice(0, 5).map(ut => (
                          <div key={ut.id} className="ring-2 ring-white rounded-full">
                            <UserAvatar user={{ id: ut.user.id || ut.id, firstName: ut.user.firstName, lastName: ut.user.lastName }} size="xs" showPreview={false} />
                          </div>
                        ))}
                      </div>
                      {training.userTrainings.length > 5 && (
                        <span className="text-xs text-slate-400">
                          +{training.userTrainings.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
