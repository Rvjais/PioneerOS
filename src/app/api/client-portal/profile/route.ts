import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { z } from 'zod'

// GET /api/client-portal/profile - Get client profile, portal settings, and onboarding checklist
export const GET = withClientAuth(async (req, { user }) => {
  const clientId = user.clientId

  // Fetch all profile data in parallel (eliminates N+1 sequential queries)
  const [client, portal, onboarding, teamMembers] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        whatsapp: true,
        websiteUrl: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        gstNumber: true,
        businessType: true,
        industry: true,
        tier: true,
        status: true,
        services: true,
        selectedServices: true,
        platform: true,
        startDate: true,
        onboardingStatus: true,
        lifecycleStage: true,
        accountManagerId: true,
        facebookUrl: true,
        instagramUrl: true,
        linkedinUrl: true,
        twitterUrl: true,
        youtubeUrl: true,
        targetAudience: true,
        competitor1: true,
        competitor2: true,
        competitor3: true,
        notes: true,
      },
    }),
    prisma.clientPortal.findUnique({
      where: { clientId },
      select: {
        logoUrl: true,
        themeColor: true,
        isActive: true,
        lastAccessed: true,
      },
    }),
    prisma.clientOnboardingChecklist.findUnique({
      where: { clientId },
      select: {
        contractSigned: true, contractSignedAt: true,
        invoicePaid: true, invoicePaidAt: true,
        ndaSigned: true, ndaSignedAt: true,
        kickoffMeetingDone: true, kickoffMeetingAt: true,
        brandGuidelinesReceived: true, brandGuidelinesAt: true,
        websiteAccessGranted: true, websiteAccessAt: true,
        analyticsAccessGranted: true, analyticsAccessAt: true,
        socialMediaAccess: true, socialMediaAccessAt: true,
        adsAccountAccess: true, adsAccountAccessAt: true,
        trackingSetup: true, trackingSetupAt: true,
        pixelsInstalled: true, pixelsInstalledAt: true,
        crmIntegrated: true, crmIntegratedAt: true,
        reportingDashboardReady: true, reportingDashboardAt: true,
        accountManagerAssigned: true, accountManagerAssignedAt: true,
        teamIntroductionDone: true, teamIntroductionAt: true,
        communicationChannelSetup: true, communicationChannelAt: true,
        firstStrategyCallDone: true, firstStrategyCallAt: true,
        contentCalendarShared: true, contentCalendarAt: true,
        firstDeliverablesApproved: true, firstDeliverablesAt: true,
        monthlyReportingSchedule: true, monthlyReportingAt: true,
        completionPercentage: true,
        status: true,
      },
    }),
    prisma.clientTeamMember.findMany({
      where: { clientId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            department: true,
            role: true,
            profile: { select: { profilePicture: true } },
          },
        },
      },
      orderBy: [{ isPrimary: 'desc' }, { role: 'asc' }],
    }),
  ])

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Fetch account manager (only if assigned — conditional query after parallel batch)
  let accountManager: {
    id: string
    name: string
    email: string | null
    phone: string
    avatarUrl: string | null
  } | null = null
  if (client.accountManagerId) {
    const manager = await prisma.user.findUnique({
      where: { id: client.accountManagerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        profile: { select: { profilePicture: true } },
      },
    })
    if (manager) {
      accountManager = {
        id: manager.id,
        name: `${manager.firstName} ${manager.lastName || ''}`.trim(),
        email: manager.email,
        phone: manager.phone,
        avatarUrl: manager.profile?.profilePicture || null,
      }
    }
  }

  // Parse services JSON - prefer selectedServices from onboarding, fall back to services
  let parsedServices: string[] = []
  const rawServices = client.selectedServices || client.services
  if (rawServices) {
    try {
      const parsed = JSON.parse(rawServices)
      if (Array.isArray(parsed)) {
        // Handle both [{serviceId, name}] objects and ["SEO"] strings
        parsedServices = parsed.map((s: string | { serviceId?: string; name?: string }) =>
          typeof s === 'string' ? s : (s.name || s.serviceId || String(s))
        )
      }
    } catch {
      parsedServices = rawServices.split(',').map((s: string) => s.trim())
    }
  }

  // Parse targetAudience JSON (business details from onboarding)
  let businessDetails: {
    tagline?: string
    targetAudience?: string
    competitors?: string
    usp?: string
    brandVoice?: string
  } = {}
  if (client.targetAudience) {
    try {
      businessDetails = JSON.parse(client.targetAudience)
    } catch {
      // Invalid JSON, ignore
    }
  }

  // Parse notes JSON (involvement/communication preferences)
  let communicationPreferences: {
    level?: string
    contentApproval?: boolean
    strategyDecisions?: boolean
    reportingFrequency?: string
    communicationPreference?: string
    meetingFrequency?: string
    preferredTime?: string
    escalationContact?: string
    escalationPhone?: string
  } = {}
  let additionalNotes: string | null = null
  if (client.notes) {
    try {
      const notesData = JSON.parse(client.notes)
      communicationPreferences = notesData.involvement || {}
      additionalNotes = notesData.additionalNotes || null
    } catch {
      // Invalid JSON, ignore
    }
  }

  // Build competitors list
  const competitors = [
    client.competitor1,
    client.competitor2,
    client.competitor3,
  ].filter(Boolean)

  // Build social media links
  const socialMedia = {
    facebook: client.facebookUrl !== 'pending' ? client.facebookUrl : null,
    instagram: client.instagramUrl !== 'pending' ? client.instagramUrl : null,
    linkedin: client.linkedinUrl !== 'pending' ? client.linkedinUrl : null,
    twitter: client.twitterUrl !== 'pending' ? client.twitterUrl : null,
    youtube: client.youtubeUrl !== 'pending' ? client.youtubeUrl : null,
  }

  // Group onboarding items by phase
  const onboardingPhases = onboarding ? {
    preKickoff: {
      label: 'Pre-Kickoff',
      items: [
        { key: 'contractSigned', label: 'Contract Signed', completed: onboarding.contractSigned, completedAt: onboarding.contractSignedAt },
        { key: 'invoicePaid', label: 'Initial Invoice Paid', completed: onboarding.invoicePaid, completedAt: onboarding.invoicePaidAt },
        { key: 'ndaSigned', label: 'NDA Signed', completed: onboarding.ndaSigned, completedAt: onboarding.ndaSignedAt },
      ],
    },
    discoveryAccess: {
      label: 'Discovery & Access',
      items: [
        { key: 'kickoffMeetingDone', label: 'Kickoff Meeting', completed: onboarding.kickoffMeetingDone, completedAt: onboarding.kickoffMeetingAt },
        { key: 'brandGuidelinesReceived', label: 'Brand Guidelines Received', completed: onboarding.brandGuidelinesReceived, completedAt: onboarding.brandGuidelinesAt },
        { key: 'websiteAccessGranted', label: 'Website Access', completed: onboarding.websiteAccessGranted, completedAt: onboarding.websiteAccessAt },
        { key: 'analyticsAccessGranted', label: 'Analytics Access', completed: onboarding.analyticsAccessGranted, completedAt: onboarding.analyticsAccessAt },
        { key: 'socialMediaAccess', label: 'Social Media Access', completed: onboarding.socialMediaAccess, completedAt: onboarding.socialMediaAccessAt },
        { key: 'adsAccountAccess', label: 'Ads Account Access', completed: onboarding.adsAccountAccess, completedAt: onboarding.adsAccountAccessAt },
      ],
    },
    technicalSetup: {
      label: 'Technical Setup',
      items: [
        { key: 'trackingSetup', label: 'Tracking Setup', completed: onboarding.trackingSetup, completedAt: onboarding.trackingSetupAt },
        { key: 'pixelsInstalled', label: 'Pixels Installed', completed: onboarding.pixelsInstalled, completedAt: onboarding.pixelsInstalledAt },
        { key: 'crmIntegrated', label: 'CRM Integration', completed: onboarding.crmIntegrated, completedAt: onboarding.crmIntegratedAt },
        { key: 'reportingDashboardReady', label: 'Reporting Dashboard Ready', completed: onboarding.reportingDashboardReady, completedAt: onboarding.reportingDashboardAt },
      ],
    },
    teamCommunication: {
      label: 'Team & Communication',
      items: [
        { key: 'accountManagerAssigned', label: 'Account Manager Assigned', completed: onboarding.accountManagerAssigned, completedAt: onboarding.accountManagerAssignedAt },
        { key: 'teamIntroductionDone', label: 'Team Introduction', completed: onboarding.teamIntroductionDone, completedAt: onboarding.teamIntroductionAt },
        { key: 'communicationChannelSetup', label: 'Communication Channels Setup', completed: onboarding.communicationChannelSetup, completedAt: onboarding.communicationChannelAt },
        { key: 'firstStrategyCallDone', label: 'First Strategy Call', completed: onboarding.firstStrategyCallDone, completedAt: onboarding.firstStrategyCallAt },
      ],
    },
    deliverablesSetup: {
      label: 'Deliverables Setup',
      items: [
        { key: 'contentCalendarShared', label: 'Content Calendar Shared', completed: onboarding.contentCalendarShared, completedAt: onboarding.contentCalendarAt },
        { key: 'firstDeliverablesApproved', label: 'First Deliverables Approved', completed: onboarding.firstDeliverablesApproved, completedAt: onboarding.firstDeliverablesAt },
        { key: 'monthlyReportingSchedule', label: 'Monthly Reporting Schedule', completed: onboarding.monthlyReportingSchedule, completedAt: onboarding.monthlyReportingAt },
      ],
    },
  } : null

  const formattedTeamMembers = teamMembers.map((member) => ({
    id: member.user.id,
    name: `${member.user.firstName} ${member.user.lastName || ''}`.trim(),
    email: member.user.email,
    phone: member.user.phone,
    department: member.user.department,
    role: member.role,
    userRole: member.user.role,
    isPrimary: member.isPrimary,
    avatarUrl: member.user.profile?.profilePicture || null,
  }))

  return NextResponse.json({
    client: {
      id: client.id,
      name: client.name,
      logoUrl: client.logoUrl,
      contactName: client.contactName,
      contactEmail: client.contactEmail,
      contactPhone: client.contactPhone,
      whatsapp: client.whatsapp,
      websiteUrl: client.websiteUrl,
      address: client.address,
      city: client.city,
      state: client.state,
      pincode: client.pincode,
      gstNumber: client.gstNumber,
      businessType: client.businessType,
      industry: client.industry,
      tier: client.tier,
      status: client.status,
      services: parsedServices,
      startDate: client.startDate?.toISOString() || null,
      onboardingStatus: client.onboardingStatus,
      lifecycleStage: client.lifecycleStage,
      // Business details from onboarding
      tagline: businessDetails.tagline || null,
      targetAudience: businessDetails.targetAudience || null,
      competitors: competitors.length > 0 ? competitors : null,
      usp: businessDetails.usp || null,
      brandVoice: businessDetails.brandVoice || null,
      // Social media links
      socialMedia,
      // Communication preferences from onboarding
      communicationPreferences: Object.keys(communicationPreferences).length > 0 ? {
        involvementLevel: communicationPreferences.level || null,
        contentApproval: communicationPreferences.contentApproval || false,
        strategyDecisions: communicationPreferences.strategyDecisions || false,
        reportingFrequency: communicationPreferences.reportingFrequency || null,
        preferredChannel: communicationPreferences.communicationPreference || null,
        meetingFrequency: communicationPreferences.meetingFrequency || null,
        preferredTime: communicationPreferences.preferredTime || null,
        escalationContact: communicationPreferences.escalationContact || null,
        escalationPhone: communicationPreferences.escalationPhone || null,
      } : null,
      additionalNotes,
    },
    portal: portal ? {
      logoUrl: portal.logoUrl,
      themeColor: portal.themeColor,
      isActive: portal.isActive,
      lastAccessed: portal.lastAccessed?.toISOString() || null,
    } : null,
    accountManager: accountManager,
    teamMembers: formattedTeamMembers,
    onboarding: onboarding ? {
      completionPercentage: onboarding.completionPercentage,
      status: onboarding.status,
      phases: onboardingPhases,
    } : null,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      hasMarketingAccess: user.hasMarketingAccess,
      hasWebsiteAccess: user.hasWebsiteAccess,
    },
  })
}, { rateLimit: 'READ' })

// Validation schema for communication preferences
const communicationPreferencesSchema = z.object({
  involvementLevel: z.string().max(50).optional().nullable(),
  contentApproval: z.boolean().optional(),
  strategyDecisions: z.boolean().optional(),
  reportingFrequency: z.string().max(50).optional().nullable(),
  preferredChannel: z.string().max(50).optional().nullable(),
  meetingFrequency: z.string().max(50).optional().nullable(),
  preferredTime: z.string().max(50).optional().nullable(),
  escalationContact: z.string().max(100).optional().nullable(),
  escalationPhone: z.string().max(20).optional().nullable(),
}).optional()

// Validation schema for client update
const clientUpdateSchema = z.object({
  // Company info
  name: z.string().min(1).max(200).optional(),
  logoUrl: z.string().url().optional().nullable().or(z.literal('')),
  contactName: z.string().max(100).optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().max(20).optional().nullable(),
  whatsapp: z.string().max(20).optional().nullable(),
  websiteUrl: z.string().url().optional().nullable().or(z.literal('')),
  // Address
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().max(10).optional().nullable(),
  // Business info
  gstNumber: z.string().max(20).optional().nullable(),
  businessType: z.string().max(50).optional().nullable(),
  industry: z.string().max(50).optional().nullable(),
  // Social media
  facebookUrl: z.string().optional().nullable(),
  instagramUrl: z.string().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
  twitterUrl: z.string().optional().nullable(),
  youtubeUrl: z.string().optional().nullable(),
  // Competitors
  competitor1: z.string().max(200).optional().nullable(),
  competitor2: z.string().max(200).optional().nullable(),
  competitor3: z.string().max(200).optional().nullable(),
  // Brand info
  tagline: z.string().max(500).optional().nullable(),
  brandVoice: z.string().max(50).optional().nullable(),
  targetAudience: z.string().max(2000).optional().nullable(),
  usp: z.string().max(2000).optional().nullable(),
  // Communication preferences
  communicationPreferences: communicationPreferencesSchema,
})

// PUT /api/client-portal/profile - Update client data
export const PUT = withClientAuth(async (req, { user }) => {
  const body = await req.json()
  const validation = clientUpdateSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const data = validation.data
  const clientId = user.clientId

  // Build update object, only including fields that were provided
  const updateData: Record<string, unknown> = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl || null
  if (data.contactName !== undefined) updateData.contactName = data.contactName || null
  if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail || null
  if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone || null
  if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp || null
  if (data.websiteUrl !== undefined) updateData.websiteUrl = data.websiteUrl || null
  if (data.address !== undefined) updateData.address = data.address || null
  if (data.city !== undefined) updateData.city = data.city || null
  if (data.state !== undefined) updateData.state = data.state || null
  if (data.pincode !== undefined) updateData.pincode = data.pincode || null
  if (data.gstNumber !== undefined) updateData.gstNumber = data.gstNumber || null
  if (data.businessType !== undefined) updateData.businessType = data.businessType || null
  if (data.industry !== undefined) updateData.industry = data.industry || null
  if (data.facebookUrl !== undefined) updateData.facebookUrl = data.facebookUrl || null
  if (data.instagramUrl !== undefined) updateData.instagramUrl = data.instagramUrl || null
  if (data.linkedinUrl !== undefined) updateData.linkedinUrl = data.linkedinUrl || null
  if (data.twitterUrl !== undefined) updateData.twitterUrl = data.twitterUrl || null
  if (data.youtubeUrl !== undefined) updateData.youtubeUrl = data.youtubeUrl || null
  if (data.competitor1 !== undefined) updateData.competitor1 = data.competitor1 || null
  if (data.competitor2 !== undefined) updateData.competitor2 = data.competitor2 || null
  if (data.competitor3 !== undefined) updateData.competitor3 = data.competitor3 || null

  // Handle brand info (stored as JSON in targetAudience field)
  if (data.tagline !== undefined || data.brandVoice !== undefined ||
      data.targetAudience !== undefined || data.usp !== undefined) {
    // Get existing targetAudience JSON
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId },
      select: { targetAudience: true },
    })

    let brandData: Record<string, unknown> = {}
    if (existingClient?.targetAudience) {
      try {
        brandData = JSON.parse(existingClient.targetAudience)
      } catch {
        // Invalid JSON, start fresh
      }
    }

    if (data.tagline !== undefined) brandData.tagline = data.tagline || null
    if (data.brandVoice !== undefined) brandData.brandVoice = data.brandVoice || null
    if (data.targetAudience !== undefined) brandData.targetAudience = data.targetAudience || null
    if (data.usp !== undefined) brandData.usp = data.usp || null

    updateData.targetAudience = JSON.stringify(brandData)
  }

  // Handle communication preferences (stored as JSON in notes field)
  if (data.communicationPreferences) {
    // Get existing notes JSON
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId },
      select: { notes: true },
    })

    let notesData: Record<string, unknown> = {}
    if (existingClient?.notes) {
      try {
        notesData = JSON.parse(existingClient.notes)
      } catch {
        // Invalid JSON, start fresh
      }
    }

    // Update involvement preferences
    notesData.involvement = {
      level: data.communicationPreferences.involvementLevel || null,
      contentApproval: data.communicationPreferences.contentApproval || false,
      strategyDecisions: data.communicationPreferences.strategyDecisions || false,
      reportingFrequency: data.communicationPreferences.reportingFrequency || null,
      communicationPreference: data.communicationPreferences.preferredChannel || null,
      meetingFrequency: data.communicationPreferences.meetingFrequency || null,
      preferredTime: data.communicationPreferences.preferredTime || null,
      escalationContact: data.communicationPreferences.escalationContact || null,
      escalationPhone: data.communicationPreferences.escalationPhone || null,
    }

    updateData.notes = JSON.stringify(notesData)
  }

  // Update client
  const updatedClient = await prisma.client.update({
    where: { id: clientId },
    data: updateData,
    select: {
      id: true,
      name: true,
      logoUrl: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,
      whatsapp: true,
      websiteUrl: true,
      address: true,
      city: true,
      state: true,
      pincode: true,
      gstNumber: true,
      businessType: true,
      industry: true,
      facebookUrl: true,
      instagramUrl: true,
      linkedinUrl: true,
      twitterUrl: true,
      youtubeUrl: true,
      competitor1: true,
      competitor2: true,
      competitor3: true,
    },
  })

  // Also sync logoUrl to ClientPortal table if it was updated
  if (data.logoUrl !== undefined) {
    await prisma.clientPortal.upsert({
      where: { clientId },
      update: { logoUrl: data.logoUrl || null },
      create: {
        clientId,
        logoUrl: data.logoUrl || null,
        themeColor: '#3B82F6',
        isActive: true,
      },
    })
  }

  // Log activity
  await prisma.clientUserActivity.create({
    data: {
      clientUserId: user.id,
      action: 'UPDATE_COMPANY_PROFILE',
      resource: 'Company Profile',
      resourceType: 'PROFILE',
      details: JSON.stringify({ fields: Object.keys(updateData) }),
    },
  })

  return NextResponse.json({
    success: true,
    client: updatedClient,
  })
}, { requiredRole: 'PRIMARY', rateLimit: 'WRITE' })
