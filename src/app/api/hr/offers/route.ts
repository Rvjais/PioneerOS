import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const createOfferSchema = z.object({
  candidateId: z.string().min(1, 'Candidate ID is required'),
  position: z.string().min(1, 'Position is required').max(200),
  department: z.string().min(1, 'Department is required').max(100),
  offeredSalary: z.number().positive('Salary must be positive'),
  joiningDate: z.string().optional().nullable(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']).default('FULL_TIME'),
  probationMonths: z.number().int().min(0).max(24).default(3),
  noticePeriodDays: z.number().int().min(0).max(180).default(30),
  negotiationNotes: z.string().max(5000).optional().nullable(),
})

// GET: Fetch offer letters
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY FIX: Only HR and managers can view offer letters (contains salary info)
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'HR']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Offer letters require HR access' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const candidateId = searchParams.get('candidateId')

    const where: Record<string, unknown> = {}

    if (status) where.status = status
    if (candidateId) where.candidateId = candidateId

    const offers = await prisma.offerLetter.findMany({
      where,
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            position: true,
            department: true,
            expectedSalary: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get stats
    const stats = {
      total: offers.length,
      draft: offers.filter(o => o.status === 'DRAFT').length,
      pendingApproval: offers.filter(o => o.status === 'PENDING_APPROVAL').length,
      approved: offers.filter(o => o.status === 'APPROVED').length,
      sent: offers.filter(o => o.status === 'SENT').length,
      accepted: offers.filter(o => o.status === 'ACCEPTED').length,
      rejected: offers.filter(o => o.status === 'REJECTED').length,
    }

    return NextResponse.json({ offers, stats })
  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 })
  }
})

// POST: Create new offer letter
export const POST = withAuth(async (req, { user }) => {
  try {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only HR can create offers
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, department: true }
    })

    if (!dbUser || (!['SUPER_ADMIN', 'HR'].includes(dbUser.role) && dbUser.department !== 'HR')) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = createOfferSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const {
      candidateId,
      position,
      department,
      offeredSalary,
      joiningDate,
      employmentType,
      probationMonths,
      noticePeriodDays,
      negotiationNotes
    } = parsed.data

    // Check if offer already exists for this candidate
    const existing = await prisma.offerLetter.findUnique({
      where: { candidateId }
    })

    if (existing) {
      return NextResponse.json({ error: 'Offer already exists for this candidate' }, { status: 400 })
    }

    const offer = await prisma.offerLetter.create({
      data: {
        candidateId,
        position,
        department,
        offeredSalary,
        joiningDate: joiningDate ? new Date(joiningDate) : null,
        employmentType,
        probationMonths,
        noticePeriodDays,
        negotiationNotes,
        status: 'DRAFT'
      },
      include: {
        candidate: true
      }
    })

    // Update candidate status
    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        status: 'OFFER',
        currentStage: 'OFFER_PENDING',
        offeredSalary
      }
    })

    return NextResponse.json({ offer })
  } catch (error) {
    console.error('Error creating offer:', error)
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 })
  }
})
