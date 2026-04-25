import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET: Fetch single interview
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        candidate: true,
        interviewer: true
      }
    })

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    return NextResponse.json({ interview })
  } catch (error) {
    console.error('Error fetching interview:', error)
    return NextResponse.json({ error: 'Failed to fetch interview' }, { status: 500 })
  }
})

// PATCH: Update interview (reschedule, add feedback, change status)
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!
    const body = await req.json()

    const {
      scheduledAt,
      duration,
      location,
      meetingLink,
      calendarEventId,
      interviewerId,
      status,
      feedback,
      rating,
      decision,
      notes
    } = body

    const updateData: Record<string, unknown> = {}

    if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt)
    if (duration !== undefined) updateData.duration = duration
    if (location !== undefined) updateData.location = location
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink
    if (calendarEventId !== undefined) updateData.calendarEventId = calendarEventId
    if (interviewerId !== undefined) updateData.interviewerId = interviewerId
    if (status) updateData.status = status
    if (feedback !== undefined) updateData.feedback = feedback
    if (rating !== undefined) updateData.rating = rating
    if (decision !== undefined) updateData.decision = decision
    if (notes !== undefined) updateData.notes = notes

    const interview = await prisma.interview.update({
      where: { id },
      data: updateData,
      include: {
        candidate: true,
        interviewer: true
      }
    })

    // If interview completed with decision, update candidate stage
    if (status === 'COMPLETED' && decision) {
      const stageCompleteMapping: Record<string, string> = {
        'PHONE_SCREEN': 'PHONE_SCREEN_DONE',
        'MANAGER_INTERVIEW': 'MANAGER_INTERVIEW_DONE',
        'TEST_TASK': 'TEST_TASK_SUBMITTED',
        'FOUNDER_INTERVIEW': 'FOUNDER_INTERVIEW_DONE'
      }

      const candidateUpdate: Record<string, unknown> = {
        currentStage: stageCompleteMapping[interview.stage] || interview.stage
      }

      // Store feedback based on stage
      if (interview.stage === 'PHONE_SCREEN') {
        candidateUpdate.phoneScreenNotes = feedback
        candidateUpdate.phoneScreenRating = rating
      } else if (interview.stage === 'MANAGER_INTERVIEW') {
        candidateUpdate.managerFeedback = feedback
        candidateUpdate.managerRating = rating
      } else if (interview.stage === 'FOUNDER_INTERVIEW') {
        candidateUpdate.founderFeedback = feedback
        candidateUpdate.founderDecision = decision
      }

      // If rejected, update status
      if (decision === 'REJECT') {
        candidateUpdate.status = 'REJECTED'
        candidateUpdate.rejectionReason = feedback
      }

      await prisma.candidate.update({
        where: { id: interview.candidateId },
        data: candidateUpdate
      })
    }

    return NextResponse.json({ interview })
  } catch (error) {
    console.error('Error updating interview:', error)
    return NextResponse.json({ error: 'Failed to update interview' }, { status: 500 })
  }
})

// DELETE: Cancel interview
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, department: true }
    })

    if (!dbUser || (!['SUPER_ADMIN', 'MANAGER', 'HR'].includes(dbUser.role) && dbUser.department !== 'HR')) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { id } = await routeParams!

    // Mark as cancelled instead of deleting
    const interview = await prisma.interview.update({
      where: { id },
      data: { status: 'CANCELLED' }
    })

    return NextResponse.json({ interview, message: 'Interview cancelled' })
  } catch (error) {
    console.error('Error cancelling interview:', error)
    return NextResponse.json({ error: 'Failed to cancel interview' }, { status: 500 })
  }
})
