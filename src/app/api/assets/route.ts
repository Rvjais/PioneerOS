import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { generateAssetTag } from '@/server/db/sequence'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createAssetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  type: z.string().min(1, 'Type is required').max(100),
  brand: z.string().max(200).optional().nullable(),
  model: z.string().max(200).optional().nullable(),
  serialNumber: z.string().max(200).optional().nullable(),
  purchaseDate: z.string().max(50).optional().nullable(),
  purchasePrice: z.union([z.string(), z.number()]).optional().nullable(),
  warrantyEnd: z.string().max(50).optional().nullable(),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).optional(),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED']).optional(),
})

export const GET = withAuth(async (req, { user, params }) => {
  try {
// SECURITY FIX: Only Accounts, Admin, and IT can view all assets
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Asset management requires admin access' }, { status: 403 })
    }

    const assets = await prisma.asset.findMany({
      include: {
        assignments: {
          where: { returnedAt: null },
          include: { user: { select: { id: true, firstName: true, lastName: true, department: true } } },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(assets)
  } catch (error) {
    console.error('Failed to get assets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = withAuth(async (req, { user, params }) => {
  try {
// SECURITY FIX: Only Accounts and Admin can create assets
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Asset creation requires admin access' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = createAssetSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Generate asset tag atomically (prevents race conditions)
    const assetTag = await generateAssetTag()

    const asset = await prisma.asset.create({
      data: {
        assetTag,
        name: data.name,
        type: data.type,
        brand: data.brand ?? null,
        model: data.model ?? null,
        serialNumber: data.serialNumber ?? null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchasePrice: data.purchasePrice ? parseFloat(String(data.purchasePrice)) : null,
        warrantyEnd: data.warrantyEnd ? new Date(data.warrantyEnd) : null,
        condition: data.condition || 'GOOD',
        status: data.status || 'AVAILABLE',
      },
    })

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Failed to create asset:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
