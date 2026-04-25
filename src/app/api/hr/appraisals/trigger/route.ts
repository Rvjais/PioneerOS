import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { triggerEligibleAppraisals } from '@/server/services/appraisal'
import { withAuth } from '@/server/auth/withAuth'

export const POST = withAuth(async (req, { user, params }) => {
  try {
// Check if user is HR or Admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, department: true },
    })

    const isHR = dbUser?.role === 'SUPER_ADMIN' || dbUser?.role === 'MANAGER' || dbUser?.department === 'HR'
    if (!isHR) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // TODO: Consider enforcing minimum learning hours before allowing appraisal
    // eligibility. Currently learning hours are tracked but not gated here.
    // Trigger appraisals
    const results = await triggerEligibleAppraisals()

    const triggered = results.filter(r => r.status === 'TRIGGERED').length
    const postponed = results.filter(r => r.status === 'POSTPONED').length

    return NextResponse.json({
      success: true,
      triggered,
      postponed,
      details: results,
    })
  } catch (error) {
    console.error('Failed to trigger appraisals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
