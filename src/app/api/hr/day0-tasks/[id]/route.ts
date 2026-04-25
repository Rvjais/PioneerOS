import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// PATCH: Update Day 0 task status
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!
    const body = await req.json()

    const {
      status,
      notes,
      assignedTo
    } = body

    const updateData: Record<string, unknown> = {}

    if (status) {
      updateData.status = status
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date()
        updateData.completedBy = user.id
      }
    }
    if (notes !== undefined) updateData.notes = notes
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo

    const task = await prisma.day0Task.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    })

    // Check if all tasks are completed for this user
    if (status === 'COMPLETED' && task.userId) {
      const allTasks = await prisma.day0Task.findMany({
        where: { userId: task.userId }
      })

      const allCompleted = allTasks.every(t => t.status === 'COMPLETED')

      if (allCompleted) {
        // Notify HR that Day 0 onboarding is complete
        const hrUsers = await prisma.user.findMany({
          where: { department: 'HR', role: { in: ['HR', 'MANAGER', 'SUPER_ADMIN'] }, deletedAt: null },
          select: { id: true }
        })

        for (const hr of hrUsers) {
          await prisma.notification.create({
            data: {
              userId: hr.id,
              type: 'ONBOARDING_COMPLETE',
              title: 'Day 0 Onboarding Complete!',
              message: `All Day 0 tasks completed for ${task.user?.firstName} ${task.user?.lastName}`,
              link: `/hr/onboarding/${task.userId}`
            }
          })
        }

        // Update employee onboarding step
        await prisma.user.update({
          where: { id: task.userId },
          data: { onboardingStep: 1 }
        })
      }
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error updating Day 0 task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
})

// DELETE: Remove a Day 0 task
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // Only HR can delete tasks
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, department: true }
    })

    if (!dbUser || (!['SUPER_ADMIN', 'HR'].includes(dbUser.role) && dbUser.department !== 'HR')) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { id } = await routeParams!

    await prisma.day0Task.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Task deleted' })
  } catch (error) {
    console.error('Error deleting Day 0 task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
})
