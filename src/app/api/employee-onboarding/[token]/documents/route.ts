import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

// POST - Submit documents
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const body = await req.json()
    const schema = z.object({
      profilePictureUrl: z.string().max(1000).optional(),
      panCardUrl: z.string().min(1).max(1000),
      aadhaarUrl: z.string().min(1).max(1000),
      educationCertUrl: z.string().max(1000).optional(),
      bankAccountName: z.string().min(1).max(200),
      bankName: z.string().min(1).max(200),
      bankAccountNumber: z.string().min(1).max(50),
      bankIfscCode: z.string().min(1).max(20),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })

    const proposal = await prisma.employeeProposal.findUnique({ where: { token } })
    if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (proposal.expiresAt && proposal.expiresAt < new Date()) return NextResponse.json({ error: 'This onboarding link has expired' }, { status: 410 })
    if (!proposal.policiesAcceptedAt) return NextResponse.json({ error: 'Please accept policies first' }, { status: 400 })

    await prisma.employeeProposal.update({
      where: { token },
      data: {
        profilePictureUrl: body.profilePictureUrl || null,
        panCardUrl: body.panCardUrl,
        aadhaarUrl: body.aadhaarUrl,
        educationCertUrl: body.educationCertUrl || null,
        bankAccountName: body.bankAccountName,
        bankName: body.bankName,
        bankAccountNumber: body.bankAccountNumber,
        bankIfscCode: body.bankIfscCode,
        documentsSubmittedAt: new Date(),
        status: 'DOCS_SUBMITTED',
        currentStep: 7,
      },
    })

    return NextResponse.json({ success: true, currentStep: 7 })
  } catch (error) {
    console.error('Failed to submit documents:', error)
    return NextResponse.json({ error: 'Failed to save documents' }, { status: 500 })
  }
}
