import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { notifyLeaveStatus } from '@/server/notifications'
import { HR_ROLES } from '@/shared/constants/roles'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const leaveActionSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'], { message: 'Status must be APPROVED or REJECTED' }),
  rejectionReason: z.string().max(500, 'Rejection reason must be 500 characters or less').optional(),
}).refine((data) => {
  if (data.status === 'REJECTED' && !data.rejectionReason) {
    return true // rejection reason is optional but encouraged
  }
  return true
})

// GET: Fetch single leave request
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
          }
        }
      }
    })

    if (!leaveRequest) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }

    // Authorization: users can only view their own leave, HR/Managers can view all
    const isSelf = leaveRequest.userId === user.id
    if (!isSelf) {
      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true, department: true }
      })
      const isAdmin = currentUser &&
        (HR_ROLES.includes(currentUser.role ?? '') || currentUser.department === 'HR')
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      // Department-scope MANAGER: can only view leave for employees in their own department
      if (currentUser?.role === 'MANAGER' && currentUser.department !== 'HR') {
        if (leaveRequest.user.department !== currentUser.department) {
          return NextResponse.json({ error: 'Cannot manage employees outside your department' }, { status: 403 })
        }
      }
    }

    return NextResponse.json({ leaveRequest })
  } catch (error) {
    console.error('Error fetching leave request:', error)
    return NextResponse.json({ error: 'Failed to fetch leave request' }, { status: 500 })
  }
})

// PATCH: Update leave request (approve/reject)
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // Only HR and Managers can approve/reject
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true, department: true }
    })

    if (!dbUser || (!HR_ROLES.includes(dbUser.role) && dbUser.department !== 'HR')) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { id } = await routeParams!

    // Fetch leave request early to check for self-approval
    const leaveRequestCheck = await prisma.leaveRequest.findUnique({
      where: { id },
      select: { userId: true },
    })

    // Department-scope MANAGER: can only manage employees in their own department
    if (dbUser.role === 'MANAGER' && dbUser.department !== 'HR' && leaveRequestCheck) {
      const targetEmployee = await prisma.user.findUnique({
        where: { id: leaveRequestCheck.userId },
        select: { department: true },
      })
      if (targetEmployee?.department !== dbUser.department) {
        return NextResponse.json({ error: 'Cannot manage employees outside your department' }, { status: 403 })
      }
    }

    if (!leaveRequestCheck) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }

    // Prevent self-approval/rejection
    if (user.id === leaveRequestCheck.userId) {
      return NextResponse.json({ error: 'Cannot approve your own leave request' }, { status: 403 })
    }

    const body = await req.json()
    const validation = leaveActionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      }, { status: 400 })
    }
    const { status, rejectionReason } = validation.data

    // Use transaction for data consistency - all checks and updates are atomic
    const result = await prisma.$transaction(async (tx) => {
      // Fetch leave request inside transaction to prevent race conditions
      const leaveRequest = await tx.leaveRequest.findUnique({
        where: { id },
        include: { user: true }
      })

      if (!leaveRequest) {
        throw new Error('LEAVE_NOT_FOUND')
      }

      // Prevent processing already processed requests (inside transaction)
      if (leaveRequest.status !== 'PENDING') {
        throw new Error(`ALREADY_PROCESSED:${leaveRequest.status.toLowerCase()}`)
      }

      // Calculate days for this leave request
      const days = Math.ceil(
        (new Date(leaveRequest.endDate).getTime() - new Date(leaveRequest.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
      ) + 1

      const currentYear = new Date(leaveRequest.startDate).getFullYear()

      // If approving, validate and update leave balance
      if (status === 'APPROVED') {
        // Check if balance exists
        const balance = await tx.leaveBalance.findUnique({
          where: {
            userId_year_type: {
              userId: leaveRequest.userId,
              year: currentYear,
              type: leaveRequest.type,
            }
          }
        })

        if (!balance) {
          throw new Error(`No ${leaveRequest.type} leave balance found for this year`)
        }

        if (balance.remaining < days) {
          throw new Error(`Insufficient ${leaveRequest.type} balance. Available: ${balance.remaining} days, Requested: ${days} days`)
        }

        // Deduct from balance atomically
        await tx.leaveBalance.update({
          where: {
            userId_year_type: {
              userId: leaveRequest.userId,
              year: currentYear,
              type: leaveRequest.type,
            }
          },
          data: {
            used: { increment: days },
            remaining: { decrement: days },
          }
        })
      }

      // Auto-create attendance records for approved leave dates
      if (status === 'APPROVED') {
        const start = new Date(leaveRequest.startDate)
        const end = new Date(leaveRequest.endDate)
        const attendanceRecords: { userId: string; date: Date; status: string; sourceType: string; notes: string }[] = []

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate())
          attendanceRecords.push({
            userId: leaveRequest.userId,
            date: dateOnly,
            status: leaveRequest.type === 'WFH' ? 'WORK_FROM_HOME' : 'LEAVE',
            sourceType: 'LEAVE_REQUEST',
            notes: `Auto-marked: ${leaveRequest.type} leave (${leaveRequest.reason || 'No reason'})`,
          })
        }

        // Upsert attendance for each date (don't overwrite if already marked)
        for (const record of attendanceRecords) {
          const existing = await tx.attendance.findFirst({
            where: { userId: record.userId, date: record.date },
          })
          if (!existing) {
            await tx.attendance.create({ data: record })
          } else if (existing.status === 'ABSENT') {
            // Override ABSENT with LEAVE status
            await tx.attendance.update({
              where: { id: existing.id },
              data: { status: record.status, sourceType: 'LEAVE_REQUEST', notes: record.notes },
            })
          }
        }
      }

      // Update leave request
      const updatedRequest = await tx.leaveRequest.update({
        where: { id },
        data: {
          status,
          rejectionReason: status === 'REJECTED' ? rejectionReason : null,
          approvedBy: status === 'APPROVED' ? user.id : null,
          approvedAt: status === 'APPROVED' ? new Date() : null,
          reason: leaveRequest.reason,
        }
      })

      return { updatedRequest, leaveRequest }
    })

    const { updatedRequest, leaveRequest } = result

    // Notify user
    await prisma.notification.create({
      data: {
        userId: leaveRequest.userId,
        type: status === 'APPROVED' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
        title: status === 'APPROVED' ? 'Leave Approved' : 'Leave Rejected',
        message: status === 'APPROVED'
          ? `Your ${leaveRequest.type} leave request has been approved.`
          : `Your ${leaveRequest.type} leave request has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
        link: '/hr/leave'
      }
    })

    // Send WhatsApp/in-app notification via notification service
    const dates = `${new Date(leaveRequest.startDate).toLocaleDateString('en-IN')} - ${new Date(leaveRequest.endDate).toLocaleDateString('en-IN')}`
    try {
      await notifyLeaveStatus(
        leaveRequest.userId,
        leaveRequest.type,
        status === 'APPROVED',
        dates,
        status === 'REJECTED' ? rejectionReason : undefined
      )
    } catch (notifyError) {
      console.error('Failed to send leave status notification:', notifyError)
      // Don't fail the request if notification fails
    }

    return NextResponse.json({ leaveRequest: updatedRequest })
  } catch (error) {
    console.error('Error updating leave request:', error)
    const message = error instanceof Error ? error.message : 'Failed to update leave request'

    // Handle specific error cases
    if (message === 'LEAVE_NOT_FOUND') {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }
    if (message.startsWith('ALREADY_PROCESSED:')) {
      const status = message.split(':')[1]
      return NextResponse.json({ error: `Leave request already ${status}` }, { status: 400 })
    }
    // Check if it's a business logic error (insufficient balance, etc.)
    if (message.includes('Insufficient') || message.includes('No ') || message.includes('balance')) {
      return NextResponse.json({ error: message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update leave request' }, { status: 500 })
  }
})
