import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { CandidateSheet } from './CandidateSheet'
import { requirePageAuth, HR_ACCESS } from '@/server/auth/pageAuth'

async function getCandidates() {
  return prisma.candidate.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export default async function HiringPage() {
  await requirePageAuth(HR_ACCESS)

  const candidates = await getCandidates()

  const stats = {
    total: candidates.length,
    inPipeline: candidates.filter(c => !['JOINED', 'REJECTED'].includes(c.status)).length,
    hired: candidates.filter(c => c.status === 'JOINED').length,
    openPositions: [...new Set(candidates.filter(c => !['JOINED', 'REJECTED'].includes(c.status)).map(c => c.position))].length,
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Hiring Pipeline
        </h1>
        <p className="text-slate-400 mt-1">Track candidates through the hiring process - Spreadsheet style</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-white">{stats.total}</p>
          <p className="text-sm text-slate-400">Total Candidates</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-200 rounded-xl p-4">
          <p className="text-3xl font-bold text-blue-400">{stats.inPipeline}</p>
          <p className="text-sm text-slate-400">In Pipeline</p>
        </div>
        <div className="bg-green-500/10 border border-green-200 rounded-xl p-4">
          <p className="text-3xl font-bold text-green-400">{stats.hired}</p>
          <p className="text-sm text-slate-400">Hired</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-200 rounded-xl p-4">
          <p className="text-3xl font-bold text-purple-400">{stats.openPositions}</p>
          <p className="text-sm text-slate-400">Open Positions</p>
        </div>
      </div>

      {/* Candidate Sheet */}
      <CandidateSheet
        initialCandidates={candidates.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          position: c.position,
          department: c.department,
          resumeUrl: c.resumeUrl,
          portfolioUrl: c.portfolioUrl,
          linkedInUrl: c.linkedInUrl,
          source: c.source,
          status: c.status,
          experience: c.experience,
          notes: c.notes,
          testTaskScore: c.testTaskScore,
        }))}
      />
    </div>
  )
}
