import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create Nova as parent client
  const nova = await prisma.client.create({
    data: {
      name: 'Nova IVF',
      tier: 'ENTERPRISE',
      status: 'ACTIVE',
      industry: 'Healthcare',
      businessType: 'B2C',
      clientType: 'RECURRING',
      serviceSegment: 'MARKETING',
      clientSegment: 'INDIAN',
    },
  })
  console.error('Created: Nova IVF (ENTERPRISE) - id:', nova.id)

  // Sub-accounts (scope: 7-8 social media videos per month each)
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
    const c = await prisma.client.create({
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
    console.error('Created sub:', c.name, '(' + sub.city + ')')
  }

  console.error('\nNova + 7 sub-accounts created. Scope: 7-8 SM videos/month per sub-account.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
