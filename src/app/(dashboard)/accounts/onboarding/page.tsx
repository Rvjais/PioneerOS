import { Metadata } from 'next'
import prisma from '@/server/db/prisma'
import OnboardingListClient from './OnboardingListClient'

export const metadata: Metadata = {
  title: 'Client Onboarding | Accounts',
  description: 'Manage client onboarding proposals',
}

export default async function AccountsOnboardingPage() {
  // Fetch recent proposals
  const proposalsRaw = await prisma.clientProposal.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      token: true,
      status: true,
      currentStep: true,
      prospectName: true,
      prospectEmail: true,
      prospectCompany: true,
      entityType: true,
      totalPrice: true,
      advanceAmount: true,
      slaAccepted: true,
      paymentConfirmed: true,
      accountOnboardingCompleted: true,
      managerReviewed: true,
      portalActivated: true,
      createdAt: true,
      expiresAt: true,
      viewedAt: true,
      createdById: true,
    },
  })

  // Fetch creator names
  const creatorIds = proposalsRaw.map(p => p.createdById).filter(Boolean)
  const creators = await prisma.user.findMany({
    where: { id: { in: creatorIds } },
    select: { id: true, firstName: true, lastName: true },
  })
  const creatorMap = new Map(creators.map(c => [c.id, `${c.firstName} ${c.lastName || ''}`.trim()]))

  const proposals = proposalsRaw.map(p => ({
    ...p,
    createdByName: creatorMap.get(p.createdById) || null,
  }))

  // Calculate stats
  const stats = {
    total: proposals.length,
    pendingPayment: proposals.filter(p => p.slaAccepted && !p.paymentConfirmed).length,
    pendingOnboarding: proposals.filter(p => p.paymentConfirmed && !p.accountOnboardingCompleted).length,
    pendingReview: proposals.filter(p => p.accountOnboardingCompleted && !p.managerReviewed).length,
    activated: proposals.filter(p => p.portalActivated).length,
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <OnboardingListClient
      initialProposals={proposals.map(p => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        expiresAt: p.expiresAt.toISOString(),
        viewedAt: p.viewedAt?.toISOString() || null,
        url: `${baseUrl}/onboarding/${p.token}`,
      }))}
      stats={stats}
    />
  )
}
