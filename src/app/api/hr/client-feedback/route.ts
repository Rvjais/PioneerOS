import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const createFeedbackSchema = z.object({
  employeeId: z.string().min(1),
  clientId: z.string().min(1),
  type: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  content: z.string().min(1),
})

const HR_FEEDBACK_ROLES = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR', 'OM'] as const

// GET - Fetch all employee client feedbacks
export const GET = withAuth(async () => {
  try {
    const feedbacks = await prisma.employeeClientFeedback.findMany({
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            empId: true,
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
      take: 50,
    })

    // Transform data for frontend
    const transformedFeedbacks = feedbacks.map((fb) => ({
      id: fb.id,
      employeeId: fb.employeeId,
      employeeName: `${fb.employee.firstName} ${fb.employee.lastName || ''}`.trim(),
      clientId: fb.clientId,
      clientName: fb.client.name,
      type: fb.overallRating ? 'RATING' : fb.qualitativeRemarks ? 'FEEDBACK' : 'REMARK',
      rating: fb.overallRating,
      content: fb.qualitativeRemarks || `Rating: ${fb.overallRating}/5`,
      createdAt: fb.createdAt,
      createdBy: fb.collectedBy || 'HR',
    }))

    return NextResponse.json(transformedFeedbacks)
  } catch (error) {
    console.error('Error fetching feedbacks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, { roles: [...HR_FEEDBACK_ROLES] })

// POST - Create new employee client feedback
export const POST = withAuth(async (req, { user }) => {
  try {
    const raw = await req.json()
    const parsed = createFeedbackSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { employeeId, clientId, type, rating, content } = parsed.data

    // Get current user's name for collectedBy
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { firstName: true, lastName: true },
    })

    const collectedBy = currentUser
      ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
      : 'HR'

    const feedback = await prisma.employeeClientFeedback.create({
      data: {
        employeeId,
        clientId,
        overallRating: type === 'RATING' ? (rating ?? 5) : 3,
        qualitativeRemarks: content,
        source: 'CALL',
        collectedBy,
      },
    })

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Error creating feedback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, { roles: [...HR_FEEDBACK_ROLES] })
