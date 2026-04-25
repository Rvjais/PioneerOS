import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

/**
 * GET /api/web-clients/[id]/phases
 * Get all phases for a web client
 */
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id: clientId } = await routeParams!

    // Check if client exists and is a web client
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, isWebTeamClient: true },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    if (!client.isWebTeamClient) {
      return NextResponse.json(
        { error: 'This client is not a web team client' },
        { status: 400 }
      )
    }

    const phases = await prisma.webProjectPhase.findMany({
      where: { clientId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ client, phases })
  } catch (error) {
    console.error('Error fetching web client phases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch phases' },
      { status: 500 }
    )
  }
})

/**
 * PATCH /api/web-clients/[id]/phases
 * Update a phase status
 */
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id: clientId } = await routeParams!
    const body = await req.json()
    const patchSchema = z.object({
      phase: z.string().min(1).max(100),
      status: z.string().max(50).optional(),
      notes: z.string().max(2000).optional(),
      proofUrl: z.string().max(1000).optional(),
      assignedTo: z.string().optional(),
    })
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { phase, status, notes, proofUrl, assignedTo } = parsed.data

    // Check if client exists and is a web client
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, isWebTeamClient: true },
    })

    if (!client || !client.isWebTeamClient) {
      return NextResponse.json(
        { error: 'Web client not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this client
    const userRole = user.role as string
    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(userRole)

    if (!isAdmin) {
      const teamMember = await prisma.clientTeamMember.findFirst({
        where: {
          clientId,
          userId: user.id,
        },
      })

      if (!teamMember) {
        return NextResponse.json(
          { error: 'You do not have access to this client' },
          { status: 403 }
        )
      }
    }

    // Find and update the phase
    const existingPhase = await prisma.webProjectPhase.findFirst({
      where: { clientId, phase },
    })

    if (!existingPhase) {
      return NextResponse.json(
        { error: 'Phase not found' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (status) {
      updateData.status = status
      if (status === 'IN_PROGRESS' && !existingPhase.startedAt) {
        updateData.startedAt = new Date()
      }
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date()
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    if (proofUrl !== undefined) {
      updateData.proofUrl = proofUrl
    }

    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo || null
    }

    const updatedPhase = await prisma.webProjectPhase.update({
      where: { id: existingPhase.id },
      data: updateData,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      phase: updatedPhase,
    })
  } catch (error) {
    console.error('Error updating phase:', error)
    return NextResponse.json(
      { error: 'Failed to update phase' },
      { status: 500 }
    )
  }
})
