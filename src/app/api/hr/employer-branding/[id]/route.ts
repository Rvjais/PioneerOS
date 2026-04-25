import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// PATCH: Update content (approve, reject, update metrics, etc.)
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // Only HR or admins can update employer branding content
    const isHR = ['SUPER_ADMIN', 'MANAGER', 'HR'].includes(user.role || '') || user.department === 'HR'
    if (!isHR) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await routeParams!
    const body = await req.json()

    const {
      title,
      description,
      type,
      platform,
      contentText,
      mediaUrls,
      hashtags,
      scheduledFor,
      publishedAt,
      status,
      rejectionReason,
      // Metrics
      likes,
      comments,
      shares,
      reach,
      impressions
    } = body

    const updateData: Record<string, unknown> = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (type !== undefined) updateData.type = type
    if (platform !== undefined) updateData.platform = platform
    if (contentText !== undefined) updateData.contentText = contentText
    if (mediaUrls !== undefined) updateData.mediaUrls = JSON.stringify(mediaUrls)
    if (hashtags !== undefined) updateData.hashtags = hashtags
    if (scheduledFor !== undefined) updateData.scheduledFor = scheduledFor ? new Date(scheduledFor) : null
    if (publishedAt !== undefined) updateData.publishedAt = new Date(publishedAt)
    if (likes !== undefined) updateData.likes = likes
    if (comments !== undefined) updateData.comments = comments
    if (shares !== undefined) updateData.shares = shares
    if (reach !== undefined) updateData.reach = reach
    if (impressions !== undefined) updateData.impressions = impressions

    // Handle status changes with approval logic
    if (status) {
      updateData.status = status

      if (status === 'APPROVED') {
        // Only SUPER_ADMIN can approve
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true }
        })

        if (dbUser?.role !== 'SUPER_ADMIN') {
          return NextResponse.json({ error: 'Only founders can approve content' }, { status: 403 })
        }

        updateData.approvedBy = user.id
        updateData.approvedAt = new Date()
      }

      if (status === 'REJECTED') {
        updateData.rejectionReason = rejectionReason
      }

      if (status === 'PUBLISHED') {
        updateData.publishedAt = new Date()
      }
    }

    const content = await prisma.employerBrandingContent.update({
      where: { id },
      data: updateData,
      include: {
        creator: true,
        approver: true
      }
    })

    // Notify creator of approval/rejection
    if (status === 'APPROVED' || status === 'REJECTED') {
      await prisma.notification.create({
        data: {
          userId: content.createdBy,
          type: 'CONTENT_STATUS',
          title: status === 'APPROVED' ? 'Content Approved!' : 'Content Rejected',
          message: status === 'APPROVED'
            ? `Your content "${content.title}" has been approved for publishing.`
            : `Your content "${content.title}" was rejected. Reason: ${rejectionReason}`,
          link: `/hr/employer-branding/${content.id}`
        }
      })
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error updating branding content:', error)
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }
})

// DELETE: Delete content
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!

    // Only creator or SUPER_ADMIN can delete
    const content = await prisma.employerBrandingContent.findUnique({
      where: { id }
    })

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (content.createdBy !== user.id && dbUser?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Not authorized to delete this content' }, { status: 403 })
    }

    await prisma.employerBrandingContent.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Content deleted' })
  } catch (error) {
    console.error('Error deleting branding content:', error)
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 })
  }
})
