import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const completeAppraisalSchema = z.object({
  managerRating: z.number().min(0).max(5).optional(),
  managerComments: z.string().max(5000).optional().nullable(),
  finalRating: z.number().min(0).max(5),
  incrementRecommendation: z.boolean().optional(),
  promotionRecommendation: z.boolean().optional(),
})

export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!

    // Check if user is HR or Admin
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true, department: true },
    })

    const isHR = currentUser?.role === 'HR' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'MANAGER' || currentUser?.department === 'HR'
    if (!isHR) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const rawData = await req.json()
    const parsed = completeAppraisalSchema.safeParse(rawData)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { managerRating, managerComments, finalRating, incrementRecommendation, promotionRecommendation } = parsed.data

    // Get the appraisal
    const appraisal = await prisma.selfAppraisal.findUnique({
      where: { id },
    })

    if (!appraisal) {
      return NextResponse.json({ error: 'Appraisal not found' }, { status: 404 })
    }

    // Department-scope MANAGER: can only complete appraisals for employees in their own department
    if (currentUser?.role === 'MANAGER' && currentUser.department !== 'HR') {
      const targetEmployee = await prisma.user.findUnique({
        where: { id: appraisal.userId },
        select: { department: true },
      })
      if (targetEmployee?.department !== currentUser.department) {
        return NextResponse.json({ error: 'Cannot manage employees outside your department' }, { status: 403 })
      }
    }

    if (appraisal.status !== 'SUBMITTED') {
      return NextResponse.json({ error: 'Appraisal must be submitted before completion' }, { status: 400 })
    }

    // Update appraisal
    const updatedAppraisal = await prisma.selfAppraisal.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        managerRating,
        managerComments,
        finalRating,
        incrementRecommendation: incrementRecommendation != null ? String(incrementRecommendation) : undefined,
        promotionRecommendation,
        reviewedBy: user.id,
        reviewedAt: new Date(),
      },
    })

    // Update user's appraisal date for next year
    const nextAppraisalDate = new Date()
    nextAppraisalDate.setFullYear(nextAppraisalDate.getFullYear() + 1)

    await prisma.user.update({
      where: { id: appraisal.userId },
      data: { appraisalDate: nextAppraisalDate },
    })

    // Get user info for notification
    const dbUser = await prisma.user.findUnique({
      where: { id: appraisal.userId },
      select: { firstName: true, lastName: true },
    })

    // Notify employee
    await prisma.notification.create({
      data: {
        userId: appraisal.userId,
        type: 'GENERAL',
        title: 'Appraisal Completed',
        message: `Your ${appraisal.cycleYear} self-appraisal has been reviewed and completed. Final rating: ${finalRating}/5`,
        link: '/hr/appraisals/self',
        priority: 'HIGH',
      },
    })

    return NextResponse.json({ success: true, appraisal: updatedAppraisal })
  } catch (error) {
    console.error('Failed to complete appraisal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
