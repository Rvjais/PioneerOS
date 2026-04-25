import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CandidatesClient } from './CandidatesClient'

async function getCandidates() {
  return prisma.candidate.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      assignedManager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      },
      interviews: {
        orderBy: { scheduledAt: 'desc' },
        take: 1,
      }
    }
  })
}

export default async function CandidatesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const candidates = await getCandidates()

  const stats = {
    total: candidates.length,
    applied: candidates.filter(c => c.status === 'APPLICATION').length,
    screening: candidates.filter(c => ['SCREENING', 'PHONE_SCREEN'].includes(c.status)).length,
    interviewing: candidates.filter(c => ['MANAGER_INTERVIEW', 'FOUNDER_INTERVIEW'].includes(c.status)).length,
    testTask: candidates.filter(c => c.status === 'TEST_TASK').length,
    offer: candidates.filter(c => c.status === 'OFFER').length,
    hired: candidates.filter(c => c.status === 'JOINED').length,
    rejected: candidates.filter(c => c.status === 'REJECTED').length,
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Candidates
          </h1>
          <p className="text-slate-400 mt-1">Manage all job candidates and their applications</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/hiring"
            className="px-4 py-2 text-sm font-medium text-slate-300 glass-card border border-white/10 rounded-lg hover:bg-slate-900/40"
          >
            Pipeline View
          </Link>
          <Link
            href="/hiring/new"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Candidate
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="glass-card rounded-xl border border-white/10 p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-slate-400">Total</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.applied}</p>
          <p className="text-xs text-slate-400">Applied</p>
        </div>
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-cyan-600">{stats.screening}</p>
          <p className="text-xs text-slate-400">Screening</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-purple-400">{stats.interviewing}</p>
          <p className="text-xs text-slate-400">Interview</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{stats.testTask}</p>
          <p className="text-xs text-slate-400">Test Task</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-indigo-600">{stats.offer}</p>
          <p className="text-xs text-slate-400">Offer</p>
        </div>
        <div className="bg-green-500/10 border border-green-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.hired}</p>
          <p className="text-xs text-slate-400">Hired</p>
        </div>
        <div className="bg-red-500/10 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
          <p className="text-xs text-slate-400">Rejected</p>
        </div>
      </div>

      {/* Candidates List */}
      <CandidatesClient
        candidates={candidates.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          position: c.position,
          department: c.department,
          status: c.status,
          currentStage: c.currentStage,
          source: c.source,
          experience: c.experience,
          expectedSalary: c.expectedSalary,
          noticePeriod: c.noticePeriod,
          resumeUrl: c.resumeUrl,
          portfolioUrl: c.portfolioUrl,
          linkedInUrl: c.linkedInUrl,
          assignedManager: c.assignedManager ? {
            id: c.assignedManager.id,
            name: `${c.assignedManager.firstName} ${c.assignedManager.lastName || ''}`.trim()
          } : null,
          lastInterview: c.interviews[0] ? {
            scheduledAt: c.interviews[0].scheduledAt?.toISOString(),
            status: c.interviews[0].status,
          } : null,
          createdAt: c.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
