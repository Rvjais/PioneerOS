import prisma from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect, notFound } from 'next/navigation'
import { ContractManager } from './ContractManager'
import { Contract, Invoice, ClientLifecycleEvent } from '@prisma/client'

async function getClient(clientId: string) {
  return prisma.client.findUnique({
    where: { id: clientId },
    include: {
      contracts: {
        orderBy: { createdAt: 'desc' },
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      lifecycleEvents: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })
}

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { clientId } = await params
  const client = await getClient(clientId)

  if (!client) notFound()

  return (
    <ContractManager
      client={{
        id: client.id,
        name: client.name,
        contactName: client.contactName || '',
        contactEmail: client.contactEmail || '',
        contactPhone: client.contactPhone || '',
        tier: client.tier,
        monthlyFee: client.monthlyFee || 0,
        onboardingStatus: client.onboardingStatus,
        slaSigned: client.slaSigned,
        slaSignedAt: client.slaSignedAt?.toISOString() || null,
        slaDocumentUrl: client.slaDocumentUrl || '',
        sowSigned: client.sowSigned,
        sowSignedAt: client.sowSignedAt?.toISOString() || null,
        sowDocumentUrl: client.sowDocumentUrl || '',
        initialPaymentConfirmed: client.initialPaymentConfirmed,
        initialPaymentDate: client.initialPaymentDate?.toISOString() || null,
        lifecycleStage: client.lifecycleStage,
      }}
      contracts={client.contracts.map((c: Contract) => ({
        id: c.id,
        type: c.type,
        title: c.title,
        startDate: c.startDate.toISOString(),
        endDate: c.endDate.toISOString(),
        value: c.value || 0,
        status: c.status,
        documentUrl: c.documentUrl || '',
      }))}
      invoices={client.invoices.map((i: Invoice) => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        total: i.total,
        status: i.status,
        dueDate: i.dueDate.toISOString(),
      }))}
      events={client.lifecycleEvents.map((e: ClientLifecycleEvent) => ({
        id: e.id,
        fromStage: e.fromStage || '',
        toStage: e.toStage,
        notes: e.notes || '',
        createdAt: e.createdAt.toISOString(),
      }))}
    />
  )
}
