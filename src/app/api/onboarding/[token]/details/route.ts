import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { z } from 'zod'

// Schema for comprehensive client discovery form (15 steps)
// Using passthrough and permissive validation to accept all fields
const clientDiscoverySchema = z.object({
  // Required fields
  clientName: z.string().optional(),
  primaryEmail: z.string().optional(),
  phoneNumber: z.string().optional(),

  // All other fields are optional - stored as JSON
}).passthrough() // Allow all additional fields

// POST: Submit client discovery details (Step 4)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()

    // Minimal validation - just ensure it's an object
    const validation = clientDiscoverySchema.safeParse(body)
    if (!validation.success) {
      console.error('Validation errors:', validation.error.flatten().fieldErrors)
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Find proposal
    const proposal = await prisma.clientProposal.findUnique({
      where: { token },
    })

    if (!proposal) {
      return NextResponse.json(
        { error: 'Onboarding link not found' },
        { status: 404 }
      )
    }

    // Check expiration
    if (new Date() > proposal.expiresAt) {
      return NextResponse.json(
        { error: 'This onboarding link has expired' },
        { status: 410 }
      )
    }

    if (!proposal.paymentConfirmed) {
      return NextResponse.json(
        { error: 'Payment must be confirmed before submitting onboarding details' },
        { status: 400 }
      )
    }

    // Check if already completed
    if (proposal.accountOnboardingCompleted) {
      return NextResponse.json({
        success: true,
        message: 'Account onboarding already completed',
        currentStep: 5,
      })
    }

    const now = new Date()

    // Update proposal with onboarding data
    const updated = await prisma.clientProposal.update({
      where: { id: proposal.id },
      data: {
        accountOnboardingCompleted: true,
        accountOnboardingCompletedAt: now,
        accountOnboardingData: JSON.stringify(data),
        status: 'ONBOARDING_COMPLETED',
        currentStep: 5,
      },
    })

    // Notify all relevant team members: admins, managers, accounts, operations
    const managers = await prisma.user.findMany({
      where: {
        deletedAt: null,
        OR: [
          { role: 'SUPER_ADMIN' },
          { role: 'ADMIN' },
          { role: 'MANAGER' },
          { role: 'ACCOUNTS' },
          { role: 'OPERATIONS_HEAD' },
          { department: 'MANAGEMENT' },
          { department: 'ACCOUNTS' },
          { department: 'OPERATIONS' },
        ],
        status: 'ACTIVE',
      },
      select: { id: true },
    })

    if (managers.length > 0) {
      await prisma.notification.createMany({
        data: managers.map(user => ({
          userId: user.id,
          type: 'ONBOARDING_COMPLETE',
          title: 'Client Onboarding Completed',
          message: `${proposal.clientName || proposal.prospectName} has completed the client discovery form. Ready for team allocation and portal activation.`,
          link: `/accounts/onboarding/${proposal.id}/review`,
          priority: 'HIGH',
        })),
      })
    }

    // Sync to onboarding checklist if client is linked
    if (proposal.clientId) {
      const { syncProposalToChecklist } = await import('@/server/onboarding/syncChecklist')
      await syncProposalToChecklist({
        clientId: proposal.clientId,
        slaAccepted: proposal.slaAccepted,
        paymentConfirmed: proposal.paymentConfirmed,
        accountOnboardingCompleted: true,
        portalActivated: proposal.portalActivated,
        accountManagerId: proposal.accountManagerId,
        teamAllocated: proposal.teamAllocated,
        accountOnboardingData: JSON.stringify(data),
      }).catch(err => console.error('Checklist sync failed:', err))
    }

    return NextResponse.json({
      success: true,
      message: 'Client discovery form completed successfully. Our team will review and activate your portal shortly.',
      currentStep: 5,
      onboarding: {
        completedAt: now,
      },
    })
  } catch (error) {
    console.error('Error submitting onboarding details:', error)
    return NextResponse.json(
      { error: 'Failed to submit onboarding details' },
      { status: 500 }
    )
  }
}

// GET: Get existing onboarding details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const proposal = await prisma.clientProposal.findUnique({
      where: { token },
    })

    if (!proposal) {
      return NextResponse.json(
        { error: 'Onboarding link not found' },
        { status: 404 }
      )
    }

    // Parse existing data if available
    let existingData = null
    if (proposal.accountOnboardingData) {
      try {
        existingData = JSON.parse(proposal.accountOnboardingData)
      } catch {
        existingData = null
      }
    }

    return NextResponse.json({
      completed: proposal.accountOnboardingCompleted,
      completedAt: proposal.accountOnboardingCompletedAt,
      details: existingData,
      prefill: {
        clientName: proposal.clientName || proposal.prospectName,
        primaryEmail: proposal.clientEmail || proposal.prospectEmail,
        phoneNumber: proposal.clientPhone || proposal.prospectPhone,
        company: proposal.clientCompany || proposal.prospectCompany,
      },
    })
  } catch (error) {
    console.error('Error fetching onboarding details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch onboarding details' },
      { status: 500 }
    )
  }
}
