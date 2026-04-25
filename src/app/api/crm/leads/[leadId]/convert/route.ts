import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { randomBytes } from 'crypto'
import { notifyClientOnboarding, notifyClientWelcome } from '@/server/notifications'
import { TIER_CONFIG } from '@/shared/constants/config/accounts'
import { withAuth } from '@/server/auth/withAuth'

export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // SECURITY FIX: Only sales team, accounts, and managers can convert leads
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES', 'ACCOUNTS']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Lead conversion requires sales access' }, { status: 403 })
    }

    const { leadId } = await routeParams!

    // Generate onboarding token
    const onboardingToken = randomBytes(32).toString('hex')

    // SECURITY FIX: Use transaction to ensure all operations succeed or fail together
    // Race condition fix: move lead lookup and guard inside the transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get the lead inside the transaction to prevent race conditions
      const lead = await tx.lead.findUnique({
        where: { id: leadId },
      })

      if (!lead) {
        return { notFound: true as const }
      }

      if (lead.clientId) {
        return { alreadyConverted: true as const }
      }

      // Determine tier based on value
      let tier = 'STANDARD'
      if (lead.value && lead.value >= TIER_CONFIG.ENTERPRISE_MIN_VALUE) tier = 'ENTERPRISE'
      else if (lead.value && lead.value >= TIER_CONFIG.PREMIUM_MIN_VALUE) tier = 'PREMIUM'

      // Create the client - User who converts the lead becomes the account manager
      const client = await tx.client.create({
        data: {
          name: lead.companyName,
          contactName: lead.contactName,
          contactEmail: lead.contactEmail,
          contactPhone: lead.contactPhone,
          tier,
          status: 'ONBOARDING',
          onboardingToken,
          onboardingStatus: 'PENDING',
          lifecycleStage: 'WON',
          leadId: lead.id,
          monthlyFee: lead.value,
          referralSource: lead.source,
          notes: lead.notes,
          // Track who shared the onboarding link
          accountManagerId: user.id,
          onboardingSharedBy: user.id,
          onboardingSharedAt: new Date(),
        },
      })

      // Assign the user as the primary account manager
      await tx.clientTeamMember.create({
        data: {
          clientId: client.id,
          userId: user.id,
          role: 'ACCOUNT_MANAGER',
          isPrimary: true,
        },
      })

      // Update the lead
      await tx.lead.update({
        where: { id: leadId },
        data: {
          stage: 'WON',
          wonAt: new Date(),
          clientId: client.id,
        },
      })

      // Log the conversion activity
      await tx.leadActivity.create({
        data: {
          leadId,
          userId: user.id,
          type: 'STATUS_CHANGE',
          title: 'Lead converted to client',
          description: `Created client: ${client.name} (${client.id})`,
          outcome: 'POSITIVE',
        },
      })

      // Create lifecycle event
      await tx.clientLifecycleEvent.create({
        data: {
          clientId: client.id,
          fromStage: 'LEAD',
          toStage: 'WON',
          triggeredBy: user.id,
          notes: 'Lead converted to client',
        },
      })

      return { client }
    })

    if ('notFound' in result) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if ('alreadyConverted' in result) {
      return NextResponse.json({ error: 'Lead already converted' }, { status: 400 })
    }

    const client = result.client

    // Auto-create standard onboarding tasks for the new client
    const onboardingTasks = [
      'Set up client communication channels',
      'Configure analytics and reporting',
      'Create social media accounts',
      'Design initial brand assets',
      'Schedule kickoff meeting',
    ]
    for (const title of onboardingTasks) {
      await prisma.task.create({
        data: {
          title,
          clientId: client.id,
          status: 'TODO',
          priority: 'HIGH',
          department: 'OPERATIONS',
          creatorId: user.id,
        }
      }).catch(() => {}) // Skip if any fail
    }

    // Create notification for accounts team (users with ACCOUNTS role/department)
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
        title: 'New Client Onboarding',
        message: `${client.name} has been converted from lead. Please initiate SLA process.`,
        link: `/accounts/onboardings`,
        priority: 'HIGH',
      })),
    })

    // Send WhatsApp notifications to client
    if (client.contactPhone) {
      // Send welcome message
      await notifyClientWelcome(client.id)

      // Send onboarding link
      await notifyClientOnboarding(client.id)
    }

    return NextResponse.json({
      success: true,
      clientId: client.id,
      onboardingLink: `/onboard/${onboardingToken}`,
    })
  } catch (error) {
    console.error('Failed to convert lead:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
