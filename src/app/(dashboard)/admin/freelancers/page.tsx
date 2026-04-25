import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { FreelancerManagementClient } from './FreelancerManagementClient'

async function getFreelancerData() {
  const freelancers = await prisma.freelancerProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
        },
      },
      workReports: {
        orderBy: { submittedAt: 'desc' },
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
      },
    },
  })

  return freelancers.map((f) => ({
    ...f,
    workReports: f.workReports.map((r) => ({
      ...r,
      periodStart: r.periodStart.toISOString(),
      periodEnd: r.periodEnd.toISOString(),
      submittedAt: r.submittedAt.toISOString(),
    })),
    payments: f.payments.map((p) => ({
      ...p,
      paymentDate: p.paymentDate.toISOString(),
      periodStart: p.periodStart.toISOString(),
      periodEnd: p.periodEnd.toISOString(),
    })),
  }))
}

export default async function AdminFreelancersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS']
  if (!allowedRoles.includes(session.user.role || '')) {
    redirect('/')
  }

  const freelancers = await getFreelancerData()

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Freelancer Management</h1>
          <p className="text-slate-400 mt-1">Review work reports, process payments, and manage freelancers</p>
        </div>
      </div>

      <FreelancerManagementClient freelancers={freelancers} />
    </div>
  )
}
