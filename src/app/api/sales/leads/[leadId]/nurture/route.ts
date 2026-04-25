import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

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

    const actions = await prisma.leadNurturingAction.findMany({
      where: { leadId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(actions)
  } catch (error) {
    console.error('Failed to fetch nurturing actions:', error)
    return NextResponse.json({ error: 'Failed to fetch nurturing actions' }, { status: 500 })
  }
}

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
      actionType: z.enum(['EBOOK', 'CASE_STUDY', 'VIDEO', 'TESTIMONIAL', 'WEBSITE_EXAMPLE', 'INDUSTRY_INSIGHTS', 'FREE_CONSULTATION', 'WHATSAPP', 'EMAIL', 'CALL']),
      contentTitle: z.string().max(500).optional(),
      contentUrl: z.string().max(1000).optional(),
      notes: z.string().max(2000).optional(),
      channel: z.string().max(100).optional(),
      response: z.string().max(2000).optional(),
    })
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { actionType, contentTitle, contentUrl, notes, channel, response } = parsed.data

    const validActionTypes = [
      'EBOOK',
      'CASE_STUDY',
      'VIDEO',
      'TESTIMONIAL',
      'WEBSITE_EXAMPLE',
      'INDUSTRY_INSIGHTS',
      'FREE_CONSULTATION',
      'WHATSAPP',
      'EMAIL',
      'CALL'
    ]

    if (!validActionTypes.includes(actionType)) {
      return NextResponse.json({ error: 'Invalid action type' }, { status: 400 })
    }

    const action = await prisma.leadNurturingAction.create({
      data: {
        leadId,
        userId: session.user.id,
        actionType,
        contentTitle: contentTitle || null,
        contentUrl: contentUrl || null,
        notes: notes || null,
        channel: channel || null,
        response: response || null,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } }
      },
    })

    // Also create an activity record
    await prisma.leadActivity.create({
      data: {
        leadId,
        userId: session.user.id,
        type: 'NOTE',
        title: `Nurturing: ${actionType.replace(/_/g, ' ')}`,
        description: contentTitle || notes || `Shared ${actionType.toLowerCase().replace(/_/g, ' ')}`,
      },
    })

    return NextResponse.json(action)
  } catch (error) {
    console.error('Failed to create nurturing action:', error)
    return NextResponse.json({ error: 'Failed to create nurturing action' }, { status: 500 })
  }
}
