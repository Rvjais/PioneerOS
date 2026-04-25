import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const sendAssessmentSchema = z.object({
  candidateId: z.string().min(1),
})

const bulkSendSchema = z.object({
  candidateIds: z.array(z.string().min(1)).min(1),
})

// POST /api/hr/assessment/send - Send assessment form to a candidate
export const POST = withAuth(async (req) => {
  try {
    const raw = await req.json()
    const parsed = sendAssessmentSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { candidateId } = parsed.data

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { assessment: true },
    })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    // If assessment already exists, return existing token
    if (candidate.assessment) {
      return NextResponse.json({
        token: candidate.assessment.token,
        link: `/assessment/${candidate.assessment.token}`,
        alreadyExists: true,
      })
    }

    // Create assessment with token
    const assessment = await prisma.candidateAssessment.create({
      data: {
        candidateId,
        fullName: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
      },
    })

    // Update candidate status
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: 'SCREENING', currentStage: 'APPLIED' },
    })

    return NextResponse.json({
      token: assessment.token,
      link: `/assessment/${assessment.token}`,
      alreadyExists: false,
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create assessment:', error)
    return NextResponse.json({ error: 'Failed to send assessment' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'HR', 'OPERATIONS_HEAD', 'OM'] })

// POST /api/hr/assessment/send - Bulk send
export const PUT = withAuth(async (req) => {
  try {
    const raw = await req.json()
    const parsed = bulkSendSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { candidateIds } = parsed.data

    const results = await Promise.all(
      candidateIds.map(async (candidateId) => {
        const candidate = await prisma.candidate.findUnique({
          where: { id: candidateId },
          include: { assessment: true },
        })

        if (!candidate || candidate.assessment) {
          return { candidateId, skipped: true, token: candidate?.assessment?.token }
        }

        const assessment = await prisma.candidateAssessment.create({
          data: {
            candidateId,
            fullName: candidate.name,
            email: candidate.email,
            phone: candidate.phone,
          },
        })

        await prisma.candidate.update({
          where: { id: candidateId },
          data: { status: 'SCREENING' },
        })

        return { candidateId, skipped: false, token: assessment.token }
      })
    )

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Failed to bulk send assessments:', error)
    return NextResponse.json({ error: 'Failed to send assessments' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'HR', 'OPERATIONS_HEAD', 'OM'] })
