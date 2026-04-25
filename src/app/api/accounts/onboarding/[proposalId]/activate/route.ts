import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { z } from 'zod'
import { generateClientId } from '@/server/db/sequence'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { withAuth } from '@/server/auth/withAuth'

// Schema for manager review and activation
const activateSchema = z.object({
  // Account Manager Assignment
  accountManagerId: z.string().min(1, 'Account manager is required'),

  // Team Allocation
  teamMembers: z.array(z.object({
    userId: z.string(),
    role: z.enum(['LEAD', 'MEMBER', 'SUPPORT']),
    department: z.string().optional(),
  })).optional(),

  // Portal Activation
  activatePortal: z.boolean().default(true),

  // Client Credentials (if activating portal)
  clientEmail: z.string().email().optional(),
  clientPassword: z.string().min(8).optional(),
  generatePassword: z.boolean().default(true),

  // Kickoff Meeting
  scheduleKickoff: z.boolean().default(false),
  kickoffDate: z.string().optional(),
  kickoffNotes: z.string().optional(),

  // Notes
  internalNotes: z.string().optional(),
})

// POST: Manager review and activate portal (Step 6)
export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // Check permissions (Admin/Management only)
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true, department: true, firstName: true, lastName: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN']
    const allowedDepartments = ['MANAGEMENT']

    if (!allowedRoles.includes(dbUser.role) && !allowedDepartments.includes(dbUser.department || '')) {
      return NextResponse.json({ error: 'Only managers can activate client portals' }, { status: 403 })
    }

    const { proposalId } = await routeParams!
    const body = await req.json()

    // Validate input
    const validation = activateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Find proposal with details
    const proposal = await prisma.clientProposal.findUnique({
      where: { id: proposalId },
      include: { onboardingDetails: true },
    })

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      )
    }

    // Validation checks
    if (!proposal.paymentConfirmed) {
      return NextResponse.json(
        { error: 'Payment must be confirmed before activation' },
        { status: 400 }
      )
    }

    if (!proposal.accountOnboardingCompleted) {
      return NextResponse.json(
        { error: 'Account onboarding must be completed before activation' },
        { status: 400 }
      )
    }

    // Check if already activated
    if (proposal.portalActivated) {
      return NextResponse.json({
        success: true,
        message: 'Portal already activated',
        proposal: {
          id: proposal.id,
          portalActivated: true,
          activatedAt: proposal.portalActivatedAt,
        },
      })
    }

    const now = new Date()

    // Generate client code
    const clientCode = await generateClientId()

    // Generate password if needed
    let plainPassword = ''
    let hashedPassword = ''
    if (data.activatePortal) {
      if (data.generatePassword) {
        plainPassword = nanoid(12)
      } else if (data.clientPassword) {
        plainPassword = data.clientPassword
      } else {
        plainPassword = nanoid(12)
      }
      hashedPassword = await bcrypt.hash(plainPassword, 10)
    }

    // Parse services for client record
    let services: Array<{ serviceId: string }> = []
    try {
      services = JSON.parse(proposal.services || '[]')
    } catch {
      services = []
    }

    // Create or update client record
    let client = proposal.clientId
      ? await prisma.client.findUnique({ where: { id: proposal.clientId } })
      : null

    // Parse onboarding data for Client record enrichment
    let onboardingDetails: Record<string, unknown> = {}
    try {
      if (proposal.accountOnboardingData) {
        onboardingDetails = JSON.parse(proposal.accountOnboardingData)
      }
    } catch { /* ignore parse errors */ }

    const clientData = {
      clientCode,
      name: proposal.clientName || proposal.prospectName,
      contactName: (onboardingDetails.clientName as string) || proposal.prospectCompany || proposal.prospectName,
      contactEmail: data.clientEmail || proposal.clientEmail || proposal.prospectEmail,
      contactPhone: proposal.clientPhone || proposal.prospectPhone,
      status: 'ACTIVE',
      lifecycleStage: 'ACTIVE',
      onboardingStatus: 'COMPLETED',
      entityType: proposal.entityType,
      services: JSON.stringify(services.map((s: { serviceId: string }) => s.serviceId)),
      selectedServices: JSON.stringify(services),
      startDate: now,
      contractLength: proposal.contractDuration || '12_MONTHS',
      monthlyFee: proposal.basePrice,
      accountManagerId: data.accountManagerId,
      // Address from proposal confirmation
      address: proposal.clientAddress,
      city: proposal.clientCity,
      state: proposal.clientState,
      pincode: proposal.clientPincode,
      gstNumber: proposal.clientGst,
      // Enriched from onboarding form
      industry: (onboardingDetails.industry as string) || undefined,
      websiteUrl: (onboardingDetails.websiteUrl as string) || undefined,
      targetAudience: onboardingDetails.primaryTargetAudience ? JSON.stringify({
        target: onboardingDetails.primaryTargetAudience,
        ageGroup: onboardingDetails.targetAgeGroup,
        gender: onboardingDetails.targetGender,
        income: onboardingDetails.targetIncomeLevel,
        location: onboardingDetails.primaryLocation,
        geographic: onboardingDetails.geographicFocus,
      }) : undefined,
      notes: onboardingDetails.biggestStrength ? JSON.stringify({
        identity: onboardingDetails.identity,
        valueProposition: onboardingDetails.valueProposition,
        biggestStrength: onboardingDetails.biggestStrength,
        competitors: [onboardingDetails.competitor1, onboardingDetails.competitor2, onboardingDetails.competitor3].filter(Boolean),
        communicationPreference: onboardingDetails.preferredCommunicationMethod,
        reportingFrequency: onboardingDetails.reportingFrequency,
        meetingPreferences: onboardingDetails.meetingPreferences,
      }) : undefined,
    }

    // Wrap core operations in a transaction to ensure consistency
    const { client: txClient, updated } = await prisma.$transaction(async (tx) => {
      let innerClient
      if (!client) {
        innerClient = await tx.client.create({ data: clientData })
      } else {
        innerClient = await tx.client.update({
          where: { id: client!.id },
          data: {
            ...clientData,
            name: client!.name, // Don't overwrite existing name
          },
        })
      }

      // Create onboarding checklist for post-activation tracking
      const existingChecklist = await tx.clientOnboardingChecklist.findUnique({
        where: { clientId: innerClient.id },
      }).catch(() => null)

      if (!existingChecklist) {
        await tx.clientOnboardingChecklist.create({
          data: {
            clientId: innerClient.id,
            contractSigned: proposal.slaAccepted || false,
            invoicePaid: proposal.paymentConfirmed || false,
            accountManagerAssigned: !!data.accountManagerId,
            teamIntroductionDone: false,
            status: 'IN_PROGRESS',
            completionPercentage: 30,
          },
        }).catch(() => { /* ignore if already exists */ })
      }

      // Create team allocation records
      if (data.teamMembers && data.teamMembers.length > 0) {
        for (const member of data.teamMembers) {
          await tx.clientTeamMember.upsert({
            where: {
              clientId_userId: {
                clientId: innerClient.id,
                userId: member.userId,
              },
            },
            create: {
              clientId: innerClient.id,
              userId: member.userId,
              role: member.role,
              assignedAt: now,
            },
            update: {
              role: member.role,
            },
          })
        }
      }

      // Update proposal
      const updatedProposal = await tx.clientProposal.update({
        where: { id: proposalId },
        data: {
          managerReviewed: true,
          managerReviewedAt: now,
          managerReviewedBy: user.id,
          accountManagerId: data.accountManagerId,
          teamAllocated: data.teamMembers && data.teamMembers.length > 0,
          portalActivated: data.activatePortal,
          portalActivatedAt: data.activatePortal ? now : null,
          clientId: innerClient.id,
          status: 'ACTIVATED',
          currentStep: 6,
        },
      })

      return { client: innerClient, updated: updatedProposal }
    })

    // txClient is guaranteed non-null — both branches of the if/else in the transaction assign innerClient
    const activatedClient = txClient!

    // Create structured AccountOnboardingDetails from raw JSON
    if (onboardingDetails && Object.keys(onboardingDetails).length > 0) {
      const existingDetails = await prisma.accountOnboardingDetails.findUnique({
        where: { proposalId },
      }).catch(() => null)

      if (!existingDetails) {
        await prisma.accountOnboardingDetails.create({
          data: {
            proposalId,
            brandName: (onboardingDetails.clientName as string) || activatedClient.name,
            brandTagline: onboardingDetails.identity as string || null,
            brandDescription: onboardingDetails.biggestStrength as string || null,
            brandVoice: onboardingDetails.brandPersonality as string || null,
            targetAudience: onboardingDetails.primaryTargetAudience as string || null,
            competitors: [onboardingDetails.competitor1, onboardingDetails.competitor2, onboardingDetails.competitor3].filter(Boolean).join(', ') || null,
            uniqueSellingPoint: onboardingDetails.valueProposition as string || null,
            communicationStyle: onboardingDetails.preferredCommunicationMethod as string || null,
            reportingFrequency: onboardingDetails.reportingFrequency as string || null,
            meetingPreference: onboardingDetails.meetingPreferences as string || null,
            decisionMaker: onboardingDetails.decisionMakers as string || null,
            involvementLevel: onboardingDetails.seoInvolvement as string || onboardingDetails.socialMediaInvolvement as string || null,
            primaryContactName: onboardingDetails.clientName as string || null,
            primaryContactPhone: onboardingDetails.phoneNumber as string || null,
            primaryContactEmail: onboardingDetails.primaryEmail as string || null,
            whatsappNumber: onboardingDetails.phoneNumber as string || null,
            seoDetails: onboardingDetails.seoRemarks ? JSON.stringify({ remarks: onboardingDetails.seoRemarks, involvement: onboardingDetails.seoInvolvement }) : null,
            socialDetails: onboardingDetails.socialMediaInvolvement ? JSON.stringify({ involvement: onboardingDetails.socialMediaInvolvement }) : null,
            adsDetails: onboardingDetails.adsRemarks ? JSON.stringify({ remarks: onboardingDetails.adsRemarks, involvement: onboardingDetails.adsInvolvement, budget: onboardingDetails.adsBudgetLevel }) : null,
            contentApprovalRequired: !!onboardingDetails.contentApprovalRequired,
          },
        }).catch(err => console.error('Failed to create AccountOnboardingDetails:', err))
      }
    }

    // Notify account manager
    await prisma.notification.create({
      data: {
        userId: data.accountManagerId,
        type: 'CLIENT_ASSIGNED',
        title: 'New Client Assigned',
        message: `You have been assigned as account manager for ${activatedClient.name}. Portal has been ${data.activatePortal ? 'activated' : 'not activated yet'}.`,
        link: `/clients/${activatedClient.id}`,
        priority: 'HIGH',
      },
    })

    // Notify team members
    if (data.teamMembers && data.teamMembers.length > 0) {
      await prisma.notification.createMany({
        data: data.teamMembers.map(member => ({
          userId: member.userId,
          type: 'CLIENT_ASSIGNED',
          title: 'Added to Client Team',
          message: `You have been added to the team for ${activatedClient.name} as ${member.role}.`,
          link: `/clients/${activatedClient.id}`,
          priority: 'MEDIUM',
        })),
      })
    }

    // Send portal credentials to client (via portal notification)
    if (data.activatePortal && activatedClient.id) {
      await prisma.portalNotification.create({
        data: {
          clientId: activatedClient.id,
          title: 'Welcome to Your Client Portal',
          message: `Your portal has been activated. Use your email and provided password to log in.`,
          type: 'INFO',
          category: 'ACCOUNT',
          sourceType: 'SYSTEM',
          sourceId: proposalId,
        },
      })
    }

    // Sync proposal progress to onboarding checklist
    const { syncProposalToChecklist } = await import('@/server/onboarding/syncChecklist')
    await syncProposalToChecklist({
      clientId: activatedClient.id,
      slaAccepted: proposal.slaAccepted,
      paymentConfirmed: proposal.paymentConfirmed,
      accountOnboardingCompleted: proposal.accountOnboardingCompleted,
      portalActivated: data.activatePortal,
      accountManagerId: data.accountManagerId,
      teamAllocated: (data.teamMembers?.length ?? 0) > 0,
      accountOnboardingData: proposal.accountOnboardingData,
    }).catch(err => console.error('Checklist sync failed:', err))

    return NextResponse.json({
      success: true,
      message: 'Client activated successfully',
      client: {
        id: activatedClient.id,
        clientCode,
        name: activatedClient.name,
        email: activatedClient.contactEmail,
        portalActivated: data.activatePortal,
        temporaryPassword: data.activatePortal ? plainPassword : null,
      },
      proposal: {
        id: updated.id,
        status: updated.status,
        currentStep: 6,
      },
    })
  } catch (error) {
    console.error('Error activating client:', error)
    return NextResponse.json(
      { error: 'Failed to activate client' },
      { status: 500 }
    )
  }
})
