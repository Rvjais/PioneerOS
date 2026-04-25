import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'

// PATCH - Update a daily task
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { taskId } = await routeParams!
    const body = await req.json()

    // Verify task belongs to user's plan
    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId },
      include: { plan: true },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.plan.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if this is a communication tracking update (allowed for completed tasks)
    const isCommunicationUpdate = body.clientCommunicated !== undefined

    // Can only edit PLANNED tasks (unless updating communication status)
    if (task.status !== 'PLANNED' && !isCommunicationUpdate) {
      return NextResponse.json({ error: 'Can only edit planned tasks' }, { status: 400 })
    }

    // Build update data based on what's being updated
    const updateData: Record<string, unknown> = {}

    if (isCommunicationUpdate) {
      // Only update communication fields
      updateData.clientCommunicated = body.clientCommunicated
      updateData.communicatedAt = body.clientCommunicated ? new Date() : null
      updateData.communicatedVia = body.communicatedVia || null
      updateData.communicationMessage = body.communicationMessage || null
    } else {
      // Update task details (only for PLANNED tasks)
      if (body.clientId !== undefined) updateData.clientId = body.clientId || null
      if (body.activityType !== undefined) updateData.activityType = body.activityType
      if (body.description !== undefined) updateData.description = body.description
      if (body.plannedStartTime !== undefined) updateData.plannedStartTime = body.plannedStartTime || null
      if (body.plannedHours !== undefined) updateData.plannedHours = body.plannedHours
      if (body.priority !== undefined) updateData.priority = body.priority
      if (body.notes !== undefined) updateData.notes = body.notes || null
      if (body.deadline !== undefined) updateData.deadline = body.deadline ? new Date(body.deadline) : null
      if (body.deliverable !== undefined) updateData.deliverable = body.deliverable || null
      if (body.remarks !== undefined) updateData.remarks = body.remarks || null
      if (body.proofUrl !== undefined) updateData.proofUrl = body.proofUrl || null
    }

    const updatedTask = await prisma.dailyTask.update({
      where: { id: taskId },
      data: updateData,
      include: {
        client: { select: { id: true, name: true } },
        allocatedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    // Update plan totals (only if task details were modified, not communication status)
    if (!isCommunicationUpdate) {
      const allTasks = await prisma.dailyTask.findMany({
        where: { planId: task.planId },
      })

      const totalPlannedHours = allTasks.reduce((sum, t) => sum + t.plannedHours, 0)
      const totalActualHours = allTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)

      await prisma.dailyTaskPlan.update({
        where: { id: task.planId },
        data: {
          totalPlannedHours,
          totalActualHours,
        },
      })
    }

    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    console.error('Failed to update task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// DELETE - Delete a daily task
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { taskId } = await routeParams!

    // Verify task belongs to user's plan
    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId },
      include: { plan: true },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.plan.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Can only delete PLANNED tasks
    if (task.status !== 'PLANNED') {
      return NextResponse.json({ error: 'Can only delete planned tasks' }, { status: 400 })
    }

    await prisma.dailyTask.delete({
      where: { id: taskId },
    })

    // Update plan totals
    const remainingTasks = await prisma.dailyTask.findMany({
      where: { planId: task.planId },
    })

    const totalPlannedHours = remainingTasks.reduce((sum, t) => sum + t.plannedHours, 0)
    const totalActualHours = remainingTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)

    await prisma.dailyTaskPlan.update({
      where: { id: task.planId },
      data: {
        totalPlannedHours,
        totalActualHours,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
