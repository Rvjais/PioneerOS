import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET - List all employee onboarding proposals
export const GET = withAuth(async () => {
  try {
    const proposals = await prisma.employeeProposal.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
        user: { select: { empId: true, status: true } },
      },
    })

    const stats = {
      total: proposals.length,
      sent: proposals.filter(p => p.status === 'SENT' || p.status === 'VIEWED').length,
      inProgress: proposals.filter(p => ['DETAILS_CONFIRMED', 'NDA_SIGNED', 'BOND_SIGNED', 'POLICIES_ACCEPTED', 'DOCS_SUBMITTED'].includes(p.status)).length,
      completed: proposals.filter(p => p.status === 'COMPLETED' || p.status === 'ACTIVATED').length,
      expired: proposals.filter(p => p.expiresAt < new Date() && !p.onboardingCompleted).length,
    }

    return NextResponse.json({ proposals, stats })
  } catch (error) {
    console.error('Failed to list employee proposals:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR'] })
