import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'

export const GET = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tickets = [
    {
      id: 'TKT-CLIENT-001',
      subject: 'Login issues with my account',
      status: 'open',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'TKT-CLIENT-002',
      subject: 'Billing inquiry for last month',
      status: 'resolved',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'TKT-CLIENT-003',
      subject: 'Request for additional user seats',
      status: 'in_progress',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  return NextResponse.json({ tickets })
}