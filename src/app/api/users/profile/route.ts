import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  profilePicture: z.string().optional(),
  linkedIn: z.string().optional(),
  bio: z.string().optional(),
  skills: z.string().optional(),
})

export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        employeeProposals: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            confirmedName: true, dateOfBirth: true, bloodGroup: true,
            personalPhone: true, personalEmail: true,
            currentAddress: true, city: true, state: true, pincode: true,
            parentsAddress: true, fatherPhone: true, motherPhone: true,
            emergencyName: true, emergencyPhone: true, emergencyRelation: true,
            linkedinUrl: true, languages: true, livingSituation: true,
            distanceFromOffice: true, favoriteFood: true, healthConditions: true,
            bankAccountName: true, bankName: true, bankIfscCode: true,
            ndaAccepted: true, ndaAcceptedAt: true,
            bondAccepted: true, bondAcceptedAt: true, bondDurationMonths: true,
            policiesAcceptedAt: true,
            offeredSalary: true, position: true, department: true, employmentType: true,
            joiningDate: true, probationMonths: true,
          },
        },
      },
    })

    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const proposal = dbUser.employeeProposals[0] || null

    return NextResponse.json({
      user: {
        id: dbUser.id, empId: dbUser.empId,
        firstName: dbUser.firstName, lastName: dbUser.lastName,
        email: dbUser.email, phone: dbUser.phone,
        department: dbUser.department, role: dbUser.role,
        employeeType: dbUser.employeeType, status: dbUser.status,
        joiningDate: dbUser.joiningDate?.toISOString(),
        dateOfBirth: dbUser.dateOfBirth?.toISOString(),
        bloodGroup: dbUser.bloodGroup, address: dbUser.address,
        languages: dbUser.languages, healthConditions: dbUser.healthConditions,
        profileCompletionStatus: dbUser.profileCompletionStatus,
      },
      profile: dbUser.profile ? {
        profilePicture: dbUser.profile.profilePicture,
        panCard: dbUser.profile.panCard,
        aadhaar: dbUser.profile.aadhaar,
        linkedIn: dbUser.profile.linkedIn,
        bio: dbUser.profile.bio,
        skills: dbUser.profile.skills,
        favoriteFood: dbUser.profile.favoriteFood,
        parentsPhone1: dbUser.profile.parentsPhone1,
        parentsPhone2: dbUser.profile.parentsPhone2,
        livingSituation: dbUser.profile.livingSituation,
        distanceFromOffice: dbUser.profile.distanceFromOffice,
        educationCertUrl: dbUser.profile.educationCertUrl,
        ndaSigned: dbUser.profile.ndaSigned,
        ndaSignedAt: dbUser.profile.ndaSignedAt?.toISOString(),
        employeeHandbookAccepted: dbUser.profile.employeeHandbookAccepted,
        socialMediaPolicyAccepted: dbUser.profile.socialMediaPolicyAccepted,
        clientConfidentialityAccepted: dbUser.profile.clientConfidentialityAccepted,
      } : null,
      onboarding: proposal ? {
        emergencyContact: { name: proposal.emergencyName, phone: proposal.emergencyPhone, relation: proposal.emergencyRelation },
        family: { fatherPhone: proposal.fatherPhone, motherPhone: proposal.motherPhone, parentsAddress: proposal.parentsAddress },
        address: { current: proposal.currentAddress, city: proposal.city, state: proposal.state, pincode: proposal.pincode },
        offer: { salary: proposal.offeredSalary, position: proposal.position, type: proposal.employmentType, probation: proposal.probationMonths, bondMonths: proposal.bondDurationMonths },
        agreements: { nda: proposal.ndaAccepted, ndaDate: proposal.ndaAcceptedAt?.toISOString(), bond: proposal.bondAccepted, bondDate: proposal.bondAcceptedAt?.toISOString(), policies: !!proposal.policiesAcceptedAt, policiesDate: proposal.policiesAcceptedAt?.toISOString() },
        bank: { name: proposal.bankAccountName, bank: proposal.bankName, ifsc: proposal.bankIfscCode },
      } : null,
    })
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
})

export const PATCH = withAuth(async (req: NextRequest, { user }) => {
  try {
    const raw = await req.json()
    const parsed = updateProfileSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { firstName, lastName, phone, profilePicture, linkedIn, bio, skills } = parsed.data

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone && { phone }),
      },
    })

    // Build profile update data
    const profileUpdateData: Record<string, unknown> = {}
    if (profilePicture !== undefined) profileUpdateData.profilePicture = profilePicture || null
    if (linkedIn !== undefined) profileUpdateData.linkedIn = linkedIn || null
    if (bio !== undefined) profileUpdateData.bio = bio || null
    if (skills !== undefined) profileUpdateData.skills = skills || null

    // Update profile if any profile fields provided
    if (Object.keys(profileUpdateData).length > 0) {
      await prisma.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          ...profileUpdateData,
        },
        update: profileUpdateData,
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
      },
    })
  } catch (error) {
    console.error('Failed to update profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
})
