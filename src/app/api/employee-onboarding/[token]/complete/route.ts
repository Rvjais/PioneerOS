import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { generateEmployeeId } from '@/server/db/sequence'

// POST - Complete onboarding — create user account and send magic link
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params

    // Use atomic update to prevent race conditions — only one request can set onboardingCompleted
    const proposal = await prisma.employeeProposal.findUnique({ where: { token } })
    if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (proposal.onboardingCompleted) return NextResponse.json({ success: true, message: 'Already completed' })

    if (!proposal.documentsSubmittedAt) {
      return NextResponse.json({ error: 'Documents must be submitted first' }, { status: 400 })
    }

    // Atomic lock: try to mark as completed first — only first request succeeds
    const lockResult = await prisma.employeeProposal.updateMany({
      where: { token, onboardingCompleted: false },
      data: { onboardingCompleted: true, onboardingCompletedAt: new Date() },
    })
    if (lockResult.count === 0) {
      // Another request already completed it
      return NextResponse.json({ success: true, message: 'Already completed' })
    }

    // Check if user already exists
    let user = proposal.userId
      ? await prisma.user.findUnique({ where: { id: proposal.userId } })
      : await prisma.user.findFirst({
          where: { OR: [{ email: proposal.personalEmail || proposal.candidateEmail }, { phone: proposal.personalPhone || proposal.candidatePhone }], deletedAt: null },
        })

    const nameParts = (proposal.confirmedName || proposal.candidateName).trim().split(/\s+/)
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ')

    const roleMap: Record<string, string> = { FULL_TIME: 'EMPLOYEE', PART_TIME: 'EMPLOYEE', INTERN: 'INTERN', FREELANCER: 'FREELANCER' }

    if (!user) {
      // Use transaction to ensure user + profile + checklist are created atomically
      user = await prisma.$transaction(async (tx) => {
        let createdUser: Awaited<ReturnType<typeof tx.user.create>> | null = null
        // Retry empId generation in case of collision
        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            const empId = await generateEmployeeId()
            createdUser = await tx.user.create({
              data: {
                empId,
                firstName,
                lastName,
                phone: proposal.personalPhone || proposal.candidatePhone,
                email: proposal.personalEmail || proposal.candidateEmail,
                role: roleMap[proposal.employmentType] || 'EMPLOYEE',
                department: proposal.department,
                employeeType: proposal.employmentType,
                joiningDate: proposal.joiningDate,
                dateOfBirth: proposal.dateOfBirth || null,
                bloodGroup: proposal.bloodGroup || null,
                address: proposal.currentAddress || null,
                languages: proposal.languages || null,
                healthConditions: proposal.healthConditions || null,
                status: 'PROBATION',
                profileCompletionStatus: 'VERIFIED',
                onboardingStep: 7,
              },
            })
            break // success
          } catch (err: unknown) {
            const prismaErr = err as { code?: string; meta?: { target?: string[] } }
            if (prismaErr.code === 'P2002' && prismaErr.meta?.target?.[0] === 'empId') {
              if (attempt === 4) throw err // exhausted retries
              continue
            }
            throw err // not an empId collision
          }
        }

        if (!createdUser) throw new Error('Failed to create user after retries')

        // Create profile
        await tx.profile.create({
          data: {
            userId: createdUser.id,
            profilePicture: proposal.profilePictureUrl || null,
            panCard: proposal.panCardUrl || null,
            aadhaar: proposal.aadhaarUrl || null,
            linkedIn: proposal.linkedinUrl || null,
            favoriteFood: proposal.favoriteFood || null,
            parentsPhone1: proposal.fatherPhone || null,
            parentsPhone2: proposal.motherPhone || null,
            livingSituation: proposal.livingSituation || null,
            distanceFromOffice: proposal.distanceFromOffice || null,
            educationCertUrl: proposal.educationCertUrl || null,
            bankDetailsUrl: proposal.bankAccountNumber ? 'submitted-via-onboarding' : null,
            ndaSigned: proposal.ndaAccepted,
            ndaSignedAt: proposal.ndaAcceptedAt || null,
            employeeHandbookAccepted: proposal.handbookAccepted,
            socialMediaPolicyAccepted: proposal.socialMediaPolicyAccepted,
            clientConfidentialityAccepted: proposal.confidentialityAccepted,
          },
        }).catch(() => { /* profile may already exist */ })

        // Create onboarding checklist
        await tx.employeeOnboardingChecklist.create({
          data: {
            userId: createdUser.id,
            offerLetterSigned: true,
            offerLetterSignedAt: proposal.detailsConfirmedAt || new Date(),
            idProofSubmitted: true,
            idProofSubmittedAt: proposal.documentsSubmittedAt || new Date(),
            panCardSubmitted: !!proposal.panCardUrl,
            panCardSubmittedAt: proposal.panCardUrl ? new Date() : null,
            bankDetailsSubmitted: !!proposal.bankAccountNumber,
            bankDetailsSubmittedAt: proposal.bankAccountNumber ? new Date() : null,
            educationDocsSubmitted: !!proposal.educationCertUrl,
            profilePhotoSubmitted: !!proposal.profilePictureUrl,
            policiesAcknowledged: !!proposal.policiesAcceptedAt,
            ndaSigned: proposal.ndaAccepted,
            completionPercentage: (() => {
              // Calculate dynamically from completed items
              const items = [true, true, !!proposal.panCardUrl, !!proposal.bankAccountNumber,
                !!proposal.educationCertUrl, !!proposal.profilePictureUrl,
                !!proposal.policiesAcceptedAt, proposal.ndaAccepted,
                proposal.bondAccepted, !!proposal.documentsSubmittedAt]
              return Math.round((items.filter(Boolean).length / items.length) * 100)
            })(),
            status: 'IN_PROGRESS',
          },
        }).catch(() => { /* may already exist */ })

        return createdUser
      })

      if (!user) throw new Error('Failed to create user after retries')
    }

    // Link user to proposal and finalize status
    await prisma.employeeProposal.update({
      where: { token },
      data: {
        userId: user.id,
        status: 'COMPLETED',
        currentStep: 7,
      },
    })

    // Generate magic link for portal access
    const crypto = await import('crypto')
    const magicToken = crypto.randomBytes(32).toString('hex')
    const magicTokenHash = crypto.createHash('sha256').update(magicToken).digest('hex')
    const magicExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Never expires (1 year, admin can terminate)

    await prisma.magicLinkToken.create({
      data: {
        token: magicTokenHash,
        userId: user.id,
        channel: 'EMAIL',
        expiresAt: magicExpiresAt,
      },
    })

    await prisma.employeeProposal.update({
      where: { token },
      data: { magicLinkSent: true, magicLinkSentAt: new Date() },
    })

    // Notify HR
    const hrUsers = await prisma.user.findMany({
      where: { OR: [{ role: 'HR' }, { department: 'HR' }, { role: 'SUPER_ADMIN' }], status: 'ACTIVE', deletedAt: null },
      select: { id: true },
    })

    if (hrUsers.length > 0) {
      await prisma.notification.createMany({
        data: hrUsers.map(u => ({
          userId: u.id,
          type: 'GENERAL',
          title: 'Employee Onboarding Completed',
          message: `${proposal.confirmedName || proposal.candidateName} has completed their onboarding. Employee ID: ${user!.empId}. Ready for IT setup and orientation.`,
          link: '/hr/onboarding-checklist',
          priority: 'HIGH',
        })),
      })
    }

    // Notify the employee themselves
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'GENERAL',
        title: 'Welcome to Branding Pioneers! 🎉',
        message: `Your onboarding is complete. Employee ID: ${user.empId}. Your portal is ready — check your profile, complete daily tasks, and connect with your team!`,
        link: '/profile',
        priority: 'HIGH',
      },
    }).catch(() => { /* user just created, notification is bonus */ })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    return NextResponse.json({
      success: true,
      empId: user.empId,
      email: user.email,
      magicLink: `${baseUrl}/auth/magic?token=${magicToken}`,
      message: 'Welcome aboard! Your account has been created.',
    })
  } catch (error) {
    console.error('Failed to complete onboarding:', error)
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 })
  }
}
