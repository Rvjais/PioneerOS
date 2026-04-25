import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createDocumentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(500),
  type: z.string().min(1, 'Type is required').max(100),
  category: z.string().max(100).optional().nullable(),
  fileUrl: z.string().url().min(1, 'fileUrl is required').max(2000),
  fileSize: z.number().min(0).optional().nullable(),
  mimeType: z.string().max(200).optional().nullable(),
  clientId: z.string().max(100).optional().nullable(),
})

// GET /api/documents - List documents
export const GET = withAuth(async (req, { user, params }) => {
  try {
// SECURITY FIX: Only managers and admins can view all documents
    // Regular employees should only see documents they uploaded or are assigned to
    const isAdmin = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role || '')

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const clientId = searchParams.get('clientId')
    const type = searchParams.get('type')

    const where: Record<string, unknown> = {}
    if (category && category !== 'All') where.category = category
    if (clientId) where.clientId = clientId
    if (type) where.type = type

    // Non-admins can only see their own uploaded documents
    if (!isAdmin) {
      where.uploadedById = user.id
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    // Get stats
    const totalSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0)
    const clientCount = new Set(documents.map(d => d.clientId).filter(Boolean)).size
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const recentCount = documents.filter(d => new Date(d.createdAt) >= weekAgo).length

    return NextResponse.json({
      documents: documents.map(d => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
      })),
      stats: {
        totalFiles: documents.length,
        totalSize,
        clientCount,
        recentCount,
      },
    })
  } catch (error) {
    console.error('Failed to fetch documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
})

// POST /api/documents - Create a document record
export const POST = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const parsed = createDocumentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, type, category, fileUrl, fileSize, mimeType, clientId } = parsed.data

    // Validate URL: must be HTTPS and from allowed domains
    if (!fileUrl.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Invalid URL: only HTTPS URLs are allowed' },
        { status: 400 }
      )
    }

    const ALLOWED_DOMAINS = [
      'storage.googleapis.com',
      'res.cloudinary.com',
      's3.amazonaws.com',
      '.s3.amazonaws.com',
      'blob.vercel-storage.com',
      'utfs.io',
      'drive.google.com',
      'docs.google.com',
      'sheets.google.com',
      'slides.google.com',
      'drive.usercontent.google.com',
      'www.dropbox.com',
      'dl.dropboxusercontent.com',
      'onedrive.live.com',
      '1drv.ms',
      'sharepoint.com',
      'notion.so',
      'www.notion.so',
      'canva.com',
      'www.canva.com',
      'figma.com',
      'www.figma.com',
    ]
    try {
      const urlObj = new URL(fileUrl)
      const isAllowed = ALLOWED_DOMAINS.some(
        (domain) => urlObj.hostname === domain || urlObj.hostname.endsWith(domain)
      )
      if (!isAllowed) {
        return NextResponse.json(
          { error: 'Invalid URL: domain not allowed' },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    const document = await prisma.document.create({
      data: {
        name,
        type,
        category: category || null,
        fileUrl,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        clientId: clientId || null,
        uploadedById: user.id,
      },
      include: {
        client: { select: { id: true, name: true } },
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({
      document: {
        ...document,
        createdAt: document.createdAt.toISOString(),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create document:', error)
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  }
})

// DELETE /api/documents - Delete a document
export const DELETE = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    // Check if user owns the document or is admin
    const document = await prisma.document.findUnique({
      where: { id },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(user.role)
    if (document.uploadedById !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized to delete this document' }, { status: 403 })
    }

    await prisma.document.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete document:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
})
