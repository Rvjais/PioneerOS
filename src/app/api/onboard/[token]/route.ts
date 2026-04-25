import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const client = await prisma.client.findUnique({
      where: { onboardingToken: token },
      select: {
        id: true,
        name: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        websiteUrl: true,
        onboardingStatus: true,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Failed to fetch client:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await req.json()
    const schema = z.object({
      data: z.object({
        contactName: z.string().max(200).optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().max(20).optional(),
        whatsapp: z.string().max(20).optional(),
        websiteUrl: z.string().max(500).optional(),
        websiteAdmin: z.string().max(500).optional(),
        websitePassword: z.string().max(500).optional(),
        analyticsAccess: z.string().max(500).optional(),
        adsAccess: z.string().max(500).optional(),
        facebookPageId: z.string().max(500).optional(),
        instagramHandle: z.string().max(200).optional(),
        linkedinPageUrl: z.string().max(500).optional(),
        primaryGoal: z.string().max(500).optional(),
        targetAudience: z.string().max(1000).optional(),
        monthlyBudget: z.string().max(100).optional(),
        competitors: z.string().max(1000).optional(),
      }),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })

    const client = await prisma.client.findUnique({
      where: { onboardingToken: token },
    })

    if (!client) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    const { data } = result.data

    // Update basic fields
    const updateData: Record<string, unknown> = {
      onboardingStatus: 'IN_PROGRESS',
    }

    if (data.contactName) updateData.contactName = data.contactName
    if (data.contactEmail) updateData.contactEmail = data.contactEmail
    if (data.contactPhone) updateData.contactPhone = data.contactPhone
    if (data.whatsapp) updateData.whatsapp = data.whatsapp
    if (data.websiteUrl) updateData.websiteUrl = data.websiteUrl

    // Store credentials encrypted
    if (data.websiteAdmin || data.websitePassword || data.analyticsAccess || data.adsAccess) {
      const { encryptJSON } = await import('@/server/security/encryption')
      const credentials = {
        websiteAdmin: data.websiteAdmin,
        websitePassword: data.websitePassword,
        analyticsAccess: data.analyticsAccess,
        adsAccess: data.adsAccess,
      }
      updateData.credentials = encryptJSON(credentials)
    }

    // Social media
    if (data.facebookPageId) updateData.facebookUrl = data.facebookPageId
    if (data.instagramHandle) updateData.instagramUrl = data.instagramHandle
    if (data.linkedinPageUrl) updateData.linkedinUrl = data.linkedinPageUrl

    // Marketing info
    if (data.primaryGoal) updateData.primaryGoal = data.primaryGoal
    if (data.targetAudience) updateData.targetAudience = data.targetAudience
    if (data.monthlyBudget) updateData.monthlyBudget = data.monthlyBudget

    // Competitors
    if (data.competitors) {
      const competitors = data.competitors.split(',').map((c: string) => c.trim())
      updateData.competitor1 = competitors[0] || null
      updateData.competitor2 = competitors[1] || null
      updateData.competitor3 = competitors[2] || null
    }

    await prisma.client.update({
      where: { id: client.id },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update client:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
