import { PrismaClient } from '@prisma/client'
import { hashSync } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.error('Seeding database...')

  // Create Super Admin user
  const admin = await prisma.user.upsert({
    where: { empId: 'BP-001' },
    update: {},
    create: {
      empId: 'BP-001',
      firstName: 'Admin',
      lastName: 'Pioneer',
      phone: '+919999999999',
      email: 'brandingpioneers@gmail.com',
      password: hashSync('changeme123', 12),
      role: 'SUPER_ADMIN',
      department: 'OPERATIONS',
      employeeType: 'FULL_TIME',
      joiningDate: new Date('2024-01-01'),
      status: 'ACTIVE',
      profileCompletionStatus: 'VERIFIED',
      profile: {
        create: {
          ndaSigned: true,
        },
      },
    },
  })

  console.error(`Created admin user: ${admin.empId} (${admin.email})`)
  console.error('')
  console.error('Login credentials:')
  console.error(`  Email: ${admin.email}`)
  console.error('  Password: changeme123')
  console.error('')
  console.error('IMPORTANT: Change this password immediately after first login!')
  console.error('')
  console.error('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
