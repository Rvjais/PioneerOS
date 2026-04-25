import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { createHash, randomBytes } from 'crypto'
import { z } from 'zod'

const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
  phone: z.string().max(20).optional().nullable(),
})

// POST /api/client-portal/invitations/accept - Accept invitation and create account
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = acceptInvitationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const { token, phone } = parsed.data

    // Find valid invitation
    const invitation = await prisma.clientUserInvitation.findFirst({
      where: {
        token,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.clientUser.findUnique({
      where: { email: invitation.email },
    })

    if (existingUser) {
      // Mark invitation as accepted anyway
      await prisma.clientUserInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
      })

      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    // Create the new user
    const sessionToken = createHash('sha256')
      .update(`${invitation.email}-${Date.now()}-${randomBytes(16).toString('hex')}`)
      .digest('hex')

    const newUser = await prisma.clientUser.create({
      data: {
        clientId: invitation.clientId,
        email: invitation.email,
        name: invitation.name,
        phone: phone || null,
        role: invitation.role,
        sessionToken,
        lastLoginAt: new Date(),
      },
    })

    // Update invitation
    await prisma.clientUserInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    })

    // Log activity
    await prisma.clientUserActivity.create({
      data: {
        clientUserId: newUser.id,
        action: 'ACCEPT_INVITATION',
        resource: `invitation:${invitation.id}`,
        resourceType: 'INVITATION',
      },
    })

    // Create welcome notification
    await prisma.portalNotification.create({
      data: {
        clientId: invitation.clientId,
        clientUserId: newUser.id,
        title: 'Welcome to the Portal!',
        message: `Welcome ${newUser.name}! You now have access to ${invitation.client.name}'s client portal. Explore your dashboard to see reports, documents, and more.`,
        type: 'SUCCESS',
        category: 'GENERAL',
        sourceType: 'SYSTEM',
      },
    })

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      clientId: newUser.clientId,
      clientUserId: newUser.id,
      clientName: invitation.client.name,
      userName: newUser.name,
      role: newUser.role,
    })

    response.cookies.set('client_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Failed to accept invitation:', error)
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 })
  }
}

// GET /api/client-portal/invitations/accept - Validate invitation token
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const invitation = await prisma.clientUserInvitation.findFirst({
      where: { token },
      include: {
        client: { select: { name: true } },
        invitedBy: { select: { name: true } },
      },
    })

    if (!invitation) {
      return NextResponse.json({ valid: false, error: 'Invitation not found' })
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json({
        valid: false,
        error: invitation.status === 'ACCEPTED' ? 'Invitation already accepted' : 'Invitation is no longer valid',
      })
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: 'Invitation has expired' })
    }

    return NextResponse.json({
      valid: true,
      invitation: {
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        clientName: invitation.client.name,
        invitedBy: invitation.invitedBy?.name || 'Team',
        expiresAt: invitation.expiresAt,
      },
    })
  } catch (error) {
    console.error('Failed to validate invitation:', error)
    return NextResponse.json({ error: 'Failed to validate invitation' }, { status: 500 })
  }
}
