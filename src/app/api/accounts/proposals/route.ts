import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { safeJsonParse } from '@/shared/utils/utils'
import { TAX_CONFIG } from '@/shared/constants/config/accounts'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createProposalSchema = z.object({
  prospectName: z.string().min(1),
  prospectEmail: z.string().email(),
  prospectPhone: z.string().optional(),
  prospectCompany: z.string().optional(),
  services: z.array(z.unknown()).min(1),
  scopeItems: z.array(z.unknown()).optional(),
  basePrice: z.number().min(0),
  gstPercentage: z.number().optional(),
  allowServiceModification: z.boolean().optional(),
  allowScopeModification: z.boolean().optional(),
  entityType: z.string().optional(),
  validityDays: z.number().optional(),
})

// GET - List all proposals
export const GET = withAuth(async (req, { user, params }) => {
  try {
// SECURITY FIX: Only accounts/sales team and managers can view client proposals
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES', 'ACCOUNTS']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Proposal access requires accounts/sales access' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { prospectName: { contains: search } },
        { prospectEmail: { contains: search } },
        { prospectCompany: { contains: search } },
      ]
    }

    const proposals = await prisma.clientProposal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Parse JSON fields
    const parsedProposals = proposals.map(p => ({
      ...p,
      services: safeJsonParse(p.services, []),
      scopeItems: safeJsonParse(p.scopeItems, []),
      selectedServices: safeJsonParse(p.selectedServices, null),
      selectedScope: safeJsonParse(p.selectedScope, null),
    }))

    return NextResponse.json({ proposals: parsedProposals })
  } catch (error) {
    console.error('Failed to fetch proposals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST - Create a new proposal
export const POST = withAuth(async (req, { user, params }) => {
  try {
// SECURITY FIX: Only accounts/sales team can create client proposals
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES', 'ACCOUNTS']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Proposal creation requires accounts/sales access' }, { status: 403 })
    }

    const raw = await req.json()
    const parsed = createProposalSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const {
      prospectName,
      prospectEmail,
      prospectPhone,
      prospectCompany,
      services,
      scopeItems,
      basePrice,
      gstPercentage = TAX_CONFIG.GST_DEFAULT_PERCENTAGE,
      allowServiceModification = true,
      allowScopeModification = true,
      entityType = 'BRANDING_PIONEERS',
      validityDays = 15,
    } = parsed.data

    const gstAmount = (basePrice * gstPercentage) / 100
    const totalPrice = basePrice + gstAmount

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + validityDays)

    const proposal = await prisma.clientProposal.create({
      data: {
        prospectName,
        prospectEmail,
        prospectPhone,
        prospectCompany,
        services: JSON.stringify(services),
        scopeItems: JSON.stringify(scopeItems || []),
        basePrice,
        gstPercentage,
        totalPrice,
        allowServiceModification,
        allowScopeModification,
        entityType,
        expiresAt,
        createdById: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      proposal: {
        ...proposal,
        services: safeJsonParse(proposal.services, []),
        scopeItems: safeJsonParse(proposal.scopeItems, []),
      },
      proposalUrl: `/proposal/${proposal.token}`,
    })
  } catch (error) {
    console.error('Failed to create proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
