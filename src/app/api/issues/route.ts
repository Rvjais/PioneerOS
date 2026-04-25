import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { generateIssueNumber } from '@/server/db/sequence'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createIssueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().min(1, 'Description is required').max(10000),
  type: z.enum(['BUG', 'REQUEST', 'COMPLAINT', 'FEEDBACK']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  clientId: z.string().min(1, 'Client ID is required').max(100),
  clientUserId: z.string().max(100).optional(),
})

// GET - List all issues
export const GET = withAuth(async (req, { user, params }) => {
  try {
// SECURITY FIX: Only support staff, managers, and admins can view all issues
    const canViewAll = ['SUPER_ADMIN', 'MANAGER', 'SALES', 'ACCOUNTS'].includes(user.role || '')

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const clientId = searchParams.get('clientId')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (priority) where.priority = priority
    if (clientId) where.clientId = clientId

    // Non-privileged users can only see issues assigned to them
    if (!canViewAll) {
      where.assignedToId = user.id
    }

    // Query from SupportTicket model (matches POST and detail routes)
    const issues = await prisma.supportTicket.findMany({
      where,
      include: {
        client: {
          select: { id: true, name: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ issues })
  } catch (error) {
    console.error('Error fetching issues:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST - Create new issue
export const POST = withAuth(async (req, { user, params }) => {
  try {
// SECURITY FIX: Only support staff and managers can create issues
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES', 'ACCOUNTS']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Issue creation requires support access' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = createIssueSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { title, description, type, priority, clientId, clientUserId } = parsed.data

    // Generate ticket number atomically (prevents race conditions)
    const ticketNumber = await generateIssueNumber()

    const issue = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        title,
        description,
        type: type || 'REQUEST',
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        clientId,
        clientUserId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Create activity log
    await prisma.ticketActivity.create({
      data: {
        ticketId: issue.id,
        type: 'CREATED',
        description: 'Issue created',
        userId: user.id,
      },
    })

    return NextResponse.json({ issue }, { status: 201 })
  } catch (error) {
    console.error('Error creating issue:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
