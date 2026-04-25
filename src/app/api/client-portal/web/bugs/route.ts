import { NextRequest, NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'

/**
 * GET /api/client-portal/web/bugs
 * Get bug reports for the client
 */
export const GET = withClientAuth(async (request, { user }) => {
  const bugs = await prisma.webBugReport.findMany({
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

  return NextResponse.json(bugs)
}, { requireWebAccess: true, rateLimit: 'READ' })

/**
 * POST /api/client-portal/web/bugs
 * Submit a new bug report
 */
export const POST = withClientAuth(async (request, { user }) => {
  const body = await request.json()
  const { projectId, pageUrl, title, description, browser, device, screenshotUrl, priority } = body

  // Validate required fields
  if (!projectId || !title || !description) {
    return NextResponse.json(
      { error: 'Missing required fields: projectId, title, description' },
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

  const bug = await prisma.webBugReport.create({
    data: {
      projectId,
      clientUserId: user.id,
      pageUrl: pageUrl || null,
      title,
      description,
      browserInfo: browser ? `${browser} / ${device || 'Unknown'}` : null,
      screenshotUrl: screenshotUrl || null,
      priority: priority || 'MEDIUM',
      status: 'OPEN',
    },
    include: {
      project: {
        select: { id: true, projectName: true },
      },
    },
  })

  return NextResponse.json(bug, { status: 201 })
}, { requireWebAccess: true, rateLimit: 'WRITE' })
