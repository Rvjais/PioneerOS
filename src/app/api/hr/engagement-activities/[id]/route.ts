import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// PATCH: Update activity (approve, reject, complete, etc.)
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!
    const body = await req.json()

    const {
      title,
      description,
      type,
      scheduledDate,
      endDate,
      location,
      estimatedBudget,
      actualSpent,
      targetAudience,
      department,
      expectedCount,
      actualCount,
      status,
      rejectionReason,
      photos,
      feedback
    } = body

    const updateData: Record<string, unknown> = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (type !== undefined) updateData.type = type
    if (scheduledDate !== undefined) updateData.scheduledDate = new Date(scheduledDate)
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null
    if (location !== undefined) updateData.location = location
    if (estimatedBudget !== undefined) updateData.estimatedBudget = estimatedBudget
    if (actualSpent !== undefined) updateData.actualSpent = actualSpent
    if (targetAudience !== undefined) updateData.targetAudience = targetAudience
    if (department !== undefined) updateData.department = department
    if (expectedCount !== undefined) updateData.expectedCount = expectedCount
    if (actualCount !== undefined) updateData.actualCount = actualCount
    if (photos !== undefined) updateData.photos = JSON.stringify(photos)
    if (feedback !== undefined) updateData.feedback = JSON.stringify(feedback)

    // Handle status changes with approval logic
    if (status) {
      updateData.status = status

      if (status === 'APPROVED') {
        // Only SUPER_ADMIN can approve budget
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true }
        })

        if (dbUser?.role !== 'SUPER_ADMIN') {
          return NextResponse.json({ error: 'Only founders can approve activities with budget' }, { status: 403 })
        }

        updateData.approvedBy = user.id
        updateData.approvedAt = new Date()
        updateData.budgetApproved = true
      }

      if (status === 'REJECTED') {
        updateData.rejectionReason = rejectionReason
      }
    }

    const activity = await prisma.engagementActivity.update({
      where: { id },
      data: updateData,
      include: {
        organizer: true,
        approver: true
      }
    })

    // Notify organizer of approval/rejection
    if (status === 'APPROVED' || status === 'REJECTED') {
      await prisma.notification.create({
        data: {
          userId: activity.organizedBy,
          type: 'ACTIVITY_STATUS',
          title: status === 'APPROVED' ? 'Activity Approved!' : 'Activity Rejected',
          message: status === 'APPROVED'
            ? `Your activity "${activity.title}" has been approved!`
            : `Your activity "${activity.title}" was rejected. Reason: ${rejectionReason}`,
          link: `/hr/engagement-activities/${activity.id}`
        }
      })
    }

    return NextResponse.json({ activity })
  } catch (error) {
    console.error('Error updating engagement activity:', error)
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 })
  }
})

// DELETE: Cancel activity
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!

    // Only organizer or SUPER_ADMIN can cancel
    const activity = await prisma.engagementActivity.findUnique({
      where: { id }
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (activity.organizedBy !== user.id && dbUser?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Not authorized to cancel this activity' }, { status: 403 })
    }

    // Mark as cancelled instead of deleting
    await prisma.engagementActivity.update({
      where: { id },
      data: { status: 'CANCELLED' }
    })

    return NextResponse.json({ message: 'Activity cancelled' })
  } catch (error) {
    console.error('Error cancelling engagement activity:', error)
    return NextResponse.json({ error: 'Failed to cancel activity' }, { status: 500 })
  }
})
