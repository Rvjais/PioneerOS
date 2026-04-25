import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

// Validation schema for leave request
const LeaveRequestSchema = z.object({
  type: z.string().min(1, 'Leave type is required'),
  startDate: z.string().min(1, 'Start date is required').refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date format' }),
  endDate: z.string().min(1, 'End date is required').refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date format' }),
  reason: z.string().max(1000, 'Reason must be 1000 characters or less').optional(),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'Start date must be before or equal to end date',
  path: ['endDate'],
})

// GET: Fetch leave requests
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY FIX: Users can only see their own leave requests
    // HR/Managers can see all requests
    const isAdmin = ['SUPER_ADMIN', 'MANAGER', 'HR'].includes(user.role || '') || user.department === 'HR'

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '50')), 100)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    // Non-admins can only see their own leave requests
    if (!isAdmin) {
      where.userId = user.id
    } else if (user.role === 'MANAGER') {
      // MANAGER can only see leave requests from their own department
      if (userId) {
        where.userId = userId
      }
      where.user = { department: user.department }
    } else if (userId) {
      where.userId = userId
    }
    if (status) where.status = status

    const [requests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              department: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.leaveRequest.count({ where }),
    ])

    return NextResponse.json({ requests, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Error fetching leave requests:', error)
    return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 })
  }
})

// POST: Create a new leave request
export const POST = withAuth(async (req, { user }) => {
  try {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Interns are not eligible for regular leave (company policy)
    if (user.role === 'INTERN') {
      return NextResponse.json({
        error: 'Interns are not eligible for leave requests. Please contact HR for emergency situations.'
      }, { status: 403 })
    }

    const body = await req.json()

    // Validate request body with Zod
    const parseResult = LeaveRequestSchema.safeParse(body)
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]
      return NextResponse.json(
        { error: firstError.message || 'Invalid leave request data' },
        { status: 400 }
      )
    }

    const { type, startDate, endDate, reason } = parseResult.data

    // Validate and normalize leave type
    // Accept both short codes (from UI) and full names
    const leaveTypeMapping: Record<string, string> = {
      'PL': 'PL',           // Privilege Leave
      'CL': 'CL',           // Casual Leave
      'SL': 'SL',           // Sick Leave
      'COMP_OFF': 'COMP_OFF', // Compensatory Off
      'CASUAL': 'CL',
      'SICK': 'SL',
      'EARNED': 'PL',
      'ANNUAL': 'PL',       // Map ANNUAL to Privilege Leave
      'WFH': 'WFH',         // Work From Home
      'UNPAID': 'UNPAID',
      'COMPENSATORY': 'COMP_OFF',
      'MATERNITY': 'MATERNITY',
      'PATERNITY': 'PATERNITY',
    }

    const normalizedType = leaveTypeMapping[type]
    if (!normalizedType) {
      return NextResponse.json({ error: `Invalid leave type: ${type}. Valid types: PL, CL, SL, COMP_OFF` }, { status: 400 })
    }

    // Calculate number of days
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Prevent past date submissions (only allow from today onwards)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (start < today) {
      return NextResponse.json({ error: 'Cannot apply for leave in the past' }, { status: 400 })
    }
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    if (days <= 0) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
    }

    // Check for overlapping leave requests
    const overlap = await prisma.leaveRequest.findFirst({
      where: {
        userId: user.id,
        status: { not: 'REJECTED' },
        startDate: { lte: end },
        endDate: { gte: start },
      },
    })
    if (overlap) {
      return NextResponse.json(
        { error: 'Leave dates overlap with an existing request' },
        { status: 400 }
      )
    }

    // Check leave balance and create request atomically to prevent concurrent modification
    const startYear = start.getFullYear()
    const endYear = end.getFullYear()

    const leaveRequest = await prisma.$transaction(async (tx) => {
      if (startYear !== endYear) {
        // Leave spans two years — split days and check each year's balance
        const yearEnd = new Date(startYear, 11, 31)
        const daysInStartYear = Math.ceil((yearEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
        const daysInEndYear = days - daysInStartYear

        const balanceStartYear = await tx.leaveBalance.findUnique({
          where: {
            userId_year_type: {
              userId: user.id,
              year: startYear,
              type: normalizedType,
            }
          }
        })

        if (balanceStartYear && balanceStartYear.remaining < daysInStartYear) {
          throw new Error(`Insufficient ${normalizedType} balance for ${startYear}. You have ${balanceStartYear.remaining} days remaining but need ${daysInStartYear}.`)
        }

        const balanceEndYear = await tx.leaveBalance.findUnique({
          where: {
            userId_year_type: {
              userId: user.id,
              year: endYear,
              type: normalizedType,
            }
          }
        })

        if (balanceEndYear && balanceEndYear.remaining < daysInEndYear) {
          throw new Error(`Insufficient ${normalizedType} balance for ${endYear}. You have ${balanceEndYear.remaining} days remaining but need ${daysInEndYear}.`)
        }
      } else {
        const balance = await tx.leaveBalance.findUnique({
          where: {
            userId_year_type: {
              userId: user.id,
              year: startYear,
              type: normalizedType,
            }
          }
        })

        if (balance && balance.remaining < days) {
          throw new Error(`Insufficient ${normalizedType} balance. You have ${balance.remaining} days remaining.`)
        }
      }

      // Create leave request inside transaction for atomicity
      const request = await tx.leaveRequest.create({
        data: {
          userId: user.id,
          type: normalizedType,
          startDate: start,
          endDate: end,
          reason,
          status: 'PENDING',
        },
        include: {
          user: true,
        }
      })

      return request
    })

    // Notify HR
    const hrUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'HR' },
          { role: 'SUPER_ADMIN' },
          { department: 'HR' },
        ],
        deletedAt: null,
      },
      select: { id: true }
    })

    if (hrUsers.length > 0) {
      await prisma.notification.createMany({
        data: hrUsers.map(hr => ({
          userId: hr.id,
          type: 'LEAVE_REQUEST',
          title: 'New Leave Request',
          message: `${leaveRequest.user.firstName} ${leaveRequest.user.lastName} requested ${days} day(s) of ${normalizedType}.`,
          link: '/hr/leave'
        }))
      })
    }

    return NextResponse.json({ leaveRequest })
  } catch (error) {
    console.error('Error creating leave request:', error)
    const message = error instanceof Error ? error.message : 'Failed to create leave request'
    // Handle balance-related errors from transaction
    if (message.includes('Insufficient') || message.includes('balance')) {
      return NextResponse.json({ error: message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 })
  }
})
