import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const planSchema = z.object({
  client: z.string().min(1),
  monthlyGoal: z.string().min(1),
})

export const POST = withAuth(async (req) => {
  try {
    const raw = await req.json()
    const result = planSchema.safeParse(raw)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.flatten() }, { status: 400 })
    }

    const { client: clientNameOrId, monthlyGoal } = result.data

    let client = await prisma.client.findUnique({ where: { id: clientNameOrId } }).catch(() => null)
    
    if (!client) {
      client = await prisma.client.findFirst({ where: { name: { contains: clientNameOrId, mode: 'insensitive' } } })
      if (!client) {
        client = await prisma.client.create({ data: { name: clientNameOrId } })
      }
    }

    // Save the plan as a ClientDeliverable
    const deliverable = await prisma.clientDeliverable.create({
      data: {
        clientId: client.id,
        category: 'SEO_PLAN',
        workItem: 'Monthly Goal',
        description: monthlyGoal,
        month: new Date().toISOString().substring(0, 7), // YYYY-MM
        status: 'PENDING'
      }
    })

    return NextResponse.json({ success: true, deliverable })
  } catch (error) {
    console.error('Failed to create SEO Plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
