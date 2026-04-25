import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const uploadSlaSchema = z.object({
  slaDocumentUrl: z.string().min(1),
})

const updateSlaSchema = z.object({
  signed: z.boolean().optional(),
})

export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { clientId } = await routeParams!
    const raw = await req.json()
    const parsed = uploadSlaSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    await prisma.client.update({
      where: { id: clientId },
      data: {
        slaDocumentUrl: parsed.data.slaDocumentUrl,
        onboardingStatus: 'AWAITING_SLA',
      },
    })

    await prisma.clientLifecycleEvent.create({
      data: {
        clientId,
        fromStage: 'WON',
        toStage: 'AWAITING_SLA',
        triggeredBy: user.id,
        notes: 'SLA document uploaded',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to upload SLA:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { clientId } = await routeParams!
    const rawPatch = await req.json()
    const parsedPatch = updateSlaSchema.safeParse(rawPatch)
    if (!parsedPatch.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsedPatch.error.flatten() }, { status: 400 })
    }
    const body = parsedPatch.data

    if (body.signed) {
      await prisma.client.update({
        where: { id: clientId },
        data: {
          slaSigned: true,
          slaSignedAt: new Date(),
          onboardingStatus: 'AWAITING_PAYMENT',
        },
      })

      await prisma.clientLifecycleEvent.create({
        data: {
          clientId,
          fromStage: 'AWAITING_SLA',
          toStage: 'AWAITING_PAYMENT',
          triggeredBy: user.id,
          notes: 'SLA signed by client',
        },
      })

      // Create notification for accounts team
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

      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { name: true },
      })

      await prisma.notification.createMany({
        data: accountsUsers.map((user) => ({
          userId: user.id,
          type: 'PAYMENT',
          title: 'SLA Signed - Awaiting Payment',
          message: `${client?.name} has signed the SLA. Please follow up on payment.`,
          link: `/accounts/contracts/${clientId}`,
          priority: 'HIGH',
        })),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update SLA:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
