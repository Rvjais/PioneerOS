import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB for ads creatives
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
]
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
]
const ALLOWED_VIDEO_TYPES = [
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
]

// All allowed types combined
const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_VIDEO_TYPES]

export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'pioneer-os/uploads'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` }, { status: 400 })
    }

    if (!ALL_ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPG, PNG, GIF, WebP, PDF, MP4, WebM, MOV' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Use Cloudinary for uploads (configured in environment)
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const { v2: cloudinary } = await import('cloudinary')
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      })

      const base64 = buffer.toString('base64')
      const dataUri = `data:${file.type};base64,${base64}`

      // Determine resource type for Cloudinary
      let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto'
      if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
        resourceType = 'image'
      } else if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
        resourceType = 'video'
      } else {
        resourceType = 'raw'
      }

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: `${folder}/${user.id}`,
        resource_type: resourceType,
        transformation: file.type.startsWith('image/') ? [
          { quality: 'auto', fetch_format: 'auto' },
        ] : undefined,
      })

      return NextResponse.json({
        url: result.secure_url,
        publicId: result.public_id,
      })
    }

    // If no Cloudinary configured, return error
    return NextResponse.json({ error: 'File upload service not configured. Please contact administrator.' }, { status: 500 })
  } catch (error) {
    console.error('Upload failed:', error)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
})