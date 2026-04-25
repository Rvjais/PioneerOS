import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

/**
 * POST /api/web-clients/[id]/convert-recurring
 * Convert a one-time web client to recurring
 */
export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const userRole = user.role as string
    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(userRole)

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can convert client type' },
        { status: 403 }
      )
    }

    const { id: clientId } = await routeParams!
    const body = await req.json()
    const schema = z.object({
      serviceSegment: z.string().max(100).optional(),
      billingType: z.string().max(50).optional(),
      monthlyFee: z.number().optional(),
      force: z.boolean().optional(),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { serviceSegment, billingType, monthlyFee } = result.data

    // Get client
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        webProjectPhases: true,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    if (client.clientType === 'RECURRING') {
      return NextResponse.json(
        { error: 'Client is already recurring' },
        { status: 400 }
      )
    }

    // Check if all phases are completed (optional validation)
    const allPhasesComplete = client.webProjectPhases.every(
      (p) => p.status === 'COMPLETED' || p.status === 'SKIPPED'
    )

    if (!allPhasesComplete && !body.force) {
      return NextResponse.json(
        {
          error: 'Not all project phases are complete',
          incomplete: client.webProjectPhases
            .filter((p) => p.status !== 'COMPLETED' && p.status !== 'SKIPPED')
            .map((p) => p.phase),
          message: 'Set force=true to convert anyway',
        },
        { status: 400 }
      )
    }

    // Update client to recurring
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        clientType: 'RECURRING',
        serviceSegment: serviceSegment || 'MARKETING',
        billingType: billingType || 'MONTHLY',
        monthlyFee: monthlyFee || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Client converted to recurring',
      client: updatedClient,
    })
  } catch (error) {
    console.error('Error converting client:', error)
    return NextResponse.json(
      { error: 'Failed to convert client' },
      { status: 500 }
    )
  }
})
