import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

type RouteParams = {
  params: Promise<{ userId: string }>
}

const checklistUpdateSchema = z.object({
  offerLetterSigned: z.boolean().optional(),
  idProofSubmitted: z.boolean().optional(),
  addressProofSubmitted: z.boolean().optional(),
  panCardSubmitted: z.boolean().optional(),
  bankDetailsSubmitted: z.boolean().optional(),
  educationDocsSubmitted: z.boolean().optional(),
  profilePhotoSubmitted: z.boolean().optional(),
  emailCreated: z.boolean().optional(),
  slackInviteSent: z.boolean().optional(),
  systemAccessGranted: z.boolean().optional(),
  deviceAllocated: z.boolean().optional(),
  softwareLicensesAssigned: z.boolean().optional(),
  hrOrientationComplete: z.boolean().optional(),
  policiesAcknowledged: z.boolean().optional(),
  ndaSigned: z.boolean().optional(),
  biometricRegistered: z.boolean().optional(),
  buddyAssigned: z.boolean().optional(),
  teamIntroductionDone: z.boolean().optional(),
  departmentTrainingDone: z.boolean().optional(),
  firstWeekCheckIn: z.boolean().optional(),
  thirtyDayReview: z.boolean().optional(),
  hrNotes: z.string().optional(),
})

// Default checklist items - all initialized to false
const DEFAULT_CHECKLIST_ITEMS = {
  offerLetterSigned: false,
  idProofSubmitted: false,
  addressProofSubmitted: false,
  panCardSubmitted: false,
  bankDetailsSubmitted: false,
  educationDocsSubmitted: false,
  profilePhotoSubmitted: false,
  emailCreated: false,
  slackInviteSent: false,
  systemAccessGranted: false,
  deviceAllocated: false,
  softwareLicensesAssigned: false,
  hrOrientationComplete: false,
  policiesAcknowledged: false,
  ndaSigned: false,
  biometricRegistered: false,
  buddyAssigned: false,
  teamIntroductionDone: false,
  departmentTrainingDone: false,
  firstWeekCheckIn: false,
  thirtyDayReview: false,
}

// GET - Fetch employee onboarding checklist (auto-creates if empty)
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { userId } = await routeParams!

    // Authorization: only HR, SUPER_ADMIN, MANAGER, or the user themselves can view
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true, department: true }
    })

    const isHROrAdmin = currentUser?.role === 'SUPER_ADMIN' ||
                        currentUser?.role === 'HR' ||
                        currentUser?.role === 'MANAGER' ||
                        currentUser?.department === 'HR'
    const isSelf = user.id === userId

    if (!isHROrAdmin && !isSelf) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // First check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Try to find existing checklist, or auto-create one
    let checklist = await prisma.employeeOnboardingChecklist.findUnique({
      where: { userId }
    })

    // Auto-create checklist if it doesn't exist
    if (!checklist) {
      checklist = await prisma.employeeOnboardingChecklist.create({
        data: {
          userId,
          ...DEFAULT_CHECKLIST_ITEMS,
          hrNotes: '',
          completionPercentage: 0,
          status: 'PENDING',
          lastUpdatedBy: user.id,
        }
      })
    }

    // Convert the checklist to a items object
    const items: Record<string, boolean> = {
      offerLetterSigned: checklist.offerLetterSigned,
      idProofSubmitted: checklist.idProofSubmitted,
      addressProofSubmitted: checklist.addressProofSubmitted,
      panCardSubmitted: checklist.panCardSubmitted,
      bankDetailsSubmitted: checklist.bankDetailsSubmitted,
      educationDocsSubmitted: checklist.educationDocsSubmitted,
      profilePhotoSubmitted: checklist.profilePhotoSubmitted,
      emailCreated: checklist.emailCreated,
      slackInviteSent: checklist.slackInviteSent,
      systemAccessGranted: checklist.systemAccessGranted,
      deviceAllocated: checklist.deviceAllocated,
      softwareLicensesAssigned: checklist.softwareLicensesAssigned,
      hrOrientationComplete: checklist.hrOrientationComplete,
      policiesAcknowledged: checklist.policiesAcknowledged,
      ndaSigned: checklist.ndaSigned,
      biometricRegistered: checklist.biometricRegistered,
      buddyAssigned: checklist.buddyAssigned,
      teamIntroductionDone: checklist.teamIntroductionDone,
      departmentTrainingDone: checklist.departmentTrainingDone,
      firstWeekCheckIn: checklist.firstWeekCheckIn,
      thirtyDayReview: checklist.thirtyDayReview,
    }

    return NextResponse.json({
      items,
      hrNotes: checklist.hrNotes,
      completionPercentage: checklist.completionPercentage,
      status: checklist.status
    })
  } catch (error) {
    console.error('Failed to fetch checklist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PATCH - Update employee onboarding checklist
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { userId } = await routeParams!

    // Authorization: only HR, SUPER_ADMIN, or MANAGER can update checklists
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true, department: true }
    })

    const isHROrAdmin = currentUser?.role === 'SUPER_ADMIN' ||
                        currentUser?.role === 'HR' ||
                        currentUser?.role === 'MANAGER' ||
                        currentUser?.department === 'HR'

    if (!isHROrAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const raw = await req.json()
    const parsed = checklistUpdateSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const body = parsed.data

    // Build update data
    const updateData: Record<string, boolean | string | number | Date> = {}
    const booleanFields = [
      'offerLetterSigned', 'idProofSubmitted', 'addressProofSubmitted',
      'panCardSubmitted', 'bankDetailsSubmitted', 'educationDocsSubmitted',
      'profilePhotoSubmitted', 'emailCreated', 'slackInviteSent',
      'systemAccessGranted', 'deviceAllocated', 'softwareLicensesAssigned',
      'hrOrientationComplete', 'policiesAcknowledged', 'ndaSigned',
      'biometricRegistered', 'buddyAssigned', 'teamIntroductionDone',
      'departmentTrainingDone', 'firstWeekCheckIn', 'thirtyDayReview'
    ]

    for (const field of booleanFields) {
      if (field in body) {
        updateData[field] = body[field]
        if (body[field] === true) {
          updateData[`${field}At`] = new Date()
        }
      }
    }

    if ('hrNotes' in body) {
      updateData.hrNotes = body.hrNotes ?? ''
    }

    updateData.lastUpdatedBy = user.id

    // Calculate completion percentage
    const checklist = await prisma.employeeOnboardingChecklist.findUnique({
      where: { userId }
    })

    let currentData = checklist || {}
    const mergedData = { ...currentData, ...updateData }

    let completed = 0
    for (const field of booleanFields) {
      if ((mergedData as Record<string, boolean>)[field]) {
        completed++
      }
    }
    const completionPercentage = Math.round((completed / booleanFields.length) * 100)
    updateData.completionPercentage = completionPercentage
    updateData.status = completionPercentage === 100 ? 'COMPLETED' :
                        completionPercentage > 0 ? 'IN_PROGRESS' : 'PENDING'

    // Upsert the checklist
    const result = await prisma.employeeOnboardingChecklist.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...DEFAULT_CHECKLIST_ITEMS,
        ...updateData
      }
    })

    // Auto-activate user when onboarding checklist is 100% complete
    if (completionPercentage === 100) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          status: 'ACTIVE',
          onboardingStep: 8,
        },
      }).catch(() => { /* user may already be active */ })

      // Notify the employee
      await prisma.notification.create({
        data: {
          userId,
          type: 'ONBOARDING_COMPLETE',
          title: 'Onboarding Complete! 🎉',
          message: 'All onboarding tasks are done. You are now a fully active team member!',
          link: '/profile',
          priority: 'HIGH',
        },
      }).catch(() => { /* notification is bonus */ })
    }

    return NextResponse.json({ success: true, completionPercentage })
  } catch (error) {
    console.error('Failed to update checklist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
