import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { SALES_ROLES } from '@/shared/constants/roles'
import { z } from 'zod'

const patchLeadSchema = z.object({
  companyName: z.string().min(1).max(200).optional(),
  contactName: z.string().min(1).max(200).optional(),
  contactEmail: z.string().email().max(255).optional().nullable(),
  contactPhone: z.string().max(20).optional().nullable(),
  source: z.string().max(50).optional(),
  pipeline: z.string().max(50).optional(),
  stage: z.enum(['LEAD_RECEIVED', 'RFP_SENT', 'RFP_COMPLETED', 'PROPOSAL_SHARED', 'FOLLOW_UP_ONGOING', 'MEETING_SCHEDULED', 'PROPOSAL_DISCUSSION', 'WON', 'LOST']).optional(),
  value: z.number().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  lostReason: z.string().max(1000).optional().nullable(),
  nextFollowUp: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  isHealthcare: z.boolean().optional(),
  healthcareType: z.string().max(200).optional().nullable(),
  patientVolume: z.string().max(100).optional().nullable(),
  specialization: z.string().max(200).optional().nullable(),
  numberOfLocations: z.number().optional().nullable(),
  primaryObjective: z.string().max(500).optional().nullable(),
  currentChallenges: z.string().max(1000).optional().nullable(),
  businessType: z.string().max(100).optional().nullable(),
  pastMarketing: z.string().max(500).optional().nullable(),
  workedWithAgency: z.boolean().optional().nullable(),
  agencyIssues: z.string().max(500).optional().nullable(),
  timeline: z.string().max(100).optional().nullable(),
  budgetRange: z.string().max(100).optional().nullable(),
  leadCategory: z.string().max(50).optional().nullable(),
  leadPriority: z.string().max(50).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  yearsInOperation: z.number().optional().nullable(),
})

// Roles that can access sales leads
const LEAD_ACCESS_ROLES = SALES_ROLES

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY FIX: Only sales team and managers can view leads
    if (!LEAD_ACCESS_ROLES.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { leadId } = await params

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true }
        },
        proposals: true,
        activities: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        nurturingActions: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        reminders: {
          where: { isCompleted: false },
          orderBy: { scheduledAt: 'asc' }
        },
        handovers: {
          include: {
            salesUser: { select: { id: true, firstName: true, lastName: true } },
            accountsUser: { select: { id: true, firstName: true, lastName: true } }
          }
        }
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Failed to fetch lead:', error)
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY FIX: Only sales team and managers can modify leads
    if (!LEAD_ACCESS_ROLES.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { leadId } = await params
    const body = await req.json()
    const parsed = patchLeadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    // Remove undefined values and id
    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'companyName', 'contactName', 'contactEmail', 'contactPhone',
      'source', 'pipeline', 'stage', 'value',
      'notes', 'lostReason', 'nextFollowUp', 'assignedToId',
      'isHealthcare', 'healthcareType', 'patientVolume', 'specialization',
      'numberOfLocations', 'primaryObjective', 'currentChallenges',
      'businessType', 'pastMarketing', 'workedWithAgency', 'agencyIssues',
      'timeline', 'budgetRange', 'leadCategory', 'leadPriority',
      'location', 'state', 'yearsInOperation'
    ]

    const validatedData = parsed.data as Record<string, unknown>
    for (const field of allowedFields) {
      if (validatedData[field] !== undefined) {
        updateData[field] = validatedData[field]
      }
    }

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: updateData,
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true }
        },
        _count: {
          select: { nurturingActions: true }
        }
      },
    })

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Failed to update lead:', error)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const canDelete = ['SUPER_ADMIN', 'MANAGER'].includes(session.user.role)
    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { leadId } = await params

    await prisma.lead.update({
      where: { id: leadId },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete lead:', error)
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}
