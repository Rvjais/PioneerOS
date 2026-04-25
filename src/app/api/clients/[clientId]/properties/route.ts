import { prisma } from '@/server/db/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateBody, validationError, idSchema } from '@/shared/validation/validation'
import { withAuth, AuthenticatedUser } from '@/server/auth/withAuth'
import { checkClientAccess } from '@/server/services/clientAccess'

// Schemas for property operations
const propertyTypeSchema = z.enum(['WEBSITE', 'GBP', 'SOCIAL', 'ANALYTICS', 'ADS', 'OTHER'])

const createPropertySchema = z.object({
  type: propertyTypeSchema,
  name: z.string().min(1, 'Name required').max(100),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  isPrimary: z.boolean().optional().default(false),
})

const updatePropertySchema = z.object({
  propertyId: idSchema,
  type: propertyTypeSchema.optional(),
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional().or(z.literal('')),
  isPrimary: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

// GET - Fetch client properties (GBPs, websites, etc.)
export const GET = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check authorization
  const access = await checkClientAccess(user, clientId)
  if (!access.canView) {
    return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
  }

  const properties = await prisma.clientProperty.findMany({
    where: { clientId },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  })

  return NextResponse.json({ properties })
})

// POST - Create a new property
export const POST = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check authorization - must be able to modify
  const access = await checkClientAccess(user, clientId)
  if (!access.canModify) {
    return NextResponse.json({ error: 'You do not have permission to modify this client' }, { status: 403 })
  }

  // Validate request body
  const validation = await validateBody(req, createPropertySchema)
  if (!validation.success) {
    return validationError(validation.error)
  }

  const { type, name, url, isPrimary } = validation.data

  // Verify client exists
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  })

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Use transaction to ensure atomicity when setting primary
  const property = await prisma.$transaction(async (tx) => {
    // If this is primary, unset other primaries of same type
    if (isPrimary) {
      await tx.clientProperty.updateMany({
        where: { clientId, type, isPrimary: true },
        data: { isPrimary: false },
      })
    }

    return tx.clientProperty.create({
      data: {
        clientId,
        type,
        name,
        url,
        isPrimary: isPrimary || false,
      },
    })
  })

  return NextResponse.json({ property }, { status: 201 })
})

// PATCH - Update a property
export const PATCH = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check authorization
  const access = await checkClientAccess(user, clientId)
  if (!access.canModify) {
    return NextResponse.json({ error: 'You do not have permission to modify this client' }, { status: 403 })
  }

  // Validate request body
  const validation = await validateBody(req, updatePropertySchema)
  if (!validation.success) {
    return validationError(validation.error)
  }

  const { propertyId, type, name, url, isPrimary, isActive } = validation.data

  // Verify property exists and belongs to client
  const existing = await prisma.clientProperty.findFirst({
    where: { id: propertyId, clientId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  // Use transaction for atomicity
  const property = await prisma.$transaction(async (tx) => {
    // If setting as primary, unset others
    if (isPrimary) {
      await tx.clientProperty.updateMany({
        where: { clientId, type: type || existing.type, isPrimary: true, id: { not: propertyId } },
        data: { isPrimary: false },
      })
    }

    return tx.clientProperty.update({
      where: { id: propertyId },
      data: {
        type: type ?? undefined,
        name: name ?? undefined,
        url: url ?? undefined,
        isPrimary: isPrimary ?? undefined,
        isActive: isActive ?? undefined,
      },
    })
  })

  return NextResponse.json({ property })
})

// DELETE - Delete a property
export const DELETE = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check authorization
  const access = await checkClientAccess(user, clientId)
  if (!access.canModify) {
    return NextResponse.json({ error: 'You do not have permission to modify this client' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const propertyId = searchParams.get('propertyId')

  if (!propertyId) {
    return NextResponse.json({ error: 'Property ID required' }, { status: 400 })
  }

  // Verify property exists and belongs to client
  const existing = await prisma.clientProperty.findFirst({
    where: { id: propertyId, clientId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  await prisma.clientProperty.delete({
    where: { id: propertyId },
  })

  return NextResponse.json({ success: true })
})
