import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { checkClientAccess } from '@/server/services/clientAccess'
import { z } from 'zod'

const documentSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  category: z.enum(['GENERAL', 'CONTRACT', 'REPORT', 'INVOICE', 'BRAND_ASSET', 'DELIVERABLE', 'OTHER']).default('GENERAL'),
  fileUrl: z.string().url(),
  fileType: z.string().max(20),
  fileSize: z.number().positive().max(50 * 1024 * 1024, 'File size must be under 50MB'),
  isPublic: z.boolean().default(true),
  allowDownload: z.boolean().default(true),
  expiresAt: z.string().transform((s) => new Date(s)).optional().nullable(),
})

// GET /api/clients/[clientId]/documents - List documents
export const GET = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  const access = await checkClientAccess(user, clientId)
  if (!access.canView) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const searchParams = req.nextUrl.searchParams
  const category = searchParams.get('category')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100) // Max 100
  const skip = (page - 1) * limit

  const [documents, total] = await Promise.all([
    prisma.clientDocument.findMany({
      where: {
        clientId,
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: { select: { name: true } },
      },
      take: limit,
      skip,
    }),
    prisma.clientDocument.count({
      where: {
        clientId,
        ...(category ? { category } : {}),
      },
    }),
  ])

  return NextResponse.json({
    documents,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  })
})

// POST /api/clients/[clientId]/documents - Upload document
export const POST = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  const access = await checkClientAccess(user, clientId)
  if (!access.canView) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const body = await req.json()
  const validation = documentSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const data = validation.data

  const document = await prisma.clientDocument.create({
    data: {
      clientId,
      name: data.name,
      description: data.description,
      category: data.category,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      fileSize: data.fileSize,
      isPublic: data.isPublic,
      allowDownload: data.allowDownload,
      expiresAt: data.expiresAt,
      uploadedByStaff: user.id,
    },
  })

  // Create notification for client
  await prisma.portalNotification.create({
    data: {
      clientId,
      title: 'New Document Shared',
      message: `A new ${data.category.toLowerCase()} document "${data.name}" has been shared with you.`,
      type: 'INFO',
      category: 'GENERAL',
      actionUrl: '/portal/documents',
      actionLabel: 'View Document',
      sourceType: 'USER',
      sourceId: user.id,
    },
  })

  return NextResponse.json({ success: true, document })
})

// PUT /api/clients/[clientId]/documents - Update document
export const PUT = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  const access = await checkClientAccess(user, clientId)
  if (!access.canModify) {
    return NextResponse.json({ error: 'Access denied — modify permission required' }, { status: 403 })
  }

  const body = await req.json()
  const { id, ...updateData } = body

  if (!id) {
    return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
  }

  const existing = await prisma.clientDocument.findFirst({
    where: { id, clientId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  const validation = documentSchema.partial().safeParse(updateData)
  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const data = validation.data

  const document = await prisma.clientDocument.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      fileSize: data.fileSize,
      isPublic: data.isPublic,
      allowDownload: data.allowDownload,
      expiresAt: data.expiresAt,
    },
  })

  return NextResponse.json({ success: true, document })
})

// DELETE /api/clients/[clientId]/documents - Delete document
export const DELETE = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  const access = await checkClientAccess(user, clientId)
  if (!access.canDelete) {
    return NextResponse.json({ error: 'Access denied — delete permission required' }, { status: 403 })
  }

  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
  }

  // SECURITY FIX: Verify document belongs to this client before deleting
  const existing = await prisma.clientDocument.findFirst({
    where: { id, clientId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  await prisma.clientDocument.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
})
