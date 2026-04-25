import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const checklistUpdateSchema = z.object({
  contractSigned: z.boolean().optional(),
  invoicePaid: z.boolean().optional(),
  ndaSigned: z.boolean().optional(),
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
  managerNotes: z.string().optional(),
})

export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { clientId } = await routeParams!

    const checklist = await prisma.clientOnboardingChecklist.findUnique({
      where: { clientId }
    })

    if (!checklist) {
      // Create empty checklist if doesn't exist
      const newChecklist = await prisma.clientOnboardingChecklist.create({
        data: { clientId }
      })
      return NextResponse.json({
        items: {
          contractSigned: newChecklist.contractSigned,
          invoicePaid: newChecklist.invoicePaid,
          ndaSigned: newChecklist.ndaSigned,
          kickoffMeetingDone: newChecklist.kickoffMeetingDone,
          brandGuidelinesReceived: newChecklist.brandGuidelinesReceived,
          websiteAccessGranted: newChecklist.websiteAccessGranted,
          analyticsAccessGranted: newChecklist.analyticsAccessGranted,
          socialMediaAccess: newChecklist.socialMediaAccess,
          adsAccountAccess: newChecklist.adsAccountAccess,
          trackingSetup: newChecklist.trackingSetup,
          pixelsInstalled: newChecklist.pixelsInstalled,
          crmIntegrated: newChecklist.crmIntegrated,
          reportingDashboardReady: newChecklist.reportingDashboardReady,
          accountManagerAssigned: newChecklist.accountManagerAssigned,
          teamIntroductionDone: newChecklist.teamIntroductionDone,
          communicationChannelSetup: newChecklist.communicationChannelSetup,
          firstStrategyCallDone: newChecklist.firstStrategyCallDone,
          contentCalendarShared: newChecklist.contentCalendarShared,
          firstDeliverablesApproved: newChecklist.firstDeliverablesApproved,
          monthlyReportingSchedule: newChecklist.monthlyReportingSchedule,
        },
        managerNotes: newChecklist.managerNotes || ''
      })
    }

    // Convert checklist to key-value pairs
    const items: Record<string, boolean> = {
      contractSigned: checklist.contractSigned,
      invoicePaid: checklist.invoicePaid,
      ndaSigned: checklist.ndaSigned,
      kickoffMeetingDone: checklist.kickoffMeetingDone,
      brandGuidelinesReceived: checklist.brandGuidelinesReceived,
      websiteAccessGranted: checklist.websiteAccessGranted,
      analyticsAccessGranted: checklist.analyticsAccessGranted,
      socialMediaAccess: checklist.socialMediaAccess,
      adsAccountAccess: checklist.adsAccountAccess,
      trackingSetup: checklist.trackingSetup,
      pixelsInstalled: checklist.pixelsInstalled,
      crmIntegrated: checklist.crmIntegrated,
      reportingDashboardReady: checklist.reportingDashboardReady,
      accountManagerAssigned: checklist.accountManagerAssigned,
      teamIntroductionDone: checklist.teamIntroductionDone,
      communicationChannelSetup: checklist.communicationChannelSetup,
      firstStrategyCallDone: checklist.firstStrategyCallDone,
      contentCalendarShared: checklist.contentCalendarShared,
      firstDeliverablesApproved: checklist.firstDeliverablesApproved,
      monthlyReportingSchedule: checklist.monthlyReportingSchedule,
    }

    return NextResponse.json({
      items,
      managerNotes: checklist.managerNotes || ''
    })
  } catch (error) {
    console.error('Failed to fetch checklist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'OPERATIONS_HEAD']
    if (!allowedRoles.includes((user as { role?: string }).role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { clientId } = await routeParams!
    const raw = await req.json()
    const parsed = checklistUpdateSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const body = parsed.data

    // Upsert checklist
    const checklist = await prisma.clientOnboardingChecklist.upsert({
      where: { clientId },
      create: {
        clientId,
        ...body
      },
      update: body
    })

    // Calculate completion percentage
    const checklistFields = [
      'contractSigned', 'invoicePaid', 'ndaSigned', 'kickoffMeetingDone',
      'brandGuidelinesReceived', 'websiteAccessGranted', 'analyticsAccessGranted',
      'socialMediaAccess', 'adsAccountAccess', 'trackingSetup', 'pixelsInstalled',
      'crmIntegrated', 'reportingDashboardReady', 'accountManagerAssigned',
      'teamIntroductionDone', 'communicationChannelSetup', 'firstStrategyCallDone',
      'contentCalendarShared', 'firstDeliverablesApproved', 'monthlyReportingSchedule'
    ]

    const completedCount = checklistFields.filter(field => 
      (checklist as Record<string, unknown>)[field] === true
    ).length

    const isComplete = completedCount === checklistFields.length

    // Update client onboarding status
    let newStatus = 'IN_PROGRESS'
    if (isComplete) {
      newStatus = 'COMPLETED'
    } else if (completedCount === 0) {
      newStatus = 'PENDING'
    }

    // Update client onboarding status and checklist completion percentage
    const completionPercentage = Math.round((completedCount / checklistFields.length) * 100)

    const shouldTransitionToActive = isComplete && checklist.status !== 'COMPLETED'

    if (shouldTransitionToActive) {
      // Use a transaction to update client and create lifecycle event atomically
      await prisma.$transaction([
        prisma.client.update({
          where: { id: clientId },
          data: {
            onboardingStatus: newStatus,
            lifecycleStage: 'ACTIVE',
          }
        }),
        prisma.clientLifecycleEvent.create({
          data: {
            clientId,
            fromStage: 'ONBOARDING',
            toStage: 'ACTIVE',
            reason: 'Onboarding checklist completed',
            triggeredBy: user.id,
          }
        }),
        prisma.clientOnboardingChecklist.update({
          where: { clientId },
          data: {
            status: newStatus,
            completionPercentage
          }
        }),
      ])
    } else {
      await prisma.$transaction([
        prisma.client.update({
          where: { id: clientId },
          data: {
            onboardingStatus: newStatus,
          }
        }),
        prisma.clientOnboardingChecklist.update({
          where: { clientId },
          data: {
            status: newStatus,
            completionPercentage
          }
        }),
      ])
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error) {
    console.error('Failed to update checklist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
