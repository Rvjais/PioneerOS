import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const updateAssetSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.string().max(100).optional(),
  brand: z.string().max(200).optional().nullable(),
  model: z.string().max(200).optional().nullable(),
  serialNumber: z.string().max(200).optional().nullable(),
  purchaseDate: z.string().max(50).optional().nullable(),
  purchasePrice: z.union([z.string(), z.number()]).optional().nullable(),
  warrantyEnd: z.string().max(50).optional().nullable(),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).optional(),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED']).optional(),
})

export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        assignments: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { assignedAt: 'desc' },
        },
      },
    })

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Failed to get asset:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!
    const body = await req.json()
    const parsed = updateAssetSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const validatedData = parsed.data

    // Build update data from provided fields
    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'name',
      'type',
      'brand',
      'model',
      'serialNumber',
      'purchaseDate',
      'purchasePrice',
      'warrantyEnd',
      'condition',
      'status',
    ] as const

    for (const field of allowedFields) {
      if (validatedData[field] !== undefined) {
        if (['purchaseDate', 'warrantyEnd'].includes(field) && validatedData[field]) {
          updateData[field] = new Date(validatedData[field] as string)
        } else if (field === 'purchasePrice' && validatedData[field] !== null) {
          updateData[field] = parseFloat(String(validatedData[field]))
        } else {
          updateData[field] = validatedData[field]
        }
      }
    }

    const asset = await prisma.asset.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Failed to update asset:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // Check if user is admin or HR
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, department: true },
    })

    const canDelete = dbUser?.role === 'SUPER_ADMIN' || dbUser?.department === 'HR'
    if (!canDelete) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = await routeParams!

    await prisma.asset.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete asset:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
