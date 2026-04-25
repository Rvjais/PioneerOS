import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { ProfileWizard } from './ProfileWizard'

export default async function ProfileWizardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true }
  })

  if (!user) {
    redirect('/login')
  }

  // If already verified, go to dashboard
  if (user.profileCompletionStatus === 'VERIFIED') {
    redirect('/')
  }

  // If pending HR verification, go to pending page
  if (user.profileCompletionStatus === 'PENDING_HR') {
    redirect('/pending-verification')
  }

  return (
    <ProfileWizard
      user={{
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone,
        department: user.department,
        dateOfBirth: user.dateOfBirth?.toISOString() || '',
        bloodGroup: user.bloodGroup || '',
        address: user.address || '',
        onboardingStep: user.onboardingStep,
      }}
      profile={user.profile ? {
        emergencyContactName: user.profile.emergencyContactName || '',
        emergencyContactPhone: user.profile.emergencyContactPhone || '',
        panCard: user.profile.panCard || '',
        aadhaar: user.profile.aadhaar || '',
        panCardUrl: user.profile.panCardUrl || '',
        aadhaarUrl: user.profile.aadhaarUrl || '',
        bankDetailsUrl: user.profile.bankDetailsUrl || '',
        educationCertUrl: user.profile.educationCertUrl || '',
        linkedIn: user.profile.linkedIn || '',
        skills: user.profile.skills || '',
        bio: user.profile.bio || '',
        employeeHandbookAccepted: user.profile.employeeHandbookAccepted,
        socialMediaPolicyAccepted: user.profile.socialMediaPolicyAccepted,
        clientConfidentialityAccepted: user.profile.clientConfidentialityAccepted,
        profilePicture: user.profile.profilePicture || '',
      } : null}
    />
  )
}
