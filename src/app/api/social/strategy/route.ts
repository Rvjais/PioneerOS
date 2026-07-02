import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const strategySchema = z.object({
  client: z.string().min(1),
  audience: z.string().min(1),
  tone: z.string().min(1),
})

export const POST = withAuth(async (req) => {
  try {
    const raw = await req.json()
    const result = strategySchema.safeParse(raw)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.flatten() }, { status: 400 })
    }

    const { client: clientId, audience, tone } = result.data

    const client = await prisma.client.findUnique({ where: { id: clientId } })
    if (!client) {
      return NextResponse.json({ error: 'Client not found. Please select a valid client.' }, { status: 404 })
    }

    // Save as a ClientDeliverable since we don't have a dedicated Social Strategy table
    const deliverable = await prisma.clientDeliverable.create({
      data: {
        clientId: client.id,
        category: 'SOCIAL_STRATEGY',
        workItem: 'Strategy Setup',
        description: `Audience: ${audience}\nTone: ${tone}`,
        month: new Date().toISOString().substring(0, 7), // YYYY-MM
        status: 'COMPLETED' // It's just configuration
      }
    })

    return NextResponse.json({ success: true, deliverable })
  } catch (error) {
    console.error('Failed to create Social Strategy:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
