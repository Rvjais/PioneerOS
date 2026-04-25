import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Reset all employees to INCOMPLETE status so they must go through
 * the profile wizard on first login. Founders (SUPER_ADMIN) are excluded
 * since proxy.ts bypasses them.
 *
 * This will:
 * 1. Set profileCompletionStatus = INCOMPLETE for all non-SUPER_ADMIN users
 * 2. Reset policy acceptance flags (they must re-accept updated policies)
 * 3. Keep their personal data (name, phone, DOB, etc.) — they just need to verify/complete it
 */
async function main() {
  console.error('Resetting employee onboarding status...\n')

  // Reset all non-founder users to INCOMPLETE
  const result = await prisma.user.updateMany({
    where: {
      role: { not: 'SUPER_ADMIN' },
      status: 'ACTIVE',
    },
    data: {
      profileCompletionStatus: 'INCOMPLETE',
    },
  })

  console.error(`Reset ${result.count} employees to INCOMPLETE status.`)

  // Reset policy acceptance in profiles (they must re-accept updated policies)
  const profileResult = await prisma.profile.updateMany({
    where: {
      user: {
        role: { not: 'SUPER_ADMIN' },
        status: 'ACTIVE',
      },
    },
    data: {
      employeeHandbookAccepted: false,
      socialMediaPolicyAccepted: false,
      clientConfidentialityAccepted: false,
      allPoliciesAccepted: false,
      policiesAcceptedAt: null,
      signatureData: null,
      signedAt: null,
      ndaSigned: false,
      ndaSignedAt: null,
    },
  })

  console.error(`Reset ${profileResult.count} profiles (policies & signatures cleared).`)

  // List affected employees
  const affected = await prisma.user.findMany({
    where: { role: { not: 'SUPER_ADMIN' }, status: 'ACTIVE' },
    select: { empId: true, firstName: true, lastName: true, role: true, profileCompletionStatus: true },
    orderBy: { empId: 'asc' },
  })

  console.error('\nAffected employees:')
  for (const u of affected) {
    console.error(`  ${u.empId} ${u.firstName} ${u.lastName || ''} (${u.role}) → ${u.profileCompletionStatus}`)
  }

  // Founders stay VERIFIED
  const founders = await prisma.user.findMany({
    where: { role: 'SUPER_ADMIN' },
    select: { empId: true, firstName: true, profileCompletionStatus: true },
  })
  console.error('\nFounders (unaffected):')
  for (const f of founders) {
    console.error(`  ${f.empId} ${f.firstName} → ${f.profileCompletionStatus}`)
  }

  console.error('\nDone. All non-founder employees will be prompted to complete onboarding on next login.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
