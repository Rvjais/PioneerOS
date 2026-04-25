import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import prisma from '@/server/db/prisma'
import OnboardingWizard from './OnboardingWizard'
import { SERVICES, ENTITY_TYPES, ONBOARDING_STEPS } from '@/server/onboarding/constants'

export const metadata: Metadata = {
  title: 'Client Onboarding',
  description: 'Complete your onboarding process',
}

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function OnboardingPage({ params }: PageProps) {
  const { token } = await params

  // Fetch proposal
  const proposal = await prisma.clientProposal.findUnique({
    where: { token },
    include: {
      onboardingDetails: true,
    },
  })

  if (!proposal) {
    notFound()
  }

  // Check expiration
  const isExpired = new Date() > proposal.expiresAt

  // Mark as viewed if first time
  if (proposal.status === 'SENT' && !proposal.viewedAt) {
    await prisma.clientProposal.update({
      where: { id: proposal.id },
      data: {
        status: 'VIEWED',
        viewedAt: new Date(),
      },
    })
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

  // Determine current step
  let currentStep = proposal.currentStep || 1
  if (proposal.status === 'ACTIVATED') currentStep = 6
  else if (proposal.accountOnboardingCompleted) currentStep = 5
  else if (proposal.paymentConfirmed) currentStep = 4
  else if (proposal.slaAccepted) currentStep = 3
  else if (proposal.status === 'DETAILS_CONFIRMED') currentStep = 2

  // Build initial data
  const initialData = {
    id: proposal.id,
    token: proposal.token,
    status: proposal.status,
    currentStep,
    isExpired,
    steps: ONBOARDING_STEPS.map(s => ({ id: s.step, title: s.label, description: s.description })),

    // Pre-filled details
    prospect: {
      name: proposal.prospectName,
      email: proposal.prospectEmail,
      phone: proposal.prospectPhone || '',
      company: proposal.prospectCompany || '',
    },

    // Client details (editable in step 1)
    client: {
      name: proposal.clientName || proposal.prospectName,
      email: proposal.clientEmail || proposal.prospectEmail,
      phone: proposal.clientPhone || proposal.prospectPhone || '',
      company: proposal.clientCompany || proposal.prospectCompany || '',
      gst: proposal.clientGst || '',
      address: proposal.clientAddress || '',
      city: proposal.clientCity || '',
      state: proposal.clientState || '',
      pincode: proposal.clientPincode || '',
    },

    // Services & Pricing
    services: services.map(s => ({
      ...s,
      name: SERVICES.find(svc => svc.id === s.serviceId)?.name || s.serviceId,
    })),
    basePrice: proposal.basePrice,
    gstPercentage: proposal.gstPercentage,
    gstAmount: proposal.basePrice * (proposal.gstPercentage / 100),
    totalPrice: proposal.totalPrice,
    advanceAmount: proposal.advanceAmount || proposal.totalPrice,
    advancePercentage: proposal.advancePercentage || 100,
    allowServiceModification: proposal.allowServiceModification,

    // Contract details
    contractDuration: proposal.contractDuration,
    paymentTerms: proposal.paymentTerms,

    // Entity details
    entity: {
      id: entity.id,
      name: entity.name,
      legalName: entity.legalName,
      address: entity.address,
      gstin: entity.gstin,
      bank: {
        name: entity.bank.name,
        account: entity.bank.accountNumber,
        ifsc: entity.bank.ifsc,
        branch: entity.bank.branch,
        upi: entity.bank.upi,
      },
    },

    // SLA status
    sla: {
      accepted: proposal.slaAccepted,
      acceptedAt: proposal.slaAcceptedAt?.toISOString() || null,
      signerName: proposal.slaSignerName,
    },

    // Invoice status
    invoice: {
      generated: proposal.invoiceGenerated,
      generatedAt: proposal.invoiceGeneratedAt?.toISOString() || null,
      number: proposal.invoiceNumber,
    },

    // Payment status
    payment: {
      confirmed: proposal.paymentConfirmed,
      confirmedAt: proposal.paymentConfirmedAt?.toISOString() || null,
      method: proposal.paymentMethod,
      reference: proposal.paymentReference,
    },

    // Account onboarding status
    accountOnboarding: {
      completed: proposal.accountOnboardingCompleted,
      completedAt: proposal.accountOnboardingCompletedAt?.toISOString() || null,
    },

    // Timestamps
    createdAt: proposal.createdAt.toISOString(),
    expiresAt: proposal.expiresAt.toISOString(),
  }

  return <OnboardingWizard initialData={initialData} />
}
