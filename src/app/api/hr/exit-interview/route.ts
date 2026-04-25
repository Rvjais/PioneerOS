import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const exitInterviewSchema = z.object({
  empId: z.string().max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  primaryReason: z.string().min(1).max(500),
  detailedReason: z.string().max(5000).optional(),
  newEmployer: z.string().max(200).optional(),
  newRole: z.string().max(200).optional(),
  overallExperience: z.union([z.string(), z.number()]).optional(),
  managerRating: z.union([z.string(), z.number()]).optional(),
  teamRating: z.union([z.string(), z.number()]).optional(),
  growthRating: z.union([z.string(), z.number()]).optional(),
  workLifeRating: z.union([z.string(), z.number()]).optional(),
  compensationRating: z.union([z.string(), z.number()]).optional(),
  bestThings: z.string().max(5000).optional(),
  improvements: z.string().max(5000).optional(),
  wouldRecommend: z.boolean().optional(),
  wouldReturn: z.boolean().optional(),
  additionalComments: z.string().max(5000).optional(),
  confidentialityAcknowledged: z.boolean().optional(),
  lastWorkingDate: z.string().max(50).optional(),
})

export const POST = withAuth(async (req, { user, params }) => {
  try {
    // SECURITY FIX: Require authentication
const rawData = await req.json()
    const parsed = exitInterviewSchema.safeParse(rawData)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data

    // SECURITY FIX: User can only submit exit interview for themselves
    // OR HR can submit for any employee
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true, department: true }
    })

    const isHR = currentUser?.role === 'HR' ||
                 currentUser?.department === 'HR' ||
                 currentUser?.role === 'SUPER_ADMIN'

    let dbUser
    if (isHR && (data.empId || data.phone || data.email)) {
      // HR can submit for any employee - require at least one identifier
      if (!data.empId && !data.email && !data.phone) {
        return NextResponse.json({ error: 'Employee identifier required' }, { status: 400 })
      }
      dbUser = await prisma.user.findFirst({
        where: data.empId ? { empId: data.empId, deletedAt: null } : (data.email ? { email: data.email, deletedAt: null } : { phone: data.phone, deletedAt: null })
      })
      if (!dbUser && data.phone) {
        dbUser = await prisma.user.findFirst({ where: { phone: data.phone, deletedAt: null } })
      }
      if (!dbUser && data.email) {
        dbUser = await prisma.user.findFirst({ where: { email: data.email, deletedAt: null } })
      }
    } else {
      // Non-HR users can only submit for themselves
      dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Employee not found. Please check your details.' },
        { status: 404 }
      )
    }

    // Calculate average rating
    const ratings = [
      parseInt(String(data.overallExperience)) || 0,
      parseInt(String(data.managerRating)) || 0,
      parseInt(String(data.teamRating)) || 0,
      parseInt(String(data.growthRating)) || 0,
      parseInt(String(data.workLifeRating)) || 0,
      parseInt(String(data.compensationRating)) || 0,
    ].filter(r => r > 0)
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

    // Build comprehensive exit interview notes
    const exitInterviewNotes = JSON.stringify({
      submittedAt: new Date().toISOString(),
      primaryReason: data.primaryReason,
      detailedReason: data.detailedReason,
      newEmployer: data.newEmployer,
      newRole: data.newRole,
      ratings: {
        overall: data.overallExperience,
        manager: data.managerRating,
        team: data.teamRating,
        growth: data.growthRating,
        workLife: data.workLifeRating,
        compensation: data.compensationRating,
        average: avgRating.toFixed(1),
      },
      feedback: {
        bestThings: data.bestThings,
        improvements: data.improvements,
        wouldRecommend: data.wouldRecommend,
        wouldReturn: data.wouldReturn,
        additionalComments: data.additionalComments,
      },
      confidentialityAcknowledged: data.confidentialityAcknowledged,
    })

    // Check if exit process already exists for this user
    let exitProcess = await prisma.exitProcess.findFirst({
      where: { userId: dbUser.id }
    })

    if (exitProcess) {
      // Update existing exit process with interview notes
      await prisma.exitProcess.update({
        where: { id: exitProcess.id },
        data: {
          lastWorkingDate: data.lastWorkingDate ? new Date(data.lastWorkingDate) : undefined,
          reason: data.primaryReason,
          exitInterviewNotes,
          status: 'IN_PROGRESS',
        }
      })
    } else {
      // Create new exit process
      exitProcess = await prisma.exitProcess.create({
        data: {
          userId: dbUser.id,
          type: 'RESIGNATION',
          noticeDate: new Date(),
          lastWorkingDate: data.lastWorkingDate ? new Date(data.lastWorkingDate) : undefined,
          reason: data.primaryReason,
          exitInterviewNotes,
          status: 'IN_PROGRESS',
        }
      })
    }

    // Update user status to reflect exit process
    // Only set EXITING if current status is ACTIVE or PROBATION;
    // don't overwrite NOTICE_PERIOD or other terminal statuses
    if (['ACTIVE', 'PROBATION'].includes(dbUser.status)) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          status: 'EXITING',
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Exit interview submitted successfully'
    })
  } catch (error) {
    console.error('Exit interview submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit exit interview. Please try again.' },
      { status: 500 }
    )
  }
})
