import { NextRequest, NextResponse } from 'next/server'
import { withAuth, isManagerOrAbove } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

// Helper: check if user has access to a campaign's client
async function userCanAccessCampaign(userId: string, campaignId: string): Promise<boolean> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { clientId: true },
  })
  if (!campaign) return false
  const assignment = await prisma.clientTeamMember.findFirst({
    where: { userId, clientId: campaign.clientId },
  })
  return !!assignment
}

// Metric fields are system-managed — only updated via spend sync, not direct PUT
const updateCampaignSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  platform: z.enum(['GOOGLE', 'META', 'LINKEDIN', 'YOUTUBE']).optional(),
  campaignType: z.string().optional(),
  objective: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']).optional(),
  externalId: z.string().optional(),
  dailyBudget: z.number().positive().nullable().optional(),
  monthlyBudget: z.number().positive().nullable().optional(),
  totalBudget: z.number().positive().nullable().optional(),
  currency: z.string().optional(),
  targetAudience: z.string().optional(),
  keywords: z.string().optional(),
  placements: z.string().optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  assignedToId: z.string().nullable().optional(),
})

export const GET = withAuth(async (req, { user, params }) => {
  try {
    const campaignId = params?.campaignId
    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    // Tenant isolation
    if (!isManagerOrAbove(user)) {
      const hasAccess = await userCanAccessCampaign(user.id, campaignId)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        client: { select: { id: true, name: true, logoUrl: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        adCreatives: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        adSpendRecords: {
          orderBy: { date: 'desc' },
          take: 90,
        },
        abTests: {
          orderBy: { createdAt: 'desc' },
        },
        conversionEvents: {
          orderBy: { occurredAt: 'desc' },
          take: 100,
        },
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Failed to fetch campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const PUT = withAuth(async (req, { user, params }) => {
  try {
    const campaignId = params?.campaignId
    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    // Tenant isolation
    if (!isManagerOrAbove(user)) {
      const hasAccess = await userCanAccessCampaign(user.id, campaignId)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    const body = await req.json()
    const parsed = updateCampaignSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const existing = await prisma.campaign.findUnique({ where: { id: campaignId }, select: { id: true } })
    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const data = parsed.data
    const updateData: Record<string, unknown> = { ...data }

    // Convert date strings to Date objects
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? new Date(data.startDate) : null
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null
    }

    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: updateData,
      include: {
        client: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Failed to update campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (req, { user, params }) => {
  try {
    const campaignId = params?.campaignId
    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    // Only managers+ can archive campaigns
    if (!isManagerOrAbove(user)) {
      return NextResponse.json({ error: 'Only managers can archive campaigns' }, { status: 403 })
    }

    const existing = await prisma.campaign.findUnique({ where: { id: campaignId }, select: { id: true } })
    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Soft delete by setting status to ARCHIVED
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'ARCHIVED' },
    })

    return NextResponse.json({ success: true, message: 'Campaign archived' })
  } catch (error) {
    console.error('Failed to archive campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
