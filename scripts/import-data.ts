import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { hashSync } from 'bcryptjs'

const prisma = new PrismaClient()

// Generate a random temporary password per employee
function generateTempPassword(): string {
  return crypto.randomBytes(16).toString('hex')
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim())
    const row: Record<string, string> = {}
    headers.forEach((header, i) => {
      row[header] = values[i] || ''
    })
    return row
  })
}

async function importEmployees() {
  const csvPath = path.join(__dirname, '../data-templates/employees.csv')
  if (!fs.existsSync(csvPath)) {
    console.log('employees.csv not found')
    return
  }

  const content = fs.readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(content)

  console.log(`Importing ${rows.length} employees...`)

  for (const row of rows) {
    if (!row.empId) continue

    try {
      await prisma.user.upsert({
        where: { empId: row.empId },
        update: {
          firstName: row.firstName || undefined,
          lastName: row.lastName || undefined,
          email: row.email || undefined,
          phone: row.phone || undefined,
          department: row.department || undefined,
          role: row.role || undefined,
          employeeType: row.employeeType || undefined,
          joiningDate: row.joiningDate ? new Date(row.joiningDate) : undefined,
          dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : undefined,
          status: row.status || undefined,
        },
        create: {
          empId: row.empId,
          firstName: row.firstName,
          lastName: row.lastName || null,
          email: row.email || null,
          phone: row.phone || `temp-${row.empId}`,
          department: row.department || 'OPERATIONS',
          role: row.role || 'EMPLOYEE',
          employeeType: row.employeeType || 'FULL_TIME',
          joiningDate: row.joiningDate ? new Date(row.joiningDate) : new Date(),
          dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : null,
          status: row.status || 'ACTIVE',
          password: hashSync(generateTempPassword(), 10),
        },
      })
      console.log(`  ✓ ${row.empId} - ${row.firstName} ${row.lastName}`)
    } catch (error) {
      console.error(`  ✗ ${row.empId}: ${error}`)
    }
  }
}

async function importClients() {
  const csvPath = path.join(__dirname, '../data-templates/clients.csv')
  if (!fs.existsSync(csvPath)) {
    console.log('clients.csv not found')
    return
  }

  const content = fs.readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(content)

  console.log(`Importing ${rows.length} clients...`)

  // First pass: create/update clients without parent references
  const clientIdMap: Record<string, string> = {}

  for (const row of rows) {
    if (!row.name) continue

    try {
      const existing = await prisma.client.findFirst({ where: { name: row.name } })

      const clientData = {
        contactName: row.contactName || null,
        contactEmail: row.contactEmail || null,
        contactPhone: row.contactPhone || null,
        industry: row.industry || 'Healthcare',
        tier: row.tier || 'STANDARD',
        monthlyFee: row.monthlyFee ? parseFloat(row.monthlyFee) : null,
        paymentDueDay: row.paymentDueDay ? parseInt(row.paymentDueDay) : null,
        gstNumber: row.gstNumber || null,
        websiteUrl: row.websiteUrl || null,
        status: row.status || 'ACTIVE',
      }

      if (existing) {
        await prisma.client.update({
          where: { id: existing.id },
          data: clientData,
        })
        clientIdMap[row.name] = existing.id
      } else {
        const newClient = await prisma.client.create({
          data: {
            name: row.name,
            ...clientData,
          },
        })
        clientIdMap[row.name] = newClient.id
      }
      console.log(`  ✓ ${row.name}`)
    } catch (error) {
      console.error(`  ✗ ${row.name}: ${error}`)
    }
  }

  // Second pass: update parent references
  for (const row of rows) {
    if (!row.name || !row.parentClient) continue

    const parentId = clientIdMap[row.parentClient]
    const clientId = clientIdMap[row.name]

    if (parentId && clientId) {
      try {
        await prisma.client.update({
          where: { id: clientId },
          data: { parentClientId: parentId },
        })
        console.log(`  ✓ Linked ${row.name} -> ${row.parentClient}`)
      } catch (error) {
        console.error(`  ✗ Link ${row.name}: ${error}`)
      }
    }
  }
}

async function importAssignments() {
  const csvPath = path.join(__dirname, '../data-templates/client-team-assignments.csv')
  if (!fs.existsSync(csvPath)) {
    console.log('client-team-assignments.csv not found')
    return
  }

  const content = fs.readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(content)

  console.log(`Importing ${rows.length} assignments...`)

  for (const row of rows) {
    if (!row.clientName || !row.empId) continue

    try {
      const client = await prisma.client.findFirst({ where: { name: row.clientName } })
      const user = await prisma.user.findFirst({ where: { empId: row.empId } })

      if (!client || !user) {
        console.log(`  ✗ ${row.clientName} / ${row.empId}: Client or user not found`)
        continue
      }

      await prisma.clientTeamMember.upsert({
        where: {
          clientId_userId: {
            clientId: client.id,
            userId: user.id,
          },
        },
        update: {
          role: row.role || 'TEAM_MEMBER',
          isPrimary: row.isPrimary === 'true',
        },
        create: {
          clientId: client.id,
          userId: user.id,
          role: row.role || 'TEAM_MEMBER',
          isPrimary: row.isPrimary === 'true',
        },
      })
      console.log(`  ✓ ${row.empId} -> ${row.clientName}`)
    } catch (error) {
      console.error(`  ✗ ${row.clientName} / ${row.empId}: ${error}`)
    }
  }
}

async function main() {
  const args = process.argv.slice(2)

  console.log('\n🚀 Pioneer OS Data Import\n')

  if (args.includes('--employees') || args.length === 0) {
    await importEmployees()
    console.log('')
  }

  if (args.includes('--clients') || args.length === 0) {
    await importClients()
    console.log('')
  }

  if (args.includes('--assignments') || args.length === 0) {
    await importAssignments()
    console.log('')
  }

  console.log('✅ Import complete!\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
