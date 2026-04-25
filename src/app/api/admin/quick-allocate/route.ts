import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

/**
 * POST /api/admin/quick-allocate
 * Simplified bulk allocation - assign multiple employees to one or more clients
 */
export const POST = withAuth(async (req, { user, params }) => {
  try {
const userRole = user.role as string
    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(userRole)

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can allocate team members' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const schema = z.object({
      clientIds: z.array(z.string().min(1)).min(1),
      userIds: z.array(z.string().min(1)).min(1),
      role: z.string().min(1).max(100),
      isPrimary: z.boolean().optional().default(false),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { clientIds, userIds, role, isPrimary } = result.data

    // Verify all clients exist
    const clients = await prisma.client.findMany({
      where: { id: { in: clientIds }, deletedAt: null },
      select: { id: true, name: true },
    })

    if (clients.length !== clientIds.length) {
      return NextResponse.json(
        { error: 'One or more clients not found' },
        { status: 404 }
      )
    }

    // Verify all users exist
    const users = await prisma.user.findMany({
      where: { id: { in: userIds }, deletedAt: null },
      select: { id: true, firstName: true, lastName: true },
    })

    if (users.length !== userIds.length) {
      return NextResponse.json(
        { error: 'One or more employees not found' },
        { status: 404 }
      )
    }

    // Prepare allocation data
    const allocations: Array<{
      clientId: string
      userId: string
      role: string
      isPrimary: boolean
    }> = []

    for (const clientId of clientIds) {
      for (const userId of userIds) {
        allocations.push({
          clientId,
          userId,
          role,
          isPrimary,
        })
      }
    }

    // Create allocations, skipping duplicates
    const results = {
      created: 0,
      skipped: 0,
      errors: 0,
    }

    for (const allocation of allocations) {
      try {
        // Check if already exists
        const existing = await prisma.clientTeamMember.findUnique({
          where: {
            clientId_userId: {
              clientId: allocation.clientId,
              userId: allocation.userId,
            },
          },
        })

        if (existing) {
          // Update role if different
          if (existing.role !== allocation.role) {
            await prisma.clientTeamMember.update({
              where: { id: existing.id },
              data: { role: allocation.role, isPrimary: allocation.isPrimary },
            })
            results.created++
          } else {
            results.skipped++
          }
        } else {
          await prisma.clientTeamMember.create({
            data: allocation,
          })
          results.created++
        }
      } catch (err) {
        console.error('Error creating allocation:', err)
        results.errors++
      }
    }

    // Send notifications to allocated users
    const clientNames = clients.map((c) => c.name).join(', ')
    for (const userId of userIds) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'CLIENT_ASSIGNMENT',
          title: 'New Client Assignment',
          message: `You have been assigned to: ${clientNames}`,
          link: clientIds.length === 1 ? `/clients/${clientIds[0]}` : '/clients',
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: `Allocated ${results.created} assignments, skipped ${results.skipped} existing, ${results.errors} errors`,
      results,
    })
  } catch (error) {
    console.error('Error in quick allocate:', error)
    return NextResponse.json(
      { error: 'Failed to allocate team members' },
      { status: 500 }
    )
  }
})
