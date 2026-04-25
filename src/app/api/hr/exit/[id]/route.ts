import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { generateExitChecklist, createExitNotifications, checkAndAdvanceExitStatus } from '@/server/services/exitAutomation'
import { withAuth } from '@/server/auth/withAuth'

const ALLOWED_ROLES = ['SUPER_ADMIN', 'MANAGER', 'HR']

// GET: Fetch single exit process with full details
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    if (!ALLOWED_ROLES.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await routeParams!

    const exitProcess = await prisma.exitProcess.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            empId: true,
            firstName: true,
            lastName: true,
            department: true,
            email: true,
          },
        },
        checklist: { orderBy: [{ category: 'asc' }, { createdAt: 'asc' }] },
        settlement: true,
      },
    })

    if (!exitProcess) {
      return NextResponse.json({ error: 'Exit process not found' }, { status: 404 })
    }

    // Department-scope MANAGER: can only view exit processes for employees in their own department
    if (user.role === 'MANAGER' && exitProcess.user.department !== user.department) {
      return NextResponse.json({ error: 'Cannot manage employees outside your department' }, { status: 403 })
    }

    return NextResponse.json({ exitProcess })
  } catch (error) {
    console.error('Error fetching exit process:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PATCH: Update exit process status and trigger automations
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    if (!ALLOWED_ROLES.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await routeParams!
    const body = await req.json()
    const { status, exitInterviewNotes, lastWorkingDate, exitDate } = body

    const exitProcess = await prisma.exitProcess.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, department: true } },
        checklist: true,
      },
    })

    if (!exitProcess) {
      return NextResponse.json({ error: 'Exit process not found' }, { status: 404 })
    }

    // Department-scope MANAGER: can only update exit processes for employees in their own department
    if (user.role === 'MANAGER' && exitProcess.user.department !== user.department) {
      return NextResponse.json({ error: 'Cannot manage employees outside your department' }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {}

    if (status) updateData.status = status
    if (exitInterviewNotes) updateData.exitInterviewNotes = exitInterviewNotes
    if (lastWorkingDate) updateData.lastWorkingDate = new Date(lastWorkingDate)
    if (exitDate) updateData.exitDate = new Date(exitDate)

    const updated = await prisma.exitProcess.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            empId: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
        checklist: { orderBy: [{ category: 'asc' }, { createdAt: 'asc' }] },
        settlement: true,
      },
    })

    // When exit process is moved to INITIATED and has no checklist, auto-generate
    if (status === 'INITIATED' && exitProcess.checklist.length === 0) {
      try {
        await generateExitChecklist(
          id,
          exitProcess.userId,
          exitProcess.user.department || 'General'
        )
        await createExitNotifications(
          id,
          `${exitProcess.user.firstName} ${exitProcess.user.lastName || ''}`.trim(),
          exitProcess.user.department || 'General'
        )
      } catch {
        // Checklist may already exist, continue
      }
    }

    // Check if all checklist items are completed to auto-advance
    if (status !== 'COMPLETED') {
      await checkAndAdvanceExitStatus(id)
    }

    // When exit is marked COMPLETED, deactivate the user account
    if (status === 'COMPLETED') {
      const userId = exitProcess.userId

      // Deactivate user account
      await prisma.user.update({
        where: { id: userId },
        data: {
          status: 'INACTIVE',
          deactivatedAt: new Date(),
        },
      }).catch(() => { /* user may already be deactivated */ })

      // Notify HR and the employee
      const hrUsers = await prisma.user.findMany({
        where: { OR: [{ role: 'HR' }, { role: 'SUPER_ADMIN' }], status: 'ACTIVE', deletedAt: null },
        select: { id: true },
      })

      for (const hr of hrUsers) {
        await prisma.notification.create({
          data: {
            userId: hr.id,
            type: 'EXIT_COMPLETED',
            title: 'Exit Process Completed',
            message: `Exit process has been completed for ${exitProcess.user.firstName} ${exitProcess.user.lastName}. Account has been deactivated.`,
            link: '/hr/exit',
            priority: 'HIGH',
          },
        })
      }
    }

    return NextResponse.json({ exitProcess: updated })
  } catch (error) {
    console.error('Error updating exit process:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
