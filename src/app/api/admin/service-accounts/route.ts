import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import prisma from '@/server/db/prisma'
import { ACCESS_INSTRUCTIONS } from '@/server/integrations/service-accounts'

// GET - List all service accounts
export async function GET() {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const serviceAccounts = await prisma.agencyServiceAccount.findMany({
      where: { isActive: true },
      orderBy: [{ platform: 'asc' }, { serviceType: 'asc' }],
    })

    // Include access instructions
    const instructions = ACCESS_INSTRUCTIONS

    return NextResponse.json({ serviceAccounts, instructions })
  } catch (error) {
    console.error('Failed to fetch service accounts:', error)

    // Check for specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string }
      if (prismaError.code === 'P2021') {
        // Table does not exist
        return NextResponse.json({
          error: 'Database table not found. Please run prisma migrate.',
          serviceAccounts: [],
          instructions: ACCESS_INSTRUCTIONS,
        })
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new service account
export async function POST(request: Request) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const body = await request.json()
    const { platform, serviceType, email, name, description } = body

    // Validate required fields
    if (!platform || !serviceType || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, serviceType, email, name' },
        { status: 400 }
      )
    }

    // Check for duplicate
    const existing = await prisma.agencyServiceAccount.findUnique({
      where: {
        platform_serviceType: {
          platform,
          serviceType,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Service account already exists for this platform and service type' },
        { status: 400 }
      )
    }

    const serviceAccount = await prisma.agencyServiceAccount.create({
      data: {
        platform,
        serviceType,
        email,
        name,
        description,
      },
    })

    return NextResponse.json({
      serviceAccount,
      message: 'Service account created successfully',
    })
  } catch (error) {
    console.error('Failed to create service account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
