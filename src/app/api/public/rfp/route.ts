import { prisma } from '@/server/db/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit } from '@/server/security/rateLimit'

// Input validation schema
const rfpSchema = z.object({
  companyName: z.string().min(1).max(200).trim(),
  contactName: z.string().min(1).max(100).trim(),
  contactEmail: z.string().email().max(255).toLowerCase().trim(),
  contactPhone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  gstNumber: z.string().max(20).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  businessType: z.string().max(100).optional().nullable(),
  websiteUrl: z.string().url().max(500).optional().nullable().or(z.literal('')),
  servicesRequested: z.string().max(1000).optional().nullable(),
  scopeDetails: z.string().max(5000).optional().nullable(),
  budgetRange: z.string().max(100).optional().nullable(),
  monthlyBudget: z.string().max(100).optional().nullable(),
  expectedStartDate: z.string().optional().nullable(),
  contractDuration: z.string().max(50).optional().nullable(),
  referralUserId: z.string().optional().nullable(),
  sharedBy: z.string().optional().nullable(),
})

// Public RFP submission - no authentication required
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 submissions per hour per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    const rateLimit = await checkRateLimit(`rfp:${ip}`, {
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

    const body = await request.json()

    // Validate input with Zod
    const validation = rfpSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Track referral source if provided
    const referralUserId = data.referralUserId || data.sharedBy || null

    const rfp = await prisma.rFPSubmission.create({
      data: {
        companyName: data.companyName,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || null,
        address: data.address || null,
        gstNumber: data.gstNumber || null,
        industry: data.industry || null,
        businessType: data.businessType || null,
        websiteUrl: data.websiteUrl && data.websiteUrl !== '' ? data.websiteUrl : null,
        servicesRequested: data.servicesRequested || null,
        scopeDetails: data.scopeDetails || null,
        budgetRange: data.budgetRange || null,
        monthlyBudget: data.monthlyBudget ? parseFloat(data.monthlyBudget) : null,
        expectedStartDate: data.expectedStartDate ? new Date(data.expectedStartDate) : null,
        contractDuration: data.contractDuration || null,
        status: 'NEW',
        // Track which user shared this form link (if any)
        submittedById: referralUserId,
      },
    })

    // Notify sales team about new RFP
    const salesUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'SALES' },
          { department: 'SALES' },
        ],
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true },
    })

    if (salesUsers.length > 0) {
      await prisma.notification.createMany({
        data: salesUsers.map((user) => ({
          userId: user.id,
          type: 'GENERAL',
          title: 'New RFP Submission',
          message: `${data.companyName} has submitted an RFP. Contact: ${data.contactName}`,
          link: '/clients/rfp',
          priority: 'HIGH',
        })),
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your submission. Our team will contact you shortly.',
      rfpId: rfp.id,
    })
  } catch (error) {
    console.error('Failed to create RFP:', error)
    return NextResponse.json(
      { error: 'Failed to submit RFP. Please try again.' },
      { status: 500 }
    )
  }
}
