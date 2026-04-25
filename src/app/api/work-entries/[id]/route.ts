import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// Mapping from WorkEntry category to ClientScope category
const CATEGORY_MAPPING: Record<string, string> = {
  SOCIAL: 'SOCIAL',
  SEO: 'SEO',
  ADS: 'ADS',
  WEB: 'WEB',
  DESIGN: 'DESIGN',
  VIDEO: 'VIDEO',
}

// Sync WorkEntry approval to ClientScope delivered count
async function syncWorkEntryToClientScope(workEntry: {
  clientId: string | null
  category: string
  deliverableType: string
  quantity: number
  date: Date
}) {
  if (!workEntry.clientId) return

  // Map work entry category to client scope category
  const scopeCategory = CATEGORY_MAPPING[workEntry.category] || workEntry.category

  // Get the month start for the work entry date
  const entryDate = new Date(workEntry.date)
  const monthStart = new Date(entryDate.getFullYear(), entryDate.getMonth(), 1)

  // Find existing ClientScope for this client, category, and month
  const existingScope = await prisma.clientScope.findFirst({
    where: {
      clientId: workEntry.clientId,
      category: scopeCategory,
      item: workEntry.deliverableType,
      month: monthStart,
    },
  })

  if (existingScope) {
    // Update delivered count
    const newDelivered = existingScope.delivered + workEntry.quantity
    const newStatus = newDelivered >= existingScope.quantity
      ? 'OVER_DELIVERY'
      : newDelivered >= existingScope.quantity * 0.8
        ? 'ON_TRACK'
        : 'UNDER_DELIVERY'

    await prisma.clientScope.update({
      where: { id: existingScope.id },
      data: {
        delivered: newDelivered,
        status: newStatus,
      },
    })
  } else {
    // Create new ClientScope entry (auto-track even if not pre-defined)
    await prisma.clientScope.create({
      data: {
        clientId: workEntry.clientId,
        category: scopeCategory,
        item: workEntry.deliverableType,
        quantity: 0, // No target set, but track delivered
        delivered: workEntry.quantity,
        month: monthStart,
        status: 'ON_TRACK',
      },
    })
  }
}

// GET: Fetch single work entry
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!

    const entry = await prisma.workEntry.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, department: true } },
        client: { select: { id: true, name: true } },
        files: true,
      },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Work entry not found' }, { status: 404 })
    }

    // Check access - own entries or manager/admin
    if (entry.userId !== user.id && !['SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Error fetching work entry:', error)
    return NextResponse.json({ error: 'Failed to fetch work entry' }, { status: 500 })
  }
})

// PATCH: Update work entry
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!

    const existing = await prisma.workEntry.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Work entry not found' }, { status: 404 })
    }

    // Only owner can edit draft entries
    // Managers can approve/reject
    const isOwner = existing.userId === user.id
    const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user.role)

    if (!isOwner && !isManager) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    // Build update data based on user role
    const updateData: Record<string, unknown> = {}

    // Owner can update these fields (only if draft)
    if (isOwner && existing.status === 'DRAFT') {
      const {
        clientId,
        category,
        deliverableType,
        quantity,
        metrics,
        resultSummary,
        resultMetrics,
        hoursSpent,
        description,
        notes,
        // Design/Creative-specific KPIs
        qualityScore,
        revisionCount,
        turnaroundHours,
        deliverableUrl,
      } = body

      if (clientId !== undefined) updateData.clientId = clientId
      if (category) updateData.category = category
      if (deliverableType) updateData.deliverableType = deliverableType
      if (quantity !== undefined) updateData.quantity = quantity
      if (metrics !== undefined) updateData.metrics = metrics ? JSON.stringify(metrics) : null
      if (resultSummary !== undefined) updateData.resultSummary = resultSummary
      if (resultMetrics !== undefined) updateData.resultMetrics = resultMetrics ? JSON.stringify(resultMetrics) : null
      if (hoursSpent !== undefined) updateData.hoursSpent = hoursSpent
      if (description !== undefined) updateData.description = description
      if (notes !== undefined) updateData.notes = notes
      // Design/Creative-specific KPIs
      if (qualityScore !== undefined) updateData.qualityScore = qualityScore
      if (revisionCount !== undefined) updateData.revisionCount = revisionCount
      if (turnaroundHours !== undefined) updateData.turnaroundHours = turnaroundHours
      if (deliverableUrl !== undefined) updateData.deliverableUrl = deliverableUrl
    }

    // Owner can submit
    if (isOwner && body.action === 'submit' && existing.status === 'DRAFT') {
      updateData.status = 'SUBMITTED'
      updateData.submittedAt = new Date()
    }

    // Manager can approve/reject
    if (isManager && existing.status === 'SUBMITTED') {
      if (body.action === 'approve') {
        updateData.status = 'APPROVED'
        updateData.approvedBy = user.id
        updateData.approvedAt = new Date()
      } else if (body.action === 'reject') {
        updateData.status = 'REJECTED'
        updateData.rejectionNote = body.rejectionNote || null
      }
    }

    const entry = await prisma.workEntry.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true } },
        files: true,
      },
    })

    // Auto-sync with ClientScope when work entry is approved
    if (body.action === 'approve' && existing.clientId) {
      await syncWorkEntryToClientScope(existing)
    }

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Error updating work entry:', error)
    return NextResponse.json({ error: 'Failed to update work entry' }, { status: 500 })
  }
})

// DELETE: Delete work entry
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!

    const existing = await prisma.workEntry.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Work entry not found' }, { status: 404 })
    }

    // Only owner can delete draft entries
    // Admins can delete any
    const isOwner = existing.userId === user.id
    const isAdmin = user.role === 'SUPER_ADMIN'

    if (!isAdmin && (!isOwner || existing.status !== 'DRAFT')) {
      return NextResponse.json({ error: 'Cannot delete this entry' }, { status: 403 })
    }

    await prisma.workEntry.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting work entry:', error)
    return NextResponse.json({ error: 'Failed to delete work entry' }, { status: 500 })
  }
})
