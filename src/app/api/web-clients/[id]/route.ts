import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

/**
 * GET /api/web-clients/[id]
 * Get a single web client with all details
 */
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!

    const client = await prisma.client.findFirst({
      where: {
        id,
        isWebTeamClient: true,
        deletedAt: null,
      },
      include: {
        webProjectPhases: {
          orderBy: { order: 'asc' },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        teamMembers: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, department: true },
            },
          },
        },
        maintenanceContracts: true,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error fetching web client:', error)
    return NextResponse.json(
      { error: 'Failed to fetch web client' },
      { status: 500 }
    )
  }
})

/**
 * PATCH /api/web-clients/[id]
 * Update a web client
 */
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const userRole = user.role as string
    const userDepartment = user.department as string

    // Check if user is WEB department or admin
    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(userRole)
    const isWebTeam = userDepartment === 'WEB'

    if (!isAdmin && !isWebTeam) {
      return NextResponse.json(
        { error: 'Only web team or admins can update web clients' },
        { status: 403 }
      )
    }

    const { id } = await routeParams!
    const body = await req.json()
    const patchSchema = z.object({
      name: z.string().min(1).max(300).optional(),
      contactName: z.string().max(200).optional(),
      contactPhone: z.string().max(20).optional(),
      contactEmail: z.string().email().optional(),
      websiteUrl: z.string().max(500).optional(),
      notes: z.string().max(2000).optional(),
      webProjectStatus: z.string().max(50).optional(),
      websiteType: z.string().max(100).optional(),
      techStack: z.string().max(500).optional(),
      webProjectStartDate: z.string().optional(),
      webProjectEndDate: z.string().optional(),
      webProjectNotes: z.string().max(2000).optional(),
    })
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })

    const {
      name,
      contactName,
      contactPhone,
      contactEmail,
      websiteUrl,
      notes,
      webProjectStatus,
      websiteType,
      techStack,
      webProjectStartDate,
      webProjectEndDate,
      webProjectNotes,
    } = parsed.data

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (name !== undefined) updateData.name = name
    if (contactName !== undefined) updateData.contactName = contactName
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl
    if (notes !== undefined) updateData.notes = notes
    if (webProjectStatus !== undefined) updateData.webProjectStatus = webProjectStatus
    if (websiteType !== undefined) updateData.websiteType = websiteType
    if (techStack !== undefined) updateData.techStack = techStack
    if (webProjectNotes !== undefined) updateData.webProjectNotes = webProjectNotes
    if (webProjectStartDate !== undefined) {
      updateData.webProjectStartDate = webProjectStartDate ? new Date(webProjectStartDate) : null
    }
    if (webProjectEndDate !== undefined) {
      updateData.webProjectEndDate = webProjectEndDate ? new Date(webProjectEndDate) : null
    }

    // If marking as completed and no end date provided, set it to now
    if (webProjectStatus === 'COMPLETED' && !body.webProjectEndDate) {
      const existingClient = await prisma.client.findUnique({
        where: { id },
        select: { webProjectEndDate: true },
      })
      if (!existingClient?.webProjectEndDate) {
        updateData.webProjectEndDate = new Date()
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
      include: {
        webProjectPhases: {
          orderBy: { order: 'asc' },
        },
        teamMembers: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      client,
    })
  } catch (error) {
    console.error('Error updating web client:', error)
    return NextResponse.json(
      { error: 'Failed to update web client' },
      { status: 500 }
    )
  }
})

/**
 * DELETE /api/web-clients/[id]
 * Delete a web client (soft delete by setting status to LOST)
 */
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const userRole = user.role as string

    // Only admins can delete
    if (!['SUPER_ADMIN', 'MANAGER'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Only admins can delete web clients' },
        { status: 403 }
      )
    }

    const { id } = await routeParams!

    // Soft delete - set status to LOST
    await prisma.client.update({
      where: { id },
      data: {
        status: 'LOST',
        webProjectStatus: 'COMPLETED',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Client archived successfully',
    })
  } catch (error) {
    console.error('Error deleting web client:', error)
    return NextResponse.json(
      { error: 'Failed to delete web client' },
      { status: 500 }
    )
  }
})
