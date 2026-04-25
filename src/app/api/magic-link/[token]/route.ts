import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { cookies } from 'next/headers'
import { encode } from 'next-auth/jwt'
import { safeJsonParse } from '@/shared/utils/safeJson'

interface MagicLinkUserData {
  id: string
  empId: string
  firstName: string
  lastName: string
  role: string
  department: string
  ndaSigned: boolean
  profileCompletionStatus: string
  customRoles: { id: string; name: string; displayName: string; baseRoles: string[]; departments: string[]; permissions: Record<string, boolean> | null }[]
  isClient?: boolean
  clientId?: string
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Get IP address from request
    const forwardedFor = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const requestIp = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'

    // Find the magic link
    const magicLink = await prisma.magicLink.findUnique({
      where: { token },
    })

    if (!magicLink) {
      return NextResponse.json({ error: 'Invalid magic link' }, { status: 404 })
    }

    // Check if expired
    if (new Date() > magicLink.expiresAt) {
      return NextResponse.json({ error: 'Magic link has expired' }, { status: 410 })
    }

    // Check if already used
    if (magicLink.isUsed) {
      return NextResponse.json({ error: 'Magic link has already been used' }, { status: 410 })
    }

    // Check IP restriction if set
    if (magicLink.ipAddress && magicLink.ipAddress !== requestIp) {
      console.warn(`[MAGIC_LINK] IP mismatch for token ${magicLink.id}: expected ${magicLink.ipAddress}, got ${requestIp}`)
      return NextResponse.json({
        error: 'This link is not valid for your network location. Please contact your administrator.',
      }, { status: 403 })
    }

    // Get the user or client
    let userData: MagicLinkUserData | null = null

    if (magicLink.userId) {
      const user = await prisma.user.findUnique({
        where: { id: magicLink.userId },
        include: {
          profile: true,
          customRoles: {
            include: { customRole: true },
          },
        },
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const customRoles = user.customRoles
        .filter((ucr) => ucr.customRole.isActive)
        .map((ucr) => ({
          id: ucr.customRole.id,
          name: ucr.customRole.name,
          displayName: ucr.customRole.displayName,
          baseRoles: safeJsonParse(ucr.customRole.baseRoles, []),
          departments: safeJsonParse(ucr.customRole.departments, []),
          permissions: safeJsonParse(ucr.customRole.permissions, null),
        }))

      userData = {
        id: user.id,
        empId: user.empId,
        firstName: user.firstName,
        lastName: user.lastName || '',
        role: user.role,
        department: user.department,
        ndaSigned: user.profile?.ndaSigned || false,
        profileCompletionStatus: user.profileCompletionStatus,
        customRoles,
      }
    } else if (magicLink.clientId) {
      const client = await prisma.client.findUnique({
        where: { id: magicLink.clientId },
      })

      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      }

      userData = {
        id: client.id,
        empId: `CLIENT-${client.id.slice(0, 6)}`,
        firstName: client.name,
        lastName: '',
        role: 'CLIENT',
        department: 'CLIENT',
        ndaSigned: true,
        profileCompletionStatus: 'VERIFIED',
        customRoles: [],
        isClient: true,
        clientId: client.id,
      }
    }

    if (!userData) {
      return NextResponse.json({ error: 'No valid user associated with this link' }, { status: 400 })
    }

    // Mark the magic link as used
    await prisma.magicLink.update({
      where: { id: magicLink.id },
      data: { isUsed: true, usedAt: new Date() },
    })

    // Create a session token
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'Auth not configured' }, { status: 503 })
    }
    const token_data = {
      id: userData.id,
      empId: userData.empId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      department: userData.department,
      ndaSigned: userData.ndaSigned,
      profileCompletionStatus: userData.profileCompletionStatus,
      customRoles: userData.customRoles,
      isMagicLink: true,
    }

    const sessionToken = await encode({
      token: token_data,
      secret,
      maxAge: 24 * 60 * 60, // 24 hours
    })

    // Set the session cookie
    const cookieStore = await cookies()
    cookieStore.set('next-auth.session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60,
    })

    return NextResponse.json({
      success: true,
      user: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        department: userData.department,
      },
      redirectTo: userData.isClient ? '/client' : `/${userData.role.toLowerCase()}`,
    })
  } catch (error) {
    console.error('Error consuming magic link:', error)
    return NextResponse.json({ error: 'Failed to process magic link' }, { status: 500 })
  }
}

// Validate token without consuming it
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const forwardedFor = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const requestIp = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'

    const magicLink = await prisma.magicLink.findUnique({
      where: { token },
    })

    if (!magicLink) {
      return NextResponse.json({ valid: false, error: 'Invalid token' })
    }

    const isExpired = new Date() > magicLink.expiresAt
    const ipMismatch = magicLink.ipAddress && magicLink.ipAddress !== requestIp

    return NextResponse.json({
      valid: !isExpired && !magicLink.isUsed && !ipMismatch,
      isUsed: magicLink.isUsed,
      isExpired,
      ipMismatch: !!ipMismatch,
      role: magicLink.role,
      department: magicLink.department,
      expiresAt: magicLink.expiresAt,
    })
  } catch (error) {
    console.error('Error validating magic link:', error)
    return NextResponse.json({ valid: false, error: 'Validation failed' })
  }
}
