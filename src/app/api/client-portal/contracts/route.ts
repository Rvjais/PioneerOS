import { NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'

// Parse services scope if it's JSON
const parseServicesScope = (scope: string | null): string[] => {
  if (!scope) return []
  try {
    return JSON.parse(scope)
  } catch {
    return scope.split(',').map(s => s.trim()).filter(Boolean)
  }
}

// Format contract duration
const formatDuration = (duration: string | null): string => {
  if (!duration) return 'Not specified'
  switch (duration) {
    case '3_MONTHS': return '3 Months'
    case '6_MONTHS': return '6 Months'
    case '12_MONTHS': return '12 Months'
    case '24_MONTHS': return '24 Months'
    default: return duration.replace(/_/g, ' ')
  }
}

// GET /api/client-portal/contracts - Get SLA documents for client
export const GET = withClientAuth(async (_req, { user }) => {
  const clientId = user.clientId

  // Fetch SLA documents for this client
  const slaDocuments = await prisma.sLADocument.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      entityType: true,
      entityName: true,
      entityAddress: true,
      clientName: true,
      clientAddress: true,
      clientGstNumber: true,
      servicesScope: true,
      customScope: true,
      monthlyRetainer: true,
      advanceAmount: true,
      contractDuration: true,
      commencementDate: true,
      endDate: true,
      poNumber: true,
      paymentTerms: true,
      slaMetrics: true,
      escalationContacts: true,
      clientSignerName: true,
      clientSignedAt: true,
      agencySignerName: true,
      agencySignedAt: true,
      status: true,
      documentUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  // Get active contract (most recent signed one, or most recent draft)
  const activeContract = slaDocuments.find(
    doc => doc.clientSignedAt && doc.agencySignedAt
  ) || slaDocuments[0]

  return NextResponse.json({
    contracts: slaDocuments.map(doc => ({
      id: doc.id,
      entityType: doc.entityType,
      entityName: doc.entityName,
      entityAddress: doc.entityAddress,
      clientName: doc.clientName,
      clientAddress: doc.clientAddress,
      clientGstNumber: doc.clientGstNumber,
      servicesScope: parseServicesScope(doc.servicesScope),
      customScope: doc.customScope,
      monthlyRetainer: doc.monthlyRetainer,
      advanceAmount: doc.advanceAmount,
      contractDuration: doc.contractDuration,
      contractDurationFormatted: formatDuration(doc.contractDuration),
      commencementDate: doc.commencementDate?.toISOString() || null,
      endDate: doc.endDate?.toISOString() || null,
      poNumber: doc.poNumber,
      paymentTerms: doc.paymentTerms,
      slaMetrics: doc.slaMetrics,
      escalationContacts: doc.escalationContacts,
      signatures: {
        client: {
          name: doc.clientSignerName,
          signedAt: doc.clientSignedAt?.toISOString() || null,
          isSigned: !!doc.clientSignedAt,
        },
        agency: {
          name: doc.agencySignerName,
          signedAt: doc.agencySignedAt?.toISOString() || null,
          isSigned: !!doc.agencySignedAt,
        },
      },
      status: doc.status,
      isFullySigned: !!doc.clientSignedAt && !!doc.agencySignedAt,
      documentUrl: doc.documentUrl,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    })),
    activeContract: activeContract ? {
      id: activeContract.id,
      entityName: activeContract.entityName,
      servicesScope: parseServicesScope(activeContract.servicesScope),
      customScope: activeContract.customScope,
      monthlyRetainer: activeContract.monthlyRetainer,
      contractDuration: activeContract.contractDuration,
      contractDurationFormatted: formatDuration(activeContract.contractDuration),
      commencementDate: activeContract.commencementDate?.toISOString() || null,
      endDate: activeContract.endDate?.toISOString() || null,
      isFullySigned: !!activeContract.clientSignedAt && !!activeContract.agencySignedAt,
      documentUrl: activeContract.documentUrl,
      status: activeContract.status,
    } : null,
    summary: {
      total: slaDocuments.length,
      signed: slaDocuments.filter(doc => doc.clientSignedAt && doc.agencySignedAt).length,
      pending: slaDocuments.filter(doc => !doc.clientSignedAt || !doc.agencySignedAt).length,
    },
  })
}, { rateLimit: 'READ' })
