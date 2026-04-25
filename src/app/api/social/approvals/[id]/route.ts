import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'

// PATCH /api/social/approvals/[id] — Update approval status
export const PATCH = withAuth(async (req, { user, params }) => {
  try {
    const id = params?.id
    if (!id) {
      return NextResponse.json({ error: 'Approval ID is required' }, { status: 400 })
    }

    const body = await req.json()
    const { status, reviewNote } = body

    // Validate status transition
    const validStatuses = ['APPROVED', 'REJECTED', 'REVISION_REQUESTED', 'CANCELLED']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Fetch the existing approval
    const existing = await prisma.contentApproval.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
    }

    // Only PENDING or REVISION_REQUESTED approvals can be updated
    if (!['PENDING', 'REVISION_REQUESTED'].includes(existing.status)) {
      return NextResponse.json(
        { error: `Cannot update approval with status "${existing.status}"` },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: Record<string, any> = {
      status,
      reviewedAt: new Date(),
      reviewedById: user.id,
      reviewNote: reviewNote || null,
    }

    // Increment revision count for revision requests
    if (status === 'REVISION_REQUESTED') {
      updateData.revisionCount = existing.revisionCount + 1

      // Append to revision history
      const existingNotes = existing.revisionNotes
        ? JSON.parse(existing.revisionNotes)
        : []
      existingNotes.push({
        note: reviewNote || '',
        by: `${user.firstName} ${user.lastName}`,
        userId: user.id,
        at: new Date().toISOString(),
      })
      updateData.revisionNotes = JSON.stringify(existingNotes)
    }

    const approval = await prisma.contentApproval.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(approval)
  } catch (error) {
    console.error('[Social Approvals PATCH] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update approval' },
      { status: 500 }
    )
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER'] })
