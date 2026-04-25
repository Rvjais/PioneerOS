import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { checkRateLimit } from '@/server/security/rateLimit'

// Input validation schema
const rfpV2Schema = z.object({
  // Contact info
  companyName: z.string().max(200).optional().nullable(),
  contactName: z.string().min(1).max(100).trim(),
  contactEmail: z.string().email().max(255).toLowerCase().trim(),
  contactPhone: z.string().min(1).max(20).trim(),
  // RFP responses
  primaryObjective: z.string().max(500).optional().nullable(),
  currentChallenges: z.array(z.string().max(200)).optional().nullable(),
  businessType: z.string().max(100).optional().nullable(),
  pastMarketing: z.array(z.string().max(200)).optional().nullable(),
  workedWithAgency: z.boolean().optional().default(false),
  agencyIssues: z.string().max(1000).optional().nullable(),
  timeline: z.string().max(100).optional().nullable(),
  budgetRange: z.string().max(100).optional().nullable(),
  // Healthcare specific
  isHealthcare: z.boolean().optional().default(false),
  healthcareType: z.string().max(100).optional().nullable(),
  patientVolume: z.string().max(100).optional().nullable(),
  specialization: z.string().max(200).optional().nullable(),
  numberOfLocations: z.union([z.string(), z.number()]).optional().nullable(),
})

// POST - Submit RFP (public, no auth required)
export async function POST(req: NextRequest) {
  try {
    // Rate limiting - 5 submissions per hour per IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
               req.headers.get('x-real-ip') ||
               'unknown'

    const rateLimit = await checkRateLimit(`rfp-v2:${ip}`, {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000, // 1 hour
    })

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfter || 3600) }
        }
      )
    }

    const body = await req.json()

    // Validate input with Zod
    const validation = rfpV2Schema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      primaryObjective,
      currentChallenges,
      businessType,
      pastMarketing,
      workedWithAgency,
      agencyIssues,
      timeline,
      budgetRange,
      isHealthcare,
      healthcareType,
      patientVolume,
      specialization,
      numberOfLocations,
    } = validation.data

    // Create lead with RFP data
    const lead = await prisma.lead.create({
      data: {
        companyName: companyName || contactName,
        contactName,
        contactEmail,
        contactPhone,
        source: 'RFP',
        pipeline: isHealthcare ? 'BRANDING_PIONEERS' : 'BRANDING_PIONEERS',
        stage: 'RFP_COMPLETED',
        rfpStatus: 'COMPLETED',
        rfpCompletedAt: new Date(),
        rfpResponses: JSON.stringify(body),
        // RFP specific fields
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
        numberOfLocations: numberOfLocations ? parseInt(String(numberOfLocations)) : null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Thank you for submitting your requirements!',
      leadId: lead.id,
    })
  } catch (error) {
    console.error('Failed to submit RFP:', error)
    return NextResponse.json(
      { error: 'Failed to submit. Please try again.' },
      { status: 500 }
    )
  }
}
