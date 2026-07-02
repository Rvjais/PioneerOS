import { withAuth } from '@/server/auth/withAuth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'

export const GET = withAuth(async () => {
  const campaigns = await prisma.whatsAppCampaign.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const mapped = campaigns.map(c => ({
    id: c.id,
    name: c.name,
    status: c.status.toLowerCase(),
    audience: c.recipientCount,
    sent: c.sentCount,
    delivered: c.deliveredCount,
    createdAt: c.createdAt.toISOString(),
  }))

  return NextResponse.json({ campaigns: mapped })
})

export const POST = withAuth(async (req: NextRequest, { user }) => {
  const body = await req.json()
  const campaign = await prisma.whatsAppCampaign.create({
    data: {
      name: body.name || 'New Campaign',
      description: body.description,
      templateId: body.templateId || '',
      targetType: body.targetType || 'ALL',
      recipientCount: 0,
      status: 'DRAFT',
      createdBy: user.id,
    },
  })

  return NextResponse.json({
    campaign: {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status.toLowerCase(),
      audience: 0,
      sent: 0,
      delivered: 0,
      createdAt: campaign.createdAt.toISOString(),
    },
  }, { status: 201 })
})
