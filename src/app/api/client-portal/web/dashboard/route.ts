import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'

export const GET = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dashboardData = {
    stats: {
      activeProjects: 3,
      pendingInvoices: 2,
      upcomingPayments: 1,
    },
    recentActivity: [
      {
        id: 'ACT-001',
        type: 'project_update',
        description: 'Project "Website Redesign" status updated to In Progress',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ACT-002',
        type: 'invoice_created',
        description: 'Invoice #INV-2024-001 created for $5,000',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ACT-003',
        type: 'payment_received',
        description: 'Payment of $2,500 received for Project "Mobile App"',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  }

  return NextResponse.json(dashboardData)
}