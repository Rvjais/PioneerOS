import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET: Fetch candidates with INTERVIEW status but no scheduled interviews
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY FIX: Only HR, managers can view pending candidates
    const isAdmin = ['SUPER_ADMIN', 'MANAGER', 'HR'].includes(user.role || '')

    if (!isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Get all candidate IDs that have scheduled interviews
    const scheduledCandidateIds = await prisma.interview.findMany({
      where: {
        status: { in: ['SCHEDULED', 'COMPLETED'] },
      },
      select: { candidateId: true },
    })

    const scheduledIds = new Set(scheduledCandidateIds.map(i => i.candidateId))

    // Get candidates with INTERVIEW status but no scheduled interviews
    const candidates = await prisma.candidate.findMany({
      where: {
        status: {
          in: ['INTERVIEW', 'SCREENING', 'PHONE_SCREEN', 'MANAGER_INTERVIEW', 'TEST_TASK', 'FOUNDER_INTERVIEW'],
        },
        id: { notIn: Array.from(scheduledIds) },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        department: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ candidates })
  } catch (error) {
    console.error('Error fetching pending candidates:', error)
    return NextResponse.json({ error: 'Failed to fetch pending candidates' }, { status: 500 })
  }
})
