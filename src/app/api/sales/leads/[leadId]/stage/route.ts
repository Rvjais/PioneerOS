import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const LEAD_STAGES = [
  'LEAD_RECEIVED',
  'RFP_SENT',
  'RFP_COMPLETED',
  'PROPOSAL_SHARED',
  'FOLLOW_UP_ONGOING',
  'MEETING_SCHEDULED',
  'PROPOSAL_DISCUSSION',
  'WON',
  'LOST',
] as const

const leadStageSchema = z.object({
  stage: z.enum(LEAD_STAGES, {
    message: 'Invalid lead stage',
  }),
})

// Valid stage transitions - prevents moving backwards from terminal states
const VALID_TRANSITIONS: Record<string, string[]> = {
  LEAD_RECEIVED: ['RFP_SENT', 'FOLLOW_UP_ONGOING', 'MEETING_SCHEDULED', 'LOST'],
  RFP_SENT: ['RFP_COMPLETED', 'FOLLOW_UP_ONGOING', 'LOST'],
  RFP_COMPLETED: ['PROPOSAL_SHARED', 'FOLLOW_UP_ONGOING', 'LOST'],
  PROPOSAL_SHARED: ['PROPOSAL_DISCUSSION', 'FOLLOW_UP_ONGOING', 'WON', 'LOST'],
  FOLLOW_UP_ONGOING: ['RFP_SENT', 'MEETING_SCHEDULED', 'PROPOSAL_SHARED', 'PROPOSAL_DISCUSSION', 'WON', 'LOST'],
  MEETING_SCHEDULED: ['PROPOSAL_SHARED', 'PROPOSAL_DISCUSSION', 'FOLLOW_UP_ONGOING', 'WON', 'LOST'],
  PROPOSAL_DISCUSSION: ['WON', 'LOST', 'FOLLOW_UP_ONGOING'],
  WON: [], // Terminal state - no transitions allowed
  LOST: ['LEAD_RECEIVED'], // Can only reopen to LEAD_RECEIVED
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

    const { leadId } = await params
    const body = await req.json()

    const validation = leadStageSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      }, { status: 400 })
    }
    const { stage } = validation.data

    // Get current lead to track stage change
    const currentLead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { stage: true }
    })

    if (!currentLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Validate stage transition
    const allowedTransitions = VALID_TRANSITIONS[currentLead.stage]
    if (allowedTransitions && !allowedTransitions.includes(stage)) {
      return NextResponse.json({
        error: `Invalid stage transition from ${currentLead.stage} to ${stage}`,
      }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {
      stage,
    }

    // If marked as WON, set wonAt
    if (stage === 'WON') {
      updateData.wonAt = new Date()
    }

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: updateData,
    })

    // Create activity for stage change
    await prisma.leadActivity.create({
      data: {
        leadId,
        userId: session.user.id,
        type: 'STATUS_CHANGE',
        title: `Stage changed to ${stage.replace(/_/g, ' ')}`,
        description: `Stage changed from ${currentLead.stage} to ${stage}`,
      },
    })

    // Auto-create follow-up reminders based on stage transition
    const followUpConfig: Record<string, { title: string; daysFromNow: number; priority: string }> = {
      RFP_SENT: { title: 'Follow up on RFP sent', daysFromNow: 2, priority: 'HIGH' },
      RFP_COMPLETED: { title: 'Review RFP responses and prepare proposal', daysFromNow: 1, priority: 'HIGH' },
      PROPOSAL_SHARED: { title: 'Follow up on proposal sent', daysFromNow: 3, priority: 'HIGH' },
      FOLLOW_UP_ONGOING: { title: 'Continue follow-up sequence', daysFromNow: 2, priority: 'NORMAL' },
      MEETING_SCHEDULED: { title: 'Prepare for scheduled meeting', daysFromNow: 1, priority: 'URGENT' },
      PROPOSAL_DISCUSSION: { title: 'Follow up post-discussion', daysFromNow: 2, priority: 'HIGH' },
    }

    const config = followUpConfig[stage]
    if (config && !['WON', 'LOST'].includes(stage)) {
      const scheduledAt = new Date()
      scheduledAt.setDate(scheduledAt.getDate() + config.daysFromNow)
      await prisma.followUpReminder.create({
        data: {
          leadId,
          userId: session.user.id,
          title: config.title,
          scheduledAt,
          priority: config.priority,
          notes: `Auto-created on stage change to ${stage.replace(/_/g, ' ')}`,
        },
      })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Failed to update stage:', error)
    return NextResponse.json({ error: 'Failed to update stage' }, { status: 500 })
  }
}
