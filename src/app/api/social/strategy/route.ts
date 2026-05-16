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

    const { client: clientNameOrId, audience, tone } = result.data

    let client = await prisma.client.findUnique({ where: { id: clientNameOrId } }).catch(() => null)
    
    if (!client) {
      client = await prisma.client.findFirst({ where: { name: { contains: clientNameOrId, mode: 'insensitive' } } })
      if (!client) {
        client = await prisma.client.create({ data: { name: clientNameOrId } })
      }
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
