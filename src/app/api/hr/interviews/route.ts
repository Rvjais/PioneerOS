import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET: Fetch interviews with filters
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY FIX: Only HR, managers, and interviewers can view interviews
    // Interviewers only see their own assigned interviews
    const isAdmin = ['SUPER_ADMIN', 'MANAGER', 'HR'].includes(user.role || '')

    const { searchParams } = new URL(req.url)
    const candidateId = searchParams.get('candidateId')
    const stage = searchParams.get('stage')
    const status = searchParams.get('status')
    const interviewerId = searchParams.get('interviewerId')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const where: Record<string, unknown> = {}

    // Non-admins can only see their assigned interviews
    if (!isAdmin) {
      where.interviewerId = user.id
    }

    if (candidateId) where.candidateId = candidateId
    if (stage) where.stage = stage
    if (status) where.status = status
    if (interviewerId && isAdmin) where.interviewerId = interviewerId

    if (from || to) {
      where.scheduledAt = {}
      if (from) (where.scheduledAt as Record<string, unknown>).gte = new Date(from)
      if (to) (where.scheduledAt as Record<string, unknown>).lte = new Date(to)
    }

    const interviews = await prisma.interview.findMany({
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
          }
        },
        interviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    })

    return NextResponse.json({ interviews })
  } catch (error) {
    console.error('Error fetching interviews:', error)
    return NextResponse.json({ error: 'Failed to fetch interviews' }, { status: 500 })
  }
})

// POST: Schedule a new interview
export const POST = withAuth(async (req, { user }) => {
  try {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only HR and managers can schedule interviews
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, department: true }
    })

    if (!dbUser || (!['SUPER_ADMIN', 'MANAGER', 'HR'].includes(dbUser.role) && dbUser.department !== 'HR')) {
      return NextResponse.json({ error: 'Not authorized to schedule interviews' }, { status: 403 })
    }

    const body = await req.json()
    const {
      candidateId,
      stage,
      scheduledAt,
      duration = 30,
      location,
      meetingLink,
      interviewerId,
      notes
    } = body

    if (!candidateId || !stage || !scheduledAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate stage
    const validStages = ['PHONE_SCREEN', 'MANAGER_INTERVIEW', 'TEST_TASK', 'FOUNDER_INTERVIEW']
    if (!validStages.includes(stage)) {
      return NextResponse.json({ error: 'Invalid interview stage' }, { status: 400 })
    }

    // Create interview
    const interview = await prisma.interview.create({
      data: {
        candidateId,
        stage,
        scheduledAt: new Date(scheduledAt),
        duration,
        location,
        meetingLink,
        interviewerId,
        notes,
        status: 'SCHEDULED'
      },
      include: {
        candidate: true,
        interviewer: true
      }
    })

    // Update candidate stage
    const stageMapping: Record<string, string> = {
      'PHONE_SCREEN': 'PHONE_SCREEN_SCHEDULED',
      'MANAGER_INTERVIEW': 'MANAGER_INTERVIEW_SCHEDULED',
      'TEST_TASK': 'TEST_TASK_ASSIGNED',
      'FOUNDER_INTERVIEW': 'FOUNDER_INTERVIEW_SCHEDULED'
    }

    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        currentStage: stageMapping[stage] || stage,
        status: stage === 'PHONE_SCREEN' ? 'SCREENING' : 'INTERVIEW'
      }
    })

    return NextResponse.json({ interview })
  } catch (error) {
    console.error('Error scheduling interview:', error)
    return NextResponse.json({ error: 'Failed to schedule interview' }, { status: 500 })
  }
})
