import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { calculateGST, calculateTotal } from '@/server/onboarding/constants'
import { withAuth } from '@/server/auth/withAuth'

// Schema for creating onboarding link
const createOnboardingSchema = z.object({
  // Prospect details (from RFP or manual entry)
  prospectName: z.string().min(1, 'Prospect name is required'),
  prospectEmail: z.string().email('Valid email is required'),
  prospectPhone: z.string().min(10, 'Valid phone number is required'),
  prospectCompany: z.string().optional(),

  // Entity & Services
  entityType: z.enum(['BRANDING_PIONEERS', 'ATZ_MEDAPPZ']),
  services: z.array(z.object({
    serviceId: z.string(),
    name: z.string().optional(),
    price: z.number().optional(),
    scope: z.record(z.string(), z.string()).optional(),
  })).min(1, 'At least one service is required'),

  // Pricing
  basePrice: z.number().min(1, 'Base price is required'),
  gstPercentage: z.number().default(18),
  discountAmount: z.number().optional(),
  discountPercentage: z.number().optional(),

  // Contract details
  contractDuration: z.enum(['3_MONTHS', '6_MONTHS', '12_MONTHS', '24_MONTHS']).default('12_MONTHS'),
  paymentTerms: z.enum(['ADVANCE_100', 'ADVANCE_50', 'NET_15', 'NET_30']).default('ADVANCE_100'),
  advancePercentage: z.number().min(0).max(100).default(100),

  // Optional
  notes: z.string().optional(),
  expiresInDays: z.number().min(1).max(30).default(7),

  // Link to lead if applicable
  leadId: z.string().optional(),
})

// POST: Create new onboarding link
export const POST = withAuth(async (req, { user }) => {
  try {
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions (Sales, Accounts, or Admin)
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true, department: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'ACCOUNTS', 'SALES']
    const allowedDepartments = ['ACCOUNTS', 'SALES', 'MANAGEMENT', 'OPERATIONS']

    if (!allowedRoles.includes(dbUser.role) && !allowedDepartments.includes(dbUser.department || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await req.json()

    // Validate input
    const validation = createOnboardingSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Calculate pricing
    const gstAmount = calculateGST(data.basePrice, data.gstPercentage)
    const totalPrice = calculateTotal(data.basePrice, data.gstPercentage)
    const advanceAmount = Math.round(totalPrice * (data.advancePercentage / 100))

    // Generate unique token
    const token = nanoid(32)

    // Calculate expiration
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + data.expiresInDays)

    // Create proposal
    const proposal = await prisma.clientProposal.create({
      data: {
        token,
        status: 'SENT',
        currentStep: 1,

        // Prospect details
        prospectName: data.prospectName,
        prospectEmail: data.prospectEmail,
        prospectPhone: data.prospectPhone,
        prospectCompany: data.prospectCompany || data.prospectName,

        // Entity & Services
        entityType: data.entityType,
        services: JSON.stringify(data.services),
        scopeItems: JSON.stringify(data.services.map(s => ({
          serviceId: s.serviceId,
          name: s.name,
          scope: s.scope || {},
        }))),

        // Pricing
        basePrice: data.basePrice,
        gstPercentage: data.gstPercentage,
        totalPrice,

        // Contract
        contractDuration: data.contractDuration,
        paymentTerms: data.paymentTerms,
        advancePercentage: data.advancePercentage,
        advanceAmount,

        // Metadata
        expiresAt,
        createdById: user.id,
      },
    })

    // Generate onboarding URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const onboardingUrl = `${baseUrl}/onboarding/${token}`

    return NextResponse.json({
      success: true,
      message: 'Onboarding link created successfully',
      proposal: {
        id: proposal.id,
        token: proposal.token,
        url: onboardingUrl,
        expiresAt: proposal.expiresAt,
        totalPrice,
        advanceAmount,
      },
    })
  } catch (error) {
    console.error('Error creating onboarding link:', error)
    return NextResponse.json(
      { error: 'Failed to create onboarding link' },
      { status: 500 }
    )
  }
})

// GET: List all onboarding proposals (with filters)
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only accounts, sales, operations, or admins can view onboarding proposals
    const getAllowedRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'ACCOUNTS', 'SALES']
    const getAllowedDepartments = ['ACCOUNTS', 'SALES', 'OPERATIONS', 'MANAGEMENT']
    if (!getAllowedRoles.includes(user.role || '') && !getAllowedDepartments.includes(user.department || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build filter
    const where: Record<string, unknown> = {}

    if (status) {
      if (status === 'PENDING_PAYMENT') {
        where.slaAccepted = true
        where.paymentConfirmed = false
      } else if (status === 'PENDING_REVIEW') {
        where.accountOnboardingCompleted = true
        where.managerReviewed = false
      } else {
        where.status = status
      }
    }

    const [proposals, total] = await Promise.all([
      prisma.clientProposal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          token: true,
          status: true,
          currentStep: true,
          prospectName: true,
          prospectEmail: true,
          prospectCompany: true,
          entityType: true,
          totalPrice: true,
          advanceAmount: true,
          slaAccepted: true,
          paymentConfirmed: true,
          accountOnboardingCompleted: true,
          managerReviewed: true,
          portalActivated: true,
          createdAt: true,
          expiresAt: true,
          viewedAt: true,
        },
      }),
      prisma.clientProposal.count({ where }),
    ])

    return NextResponse.json({
      proposals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching proposals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    )
  }
})
