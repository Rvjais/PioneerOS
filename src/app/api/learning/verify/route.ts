import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import {
  generatePracticalTask,
  evaluateResponse,
} from '@/server/ai/learningVerification'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const verifyLearningSchema = z.object({
  learningLogId: z.string().optional(),
  topic: z.string().optional(),
  resourceTitle: z.string().optional(),
  minutesWatched: z.number().optional(),
})

// POST - Generate a verification task for a learning entry
export const POST = withAuth(async (req, { user, params }) => {
  try {
const raw = await req.json()
    const parsed = verifyLearningSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { learningLogId, topic, resourceTitle, minutesWatched } = parsed.data

    if (!topic && !resourceTitle) {
      return NextResponse.json({ error: 'Topic or resource title required' }, { status: 400 })
    }

    // Generate practical task using AI
    const task = await generatePracticalTask(
      topic || 'General Learning',
      resourceTitle || 'Learning Resource',
      minutesWatched || 30
    )

    // Create verification record
    const verification = await prisma.learningVerification.create({
      data: {
        userId: user.id,
        learningLogId,
        topic: topic || 'General',
        resourceTitle: resourceTitle || 'Learning Resource',
        taskPrompt: task.taskPrompt,
        taskType: task.taskType,
        difficulty: task.difficulty,
        status: 'PENDING',
      }
    })

    // If learningLogId provided, link it to the verification
    if (learningLogId) {
      await prisma.learningLog.update({
        where: { id: learningLogId },
        data: { verificationId: verification.id }
      })
    }

    return NextResponse.json({
      success: true,
      verification: {
        id: verification.id,
        taskPrompt: task.taskPrompt,
        taskType: task.taskType,
        difficulty: task.difficulty,
        hints: task.hints,
        expectedOutcome: task.expectedOutcome,
      }
    })
  } catch (error) {
    console.error('Failed to generate verification task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PUT - Submit response and get evaluation
export const PUT = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const { verificationId, userResponse } = body

    if (!verificationId || !userResponse) {
      return NextResponse.json({ error: 'Verification ID and response required' }, { status: 400 })
    }

    // Get the verification record
    const verification = await prisma.learningVerification.findUnique({
      where: { id: verificationId }
    })

    if (!verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 })
    }

    if (verification.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (verification.status === 'EVALUATED') {
      return NextResponse.json({ error: 'Already evaluated' }, { status: 400 })
    }

    // Evaluate the response using AI
    const evaluation = await evaluateResponse(
      verification.taskPrompt,
      verification.topic,
      verification.resourceTitle,
      userResponse
    )

    // Update verification with response and evaluation
    const updatedVerification = await prisma.learningVerification.update({
      where: { id: verificationId },
      data: {
        userResponse,
        submittedAt: new Date(),
        aiScore: evaluation.score,
        aiFeedback: evaluation.feedback,
        evaluatedAt: new Date(),
        isVerified: evaluation.isVerified,
        status: 'EVALUATED',
      }
    })

    return NextResponse.json({
      success: true,
      evaluation: {
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        isVerified: evaluation.isVerified,
      },
      verification: {
        id: updatedVerification.id,
        status: updatedVerification.status,
      }
    })
  } catch (error) {
    console.error('Failed to evaluate response:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// GET - Get verification status/history for user
export const GET = withAuth(async (req, { user, params }) => {
  try {
const searchParams = req.nextUrl.searchParams
    const learningLogId = searchParams.get('learningLogId')
    const verificationId = searchParams.get('id')

    // Get specific verification
    if (verificationId) {
      const verification = await prisma.learningVerification.findUnique({
        where: { id: verificationId }
      })

      if (!verification || verification.userId !== user.id) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }

      return NextResponse.json({ verification })
    }

    // Get verification for specific learning log
    if (learningLogId) {
      const learningLog = await prisma.learningLog.findUnique({
        where: { id: learningLogId },
        include: { verification: true }
      })

      if (!learningLog || learningLog.userId !== user.id) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }

      return NextResponse.json({ verification: learningLog.verification })
    }

    // Get all pending verifications for user
    const pendingVerifications = await prisma.learningVerification.findMany({
      where: {
        userId: user.id,
        status: 'PENDING'
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({ verifications: pendingVerifications })
  } catch (error) {
    console.error('Failed to get verifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PATCH - Skip a verification (mark as skipped)
export const PATCH = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const { verificationId } = body

    if (!verificationId) {
      return NextResponse.json({ error: 'Verification ID required' }, { status: 400 })
    }

    const verification = await prisma.learningVerification.findUnique({
      where: { id: verificationId }
    })

    if (!verification) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (verification.userId !== user.id && !['SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.learningVerification.update({
      where: { id: verificationId },
      data: {
        status: 'SKIPPED',
        aiScore: 0,
        aiFeedback: 'Verification skipped by user',
        evaluatedAt: new Date(),
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to skip verification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
