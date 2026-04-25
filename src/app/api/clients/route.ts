import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const onboarding = searchParams.get('onboarding')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { deletedAt: null }

    // Role-based scoping
    const userRole = user.role || ''
    const fullAccessRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'OPERATIONS_HEAD']
    if (!fullAccessRoles.includes(userRole)) {
      if (userRole === 'SALES') {
        // Sales can see clients where they are a team member or the lead assignee
        where.OR = [
          { teamMembers: { some: { userId: user.id } } },
          { leadAssigneeId: user.id },
        ]
      } else if (userRole === 'FREELANCER') {
        // Freelancers can only see clients they are assigned to
        where.teamMembers = { some: { userId: user.id } }
      } else {
        // Other roles: only clients where they are a team member
        where.teamMembers = { some: { userId: user.id } }
      }
    }

    // For onboarding page, get clients that need onboarding
    if (onboarding === 'true') {
      where.onboardingStatus = {
        in: ['PENDING', 'IN_PROGRESS', 'AWAITING_SLA', 'AWAITING_PAYMENT', 'COMPLETED']
      }
    }

    if (status) {
      where.status = status
    }

    if (search) {
      const searchCondition = {
        OR: [
          { name: { contains: search } },
          { contactName: { contains: search } },
          { contactEmail: { contains: search } },
        ],
      }
      // Use AND to combine with any existing OR conditions (e.g., role-based scoping)
      if (where.OR) {
        where.AND = [{ OR: where.OR as Record<string, unknown>[] }, searchCondition]
        delete where.OR
      } else if (where.AND) {
        ;(where.AND as Record<string, unknown>[]).push(searchCondition)
      } else {
        where.OR = searchCondition.OR
      }
    }

    // Fetch clients and total count in parallel
    const [clients, totalCount] = await Promise.all([
      prisma.client.findMany({
        where,
        select: {
          id: true,
          name: true,
          logoUrl: true,
          contactName: true,
          contactEmail: true,
          contactPhone: true,
          whatsapp: true,
          status: true,
          onboardingStatus: true,
          lifecycleStage: true,
          tier: true,
          monthlyFee: true,
          services: true,
          createdAt: true,
          updatedAt: true,
          startDate: true,
          // Team members
          teamMembers: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                  profile: {
                    select: {
                      profilePicture: true
                    }
                  }
                }
              }
            }
          },
          // Client Portal
          clientPortal: {
            select: {
              logoUrl: true,
              themeColor: true,
              isActive: true,
            }
          },
          // Onboarding checklist included directly to avoid N+1 query
          clientOnboardingChecklist: {
            select: {
              id: true,
              contractSigned: true,
              invoicePaid: true,
              ndaSigned: true,
              kickoffMeetingDone: true,
              brandGuidelinesReceived: true,
              websiteAccessGranted: true,
              analyticsAccessGranted: true,
              socialMediaAccess: true,
              adsAccountAccess: true,
              trackingSetup: true,
              pixelsInstalled: true,
              crmIntegrated: true,
              reportingDashboardReady: true,
              accountManagerAssigned: true,
              teamIntroductionDone: true,
              communicationChannelSetup: true,
              firstStrategyCallDone: true,
              contentCalendarShared: true,
              firstDeliverablesApproved: true,
              monthlyReportingSchedule: true,
              managerNotes: true,
              status: true,
              completionPercentage: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.client.count({ where }),
    ])

    // Strip monthlyFee for non-privileged roles
    const feeAllowedRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'OPERATIONS_HEAD']
    const canSeeFee = feeAllowedRoles.includes(user.role || '')

    const clientsWithChecklists = clients.map(client => {
      const { clientOnboardingChecklist, ...clientData } = client
      const result: Record<string, unknown> = {
        ...clientData,
        onboardingChecklist: clientOnboardingChecklist || null,
      }
      if (!canSeeFee) {
        delete result.monthlyFee
      }
      return result
    })

    return NextResponse.json({
      clients: clientsWithChecklists,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch clients:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
