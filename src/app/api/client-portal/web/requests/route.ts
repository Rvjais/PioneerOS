import { NextRequest, NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'

/**
 * GET /api/client-portal/web/requests
 * Get change requests for the client
 */
export const GET = withClientAuth(async (request, { user }) => {
  const requests = await prisma.webChangeRequest.findMany({
    where: {
      project: { clientId: user.clientId }
    },
    include: {
      project: {
        select: { id: true, projectName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(requests)
}, { requireWebAccess: true, rateLimit: 'READ' })

/**
 * POST /api/client-portal/web/requests
 * Submit a new change request
 */
export const POST = withClientAuth(async (request, { user }) => {
  const body = await request.json()
  const { projectId, type, title, description, referenceUrl, priority } = body

  // Validate required fields
  if (!projectId || !type || !title || !description) {
    return NextResponse.json(
      { error: 'Missing required fields: projectId, type, title, description' },
      { status: 400 }
    )
  }

  // Verify project belongs to client
  const project = await prisma.webProject.findFirst({
    where: {
      id: projectId,
      clientId: user.clientId,
    },
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Calculate estimated cost based on type
  let estimatedCost = 0
  switch (type) {
    case 'MINOR':
      estimatedCost = 0 // Free minor changes
      break
    case 'MAJOR':
      estimatedCost = 5000 // Base cost for major changes
      break
    case 'FEATURE':
      estimatedCost = 15000 // Base cost for new features
      break
  }

  const changeRequest = await prisma.webChangeRequest.create({
    data: {
      projectId,
      clientUserId: user.id,
      type,
      title,
      description,
      pageUrl: referenceUrl || null,
      estimatedCost,
      status: 'PENDING',
      requiresApproval: type !== 'MINOR',
    },
    include: {
      project: {
        select: { id: true, projectName: true },
      },
    },
  })

  return NextResponse.json(changeRequest, { status: 201 })
}, { requireWebAccess: true, rateLimit: 'WRITE' })

/**
 * PATCH /api/client-portal/web/requests
 * Approve/reject change request (for billable requests)
 */
export const PATCH = withClientAuth(async (request, { user }) => {
  const body = await request.json()
  const { id, action } = body

  if (!id || !action) {
    return NextResponse.json({ error: 'Missing required fields: id, action' }, { status: 400 })
  }

  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  // Verify request belongs to client
  const existingRequest = await prisma.webChangeRequest.findFirst({
    where: {
      id,
      project: { clientId: user.clientId },
    },
  })

  if (!existingRequest) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  if (existingRequest.status !== 'ESTIMATED') {
    return NextResponse.json({ error: 'Request is not pending approval' }, { status: 400 })
  }

  const changeRequest = await prisma.webChangeRequest.update({
    where: { id },
    data: {
      clientApprovedAt: action === 'approve' ? new Date() : null,
      rejectionReason: action === 'reject' ? 'Client rejected' : null,
      status: action === 'approve' ? 'CLIENT_APPROVED' : 'REJECTED',
    },
    include: {
      project: {
        select: { id: true, projectName: true },
      },
    },
  })

  return NextResponse.json(changeRequest)
}, { requireWebAccess: true, requiredRole: 'PRIMARY', rateLimit: 'WRITE' })
