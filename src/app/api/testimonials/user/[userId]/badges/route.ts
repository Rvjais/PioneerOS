import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'

type RouteParams = {
  params: Promise<{ userId: string }>
}

// GET /api/testimonials/user/[userId]/badges - Get user's testimonial badges for profile
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params

    // Get all verified/rewarded testimonials for this user
    const testimonials = await prisma.videoTestimonial.findMany({
      where: {
        requestedById: userId,
        status: { in: ['VERIFIED', 'REWARDED'] },
        youtubeUrl: { not: null },
      },
      select: {
        id: true,
        youtubeUrl: true,
        thumbnailUrl: true,
        title: true,
        description: true,
        badgeColor: true,
        isFeatured: true,
        displayOrder: true,
        receivedAt: true,
        rewardedAt: true,
        voucherAmount: true,
        client: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { displayOrder: 'asc' },
        { receivedAt: 'desc' },
      ],
    })

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        department: true,
        profile: {
          select: { profilePicture: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate total rewards earned
    const totalRewards = testimonials
      .filter(t => t.voucherAmount)
      .reduce((sum, t) => sum + (t.voucherAmount || 0), 0)

    // Format badges for display
    const badges = testimonials.map(t => ({
      id: t.id,
      youtubeUrl: t.youtubeUrl,
      thumbnailUrl: t.thumbnailUrl,
      title: t.title || `Testimonial from ${t.client.name}`,
      clientName: t.client.name,
      clientLogo: t.client.logoUrl,
      badgeColor: t.badgeColor,
      isFeatured: t.isFeatured,
      receivedAt: t.receivedAt,
    }))

    return NextResponse.json({
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName || ''}`.trim(),
        department: user.department,
        profilePicture: user.profile?.profilePicture,
      },
      badges,
      stats: {
        totalTestimonials: testimonials.length,
        totalRewardsEarned: totalRewards,
        featuredCount: testimonials.filter(t => t.isFeatured).length,
      },
    })
  } catch (error) {
    console.error('Failed to fetch user badges:', error)
    return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 })
  }
}
