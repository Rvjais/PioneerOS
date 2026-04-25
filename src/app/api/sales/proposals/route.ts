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

    // SECURITY FIX: Only sales team and managers can view proposals
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES', 'ACCOUNTS']
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Proposal data requires sales access' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const leadId = searchParams.get('leadId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (leadId) where.leadId = leadId
    if (status) where.status = status

    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            contactEmail: true,
            pipeline: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(proposals)
  } catch (error) {
    console.error('Failed to fetch proposals:', error)
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY FIX: Only sales team can create proposals
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES']
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Proposal creation requires sales access' }, { status: 403 })
    }

    const body = await req.json()
    const postSchema = z.object({
      leadId: z.string().min(1),
      title: z.string().min(1).max(500),
      value: z.union([z.string(), z.number()]),
      services: z.array(z.string()).optional(),
      validUntil: z.string().optional(),
      documentUrl: z.string().max(1000).optional(),
    })
    const postResult = postSchema.safeParse(body)
    if (!postResult.success) return NextResponse.json({ error: postResult.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { leadId, title, value, services, validUntil, documentUrl } = postResult.data

    const proposal = await prisma.proposal.create({
      data: {
        leadId,
        title,
        value: parseFloat(String(value)),
        services: services ? JSON.stringify(services) : null,
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        documentUrl: documentUrl || null,
        status: 'DRAFT',
      },
      include: {
        lead: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
          }
        }
      },
    })

    return NextResponse.json(proposal)
  } catch (error) {
    console.error('Failed to create proposal:', error)
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY FIX: Only sales team can update proposals
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES']
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Proposal update requires sales access' }, { status: 403 })
    }

    const body = await req.json()
    const pSchema = z.object({
      id: z.string().min(1),
      status: z.string().max(50).optional(),
      documentUrl: z.string().max(1000).optional(),
      title: z.string().max(500).optional(),
      value: z.union([z.string(), z.number()]).optional(),
      services: z.array(z.string()).optional(),
      validUntil: z.string().optional(),
    })
    const pResult = pSchema.safeParse(body)
    if (!pResult.success) return NextResponse.json({ error: pResult.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { id, status, documentUrl, title, value, services, validUntil } = pResult.data

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (documentUrl) updateData.documentUrl = documentUrl
    if (title) updateData.title = title
    if (value) updateData.value = parseFloat(String(value))
    if (services) updateData.services = JSON.stringify(services)
    if (validUntil) updateData.validUntil = new Date(validUntil)

    const proposal = await prisma.proposal.update({
      where: { id },
      data: updateData,
      include: {
        lead: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
          }
        }
      },
    })

    // Update lead stage based on proposal status changes
    if (status === 'SENT') {
      await prisma.lead.update({
        where: { id: proposal.leadId },
        data: { stage: 'PROPOSAL_SHARED' },
      })

      await prisma.leadActivity.create({
        data: {
          leadId: proposal.leadId,
          userId: session.user.id,
          type: 'PROPOSAL_SENT',
          title: 'Proposal Sent',
          description: `Proposal "${title || proposal.title}" sent to client`,
        },
      })
    } else if (status === 'ACCEPTED') {
      // Proposal accepted → lead is won; deal closure should be tracked separately in deals
      await prisma.lead.update({
        where: { id: proposal.leadId },
        data: {
          stage: 'WON',
          wonAt: new Date(),
        },
      })

      await prisma.leadActivity.create({
        data: {
          leadId: proposal.leadId,
          userId: session.user.id,
          type: 'STATUS_CHANGE',
          title: 'Proposal Accepted',
          description: `Proposal "${title || proposal.title}" accepted — deal won`,
        },
      })
    } else if (status === 'REJECTED') {
      await prisma.lead.update({
        where: { id: proposal.leadId },
        data: { stage: 'LOST' },
      })

      await prisma.leadActivity.create({
        data: {
          leadId: proposal.leadId,
          userId: session.user.id,
          type: 'STATUS_CHANGE',
          title: 'Proposal Rejected',
          description: `Proposal "${title || proposal.title}" rejected by client`,
        },
      })
    }

    return NextResponse.json(proposal)
  } catch (error) {
    console.error('Failed to update proposal:', error)
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 })
  }
}
