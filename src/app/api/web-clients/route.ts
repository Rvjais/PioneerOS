import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { generateClientId } from '@/server/db/sequence'
import { getPaginationParams, paginatedResponse } from '@/shared/utils/pagination'
import { WEB_PROJECT_PHASES } from '@/shared/constants/formConstants'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

/**
 * GET /api/web-clients
 * List all web team clients
 */
export const GET = withAuth(async (req, { user, params }) => {
  try {
const userRole = user.role as string
    const userDepartment = user.department as string
    const userId = user.id

    // Check if user is WEB department or admin
    const isAdmin = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(userRole)
    const isWebTeam = userDepartment === 'WEB'

    if (!isAdmin && !isWebTeam) {
      return NextResponse.json(
        { error: 'Only web team or admins can access web clients' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const webProjectStatus = searchParams.get('webProjectStatus')
    const { skip, take, page, limit } = getPaginationParams(req)

    // Build filter
    const filter: Record<string, unknown> = {
      isWebTeamClient: true,
      deletedAt: null,
    }

    // Filter by web project status (PIPELINE, IN_PROGRESS, COMPLETED, MAINTENANCE)
    if (webProjectStatus) {
      filter.webProjectStatus = webProjectStatus
    }

    // Non-admins only see their assigned web clients
    if (!isAdmin) {
      filter.teamMembers = {
        some: { userId },
      }
    }

    if (status) {
      filter.status = status
    }

    if (search) {
      filter.OR = [
        { name: { contains: search } },
        { contactName: { contains: search } },
        { brandName: { contains: search } },
      ]
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where: filter,
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
          maintenanceContracts: {
            where: { status: 'ACTIVE' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.client.count({ where: filter }),
    ])

    // Add computed fields
    const enrichedClients = clients.map((client) => {
      const completedPhases = client.webProjectPhases.filter(
        (p) => p.status === 'COMPLETED'
      ).length
      const totalPhases = client.webProjectPhases.length
      const progress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0

      return {
        ...client,
        phaseProgress: {
          completed: completedPhases,
          total: totalPhases,
          percentage: progress,
        },
        hasActiveContract: client.maintenanceContracts.length > 0,
      }
    })

    return NextResponse.json(paginatedResponse(enrichedClients, total, page, limit))
  } catch (error) {
    console.error('Error fetching web clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch web clients' },
      { status: 500 }
    )
  }
})

/**
 * POST /api/web-clients
 * Create a new web team client (direct add, no approval needed)
 */
export const POST = withAuth(async (req, { user, params }) => {
  try {
const userRole = user.role as string
    const userDepartment = user.department as string

    // Check if user is WEB department or admin
    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(userRole)
    const isWebTeam = userDepartment === 'WEB'

    if (!isAdmin && !isWebTeam) {
      return NextResponse.json(
        { error: 'Only web team or admins can create web clients' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const schema = z.object({
      name: z.string().min(1).max(300),
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
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
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
    } = result.data

    // Use transaction to create client, phases, and team member
    const txResult = await prisma.$transaction(async (tx) => {
      const clientId = await generateClientId()

      // Create the client
      const client = await tx.client.create({
        data: {
          id: clientId,
          name,
          contactName: contactName || null,
          contactPhone: contactPhone || null,
          contactEmail: contactEmail || null,
          websiteUrl: websiteUrl || null,
          notes: notes || null,
          clientType: 'ONE_TIME',
          isWebTeamClient: true,
          addedByUserId: user.id,
          serviceSegment: 'WEBSITE',
          billingType: 'ONE_TIME',
          status: 'ACTIVE',
          tier: 'STANDARD',
          webProjectStatus: webProjectStatus || 'IN_PROGRESS',
          websiteType: websiteType || null,
          techStack: techStack || null,
          webProjectStartDate: webProjectStartDate ? new Date(webProjectStartDate) : new Date(),
          webProjectEndDate: webProjectEndDate ? new Date(webProjectEndDate) : null,
        },
      })

      // Create 6 web project phases
      const phases = WEB_PROJECT_PHASES.map((phase) => ({
        clientId: client.id,
        phase: phase.value,
        status: 'PENDING',
        order: phase.order,
      }))

      await tx.webProjectPhase.createMany({
        data: phases,
      })

      // Auto-assign creator as team member (WEB_DEVELOPER role)
      await tx.clientTeamMember.create({
        data: {
          clientId: client.id,
          userId: user.id,
          role: 'WEB_DEVELOPER',
          isPrimary: true,
        },
      })

      return client
    })

    return NextResponse.json({
      success: true,
      clientId: txResult.id,
      message: 'Web client created successfully',
    })
  } catch (error) {
    console.error('Error creating web client:', error)
    return NextResponse.json(
      { error: 'Failed to create web client' },
      { status: 500 }
    )
  }
})
