import { NextRequest, NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

// Log activity
async function logActivity(clientUserId: string, action: string, resource?: string, resourceType?: string, details?: object) {
  await prisma.clientUserActivity.create({
    data: {
      clientUserId,
      action,
      resource,
      resourceType,
      details: details ? JSON.stringify(details) : null,
    },
  })
}

const documentSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(['GENERAL', 'CONTRACT', 'REPORT', 'INVOICE', 'BRAND_ASSET', 'DELIVERABLE', 'OTHER']).default('GENERAL'),
  fileUrl: z.string().url(),
  fileType: z.string().max(20),
  fileSize: z.number().positive(),
})

// GET /api/client-portal/documents - List documents
export const GET = withClientAuth(async (req: NextRequest, { user }) => {
  const searchParams = req.nextUrl.searchParams
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  const [documents, totalCount, categories] = await Promise.all([
    prisma.clientDocument.findMany({
      where: {
        clientId: user.clientId,
        AND: [
          {
            OR: [
              { isPublic: true },
              { uploadedById: user.id },
            ],
          },
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
          category ? { category } : {},
          search
            ? {
                OR: [
                  { name: { contains: search } },
                  { description: { contains: search } },
                ],
              }
            : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        uploadedBy: { select: { name: true } },
      },
    }),
    prisma.clientDocument.count({
      where: {
        clientId: user.clientId,
        AND: [
          {
            OR: [
              { isPublic: true },
              { uploadedById: user.id },
            ],
          },
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
        ],
      },
    }),
    prisma.clientDocument.groupBy({
      by: ['category'],
      where: { clientId: user.clientId },
      _count: { category: true },
    }),
  ])

  // Log activity
  await logActivity(user.id, 'VIEW_DOCUMENTS', undefined, 'DOCUMENT', { category, search })

  return NextResponse.json({
    documents,
    totalCount,
    hasMore: offset + limit < totalCount,
    categories: categories.map((c) => ({ category: c.category, count: c._count.category })),
  })
}, { rateLimit: 'READ' })

// POST /api/client-portal/documents - Upload document (PRIMARY/SECONDARY only)
export const POST = withClientAuth(async (req: NextRequest, { user }) => {
  if (user.role === 'VIEWER') {
    return NextResponse.json({ error: 'Viewers cannot upload documents' }, { status: 403 })
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
      clientId: user.clientId,
      name: data.name,
      description: data.description,
      category: data.category,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      fileSize: data.fileSize,
      uploadedById: user.id,
      isPublic: true,
      allowDownload: true,
    },
  })

  await logActivity(user.id, 'UPLOAD_DOCUMENT', `document:${document.id}`, 'DOCUMENT', { name: data.name, category: data.category })

  return NextResponse.json({ success: true, document })
}, { rateLimit: 'WRITE' })

// DELETE /api/client-portal/documents - Delete document (owner or PRIMARY only)
export const DELETE = withClientAuth(async (req: NextRequest, { user }) => {
  const searchParams = req.nextUrl.searchParams
  const documentId = searchParams.get('id')

  if (!documentId) {
    return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
  }

  const document = await prisma.clientDocument.findFirst({
    where: {
      id: documentId,
      clientId: user.clientId,
    },
  })

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Only owner or PRIMARY can delete
  if (document.uploadedById !== user.id && user.role !== 'PRIMARY') {
    return NextResponse.json({ error: 'You do not have permission to delete this document' }, { status: 403 })
  }

  await prisma.clientDocument.delete({
    where: { id: documentId },
  })

  await logActivity(user.id, 'DELETE_DOCUMENT', `document:${documentId}`, 'DOCUMENT', { name: document.name })

  return NextResponse.json({ success: true })
}, { rateLimit: 'WRITE' })
