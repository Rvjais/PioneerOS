import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const upsellUpdateSchema = z.object({
  status: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  estimatedValue: z.number().optional(),
  probability: z.number().optional(),
  followUpDate: z.string().optional().nullable(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
})

const WEB_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SALES', 'OPERATIONS_HEAD', 'WEB_MANAGER']

/**
 * GET /api/web/upsells/[id]
 * Get a specific upsell opportunity
 */
export const GET = withAuth(async (req, { params }) => {
  try {
    const id = params?.id
    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
    }

    const opportunity = await prisma.upsellOpportunity.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    return NextResponse.json(opportunity)
  } catch (error) {
    console.error('Error fetching upsell opportunity:', error)
    return NextResponse.json({ error: 'Failed to fetch opportunity' }, { status: 500 })
  }
}, { roles: WEB_ROLES })

/**
 * PATCH /api/web/upsells/[id]
 * Update an upsell opportunity
 */
export const PATCH = withAuth(async (req, { user, params }) => {
  try {
    const id = params?.id
    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
    }

    const body = await req.json()
    const result = upsellUpdateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message },
        { status: 400 }
      )
    }
    const validatedData = result.data

    // Verify opportunity exists
    const existing = await prisma.upsellOpportunity.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    // Handle status change
    if (validatedData.status) {
      updateData.status = validatedData.status

      if (validatedData.status === 'PITCHED' && !existing.pitchedDate) {
        updateData.pitchedDate = new Date()
      }
    }

    // Handle other fields
    if (validatedData.title) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.estimatedValue !== undefined) updateData.estimatedValue = validatedData.estimatedValue
    if (validatedData.probability !== undefined) updateData.probability = validatedData.probability
    if (validatedData.followUpDate !== undefined) {
      updateData.followUpDate = validatedData.followUpDate ? new Date(validatedData.followUpDate) : null
    }
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes
    if (validatedData.assignedTo !== undefined) updateData.assignedTo = validatedData.assignedTo

    const opportunity = await prisma.upsellOpportunity.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(opportunity)
  } catch (error) {
    console.error('Error updating upsell opportunity:', error)
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 })
  }
}, { roles: WEB_ROLES })

/**
 * DELETE /api/web/upsells/[id]
 * Delete an upsell opportunity
 */
export const DELETE = withAuth(async (req, { user, params }) => {
  try {
    const id = params?.id
    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
    }

    await prisma.upsellOpportunity.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting upsell opportunity:', error)
    return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER'] })
