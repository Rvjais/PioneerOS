import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// Valid internship type to stipend amount mapping
const STIPEND_MAP: Record<string, number> = {
  PAID_OWN_LAPTOP: 10000,
  PAID_COMPANY_LAPTOP: 8000,
  UNPAID: 0,
}

export const POST = withAuth(async (req, { user }) => {
  try {
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only interns and super admins can acknowledge the handbook
    if (user.role !== 'INTERN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only interns can acknowledge the handbook' }, { status: 403 })
    }

    // Check existing profile to validate stipend/type consistency
    const existing = await prisma.internProfile.findUnique({
      where: { userId: user.id },
    })

    // If profile exists, validate and fix stipend/type mismatch
    const updateData: Record<string, unknown> = {
      handbookAcknowledged: true,
      handbookAcknowledgedAt: new Date(),
    }
    if (existing && existing.internshipType in STIPEND_MAP) {
      const expectedStipend = STIPEND_MAP[existing.internshipType]
      if (existing.stipendAmount !== expectedStipend) {
        updateData.stipendAmount = expectedStipend
      }
    }

    await prisma.internProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        startDate: new Date(),
        expectedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
        handbookAcknowledged: true,
        handbookAcknowledgedAt: new Date(),
      },
      update: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error acknowledging handbook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
