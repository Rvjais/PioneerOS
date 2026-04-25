import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { generateExitChecklist, createExitNotifications } from '@/server/services/exitAutomation'
import { withAuth } from '@/server/auth/withAuth'

const exitProcessCreateSchema = z.object({
  userId: z.string().min(1, 'User ID is required').max(100),
  type: z.enum(['RESIGNATION', 'TERMINATION', 'RETIREMENT', 'CONTRACT_END', 'LAYOFF']),
  lastWorkingDay: z.string().min(1, 'Last working day is required').refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Invalid last working day date format' }
  ),
  reason: z.string().max(1000, 'Reason must be 1000 characters or less').optional().nullable(),
})

export const GET = withAuth(async (req, { user, params }) => {
  try {
// Only HR and admins can view exit processes
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'HR']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Department-scope MANAGER: only see employees in their own department
    const managerDeptFilter = user.role === 'MANAGER' ? { user: { department: user.department } } : {}

    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    const exitProcesses = await prisma.exitProcess.findMany({
      where: {
        ...(status && { status }),
        ...(userId && { userId }),
        ...managerDeptFilter,
      },
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
        checklist: true,
        settlement: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(exitProcesses)
  } catch (error) {
    console.error('Failed to get exit processes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = withAuth(async (req, { user, params }) => {
  try {
// Only HR and admins can initiate exits
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'HR']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const result = exitProcessCreateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const { userId, type, lastWorkingDay, reason } = result.data

    // Check if user exists and is active
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, empId: true, status: true, role: true, firstName: true, lastName: true, department: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Department-scope MANAGER: can only initiate exits for employees in their own department
    if (user.role === 'MANAGER' && dbUser.department !== user.department) {
      return NextResponse.json({ error: 'Cannot manage employees outside your department' }, { status: 403 })
    }

    // Founders cannot be terminated
    const isFounder = dbUser.empId?.startsWith('RAIN-') && dbUser.role === 'SUPER_ADMIN'
    if (isFounder) {
      return NextResponse.json(
        { error: 'Cannot initiate exit process for a founder' },
        { status: 403 }
      )
    }

    // Check if there's already an active exit process
    const existingExit = await prisma.exitProcess.findFirst({
      where: {
        userId,
        status: { in: ['INITIATED', 'IN_PROGRESS', 'CLEARANCE'] },
      },
    })

    if (existingExit) {
      return NextResponse.json(
        { error: 'An exit process is already in progress for this employee' },
        { status: 400 }
      )
    }

    // Create exit process
    const exitProcess = await prisma.$transaction(async (tx) => {
      const exit = await tx.exitProcess.create({
        data: {
          userId,
          type,
          noticeDate: new Date(),
          lastWorkingDate: new Date(lastWorkingDay),
          reason: reason || null,
          status: 'INITIATED',
        },
      })

      // Update user status to indicate exit in progress
      await tx.user.update({
        where: { id: userId },
        data: { status: 'NOTICE_PERIOD' },
      })

      return exit
    })

    // Auto-generate enhanced checklist
    try {
      await generateExitChecklist(exitProcess.id, userId, dbUser.firstName || 'General')
    } catch {
      // Continue even if checklist generation fails
    }

    // Create notifications for HR, Manager, IT
    try {
      await createExitNotifications(
        exitProcess.id,
        `${dbUser.firstName} ${dbUser.lastName || ''}`.trim(),
        'General'
      )
    } catch {
      // Continue even if notifications fail
    }

    // Return the created exit process with checklist
    const fullExitProcess = await prisma.exitProcess.findUnique({
      where: { id: exitProcess.id },
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
        checklist: true,
      },
    })

    return NextResponse.json(fullExitProcess)
  } catch (error) {
    console.error('Failed to initiate exit process:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
