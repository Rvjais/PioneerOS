import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { safeJsonParse } from '@/shared/utils/utils'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

type RouteParams = {
  params: Promise<{ clientId: string }>
}

// GET - Get client onboarding details with scope
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { clientId } = await routeParams!

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        whatsapp: true,
        websiteUrl: true,
        selectedServices: true,
        paymentConfirmedAt: true,
        onboardingStatus: true,
        entityType: true,
        tier: true,
        credentials: true,
        facebookUrl: true,
        instagramUrl: true,
        linkedinUrl: true,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const checklist = await prisma.clientOnboardingChecklist.findUnique({
      where: { clientId },
    })

    return NextResponse.json({
      client: {
        ...client,
        selectedServices: safeJsonParse(client.selectedServices, []),
        credentials: safeJsonParse(client.credentials, {}),
      },
      checklist: checklist ? {
        ...checklist,
        selectedServices: safeJsonParse(checklist.selectedServices, []),
        scopeItems: safeJsonParse(checklist.scopeItems, []),
      } : null,
    })
  } catch (error) {
    console.error('Failed to fetch onboarding details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PATCH - Update onboarding checklist
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'ACCOUNTS']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { clientId } = await routeParams!
    const body = await req.json()
    const patchSchema = z.object({
      kickoffMeetingDone: z.boolean().optional(),
      brandGuidelinesReceived: z.boolean().optional(),
      websiteAccessGranted: z.boolean().optional(),
      analyticsAccessGranted: z.boolean().optional(),
      socialMediaAccess: z.boolean().optional(),
      adsAccountAccess: z.boolean().optional(),
      trackingSetup: z.boolean().optional(),
      pixelsInstalled: z.boolean().optional(),
      crmIntegrated: z.boolean().optional(),
      reportingDashboardReady: z.boolean().optional(),
      accountManagerAssigned: z.boolean().optional(),
      teamIntroductionDone: z.boolean().optional(),
      communicationChannelSetup: z.boolean().optional(),
      firstStrategyCallDone: z.boolean().optional(),
      contentCalendarShared: z.boolean().optional(),
      firstDeliverablesApproved: z.boolean().optional(),
      monthlyReportingSchedule: z.boolean().optional(),
      kickoffScheduledAt: z.string().optional(),
      operationsAssignedAt: z.boolean().optional(),
      managerNotes: z.string().max(2000).optional(),
    })
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })

    // Build update data
    const updateData: Record<string, unknown> = {}
    const booleanFields = [
      'kickoffMeetingDone',
      'brandGuidelinesReceived',
      'websiteAccessGranted',
      'analyticsAccessGranted',
      'socialMediaAccess',
      'adsAccountAccess',
      'trackingSetup',
      'pixelsInstalled',
      'crmIntegrated',
      'reportingDashboardReady',
      'accountManagerAssigned',
      'teamIntroductionDone',
      'communicationChannelSetup',
      'firstStrategyCallDone',
      'contentCalendarShared',
      'firstDeliverablesApproved',
      'monthlyReportingSchedule',
    ]

    for (const field of booleanFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
        if (body[field] === true) {
          updateData[`${field}At`] = new Date()
        }
      }
    }

    // Handle special fields
    if (body.kickoffScheduledAt) {
      updateData.kickoffScheduledAt = new Date(body.kickoffScheduledAt)
    }
    if (body.operationsAssignedAt === true) {
      updateData.operationsAssignedAt = new Date()
    }
    if (body.managerNotes !== undefined) {
      updateData.managerNotes = body.managerNotes
    }

    updateData.lastUpdatedBy = user.id
    updateData.assignedManagerId = user.id

    // Calculate completion percentage
    const existingChecklist = await prisma.clientOnboardingChecklist.findUnique({
      where: { clientId },
    })

    if (!existingChecklist) {
      return NextResponse.json({ error: 'Checklist not found' }, { status: 404 })
    }

    const mergedData = { ...existingChecklist, ...updateData }

    let completed = 0
    for (const field of booleanFields) {
      if ((mergedData as Record<string, unknown>)[field]) {
        completed++
      }
    }

    const completionPercentage = Math.round((completed / booleanFields.length) * 100)
    updateData.completionPercentage = completionPercentage
    updateData.status = completionPercentage === 100 ? 'COMPLETED' :
                        completionPercentage > 0 ? 'IN_PROGRESS' : 'PENDING'

    const result = await prisma.clientOnboardingChecklist.update({
      where: { clientId },
      data: updateData,
    })

    // Update client status if onboarding is complete
    if (completionPercentage === 100) {
      await prisma.client.update({
        where: { id: clientId },
        data: {
          status: 'ACTIVE',
          onboardingStatus: 'COMPLETED',
          lifecycleStage: 'ACTIVE',
        },
      })

      // Create lifecycle event
      await prisma.clientLifecycleEvent.create({
        data: {
          clientId,
          fromStage: 'ONBOARDING',
          toStage: 'ACTIVE',
          triggeredBy: 'ONBOARDING_COMPLETED',
          notes: 'All onboarding tasks completed',
        },
      })
    }

    return NextResponse.json({
      success: true,
      completionPercentage,
      status: updateData.status,
    })
  } catch (error) {
    console.error('Failed to update onboarding:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
