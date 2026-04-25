import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

// Only SUPER_ADMIN can use view-as
async function isSuperAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions)
  if (!session) return false
  const currentRole = (session.user as any).isImpersonating
    ? (session.user as any).originalRole
    : session.user.role
  return currentRole === 'SUPER_ADMIN'
}

// POST - Set viewAsUserId cookie (admin viewing a user's dashboard)
export async function POST(req: NextRequest) {
  if (!await isSuperAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, firstName: true, lastName: true, role: true, department: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const response = NextResponse.json({ success: true, redirect: searchParams.get('redirectTo') || '/' })
  response.cookies.set('viewAsUserId', userId, {
    httpOnly: false, // Allow client JS to read (for banner display)
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  })

  return response
}

// DELETE - Clear viewAsUserId cookie
export async function DELETE(req: NextRequest) {
  if (!await isSuperAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete('viewAsUserId')

  return response
}

// GET - Check current view-as state
export async function GET(req: NextRequest) {
  // This endpoint is public for admins only
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ viewingAs: false })
  }

  const currentRole = (session.user as any).isImpersonating
    ? (session.user as any).originalRole
    : session.user.role
  if (currentRole !== 'SUPER_ADMIN') {
    return NextResponse.json({ viewingAs: false })
  }

  const userId = req.cookies.get('viewAsUserId')?.value

  if (!userId) {
    return NextResponse.json({ viewingAs: false })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, firstName: true, lastName: true, role: true, department: true },
  })

  if (!user) {
    return NextResponse.json({ viewingAs: false })
  }

  return NextResponse.json({
    viewingAs: true,
    userId: user.id,
    name: `${user.firstName} ${user.lastName || ''}`,
    role: user.role,
    department: user.department,
  })
}
