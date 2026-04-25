import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { z } from 'zod'
import { checkRateLimit } from '@/server/security/rateLimit'

const impersonateSchema = z.object({
  targetUserId: z.string().min(1),
  reason: z.string().optional(),
})

// Relaxed CSRF check: accept if origin/referer matches, or if running on localhost/127.0.0.1
function validateRequestOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  const referer = req.headers.get('referer')
  const host = req.headers.get('host') || req.headers.get('x-forwarded-host') || ''

  // Skip validation for local development
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
  if (isLocalhost) return true

  // If no origin or referer header, accept if localhost, otherwise fail
  if (!origin && !referer) return false

  const sourceUrl = origin || referer!
  try {
    const sourceHost = new URL(sourceUrl).host
    // Accept if source host matches host, or if source is localhost variant
    return sourceHost === host || sourceHost.includes('localhost') || sourceHost.includes('127.0.0.1')
  } catch { return false }
}

// POST - Start impersonation
export async function POST(req: NextRequest) {
  try {
    // CSRF protection: validate request origin
    if (!validateRequestOrigin(req)) {
      return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }

    const session = await getServerSession(authOptions)

    // Check if current user is admin (use originalRole if impersonating)
    const currentRole = session?.user.isImpersonating
      ? session.user.originalRole
      : session?.user.role

    if (!session || currentRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Only Super Admins can impersonate.' }, { status: 401 })
    }

    // Rate limit: 5 impersonation attempts per hour per admin
    const adminId = session.user.isImpersonating
      ? session.user.originalAdminId
      : session.user.id
    const rateLimitResult = await checkRateLimit(`impersonate:${adminId}`, {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000, // 1 hour
    })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many impersonation attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter || 60) } }
      )
    }

    const raw = await req.json()
    const parsed = impersonateSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    const { targetUserId, reason } = parsed.data

    // Prevent self-impersonation
    if (targetUserId === adminId) {
      return NextResponse.json({ error: 'Cannot impersonate yourself' }, { status: 400 })
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        empId: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    // Create impersonation session record
    const impersonationSession = await prisma.impersonationSession.create({
      data: {
        adminId: adminId!,
        targetUserId,
        reason: reason || 'Administrative access',
      },
    })

    // Structured audit log for compliance — ImpersonationSession record already created above
    const impersonationIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
    console.warn(JSON.stringify({
      event: 'IMPERSONATION_START',
      adminId: adminId,
      adminEmpId: session.user.empId,
      targetUserId,
      targetEmpId: targetUser.empId,
      reason: reason || 'Administrative access',
      ip: impersonationIp,
      sessionId: impersonationSession.id,
      timestamp: new Date().toISOString(),
    }))

    // Return the impersonated user data - client will update session
    return NextResponse.json({
      success: true,
      message: `Now impersonating ${targetUser.firstName} ${targetUser.lastName || ''}`,
      sessionId: impersonationSession.id,
      impersonatedUser: {
        id: targetUser.id,
        empId: targetUser.empId,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        role: targetUser.role,
        department: targetUser.department,
      },
    })
  } catch (error) {
    console.error('Error starting impersonation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - End impersonation
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only SUPER_ADMIN can end impersonation sessions
    const currentRole = session.user.isImpersonating
      ? session.user.originalRole
      : session.user.role
    if (currentRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get sessionId from query params
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    if (sessionId) {
      // End the impersonation session — verify ownership to prevent other admins ending sessions
      const currentAdminId = session.user.isImpersonating
        ? session.user.originalAdminId
        : session.user.id
      await prisma.impersonationSession.updateMany({
        where: {
          id: sessionId,
          adminId: currentAdminId!,
          endedAt: null,
        },
        data: { endedAt: new Date() },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Impersonation ended',
    })
  } catch (error) {
    console.error('Error ending impersonation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get impersonation history (for audit)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use originalRole when impersonating, same as POST/DELETE handlers
    const currentRole = session.user.isImpersonating
      ? session.user.originalRole
      : session.user.role
    if (currentRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50') || 50, 100)

    const sessions = await prisma.impersonationSession.findMany({
      orderBy: { startedAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching impersonation history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
