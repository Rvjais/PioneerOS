import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import prisma from '@/server/db/prisma'
import ManagerReviewClient from './ManagerReviewClient'
import { SERVICES, ENTITY_TYPES } from '@/server/onboarding/constants'

export const metadata: Metadata = {
  title: 'Manager Review | Accounts',
  description: 'Review and activate client portal',
}

interface PageProps {
  params: Promise<{ proposalId: string }>
}

export default async function ManagerReviewPage({ params }: PageProps) {
  const { proposalId } = await params

  const proposal = await prisma.clientProposal.findUnique({
    where: { id: proposalId },
    include: {
      onboardingDetails: true,
    },
  })

  if (!proposal) {
    notFound()
  }

  // Must have completed onboarding
  if (!proposal.accountOnboardingCompleted) {
    redirect(`/accounts/onboarding/${proposalId}`)
  }

  // Already activated
  if (proposal.portalActivated) {
    redirect(`/accounts/onboarding/${proposalId}`)
  }

  // Fetch available account managers
  const accountManagersRaw = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'ADMIN' },
        { role: 'SUPER_ADMIN' },
        { department: 'MANAGEMENT' },
        { department: 'ACCOUNTS' },
      ],
      status: 'ACTIVE',
    },
    select: { id: true, firstName: true, lastName: true, email: true, role: true, department: true },
    orderBy: { firstName: 'asc' },
  })
  const accountManagers = accountManagersRaw.map(u => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName || ''}`.trim(),
    email: u.email,
    role: u.role,
    department: u.department,
  }))

  // Fetch team members by department
  const teamMembersRaw = await prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      department: { in: ['SEO', 'SOCIAL', 'WEB', 'PPC', 'CONTENT'] },
    },
    select: { id: true, firstName: true, lastName: true, email: true, department: true },
    orderBy: [{ department: 'asc' }, { firstName: 'asc' }],
  })
  const teamMembers = teamMembersRaw.map(u => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName || ''}`.trim(),
    email: u.email,
    department: u.department,
  }))

  // Parse services
  let services: Array<{ serviceId: string }> = []
  try {
    services = JSON.parse(proposal.services || '[]')
  } catch {
    services = []
  }

  // Parse onboarding details
  let onboardingDetails: Record<string, unknown> | null = null
  if (proposal.onboardingDetails) {
    const details = proposal.onboardingDetails
    onboardingDetails = {
      ...details,
      seoDetails: details.seoDetails ? JSON.parse(details.seoDetails) : null,
      socialDetails: details.socialDetails ? JSON.parse(details.socialDetails) : null,
      adsDetails: details.adsDetails ? JSON.parse(details.adsDetails) : null,
      webDetails: details.webDetails ? JSON.parse(details.webDetails) : null,
      gbpDetails: details.gbpDetails ? JSON.parse(details.gbpDetails) : null,
    }
  }

  const entity = ENTITY_TYPES.find(e => e.id === proposal.entityType) || ENTITY_TYPES[0]

  return (
    <ManagerReviewClient
      proposal={{
        id: proposal.id,
        prospectName: proposal.prospectName,
        clientName: proposal.clientName || proposal.prospectName,
        clientEmail: proposal.clientEmail || proposal.prospectEmail,
        clientPhone: proposal.clientPhone || proposal.prospectPhone,
        services: services.map(s => ({
          serviceId: s.serviceId,
          name: SERVICES.find(svc => svc.id === s.serviceId)?.name || s.serviceId,
        })),
        entity: entity.name,
        totalPrice: proposal.totalPrice,
        onboardingDetails,
      }}
      accountManagers={accountManagers}
      teamMembers={teamMembers}
    />
  )
}
