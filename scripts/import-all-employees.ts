import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface EmpData {
  empId?: string // if updating existing
  firstName: string
  lastName?: string
  phone: string
  address?: string
  currentAddress?: string
  dob?: string
  role: string
  department: string
  employeeType: string
  joiningDate?: string
  designation?: string
}

const allEmployees: EmpData[] = [
  // === UPDATES TO EXISTING EMPLOYEES ===
  {
    empId: 'BP-002',
    firstName: 'Himanshu',
    lastName: 'Silori',
    phone: '8448473282',
    address: 'B4, Dayalbagh, Faridabad',
    dob: '1994-09-25',
    role: 'MANAGER',
    department: 'OPERATIONS',
    employeeType: 'FULL_TIME',
    joiningDate: '2021-11-29',
    designation: 'Operations Head',
  },
  {
    empId: 'BP-003',
    firstName: 'Samiullah',
    lastName: 'Halim',
    phone: '8076977334',
    address: '42th Apartment, 4th Floor, Kabul, Afghanistan',
    currentAddress: '105th Flat, 1st Floor, U Block DLIF, Gurugram, Haryana',
    dob: '1999-03-11',
    role: 'EMPLOYEE',
    department: 'SOCIAL',
    employeeType: 'PART_TIME',
    joiningDate: '2025-04-29',
    designation: 'AI Creative Designer',
  },
  {
    empId: 'BP-004',
    firstName: 'Satyam',
    lastName: 'Rai',
    phone: '7317564794',
    address: 'Gorakhpur',
    currentAddress: 'Palam Vihar',
    dob: '2002-10-26',
    role: 'EMPLOYEE',
    department: 'SEO',
    employeeType: 'FULL_TIME',
    joiningDate: '2024-09-23',
    designation: 'SEO Executive',
  },
  {
    empId: 'BP-005',
    firstName: 'Ankit',
    lastName: 'Kumar',
    phone: '7808025222',
    address: 'Ranchi, Jharkhand',
    currentAddress: 'Sector 38, Gurgaon',
    dob: '2002-08-04',
    role: 'EMPLOYEE',
    department: 'ADS',
    employeeType: 'FULL_TIME',
    joiningDate: '2025-10-07',
    designation: 'Performance Ads Executive',
  },
  {
    empId: 'BP-006',
    firstName: 'Pravesh',
    lastName: 'Singh Foujdar',
    phone: '8527022358',
    address: 'House no. 135, Shriji Shivasha Estate, Mathura, UP - 281004',
    dob: '1989-11-22',
    role: 'EMPLOYEE',
    department: 'OPERATIONS',
    employeeType: 'FULL_TIME',
    joiningDate: '2026-02-17',
    designation: 'Client Servicing',
  },
  {
    empId: 'BP-007',
    firstName: 'Suraj',
    lastName: '',
    phone: '9671262212',
    address: 'VPO. Khudan, Jhajjar, Haryana',
    dob: '2002-05-15',
    role: 'EMPLOYEE',
    department: 'SEO',
    employeeType: 'FULL_TIME',
    joiningDate: '2023-10-05',
    designation: 'Senior SEO Executive / TL',
  },
  {
    empId: 'BP-008',
    firstName: 'Pragati',
    lastName: 'Priya',
    phone: '9955307624',
    address: 'House no. 457, East Bhatia Nagar, Yamunanagar, Haryana',
    currentAddress: '2nd floor, House no. 596, Sector 9, Gurugram',
    dob: '2001-01-29',
    role: 'EMPLOYEE',
    department: 'ADS',
    employeeType: 'FULL_TIME',
    joiningDate: '2026-01-20',
    designation: 'Performance Marketing Executive',
  },
  {
    empId: 'BP-009',
    firstName: 'Shivam',
    lastName: 'Kumar',
    phone: '9110068182',
    address: 'Parbatta, Khagaria, Bihar',
    currentAddress: 'HK Tower, Sector 39, Gurgaon',
    dob: '2002-02-02',
    role: 'EMPLOYEE',
    department: 'WEB',
    employeeType: 'FULL_TIME',
    joiningDate: '2024-11-11',
    designation: 'Senior Web Developer',
  },
  {
    empId: 'BP-011',
    firstName: 'Aditi',
    lastName: 'Singh',
    phone: '8127444264',
    address: 'Lucknow UP',
    currentAddress: 'Saket, New Delhi',
    dob: '2001-08-16',
    role: 'EMPLOYEE',
    department: 'OPERATIONS',
    employeeType: 'FULL_TIME',
    joiningDate: '2025-03-03',
    designation: 'Client Servicing',
  },
  {
    empId: 'BP-012',
    firstName: 'Ansh',
    lastName: 'Singh',
    phone: '8700610628',
    address: 'H-53, Dhata, Sirathu, Fatehpur, 212641',
    currentAddress: 'Indirapuram Nyay Khad-I, Ghaziabad',
    dob: '2004-11-23',
    role: 'EMPLOYEE',
    department: 'SOCIAL',
    employeeType: 'FULL_TIME',
    joiningDate: '2025-12-14',
    designation: 'Digital Marketing / YouTube',
  },
  {
    empId: 'BP-013',
    firstName: 'Chitransh',
    lastName: '',
    phone: '9911739969',
    address: 'Faridabad, Haryana',
    dob: '2001-10-18',
    role: 'EMPLOYEE',
    department: 'WEB',
    employeeType: 'FULL_TIME',
    joiningDate: '2025-02-17',
    designation: 'Web Developer',
  },
  {
    empId: 'BP-014',
    firstName: 'Taran',
    lastName: 'Chahal',
    phone: '9988124312',
    address: 'Phagwara, Punjab',
    dob: '1998-03-17',
    role: 'EMPLOYEE',
    department: 'SOCIAL',
    employeeType: 'FULL_TIME',
    joiningDate: '2021-08-10',
    designation: 'Designer & Video Editor',
  },
  {
    empId: 'BP-015',
    firstName: 'Aniket',
    lastName: '',
    phone: '9599320422',
    address: 'Faridabad, Haryana',
    dob: '2001-03-19',
    role: 'EMPLOYEE',
    department: 'WEB',
    employeeType: 'FULL_TIME',
    joiningDate: '2024-11-04',
    designation: 'Web Developer',
  },
  {
    empId: 'BP-016',
    firstName: 'Kishan',
    lastName: 'Gaur',
    phone: '9319526706',
    address: 'House No. 507 Teliwara Shahdara Delhi 110032',
    currentAddress: 'House No. 214 Teliwara Shahdara Delhi 110032',
    dob: '2001-12-11',
    role: 'EMPLOYEE',
    department: 'SEO',
    employeeType: 'FULL_TIME',
    joiningDate: '2025-12-16',
    designation: 'YouTube Manager',
  },
  {
    empId: 'BP-017',
    firstName: 'Om',
    lastName: 'Nath Tripathi',
    phone: '8081083203',
    address: 'Lucknow UP',
    currentAddress: 'Sec 39',
    dob: '2000-05-08',
    role: 'EMPLOYEE',
    department: 'HR',
    employeeType: 'FULL_TIME',
    joiningDate: '2024-09-13',
    designation: 'HR / Client Servicing',
  },
  {
    empId: 'BP-018',
    firstName: 'Ichha',
    lastName: 'Kumari',
    phone: '9870271198',
    address: 'D-568 Pul Pehladpur Badarpur Border, New Delhi',
    dob: '2003-11-21',
    role: 'EMPLOYEE',
    department: 'OPERATIONS',
    employeeType: 'FULL_TIME',
    joiningDate: '2025-09-22',
    designation: 'Client Servicing',
  },

  // === NEW EMPLOYEES ===
  {
    firstName: 'Tanmay',
    lastName: '',
    phone: '7065400012',
    address: 'B-115 Indrapark Najafgarh, New Delhi 110043',
    dob: '2004-06-27',
    role: 'INTERN',
    department: 'SOCIAL',
    employeeType: 'INTERN',
    joiningDate: '2025-12-11',
    designation: 'Graphic Design Intern',
  },
  {
    firstName: 'Priya',
    lastName: 'Bisht',
    phone: '8077460489',
    address: 'Lal Tappad Doiwala Dehradun',
    currentAddress: 'Palam Vihar',
    dob: '2003-05-06',
    role: 'EMPLOYEE',
    department: 'HR',
    employeeType: 'FULL_TIME',
    designation: 'HR',
  },
  {
    firstName: 'Ravi',
    lastName: 'Prakash',
    phone: '9311323781',
    address: '9, Devpura Colony, Mainpuri 205001 (U.P)',
    dob: '1993-10-02',
    role: 'FREELANCER',
    department: 'SOCIAL',
    employeeType: 'FREELANCER',
    joiningDate: '2025-05-05',
    designation: 'Video Editor',
  },
  {
    firstName: 'Vinay',
    lastName: 'Kumar',
    phone: '9336204231',
    address: 'Gorakhpur',
    dob: '2000-04-19',
    role: 'FREELANCER',
    department: 'SOCIAL',
    employeeType: 'FREELANCER',
    designation: 'YouTube Thumbnail Designer',
  },
  {
    firstName: 'Abhishek',
    lastName: 'Kumar Yadav',
    phone: '8077142697',
    address: 'House no. 1 Hnauwan City, Veer Savarkar Nagar, Bareilly',
    dob: '2001-03-30',
    role: 'SALES',
    department: 'SALES',
    employeeType: 'FULL_TIME',
    joiningDate: '2024-08-01',
    designation: 'Business Development',
  },
  {
    firstName: 'Kushal',
    lastName: 'Khanna',
    phone: '8708326751',
    address: 'New Patel Park Gali no. 7, Linepar Bahadurgarh, Jhajjar, Haryana',
    currentAddress: 'Salapur Khera Sec.21, Palam Farms, New Delhi',
    dob: '2005-10-22',
    role: 'FREELANCER',
    department: 'SOCIAL',
    employeeType: 'FREELANCER',
    joiningDate: '2025-11-17',
    designation: 'Video Editor',
  },
  {
    firstName: 'Maroofe',
    lastName: 'Aalam',
    phone: '8171910192',
    address: 'Bareilly UP',
    currentAddress: 'DLF Phase 3',
    dob: '1996-07-05',
    role: 'ACCOUNTS',
    department: 'ACCOUNTS',
    employeeType: 'FULL_TIME',
    designation: 'Accountant',
  },
  {
    firstName: 'Ranveer',
    lastName: 'Jaiswal',
    phone: '9648165493',
    address: 'Sujanganj, Jaunpur',
    currentAddress: 'Sector 32',
    dob: '2003-11-14',
    role: 'INTERN',
    department: 'WEB',
    employeeType: 'INTERN',
    joiningDate: '2025-09-17',
    designation: 'AI Developer',
  },
  {
    firstName: 'Tarun',
    lastName: '',
    phone: '9654596995',
    address: 'T-A = 36 Om Vihar, Uttam Nagar 110059',
    currentAddress: 'F-8, Street no-8, Vishwash Park, Uttam Nagar',
    dob: '1994-02-04',
    role: 'FREELANCER',
    department: 'SOCIAL',
    employeeType: 'FREELANCER',
    joiningDate: '2025-05-26',
    designation: 'Videographer',
  },
  {
    firstName: 'Aman',
    lastName: '',
    phone: '9953547771',
    address: 'Emaar Emerald Hills, Sec 65, Gurgaon',
    dob: '1987-05-20',
    role: 'FREELANCER',
    department: 'SOCIAL',
    employeeType: 'FREELANCER',
    designation: 'Creative Director',
  },
  {
    firstName: 'Yash',
    lastName: 'Agrawal',
    phone: '9548053865',
    address: 'Vrindavan, Mathura UP',
    dob: '2003-07-02',
    role: 'FREELANCER',
    department: 'SOCIAL',
    employeeType: 'FREELANCER',
    designation: 'Video Editor',
  },
  {
    firstName: 'Manish',
    lastName: 'Kushwaha',
    phone: '9565416467',
    address: 'Mirzapur, UP',
    currentAddress: 'Khandsha Road',
    dob: '2000-07-11',
    role: 'MANAGER',
    department: 'WEB',
    employeeType: 'FULL_TIME',
    joiningDate: '2021-11-22',
    designation: 'Team Lead / Developer',
  },
]

async function main() {
  console.error('=== Employee Import ===\n')

  let updated = 0
  let created = 0
  let nextId = 22 // BP-022 onwards for new employees

  for (const emp of allEmployees) {
    const phone = '+91' + emp.phone

    if (emp.empId) {
      // UPDATE existing employee
      const existing = await prisma.user.findUnique({ where: { empId: emp.empId } })
      if (!existing) {
        console.error(`  [warn] ${emp.empId} not found, skipping`)
        continue
      }

      await prisma.user.update({
        where: { empId: emp.empId },
        data: {
          firstName: emp.firstName,
          lastName: emp.lastName || null,
          phone,
          address: emp.address || null,
          role: emp.role,
          department: emp.department,
          employeeType: emp.employeeType,
          dateOfBirth: emp.dob ? new Date(emp.dob) : undefined,
          joiningDate: emp.joiningDate ? new Date(emp.joiningDate) : undefined,
        },
      })
      console.error(`  [updated] ${emp.empId} ${emp.firstName} ${emp.lastName || ''} — ${emp.designation || emp.role}`)
      updated++
    } else {
      // Check if phone already exists
      const byPhone = await prisma.user.findUnique({ where: { phone } })
      if (byPhone) {
        console.error(`  [skip] ${emp.firstName} ${emp.lastName || ''} — phone ${emp.phone} already exists as ${byPhone.empId}`)
        continue
      }

      // CREATE new employee
      const empId = `BP-${String(nextId).padStart(3, '0')}`
      nextId++

      await prisma.user.create({
        data: {
          empId,
          firstName: emp.firstName,
          lastName: emp.lastName || null,
          phone,
          address: emp.address || null,
          role: emp.role,
          department: emp.department,
          employeeType: emp.employeeType,
          dateOfBirth: emp.dob ? new Date(emp.dob) : null,
          joiningDate: emp.joiningDate ? new Date(emp.joiningDate) : new Date(),
          status: 'ACTIVE',
          profileCompletionStatus: 'VERIFIED',
          profile: { create: { ndaSigned: true } },
        },
      })
      console.error(`  [created] ${empId} ${emp.firstName} ${emp.lastName || ''} — ${emp.designation || emp.role} (${emp.employeeType})`)
      created++
    }
  }

  console.error(`\n=== Summary ===`)
  console.error(`Updated: ${updated}`)
  console.error(`Created: ${created}`)

  const total = await prisma.user.count()
  console.error(`Total employees: ${total}\n`)

  // Print all employees
  const all = await prisma.user.findMany({
    select: { empId: true, firstName: true, lastName: true, role: true, department: true, employeeType: true, phone: true },
    orderBy: { empId: 'asc' },
  })
  console.error('All employees:')
  for (const u of all) {
    console.error(`  ${u.empId} ${u.firstName} ${u.lastName || ''} — ${u.role} / ${u.department} (${u.employeeType})`)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
