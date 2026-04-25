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

    // SECURITY FIX: Only sales/accounts team and managers can view handovers
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES', 'ACCOUNTS']
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Handover data requires sales/accounts access' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // PENDING, ACKNOWLEDGED, IN_PROGRESS, COMPLETED
    const role = searchParams.get('role') // sales, accounts

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    // Filter by role
    if (role === 'sales') {
      where.salesUserId = session.user.id
    } else if (role === 'accounts') {
      where.accountsUserId = session.user.id
    }

    const handovers = await prisma.salesHandover.findMany({
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
            value: true,
            primaryObjective: true,
            budgetRange: true,
          }
        },
        salesUser: {
          select: { id: true, firstName: true, lastName: true }
        },
        accountsUser: {
          select: { id: true, firstName: true, lastName: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(handovers)
  } catch (error) {
    console.error('Failed to fetch handovers:', error)
    return NextResponse.json({ error: 'Failed to fetch handovers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY FIX: Only sales team and managers can create handovers
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES']
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Handover creation requires sales access' }, { status: 403 })
    }

    const body = await req.json()
    const postSchema = z.object({
      leadId: z.string().min(1),
      accountsUserId: z.string().min(1).optional(),
      paymentTerms: z.string().max(500).optional(),
      servicesAgreed: z.array(z.string()).optional(),
      specialTerms: z.string().max(2000).optional(),
      proposalUrl: z.string().max(1000).optional(),
      dealValue: z.number().optional(),
      notes: z.string().max(2000).optional(),
    })
    const postResult = postSchema.safeParse(body)
    if (!postResult.success) return NextResponse.json({ error: postResult.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const {
      leadId,
      accountsUserId,
      paymentTerms,
      servicesAgreed,
      specialTerms,
      proposalUrl,
      dealValue,
      notes,
    } = postResult.data

    // Get lead data for handover summary
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        nurturingActions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        proposals: {
          where: { status: 'ACCEPTED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Validate accountsUserId exists if provided
    if (accountsUserId) {
      const accountsUser = await prisma.user.findUnique({ where: { id: accountsUserId } })
      if (!accountsUser) {
        return NextResponse.json({ error: 'Accounts user not found' }, { status: 400 })
      }
    }

    // Prevent handover of lost leads
    if (lead.stage === 'LOST') {
      return NextResponse.json({ error: 'Cannot handover a lost lead' }, { status: 400 })
    }

    // Create nurturing history summary
    const nurturingHistory = lead.nurturingActions.map(a => ({
      type: a.actionType,
      title: a.contentTitle,
      date: a.createdAt,
    }))

    // Parse RFP responses for summary
    let rfpSummary: string | null = null
    if (lead.rfpResponses) {
      try {
        const rfp = JSON.parse(lead.rfpResponses)
        rfpSummary = `Objective: ${rfp.primaryObjective || lead.primaryObjective}, Timeline: ${rfp.timeline || lead.timeline}, Budget: ${rfp.budgetRange || lead.budgetRange}`
      } catch {
        rfpSummary = `Objective: ${lead.primaryObjective}, Timeline: ${lead.timeline}, Budget: ${lead.budgetRange}`
      }
    }

    // SECURITY FIX: Use transaction to ensure all operations succeed or fail together
    const handover = await prisma.$transaction(async (tx) => {
      // Create handover
      const newHandover = await tx.salesHandover.create({
        data: {
          leadId,
          salesUserId: session.user.id,
          accountsUserId: accountsUserId || null,
          status: 'PENDING',
          paymentTerms: paymentTerms || null,
          servicesAgreed: servicesAgreed ? JSON.stringify(servicesAgreed) : null,
          specialTerms: specialTerms || null,
          proposalUrl: proposalUrl || lead.proposals[0]?.documentUrl || null,
          dealValue: dealValue || lead.value || null,
          rfpSummary,
          nurturingHistory: JSON.stringify(nurturingHistory),
          keyContacts: JSON.stringify([{
            name: lead.contactName,
            email: lead.contactEmail,
            phone: lead.contactPhone,
          }]),
          notes: notes || null,
        },
        include: {
          lead: {
            select: {
              id: true,
              companyName: true,
              contactName: true,
            }
          },
          salesUser: {
            select: { id: true, firstName: true, lastName: true }
          },
        },
      })

      // Update lead stage to HANDOVER (only mark WON when handover is completed)
      await tx.lead.update({
        where: { id: leadId },
        data: {
          stage: lead.stage === 'WON' ? 'WON' : 'HANDOVER',
          wonAt: lead.stage === 'WON' ? lead.wonAt : null,
        },
      })

      // Create activity
      await tx.leadActivity.create({
        data: {
          leadId,
          userId: session.user.id,
          type: 'STATUS_CHANGE',
          title: 'Handover Initiated',
          description: 'Sales handover to Accounts initiated',
        },
      })

      return newHandover
    })

    return NextResponse.json(handover)
  } catch (error) {
    console.error('Failed to create handover:', error)
    return NextResponse.json({ error: 'Failed to create handover' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY FIX: Only sales/accounts team and managers can update handovers
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES', 'ACCOUNTS']
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Handover update requires sales/accounts access' }, { status: 403 })
    }

    const body = await req.json()
    const patchSchema = z.object({
      id: z.string().min(1),
      status: z.enum(['PENDING', 'ACKNOWLEDGED', 'IN_PROGRESS', 'COMPLETED']).optional(),
      accountsUserId: z.string().min(1).optional(),
      notes: z.string().max(2000).optional(),
    })
    const patchResult = patchSchema.safeParse(body)
    if (!patchResult.success) return NextResponse.json({ error: patchResult.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { id, status, accountsUserId, notes } = patchResult.data

    const updateData: Record<string, unknown> = {}
    if (status) {
      // Validate status transition: PENDING → ACKNOWLEDGED → IN_PROGRESS → COMPLETED
      const validTransitions: Record<string, string[]> = {
        PENDING: ['ACKNOWLEDGED'],
        ACKNOWLEDGED: ['IN_PROGRESS'],
        IN_PROGRESS: ['COMPLETED'],
        COMPLETED: [],
      }

      const currentHandover = await prisma.salesHandover.findUnique({
        where: { id },
        select: { status: true },
      })

      if (!currentHandover) {
        return NextResponse.json({ error: 'Handover not found' }, { status: 404 })
      }

      const allowedNext = validTransitions[currentHandover.status] || []
      if (!allowedNext.includes(status)) {
        return NextResponse.json({
          error: `Invalid status transition from ${currentHandover.status} to ${status}. Allowed: ${allowedNext.join(', ') || 'none'}`
        }, { status: 400 })
      }

      updateData.status = status
      if (status === 'ACKNOWLEDGED') {
        updateData.acknowledgedAt = new Date()
      } else if (status === 'COMPLETED') {
        updateData.completedAt = new Date()
      }
    }
    if (accountsUserId) updateData.accountsUserId = accountsUserId
    if (notes) updateData.notes = notes

    const handover = await prisma.salesHandover.update({
      where: { id },
      data: updateData,
      include: {
        lead: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
          }
        },
        salesUser: {
          select: { id: true, firstName: true, lastName: true }
        },
        accountsUser: {
          select: { id: true, firstName: true, lastName: true }
        },
      },
    })

    return NextResponse.json(handover)
  } catch (error) {
    console.error('Failed to update handover:', error)
    return NextResponse.json({ error: 'Failed to update handover' }, { status: 500 })
  }
}
