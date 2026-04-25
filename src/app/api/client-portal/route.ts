import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withClientAuth } from '@/server/auth/withClientAuth'

// Get client portal data
export const GET = withClientAuth(async (req, { user }) => {
  // Get invoices for this client
  const invoices = await prisma.invoice.findMany({
    where: { clientId: user.clientId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  // Get support tickets
  const supportTickets = await prisma.supportTicket.findMany({
    where: { clientUserId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  // Get full client data
  const clientData = await prisma.client.findUnique({
    where: { id: user.clientId },
  })

  if (!clientData) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Parse services - prefer selectedServices from onboarding form, fall back to services
  let parsedServices: string[] = []
  const selectedServices = clientData.selectedServices
  const services = clientData.services
  if (selectedServices) {
    try {
      parsedServices = JSON.parse(selectedServices)
    } catch {
      parsedServices = selectedServices.split(',').map(s => s.trim())
    }
  } else if (services) {
    try {
      parsedServices = JSON.parse(services)
    } catch {
      parsedServices = services.split(',').map(s => s.trim())
    }
  }

  // Parse business details from onboarding
  let businessDetails: {
    targetAudience?: string
    competitors?: string
    usp?: string
    brandVoice?: string
  } = {}
  if (clientData.targetAudience) {
    try {
      businessDetails = JSON.parse(clientData.targetAudience)
    } catch {
      // Invalid JSON, ignore
    }
  }

  // Build competitors list
  const competitors = [
    clientData.competitor1,
    clientData.competitor2,
    clientData.competitor3,
  ].filter(Boolean)

  // Build social media links
  const socialMedia = {
    facebook: clientData.facebookUrl !== 'pending' ? clientData.facebookUrl : null,
    instagram: clientData.instagramUrl !== 'pending' ? clientData.instagramUrl : null,
    linkedin: clientData.linkedinUrl !== 'pending' ? clientData.linkedinUrl : null,
    twitter: clientData.twitterUrl !== 'pending' ? clientData.twitterUrl : null,
    youtube: clientData.youtubeUrl !== 'pending' ? clientData.youtubeUrl : null,
  }

  // Build client data - strip billing info for non-PRIMARY users
  const isPrimary = user.role === 'PRIMARY'

  return NextResponse.json({
    client: {
      id: clientData.id,
      name: clientData.name,
      brandName: clientData.brandName,
      contactName: clientData.contactName,
      contactEmail: clientData.contactEmail,
      contactPhone: clientData.contactPhone,
      whatsapp: clientData.whatsapp,
      websiteUrl: clientData.websiteUrl,
      services: parsedServices.length > 0 ? JSON.stringify(parsedServices) : clientData.services,
      industry: clientData.industry,
      status: clientData.status,
      tier: clientData.tier,
      // Only expose billing data to PRIMARY users
      ...(isPrimary && {
        monthlyFee: clientData.monthlyFee,
        currentPaymentStatus: clientData.currentPaymentStatus,
        pendingAmount: clientData.pendingAmount,
      }),
      contractStartDate: clientData.startDate?.toISOString() || null,
      contractEndDate: clientData.endDate?.toISOString() || null,
      billingType: clientData.billingType,
      concernedPerson: clientData.concernedPerson,
      concernedPersonPhone: clientData.concernedPersonPhone,
      // Business details from onboarding
      targetAudience: businessDetails.targetAudience || null,
      competitors: competitors.length > 0 ? competitors : null,
      usp: businessDetails.usp || null,
      brandVoice: businessDetails.brandVoice || null,
      socialMedia,
    },
    invoices: invoices.map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      total: inv.total,
      status: inv.status,
      dueDate: inv.dueDate.toISOString(),
      createdAt: inv.createdAt.toISOString(),
    })),
    tickets: supportTickets.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt.toISOString(),
    })),
  })
}, { rateLimit: 'READ' })
