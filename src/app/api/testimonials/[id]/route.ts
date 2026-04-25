import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

type RouteParams = {
  params: Promise<{ id: string }>
}

// Schema for updating a testimonial
const updateTestimonialSchema = z.object({
  // When adding YouTube URL (REQUESTED -> RECEIVED)
  youtubeUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  title: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  duration: z.number().int().positive().optional(),

  // When verifying (RECEIVED -> VERIFIED)
  action: z.enum(['verify', 'reject', 'reward']).optional(),
  verificationNotes: z.string().optional(),

  // When rewarding (VERIFIED -> REWARDED)
  voucherCode: z.string().optional(),
  voucherAmount: z.number().positive().optional(),

  // Badge customization
  badgeColor: z.enum(['gold', 'silver', 'bronze', 'platinum', 'emerald']).optional(),
  isFeatured: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
})

// GET /api/testimonials/[id] - Get single testimonial
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!

    const testimonial = await prisma.videoTestimonial.findUnique({
      where: { id },
      include: {
        requestedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            profile: { select: { profilePicture: true } },
          },
        },
        client: {
          select: { id: true, name: true, logoUrl: true, contactName: true },
        },
        verifiedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    return NextResponse.json({ testimonial })
  } catch (error) {
    console.error('Failed to fetch testimonial:', error)
    return NextResponse.json({ error: 'Failed to fetch testimonial' }, { status: 500 })
  }
})

// PATCH /api/testimonials/[id] - Update testimonial
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!
    const body = await req.json()
    const validation = updateTestimonialSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      }, { status: 400 })
    }

    const data = validation.data
    const isManager = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role)

    // Get existing testimonial
    const testimonial = await prisma.videoTestimonial.findUnique({
      where: { id },
      include: {
        requestedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    // Check permissions
    const isOwner = testimonial.requestedById === user.id
    if (!isOwner && !isManager) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Build update object
    const updateData: Record<string, unknown> = {}

    // Adding YouTube URL (owner or manager can do this)
    if (data.youtubeUrl) {
      if (testimonial.status !== 'REQUESTED' && testimonial.status !== 'RECEIVED') {
        return NextResponse.json({
          error: 'Cannot update YouTube URL after verification',
        }, { status: 400 })
      }
      updateData.youtubeUrl = data.youtubeUrl
      updateData.status = 'RECEIVED'
      updateData.receivedAt = new Date()

      // Extract YouTube video ID for thumbnail if not provided
      if (!data.thumbnailUrl) {
        const videoId = extractYouTubeVideoId(data.youtubeUrl)
        if (videoId) {
          updateData.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        }
      }
    }

    if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl || null
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.duration !== undefined) updateData.duration = data.duration

    // Manager actions
    if (isManager) {
      if (data.action === 'verify') {
        if (testimonial.status !== 'RECEIVED') {
          return NextResponse.json({
            error: 'Can only verify testimonials in RECEIVED status',
          }, { status: 400 })
        }
        updateData.status = 'VERIFIED'
        updateData.verifiedAt = new Date()
        updateData.verifiedById = user.id
        updateData.verificationNotes = data.verificationNotes
      }

      if (data.action === 'reject') {
        updateData.status = 'REQUESTED'
        updateData.youtubeUrl = null
        updateData.receivedAt = null
        updateData.verificationNotes = data.verificationNotes
      }

      if (data.action === 'reward') {
        if (testimonial.status !== 'VERIFIED') {
          return NextResponse.json({
            error: 'Can only reward verified testimonials',
          }, { status: 400 })
        }
        if (!data.voucherCode) {
          return NextResponse.json({
            error: 'Voucher code is required to reward',
          }, { status: 400 })
        }
        updateData.status = 'REWARDED'
        updateData.voucherCode = data.voucherCode
        updateData.voucherAmount = data.voucherAmount || 1000
        updateData.rewardedAt = new Date()
      }

      // Badge customization
      if (data.badgeColor !== undefined) updateData.badgeColor = data.badgeColor
      if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured
      if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder
    }

    const updated = await prisma.videoTestimonial.update({
      where: { id },
      data: updateData,
      include: {
        requestedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        client: {
          select: { id: true, name: true },
        },
        verifiedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      testimonial: updated,
    })
  } catch (error) {
    console.error('Failed to update testimonial:', error)
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 })
  }
})

// DELETE /api/testimonials/[id] - Delete testimonial (managers only)
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user.role)
    if (!isManager) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { id } = await routeParams!

    await prisma.videoTestimonial.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete testimonial:', error)
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 })
  }
})

// Helper to extract YouTube video ID from URL
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}
