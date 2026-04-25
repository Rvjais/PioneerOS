import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const createSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  // Accept both field name formats
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(10).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  industry: z.string().optional(),
  websiteUrl: z.string().optional(),
  currentWebsite: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  expiresInDays: z.number().min(1).max(60).default(14),
}).refine(data => data.contactEmail || data.email, { message: 'Email is required', path: ['email'] })
  .refine(data => data.contactPhone || data.phone, { message: 'Phone is required', path: ['phone'] })

// POST - Create RFP link
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const validation = createSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 })
    }

    const data = validation.data
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + data.expiresInDays)

    const rfp = await prisma.rFPSubmission.create({
      data: {
        companyName: data.companyName,
        contactName: data.contactName,
        contactEmail: data.contactEmail || data.email,
        contactPhone: data.contactPhone || data.phone,
        industry: data.industry,
        websiteUrl: data.websiteUrl || data.currentWebsite,
        notes: data.notes || data.internalNotes,
        status: 'SENT',
        currentStep: 1,
        expiresAt,
        createdById: user.id,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    return NextResponse.json({
      success: true,
      rfp: { id: rfp.id, token: rfp.token, url: `${baseUrl}/rfp/${rfp.token}`, expiresAt },
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create RFP:', error)
    return NextResponse.json({ error: 'Failed to create RFP link' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'SALES', 'ACCOUNTS'] })

// GET - List all RFPs
export const GET = withAuth(async () => {
  try {
    const rfps = await prisma.rFPSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({
      rfps: rfps.map(r => {
        // Extract view tracking data
        let viewCount = 0
        let lastViewedAt: string | null = null
        try {
          if (r.prospectFormData) {
            const tracking = JSON.parse(r.prospectFormData)
            viewCount = tracking._viewCount || 0
            lastViewedAt = tracking._lastViewedAt || null
          }
        } catch { /* ignore */ }

        return {
          ...r,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
          expiresAt: r.expiresAt?.toISOString(),
          completedAt: r.completedAt?.toISOString(),
          viewedAt: r.viewedAt?.toISOString(),
          prospectFormData: undefined, // Don't send raw tracking data
          scopeDetails: undefined, // Don't send full scope in list
          tracking: { viewCount, lastViewedAt, firstViewedAt: r.viewedAt?.toISOString() || null },
        }
      }),
      stats: {
        total: rfps.length,
        sent: rfps.filter(r => r.status === 'SENT').length,
        submitted: rfps.filter(r => r.completed).length,
        inReview: rfps.filter(r => r.status === 'IN_REVIEW').length,
      },
    })
  } catch (error) {
    console.error('Failed to list RFPs:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'SALES', 'ACCOUNTS'] })
