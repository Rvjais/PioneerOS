import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

// Activity types for the daily tracker
const ACTIVITY_TYPES = ['CALL', 'EMAIL', 'MEETING', 'NOTE', 'PROPOSAL_SENT', 'STATUS_CHANGE', 'WHATSAPP']
const OUTCOMES = ['POSITIVE', 'NEUTRAL', 'NEGATIVE']

// GET - Get activities for a lead
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leadId } = await params

    const activities = await prisma.leadActivity.findMany({
      where: { leadId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Failed to fetch activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

// POST - Log a new activity for a lead
export async function POST(
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
    const schema = z.object({
      type: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'PROPOSAL_SENT', 'STATUS_CHANGE', 'WHATSAPP']),
      title: z.string().min(1).max(500),
      notes: z.string().max(2000).optional(),
      description: z.string().max(2000).optional(),
      outcome: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).optional(),
      duration: z.union([z.string(), z.number()]).optional(),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { type, title, notes, description, outcome, duration } = result.data

    // Verify lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Create the activity
    const activity = await prisma.leadActivity.create({
      data: {
        leadId,
        userId: session.user.id,
        type,
        title,
        description: description || notes || null,
        outcome: outcome || null,
        duration: duration ? parseInt(String(duration)) : null,
      },
      include: {
        lead: { select: { id: true, companyName: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    // Update lead's lastContactedAt
    await prisma.lead.update({
      where: { id: leadId },
      data: { lastContactedAt: new Date() },
    })

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Failed to log activity:', error)
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 })
  }
}
