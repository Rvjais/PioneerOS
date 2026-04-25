import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'

// GET /api/social/approvals — List content approvals with filters
export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const clientId = searchParams.get('clientId')
    const priority = searchParams.get('priority')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const skip = (page - 1) * limit

    const where: Record<string, any> = {}

    // Scope to user's assigned clients unless admin/manager
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MANAGER'
    if (!isSuperAdmin) {
      const assignedClientIds = (
        await prisma.clientTeamMember.findMany({
          where: { userId: user.id },
          select: { clientId: true },
        })
      ).map((c) => c.clientId)
      where.clientId = { in: assignedClientIds }
    }

    if (status) where.status = status
    if (type) where.type = type
    if (clientId) where.clientId = clientId
    if (priority) where.priority = priority

    const [approvals, total] = await Promise.all([
      prisma.contentApproval.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, logoUrl: true } },
          reviewedBy: { select: { id: true, name: true } },
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.contentApproval.count({ where }),
    ])

    return NextResponse.json({
      approvals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[Social Approvals GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch approvals' },
      { status: 500 }
    )
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'EMPLOYEE', 'INTERN'] })

// POST /api/social/approvals — Create a new content approval request
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()

    const {
      clientId,
      title,
      description,
      type,
      contentUrl,
      previewUrl,
      attachments,
      priority,
      dueDate,
    } = body

    if (!clientId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, title' },
        { status: 400 }
      )
    }

    // Verify user has access to this client (unless admin)
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MANAGER'
    if (!isSuperAdmin) {
      const assignment = await prisma.clientTeamMember.findUnique({
        where: { clientId_userId: { clientId, userId: user.id } },
      })
      if (!assignment) {
        return NextResponse.json(
          { error: 'You are not assigned to this client' },
          { status: 403 }
        )
      }
    }

    const approval = await prisma.contentApproval.create({
      data: {
        clientId,
        title,
        description: description || null,
        type: type || 'CONTENT',
        contentUrl: contentUrl || null,
        previewUrl: previewUrl || null,
        attachments: attachments ? JSON.stringify(attachments) : null,
        priority: priority || 'NORMAL',
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById: user.id,
        status: 'PENDING',
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(approval, { status: 201 })
  } catch (error) {
    console.error('[Social Approvals POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create approval request' },
      { status: 500 }
    )
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'EMPLOYEE', 'INTERN'] })
