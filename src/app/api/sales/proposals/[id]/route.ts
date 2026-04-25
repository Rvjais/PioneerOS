import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const SALES_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SALES']

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET - Get single proposal
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!SALES_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        lead: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            contactEmail: true,
            contactPhone: true,
            stage: true,
            value: true,
          },
        },
      },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    return NextResponse.json(proposal)
  } catch (error) {
    console.error('Failed to fetch proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update proposal
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!SALES_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const patchSchema = z.object({
      title: z.string().max(500).optional(),
      description: z.string().max(5000).optional(),
      servicesIncluded: z.string().max(5000).optional(),
      monthlyRetainer: z.number().optional(),
      oneTimeSetup: z.number().optional(),
      totalValue: z.number().optional(),
      validUntil: z.string().optional(),
      status: z.string().max(50).optional(),
      notes: z.string().max(2000).optional(),
      documentUrl: z.string().max(1000).optional(),
    })
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })

    const existingProposal = await prisma.proposal.findUnique({
      where: { id },
    })

    if (!existingProposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    const {
      title,
      description,
      servicesIncluded,
      monthlyRetainer,
      oneTimeSetup,
      totalValue,
      validUntil,
      status,
      notes,
      documentUrl,
    } = parsed.data

    const updateData: Record<string, unknown> = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (servicesIncluded !== undefined) updateData.servicesIncluded = servicesIncluded
    if (monthlyRetainer !== undefined) updateData.monthlyRetainer = monthlyRetainer
    if (oneTimeSetup !== undefined) updateData.oneTimeSetup = oneTimeSetup
    if (totalValue !== undefined) updateData.totalValue = totalValue
    if (validUntil !== undefined) updateData.validUntil = new Date(validUntil)
    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (documentUrl !== undefined) updateData.documentUrl = documentUrl

    // Track status changes
    if (status && status !== existingProposal.status) {
      if (status === 'SENT') {
        updateData.sentAt = new Date()
      } else if (status === 'ACCEPTED') {
        updateData.acceptedAt = new Date()
      } else if (status === 'REJECTED') {
        updateData.rejectedAt = new Date()
      }
    }

    const proposal = await prisma.proposal.update({
      where: { id },
      data: updateData,
      include: {
        lead: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
          },
        },
      },
    })

    return NextResponse.json(proposal)
  } catch (error) {
    console.error('Failed to update proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete proposal
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admin/manager can delete
    if (!['SUPER_ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    await prisma.proposal.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
