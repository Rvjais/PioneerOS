import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const rfpSubmitSchema = z.object({
  clientTier: z.string().optional(),
  currency: z.string().optional(),
  locations: z.string().optional(),
  servicesNeeded: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
  ageGroup: z.string().optional(),
  geographicTarget: z.string().optional(),
  topCompetitors: z.string().optional(),
  usp: z.string().optional(),
  adBudget: z.string().optional(),
  retainerBudget: z.string().optional(),
  primaryGoals: z.array(z.string()).optional(),
  successMetrics: z.string().optional(),
  biggestChallenge: z.string().optional(),
  currentlyDoingMarketing: z.string().optional(),
  whatWorked: z.string().optional(),
  whatDidntWork: z.string().optional(),
  preferredCallTime: z.string().optional(),
  additionalInfo: z.string().optional(),
  patientVolume: z.string().optional(),
  specializations: z.string().optional(),
  contractPreference: z.string().optional(),
  expectedStartDate: z.string().optional(),
})

// GET - Fetch RFP data (public - prospect views)
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const rfp = await prisma.rFPSubmission.findUnique({ where: { token } })
    if (!rfp) return NextResponse.json({ error: 'RFP not found' }, { status: 404 })

    // Track views with count and timestamps
    const now = new Date()
    let existingTracking: Record<string, unknown> = {}
    try { if (rfp.prospectFormData) existingTracking = JSON.parse(rfp.prospectFormData) } catch { /* ignore */ }

    const viewCount = ((existingTracking._viewCount as number) || 0) + 1
    const viewHistory = ((existingTracking._viewHistory as string[]) || [])
    viewHistory.push(now.toISOString())
    // Keep last 50 views
    if (viewHistory.length > 50) viewHistory.splice(0, viewHistory.length - 50)

    await prisma.rFPSubmission.update({
      where: { token },
      data: {
        viewedAt: rfp.viewedAt || now,
        status: rfp.status === 'SENT' ? 'VIEWED' : rfp.status,
        prospectFormData: JSON.stringify({ ...existingTracking, _viewCount: viewCount, _lastViewedAt: now.toISOString(), _viewHistory: viewHistory }),
      },
    })

    return NextResponse.json({
      id: rfp.id,
      token: rfp.token,
      status: rfp.status,
      completed: rfp.completed,
      isExpired: rfp.expiresAt ? rfp.expiresAt < new Date() : false,
      company: { name: rfp.companyName, contact: rfp.contactName, email: rfp.contactEmail, phone: rfp.contactPhone, industry: rfp.industry, website: rfp.websiteUrl },
      tracking: { viewCount, firstViewedAt: (rfp.viewedAt || now).toISOString(), lastViewedAt: now.toISOString() },
      expiresAt: rfp.expiresAt?.toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch RFP:', error)
    return NextResponse.json({ error: 'Failed to fetch RFP' }, { status: 500 })
  }
}

// POST - Submit RFP form (public - prospect submits)
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const raw = await req.json()
    const parsed = rfpSubmitSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const body = parsed.data

    const rfp = await prisma.rFPSubmission.findUnique({ where: { token } })
    if (!rfp) return NextResponse.json({ error: 'RFP not found' }, { status: 404 })
    if (rfp.completed) return NextResponse.json({ error: 'Already submitted' }, { status: 400 })
    if (rfp.expiresAt && rfp.expiresAt < new Date()) return NextResponse.json({ error: 'Link expired' }, { status: 410 })

    // Calculate estimated value
    const retainerValues: Record<string, number> = {
      under_30k: 25000, '30k_50k': 40000, '50k_75k': 60000, '75k_1l': 85000,
      '1l_2l': 150000, '2l_3l': 250000, '2l_5l': 350000, '5l_10l': 750000, '10l_plus': 1200000, flexible: 75000,
    }
    const retainerValue = retainerValues[body.retainerBudget ?? ''] || 50000

    // Update RFP
    await prisma.rFPSubmission.update({
      where: { token },
      data: {
        clientTier: body.clientTier,
        currency: body.currency || 'INR',
        locations: body.locations,
        servicesRequested: JSON.stringify(body.servicesNeeded),
        targetAudience: JSON.stringify({ audience: body.targetAudience, ageGroup: body.ageGroup, geographic: body.geographicTarget }),
        competitors: body.topCompetitors,
        usp: body.usp,
        adBudget: body.adBudget,
        retainerBudget: body.retainerBudget,
        budgetRange: body.retainerBudget,
        monthlyBudget: retainerValue,
        primaryGoals: JSON.stringify(body.primaryGoals),
        successMetrics: body.successMetrics,
        biggestChallenge: body.biggestChallenge,
        currentMarketing: body.currentlyDoingMarketing,
        whatWorked: body.whatWorked,
        whatDidntWork: body.whatDidntWork,
        preferredCallTime: body.preferredCallTime,
        additionalInfo: body.additionalInfo,
        patientVolume: body.patientVolume,
        specializations: body.specializations,
        contractDuration: body.contractPreference,
        expectedStartDate: body.expectedStartDate ? new Date(body.expectedStartDate) : null,
        scopeDetails: JSON.stringify(body),
        completed: true,
        completedAt: new Date(),
        status: 'SUBMITTED',
      },
    })

    // Check if a lead already exists for this email to prevent duplicates
    const existingLead = await prisma.lead.findFirst({
      where: { contactEmail: rfp.contactEmail, deletedAt: null },
    })

    const leadData = {
      companyName: rfp.companyName,
      contactName: rfp.contactName,
      contactEmail: rfp.contactEmail || '',
      contactPhone: rfp.contactPhone || '',
      source: 'RFP' as const,
      stage: 'LEAD_RECEIVED' as const,
      value: retainerValue,
      leadPriority: body.clientTier === 'enterprise' || body.clientTier === 'premium' ? 'HOT' : 'WARM',
      isHealthcare: ['healthcare', 'dental', 'aesthetics', 'ivf', 'mental_health', 'veterinary'].includes(rfp.industry || ''),
      notes: JSON.stringify({ ...body, formType: 'RFP_TOKEN', submittedAt: new Date().toISOString() }),
      rfpResponses: JSON.stringify(body),
      nextFollowUp: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }

    const lead = existingLead
      ? await prisma.lead.update({
          where: { id: existingLead.id },
          data: leadData,
        })
      : await prisma.lead.create({
          data: leadData,
        })

    await prisma.rFPSubmission.update({ where: { token }, data: { leadId: lead.id } })

    // Notify sales
    const salesUsers = await prisma.user.findMany({
      where: { OR: [{ role: 'SUPER_ADMIN' }, { role: 'MANAGER' }, { role: 'SALES' }, { department: 'SALES' }], status: 'ACTIVE', deletedAt: null },
      select: { id: true },
    })

    if (salesUsers.length > 0) {
      await prisma.notification.createMany({
        data: salesUsers.map(u => ({
          userId: u.id,
          type: 'GENERAL',
          title: `RFP Submitted: ${rfp.companyName} (${(body.clientTier || '').toUpperCase()})`,
          message: `${rfp.contactName} from ${rfp.companyName} submitted their RFP. ${body.servicesNeeded?.length || 0} services requested. Industry: ${rfp.industry || 'N/A'}.`,
          link: `/sales/leads/${lead.id}`,
          priority: body.clientTier === 'enterprise' ? 'URGENT' : 'HIGH',
        })),
      })
    }

    return NextResponse.json({ success: true, leadId: lead.id })
  } catch (error) {
    console.error('Failed to submit RFP:', error)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
