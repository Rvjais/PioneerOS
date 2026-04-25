import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// POST: Add file URL to work entry
export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!

    // Check work entry exists and belongs to user
    const entry = await prisma.workEntry.findUnique({
      where: { id },
      include: { client: { select: { name: true } } },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Work entry not found' }, { status: 404 })
    }

    if (entry.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse JSON body for URL-based file addition
    const body = await req.json()
    const { fileUrl, fileName, category } = body

    if (!fileUrl) {
      return NextResponse.json({ error: 'No file URL provided' }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(fileUrl)
    } catch {
      return NextResponse.json({ error: 'Invalid URL provided' }, { status: 400 })
    }

    const fileCategory = category || 'PROOF'
    const finalFileName = fileName || fileUrl.split('/').pop() || 'proof-file'

    // Determine file type from URL
    const ext = finalFileName.split('.').pop()?.toLowerCase() || ''
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
    const fileType = mimeTypes[ext] || 'application/octet-stream'

    // Create file record in database with the URL
    const workEntryFile = await prisma.workEntryFile.create({
      data: {
        workEntryId: id,
        driveFileId: `external_${Date.now()}`, // Placeholder for external URLs
        fileName: finalFileName,
        fileType,
        fileSize: 0, // Unknown size for external URLs
        webViewLink: fileUrl,
        fileCategory,
      },
    })

    return NextResponse.json({ file: workEntryFile })
  } catch (error) {
    console.error('Error adding file:', error)
    return NextResponse.json({ error: 'Failed to add file' }, { status: 500 })
  }
})

// DELETE: Remove file from work entry (and optionally from Drive)
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!
    const { searchParams } = new URL(req.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json({ error: 'fileId is required' }, { status: 400 })
    }

    // Check work entry exists and belongs to user
    const entry = await prisma.workEntry.findUnique({
      where: { id },
    })

    if (!entry || entry.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete file record (Drive file remains - user can manage in their Drive)
    // Verify the file belongs to this work entry to prevent IDOR
    await prisma.workEntryFile.delete({
      where: { id: fileId, workEntryId: id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
})
