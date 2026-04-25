import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import prisma from '@/server/db/prisma'
import ProposalDetailsClient from './ProposalDetailsClient'
import { SERVICES, ENTITY_TYPES } from '@/server/onboarding/constants'

export const metadata: Metadata = {
  title: 'Proposal Details | Accounts',
  description: 'View and manage client proposal',
}

interface PageProps {
  params: Promise<{ proposalId: string }>
}

export default async function ProposalDetailsPage({ params }: PageProps) {
  const { proposalId } = await params

  const proposal = await prisma.clientProposal.findUnique({
    where: { id: proposalId },
    include: {
      onboardingDetails: true,
    },
  })

  // Fetch related data separately
  let createdBy: { id: string; name: string; email: string | null } | null = null
  let paymentConfirmedByUser: { id: string; name: string } | null = null
  let client: { id: string; name: string } | null = null

  if (proposal) {
    if (proposal.createdById) {
      const user = await prisma.user.findUnique({
        where: { id: proposal.createdById },
        select: { id: true, firstName: true, lastName: true, email: true },
      })
      if (user) {
        createdBy = { id: user.id, name: `${user.firstName} ${user.lastName || ''}`.trim(), email: user.email }
      }
    }

    if (proposal.paymentConfirmedBy) {
      const user = await prisma.user.findUnique({
        where: { id: proposal.paymentConfirmedBy },
        select: { id: true, firstName: true, lastName: true },
      })
      if (user) {
        paymentConfirmedByUser = { id: user.id, name: `${user.firstName} ${user.lastName || ''}`.trim() }
      }
    }

    if (proposal.clientId) {
      client = await prisma.client.findUnique({
        where: { id: proposal.clientId },
        select: { id: true, name: true },
      })
    }
  }

  if (!proposal) {
    notFound()
  }

  // Get entity details
  const entity = ENTITY_TYPES.find(e => e.id === proposal.entityType) || ENTITY_TYPES[0]

  // Parse services
  let services: Array<{ serviceId: string; name?: string; price?: number }> = []
  try {
    services = JSON.parse(proposal.services || '[]')
  } catch {
    services = []
  }

  // Generate URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const onboardingUrl = `${baseUrl}/onboarding/${proposal.token}`

  const data = {
    ...proposal,
    services: services.map(s => ({
      ...s,
      name: SERVICES.find(svc => svc.id === s.serviceId)?.name || s.serviceId,
    })),
    entity,
    url: onboardingUrl,
    createdAt: proposal.createdAt.toISOString(),
    expiresAt: proposal.expiresAt.toISOString(),
    viewedAt: proposal.viewedAt?.toISOString() || null,
    slaAcceptedAt: proposal.slaAcceptedAt?.toISOString() || null,
    paymentConfirmedAt: proposal.paymentConfirmedAt?.toISOString() || null,
    accountOnboardingCompletedAt: proposal.accountOnboardingCompletedAt?.toISOString() || null,
    portalActivatedAt: proposal.portalActivatedAt?.toISOString() || null,
    createdBy,
    paymentConfirmedByUser,
    client,
  }

  return <ProposalDetailsClient proposal={data} />
}
