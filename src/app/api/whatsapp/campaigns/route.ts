import { withAuth } from '@/server/auth/withAuth'
import { NextResponse } from 'next/server'

export const GET = withAuth(async () => {
  const campaigns = [
    {
      id: 'cmp_001',
      name: 'Summer Sale 2026',
      status: 'completed' as const,
      audience: 5000,
      sent: 4980,
      delivered: 4890,
      createdAt: '2026-04-15T10:30:00Z'
    },
    {
      id: 'cmp_002',
      name: 'New Product Launch',
      status: 'scheduled' as const,
      audience: 3500,
      sent: 0,
      delivered: 0,
      createdAt: '2026-05-05T14:20:00Z'
    },
    {
      id: 'cmp_003',
      name: 'Weekly Newsletter',
      status: 'sending' as const,
      audience: 12000,
      sent: 7650,
      delivered: 7540,
      createdAt: '2026-05-08T09:00:00Z'
    },
    {
      id: 'cmp_004',
      name: 'Flash Sale Alert',
      status: 'draft' as const,
      audience: 0,
      sent: 0,
      delivered: 0,
      createdAt: '2026-05-08T16:45:00Z'
    }
  ]

  return NextResponse.json({ campaigns })
})

export const POST = withAuth(async () => {
  const newCampaign = {
    id: 'cmp_005',
    name: 'New Campaign',
    status: 'draft' as const,
    audience: 0,
    sent: 0,
    delivered: 0,
    createdAt: new Date().toISOString()
  }

  return NextResponse.json({ campaign: newCampaign }, { status: 201 })
})
