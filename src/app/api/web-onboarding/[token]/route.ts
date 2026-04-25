import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

// Notify web team about new web onboarding submission
async function notifyWebTeam(
  businessName: string,
  contactName: string,
  websiteType: string,
  onboardingId: string
) {
  try {
    // Find web team members
    const webTeamUsers = await prisma.user.findMany({
      where: {
        OR: [
          { department: 'WEB' },
          { department: 'OPERATIONS' },
          { role: 'MANAGER' },
        ],
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true },
    })

    if (webTeamUsers.length > 0) {
      await prisma.notification.createMany({
        data: webTeamUsers.map(user => ({
          userId: user.id,
          type: 'GENERAL',
          title: 'New Web Onboarding Submission',
          message: `${businessName} (${contactName}) submitted web requirements. Type: ${websiteType}`,
          link: `/operations/web-onboarding/${onboardingId}`,
          priority: 'HIGH',
        })),
      })
    }
  } catch (error) {
    console.error('[WEB_ONBOARDING] Failed to notify team:', error)
  }
}

const onboardingSchema = z.object({
  // Business Info
  businessName: z.string().min(1).max(200),
  businessDescription: z.string().max(2000).optional(),
  industry: z.string().max(100).optional(),
  targetAudience: z.string().max(2000).optional(),

  // Website Requirements
  websiteType: z.enum(['ECOMMERCE', 'CORPORATE', 'PORTFOLIO', 'LANDING', 'BLOG', 'CUSTOM']),
  requiredPages: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),

  // Design Preferences
  colorPreferences: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
  }).optional(),
  stylePreference: z.enum(['MODERN', 'MINIMAL', 'BOLD', 'CLASSIC', 'PLAYFUL']).optional(),
  referenceUrls: z.array(z.string().url()).optional(),

  // Assets
  hasLogo: z.boolean().default(false),
  hasContent: z.boolean().default(false),
  logoUrl: z.string().url().optional().nullable(),
  brandGuideUrl: z.string().url().optional().nullable(),

  // Domain/Hosting
  hasDomain: z.boolean().default(false),
  domainName: z.string().max(200).optional(),
  hasHosting: z.boolean().default(false),
  hostingProvider: z.string().max(100).optional(),

  // Contact
  contactName: z.string().min(1).max(100),
  contactEmail: z.string().email(),
  contactPhone: z.string().max(20).optional(),
})

// GET /api/web-onboarding/[token] - Get onboarding form data
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  try {
    const onboarding = await prisma.webOnboarding.findUnique({
      where: { token },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!onboarding) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
    }

    if (onboarding.status === 'CONVERTED') {
      return NextResponse.json({
        status: 'CONVERTED',
        message: 'This onboarding has already been completed',
      })
    }

    if (onboarding.status === 'SUBMITTED') {
      return NextResponse.json({
        status: 'SUBMITTED',
        message: 'Your information has been submitted and is under review',
        submittedAt: onboarding.submittedAt,
      })
    }

    // Parse JSON fields
    const parseJson = (str: string | null) => {
      if (!str) return null
      try { return JSON.parse(str) } catch { return null }
    }

    return NextResponse.json({
      status: onboarding.status,
      data: {
        businessName: onboarding.businessName,
        businessDescription: onboarding.businessDescription,
        industry: onboarding.industry,
        targetAudience: parseJson(onboarding.targetAudience),
        websiteType: onboarding.websiteType,
        requiredPages: parseJson(onboarding.requiredPages),
        features: parseJson(onboarding.features),
        colorPreferences: parseJson(onboarding.colorPreferences),
        stylePreference: onboarding.stylePreference,
        referenceUrls: parseJson(onboarding.referenceUrls),
        hasLogo: onboarding.hasLogo,
        hasContent: onboarding.hasContent,
        logoUrl: onboarding.logoUrl,
        brandGuideUrl: onboarding.brandGuideUrl,
        hasDomain: onboarding.hasDomain,
        domainName: onboarding.domainName,
        hasHosting: onboarding.hasHosting,
        hostingProvider: onboarding.hostingProvider,
        contactName: onboarding.contactName,
        contactEmail: onboarding.contactEmail,
        contactPhone: onboarding.contactPhone,
      },
      client: onboarding.client,
    })
  } catch (error) {
    console.error('Failed to fetch onboarding:', error)
    return NextResponse.json({ error: 'Failed to fetch onboarding data' }, { status: 500 })
  }
}

// POST /api/web-onboarding/[token] - Submit onboarding form
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  try {
    const onboarding = await prisma.webOnboarding.findUnique({
      where: { token },
    })

    if (!onboarding) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
    }

    if (onboarding.status === 'SUBMITTED' || onboarding.status === 'CONVERTED') {
      return NextResponse.json({ error: 'This form has already been submitted' }, { status: 400 })
    }

    const body = await req.json()
    const validation = onboardingSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      }, { status: 400 })
    }

    const data = validation.data

    // Update onboarding record
    await prisma.webOnboarding.update({
      where: { token },
      data: {
        status: 'SUBMITTED',
        businessName: data.businessName,
        businessDescription: data.businessDescription || null,
        industry: data.industry || null,
        targetAudience: data.targetAudience ? JSON.stringify(data.targetAudience) : null,
        websiteType: data.websiteType,
        requiredPages: data.requiredPages ? JSON.stringify(data.requiredPages) : null,
        features: data.features ? JSON.stringify(data.features) : null,
        colorPreferences: data.colorPreferences ? JSON.stringify(data.colorPreferences) : null,
        stylePreference: data.stylePreference || null,
        referenceUrls: data.referenceUrls ? JSON.stringify(data.referenceUrls) : null,
        hasLogo: data.hasLogo,
        hasContent: data.hasContent,
        logoUrl: data.logoUrl || null,
        brandGuideUrl: data.brandGuideUrl || null,
        hasDomain: data.hasDomain,
        domainName: data.domainName || null,
        hasHosting: data.hasHosting,
        hostingProvider: data.hostingProvider || null,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || null,
        submittedAt: new Date(),
      },
    })

    // Send notification to web team about new submission
    await notifyWebTeam(
      data.businessName,
      data.contactName,
      data.websiteType,
      onboarding.id
    )

    return NextResponse.json({
      success: true,
      message: 'Your information has been submitted successfully',
    })
  } catch (error) {
    console.error('Failed to submit onboarding:', error)
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 })
  }
}

// PATCH /api/web-onboarding/[token] - Save draft
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  try {
    const onboarding = await prisma.webOnboarding.findUnique({
      where: { token },
    })

    if (!onboarding) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
    }

    if (onboarding.status === 'SUBMITTED' || onboarding.status === 'CONVERTED') {
      return NextResponse.json({ error: 'Cannot update submitted form' }, { status: 400 })
    }

    const body = await req.json()

    // Partial update - save whatever fields are provided
    const updateData: Record<string, unknown> = {}

    if (body.businessName !== undefined) updateData.businessName = body.businessName
    if (body.businessDescription !== undefined) updateData.businessDescription = body.businessDescription
    if (body.industry !== undefined) updateData.industry = body.industry
    if (body.targetAudience !== undefined) updateData.targetAudience = JSON.stringify(body.targetAudience)
    if (body.websiteType !== undefined) updateData.websiteType = body.websiteType
    if (body.requiredPages !== undefined) updateData.requiredPages = JSON.stringify(body.requiredPages)
    if (body.features !== undefined) updateData.features = JSON.stringify(body.features)
    if (body.colorPreferences !== undefined) updateData.colorPreferences = JSON.stringify(body.colorPreferences)
    if (body.stylePreference !== undefined) updateData.stylePreference = body.stylePreference
    if (body.referenceUrls !== undefined) updateData.referenceUrls = JSON.stringify(body.referenceUrls)
    if (body.hasLogo !== undefined) updateData.hasLogo = body.hasLogo
    if (body.hasContent !== undefined) updateData.hasContent = body.hasContent
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl
    if (body.brandGuideUrl !== undefined) updateData.brandGuideUrl = body.brandGuideUrl
    if (body.hasDomain !== undefined) updateData.hasDomain = body.hasDomain
    if (body.domainName !== undefined) updateData.domainName = body.domainName
    if (body.hasHosting !== undefined) updateData.hasHosting = body.hasHosting
    if (body.hostingProvider !== undefined) updateData.hostingProvider = body.hostingProvider
    if (body.contactName !== undefined) updateData.contactName = body.contactName
    if (body.contactEmail !== undefined) updateData.contactEmail = body.contactEmail
    if (body.contactPhone !== undefined) updateData.contactPhone = body.contactPhone

    await prisma.webOnboarding.update({
      where: { token },
      data: updateData,
    })

    return NextResponse.json({ success: true, message: 'Draft saved' })
  } catch (error) {
    console.error('Failed to save draft:', error)
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 })
  }
}
