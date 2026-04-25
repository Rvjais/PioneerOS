import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY FIX: Only sales team and managers can view all deals
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES', 'ACCOUNTS']
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Sales data requires sales access' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // WON, LOST

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    // SALES role can only see their own deals
    if (session.user.role === 'SALES') {
      where.userId = session.user.id
    }

    // Fetch deals and total count in parallel
    const [deals, totalCount] = await Promise.all([
      prisma.salesDeal.findMany({
        where,
        include: {
          lead: {
            select: {
              id: true,
              companyName: true,
              contactName: true,
              contactEmail: true,
              contactPhone: true,
              pipeline: true,
              lostReason: true,
            }
          },
          user: {
            select: { id: true, firstName: true, lastName: true }
          },
        },
        orderBy: { closedAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.salesDeal.count({ where }),
    ])

    return NextResponse.json({
      deals,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch deals:', error)
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY FIX: Only sales team and managers can create deals
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES']
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Deal creation requires sales access' }, { status: 403 })
    }

    const body = await req.json()
    const dealSchema = z.object({
      leadId: z.string().min(1),
      dealValue: z.union([z.string(), z.number()]),
      servicesSold: z.array(z.string()).optional(),
      contractDuration: z.string().max(100).optional(),
      startDate: z.string().optional(),
      status: z.string().max(50).optional(),
      lossReason: z.string().max(1000).optional(),
      billingCycle: z.string().max(50).optional(),
      paymentTerms: z.string().max(500).optional(),
    })
    const dealResult = dealSchema.safeParse(body)
    if (!dealResult.success) return NextResponse.json({ error: dealResult.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const {
      leadId,
      dealValue,
      servicesSold,
      contractDuration,
      startDate,
      status,
      lossReason,
      billingCycle,
      paymentTerms,
    } = dealResult.data

    // Validate dealValue is a proper finite number
    const numericValue = Number(dealValue)
    if (isNaN(numericValue) || !isFinite(numericValue) || numericValue < 0) {
      return NextResponse.json({ error: 'Invalid deal value - must be a positive number' }, { status: 400 })
    }

    // Use transaction to ensure all operations succeed or fail together
    const deal = await prisma.$transaction(async (tx) => {
      const newDeal = await tx.salesDeal.create({
        data: {
          leadId,
          userId: session.user.id,
          dealValue: parseFloat(String(dealValue)) || 0,
          servicesSold: servicesSold ? JSON.stringify(servicesSold) : '[]',
          contractDuration: contractDuration ? parseInt(String(contractDuration)) : null,
          startDate: startDate ? new Date(startDate) : null,
          status: status || 'WON',
          lossReason: lossReason || null,
          billingCycle: billingCycle || null,
          paymentTerms: paymentTerms || null,
        },
        include: {
          lead: {
            select: {
              id: true,
              companyName: true,
              contactName: true,
              contactEmail: true,
              contactPhone: true,
              pipeline: true,
            }
          },
        },
      })

      // Update lead stage
      await tx.lead.update({
        where: { id: leadId },
        data: {
          stage: status === 'WON' ? 'WON' : 'LOST',
          wonAt: status === 'WON' ? new Date() : null,
          lostReason: lossReason || null,
        },
      })

      // Create activity
      await tx.leadActivity.create({
        data: {
          leadId,
          userId: session.user.id,
          type: 'STATUS_CHANGE',
          title: status === 'WON' ? 'Deal Won' : 'Deal Lost',
          description: `Deal value: ${dealValue}${lossReason ? `. Reason: ${lossReason}` : ''}`,
        },
      })

      // Auto-create handover record for won deals so accounts team is notified
      if (status === 'WON' || !status) {
        // Check if a sales proposal exists for this lead
        const salesProposal = await tx.proposal.findFirst({
          where: { leadId },
          orderBy: { createdAt: 'desc' },
        })

        // Create handover with proposal data pre-filled
        const existingHandover = await tx.salesHandover.findFirst({ where: { leadId } })
        if (!existingHandover) {
          await tx.salesHandover.create({
            data: {
              leadId,
              salesUserId: session.user.id,
              status: 'PENDING',
              dealValue: parseFloat(String(dealValue)) || 0,
              servicesAgreed: servicesSold ? JSON.stringify(servicesSold) : '[]',
              paymentTerms: paymentTerms || null,
              proposalUrl: salesProposal?.documentUrl || null,
              specialTerms: contractDuration ? `Contract: ${contractDuration} months` : null,
              notes: `Auto-created from deal closure. Billing: ${billingCycle || 'N/A'}`,
            },
          })
        }
      }

      return newDeal
    })

    return NextResponse.json(deal)
  } catch (error) {
    console.error('Failed to create deal:', error)
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 })
  }
}
