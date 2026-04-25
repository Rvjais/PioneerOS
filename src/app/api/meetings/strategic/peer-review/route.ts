import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'

// POST - Submit a peer review
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const {
      meetingId,
      revieweeId,
      collaborationRating,
      communicationRating,
      deliveryRating,
      innovationRating,
      overallRating,
      didWell,
      needsImprovement,
      shouldDoDifferently,
      isPublic,
    } = body

    // Validate meeting exists
    const meeting = await prisma.strategicMeeting.findUnique({
      where: { id: meetingId },
    })

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    // Can't review yourself
    if (revieweeId === user.id) {
      return NextResponse.json({ error: 'Cannot review yourself' }, { status: 400 })
    }

    // Check if already reviewed
    const existingReview = await prisma.peerReview.findUnique({
      where: {
        meetingId_reviewerId_revieweeId: {
          meetingId,
          reviewerId: user.id,
          revieweeId,
        },
      },
    })

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this person' }, { status: 400 })
    }

    // Create the review
    const review = await prisma.peerReview.create({
      data: {
        meetingId,
        reviewerId: user.id,
        revieweeId,
        collaborationRating,
        communicationRating,
        deliveryRating,
        innovationRating,
        overallRating,
        didWell,
        needsImprovement,
        shouldDoDifferently,
        isPublic: isPublic ?? true,
      },
    })

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Failed to submit peer review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// GET - Fetch peer reviews
export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const meetingId = searchParams.get('meetingId')
    const revieweeId = searchParams.get('revieweeId')

    const whereClause: Record<string, unknown> = {}

    if (meetingId) whereClause.meetingId = meetingId
    if (revieweeId) whereClause.revieweeId = revieweeId

    // Only show public reviews or own reviews
    whereClause.OR = [
      { isPublic: true },
      { reviewerId: user.id },
      { revieweeId: user.id },
    ]

    const reviews = await prisma.peerReview.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Failed to fetch peer reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
