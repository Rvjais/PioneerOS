import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { createClientToken, verifyClientToken } from '@/server/auth/clientToken'
import { z } from 'zod'

const verifyTokenSchema = z.object({
  token: z.string().min(1),
})

// GET - Generate magic links for all clients (Admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientUsers = await prisma.clientUser.findMany({
      where: { isActive: true },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            services: true,
            status: true,
            currentPaymentStatus: true,
            isWebTeamClient: true,
          }
        }
      },
      orderBy: { client: { name: 'asc' } }
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL
    let protocol: string
    let host: string
    if (baseUrl) {
      const parsed = new URL(baseUrl)
      protocol = parsed.protocol.replace(':', '')
      host = parsed.host
    } else {
      host = req.headers.get('host') || 'localhost:3000'
      protocol = host.includes('localhost') ? 'http' : 'https'
    }

    const links = clientUsers.map(cu => {
      const token = createClientToken(cu.id)
      let services: string[] = []
      try { services = JSON.parse(cu.client.services || '[]') } catch { services = [] }

      // Add WEB service if client has website access or is a web team client
      if ((cu.hasWebsiteAccess || cu.client.isWebTeamClient) && !services.includes('WEB')) {
        services = ['WEB', ...services]
      }

      return {
        clientId: cu.client.id,
        clientUserId: cu.id,
        clientName: cu.client.name,
        email: cu.email,
        services,
        status: cu.client.status,
        paymentStatus: cu.client.currentPaymentStatus,
        hasWebsiteAccess: cu.hasWebsiteAccess,
        hasMarketingAccess: cu.hasMarketingAccess,
        magicLink: `${protocol}://${host}/client-portal/magic?token=${token}`,
        token,
      }
    })

    return NextResponse.json({ links })
  } catch (error) {
    console.error('Failed to generate client magic links:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Verify magic link token and create session
export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()
    const parsed = verifyTokenSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const { token } = parsed.data

    // Verify and decode the signed token
    const payload = verifyClientToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    // Find client user
    const clientUser = await prisma.clientUser.findUnique({
      where: { id: payload.clientUserId },
      include: { client: true }
    })

    if (!clientUser || !clientUser.isActive) {
      return NextResponse.json({ error: 'Client not found or inactive' }, { status: 404 })
    }

    // Create session token
    const crypto = await import('crypto')
    const sessionToken = crypto.createHash('sha256')
      .update(`${clientUser.id}-${Date.now()}-${crypto.randomBytes(16).toString('hex')}`)
      .digest('hex')

    // Update client user with session token, last login, and session expiry
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await prisma.clientUser.update({
      where: { id: clientUser.id },
      data: {
        sessionToken,
        lastLoginAt: new Date(),
        sessionExpiresAt,
      }
    })

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      clientId: clientUser.clientId,
      clientName: clientUser.client.name,
    })

    response.cookies.set('client_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Magic link verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
