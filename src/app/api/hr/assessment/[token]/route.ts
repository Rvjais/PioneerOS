import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { z } from 'zod'

const AssessmentSubmitSchema = z.object({
  // Personal - required
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name must be 100 characters or less'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters').max(15, 'Phone must be 15 characters or less'),
  currentCity: z.string().max(100).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  linkedInUrl: z.string().url('Invalid LinkedIn URL').max(500).optional().nullable(),
  portfolioUrl: z.string().url('Invalid portfolio URL').max(500).optional().nullable(),
  resumeUrl: z.string().url('Invalid resume URL').max(500).optional().nullable(),
  // Professional
  totalExperience: z.union([z.string().max(10), z.number()]).optional().nullable(),
  currentCompany: z.string().max(100).optional().nullable(),
  currentRole: z.string().max(100).optional().nullable(),
  currentSalary: z.union([z.string().max(20), z.number()]).optional().nullable(),
  expectedSalary: z.union([z.string().max(20), z.number()]).optional().nullable(),
  noticePeriod: z.string().max(50).optional().nullable(),
  reasonForLeaving: z.string().max(1000).optional().nullable(),
  // Skills
  primarySkills: z.array(z.string().max(100)).max(30).optional().nullable(),
  tools: z.array(z.string().max(100)).max(30).optional().nullable(),
  certifications: z.string().max(1000).optional().nullable(),
  languagesKnown: z.array(z.string().max(50)).max(20).optional().nullable(),
  // Role Fit
  canWorkFromOffice: z.boolean().optional().nullable(),
  commuteDetails: z.string().max(500).optional().nullable(),
  joiningTimeline: z.string().max(100).optional().nullable(),
  readyForTrial: z.boolean().optional().nullable(),
  trialAvailability: z.string().max(200).optional().nullable(),
  // Healthcare
  hasHealthcareExp: z.boolean().optional().nullable(),
  healthcareDetails: z.string().max(2000).optional().nullable(),
  healthcareClients: z.string().max(1000).optional().nullable(),
  // Work Samples
  workSampleUrls: z.array(z.string().url().max(500)).max(10).optional().nullable(),
  caseStudyUrl: z.string().url().max(500).optional().nullable(),
  githubUrl: z.string().url().max(500).optional().nullable(),
  // Screening
  whyThisRole: z.string().max(2000).optional().nullable(),
  biggestAchievement: z.string().max(2000).optional().nullable(),
  challengeExample: z.string().max(2000).optional().nullable(),
  teamWorkStyle: z.string().max(1000).optional().nullable(),
  learningApproach: z.string().max(1000).optional().nullable(),
  salaryNegotiable: z.boolean().optional().nullable(),
  availableForCalls: z.boolean().optional().nullable(),
  preferredCallTime: z.string().max(100).optional().nullable(),
  // Self Assessment
  relevanceRating: z.union([z.string(), z.number().int().min(1).max(10)]).optional().nullable(),
  strengthAreas: z.array(z.string().max(200)).max(20).optional().nullable(),
  improvementAreas: z.array(z.string().max(200)).max(20).optional().nullable(),
  // Additional
  referenceContacts: z.array(z.unknown()).max(10).optional().nullable(),
  additionalInfo: z.string().max(3000).optional().nullable(),
  questionsForUs: z.string().max(2000).optional().nullable(),
})

// GET /api/hr/assessment/[token] - Get assessment (public for candidate, full for HR)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const assessment = await prisma.candidateAssessment.findUnique({
      where: { token },
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
          },
        },
      },
    })

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    return NextResponse.json({ assessment })
  } catch (error) {
    console.error('Failed to fetch assessment:', error)
    return NextResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 })
  }
}

// POST /api/hr/assessment/[token] - Submit assessment (public - candidate fills this)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const rawBody = await req.json()
    const parseResult = AssessmentSubmitSchema.safeParse(rawBody)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const body = parseResult.data

    const assessment = await prisma.candidateAssessment.findUnique({
      where: { token },
    })

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    if (assessment.completed) {
      return NextResponse.json({ error: 'Assessment already submitted' }, { status: 400 })
    }

    // Update assessment with all form data
    const updated = await prisma.candidateAssessment.update({
      where: { token },
      data: {
        completed: true,
        // Personal
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        currentCity: body.currentCity,
        dateOfBirth: body.dateOfBirth,
        linkedInUrl: body.linkedInUrl,
        portfolioUrl: body.portfolioUrl,
        resumeUrl: body.resumeUrl,
        // Professional
        totalExperience: body.totalExperience ? (parseFloat(String(body.totalExperience)) || 0) : null,
        currentCompany: body.currentCompany,
        currentRole: body.currentRole,
        currentSalary: body.currentSalary ? (parseFloat(String(body.currentSalary)) || 0) : null,
        expectedSalary: body.expectedSalary ? (parseFloat(String(body.expectedSalary)) || 0) : null,
        noticePeriod: body.noticePeriod,
        reasonForLeaving: body.reasonForLeaving,
        // Skills
        primarySkills: body.primarySkills ? JSON.stringify(body.primarySkills) : null,
        tools: body.tools ? JSON.stringify(body.tools) : null,
        certifications: body.certifications,
        languagesKnown: body.languagesKnown ? JSON.stringify(body.languagesKnown) : null,
        // Role Fit
        canWorkFromOffice: body.canWorkFromOffice,
        commuteDetails: body.commuteDetails,
        joiningTimeline: body.joiningTimeline,
        readyForTrial: body.readyForTrial,
        trialAvailability: body.trialAvailability,
        // Healthcare
        hasHealthcareExp: body.hasHealthcareExp,
        healthcareDetails: body.healthcareDetails,
        healthcareClients: body.healthcareClients,
        // Work Samples
        workSampleUrls: body.workSampleUrls ? JSON.stringify(body.workSampleUrls) : null,
        caseStudyUrl: body.caseStudyUrl,
        githubUrl: body.githubUrl,
        // Screening
        whyThisRole: body.whyThisRole,
        biggestAchievement: body.biggestAchievement,
        challengeExample: body.challengeExample,
        teamWorkStyle: body.teamWorkStyle,
        learningApproach: body.learningApproach,
        salaryNegotiable: body.salaryNegotiable,
        availableForCalls: body.availableForCalls,
        preferredCallTime: body.preferredCallTime,
        // Self Assessment
        relevanceRating: body.relevanceRating ? parseInt(String(body.relevanceRating)) : null,
        strengthAreas: body.strengthAreas ? JSON.stringify(body.strengthAreas) : null,
        improvementAreas: body.improvementAreas ? JSON.stringify(body.improvementAreas) : null,
        // Additional
        referenceContacts: body.referenceContacts ? JSON.stringify(body.referenceContacts) : null,
        additionalInfo: body.additionalInfo,
        questionsForUs: body.questionsForUs,
      },
    })

    // Update candidate with key data
    await prisma.candidate.update({
      where: { id: assessment.candidateId },
      data: {
        expectedSalary: body.expectedSalary ? (parseFloat(String(body.expectedSalary)) || 0) : undefined,
        experience: body.totalExperience ? Math.round(parseFloat(String(body.totalExperience)) || 0) : undefined,
        resumeUrl: body.resumeUrl || undefined,
        linkedInUrl: body.linkedInUrl || undefined,
        portfolioUrl: body.portfolioUrl || undefined,
        currentStage: 'APPLIED',
      },
    })

    // Notify HR
    const hrUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'HR' },
          { department: 'HR' },
          { role: 'SUPER_ADMIN' },
        ],
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true },
    })

    if (hrUsers.length > 0) {
      await prisma.notification.createMany({
        data: hrUsers.map((u) => ({
          userId: u.id,
          type: 'GENERAL',
          title: 'New Assessment Submitted',
          message: `${body.fullName} has completed their candidate assessment for review.`,
          link: '/hr/assessment-pipeline',
          priority: 'MEDIUM',
        })),
      })
    }

    return NextResponse.json({ success: true, id: updated.id })
  } catch (error) {
    console.error('Failed to submit assessment:', error)
    return NextResponse.json({ error: 'Failed to submit assessment' }, { status: 500 })
  }
}

// PATCH /api/hr/assessment/[token] - HR updates (shortlist, assign task, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'HR']
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { token } = await params
    const body = await req.json()

    const assessment = await prisma.candidateAssessment.findUnique({
      where: { token },
    })

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    // HR Status updates
    if (body.hrStatus) {
      updateData.hrStatus = body.hrStatus
      if (body.hrStatus === 'SHORTLISTED') {
        updateData.shortlistedAt = new Date()
        updateData.shortlistedBy = session.user.id
      }
    }

    // HR Notes
    if (body.hrNotes !== undefined) updateData.hrNotes = body.hrNotes

    // Interview scheduling
    if (body.interviewDate) updateData.interviewDate = new Date(body.interviewDate)
    if (body.interviewMode) updateData.interviewMode = body.interviewMode
    if (body.interviewNotes !== undefined) updateData.interviewNotes = body.interviewNotes
    if (body.interviewRating !== undefined) updateData.interviewRating = body.interviewRating

    // Task assignment
    if (body.taskTitle) updateData.taskTitle = body.taskTitle
    if (body.taskDescription) updateData.taskDescription = body.taskDescription
    if (body.taskDeadline) updateData.taskDeadline = new Date(body.taskDeadline)
    if (body.taskTitle && !assessment.taskAssignedAt) updateData.taskAssignedAt = new Date()

    // Task submission
    if (body.taskSubmissionUrl) {
      updateData.taskSubmissionUrl = body.taskSubmissionUrl
      updateData.taskSubmittedAt = new Date()
    }
    if (body.taskScore !== undefined) updateData.taskScore = body.taskScore
    if (body.taskFeedback !== undefined) updateData.taskFeedback = body.taskFeedback

    // Final round
    if (body.finalRoundDate) updateData.finalRoundDate = new Date(body.finalRoundDate)
    if (body.finalRoundNotes !== undefined) updateData.finalRoundNotes = body.finalRoundNotes
    if (body.finalRoundDecision) {
      updateData.finalRoundDecision = body.finalRoundDecision
      updateData.finalDecisionBy = session.user.id
      updateData.finalDecisionAt = new Date()
    }

    // Offer
    if (body.offerSalary !== undefined) updateData.offerSalary = body.offerSalary
    if (body.offerDate) updateData.offerDate = new Date(body.offerDate)
    if (body.offerAccepted !== undefined) updateData.offerAccepted = body.offerAccepted
    if (body.joiningDate) updateData.joiningDate = new Date(body.joiningDate)

    const updated = await prisma.candidateAssessment.update({
      where: { token },
      data: updateData,
    })

    // Sync key status back to candidate
    if (body.hrStatus) {
      const stageMap: Record<string, string> = {
        SHORTLISTED: 'PHONE_SCREEN_SCHEDULED',
        INTERVIEW_SCHEDULED: 'MANAGER_INTERVIEW_SCHEDULED',
        TASK_ASSIGNED: 'TEST_TASK_ASSIGNED',
        TASK_SUBMITTED: 'TEST_TASK_SUBMITTED',
        FINAL_ROUND: 'FOUNDER_INTERVIEW_SCHEDULED',
        SELECTED: 'OFFER_PENDING',
        REJECTED: 'REJECTED',
      }
      const candidateStage = stageMap[body.hrStatus]
      if (candidateStage) {
        await prisma.candidate.update({
          where: { id: assessment.candidateId },
          data: {
            currentStage: candidateStage,
            status: body.hrStatus === 'REJECTED' ? 'REJECTED' : body.hrStatus === 'SELECTED' ? 'OFFER' : 'SCREENING',
          },
        })
      }
    }

    return NextResponse.json({ assessment: updated })
  } catch (error) {
    console.error('Failed to update assessment:', error)
    return NextResponse.json({ error: 'Failed to update assessment' }, { status: 500 })
  }
}
