import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { FreelancerWorkReportsClient } from './FreelancerWorkReportsClient'

async function getWorkReportsData(userId: string) {
  const profile = await prisma.freelancerProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  })

  const [reports, clients] = await Promise.all([
    prisma.freelancerWorkReport.findMany({
      where: { freelancerProfileId: profile.id },
      orderBy: { submittedAt: 'desc' },
    }),
    prisma.client.findMany({
      where: { status: { not: 'CHURNED' }, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return { profile, reports, clients }
}

export default async function WorkReportsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  if (session.user.role !== 'FREELANCER' && session.user.role !== 'SUPER_ADMIN') {
    redirect('/')
  }

  const { profile, reports, clients } = await getWorkReportsData(session.user.id)

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Work Tracker</h1>
        <p className="text-slate-400 mt-1">Log and track your daily work entries</p>
      </div>

      <FreelancerWorkReportsClient
        reports={reports.map(r => ({
          ...r,
          periodStart: r.periodStart.toISOString(),
          periodEnd: r.periodEnd.toISOString(),
        }))}
        clients={clients}
        hourlyRate={profile.hourlyRate || 500}
        profileId={profile.id}
      />
    </div>
  )
}
