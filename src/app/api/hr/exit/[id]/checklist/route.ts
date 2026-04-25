import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { generateExitChecklist, checkAndAdvanceExitStatus } from '@/server/services/exitAutomation'
import { withAuth } from '@/server/auth/withAuth'

const ALLOWED_ROLES = ['SUPER_ADMIN', 'MANAGER', 'HR']

// GET: Fetch all checklist items for an exit process
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    if (!ALLOWED_ROLES.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await routeParams!

    const exitProcess = await prisma.exitProcess.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!exitProcess) {
      return NextResponse.json({ error: 'Exit process not found' }, { status: 404 })
    }

    const checklist = await prisma.exitChecklist.findMany({
      where: { exitProcessId: id },
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
    })

    // Group by category
    const grouped: Record<string, typeof checklist> = {}
    for (const item of checklist) {
      if (!grouped[item.category]) grouped[item.category] = []
      grouped[item.category].push(item)
    }

    // Calculate progress
    const total = checklist.length
    const completed = checklist.filter((c) => c.status === 'COMPLETED').length
    const inProgress = checklist.filter((c) => c.status === 'IN_PROGRESS').length
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0

    return NextResponse.json({
      checklist,
      grouped,
      stats: { total, completed, inProgress, pending: total - completed - inProgress, progress },
    })
  } catch (error) {
    console.error('Error fetching exit checklist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST: Auto-generate checklist for an exit process
export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    if (!ALLOWED_ROLES.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await routeParams!

    const exitProcess = await prisma.exitProcess.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, department: true } },
      },
    })

    if (!exitProcess) {
      return NextResponse.json({ error: 'Exit process not found' }, { status: 404 })
    }

    const checklist = await generateExitChecklist(
      id,
      exitProcess.userId,
      exitProcess.user.department || 'General'
    )

    return NextResponse.json({ checklist, message: 'Checklist generated successfully' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message.includes('already exists') ? 400 : 500
    console.error('Error generating exit checklist:', error)
    return NextResponse.json({ error: message }, { status })
  }
})

// PATCH: Update individual checklist item status
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    if (!ALLOWED_ROLES.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: exitProcessId } = await routeParams!
    const body = await req.json()
    const { checklistItemId, status, notes } = body

    if (!checklistItemId || !status) {
      return NextResponse.json(
        { error: 'checklistItemId and status are required' },
        { status: 400 }
      )
    }

    if (!['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be PENDING, IN_PROGRESS, or COMPLETED' },
        { status: 400 }
      )
    }

    // Verify the checklist item belongs to this exit process
    const checklistItem = await prisma.exitChecklist.findFirst({
      where: { id: checklistItemId, exitProcessId },
    })

    if (!checklistItem) {
      return NextResponse.json({ error: 'Checklist item not found' }, { status: 404 })
    }

    // Update the checklist item
    const updated = await prisma.exitChecklist.update({
      where: { id: checklistItemId },
      data: {
        status,
        isCompleted: status === 'COMPLETED',
        completedAt: status === 'COMPLETED' ? new Date() : null,
        completedBy: status === 'COMPLETED' ? user.id : null,
        ...(notes !== undefined && { notes }),
      },
    })

    // Check if all items are completed to auto-advance exit status
    await checkAndAdvanceExitStatus(exitProcessId)

    return NextResponse.json({ item: updated, message: 'Checklist item updated' })
  } catch (error) {
    console.error('Error updating checklist item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
