import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

// Unit values based on company policy
const DELIVERABLE_VALUES: Record<string, Record<string, number>> = {
  SOCIAL_MEDIA: {
    STANDARD_POST: 100,
    CAROUSEL: 200,
    REEL: 200,
    STORY: 50,
  },
  DESIGN: {
    STANDARD_GRAPHIC: 100,
    CAROUSEL_GRAPHIC: 200,
    MOTION_REEL: 200,
  },
  VIDEO: {
    SHORT_VIDEO: 300,
    SUPER_VIDEO: 1000,
  },
  SEO: {
    SMALL_CLIENT: 1000,   // 20-30 keywords
    MID_CLIENT: 2000,     // 40-60 keywords
    LARGE_CLIENT: 5000,   // 100+ keywords
    GMB_LOCATION: 500,
  },
  WEB: {
    STANDARD_PAGE: 400,
    LANDING_PAGE: 600,
    SUPER_LANDING_PAGE: 2000,
  },
  ADS: {
    STANDARD_CLIENT: 3000,  // <5 campaigns
    PREMIUM_CLIENT: 5000,   // 5+ campaigns
  },
  ACCOUNT_MANAGEMENT: {
    STANDARD_CLIENT: 3000,
    PREMIUM_CLIENT: 5000,
    ENTERPRISE_CLIENT: 8000,
  },
}

// GET - Get deliverables
export const GET = withAuth(async (req, { user, params }) => {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const monthParam = searchParams.get('month')

    const month = monthParam ? new Date(monthParam) : new Date()
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)

    const whereClause: Record<string, unknown> = {
      month: { gte: monthStart, lte: monthEnd },
    }

    if (userId) {
      whereClause.userId = userId
    }

    const deliverables = await prisma.workDeliverable.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            empId: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate totals
    const totals = await prisma.workDeliverable.aggregate({
      where: whereClause,
      _sum: {
        quantity: true,
        totalValue: true,
      },
    })

    return NextResponse.json({
      deliverables,
      totals: {
        totalQuantity: totals._sum.quantity || 0,
        totalValue: totals._sum.totalValue || 0,
      },
    })
  } catch (error) {
    console.error('Error fetching deliverables:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST - Add deliverable
export const POST = withAuth(async (req, { user, params }) => {
  try {
    const body = await req.json()
    const postSchema = z.object({
      userId: z.string().min(1).optional(),
      clientId: z.string().min(1).optional(),
      category: z.string().min(1).max(100),
      deliverableType: z.string().min(1).max(100),
      quantity: z.number().int().min(1),
      month: z.string().optional(),
      notes: z.string().max(1000).optional(),
    })
    const parsed = postSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const {
      userId,
      clientId,
      category,
      deliverableType,
      quantity,
      month: monthParam,
      notes,
    } = parsed.data

    const targetUserId = userId || user.id

    // Get unit value
    const categoryValues = DELIVERABLE_VALUES[category]
    if (!categoryValues) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    const unitValue = categoryValues[deliverableType]
    if (unitValue === undefined) {
      return NextResponse.json({ error: 'Invalid deliverable type' }, { status: 400 })
    }

    const month = monthParam ? new Date(monthParam) : new Date()
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)

    const deliverable = await prisma.workDeliverable.create({
      data: {
        userId: targetUserId,
        clientId,
        month: monthStart,
        category,
        deliverableType,
        quantity,
        unitValue,
        totalValue: quantity * unitValue,
        notes,
      },
    })

    return NextResponse.json(deliverable)
  } catch (error) {
    console.error('Error creating deliverable:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// Return available categories and types for the UI
export async function OPTIONS() {
  return NextResponse.json({
    categories: DELIVERABLE_VALUES,
  })
}
