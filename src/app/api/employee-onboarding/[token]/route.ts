import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { checkRateLimit } from '@/server/security/rateLimit'

// GET - Fetch employee onboarding data (public — candidate uses token)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // Rate limit by IP to prevent token enumeration
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               req.headers.get('x-real-ip') || 'unknown'
    const rateLimit = await checkRateLimit(`onboarding-lookup:${ip}`, {
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

    const proposal = await prisma.employeeProposal.findUnique({ where: { token } })
    if (!proposal) {
      return NextResponse.json({ error: 'Onboarding link not found' }, { status: 404 })
    }

    // Mark as viewed
    if (!proposal.viewedAt) {
      await prisma.employeeProposal.update({
        where: { token },
        data: { viewedAt: new Date(), status: proposal.status === 'SENT' ? 'VIEWED' : proposal.status },
      })
    }

    const isExpired = proposal.expiresAt < new Date()

    // Determine step
    let currentStep = proposal.currentStep
    if (proposal.status === 'COMPLETED' || proposal.status === 'ACTIVATED') currentStep = 7
    else if (proposal.documentsSubmittedAt) currentStep = 7
    else if (proposal.policiesAcceptedAt) currentStep = 6
    else if (proposal.bondAccepted) currentStep = 5
    else if (proposal.ndaAccepted) currentStep = 4
    else if (proposal.detailsConfirmedAt) currentStep = 3
    else currentStep = proposal.currentStep || 1

    const entity = proposal.entityType === 'BRANDING_PIONEERS'
      ? { name: 'Branding Pioneers', legalName: 'ATZ Medappz Pvt. Ltd.', address: '750, Udyog Vihar, Third Floor, Gurgaon, Haryana' }
      : { name: 'ATZ Medappz', legalName: 'ATZ Medappz Pvt. Ltd.', address: '750, Udyog Vihar, Third Floor, Gurgaon, Haryana' }

    return NextResponse.json({
      id: proposal.id,
      token: proposal.token,
      status: proposal.status,
      currentStep,
      isExpired,
      entity,
      candidate: {
        name: proposal.confirmedName || proposal.candidateName,
        email: proposal.personalEmail || proposal.candidateEmail,
        phone: proposal.personalPhone || proposal.candidatePhone,
      },
      offer: {
        department: proposal.department,
        position: proposal.position,
        employmentType: proposal.employmentType,
        salary: proposal.offeredSalary,
        joiningDate: proposal.joiningDate.toISOString(),
        probationMonths: proposal.probationMonths,
        bondDurationMonths: proposal.bondDurationMonths,
      },
      details: {
        confirmed: !!proposal.detailsConfirmedAt,
        dateOfBirth: proposal.dateOfBirth?.toISOString(),
        bloodGroup: proposal.bloodGroup,
        currentAddress: proposal.currentAddress,
        city: proposal.city,
        state: proposal.state,
        emergencyName: proposal.emergencyName,
        emergencyPhone: proposal.emergencyPhone,
      },
      nda: { accepted: proposal.ndaAccepted, acceptedAt: proposal.ndaAcceptedAt?.toISOString(), signerName: proposal.ndaSignerName },
      bond: { accepted: proposal.bondAccepted, acceptedAt: proposal.bondAcceptedAt?.toISOString(), signerName: proposal.bondSignerName, durationMonths: proposal.bondDurationMonths },
      policies: {
        accepted: !!proposal.policiesAcceptedAt,
        acceptedAt: proposal.policiesAcceptedAt?.toISOString(),
        handbook: proposal.handbookAccepted,
        socialMedia: proposal.socialMediaPolicyAccepted,
        confidentiality: proposal.confidentialityAccepted,
        antiHarassment: proposal.antiHarassmentAccepted,
        codeOfConduct: proposal.codeOfConductAccepted,
      },
      documents: {
        submitted: !!proposal.documentsSubmittedAt,
        submittedAt: proposal.documentsSubmittedAt?.toISOString(),
        profilePicture: proposal.profilePictureUrl,
        panCard: proposal.panCardUrl,
        aadhaar: proposal.aadhaarUrl,
        educationCert: proposal.educationCertUrl,
        bankDetails: { name: proposal.bankAccountName, bank: proposal.bankName, account: proposal.bankAccountNumber ? '****' + proposal.bankAccountNumber.slice(-4) : null, ifsc: proposal.bankIfscCode },
      },
      completion: { completed: proposal.onboardingCompleted, completedAt: proposal.onboardingCompletedAt?.toISOString(), magicLinkSent: proposal.magicLinkSent },
      steps: [
        { step: 1, key: 'details', label: 'Personal Details', description: 'Confirm your information' },
        { step: 2, key: 'offer', label: 'Review Offer', description: 'Review offer & sign' },
        { step: 3, key: 'nda', label: 'Sign NDA', description: 'Non-disclosure agreement' },
        { step: 4, key: 'bond', label: 'Sign Bond', description: 'Service bond agreement' },
        { step: 5, key: 'policies', label: 'Company Policies', description: 'Acknowledge policies' },
        { step: 6, key: 'documents', label: 'Documents', description: 'Upload documents' },
        { step: 7, key: 'complete', label: 'Welcome!', description: 'You\'re all set' },
      ],
      createdAt: proposal.createdAt.toISOString(),
      expiresAt: proposal.expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch employee onboarding:', error)
    return NextResponse.json({ error: 'Failed to fetch onboarding data' }, { status: 500 })
  }
}

// POST - Confirm personal details (Step 1)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await req.json()
    const schema = z.object({
      step: z.string().min(1),
      confirmedName: z.string().min(1).max(200).optional(),
      personalPhone: z.string().min(1).max(20).optional(),
      personalEmail: z.string().email().optional(),
      currentAddress: z.string().min(1).max(500).optional(),
      dateOfBirth: z.string().optional(),
      bloodGroup: z.string().max(10).optional(),
      city: z.string().max(100).optional(),
      state: z.string().max(100).optional(),
      pincode: z.string().max(20).optional(),
      parentsAddress: z.string().max(500).optional(),
      fatherPhone: z.string().max(20).optional(),
      motherPhone: z.string().max(20).optional(),
      emergencyName: z.string().max(200).optional(),
      emergencyPhone: z.string().max(20).optional(),
      emergencyRelation: z.string().max(100).optional(),
      linkedinUrl: z.string().max(500).optional(),
      languages: z.string().max(500).optional(),
      livingSituation: z.string().max(200).optional(),
      distanceFromOffice: z.string().max(200).optional(),
      favoriteFood: z.string().max(200).optional(),
      healthConditions: z.string().max(500).optional(),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { step } = result.data

    const proposal = await prisma.employeeProposal.findUnique({ where: { token } })
    if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (proposal.expiresAt < new Date()) return NextResponse.json({ error: 'Link expired' }, { status: 410 })

    if (step === 'details') {
      if (!body.confirmedName || !body.personalPhone || !body.personalEmail || !body.currentAddress || !body.dateOfBirth) {
        return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 })
      }

      await prisma.employeeProposal.update({
        where: { token },
        data: {
          confirmedName: body.confirmedName,
          dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
          bloodGroup: body.bloodGroup,
          personalPhone: body.personalPhone,
          personalEmail: body.personalEmail,
          currentAddress: body.currentAddress,
          city: body.city,
          state: body.state,
          pincode: body.pincode,
          parentsAddress: body.parentsAddress,
          fatherPhone: body.fatherPhone,
          motherPhone: body.motherPhone,
          emergencyName: body.emergencyName,
          emergencyPhone: body.emergencyPhone,
          emergencyRelation: body.emergencyRelation,
          linkedinUrl: body.linkedinUrl,
          languages: body.languages,
          livingSituation: body.livingSituation,
          distanceFromOffice: body.distanceFromOffice,
          favoriteFood: body.favoriteFood,
          healthConditions: body.healthConditions,
          detailsConfirmedAt: new Date(),
          status: 'DETAILS_CONFIRMED',
          currentStep: 2,
        },
      })

      return NextResponse.json({ success: true, currentStep: 2 })
    }

    return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
  } catch (error) {
    console.error('Failed to update employee onboarding:', error)
    return NextResponse.json({ error: 'Failed to save details' }, { status: 500 })
  }
}
