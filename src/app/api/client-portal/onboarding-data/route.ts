import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { safeJsonParse } from '@/shared/utils/safeJson'

// GET - Return full onboarding data for client portal
export const GET = withClientAuth(async (req, { user }) => {
  const clientId = user.clientId

  // Get the proposal with onboarding data
  const proposal = await prisma.clientProposal.findFirst({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    select: {
      accountOnboardingData: true,
      services: true,
      scopeItems: true,
      slaAccepted: true,
      slaAcceptedAt: true,
      slaSignerName: true,
      paymentConfirmed: true,
      paymentConfirmedAt: true,
      paymentMethod: true,
      contractDuration: true,
      basePrice: true,
      totalPrice: true,
      entityType: true,
      createdAt: true,
    },
  })

  // Get client record
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true, name: true, contactName: true, contactEmail: true, contactPhone: true,
      whatsapp: true, websiteUrl: true, address: true, city: true, state: true,
      gstNumber: true, industry: true, tier: true, monthlyFee: true,
      targetAudience: true, notes: true, services: true, selectedServices: true,
      onboardingStatus: true, startDate: true, logoUrl: true,
      accountManagerId: true,
    },
  })

  // Get account manager
  let accountManager: { firstName: string; lastName: string | null; email: string | null; phone: string; profile: { profilePicture: string | null } | null } | null = null
  if (client?.accountManagerId) {
    accountManager = await prisma.user.findUnique({
      where: { id: client.accountManagerId },
      select: { firstName: true, lastName: true, email: true, phone: true, profile: { select: { profilePicture: true } } },
    })
  }

  // Get team
  const team = await prisma.clientTeamMember.findMany({
    where: { clientId },
    include: { user: { select: { firstName: true, lastName: true, department: true, email: true, profile: { select: { profilePicture: true } } } } },
  })

  // Get onboarding checklist
  const checklist = await prisma.clientOnboardingChecklist.findUnique({ where: { clientId } })

  // Parse onboarding form data
  const onboardingData = proposal?.accountOnboardingData ? safeJsonParse<Record<string, unknown>>(proposal.accountOnboardingData, {}) : {}

  // Parse services
  let services: string[] = []
  try {
    const raw = client?.selectedServices || client?.services
    if (raw) {
      const parsed = JSON.parse(raw)
      services = parsed.map((s: string | { name?: string; serviceId?: string }) => typeof s === 'string' ? s : s.name || s.serviceId || '')
    }
  } catch { /* */ }

  // Organize by sections matching the onboarding form
  return NextResponse.json({
    // Basic Info
    basicInfo: {
      businessName: client?.name,
      contactName: client?.contactName || onboardingData.clientName,
      email: client?.contactEmail || onboardingData.primaryEmail,
      phone: client?.contactPhone || onboardingData.phoneNumber,
      whatsapp: client?.whatsapp,
      website: client?.websiteUrl || onboardingData.websiteUrl,
      address: client?.address || onboardingData.businessAddress,
      city: client?.city || onboardingData.city,
      state: client?.state || onboardingData.state,
      pincode: onboardingData.pinCode,
      gst: client?.gstNumber || onboardingData.gstin,
      pan: onboardingData.panNumber,
      industry: client?.industry || onboardingData.industry,
      businessType: onboardingData.businessRegistrationType || onboardingData.healthcareBusinessType,
      logo: client?.logoUrl || onboardingData.currentLogoUrl,
    },

    // Services & Contract
    contract: {
      services,
      tier: client?.tier,
      monthlyFee: client?.monthlyFee,
      contractDuration: proposal?.contractDuration,
      entityType: proposal?.entityType,
      startDate: client?.startDate?.toISOString(),
      slaAccepted: proposal?.slaAccepted,
      slaSignedAt: proposal?.slaAcceptedAt?.toISOString(),
      slaSignerName: proposal?.slaSignerName,
      paymentConfirmed: proposal?.paymentConfirmed,
    },

    // Business Understanding
    business: {
      identity: onboardingData.identity,
      valueProposition: onboardingData.valueProposition,
      biggestStrength: onboardingData.biggestStrength,
      topServices: onboardingData.topServices,
      contentTopics: onboardingData.contentTopics,
      questionsBeforeBuying: onboardingData.questionsBeforeBuying,
      businessHours: onboardingData.businessHours,
      timeZone: onboardingData.timeZone,
      seasonalVariations: onboardingData.seasonalVariations,
      peakBusinessPeriods: onboardingData.peakBusinessPeriods,
      marketPosition: onboardingData.marketPosition,
    },

    // Target Audience
    audience: {
      primaryTarget: onboardingData.primaryTargetAudience || safeJsonParse<Record<string, string>>(client?.targetAudience || '', {})?.targetAudience,
      ageGroup: onboardingData.targetAgeGroup || onboardingData.audienceAgeRange,
      gender: onboardingData.targetGender,
      occupation: onboardingData.targetOccupation,
      incomeLevel: onboardingData.targetIncomeLevel || onboardingData.audienceIncomeLevel,
      location: onboardingData.primaryLocation || onboardingData.geographicFocus,
      preferredChannels: onboardingData.preferredChannels,
      // Healthcare specific
      commonConditions: onboardingData.commonConditions,
      insuranceTypes: onboardingData.insuranceTypesAccepted,
      healthEducationTopics: onboardingData.healthEducationTopics,
    },

    // Competitors
    competitors: {
      competitor1: onboardingData.competitor1,
      competitor2: onboardingData.competitor2,
      competitor3: onboardingData.competitor3,
      advantages: onboardingData.competitiveAdvantages,
    },

    // Customer Psychology
    psychology: {
      fears: onboardingData.customerFears,
      painPoints: onboardingData.customerPainPoints,
      problems: onboardingData.customerProblems,
      needsDesires: onboardingData.customerNeedsDesires,
    },

    // Communication & Working Style
    communication: {
      preferredMethod: onboardingData.preferredCommunicationMethod,
      reportingFrequency: onboardingData.reportingFrequency,
      meetingPreferences: onboardingData.meetingPreferences,
      expectedRoiTimeline: onboardingData.expectedRoiTimeline,
      investmentPriorities: onboardingData.investmentPriorities,
    },

    // SEO & Marketing
    seoMarketing: {
      targetKeywords: onboardingData.targetKeywords,
      seoInvolvement: onboardingData.seoInvolvement,
      seoRemarks: onboardingData.seoRemarks,
      previousSeoReport: onboardingData.previousSeoReportUrl,
      adsPlatforms: onboardingData.advertisingPlatforms,
      adsBudget: onboardingData.adsBudgetLevel,
      adsInvolvement: onboardingData.adsInvolvement,
      socialInvolvement: onboardingData.socialMediaInvolvement,
      monthlyBudget: onboardingData.monthlyMarketingBudget,
    },

    // Branding & Design
    branding: {
      hasLogo: onboardingData.hasExistingLogo,
      logoUrl: onboardingData.logoUrl || client?.logoUrl,
      brandGuidelinesUrl: onboardingData.brandGuidelinesUrl,
      brandPersonality: onboardingData.brandPersonality,
      preferredColors: onboardingData.preferredColors,
      designStyle: onboardingData.designStylePreference,
      brandsAdmired: onboardingData.brandsYouAdmire,
      designMaterials: onboardingData.designMaterialsNeeded,
    },

    // Technical
    technical: {
      techStack: onboardingData.currentTechStack,
      integrationNeeds: onboardingData.integrationNeeds,
      kpis: onboardingData.kpis,
      successDefinition: onboardingData.successDefinition,
    },

    // Team
    accountManager: accountManager ? {
      name: `${accountManager.firstName} ${accountManager.lastName || ''}`.trim(),
      email: accountManager.email,
      phone: accountManager.phone,
      avatar: accountManager.profile?.profilePicture,
    } : null,

    team: team.map(t => ({
      name: `${t.user.firstName} ${t.user.lastName || ''}`.trim(),
      role: t.role,
      department: t.user.department,
      email: t.user.email,
      avatar: t.user.profile?.profilePicture,
    })),

    // Onboarding Progress
    checklist: checklist ? {
      completionPercentage: checklist.completionPercentage,
      status: checklist.status,
      contractSigned: checklist.contractSigned,
      invoicePaid: checklist.invoicePaid,
      kickoffDone: checklist.kickoffMeetingDone,
      brandGuidelines: checklist.brandGuidelinesReceived,
      websiteAccess: checklist.websiteAccessGranted,
      analyticsAccess: checklist.analyticsAccessGranted,
      socialAccess: checklist.socialMediaAccess,
      adsAccess: checklist.adsAccountAccess,
      accountManagerAssigned: checklist.accountManagerAssigned,
      teamIntroDone: checklist.teamIntroductionDone,
      communicationSetup: checklist.communicationChannelSetup,
      firstStrategyCall: checklist.firstStrategyCallDone,
      contentCalendar: checklist.contentCalendarShared,
      firstDeliverables: checklist.firstDeliverablesApproved,
    } : null,

    onboardingStatus: client?.onboardingStatus,
  })
}, { rateLimit: 'READ' })
