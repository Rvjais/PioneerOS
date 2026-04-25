import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET: Fetch client feedback on employees
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only HR or admins can view employee feedback
    const isHR = ['SUPER_ADMIN', 'MANAGER', 'HR'].includes(user.role || '') || user.department === 'HR'
    if (!isHR) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const clientId = searchParams.get('clientId')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '50')), 100)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (employeeId) where.employeeId = employeeId
    if (clientId) where.clientId = clientId

    const [feedback, total] = await Promise.all([
      prisma.employeeClientFeedback.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              department: true,
            }
          },
          client: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.employeeClientFeedback.count({ where }),
    ])

    // Calculate averages per employee
    const employeeAverages: Record<string, {
      count: number;
      totalRating: number;
      avgRating: number;
    }> = {}

    for (const fb of feedback) {
      if (!employeeAverages[fb.employeeId]) {
        employeeAverages[fb.employeeId] = { count: 0, totalRating: 0, avgRating: 0 }
      }
      employeeAverages[fb.employeeId].count++
      employeeAverages[fb.employeeId].totalRating += fb.overallRating
      employeeAverages[fb.employeeId].avgRating =
        employeeAverages[fb.employeeId].totalRating / employeeAverages[fb.employeeId].count
    }

    // Get stats (computed from current page)
    const stats = {
      total,
      excellent: feedback.filter(f => f.overallRating >= 4.5).length,
      good: feedback.filter(f => f.overallRating >= 3.5 && f.overallRating < 4.5).length,
      needsImprovement: feedback.filter(f => f.overallRating < 3.5).length,
      avgRating: feedback.length > 0
        ? feedback.reduce((sum, f) => sum + f.overallRating, 0) / feedback.length
        : 0
    }

    return NextResponse.json({ feedback, stats, employeeAverages, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Error fetching employee feedback:', error)
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }
})

// POST: Add client feedback on an employee
export const POST = withAuth(async (req, { user }) => {
  try {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only HR can add feedback
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true, department: true }
    })

    if (!dbUser || (!['SUPER_ADMIN', 'HR'].includes(dbUser.role) && dbUser.department !== 'HR')) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const body = await req.json()
    const {
      clientId,
      employeeId,
      overallRating,
      qualitativeRemarks,
      communicationRating,
      deliveryRating,
      professionalismRating,
      responsiveRating,
      service,
      projectName,
      periodStart,
      periodEnd,
      source = 'CALL'
    } = body

    if (!clientId || !employeeId || !overallRating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const feedback = await prisma.employeeClientFeedback.create({
      data: {
        clientId,
        employeeId,
        overallRating,
        qualitativeRemarks,
        communicationRating,
        deliveryRating,
        professionalismRating,
        responsiveRating,
        service,
        projectName,
        periodStart: periodStart ? new Date(periodStart) : null,
        periodEnd: periodEnd ? new Date(periodEnd) : null,
        collectedBy: user.id,
        source
      },
      include: {
        employee: true,
        client: true
      }
    })

    // Notify employee of feedback (only if good)
    if (overallRating >= 4) {
      await prisma.notification.create({
        data: {
          userId: employeeId,
          type: 'POSITIVE_FEEDBACK',
          title: 'Great Client Feedback!',
          message: `${feedback.client.name} gave you a ${overallRating}/5 rating!`,
          link: '/profile/feedback'
        }
      })
    }

    // If low rating, notify manager
    if (overallRating <= 2) {
      const employee = await prisma.user.findUnique({
        where: { id: employeeId },
        select: { department: true }
      })

      const managers = await prisma.user.findMany({
        where: {
          department: employee?.department,
          role: 'MANAGER',
          deletedAt: null,
        },
        select: { id: true }
      })

      for (const manager of managers) {
        await prisma.notification.create({
          data: {
            userId: manager.id,
            type: 'LOW_FEEDBACK_ALERT',
            title: 'Low Client Feedback',
            message: `${feedback.employee.firstName} received a ${overallRating}/5 rating from ${feedback.client.name}`,
            link: `/hr/employee-feedback/${feedback.id}`
          }
        })
      }
    }

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Error creating employee feedback:', error)
    return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 })
  }
})
