import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const createGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['collections', 'invoices', 'efficiency', 'custom']),
  target: z.number().positive(),
  unit: z.string().optional(),
  dueDate: z.string().min(1),
})

export const GET = withAuth(async (req: NextRequest, { user }) => {
  const goals = await prisma.goal.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  const mapped = goals.map(g => ({
    id: g.id,
    title: g.title,
    description: g.description || '',
    type: (g.category || 'custom') as 'collections' | 'invoices' | 'efficiency' | 'custom',
    target: g.targetValue || 0,
    current: g.currentValue,
    unit: g.unit || '',
    dueDate: g.targetDate?.toISOString().split('T')[0] || null,
    status: g.status.toLowerCase().replace('_', '_') as 'on_track' | 'at_risk' | 'completed' | 'not_started',
    createdAt: g.createdAt.toISOString(),
  }))

  return NextResponse.json({ goals: mapped })
})

export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json()
    const parsed = createGoalSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { title, description, type, target, unit, dueDate } = parsed.data

    const goal = await prisma.goal.create({
      data: {
        ownerId: user.id,
        createdBy: user.id,
        title,
        description: description || '',
        category: type,
        targetValue: target,
        currentValue: 0,
        unit: unit || '',
        targetDate: new Date(dueDate),
        status: 'ON_TRACK',
        level: 'INDIVIDUAL',
      },
    })

    return NextResponse.json({
      success: true,
      goal: {
        id: goal.id,
        title: goal.title,
        description: goal.description || '',
        type: (goal.category || 'custom') as 'collections' | 'invoices' | 'efficiency' | 'custom',
        target: goal.targetValue || 0,
        current: goal.currentValue,
        unit: goal.unit || '',
        dueDate: goal.targetDate?.toISOString().split('T')[0] || null,
        status: 'on_track',
        createdAt: goal.createdAt.toISOString(),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
