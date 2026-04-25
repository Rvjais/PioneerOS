import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET: Fetch manager behavior reviews
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only HR and Super Admin can view all reviews
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, department: true }
    })

    if (!dbUser || (!['SUPER_ADMIN', 'HR'].includes(dbUser.role) && dbUser.department !== 'HR')) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const managerId = searchParams.get('managerId')
    const quarter = searchParams.get('quarter')
    const year = searchParams.get('year')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}

    if (managerId) where.managerId = managerId
    if (quarter) where.quarter = parseInt(quarter)
    if (year) where.year = parseInt(year)
    if (status) where.status = status

    const reviews = await prisma.managerBehaviorReview.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
          }
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { quarter: 'desc' }
      ]
    })

    // Get all managers for dropdown
    const managers = await prisma.user.findMany({
      where: { role: 'MANAGER', deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        department: true
      }
    })

    // Calculate averages for each manager
    const managerAverages = reviews.reduce((acc, review) => {
      if (!acc[review.managerId]) {
        acc[review.managerId] = { count: 0, totalRating: 0 }
      }
      const avgRating = (
        (review.personalityRating || 0) +
        (review.commitmentRating || 0) +
        (review.behaviorRating || 0) +
        (review.leadershipRating || 0) +
        (review.communicationRating || 0) +
        (review.teamBuildingRating || 0)
      ) / 6
      acc[review.managerId].count++
      acc[review.managerId].totalRating += avgRating
      return acc
    }, {} as Record<string, { count: number; totalRating: number }>)

    return NextResponse.json({ reviews, managers, managerAverages })
  } catch (error) {
    console.error('Error fetching manager reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch manager reviews' }, { status: 500 })
  }
})

// POST: Create a new manager behavior review
export const POST = withAuth(async (req, { user }) => {
  try {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only HR and Super Admin can create reviews
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true, department: true }
    })

    if (!dbUser || (!['SUPER_ADMIN', 'HR'].includes(dbUser.role) && dbUser.department !== 'HR')) {
      return NextResponse.json({ error: 'Not authorized to create manager reviews' }, { status: 403 })
    }

    const body = await req.json()
    const {
      managerId,
      quarter,
      year,
      personalityRating,
      commitmentRating,
      behaviorRating,
      leadershipRating,
      communicationRating,
      teamBuildingRating,
      strengths,
      areasOfImprovement,
      specificIncidents,
      teamFeedbackSummary,
      status = 'DRAFT'
    } = body

    if (!managerId || !quarter || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if review already exists for this quarter
    const existing = await prisma.managerBehaviorReview.findUnique({
      where: {
        managerId_quarter_year: {
          managerId,
          quarter,
          year
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Review already exists for this quarter' }, { status: 400 })
    }

    // Create review
    const review = await prisma.managerBehaviorReview.create({
      data: {
        managerId,
        quarter,
        year,
        personalityRating,
        commitmentRating,
        behaviorRating,
        leadershipRating,
        communicationRating,
        teamBuildingRating,
        strengths,
        areasOfImprovement,
        specificIncidents,
        teamFeedbackSummary,
        reviewedBy: user.id,
        status
      },
      include: {
        manager: true,
        reviewer: true
      }
    })

    // Notify manager when review is submitted
    if (status === 'SUBMITTED') {
      await prisma.notification.create({
        data: {
          userId: managerId,
          type: 'MANAGER_REVIEW',
          title: `Q${quarter} ${year} Behavior Review`,
          message: 'Your quarterly behavior review has been submitted. Please acknowledge.',
          link: `/hr/manager-reviews/${review.id}`
        }
      })
    }

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Error creating manager review:', error)
    return NextResponse.json({ error: 'Failed to create manager review' }, { status: 500 })
  }
})
