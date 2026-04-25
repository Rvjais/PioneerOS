import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { safeJsonParse } from '@/shared/utils/safeJson'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const LeadActivitySchema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'FOLLOW_UP', 'DEMO', 'PROPOSAL', 'OTHER']).optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less').optional().nullable(),
  description: z.string().max(5000, 'Description must be 5000 characters or less').optional().nullable(),
  outcome: z.string().max(1000, 'Outcome must be 1000 characters or less').optional().nullable(),
  duration: z.union([
    z.number().int().min(0, 'Duration cannot be negative').max(1440, 'Duration must be 1440 minutes or less'),
    z.string().refine((val) => { const n = parseInt(val); return !isNaN(n) && n >= 0 && n <= 1440; }, { message: 'Duration must be a number between 0 and 1440' }),
  ]).optional().nullable(),
})

export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Lead activity requires sales access' }, { status: 403 })
    }

    const { leadId } = await routeParams!

    const activities = await prisma.leadActivity.findMany({
      where: { leadId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Failed to fetch activities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Lead activity requires sales access' }, { status: 403 })
    }

    const { leadId } = await routeParams!
    const body = await req.json()
    const parseResult = LeadActivitySchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const { type, title, description, outcome, duration } = parseResult.data

    // Create the activity
    const activity = await prisma.leadActivity.create({
      data: {
        leadId,
        userId: user.id,
        type: type || 'NOTE',
        title: title ?? '',
        description,
        outcome,
        duration: duration ? parseInt(String(duration)) : null,
      },
    })

    // Update lastContactedAt on the lead
    await prisma.lead.update({
      where: { id: leadId },
      data: { lastContactedAt: new Date() },
    })

    // If it's a call with notes, append to call notes
    if (type === 'CALL' && description) {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { callNotes: true },
      })

      const existingNotes = safeJsonParse<Record<string, unknown>[]>(lead?.callNotes, [])
      existingNotes.unshift({
        date: new Date().toISOString(),
        content: description,
        outcome,
        duration,
      })

      // Cap call notes at 100 entries to prevent unbounded growth
      if (existingNotes.length > 100) existingNotes.length = 100

      await prisma.lead.update({
        where: { id: leadId },
        data: { callNotes: JSON.stringify(existingNotes) },
      })
    }

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Failed to create activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
