/**
 * Syncs ClientProposal progress to ClientOnboardingChecklist
 * Called after key proposal state changes (payment confirmed, activation, etc.)
 */

import { prisma } from '@/server/db/prisma'

interface ProposalState {
  clientId: string
  slaAccepted?: boolean
  paymentConfirmed?: boolean
  accountOnboardingCompleted?: boolean
  portalActivated?: boolean
  accountManagerId?: string | null
  teamAllocated?: boolean
  accountOnboardingData?: string | null
}

export async function syncProposalToChecklist(proposal: ProposalState) {
  if (!proposal.clientId) return

  // Parse onboarding data to check what access was granted
  let onboardingData: Record<string, unknown> = {}
  try {
    if (proposal.accountOnboardingData) {
      onboardingData = JSON.parse(proposal.accountOnboardingData)
    }
  } catch (error) {
    console.error(`Failed to parse accountOnboardingData for client ${proposal.clientId}:`, error)
  }

  const checklistData: Record<string, boolean | string | number | Date | null> = {}

  // Pre-Kickoff items
  if (proposal.slaAccepted) {
    checklistData.contractSigned = true
    checklistData.ndaSigned = true // SLA includes NDA terms
  }
  if (proposal.paymentConfirmed) {
    checklistData.invoicePaid = true
  }

  // Discovery & Access items from onboarding form
  if (proposal.accountOnboardingCompleted) {
    // Check what the client provided in the onboarding form
    if (onboardingData.adminPanelUrl || onboardingData.adminUsername) {
      checklistData.websiteAccessGranted = true
    }
    if (onboardingData.analyticsAccessGranted || onboardingData.gmbAccessGranted || onboardingData.searchConsoleAccessGranted) {
      checklistData.analyticsAccessGranted = true
    }
    if (onboardingData.gmbAccessGranted) {
      checklistData.gmbAccessGranted = true
    }
    if (onboardingData.searchConsoleAccessGranted) {
      checklistData.searchConsoleAccessGranted = true
    }
    if (onboardingData.facebookAccessGranted || onboardingData.linkedinAccessGranted) {
      checklistData.socialMediaAccess = true
    }
    if (onboardingData.currentLogoUrl || onboardingData.brandGuidelinesUrl) {
      checklistData.brandGuidelinesReceived = true
    }
  }

  // Team & Communication items
  if (proposal.accountManagerId) {
    checklistData.accountManagerAssigned = true
  }
  if (proposal.teamAllocated) {
    checklistData.teamIntroductionDone = false // Team allocated but intro not done yet
  }
  if (proposal.portalActivated) {
    checklistData.communicationChannelSetup = true
  }

  // Calculate completion percentage
  const allItems = [
    'contractSigned', 'invoicePaid', 'ndaSigned',
    'kickoffMeetingDone', 'brandGuidelinesReceived', 'websiteAccessGranted',
    'analyticsAccessGranted', 'socialMediaAccess', 'adsAccountAccess',
    'trackingSetup', 'pixelsInstalled', 'crmIntegrated', 'reportingDashboardReady',
    'accountManagerAssigned', 'teamIntroductionDone', 'communicationChannelSetup',
    'firstStrategyCallDone', 'contentCalendarShared', 'firstDeliverablesApproved',
    'monthlyReportingSchedule',
  ]

  // Get existing checklist to merge
  const existing = await prisma.clientOnboardingChecklist.findUnique({
    where: { clientId: proposal.clientId },
  })

  const mergedData: Record<string, boolean> = {}
  for (const item of allItems) {
    // Use new data if available, otherwise keep existing
    if (checklistData[item] !== undefined) {
      mergedData[item] = checklistData[item] as boolean
    } else if (existing) {
      mergedData[item] = (existing as Record<string, unknown>)[item] as boolean || false
    } else {
      mergedData[item] = false
    }
  }

  const completedCount = Object.values(mergedData).filter(Boolean).length
  const completionPercentage = Math.round((completedCount / allItems.length) * 100)

  const status = completionPercentage === 0 ? 'PENDING'
    : completionPercentage === 100 ? 'COMPLETED'
    : 'IN_PROGRESS'

  await prisma.clientOnboardingChecklist.upsert({
    where: { clientId: proposal.clientId },
    create: {
      clientId: proposal.clientId,
      ...mergedData,
      completionPercentage,
      status,
    },
    update: {
      ...mergedData,
      completionPercentage,
      status,
    },
  })

  // Update client onboarding status
  const clientStatus = completionPercentage === 100 ? 'COMPLETED'
    : proposal.paymentConfirmed ? 'IN_PROGRESS'
    : proposal.slaAccepted ? 'AWAITING_PAYMENT'
    : 'PENDING'

  await prisma.client.update({
    where: { id: proposal.clientId },
    data: {
      onboardingStatus: clientStatus,
      lifecycleStage: completionPercentage === 100 ? 'ACTIVE' : 'ONBOARDING',
    },
  }).catch(() => { /* client may not exist yet */ })
}
