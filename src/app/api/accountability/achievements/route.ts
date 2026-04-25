import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

// Achievement types and their point values
const ACHIEVEMENT_POINTS: Record<string, number> = {
  CLIENT_APPRECIATION: 2,      // WhatsApp group appreciation
  GOOGLE_REVIEW: 5,            // Google review on BP page
  VIDEO_TESTIMONIAL: 10,       // Video testimonial from client
  EMPLOYEE_REFERRAL: 50,       // Employee referral (after probation)
  CLIENT_REFERRAL: 20,         // Client referral
  SALE_CLOSED: 25,             // Closed a sale
  ATTENDANCE_PERFECT: 5,       // 100% monthly attendance
  GOAL_ACHIEVEMENT: 10,        // Strategic/Tactical goal achievement
  BP_CONTENT: 5,               // BP Reel/Video creation
}

// Achievement incentive values in rupees
const ACHIEVEMENT_INCENTIVES: Record<string, number> = {
  CLIENT_REFERRAL: 5000,
  EMPLOYEE_REFERRAL: 3000,
  VIDEO_TESTIMONIAL: 1000,
  GOOGLE_REVIEW: 20,
}

// GET - Get achievements
export const GET = withAuth(async (req, { user, params }) => {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const monthParam = searchParams.get('month')
    const status = searchParams.get('status')

    const month = monthParam ? new Date(monthParam) : new Date()
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)

    const whereClause: Record<string, unknown> = {
      month: monthStart,
    }

    if (userId) {
      whereClause.userId = userId
    }

    if (status) {
      whereClause.status = status
    }

    const achievements = await prisma.achievement.findMany({
      where: whereClause,
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
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(achievements)
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST - Add new achievement
export const POST = withAuth(async (req, { user, params }) => {
  try {
if (!['SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Only managers can add achievements' }, { status: 401 })
    }

    const body = await req.json()
    const postSchema = z.object({
      userId: z.string().min(1),
      type: z.string().min(1).max(100),
      title: z.string().min(1).max(500),
      description: z.string().max(2000).optional(),
      clientId: z.string().min(1).optional(),
      proofUrl: z.string().max(1000).optional(),
      month: z.string().optional(),
    })
    const postResult = postSchema.safeParse(body)
    if (!postResult.success) return NextResponse.json({ error: postResult.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const {
      userId,
      type,
      title,
      description,
      clientId,
      proofUrl,
      month: monthParam,
    } = postResult.data

    // Validate type
    if (!ACHIEVEMENT_POINTS[type]) {
      return NextResponse.json({ error: 'Invalid achievement type' }, { status: 400 })
    }

    const month = monthParam ? new Date(monthParam) : new Date()
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)

    const pointsAwarded = ACHIEVEMENT_POINTS[type]
    const incentiveValue = ACHIEVEMENT_INCENTIVES[type] || null

    const achievement = await prisma.achievement.create({
      data: {
        userId,
        type,
        title,
        description,
        clientId,
        proofUrl,
        pointsAwarded,
        incentiveValue,
        status: 'PENDING',
        addedBy: user.id,
        month: monthStart,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Create notification for the user
    await prisma.notification.create({
      data: {
        userId,
        type: 'GENERAL',
        title: 'New Achievement Added',
        message: `You received recognition: ${title}`,
        link: '/performance/achievements',
      },
    })

    return NextResponse.json(achievement)
  } catch (error) {
    console.error('Error creating achievement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PATCH - Approve/Reject achievement
export const PATCH = withAuth(async (req, { user, params }) => {
  try {
if (!['SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const patchSchema = z.object({
      id: z.string().min(1),
      status: z.enum(['APPROVED', 'REJECTED']),
    })
    const patchResult = patchSchema.safeParse(body)
    if (!patchResult.success) return NextResponse.json({ error: patchResult.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { id, status } = patchResult.data

    const achievement = await prisma.achievement.update({
      where: { id },
      data: {
        status,
        approvedBy: user.id,
        approvedAt: new Date(),
      },
    })

    return NextResponse.json(achievement)
  } catch (error) {
    console.error('Error updating achievement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
