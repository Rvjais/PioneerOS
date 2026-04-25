import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import { withAuth } from '@/server/auth/withAuth'

// POST - Start client impersonation
export const POST = withAuth(async (req, { user }) => {
  try {
    // Relaxed CSRF check: accept if origin/referer matches, or if running on localhost/127.0.0.1
    const origin = req.headers.get('origin')
    const referer = req.headers.get('referer')
    const host = req.headers.get('host') || req.headers.get('x-forwarded-host') || ''

    // Skip validation for local development
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
    if (isLocalhost) {
      // Continue to next checks below
    } else if (!origin && !referer) {
      return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    } else {
      try {
        const sourceHost = new URL(origin || referer!).host
        if (sourceHost !== host && !sourceHost.includes('localhost') && !sourceHost.includes('127.0.0.1')) {
          return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
        }
      } catch { return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 }) }
    }

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only super admins can impersonate clients
    const admin = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true, firstName: true, lastName: true },
    })

    if (admin?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only super admins can impersonate clients' }, { status: 403 })
    }

    const body = await req.json()
    const { clientUserId, reason } = body

    if (!clientUserId) {
      return NextResponse.json({ error: 'Client user ID is required' }, { status: 400 })
    }

    // Get the client user
    const clientUser = await prisma.clientUser.findUnique({
      where: { id: clientUserId },
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
    })

    if (!clientUser) {
      return NextResponse.json({ error: 'Client user not found' }, { status: 404 })
    }

    if (!clientUser.isActive) {
      return NextResponse.json({ error: 'Client user is inactive' }, { status: 400 })
    }

    // Generate a cryptographically secure impersonation session token
    const impersonationToken = `imp_${randomBytes(32).toString('hex')}`

    // Create impersonation record for audit
    await prisma.impersonationSession.create({
      data: {
        adminId: user.id,
        targetUserId: clientUserId, // Using targetUserId to store clientUserId
        reason: reason || 'Client support',
        actionsPerformed: JSON.stringify({
          type: 'CLIENT_IMPERSONATION',
          clientId: clientUser.clientId,
          clientName: clientUser.client.name,
          clientUserEmail: clientUser.email,
        }),
      },
    })

    // Update client user with session token
    await prisma.clientUser.update({
      where: { id: clientUserId },
      data: {
        sessionToken: impersonationToken,
        lastLoginAt: new Date(),
      },
    })

    // Set the client session cookie
    const cookieStore = await cookies()
    cookieStore.set('client_session', impersonationToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 2, // 2 hours for impersonation
      path: '/',
    })

    // Also set an admin impersonation marker
    cookieStore.set('client_impersonation', JSON.stringify({
      adminId: user.id,
      adminName: `${admin.firstName} ${admin.lastName || ''}`.trim(),
      clientUserId: clientUser.id,
      clientName: clientUser.client.name,
      startedAt: new Date().toISOString(),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 2, // 2 hours
      path: '/',
    })

    return NextResponse.json({
      success: true,
      message: `Now viewing as ${clientUser.name} from ${clientUser.client.name}`,
      redirectUrl: '/client-portal/dashboard',
    })
  } catch (error) {
    console.error('Failed to impersonate client:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// DELETE - End client impersonation
export const DELETE = withAuth(async (req, { user }) => {
  try {
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cookieStore = await cookies()
    const impersonationCookie = cookieStore.get('client_impersonation')

    if (impersonationCookie) {
      try {
        const data = JSON.parse(impersonationCookie.value)

        // Update impersonation session end time
        await prisma.impersonationSession.updateMany({
          where: {
            adminId: data.adminId,
            targetUserId: data.clientUserId,
            endedAt: null,
          },
          data: {
            endedAt: new Date(),
          },
        })

        // Clear the client user's session token
        await prisma.clientUser.update({
          where: { id: data.clientUserId },
          data: { sessionToken: null },
        })
      } catch {
        // Ignore parse errors
      }
    }

    // Clear cookies
    cookieStore.delete('client_session')
    cookieStore.delete('client_impersonation')

    return NextResponse.json({
      success: true,
      message: 'Client impersonation ended',
      redirectUrl: '/admin',
    })
  } catch (error) {
    console.error('Failed to end client impersonation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// GET - Check if currently impersonating a client
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cookieStore = await cookies()
    const impersonationCookie = cookieStore.get('client_impersonation')

    if (!impersonationCookie) {
      return NextResponse.json({ isImpersonating: false })
    }

    try {
      const data = JSON.parse(impersonationCookie.value)
      return NextResponse.json({
        isImpersonating: true,
        ...data,
      })
    } catch {
      return NextResponse.json({ isImpersonating: false })
    }
  } catch (error) {
    console.error('Failed to check impersonation status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
