import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { safeJsonParse } from '@/shared/utils/utils'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const updateProposalSchema = z.object({
  prospectName: z.string().optional(),
  prospectEmail: z.string().email().optional(),
  prospectPhone: z.string().optional(),
  prospectCompany: z.string().optional(),
  basePrice: z.number().optional(),
  gstPercentage: z.number().optional(),
  allowServiceModification: z.boolean().optional(),
  allowScopeModification: z.boolean().optional(),
  entityType: z.string().optional(),
  status: z.string().optional(),
  services: z.array(z.unknown()).optional(),
  scopeItems: z.array(z.unknown()).optional(),
  extendDays: z.number().optional(),
})

type RouteParams = {
  params: Promise<{ id: string }>
}

const PROPOSAL_ROLES = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'SALES', 'OPERATIONS_HEAD']

// GET - Get a single proposal
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  if (!PROPOSAL_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {

    const { id } = await routeParams!

    const proposal = await prisma.clientProposal.findUnique({
      where: { id },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    return NextResponse.json({
      proposal: {
        ...proposal,
        services: safeJsonParse(proposal.services, []),
        scopeItems: safeJsonParse(proposal.scopeItems, []),
        selectedServices: safeJsonParse(proposal.selectedServices, null),
        selectedScope: safeJsonParse(proposal.selectedScope, null),
      },
    })
  } catch (error) {
    console.error('Failed to fetch proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PATCH - Update a proposal
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  if (!PROPOSAL_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }
  try {

    const { id } = await routeParams!
    const raw = await req.json()
    const parsed = updateProposalSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const body = parsed.data

    const existingProposal = await prisma.clientProposal.findUnique({
      where: { id },
    })

    if (!existingProposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Don't allow editing proposals that have been accepted or converted
    if (['ACCEPTED', 'CONVERTED'].includes(existingProposal.status)) {
      return NextResponse.json(
        { error: 'Cannot edit a proposal that has been accepted or converted' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}

    // Handle basic fields
    const allowedFields = [
      'prospectName',
      'prospectEmail',
      'prospectPhone',
      'prospectCompany',
      'basePrice',
      'gstPercentage',
      'allowServiceModification',
      'allowScopeModification',
      'entityType',
      'status',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Handle JSON fields
    if (body.services) {
      updateData.services = JSON.stringify(body.services)
    }
    if (body.scopeItems) {
      updateData.scopeItems = JSON.stringify(body.scopeItems)
    }

    // Recalculate total if base price or GST changes
    if (body.basePrice !== undefined || body.gstPercentage !== undefined) {
      const basePrice = body.basePrice ?? existingProposal.basePrice
      const gstPercentage = body.gstPercentage ?? existingProposal.gstPercentage
      const gstAmount = (basePrice * gstPercentage) / 100
      updateData.totalPrice = basePrice + gstAmount
    }

    // Handle expiry extension
    if (body.extendDays) {
      const newExpiry = new Date(existingProposal.expiresAt)
      newExpiry.setDate(newExpiry.getDate() + body.extendDays)
      updateData.expiresAt = newExpiry
    }

    const proposal = await prisma.clientProposal.update({
      where: { id },
      data: updateData,
    })

    // Sync status changes to client record
    if (body.status === 'ACCEPTED' && proposal.clientId) {
      await prisma.client.update({
        where: { id: proposal.clientId },
        data: {
          lifecycleStage: 'ACTIVE',
        },
      }).catch(() => { /* client may not exist */ })

      // Create lifecycle event
      await prisma.clientLifecycleEvent.create({
        data: {
          clientId: proposal.clientId,
          fromStage: 'PROSPECT',
          toStage: 'ACTIVE',
          reason: 'Proposal accepted',
          triggeredBy: user.id,
        },
      }).catch(() => { /* event may fail */ })
    }

    return NextResponse.json({
      success: true,
      proposal: {
        ...proposal,
        services: safeJsonParse(proposal.services, []),
        scopeItems: safeJsonParse(proposal.scopeItems, []),
      },
    })
  } catch (error) {
    console.error('Failed to update proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// DELETE - Delete a proposal
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!

    const proposal = await prisma.clientProposal.findUnique({
      where: { id },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Don't allow deleting proposals that have been converted
    if (proposal.status === 'CONVERTED') {
      return NextResponse.json(
        { error: 'Cannot delete a converted proposal' },
        { status: 400 }
      )
    }

    await prisma.clientProposal.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
