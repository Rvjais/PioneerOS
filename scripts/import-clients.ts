import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================
// EMPLOYEE DATA (extracted from client assignments)
// ============================================
const employees = [
  { empId: 'BP-002', firstName: 'Himanshu', role: 'MANAGER', department: 'OPERATIONS', employeeType: 'FULL_TIME' },
  { empId: 'BP-003', firstName: 'Sami', role: 'FREELANCER', department: 'SOCIAL', employeeType: 'FREELANCER' },
  { empId: 'BP-004', firstName: 'Satyam', role: 'EMPLOYEE', department: 'SEO', employeeType: 'FULL_TIME' },
  { empId: 'BP-005', firstName: 'Ankit', role: 'EMPLOYEE', department: 'ADS', employeeType: 'FULL_TIME' },
  { empId: 'BP-006', firstName: 'Pravesh', role: 'EMPLOYEE', department: 'OPERATIONS', employeeType: 'FULL_TIME' },
  { empId: 'BP-007', firstName: 'Suraj', role: 'EMPLOYEE', department: 'SEO', employeeType: 'FULL_TIME' },
  { empId: 'BP-008', firstName: 'Pragati', role: 'EMPLOYEE', department: 'ADS', employeeType: 'FULL_TIME' },
  { empId: 'BP-009', firstName: 'Shivam', role: 'EMPLOYEE', department: 'WEB', employeeType: 'FULL_TIME' },
  { empId: 'BP-010', firstName: 'Inder', role: 'FREELANCER', department: 'SOCIAL', employeeType: 'FREELANCER' },
  { empId: 'BP-011', firstName: 'Aditi', role: 'EMPLOYEE', department: 'OPERATIONS', employeeType: 'FULL_TIME' },
  { empId: 'BP-012', firstName: 'Ansh', role: 'FREELANCER', department: 'SEO', employeeType: 'FREELANCER' },
  { empId: 'BP-013', firstName: 'Chitransh', role: 'EMPLOYEE', department: 'WEB', employeeType: 'FULL_TIME' },
  { empId: 'BP-014', firstName: 'Taran', role: 'EMPLOYEE', department: 'SOCIAL', employeeType: 'FULL_TIME' },
  { empId: 'BP-015', firstName: 'Aniket', role: 'EMPLOYEE', department: 'ADS', employeeType: 'FULL_TIME' },
  { empId: 'BP-016', firstName: 'Kishan', role: 'EMPLOYEE', department: 'SEO', employeeType: 'FULL_TIME' },
  { empId: 'BP-017', firstName: 'Om', role: 'EMPLOYEE', department: 'HR', employeeType: 'FULL_TIME' },
  { empId: 'BP-018', firstName: 'Ichha', role: 'EMPLOYEE', department: 'OPERATIONS', employeeType: 'FULL_TIME' },
  { empId: 'BP-019', firstName: 'Harsh', role: 'EMPLOYEE', department: 'SEO', employeeType: 'FULL_TIME' },
  { empId: 'BP-020', firstName: 'Sourav', role: 'EMPLOYEE', department: 'SEO', employeeType: 'FULL_TIME' },
  { empId: 'BP-021', firstName: 'Nitesh', role: 'EMPLOYEE', department: 'SOCIAL', employeeType: 'FULL_TIME' },
]

// ============================================
// CLIENT DATA
// ============================================
interface ClientData {
  name: string
  tier: string
  status: string
  industry: string
  services: string
  deliverables: string
  kpis: string
  notes: string
  billingCycle: string
  team: { empId: string; role: string }[]
}

const clients: ClientData[] = [
  {
    name: 'Lifecare Hospitals',
    tier: 'ENTERPRISE',
    status: 'ON_HOLD',
    industry: 'Healthcare',
    services: 'SM, YT, Web, SEO, Meta Ads',
    deliverables: 'Social media: 30 posts, Website maintenance + CRO, SEO on-page + off-page, Local SEO + GBP optimization, Meta ads lead generation, Monthly strategy meetings, Quarterly performance forecast',
    kpis: '25–40% growth in reach/engagement, 20% MoM organic improvement, 20–40 qualified leads/day via ads, Top 10 rankings for priority keywords, 4.5+ GBP rating',
    notes: 'Wants premium creative + fast TAT. Project paused due to non payment.',
    billingCycle: '360-day cycle',
    team: [],
  },
  {
    name: 'Apollo Hospital',
    tier: 'ENTERPRISE',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SM, YT, Web, SEO, Ads',
    deliverables: 'Social media: 30 posts, Full-funnel marketing, Multi-department campaigns, Doctor\'s GMB Optimization, YouTube optimization, High-budget ad campaigns',
    kpis: 'Lead volume target (based on dept), 3–5% CTR on ads, 20% SEO traffic growth quarterly',
    notes: 'Prefers conservative branding, no celebrity-style creatives',
    billingCycle: '30-day cycle',
    team: [
      { empId: 'BP-002', role: 'ACCOUNT_MANAGER' },
      { empId: 'BP-003', role: 'SOCIAL_MANAGER' },
      { empId: 'BP-004', role: 'SEO_SPECIALIST' },
      { empId: 'BP-005', role: 'ADS_SPECIALIST' },
    ],
  },
  {
    name: 'Smart Clinics',
    tier: 'ENTERPRISE',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SM, YT, Web, Ads',
    deliverables: 'Social media: 15 posts, SEO on-page + off-page, Local SEO, YouTube & short-form content, Google & Meta ads lead generation',
    kpis: 'Daily appointment targets',
    notes: 'Wants modern/clean aesthetic visuals',
    billingCycle: '30-day',
    team: [
      { empId: 'BP-006', role: 'ACCOUNT_MANAGER' },
      { empId: 'BP-003', role: 'SOCIAL_MANAGER' },
      { empId: 'BP-007', role: 'SEO_SPECIALIST' },
      { empId: 'BP-005', role: 'ADS_SPECIALIST' },
    ],
  },
  {
    name: 'Mykohi',
    tier: 'ENTERPRISE',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SM, Web, SEO, Ads',
    deliverables: 'Multi-brand content pools, SEO for multiple microsites, Ads across brands. Sub-brands: Options pa, Karma, Globecore, Upshaw, Resilience, Dr Amin',
    kpis: 'Rank top 5 for brand terms, Lower CPL by 20%',
    notes: 'Each sub-brand prefers consistent color use',
    billingCycle: '30-day',
    team: [
      { empId: 'BP-008', role: 'ADS_SPECIALIST' },
      { empId: 'BP-009', role: 'AUTOMATION_ENGINEER' },
    ],
  },
  {
    name: 'Apollo Athena',
    tier: 'ENTERPRISE',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'GBP, YT, SM',
    deliverables: 'GBP optimization, YouTube content, Social media management',
    kpis: '',
    notes: '',
    billingCycle: '30-day',
    team: [
      { empId: 'BP-006', role: 'ACCOUNT_MANAGER' },
      { empId: 'BP-010', role: 'SOCIAL_MANAGER' },
      { empId: 'BP-007', role: 'SEO_SPECIALIST' },
      { empId: 'BP-005', role: 'ADS_SPECIALIST' },
    ],
  },
  {
    name: 'Impact Ortho',
    tier: 'PREMIUM',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'Web, Ads',
    deliverables: 'Website mgmt, SEO on-page + off-page, Google ads (ortho-based lead gen)',
    kpis: '8–12 ortho leads/day',
    notes: 'ROI-focused ads',
    billingCycle: '30-day',
    team: [
      { empId: 'BP-004', role: 'SEO_SPECIALIST' },
      { empId: 'BP-005', role: 'ADS_SPECIALIST' },
    ],
  },
  {
    name: 'Vision Eye Centre',
    tier: 'PREMIUM',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SM, SEO, Web',
    deliverables: 'Social media: 15 posts, SEO + local SEO, Website mgmt, YouTube & short-form content, Google & Meta ads lead generation',
    kpis: 'Rank top 10 for cataract/lasik terms',
    notes: 'Prefer medical-accurate content',
    billingCycle: '30-day',
    team: [
      { empId: 'BP-011', role: 'ACCOUNT_MANAGER' },
      { empId: 'BP-012', role: 'SEO_SPECIALIST' },
      { empId: 'BP-004', role: 'SEO_SPECIALIST' },
    ],
  },
  {
    name: 'Raj Hospitals',
    tier: 'PREMIUM',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SM, Web, SEO',
    deliverables: 'Social media: 15 posts, Multi-specialty hospital content, SEO content clusters',
    kpis: '10–15% organic traffic growth MoM',
    notes: 'Avoid heavy-color creatives',
    billingCycle: '30-day',
    team: [
      { empId: 'BP-011', role: 'ACCOUNT_MANAGER' },
      { empId: 'BP-013', role: 'AUTOMATION_ENGINEER' },
      { empId: 'BP-014', role: 'SOCIAL_MANAGER' },
    ],
  },
  {
    name: 'GNA',
    tier: 'PREMIUM',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SM, SEO',
    deliverables: 'SEO on-page + off-page, Local SEO + GBP optimization, YouTube & short-form content',
    kpis: '5 new keywords in top 10',
    notes: 'Wants soft theme',
    billingCycle: '30-day',
    team: [
      { empId: 'BP-015', role: 'ADS_SPECIALIST' },
      { empId: 'BP-004', role: 'SEO_SPECIALIST' },
      { empId: 'BP-016', role: 'SEO_SPECIALIST' },
    ],
  },
  {
    name: 'Dr Vikas Gupta',
    tier: 'PREMIUM',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SM, SEO',
    deliverables: 'Social media: 8 posts, Youtube Optimization, Local SEO + GBP Posts',
    kpis: 'Engagement & keyword ranking',
    notes: 'Keep tone authoritative',
    billingCycle: 'Monthly',
    team: [
      { empId: 'BP-011', role: 'ACCOUNT_MANAGER' },
      { empId: 'BP-007', role: 'SEO_SPECIALIST' },
    ],
  },
  {
    name: 'Artemis',
    tier: 'PREMIUM',
    status: 'LOST',
    industry: 'Healthcare',
    services: 'GBP',
    deliverables: 'GBP management',
    kpis: '',
    notes: 'Client lost',
    billingCycle: '',
    team: [],
  },
  {
    name: 'Shalby',
    tier: 'PREMIUM',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'Print Media Designs',
    deliverables: '20 designs per month',
    kpis: '',
    notes: '',
    billingCycle: '30-day',
    team: [
      { empId: 'BP-006', role: 'ACCOUNT_MANAGER' },
      { empId: 'BP-003', role: 'SOCIAL_MANAGER' },
    ],
  },
  {
    name: 'Dr Arush',
    tier: 'PREMIUM',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SEO, SM, Meta Ads',
    deliverables: 'SEO, Social media, Meta Ads management',
    kpis: '',
    notes: '',
    billingCycle: '30-day',
    team: [
      { empId: 'BP-018', role: 'ACCOUNT_MANAGER' },
      { empId: 'BP-005', role: 'ADS_SPECIALIST' },
      { empId: 'BP-007', role: 'SEO_SPECIALIST' },
    ],
  },
  {
    name: 'Akropolis',
    tier: 'PREMIUM',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SEO',
    deliverables: 'Social media: 8-10 posts, Local SEO, Website mgmt, YouTube & short-form content',
    kpis: 'Keyword ranking milestones',
    notes: 'Wants transparent reports',
    billingCycle: 'Monthly',
    team: [
      { empId: 'BP-017', role: 'ACCOUNT_MANAGER' },
      { empId: 'BP-004', role: 'SEO_SPECIALIST' },
    ],
  },
  {
    name: 'Medanta',
    tier: 'PREMIUM',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'Web, Graphics',
    deliverables: 'Video Editing',
    kpis: 'Faster TAT',
    notes: 'Strict quality guidelines',
    billingCycle: '30 days',
    team: [
      { empId: 'BP-014', role: 'SOCIAL_MANAGER' },
    ],
  },
  {
    name: 'Marengo Asia',
    tier: 'PREMIUM',
    status: 'LOST',
    industry: 'Healthcare',
    services: 'SM, Web',
    deliverables: 'Website Management, Technical SEO',
    kpis: 'Increased traffic',
    notes: 'Minimalistic theme. Client lost.',
    billingCycle: '30 days',
    team: [],
  },
  {
    name: 'Dr Vijay Anand Reddy',
    tier: 'STANDARD',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SM, YT, Web, SEO',
    deliverables: 'Social media: 8-10 posts, SEO + local SEO, Website mgmt',
    kpis: '5–8 quality leads/day',
    notes: 'Content must be sensitive, subtle',
    billingCycle: 'Monthly',
    team: [
      { empId: 'BP-017', role: 'ACCOUNT_MANAGER' },
    ],
  },
  {
    name: 'Fertility Point',
    tier: 'STANDARD',
    status: 'ON_HOLD',
    industry: 'Healthcare',
    services: 'SM, SEO',
    deliverables: 'SEO + local SEO, Website mgmt',
    kpis: 'Leads + awareness',
    notes: 'Avoid direct terms, maintain sensitivity. Paused due to payment issues.',
    billingCycle: 'Monthly',
    team: [],
  },
  {
    name: 'Dr Aloy Mukherjee',
    tier: 'STANDARD',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SM, SEO',
    deliverables: 'SEO + local SEO, Website mgmt',
    kpis: 'Ranking improvement',
    notes: 'Clean professional look',
    billingCycle: 'Monthly',
    team: [
      { empId: 'BP-007', role: 'SEO_SPECIALIST' },
      { empId: 'BP-016', role: 'SEO_SPECIALIST' },
    ],
  },
  {
    name: 'Amish Hospital',
    tier: 'STANDARD',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SM, Web, SEO, Ads (Boosting)',
    deliverables: 'Social media: 12 posts, Local SEO',
    kpis: '20% growth',
    notes: 'Likes bright creatives',
    billingCycle: 'Monthly',
    team: [
      { empId: 'BP-011', role: 'ACCOUNT_MANAGER' },
    ],
  },
  {
    name: 'Dr Arun Goel',
    tier: 'STANDARD',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SM, SEO, Ads',
    deliverables: 'Social media: 12 posts, Local SEO',
    kpis: 'CPL target',
    notes: 'Technical accuracy required',
    billingCycle: 'Monthly',
    team: [
      { empId: 'BP-011', role: 'ACCOUNT_MANAGER' },
    ],
  },
  {
    name: 'Dr Sujit',
    tier: 'STANDARD',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SEO',
    deliverables: 'Local SEO',
    kpis: 'GBP visibility',
    notes: 'Wants simple reporting',
    billingCycle: 'Monthly',
    team: [
      { empId: 'BP-007', role: 'SEO_SPECIALIST' },
    ],
  },
  {
    name: 'Dr Manoj Johar',
    tier: 'STANDARD',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SM, SEO, Ads',
    deliverables: 'Social media: 12 posts, SEO + local SEO',
    kpis: 'Lead quality',
    notes: 'High aesthetic requirement',
    billingCycle: 'Monthly',
    team: [
      { empId: 'BP-011', role: 'ACCOUNT_MANAGER' },
      { empId: 'BP-016', role: 'SEO_SPECIALIST' },
      { empId: 'BP-004', role: 'SEO_SPECIALIST' },
    ],
  },
  {
    name: 'Dr Arun Saroha',
    tier: 'STANDARD',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SM, Web, SEO',
    deliverables: 'Social media: 12 posts, SEO + local SEO, Website mgmt',
    kpis: 'SEO growth',
    notes: 'Strict tone required',
    billingCycle: 'Monthly',
    team: [
      { empId: 'BP-011', role: 'ACCOUNT_MANAGER' },
      { empId: 'BP-016', role: 'SEO_SPECIALIST' },
      { empId: 'BP-004', role: 'SEO_SPECIALIST' },
    ],
  },
  {
    name: 'KP Healthcare',
    tier: 'STANDARD',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SM',
    deliverables: 'Social Media - 8 shorts',
    kpis: 'Reach growth',
    notes: 'Simple designs',
    billingCycle: 'Monthly',
    team: [
      { empId: 'BP-011', role: 'ACCOUNT_MANAGER' },
    ],
  },
  {
    name: 'House of Skin',
    tier: 'STANDARD',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SEO',
    deliverables: 'Local SEO + GBP optimization',
    kpis: 'Lead gen',
    notes: 'Soft pastel theme',
    billingCycle: 'Monthly',
    team: [
      { empId: 'BP-019', role: 'SEO_SPECIALIST' },
    ],
  },
  {
    name: 'SH Candles',
    tier: 'STARTER',
    status: 'ACTIVE',
    industry: 'Retail',
    services: 'SM',
    deliverables: 'Social Media Branding, Website Management',
    kpis: 'Sales enquiries',
    notes: 'Warm theme',
    billingCycle: 'Monthly',
    team: [
      { empId: 'BP-011', role: 'ACCOUNT_MANAGER' },
    ],
  },
  {
    name: 'A.A Hospital',
    tier: 'STARTER',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SEO',
    deliverables: 'Local SEO',
    kpis: 'Awareness growth',
    notes: 'Low-budget',
    billingCycle: 'Monthly',
    team: [
      { empId: 'BP-004', role: 'SEO_SPECIALIST' },
    ],
  },
  {
    name: 'Dr Kavender',
    tier: 'STARTER',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SEO',
    deliverables: 'Local SEO',
    kpis: 'Engagement',
    notes: 'Minimal ask',
    billingCycle: 'Monthly',
    team: [
      { empId: 'BP-020', role: 'SEO_SPECIALIST' },
    ],
  },
  {
    name: 'Dr Anvesh',
    tier: 'STANDARD',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SEO',
    deliverables: 'Local SEO',
    kpis: 'Awareness',
    notes: "Doesn't want frequent posting",
    billingCycle: 'Monthly',
    team: [
      { empId: 'BP-004', role: 'SEO_SPECIALIST' },
    ],
  },
  {
    name: 'Pratham Diagnostic',
    tier: 'STARTER',
    status: 'ACTIVE',
    industry: 'Healthcare',
    services: 'SM, Web',
    deliverables: 'Social Media - 20 Post, Website support',
    kpis: 'Footfall growth',
    notes: 'Clean medical blue theme',
    billingCycle: 'Monthly',
    team: [
      { empId: 'BP-021', role: 'SOCIAL_MANAGER' },
    ],
  },
  {
    name: 'Mr Atul',
    tier: 'STARTER',
    status: 'ACTIVE',
    industry: 'Professional',
    services: 'SM',
    deliverables: 'Linkedin Management',
    kpis: 'Engagement',
    notes: 'Very simple content preferred',
    billingCycle: 'Monthly',
    team: [
      { empId: 'BP-017', role: 'ACCOUNT_MANAGER' },
    ],
  },
]

// ============================================
// IMPORT LOGIC
// ============================================
async function main() {
  console.error('Starting import...\n')

  // 1. Create employees
  console.error('Creating employees...')
  const userMap: Record<string, string> = {} // empId -> db id

  // Get existing admin
  const admin = await prisma.user.findUnique({ where: { empId: 'BP-001' } })
  if (admin) userMap['BP-001'] = admin.id

  for (const emp of employees) {
    const existing = await prisma.user.findUnique({ where: { empId: emp.empId } })
    if (existing) {
      userMap[emp.empId] = existing.id
      console.error(`  [skip] ${emp.empId} ${emp.firstName} (already exists)`)
      continue
    }

    // Generate unique phone placeholder
    const phone = `+91900000${emp.empId.replace('BP-', '')}`

    const user = await prisma.user.create({
      data: {
        empId: emp.empId,
        firstName: emp.firstName,
        phone,
        role: emp.role,
        department: emp.department,
        employeeType: emp.employeeType,
        joiningDate: new Date('2024-01-01'),
        status: 'ACTIVE',
        profileCompletionStatus: 'VERIFIED',
        profile: { create: { ndaSigned: true } },
      },
    })
    userMap[emp.empId] = user.id
    console.error(`  [created] ${emp.empId} ${emp.firstName} (${emp.role}, ${emp.department})`)
  }

  console.error(`\n${Object.keys(userMap).length} employees ready.\n`)

  // 2. Create clients
  console.error('Creating clients...')
  let created = 0
  let skipped = 0

  for (const client of clients) {
    const existing = await prisma.client.findFirst({ where: { name: client.name } })
    if (existing) {
      console.error(`  [skip] ${client.name} (already exists)`)
      skipped++
      continue
    }

    const dbClient = await prisma.client.create({
      data: {
        name: client.name,
        tier: client.tier,
        status: client.status,
        industry: client.industry,
        businessType: 'B2C',
        clientType: 'RECURRING',
        serviceSegment: 'MARKETING',
      },
    })

    // Create team assignments
    for (const member of client.team) {
      const userId = userMap[member.empId]
      if (!userId) {
        console.error(`    [warn] Employee ${member.empId} not found, skipping assignment`)
        continue
      }
      await prisma.clientTeamMember.create({
        data: {
          clientId: dbClient.id,
          userId,
          role: member.role,
          isPrimary: member.role === 'ACCOUNT_MANAGER',
        },
      })
    }

    console.error(`  [created] ${client.name} (${client.tier}, ${client.status}) - ${client.team.length} team members`)
    created++
  }

  console.error(`\nImport complete: ${created} clients created, ${skipped} skipped.`)
  console.error(`Total employees: ${Object.keys(userMap).length}`)
  console.error(`Total clients: ${created}`)
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
