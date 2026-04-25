import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { LIFECYCLE_STAGES, getLifecycleUpdateData, type LifecycleStage } from '@/server/services/clientStatus'
import { handleClientChurn, handleClientReactivation } from '@/server/services/clientLifecycle'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const lifecycleUpdateSchema = z.object({
  stage: z.enum(['LEAD', 'WON', 'ONBOARDING', 'ACTIVE', 'AT_RISK', 'CHURNED'], {
    message: 'Invalid lifecycle stage. Must be one of: LEAD, WON, ONBOARDING, ACTIVE, AT_RISK, CHURNED',
  }),
  reason: z.string().max(500, 'Reason must be 500 characters or less').optional(),
  notes: z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
})

type RouteParams = {
  params: Promise<{ clientId: string }>
}

// GET - Get lifecycle events for a client
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { clientId } = await routeParams!

    const events = await prisma.clientLifecycleEvent.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    })

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        lifecycleStage: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ client, events })
  } catch (error) {
    console.error('Error fetching lifecycle events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST - Update lifecycle stage
export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { clientId } = await routeParams!
    const body = await req.json()

    const validation = lifecycleUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      }, { status: 400 })
    }
    const { stage, reason, notes } = validation.data

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, lifecycleStage: true },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    if (client.lifecycleStage === stage) {
      return NextResponse.json({ error: 'Client is already in this stage' }, { status: 400 })
    }

    // Handle churn cascade if transitioning to CHURNED
    if (stage === 'CHURNED') {
      await handleClientChurn({
        clientId,
        reason,
        notes,
        triggeredBy: user.id,
      })

      // Update client stage after cascade operations
      const updatedClient = await prisma.client.update({
        where: { id: clientId },
        data: getLifecycleUpdateData(stage as LifecycleStage),
      })

      return NextResponse.json({ client: updatedClient })
    }

    // Handle reactivation from churned state
    if (client.lifecycleStage === 'CHURNED') {
      await handleClientReactivation(clientId, stage as LifecycleStage, user.id)

      const updatedClient = await prisma.client.update({
        where: { id: clientId },
        data: getLifecycleUpdateData(stage as LifecycleStage),
      })

      return NextResponse.json({ client: updatedClient })
    }

    // Normal stage transition
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: getLifecycleUpdateData(stage as LifecycleStage),
    })

    // Create lifecycle event
    await prisma.clientLifecycleEvent.create({
      data: {
        clientId,
        fromStage: client.lifecycleStage,
        toStage: stage,
        reason,
        notes,
        triggeredBy: user.id,
      },
    })

    return NextResponse.json({ client: updatedClient })
  } catch (error) {
    console.error('Error updating lifecycle stage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
