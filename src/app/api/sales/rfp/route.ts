import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { validateBody, validationError, idSchema, emailSchema, phoneSchema } from '@/shared/validation/validation'

// Schema for sending RFP
const sendRfpSchema = z.object({
  // Allow empty string which frontend may send, transform to undefined
  leadId: z.string().optional().transform(v => v === '' ? undefined : v),
  companyName: z.string().min(1).max(200).optional().transform(v => v === '' ? undefined : v),
  contactName: z.string().min(1).max(100).optional().transform(v => v === '' ? undefined : v),
  contactEmail: emailSchema.optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  contactPhone: phoneSchema.optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  pipeline: z.enum(['BRANDING_PIONEERS', 'BRAINMINDS', 'PROPERTY_JEEVES', 'OTHER']).optional().default('BRANDING_PIONEERS'),
})

// GET - List all RFPs (leads with RFP status)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY FIX: Only sales team and managers can view RFPs
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES', 'ACCOUNTS']
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - RFP data requires sales access' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // PENDING, SENT, COMPLETED

    const where: Record<string, unknown> = { deletedAt: null }
    if (status) {
      where.rfpStatus = status
    } else {
      where.rfpToken = { not: null }
    }

    const leads = await prisma.lead.findMany({
      where,
      select: {
        id: true,
        companyName: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        rfpToken: true,
        rfpStatus: true,
        rfpSentAt: true,
        rfpCompletedAt: true,
        stage: true,
        pipeline: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Failed to fetch RFPs:', error)
    return NextResponse.json({ error: 'Failed to fetch RFPs' }, { status: 500 })
  }
}

// POST - Send RFP to a lead
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY FIX: Only sales team can send RFPs
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES']
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - RFP creation requires sales access' }, { status: 403 })
    }

    // Validate request body
    const validation = await validateBody(req, sendRfpSchema)
    if (!validation.success) {
      return validationError(validation.error)
    }

    const { leadId, companyName, contactName, contactEmail, contactPhone, pipeline } = validation.data

    // If no leadId, contactEmail is required for new lead
    if (!leadId && !contactEmail) {
      return NextResponse.json({ error: 'Email is required for new contacts' }, { status: 400 })
    }

    // Generate unique token for RFP link
    const rfpToken = randomBytes(32).toString('hex')

    let lead

    if (leadId) {
      // Update existing lead
      lead = await prisma.lead.update({
        where: { id: leadId },
        data: {
          rfpToken,
          rfpStatus: 'SENT',
          rfpSentAt: new Date(),
          stage: 'RFP_SENT',
        },
      })
    } else {
      // Create new lead with RFP (contactEmail validated by zod schema)
      lead = await prisma.lead.create({
        data: {
          companyName: companyName || 'Unknown',
          contactName: contactName || 'Unknown',
          contactEmail,
          contactPhone: contactPhone || null,
          source: 'RFP',
          pipeline: pipeline || 'BRANDING_PIONEERS',
          stage: 'RFP_SENT',
          rfpToken,
          rfpStatus: 'SENT',
          rfpSentAt: new Date(),
          createdBy: session.user.id,
        },
      })
    }

    // Create activity
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        userId: session.user.id,
        type: 'EMAIL',
        title: 'RFP Sent',
        description: `RFP form sent to ${contactEmail || lead.contactEmail}`,
      },
    })

    // Return the RFP URL - try multiple env vars for flexibility
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const rfpUrl = `${baseUrl}/rfp-v2?token=${rfpToken}`

    return NextResponse.json({
      ...lead,
      rfpUrl,
    })
  } catch (error) {
    console.error('Failed to send RFP:', error)
    return NextResponse.json({ error: 'Failed to send RFP' }, { status: 500 })
  }
}
