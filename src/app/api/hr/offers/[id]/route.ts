import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const updateOfferSchema = z.object({
  offeredSalary: z.number().positive().optional(),
  joiningDate: z.string().nullable().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']).optional(),
  probationMonths: z.number().int().min(0).max(24).optional(),
  noticePeriodDays: z.number().int().min(0).max(180).optional(),
  negotiationNotes: z.string().max(5000).nullable().optional(),
  finalSalary: z.number().positive().nullable().optional(),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'ACCEPTED', 'REJECTED', 'WITHDRAWN']).optional(),
  candidateResponse: z.enum(['ACCEPTED', 'REJECTED', 'NEGOTIATING']).optional(),
  offerLetterUrl: z.string().url().nullable().optional(),
  signedUrl: z.string().url().nullable().optional(),
}).strict()

const HR_ALLOWED_ROLES = ['SUPER_ADMIN', 'HR', 'MANAGER']

async function checkHRAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, department: true }
  })
  return user && (HR_ALLOWED_ROLES.includes(user.role ?? '') || user.department === 'HR')
}

// GET: Fetch single offer
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    if (!(await checkHRAccess(user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await routeParams!

    const offer = await prisma.offerLetter.findUnique({
      where: { id },
      include: {
        candidate: true
      }
    })

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    return NextResponse.json({ offer })
  } catch (error) {
    console.error('Error fetching offer:', error)
    return NextResponse.json({ error: 'Failed to fetch offer' }, { status: 500 })
  }
})

// PATCH: Update offer (approve, send, record response, etc.)
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    if (!(await checkHRAccess(user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await routeParams!
    const rawBody = await req.json()
    const parsed = updateOfferSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const {
      offeredSalary,
      joiningDate,
      employmentType,
      probationMonths,
      noticePeriodDays,
      negotiationNotes,
      finalSalary,
      status,
      candidateResponse,
      offerLetterUrl,
      signedUrl
    } = parsed.data

    const updateData: Record<string, unknown> = {}

    if (offeredSalary !== undefined) updateData.offeredSalary = offeredSalary
    if (joiningDate !== undefined) updateData.joiningDate = joiningDate ? new Date(joiningDate) : null
    if (employmentType !== undefined) updateData.employmentType = employmentType
    if (probationMonths !== undefined) updateData.probationMonths = probationMonths
    if (noticePeriodDays !== undefined) updateData.noticePeriodDays = noticePeriodDays
    if (negotiationNotes !== undefined) updateData.negotiationNotes = negotiationNotes
    if (finalSalary !== undefined) updateData.finalSalary = finalSalary
    if (offerLetterUrl !== undefined) updateData.offerLetterUrl = offerLetterUrl
    if (signedUrl !== undefined) updateData.signedUrl = signedUrl
    if (candidateResponse !== undefined) {
      updateData.candidateResponse = candidateResponse
      updateData.respondedAt = new Date()
    }

    // Handle status changes
    if (status) {
      updateData.status = status

      if (status === 'PENDING_APPROVAL') {
        // HR submitting for founder approval
        const founders = await prisma.user.findMany({
          where: { role: 'SUPER_ADMIN', deletedAt: null },
          select: { id: true }
        })

        for (const founder of founders) {
          await prisma.notification.create({
            data: {
              userId: founder.id,
              type: 'OFFER_APPROVAL',
              title: 'Offer Letter Approval Required',
              message: `New offer letter pending approval`,
              link: `/hr/offers/${id}`
            }
          })
        }
      }

      if (status === 'APPROVED') {
        // Only founder can approve
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true }
        })

        if (dbUser?.role !== 'SUPER_ADMIN') {
          return NextResponse.json({ error: 'Only founders can approve offers' }, { status: 403 })
        }

        updateData.approvedBy = user.id
        updateData.approvedAt = new Date()

        // Notify HR
        const hrUsers = await prisma.user.findMany({
          where: { department: 'HR', deletedAt: null },
          select: { id: true }
        })

        for (const hr of hrUsers) {
          await prisma.notification.create({
            data: {
              userId: hr.id,
              type: 'OFFER_APPROVED',
              title: 'Offer Approved',
              message: 'An offer letter has been approved. Ready to send.',
              link: `/hr/offers/${id}`
            }
          })
        }
      }

      if (status === 'SENT') {
        updateData.sentAt = new Date()
      }
    }

    const offer = await prisma.offerLetter.update({
      where: { id },
      data: updateData,
      include: {
        candidate: true
      }
    })

    // Update candidate based on response
    if (candidateResponse) {
      const candidateUpdate: Record<string, unknown> = {}

      if (candidateResponse === 'ACCEPTED') {
        candidateUpdate.status = 'JOINED'
        candidateUpdate.currentStage = 'JOINED'

        // Notify HR about acceptance
        const hrUsers = await prisma.user.findMany({
          where: { department: 'HR', deletedAt: null },
          select: { id: true }
        })

        for (const hr of hrUsers) {
          await prisma.notification.create({
            data: {
              userId: hr.id,
              type: 'OFFER_ACCEPTED',
              title: 'Offer Accepted!',
              message: `${offer.candidate.name} has accepted the offer! Candidate joined — initiate employee onboarding.`,
              link: '/hr/employee-onboarding'
            }
          })
        }
      } else if (candidateResponse === 'REJECTED') {
        candidateUpdate.status = 'REJECTED'
        candidateUpdate.currentStage = 'REJECTED'
        candidateUpdate.rejectionReason = 'Offer rejected by candidate'
      } else if (candidateResponse === 'NEGOTIATING') {
        candidateUpdate.currentStage = 'OFFER_NEGOTIATING'
      }

      if (Object.keys(candidateUpdate).length > 0) {
        await prisma.candidate.update({
          where: { id: offer.candidateId },
          data: candidateUpdate
        })
      }
    }

    return NextResponse.json({ offer })
  } catch (error) {
    console.error('Error updating offer:', error)
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 })
  }
})

// DELETE: Delete draft offer
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    if (!(await checkHRAccess(user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await routeParams!

    const offer = await prisma.offerLetter.findUnique({
      where: { id }
    })

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    // Can only delete draft offers
    if (offer.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Can only delete draft offers' }, { status: 400 })
    }

    // Update candidate status back
    await prisma.candidate.update({
      where: { id: offer.candidateId },
      data: {
        status: 'INTERVIEW',
        currentStage: 'FOUNDER_INTERVIEW_DONE'
      }
    })

    await prisma.offerLetter.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Offer deleted' })
  } catch (error) {
    console.error('Error deleting offer:', error)
    return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 })
  }
})
