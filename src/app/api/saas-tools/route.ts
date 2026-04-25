import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { requireAuth, isAuthError, ADMIN_ROLES, isAdminOrManager } from '@/server/auth/rbac'
import { encrypt, decrypt } from '@/server/security/encryption'

// GET - List all SaaS tools
export async function GET(request: Request) {
  try {
    const auth = await requireAuth({ allowAny: true })
    if (isAuthError(auth)) return auth.error

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const canViewCredentials = isAdminOrManager(auth.user.role)

    const tools = await prisma.saasTool.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        url: true,
        loginType: true,
        notes: true,
        // Only include credentials for admins/managers
        ...(canViewCredentials
          ? {
              email: true,
              password: true,
            }
          : {}),
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    // Get unique categories
    const categories = await prisma.saasTool.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    })

    // SECURITY FIX: Decrypt passwords before returning
    const decryptedTools = tools.map(tool => ({
      ...tool,
      password: tool.password ? decrypt(tool.password) : null,
    }))

    return NextResponse.json({
      tools: decryptedTools,
      categories: categories.map((c) => c.category),
      canViewCredentials,
    })
  } catch (error) {
    console.error('Failed to fetch SaaS tools:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new SaaS tool (admin only)
export async function POST(request: Request) {
  try {
    const auth = await requireAuth({ roles: ADMIN_ROLES })
    if (isAuthError(auth)) return auth.error

    const body = await request.json()
    const { name, category, description, url, loginType, email, password, notes } = body

    if (!name || !category || !url) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, url' },
        { status: 400 }
      )
    }

    // SECURITY FIX: Encrypt password before storing
    const tool = await prisma.saasTool.create({
      data: {
        name,
        category,
        description: description || null,
        url,
        loginType: loginType || 'team',
        email: email || null,
        password: password ? encrypt(password) : null,
        notes: notes || null,
      },
    })

    return NextResponse.json({ tool })
  } catch (error) {
    console.error('Failed to create SaaS tool:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
