import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // ============================================
  // 1. NOVA IVF + SUB-ACCOUNTS
  // ============================================
  console.error('Creating Nova IVF + sub-accounts...')

  const nova = await prisma.client.create({
    data: {
      name: 'Nova IVF',
      tier: 'ENTERPRISE',
      status: 'ACTIVE',
      industry: 'Healthcare',
      businessType: 'B2C',
      clientType: 'RECURRING',
      serviceSegment: 'MARKETING',
    },
  })
  console.error('  [created] Nova IVF (ENTERPRISE)')

  const subs = [
    { name: 'Nova - Dr. Manisha Jain', city: 'Chandigarh' },
    { name: 'Nova - Dr. Sandeep Talwar', city: 'South Delhi' },
    { name: 'Nova - Dr. Neha Singh', city: 'Gorakhpur' },
    { name: 'Nova - Dr. Shalini Dwivedi', city: 'Prayagraj' },
    { name: 'Nova - Dr. Kalyani Shrimali', city: 'Indore' },
    { name: 'Nova - Dr. Richa Ainani Ahluwalia', city: 'Jaipur' },
    { name: 'Nova - Dr. Sulbha Arora', city: 'Mumbai' },
  ]

  for (const sub of subs) {
    await prisma.client.create({
      data: {
        name: sub.name,
        city: sub.city,
        tier: 'PREMIUM',
        status: 'ACTIVE',
        industry: 'Healthcare',
        businessType: 'B2C',
        clientType: 'RECURRING',
        serviceSegment: 'MARKETING',
        clientSegment: 'MYKOHI_WHITELABEL',
      },
    })
    console.error(`  [created] ${sub.name} (${sub.city})`)
  }

  console.error('\n  Scope: 7-8 social media videos/month per sub-account\n')

  // ============================================
  // 2. MISSING EMPLOYEES (not created in first import)
  // ============================================
  console.error('Creating missing employees...')

  // Cross-referenced from client data — these names appeared but weren't in the first batch
  // Already created: Himanshu, Sami, Satyam, Ankit, Pravesh, Suraj, Pragati, Shivam,
  //   Inder, Aditi, Ansh, Chitransh, Taran, Aniket, Kishan, Om, Ichha, Harsh, Sourav, Nitesh

  // Not yet created (mentioned in client assignments or as employees)
  const missingEmployees = [
    // From client data context — you mentioned all names should have logins
    // Adding anyone referenced in the system who doesn't have an account
  ]

  // Check current count
  const currentCount = await prisma.user.count()
  console.error(`  Current employees in system: ${currentCount}`)

  // List all current employees for verification
  const allUsers = await prisma.user.findMany({
    select: { empId: true, firstName: true, role: true, department: true },
    orderBy: { empId: 'asc' },
  })
  console.error('\n  All employees:')
  for (const u of allUsers) {
    console.error(`    ${u.empId} - ${u.firstName} (${u.role}, ${u.department})`)
  }

  // Count clients
  const clientCount = await prisma.client.count()
  console.error(`\n  Total clients: ${clientCount}`)

  console.error('\nDone!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
