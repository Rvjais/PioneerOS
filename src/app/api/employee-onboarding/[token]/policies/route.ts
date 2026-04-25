import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

// POST - Acknowledge company policies
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const body = await req.json()
    const schema = z.object({
      handbookAccepted: z.literal(true),
      socialMediaPolicyAccepted: z.literal(true),
      confidentialityAccepted: z.literal(true),
      antiHarassmentAccepted: z.literal(true),
      codeOfConductAccepted: z.literal(true),
      signerName: z.string().min(1).max(200),
      agreedToTerms: z.literal(true),
      signatureData: z.string().max(10000).optional(),
      signatureType: z.string().max(50).optional(),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })

    const proposal = await prisma.employeeProposal.findUnique({ where: { token } })
    if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (proposal.expiresAt && proposal.expiresAt < new Date()) return NextResponse.json({ error: 'This onboarding link has expired' }, { status: 410 })
    if (!proposal.bondAccepted) return NextResponse.json({ error: 'Please sign the bond first' }, { status: 400 })

    await prisma.employeeProposal.update({
      where: { token },
      data: {
        handbookAccepted: true,
        socialMediaPolicyAccepted: true,
        confidentialityAccepted: true,
        antiHarassmentAccepted: true,
        codeOfConductAccepted: true,
        policiesAcceptedAt: new Date(),
        policiesSignerName: body.signerName,
        policiesSignatureData: body.signatureData || null,
        policiesSignatureType: body.signatureType || 'type',
        status: 'POLICIES_ACCEPTED',
        currentStep: 6,
      },
    })

    return NextResponse.json({ success: true, currentStep: 6 })
  } catch (error) {
    console.error('Failed to accept policies:', error)
    return NextResponse.json({ error: 'Failed to save policy acknowledgment' }, { status: 500 })
  }
}
