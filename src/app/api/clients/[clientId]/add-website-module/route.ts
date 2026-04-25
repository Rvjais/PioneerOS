import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

/**
 * POST /api/clients/[clientId]/add-website-module
 * Enables website access for an existing client and optionally creates a web project
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only managers and admins can add website module
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER', 'SALES']
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { clientId } = await params
    const body = await request.json()
    const {
      createProject = true,
      projectName,
      projectType,
      quotedAmount,
      assignedToId,
    } = body

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        clientUsers: true,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check if already has website access
    if (client.isWebTeamClient) {
      return NextResponse.json(
        { error: 'Client already has website module enabled' },
        { status: 400 }
      )
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update client to enable web team flag
      const updatedClient = await tx.client.update({
        where: { id: clientId },
        data: {
          isWebTeamClient: true,
        },
      })

      // 2. Update all client users to have website access
      await tx.clientUser.updateMany({
        where: { clientId },
        data: {
          hasWebsiteAccess: true,
        },
      })

      // 3. Create web project if requested
      let webProject: Awaited<ReturnType<typeof tx.webProject.create>> | null = null
      if (createProject) {
        webProject = await tx.webProject.create({
          data: {
            clientId,
            name: projectName || `${client.name} Website`,
            projectType: projectType || 'NEW_WEBSITE',
            currentPhase: 'CONTENT',
            status: 'IN_PROGRESS',
            quotedAmount: quotedAmount ? parseFloat(quotedAmount) : null,
            projectManagerId: assignedToId || null,
          },
        })
      }

      // 4. Create upsell opportunity record as WON
      await tx.upsellOpportunity.create({
        data: {
          clientId,
          type: 'WEBSITE',
          title: `Website Module - ${client.name}`,
          description: 'Website module added to existing marketing client',
          estimatedValue: quotedAmount ? parseFloat(quotedAmount) : 0,
          probability: 100,
          status: 'WON',
          pitchedDate: new Date(),
          assignedTo: session.user.id,
        },
      })

      return { updatedClient, webProject }
    })

    return NextResponse.json({
      success: true,
      message: 'Website module added successfully',
      client: {
        id: result.updatedClient.id,
        name: result.updatedClient.name,
        isWebTeamClient: result.updatedClient.isWebTeamClient,
      },
      webProject: result.webProject
        ? {
            id: result.webProject.id,
            name: result.webProject.name,
          }
        : null,
    })
  } catch (error) {
    console.error('Error adding website module:', error)
    return NextResponse.json(
      { error: 'Failed to add website module' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/clients/[clientId]/add-website-module
 * Removes website access for a client (keeps project history)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only super admins can remove website module
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { clientId } = await params

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Update client and users
    await prisma.$transaction(async (tx) => {
      await tx.client.update({
        where: { id: clientId },
        data: {
          isWebTeamClient: false,
        },
      })

      await tx.clientUser.updateMany({
        where: { clientId },
        data: {
          hasWebsiteAccess: false,
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Website module removed successfully',
    })
  } catch (error) {
    console.error('Error removing website module:', error)
    return NextResponse.json(
      { error: 'Failed to remove website module' },
      { status: 500 }
    )
  }
}
