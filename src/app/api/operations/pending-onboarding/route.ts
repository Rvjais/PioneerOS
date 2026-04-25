import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { safeJsonParse } from '@/shared/utils/utils'
import { withAuth } from '@/server/auth/withAuth'

// GET - List clients pending onboarding
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get clients who have paid but are in onboarding status
    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { status: 'ONBOARDING' },
          { onboardingStatus: 'IN_PROGRESS' },
        ],
        paymentConfirmedAt: { not: null },
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        selectedServices: true,
        paymentConfirmedAt: true,
        onboardingStatus: true,
        entityType: true,
        tier: true,
        createdAt: true,
      },
      orderBy: { paymentConfirmedAt: 'desc' },
    })

    // Get onboarding checklists for these clients
    const clientIds = clients.map(c => c.id)
    const checklists = await prisma.clientOnboardingChecklist.findMany({
      where: { clientId: { in: clientIds } },
      select: {
        clientId: true,
        completionPercentage: true,
        status: true,
        selectedServices: true,
        scopeItems: true,
        operationsAssignedAt: true,
        kickoffScheduledAt: true,
      },
    })

    const checklistMap = new Map(checklists.map(c => [c.clientId, c]))

    const result = clients.map(client => {
      const checklist = checklistMap.get(client.id)
      return {
        ...client,
        selectedServices: safeJsonParse(client.selectedServices, []),
        checklist: checklist ? {
          ...checklist,
          selectedServices: safeJsonParse(checklist.selectedServices, []),
          scopeItems: safeJsonParse(checklist.scopeItems, []),
        } : null,
      }
    })

    return NextResponse.json({ clients: result })
  } catch (error) {
    console.error('Failed to fetch pending onboarding:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
