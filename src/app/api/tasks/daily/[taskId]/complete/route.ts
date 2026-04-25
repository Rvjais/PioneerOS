import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'

// Compare dates using UTC to avoid timezone issues
function isSameUTCDate(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  )
}

export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { taskId } = await routeParams!
    const body = await req.json()
    const { actualHours, isBreakdown: manualBreakdown, breakdownReason, rateTask, deliverable, proofUrl, clientVisible, accountsTaskType } = body

    // Get the task and verify ownership
    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId },
      include: {
        plan: { select: { id: true, userId: true, date: true } },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.plan.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (task.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: 'Task must be in progress to complete' }, { status: 400 })
    }

    const now = new Date()
    const taskDate = new Date(task.plan.date)
    // Auto-detect breakdown if completing on different day (using UTC to avoid timezone issues)
    const autoBreakdown = !isSameUTCDate(now, taskDate)
    const isBreakdown = manualBreakdown || autoBreakdown

    // Breakthrough = completed same day as started (not just plan date)
    const startedDate = task.startedAt ? new Date(task.startedAt) : null
    const isBreakthrough = !isBreakdown && startedDate && isSameUTCDate(startedDate, now)

    // Determine breakdown reason
    let finalBreakdownReason: string | null = null
    if (isBreakdown) {
      if (breakdownReason) {
        finalBreakdownReason = breakdownReason
      } else if (autoBreakdown) {
        finalBreakdownReason = 'DELAYED' // Auto-detected - completed on different day
      }
    }

    // Calculate actual hours from start/end time if not provided
    let calculatedHours = actualHours
    if (!calculatedHours && task.startedAt) {
      const startTime = new Date(task.startedAt)
      const durationMs = now.getTime() - startTime.getTime()
      const durationHours = durationMs / (1000 * 60 * 60)
      // Round to nearest 0.25 hour
      calculatedHours = Math.round(durationHours * 4) / 4
      // Minimum 0.25 hours
      if (calculatedHours < 0.25) calculatedHours = 0.25
    }

    // Complete the task
    const updatedTask = await prisma.dailyTask.update({
      where: { id: taskId },
      data: {
        status: isBreakdown ? 'BREAKDOWN' : 'COMPLETED',
        completedAt: now,
        actualEndTime: now,
        actualHours: calculatedHours || task.plannedHours,
        isBreakdown,
        isBreakthrough: isBreakthrough || false,
        breakdownReason: finalBreakdownReason,
        rateTask: rateTask || null,
        deliverable: deliverable || null,
        proofUrl: proofUrl || null,
        clientVisible: clientVisible || false,
      },
      include: {
        client: { select: { id: true, name: true } },
        allocatedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    // If marked as client visible and has a client, create a WorkEntry for client portal
    if (clientVisible && task.clientId && !isBreakdown) {
      try {
        // Calculate date fields for WorkEntry
        const workDate = new Date(task.plan.date)
        const year = workDate.getFullYear()
        const month = workDate.getMonth() + 1 // 1-12
        // Calculate ISO week number
        const startOfYear = new Date(year, 0, 1)
        const days = Math.floor((workDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
        const week = Math.ceil((days + startOfYear.getDay() + 1) / 7)

        const workEntry = await prisma.workEntry.create({
          data: {
            clientId: task.clientId,
            userId: user.id,
            date: workDate,
            year,
            month,
            week,
            category: task.activityType?.toUpperCase().replace(/\s+/g, '_') || 'OTHER',
            deliverableType: task.activityType || 'Task',
            description: task.description,
            quantity: 1,
            hoursSpent: calculatedHours || task.plannedHours,
            deliverableUrl: proofUrl || null,
            status: 'SUBMITTED', // Needs manager approval before client sees it
            submittedAt: now,
          },
        })

        // Link the WorkEntry to the DailyTask
        await prisma.dailyTask.update({
          where: { id: taskId },
          data: { workEntryId: workEntry.id },
        })
      } catch (workEntryError) {
        console.error('Failed to create WorkEntry for client visibility:', workEntryError)
        // Don't fail the main task completion if WorkEntry creation fails
      }
    }

    // Notify client portal when accounts completes invoice task with proof URL
    if (body.accountsTaskType === 'CLIENT_INVOICE' && task.clientId && proofUrl) {
      try {
        await prisma.portalNotification.create({
          data: {
            clientId: task.clientId,
            title: 'Invoice Available',
            message: 'A new invoice has been uploaded for your review',
            type: 'ACTION_REQUIRED',
            category: 'INVOICE',
            actionUrl: proofUrl,
            actionLabel: 'View Invoice',
            sourceType: 'SYSTEM',
            sourceId: taskId,
          },
        })

        await prisma.dailyTask.update({
          where: { id: taskId },
          data: { invoiceNotifiedAt: now },
        })
      } catch (notificationError) {
        console.error('Failed to create invoice notification:', notificationError)
        // Don't fail the main task completion if notification creation fails
      }
    }

    // Update plan total actual hours and check for under 4 hours
    const allTasks = await prisma.dailyTask.findMany({
      where: { planId: task.plan.id },
    })

    const totalActualHours = allTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)

    await prisma.dailyTaskPlan.update({
      where: { id: task.plan.id },
      data: {
        totalActualHours,
        hasUnder4Hours: totalActualHours < 4,
      },
    })

    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    console.error('Failed to complete task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
