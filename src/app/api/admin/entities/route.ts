import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { maskEntities } from '@/server/admin/maskEntity'
import { z } from 'zod'

// Check if user has super admin or accounts role
async function checkFinanceAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, department: true },
  })
  return user?.role === 'SUPER_ADMIN' || user?.role === 'ACCOUNTS' || user?.department === 'ACCOUNTS'
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has finance/admin access
    const hasAccess = await checkFinanceAccess(session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied. Finance/Admin only.' }, { status: 403 })
    }

    const searchParams = req.nextUrl.searchParams
    const showFull = searchParams.get('showFull') === 'true'

    // Only super admin can see full unmasked data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })
    const canShowFull = user?.role === 'SUPER_ADMIN' && showFull

    const take = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200)

    const entities = await prisma.companyEntity.findMany({
      include: {
        bankAccounts: true,
        paymentGateways: true,
      },
      orderBy: { isPrimary: 'desc' },
      take,
    })

    // Mask sensitive data unless super admin requests full view
    const maskedEntities = maskEntities(entities, canShowFull)

    return NextResponse.json(maskedEntities)
  } catch (error) {
    console.error('Failed to fetch entities:', error)
    return NextResponse.json({ error: 'Failed to fetch entities' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only super admin can create entities
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })
    if (user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied. Super admin only.' }, { status: 403 })
    }

    const body = await req.json()
    const schema = z.object({
      code: z.string().min(1).max(50),
      name: z.string().min(1).max(300),
      tradeName: z.string().max(300).optional(),
      type: z.string().max(50).optional(),
      country: z.string().max(10).optional(),
      gstNumber: z.string().max(50).optional(),
      panNumber: z.string().max(50).optional(),
      cinNumber: z.string().max(50).optional(),
      email: z.string().email().optional(),
      phone: z.string().max(20).optional(),
      website: z.string().max(500).optional(),
      invoicePrefix: z.string().max(20).optional(),
      registeredAddress: z.string().max(500).optional(),
      city: z.string().max(100).optional(),
      state: z.string().max(100).optional(),
      pincode: z.string().max(20).optional(),
      isPrimary: z.boolean().optional(),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { code, name, tradeName, type, country, gstNumber, panNumber, cinNumber, email, phone, website, invoicePrefix, registeredAddress, city, state, pincode, isPrimary } = result.data

    // Use transaction to prevent race condition when setting primary
    const entity = await prisma.$transaction(async (tx) => {
      if (isPrimary) {
        await tx.companyEntity.updateMany({
          where: { isPrimary: true },
          data: { isPrimary: false },
        })
      }

      return tx.companyEntity.create({
        data: {
          code,
          name,
          tradeName: tradeName || null,
          type: type || 'PVT_LTD',
          country: country || 'IN',
          gstNumber: gstNumber || null,
          panNumber: panNumber || null,
          cinNumber: cinNumber || null,
          email: email || null,
          phone: phone || null,
          website: website || null,
          invoicePrefix: invoicePrefix || code.substring(0, 3).toUpperCase(),
          registeredAddress: registeredAddress || null,
          city: city || null,
          state: state || null,
          pincode: pincode || null,
          isPrimary: isPrimary || false,
        },
      })
    })

    return NextResponse.json(entity)
  } catch (error) {
    console.error('Failed to create entity:', error)
    return NextResponse.json({ error: 'Failed to create entity' }, { status: 500 })
  }
}
