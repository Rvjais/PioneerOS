import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { checkRateLimit } from '@/server/security/rateLimit'

// GET - Get lead info for RFP form (public)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // Rate limit by IP to prevent token enumeration
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               req.headers.get('x-real-ip') || 'unknown'
    const rateLimit = await checkRateLimit(`rfp-lookup:${ip}`, {
      maxRequests: 10,
      windowMs: 15 * 60 * 1000, // 10 requests per 15 minutes
    })
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter || 900) } }
      )
    }

    const { token } = await params

    const lead = await prisma.lead.findUnique({
      where: { rfpToken: token },
      select: {
        id: true,
        companyName: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        rfpStatus: true,
        pipeline: true,
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Invalid or expired RFP link' }, { status: 404 })
    }

    if (lead.rfpStatus === 'COMPLETED') {
      return NextResponse.json({ error: 'This RFP has already been completed' }, { status: 400 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Failed to fetch RFP:', error)
    return NextResponse.json({ error: 'Failed to fetch RFP' }, { status: 500 })
  }
}

// POST - Submit RFP response (public)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await req.json()
    const schema = z.object({
      companyName: z.string().max(300).optional(),
      contactName: z.string().max(200).optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().max(20).optional(),
      primaryObjective: z.string().max(1000).optional(),
      currentChallenges: z.array(z.string()).optional(),
      businessType: z.string().max(100).optional(),
      pastMarketing: z.array(z.string()).optional(),
      workedWithAgency: z.boolean().optional(),
      agencyIssues: z.string().max(2000).optional(),
      timeline: z.string().max(200).optional(),
      budgetRange: z.string().max(200).optional(),
      isHealthcare: z.boolean().optional(),
      healthcareType: z.string().max(200).optional(),
      patientVolume: z.string().max(100).optional(),
      specialization: z.string().max(200).optional(),
      numberOfLocations: z.string().max(50).optional(),
    }).passthrough()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })

    const lead = await prisma.lead.findUnique({
      where: { rfpToken: token },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Invalid or expired RFP link' }, { status: 404 })
    }

    if (lead.rfpStatus === 'COMPLETED') {
      return NextResponse.json({ error: 'This RFP has already been completed' }, { status: 400 })
    }

    const {
      // Contact info updates
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      // RFP responses
      primaryObjective,
      currentChallenges,
      businessType,
      pastMarketing,
      workedWithAgency,
      agencyIssues,
      timeline,
      budgetRange,
      // Healthcare specific
      isHealthcare,
      healthcareType,
      patientVolume,
      specialization,
      numberOfLocations,
    } = body

    // Update lead with RFP responses
    const updatedLead = await prisma.lead.update({
      where: { rfpToken: token },
      data: {
        // Update contact info if provided
        companyName: companyName || lead.companyName,
        contactName: contactName || lead.contactName,
        contactEmail: contactEmail || lead.contactEmail,
        contactPhone: contactPhone || lead.contactPhone,
        // RFP responses
        primaryObjective,
        currentChallenges: JSON.stringify(currentChallenges || []),
        businessType,
        pastMarketing: JSON.stringify(pastMarketing || []),
        workedWithAgency: workedWithAgency || false,
        agencyIssues: agencyIssues || null,
        timeline,
        budgetRange,
        // Healthcare specific
        isHealthcare: isHealthcare || false,
        healthcareType: healthcareType || null,
        patientVolume: patientVolume || null,
        specialization: specialization || null,
        numberOfLocations: numberOfLocations || null,
        // Status updates
        rfpStatus: 'COMPLETED',
        rfpCompletedAt: new Date(),
        rfpResponses: JSON.stringify(body),
        stage: 'RFP_COMPLETED',
      },
    })

    // Create activity
    await prisma.leadActivity.create({
      data: {
        leadId: updatedLead.id,
        userId: lead.createdBy || 'system',
        type: 'NOTE',
        title: 'RFP Completed',
        description: `Client completed RFP form. Primary objective: ${primaryObjective}`,
      },
    })

    return NextResponse.json({ success: true, message: 'Thank you for completing the RFP!' })
  } catch (error) {
    console.error('Failed to submit RFP:', error)
    return NextResponse.json({ error: 'Failed to submit RFP' }, { status: 500 })
  }
}
