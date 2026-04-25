import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET: Fetch appreciations with filters
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const type = searchParams.get('type')
    const isPublic = searchParams.get('isPublic')

    const where: Record<string, unknown> = {}

    if (employeeId) where.employeeId = employeeId
    if (type) where.type = type
    if (isPublic !== null) where.isPublic = isPublic === 'true'

    // FREELANCER/INTERN can only see public appreciations
    if (['FREELANCER', 'INTERN'].includes(user.role)) {
      where.isPublic = true
    }

    const appreciations = await prisma.employeeAppreciation.findMany({
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
        },
        giver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get summary stats
    const stats = {
      total: appreciations.length,
      thisMonth: appreciations.filter(a => {
        const thisMonth = new Date()
        thisMonth.setDate(1)
        thisMonth.setHours(0, 0, 0, 0)
        return new Date(a.createdAt) >= thisMonth
      }).length,
      byType: appreciations.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      totalXP: appreciations.reduce((sum, a) => sum + a.xpAwarded, 0)
    }

    return NextResponse.json({ appreciations, stats })
  } catch (error) {
    console.error('Error fetching appreciations:', error)
    return NextResponse.json({ error: 'Failed to fetch appreciations' }, { status: 500 })
  }
})

// POST: Create a new appreciation
export const POST = withAuth(async (req, { user }) => {
  try {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      employeeId,
      type,
      title,
      description,
      clientId,
      xpAwarded = 0,
      isPublic = true
    } = body

    if (!employeeId || !type || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Prevent self-appreciation
    if (employeeId === user.id) {
      return NextResponse.json({ error: 'Cannot appreciate yourself' }, { status: 400 })
    }

    // Validate XP cap
    if (xpAwarded > 100) {
      return NextResponse.json({ error: 'XP cannot exceed 100' }, { status: 400 })
    }

    // Limit: max 5 recognitions per giver per month
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const givenThisMonth = await prisma.employeeAppreciation.count({
      where: {
        givenBy: user.id,
        createdAt: { gte: monthStart },
      },
    })

    if (givenThisMonth >= 5) {
      return NextResponse.json(
        { error: 'You have reached the maximum of 5 recognitions per month' },
        { status: 429 }
      )
    }

    // Create appreciation
    const appreciation = await prisma.employeeAppreciation.create({
      data: {
        employeeId,
        type,
        title,
        description,
        clientId,
        givenBy: user.id,
        xpAwarded,
        isPublic
      },
      include: {
        employee: true,
        client: true,
        giver: true
      }
    })

    // Notify the employee
    await prisma.notification.create({
      data: {
        userId: employeeId,
        type: 'APPRECIATION',
        title: 'You received an appreciation!',
        message: `${appreciation.giver.firstName} appreciated you: "${title}"`,
        link: `/hr/appreciations/${appreciation.id}`
      }
    })

    // If public, create a post in the feed
    if (isPublic) {
      await prisma.post.create({
        data: {
          userId: user.id,
          type: 'WIN',
          content: `Appreciation for ${appreciation.employee.firstName} ${appreciation.employee.lastName}: ${title}\n\n${description}`,
          isPinned: false
        }
      })
    }

    return NextResponse.json({ appreciation })
  } catch (error) {
    console.error('Error creating appreciation:', error)
    return NextResponse.json({ error: 'Failed to create appreciation' }, { status: 500 })
  }
})
