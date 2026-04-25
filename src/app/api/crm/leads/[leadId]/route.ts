import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const updateLeadSchema = z.object({
  stage: z.string().max(50).optional(),
  lostReason: z.string().max(1000).optional().nullable(),
  value: z.number().optional(),
  notes: z.string().max(5000).optional().nullable(),
  nextFollowUp: z.string().optional(),
  assignedToId: z.string().optional().nullable(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
)

export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES', 'OPERATIONS_HEAD']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { leadId } = await routeParams!

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        proposals: true,
        activities: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        },
        reminders: {
          include: { user: true },
          orderBy: { scheduledAt: 'asc' },
        },
        assignedTo: true,
        client: true,
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Failed to fetch lead:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { leadId } = await routeParams!
    const body = await req.json()
    const parsed = updateLeadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    // Get current lead data for comparison
    const currentLead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { stage: true, companyName: true, assignedToId: true, value: true },
    })

    if (!currentLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const previousStage = currentLead.stage

    // Handle stage changes
    if (body.stage) {
      updateData.stage = body.stage
      updateData.status = body.stage === 'WON' ? 'WON' :
        body.stage === 'LOST' ? 'LOST' :
        body.stage === 'NEGOTIATION' ? 'NEGOTIATION' :
        body.stage === 'PROPOSAL_SENT' ? 'PROPOSAL' :
        body.stage === 'DISCOVERY_CALL' ? 'CONTACTED' : 'NEW'

      if (body.stage === 'WON') {
        updateData.wonAt = new Date()
      }

      if (body.stage === 'LOST' && body.lostReason) {
        updateData.lostReason = body.lostReason
      }

      // Log stage change activity
      await prisma.leadActivity.create({
        data: {
          leadId,
          userId: user.id,
          type: 'STATUS_CHANGE',
          title: `Stage changed to ${body.stage.replace(/_/g, ' ')}`,
          description: body.lostReason || null,
        },
      })

      // Send notifications if stage changed
      if (previousStage !== body.stage) {
        const stageName = body.stage.replace(/_/g, ' ')
        const valueStr = currentLead.value ? ` (${(currentLead.value / 100000).toFixed(1)}L)` : ''

        // Notify assigned user if different from current user
        if (currentLead.assignedToId && currentLead.assignedToId !== user.id) {
          await prisma.notification.create({
            data: {
              userId: currentLead.assignedToId,
              type: 'CRM',
              title: `Lead moved to ${stageName}`,
              message: `${currentLead.companyName}${valueStr} was moved to ${stageName} by ${user.firstName}`,
              link: `/sales/leads/${leadId}`,
              priority: body.stage === 'WON' ? 'HIGH' : 'NORMAL',
            },
          })
        }

        // Notify all sales managers for WON/LOST deals
        if (body.stage === 'WON' || body.stage === 'LOST') {
          const managers = await prisma.user.findMany({
            where: {
              OR: [
                { role: 'SUPER_ADMIN' },
                { role: 'MANAGER', department: 'SALES' },
              ],
              id: { not: user.id },
              status: 'ACTIVE',
              deletedAt: null,
            },
            select: { id: true },
          })

          const notificationPromises = managers.map((manager) =>
            prisma.notification.create({
              data: {
                userId: manager.id,
                type: 'CRM',
                title: body.stage === 'WON' ? 'Deal Won!' : 'Deal Lost',
                message: body.stage === 'WON'
                  ? `${currentLead.companyName}${valueStr} closed by ${user.firstName}`
                  : `${currentLead.companyName}${valueStr} lost: ${body.lostReason || 'No reason provided'}`,
                link: `/sales/leads/${leadId}`,
                priority: 'HIGH',
              },
            })
          )

          await Promise.all(notificationPromises)
        }
      }
    }

    // Handle other field updates
    if (body.value !== undefined) updateData.value = body.value
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.nextFollowUp !== undefined) updateData.nextFollowUp = new Date(body.nextFollowUp)
    if (body.assignedToId !== undefined) updateData.assignedToId = body.assignedToId

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: updateData,
    })

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Failed to update lead:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (req, { params }) => {
  try {
    const { leadId } = params!

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 })
    }

    await prisma.lead.delete({
      where: { id: leadId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete lead:', error)
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER'] })
