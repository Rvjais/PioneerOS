import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import crypto from 'crypto'

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function getVerificationErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)

  if (message.includes('permission denied for schema public')) {
    return NextResponse.json(
      { error: 'Verification is blocked because the database user cannot access schema public. Grant Postgres schema permissions to the app user and retry.' },
      { status: 503 }
    )
  }

  if (message.includes('Authentication failed against database server')) {
    return NextResponse.json(
      { error: 'Verification is blocked because the database credentials are invalid. Update DATABASE_URL and retry.' },
      { status: 503 }
    )
  }

  if (message.includes("Can't reach database server")) {
    return NextResponse.json(
      { error: 'Verification is blocked because the database server is unreachable. Check DATABASE_URL and database availability.' },
      { status: 503 }
    )
  }

  return NextResponse.json(
    { error: 'Verification failed' },
    { status: 500 }
  )
}

// POST: Verify magic link token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Hash the incoming token to look up in DB
    const tokenHash = hashToken(token)

    // Find the token by hash
    const magicToken = await prisma.magicLinkToken.findUnique({
      where: { token: tokenHash },
      include: {
        user: {
          select: {
            id: true,
            empId: true,
            firstName: true,
            lastName: true,
            role: true,
            department: true,
            status: true,
          },
        },
      },
    })

    if (!magicToken) {
      return NextResponse.json(
        { error: 'Invalid or expired link' },
        { status: 400 }
      )
    }

    // Check expiry
    if (new Date() > magicToken.expiresAt) {
      return NextResponse.json(
        { error: 'This link has expired. Please request a new one.' },
        { status: 410 }
      )
    }

    // One-time use: reject if already used
    if (magicToken.usedAt) {
      return NextResponse.json(
        { error: 'This link has already been used. Please request a new one.' },
        { status: 410 }
      )
    }

    // Check if user is active
    if (!['ACTIVE', 'PROBATION'].includes(magicToken.user.status)) {
      return NextResponse.json(
        { error: 'Your account is not active' },
        { status: 403 }
      )
    }

    // Mark as used atomically -- prevent race condition / token replay
    const updated = await prisma.magicLinkToken.updateMany({
      where: { id: magicToken.id, usedAt: null },
      data: { usedAt: new Date() },
    })

    if (updated.count === 0) {
      return NextResponse.json(
        { error: 'This link has already been used. Please request a new one.' },
        { status: 410 }
      )
    }

    // Return user data for session
    return NextResponse.json({
      success: true,
      user: magicToken.user,
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return getVerificationErrorResponse(error)
  }
}
