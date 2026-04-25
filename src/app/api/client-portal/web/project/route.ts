import { NextRequest, NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'

/**
 * GET /api/client-portal/web/project
 * Get web project details for the client
 */
export const GET = withClientAuth(async (request, { user }) => {
  // Get the client's web projects
  const projects = await prisma.webProject.findMany({
    where: { clientId: user.clientId },
    include: {
      phases: {
        orderBy: { createdAt: 'asc' },
      },
      assignedTo: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get domains for this client
  const domains = await prisma.domain.findMany({
    where: { clientId: user.clientId },
    orderBy: { expiryDate: 'asc' },
  })

  // Get hosting for this client
  const hosting = await prisma.hostingAccount.findMany({
    where: { clientId: user.clientId },
    orderBy: { renewalDate: 'asc' },
  })

  // Get active AMC contracts
  const amcContracts = await prisma.maintenanceContract.findMany({
    where: {
      clientId: user.clientId,
      status: 'ACTIVE',
    },
    include: {
      maintenanceLogs: {
        orderBy: { date: 'desc' },
        take: 5,
      },
    },
  })

  return NextResponse.json({
    projects,
    domains,
    hosting,
    amcContracts,
  })
}, { requireWebAccess: true, rateLimit: 'READ' })
