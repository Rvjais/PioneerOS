import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
  role: z.enum(['PRIMARY', 'SECONDARY', 'VIEWER']).default('VIEWER'),
})

// GET /api/web-clients/[id]/portal-access - Get portal users for client
export const GET = withAuth(async (req, { user, params: routeParams }) => {

  const { id: clientId } = await routeParams!

  try {
    const users = await prisma.clientUser.findMany({
      where: { clientId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        hasMarketingAccess: true,
        hasWebsiteAccess: true,
        createdAt: true,
      },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Failed to fetch portal users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
})

// POST /api/web-clients/[id]/portal-access - Create portal user or generate magic link
export const POST = withAuth(async (req, { user, params: routeParams }) => {

  const { id: clientId } = await routeParams!

  // Role check: only SUPER_ADMIN, MANAGER, or the client's account manager can generate portal access
  const allowedRoles = ['SUPER_ADMIN', 'MANAGER']
  const isAllowedRole = allowedRoles.includes(user.role || '')

  if (!isAllowedRole) {
    // Check if user is the client's account manager
    const clientRecord = await prisma.client.findUnique({
      where: { id: clientId },
      select: { accountManagerId: true },
    })
    if (!clientRecord || clientRecord.accountManagerId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - Only admins, managers, or the account manager can manage portal access' },
        { status: 403 }
      )
    }
  }

  try {
    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const body = await req.json()

    // Check if this is a magic link request for existing user
    if (body.action === 'generate_magic_link' && body.userId) {
      const user = await prisma.clientUser.findFirst({
        where: { id: body.userId, clientId },
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Generate session token
      const sessionToken = randomBytes(32).toString('hex')
      const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      await prisma.clientUser.update({
        where: { id: user.id },
        data: {
          sessionToken,
          sessionExpiresAt,
        },
      })

      // Generate magic link
      const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const magicLink = `${baseUrl}/client-portal?token=${sessionToken}`

      return NextResponse.json({
        success: true,
        magicLink,
        expiresAt: sessionExpiresAt,
      })
    }

    // Create new portal user
    const validation = createUserSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      }, { status: 400 })
    }

    const data = validation.data

    // Check if email already exists for this client
    const existingUser = await prisma.clientUser.findFirst({
      where: { email: data.email, clientId },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // Create user with website access enabled
    const user = await prisma.clientUser.create({
      data: {
        clientId,
        email: data.email,
        name: data.name,
        phone: data.phone || null,
        role: data.role,
        hasMarketingAccess: false,
        hasWebsiteAccess: true,
        isActive: true,
      },
    })

    // Generate magic link for new user
    const sessionToken = randomBytes(32).toString('hex')
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await prisma.clientUser.update({
      where: { id: user.id },
      data: {
        sessionToken,
        sessionExpiresAt,
      },
    })

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const magicLink = `${baseUrl}/client-portal?token=${sessionToken}`

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      magicLink,
      expiresAt: sessionExpiresAt,
    })
  } catch (error) {
    console.error('Failed to create portal access:', error)
    return NextResponse.json({ error: 'Failed to create portal access' }, { status: 500 })
  }
})

// PATCH /api/web-clients/[id]/portal-access - Update user access
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {

  const { id: clientId } = await routeParams!

  try {
    const body = await req.json()
    const { userId, hasMarketingAccess, hasWebsiteAccess, isActive } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const user = await prisma.clientUser.findFirst({
      where: { id: userId, clientId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (hasMarketingAccess !== undefined) updateData.hasMarketingAccess = hasMarketingAccess
    if (hasWebsiteAccess !== undefined) updateData.hasWebsiteAccess = hasWebsiteAccess
    if (isActive !== undefined) updateData.isActive = isActive

    const updatedUser = await prisma.clientUser.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        hasMarketingAccess: true,
        hasWebsiteAccess: true,
        isActive: true,
      },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('Failed to update user access:', error)
    return NextResponse.json({ error: 'Failed to update access' }, { status: 500 })
  }
})
