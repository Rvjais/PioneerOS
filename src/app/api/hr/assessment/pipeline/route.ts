import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET /api/hr/assessment/pipeline - Get all assessments for HR pipeline view
export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const department = searchParams.get('department')

    const where: Record<string, unknown> = {}
    if (status) where.hrStatus = status
    if (department) {
      where.candidate = { department }
    }

    const assessments = await prisma.candidateAssessment.findMany({
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
            source: true,
            status: true,
            currentStage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    // Stats
    const stats = {
      total: assessments.length,
      pending: assessments.filter(a => a.hrStatus === 'PENDING_REVIEW').length,
      completed: assessments.filter(a => a.completed).length,
      shortlisted: assessments.filter(a => a.hrStatus === 'SHORTLISTED').length,
      interviewScheduled: assessments.filter(a => a.hrStatus === 'INTERVIEW_SCHEDULED').length,
      taskAssigned: assessments.filter(a => a.hrStatus === 'TASK_ASSIGNED').length,
      taskSubmitted: assessments.filter(a => a.hrStatus === 'TASK_SUBMITTED').length,
      finalRound: assessments.filter(a => a.hrStatus === 'FINAL_ROUND').length,
      selected: assessments.filter(a => a.hrStatus === 'SELECTED').length,
      rejected: assessments.filter(a => a.hrStatus === 'REJECTED').length,
    }

    return NextResponse.json({ assessments, stats })
  } catch (error) {
    console.error('Failed to fetch assessment pipeline:', error)
    return NextResponse.json({ error: 'Failed to fetch pipeline' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'HR', 'OPERATIONS_HEAD', 'OM'] })
