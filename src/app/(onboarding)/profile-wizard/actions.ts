'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { revalidatePath } from 'next/cache'

interface WizardFormData {
  // Personal
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  bloodGroup: string
  address: string
  emergencyContactName: string
  emergencyContactPhone: string
  profilePicture: string
  // Work
  department: string
  linkedIn: string
  skills: string
  bio: string
  // Documents
  panCard: string
  aadhaar: string
  panCardUrl: string
  aadhaarUrl: string
  bankDetailsUrl: string
  educationCertUrl: string
  // Tools
  toolsConfirmed: boolean
  // Policies
  employeeHandbookAccepted: boolean
  socialMediaPolicyAccepted: boolean
  clientConfidentialityAccepted: boolean
  signature: string
  selfieImage: string
}

export async function saveWizardStep(step: number, data: WizardFormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const userId = session.user.id

  try {
    // Update user data (safe fields that always exist)
    const userUpdate: Record<string, unknown> = {
      onboardingStep: step,
    }

    // Only update user fields if they have values
    if (data.firstName) userUpdate.firstName = data.firstName
    if (data.lastName !== undefined) userUpdate.lastName = data.lastName
    if (data.email) userUpdate.email = data.email
    if (data.dateOfBirth) userUpdate.dateOfBirth = new Date(data.dateOfBirth)
    if (data.bloodGroup) userUpdate.bloodGroup = data.bloodGroup
    if (data.address) userUpdate.address = data.address

    await prisma.user.update({
      where: { id: userId },
      data: userUpdate,
    })

    // Build profile data based on current step - only include fields that have values
    const profileData: Record<string, unknown> = {}

    // Step 1: Personal
    if (data.profilePicture) profileData.profilePicture = data.profilePicture
    if (data.emergencyContactName) profileData.emergencyContactName = data.emergencyContactName
    if (data.emergencyContactPhone) profileData.emergencyContactPhone = data.emergencyContactPhone

    // Step 2: Work
    if (data.linkedIn) profileData.linkedIn = data.linkedIn
    if (data.skills) profileData.skills = data.skills
    if (data.bio) profileData.bio = data.bio

    // Step 3: Documents
    if (data.panCard) profileData.panCard = data.panCard
    if (data.aadhaar) profileData.aadhaar = data.aadhaar
    if (data.panCardUrl) profileData.panCardUrl = data.panCardUrl
    if (data.aadhaarUrl) profileData.aadhaarUrl = data.aadhaarUrl
    if (data.bankDetailsUrl) profileData.bankDetailsUrl = data.bankDetailsUrl
    if (data.educationCertUrl) profileData.educationCertUrl = data.educationCertUrl

    // Step 5: Policies
    if (step >= 5) {
      profileData.employeeHandbookAccepted = data.employeeHandbookAccepted
      profileData.socialMediaPolicyAccepted = data.socialMediaPolicyAccepted
      profileData.clientConfidentialityAccepted = data.clientConfidentialityAccepted

      if (data.signature) {
        profileData.signatureData = data.signature
        profileData.signatureType = 'draw'
        profileData.signedAt = new Date()
      }
      if (data.selfieImage) {
        profileData.selfieImage = data.selfieImage
        profileData.kycVerifiedAt = new Date()
      }

      const allAccepted = data.employeeHandbookAccepted && data.socialMediaPolicyAccepted && data.clientConfidentialityAccepted
      profileData.allPoliciesAccepted = allAccepted
      if (allAccepted) {
        profileData.policiesAcceptedAt = new Date()
      }
    }

    // Upsert profile - create with only available data, update with same
    await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        ...profileData,
      },
      update: profileData,
    })

    // Calculate and save completion percentage
    const completionPercentage = calculateCompletionPercentage(data, step)
    await prisma.profile.update({
      where: { userId },
      data: { completionPercentage },
    })

    try { revalidatePath('/profile-wizard') } catch { /* non-critical */ }
  } catch (error) {
    console.error('saveWizardStep failed:', error)
    throw new Error('Failed to save progress')
  }
}

export async function submitForVerification(data: WizardFormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const userId = session.user.id

  // Final save
  await saveWizardStep(5, data)

  // Get user details for notification
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, empId: true, department: true },
  })

  // Update status to pending HR verification
  await prisma.user.update({
    where: { id: userId },
    data: {
      profileCompletionStatus: 'PENDING_HR',
      onboardingStep: 5,
    },
  })

  // Update profile completion percentage to 100
  await prisma.profile.update({
    where: { userId },
    data: { completionPercentage: 100 },
  })

  // Notify all HR users about the new verification request
  const hrUsers = await prisma.user.findMany({
    where: {
      role: { in: ['HR', 'SUPER_ADMIN'] },
      status: 'ACTIVE',
    },
    select: { id: true },
  })

  // Create notifications for HR team
  if (hrUsers.length > 0) {
    await prisma.notification.createMany({
      data: hrUsers.map((hrUser) => ({
        userId: hrUser.id,
        type: 'TASK' as const,
        title: 'New Profile Verification Request',
        message: `${user?.firstName} ${user?.lastName || ''} (${user?.empId}) from ${user?.department} has submitted their profile for verification. Please review at your earliest convenience.`,
        priority: 'HIGH' as const,
        link: '/hr/verifications',
      })),
    })
  }

  try {
    revalidatePath('/profile-wizard')
    revalidatePath('/pending-verification')
    revalidatePath('/hr/verifications')
  } catch { /* non-critical */ }
}

function calculateCompletionPercentage(data: WizardFormData, step: number): number {
  let completed = 0
  const total = 21 // Total fields to track

  // Personal (9 fields including profile picture)
  if (data.profilePicture) completed++
  if (data.firstName) completed++
  if (data.lastName) completed++
  if (data.email) completed++
  if (data.dateOfBirth) completed++
  if (data.bloodGroup) completed++
  if (data.address) completed++
  if (data.emergencyContactName) completed++
  if (data.emergencyContactPhone) completed++

  // Work (3 fields)
  if (data.linkedIn) completed++
  if (data.skills) completed++
  if (data.bio) completed++

  // Documents (5 fields)
  if (data.panCard) completed++
  if (data.aadhaar) completed++
  if (data.panCardUrl) completed++
  if (data.aadhaarUrl) completed++
  if (data.bankDetailsUrl) completed++

  // Policies (4 fields)
  if (data.employeeHandbookAccepted) completed++
  if (data.socialMediaPolicyAccepted) completed++
  if (data.clientConfidentialityAccepted) completed++
  if (data.signature) completed++

  return Math.round((completed / total) * 100)
}
