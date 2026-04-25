import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withClientAuth } from '@/server/auth/withClientAuth'

// GET /api/client-portal/org-chart - Get client's assigned team
export const GET = withClientAuth(async (req, { user }) => {
  const clientId = user.clientId

  // Fetch team members assigned to this client
  const teamAssignments = await prisma.clientTeamMember.findMany({
    where: { clientId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          department: true,
          role: true,
          profile: {
            select: {
              profilePicture: true,
            },
          },
        },
      },
    },
    orderBy: [{ isPrimary: 'desc' }, { role: 'asc' }],
  })

  // Format team members
  const teamMembers = teamAssignments.map((ta) => ({
    id: ta.user.id,
    firstName: ta.user.firstName,
    lastName: ta.user.lastName,
    role: ta.role,
    department: ta.user.department,
    avatarUrl: ta.user.profile?.profilePicture || null,
    isPrimary: ta.isPrimary,
  }))

  // Find account manager (primary contact with ACCOUNT_MANAGER role)
  const accountManager = teamMembers.find(
    (m) => m.isPrimary || m.role === 'ACCOUNT_MANAGER'
  ) || null

  // Find accounts/billing contact
  const accountsContact = teamMembers.find(
    (m) => m.role === 'BILLING_CONTACT' || m.department === 'ACCOUNTS'
  ) || null

  // We need client whatsapp - fetch it
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { whatsapp: true },
  })

  return NextResponse.json({
    teamMembers,
    accountManager,
    accountsContact,
    clientWhatsApp: client?.whatsapp || null,
  })
}, { rateLimit: 'READ' })
