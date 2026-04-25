import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await req.json()
    const schema = z.object({
      contactName: z.string().min(1).max(200),
      contactEmail: z.string().email(),
      contactPhone: z.string().min(1).max(20),
      whatsapp: z.string().max(20).optional(),
      websiteUrl: z.string().max(500).optional(),
      primaryGoal: z.string().max(500).optional(),
      targetAudience: z.string().max(1000).optional(),
      monthlyBudget: z.string().max(100).optional(),
      websiteAdmin: z.string().max(500).optional(),
      websitePassword: z.string().max(500).optional(),
      analyticsAccess: z.string().max(500).optional(),
      adsAccess: z.string().max(500).optional(),
      facebookPageId: z.string().max(500).optional(),
      instagramHandle: z.string().max(200).optional(),
      linkedinPageUrl: z.string().max(500).optional(),
      competitors: z.string().max(1000).optional(),
      keyMessages: z.string().max(2000).optional(),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    Object.assign(body, result.data)

    const client = await prisma.client.findUnique({
      where: { onboardingToken: token },
    })

    if (!client) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    if (client.onboardingStatus === 'COMPLETED') {
      return NextResponse.json({ error: 'Onboarding already completed' }, { status: 400 })
    }

    // Update all fields
    const updateData: Record<string, unknown> = {
      onboardingStatus: 'AWAITING_SLA',
      lifecycleStage: 'ONBOARDING',
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      whatsapp: body.whatsapp || null,
      websiteUrl: body.websiteUrl || null,
      primaryGoal: body.primaryGoal || null,
      targetAudience: body.targetAudience || null,
      monthlyBudget: body.monthlyBudget || null,
    }

    // Credentials
    const credentials = {
      websiteAdmin: body.websiteAdmin,
      websitePassword: body.websitePassword,
      analyticsAccess: body.analyticsAccess,
      adsAccess: body.adsAccess,
    }
    updateData.credentials = JSON.stringify(credentials)

    // Social
    updateData.facebookUrl = body.facebookPageId || null
    updateData.instagramUrl = body.instagramHandle || null
    updateData.linkedinUrl = body.linkedinPageUrl || null

    // Competitors
    if (body.competitors) {
      const competitors = body.competitors.split(',').map((c: string) => c.trim())
      updateData.competitor1 = competitors[0] || null
      updateData.competitor2 = competitors[1] || null
      updateData.competitor3 = competitors[2] || null
    }

    // Notes (key messages)
    if (body.keyMessages) {
      updateData.notes = `Key Messages: ${body.keyMessages}`
    }

    await prisma.client.update({
      where: { id: client.id },
      data: updateData,
    })

    // Create lifecycle event
    await prisma.clientLifecycleEvent.create({
      data: {
        clientId: client.id,
        fromStage: 'WON',
        toStage: 'ONBOARDING',
        triggeredBy: 'SYSTEM',
        notes: 'Client completed onboarding form',
      },
    })

    // Notify accounts team
    const accountsUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'ACCOUNTS' },
          { department: 'ACCOUNTS' },
        ],
        deletedAt: null,
      },
      select: { id: true },
    })

    await prisma.notification.createMany({
      data: accountsUsers.map((user) => ({
        userId: user.id,
        type: 'GENERAL',
        title: 'Client Onboarding Completed',
        message: `${client.name} has completed their onboarding form. Please prepare the SLA.`,
        link: `/accounts/contracts/${client.id}`,
        priority: 'HIGH',
      })),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to complete onboarding:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
