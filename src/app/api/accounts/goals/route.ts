import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async (req: NextRequest, { user }) => {
  const goals = [
    {
      id: '1',
      title: 'Monthly Collections Target',
      description: 'Collect outstanding invoices from active clients',
      type: 'collections' as const,
      target: 50000,
      current: 32500,
      unit: '$',
      dueDate: '2026-05-31',
      status: 'on_track' as const,
      createdAt: '2026-05-01T10:00:00Z',
    },
    {
      id: '2',
      title: 'Invoice Generation',
      description: 'Generate and send monthly invoices to all active clients',
      type: 'invoices' as const,
      target: 50,
      current: 42,
      unit: 'invoices',
      dueDate: '2026-05-31',
      status: 'at_risk' as const,
      createdAt: '2026-04-15T09:00:00Z',
    },
    {
      id: '3',
      title: 'Payment Follow-up Rate',
      description: 'Reduce overdue invoice percentage through proactive follow-ups',
      type: 'efficiency' as const,
      target: 90,
      current: 85,
      unit: '%',
      dueDate: '2026-06-30',
      status: 'on_track' as const,
      createdAt: '2026-04-01T08:00:00Z',
    },
    {
      id: '4',
      title: 'Client Onboarding',
      description: 'Complete onboarding for new clients this quarter',
      type: 'custom' as const,
      target: 10,
      current: 10,
      unit: 'clients',
      dueDate: '2026-06-30',
      status: 'completed' as const,
      createdAt: '2026-01-01T10:00:00Z',
    },
  ]

  return NextResponse.json({ goals })
})

export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json()
    const { title, description, type, target, unit, dueDate } = body

    if (!title || !type || !target || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields: title, type, target, dueDate' },
        { status: 400 }
      )
    }

    const newGoal = {
      id: Math.random().toString(36).substring(7),
      title,
      description: description || '',
      type: type as 'collections' | 'invoices' | 'efficiency' | 'custom',
      target: Number(target),
      current: 0,
      unit: unit || '',
      dueDate,
      status: 'on_track' as const,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(
      { success: true, goal: newGoal },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})