import prisma from '@/server/db/prisma'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getTrainingData(userId: string) {
  const [trainings, userTrainings, certifications] = await Promise.all([
    prisma.training.findMany({ orderBy: { title: 'asc' } }),
    prisma.userTraining.findMany({
      where: { userId },
      include: { training: true }
    }),
    prisma.userCertification.findMany({
      where: { userId },
      include: { certification: true }
    })
  ])
  return { trainings, userTrainings, certifications }
}

const typeColors: Record<string, string> = {
  COURSE: 'bg-blue-500/20 text-blue-400',
  WORKSHOP: 'bg-purple-500/20 text-purple-400',
  CERTIFICATION: 'bg-green-500/20 text-green-400',
}

export default async function TrainingPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { trainings, userTrainings, certifications } = await getTrainingData(session.user.id)

  const completedCount = userTrainings.filter(t => t.status === 'COMPLETED').length
  const inProgressCount = userTrainings.filter(t => t.status === 'IN_PROGRESS').length

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Training Hub</h1>
          <p className="text-slate-400 mt-1">Develop your skills and earn certifications</p>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-white">{trainings.length}</p>
          <p className="text-sm text-slate-400">Available Courses</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-blue-400">{inProgressCount}</p>
          <p className="text-sm text-slate-400">In Progress</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-green-400">{completedCount}</p>
          <p className="text-sm text-slate-400">Completed</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-purple-400">{certifications.length}</p>
          <p className="text-sm text-slate-400">Certifications</p>
        </div>
      </div>

      {/* My Courses */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">My Learning</h2>
        </div>
        <div className="p-5">
          {userTrainings.length === 0 ? (
            <p className="text-center text-slate-400 py-8">You haven&apos;t started any courses yet</p>
          ) : (
            <div className="space-y-4">
              {userTrainings.map((ut) => (
                <div key={ut.id} className="flex items-center gap-4 p-4 bg-slate-900/40 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{ut.training.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{ width: `${ut.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-300">{ut.progress}%</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    {ut.status === 'COMPLETED' ? 'Review' : 'Continue'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Available Courses */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Available Courses</h2>
        </div>
        <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainings.length === 0 ? (
            <p className="col-span-full text-center text-slate-400 py-8">No courses available</p>
          ) : (
            trainings.map((training) => {
              const enrolled = userTrainings.find(ut => ut.trainingId === training.id)
              return (
                <div key={training.id} className="border border-white/10 rounded-xl p-4 hover:shadow-none transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[training.type]}`}>
                      {training.type}
                    </span>
                    {training.isRequired && (
                      <span className="text-xs text-red-500 font-medium">Required</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{training.title}</h3>
                  <p className="text-sm text-slate-400 mb-4">{training.description || 'No description'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{training.duration} hours</span>
                    <button className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      enrolled
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}>
                      {enrolled ? 'Enrolled' : 'Enroll'}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Certifications */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">My Certifications</h2>
        </div>
        <div className="p-5">
          {certifications.length === 0 ? (
            <p className="text-center text-slate-400 py-8">Complete courses to earn certifications</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
                  <svg className="w-10 h-10 mx-auto mb-2 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                  <h3 className="font-semibold text-white">{cert.certification.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Earned {formatDateDDMMYYYY(cert.earnedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
