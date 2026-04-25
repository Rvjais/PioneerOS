import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import crypto from 'crypto'

const SECRET_KEY = 'ae53850ab564f71ac0d46ea8654af455'

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// GET: List all users and clients (requires secret key)
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  if (key !== SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      empId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      department: true,
      status: true,
      profile: { select: { profilePicture: true } },
    },
    orderBy: { empId: 'asc' },
  })

  const clients = await prisma.clientUser.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      client: { select: { id: true, name: true } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ users, clients })
}

// POST: Generate login link for employee or client (requires secret key)
export async function POST(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  if (key !== SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId, type } = await request.json()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

  // Client login
  if (type === 'client') {
    const clientUser = await prisma.clientUser.findUnique({
      where: { id: userId },
      include: { client: { select: { name: true } } },
    })
    if (!clientUser) {
      return NextResponse.json({ error: 'Client user not found' }, { status: 404 })
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await prisma.clientUser.update({
      where: { id: clientUser.id },
      data: { sessionToken, sessionExpiresAt },
    })

    const magicLink = `${appUrl}/api/client-portal/magic-login?token=${sessionToken}`
    return NextResponse.json({
      magicLink,
      user: { name: clientUser.name, email: clientUser.email, client: clientUser.client.name },
    })
  }

  // Employee login
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Delete existing unused tokens
  await prisma.magicLinkToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  })

  // Create new token
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashToken(token)

  await prisma.magicLinkToken.create({
    data: {
      token: tokenHash,
      userId: user.id,
      channel: 'EMAIL',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  })

  const magicLink = `${appUrl}/auth/magic?token=${token}`
  return NextResponse.json({ magicLink, user: { empId: user.empId, firstName: user.firstName, role: user.role } })
}
