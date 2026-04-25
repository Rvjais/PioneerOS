import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { z } from 'zod'

const generateMagicLinkSchema = z.object({
  userId: z.string().optional(),
  clientId: z.string().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  ipRestricted: z.boolean().optional(),
})

const bulkGenerateSchema = z.object({
  ipRestricted: z.boolean().optional(),
})

// Generate magic links for testing - only accessible to SUPER_ADMIN
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only SUPER_ADMIN can generate magic links
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const rawPost = await req.json()
    const parsedPost = generateMagicLinkSchema.safeParse(rawPost)
    if (!parsedPost.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsedPost.error.flatten() }, { status: 400 })
    }
    const { userId, clientId, role, department, ipRestricted } = parsedPost.data

    // Get IP address from request
    const forwardedFor = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'

    // Link expires in 24 hours
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const magicLink = await prisma.magicLink.create({
      data: {
        userId: userId ?? '',
        clientId,
        role: role ?? 'EMPLOYEE',
        department,
        ipAddress: ipRestricted ? ipAddress : null,
        expiresAt,
        createdBy: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      token: magicLink.token,
      expiresAt: magicLink.expiresAt,
      ipAddress: ipRestricted ? ipAddress : null,
    })
  } catch (error) {
    console.error('Error generating magic link:', error)
    return NextResponse.json({ error: 'Failed to generate magic link' }, { status: 500 })
  }
}

// Get all active magic links
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const links = await prisma.magicLink.findMany({
      where: {
        expiresAt: { gt: new Date() },
        isUsed: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(links)
  } catch (error) {
    console.error('Error fetching magic links:', error)
    return NextResponse.json({ error: 'Failed to fetch magic links' }, { status: 500 })
  }
}

// Bulk generate for all roles
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const rawPut = await req.json()
    const parsedPut = bulkGenerateSchema.safeParse(rawPut)
    if (!parsedPut.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsedPut.error.flatten() }, { status: 400 })
    }
    const { ipRestricted } = parsedPut.data

    const forwardedFor = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Get sample users for each role
    const roles = ['SUPER_ADMIN', 'HR', 'MANAGER', 'ACCOUNTS', 'SALES', 'EMPLOYEE', 'FREELANCER', 'INTERN']
    const generatedLinks: Array<{
      role: string
      token: string
      user: string
      department?: string
    }> = []

    for (const role of roles) {
      // Find a user with this role
      const user = await prisma.user.findFirst({
        where: { role, status: 'ACTIVE', deletedAt: null },
        select: { id: true, empId: true, firstName: true, lastName: true, department: true },
      })

      if (user) {
        const link = await prisma.magicLink.create({
          data: {
            userId: user.id,
            role,
            department: user.department,
            ipAddress: ipRestricted ? ipAddress : null,
            expiresAt,
            createdBy: session.user.id,
          },
        })

        generatedLinks.push({
          role,
          token: link.token,
          user: `${user.firstName} ${user.lastName || ''} (${user.empId})`,
          department: user.department,
        })
      }
    }

    // Generate a client link if clients exist
    const client = await prisma.client.findFirst({
      where: { status: { not: 'CHURNED' }, deletedAt: null },
      select: { id: true, name: true },
    })

    if (client) {
      const link = await prisma.magicLink.create({
        data: {
          clientId: client.id,
          role: 'CLIENT',
          ipAddress: ipRestricted ? ipAddress : null,
          expiresAt,
          createdBy: session.user.id,
        },
      })

      generatedLinks.push({
        role: 'CLIENT',
        token: link.token,
        user: client.name,
      })
    }

    return NextResponse.json({
      success: true,
      links: generatedLinks,
      expiresAt,
      ipAddress: ipRestricted ? ipAddress : null,
    })
  } catch (error) {
    console.error('Error bulk generating magic links:', error)
    return NextResponse.json({ error: 'Failed to generate magic links' }, { status: 500 })
  }
}
