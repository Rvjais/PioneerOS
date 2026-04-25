import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const updateEscalationSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  resolution: z.string().max(5000).optional(),
  actionTaken: z.string().max(5000).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  impactOnAppraisal: z.boolean().optional(),
})

// GET: Fetch single escalation
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {
    // Only HR, MANAGER, or SUPER_ADMIN can view escalations
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, department: true }
    })

    const isAuthorized = currentUser &&
      (['SUPER_ADMIN', 'HR', 'MANAGER'].includes(currentUser.role ?? '') || currentUser.department === 'HR')

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await routeParams!

    const escalation = await prisma.employeeEscalation.findUnique({
      where: { id },
      include: {
        employee: true,
        client: true,
        reporter: true
      }
    })

    if (!escalation) {
      return NextResponse.json({ error: 'Escalation not found' }, { status: 404 })
    }

    return NextResponse.json({ escalation })
  } catch (error) {
    console.error('Error fetching escalation:', error)
    return NextResponse.json({ error: 'Failed to fetch escalation' }, { status: 500 })
  }
})

// PATCH: Update escalation (resolve, add action taken, etc.)
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {
    // Only HR, MANAGER, or SUPER_ADMIN can update escalations
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, department: true }
    })

    const isAuthorized = currentUser &&
      (['SUPER_ADMIN', 'HR', 'MANAGER'].includes(currentUser.role ?? '') || currentUser.department === 'HR')

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await routeParams!
    const rawBody = await req.json()
    const parsed = updateEscalationSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const {
      status,
      resolution,
      actionTaken,
      severity,
      impactOnAppraisal
    } = parsed.data

    const updateData: Record<string, unknown> = {}

    if (status) {
      updateData.status = status
      if (status === 'RESOLVED' || status === 'CLOSED') {
        updateData.resolvedBy = user.id
        updateData.resolvedAt = new Date()
      }
    }
    if (resolution !== undefined) updateData.resolution = resolution
    if (actionTaken !== undefined) updateData.actionTaken = actionTaken
    if (severity) updateData.severity = severity
    if (impactOnAppraisal !== undefined) updateData.impactOnAppraisal = impactOnAppraisal

    const escalation = await prisma.employeeEscalation.update({
      where: { id },
      data: updateData,
      include: {
        employee: true,
        client: true,
        reporter: true
      }
    })

    // Notify employee if resolved
    if (status === 'RESOLVED') {
      await prisma.notification.create({
        data: {
          userId: escalation.employeeId,
          type: 'ESCALATION_RESOLVED',
          title: 'Escalation Resolved',
          message: `Escalation "${escalation.title}" has been resolved.`,
          link: `/hr/escalations/${escalation.id}`
        }
      })
    }

    return NextResponse.json({ escalation })
  } catch (error) {
    console.error('Error updating escalation:', error)
    return NextResponse.json({ error: 'Failed to update escalation' }, { status: 500 })
  }
})
