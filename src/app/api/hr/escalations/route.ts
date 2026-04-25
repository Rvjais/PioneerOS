import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const createEscalationSchema = z.object({
  employeeId: z.string().min(1),
  type: z.string().min(1),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  clientId: z.string().optional(),
  impactOnAppraisal: z.boolean().optional(),
})

// SLA deadlines by severity (in hours)
const SLA_HOURS: Record<string, number> = {
  CRITICAL: 24,
  HIGH: 48,
  MEDIUM: 72,
  LOW: 120,
}

// NOTE: This uses calendar hours (not business hours) by design, assuming 24/7 operations.
// If the business is not 24/7, this should be updated to account for weekends and non-working hours.
function getSlaDeadline(severity: string, createdAt: Date): Date {
  const hours = SLA_HOURS[severity] ?? 72
  return new Date(createdAt.getTime() + hours * 60 * 60 * 1000)
}

function isSlaBreached(severity: string, createdAt: Date, status: string): boolean {
  if (status === 'RESOLVED' || status === 'CLOSED') return false
  return new Date() > getSlaDeadline(severity, createdAt)
}

// GET: Fetch escalations with filters
export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')
    const type = searchParams.get('type')

    const where: Record<string, unknown> = {}

    if (employeeId) where.employeeId = employeeId
    // Validate enum values to prevent arbitrary query values
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
    const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    if (status && validStatuses.includes(status)) where.status = status
    if (severity && validSeverities.includes(severity)) where.severity = severity
    if (type) where.type = type

    const escalations = await prisma.employeeEscalation.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
          }
        },
        client: {
          select: {
            id: true,
            name: true,
          }
        },
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { severity: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 200,
    })

    // Enrich with SLA tracking
    const enrichedEscalations = escalations.map(e => ({
      ...e,
      slaDeadline: getSlaDeadline(e.severity, e.createdAt).toISOString(),
      slaBreached: isSlaBreached(e.severity, e.createdAt, e.status),
      slaHours: SLA_HOURS[e.severity] ?? 72,
    }))

    // Get summary stats
    const stats = {
      total: escalations.length,
      open: escalations.filter(e => e.status === 'OPEN').length,
      inProgress: escalations.filter(e => e.status === 'IN_PROGRESS').length,
      resolved: escalations.filter(e => e.status === 'RESOLVED').length,
      critical: escalations.filter(e => e.severity === 'CRITICAL' && e.status !== 'RESOLVED').length,
      slaBreached: enrichedEscalations.filter(e => e.slaBreached).length,
    }

    return NextResponse.json({ escalations: enrichedEscalations, stats })
  } catch (error) {
    console.error('Error fetching escalations:', error)
    return NextResponse.json({ error: 'Failed to fetch escalations' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'HR', 'OPERATIONS_HEAD', 'OM'] })

// POST: Create a new escalation
export const POST = withAuth(async (req, { user }) => {
  try {
    const raw = await req.json()
    const parsed = createEscalationSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const {
      employeeId,
      type,
      severity = 'MEDIUM',
      title,
      description,
      clientId,
      impactOnAppraisal = false
    } = parsed.data

    // Create escalation
    const escalation = await prisma.employeeEscalation.create({
      data: {
        employeeId,
        type,
        severity,
        title,
        description,
        clientId,
        reportedBy: user.id,
        impactOnAppraisal,
        status: 'OPEN'
      },
      include: {
        employee: true,
        client: true,
        reporter: true
      }
    })

    // Auto-notify manager and HR for HIGH/CRITICAL escalations
    if (severity === 'HIGH' || severity === 'CRITICAL') {
      // Get employee's manager (by department)
      const managers = await prisma.user.findMany({
        where: {
          role: 'MANAGER',
          deletedAt: null,
          OR: [
            { department: escalation.employee.department },
            { department: 'HR' }
          ]
        },
        select: { id: true, firstName: true }
      })

      // Create notifications
      for (const manager of managers) {
        await prisma.notification.create({
          data: {
            userId: manager.id,
            type: 'ESCALATION',
            title: `${severity} Escalation: ${title}`,
            message: `New ${severity.toLowerCase()} escalation reported for ${escalation.employee.firstName}`,
            link: `/hr/escalations/${escalation.id}`
          }
        })
      }

      // Update escalation notification status
      await prisma.employeeEscalation.update({
        where: { id: escalation.id },
        data: {
          managerNotified: true,
          hrNotified: true,
          notifiedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      escalation: {
        ...escalation,
        slaDeadline: getSlaDeadline(escalation.severity, escalation.createdAt).toISOString(),
        slaBreached: false,
        slaHours: SLA_HOURS[escalation.severity] ?? 72,
      }
    })
  } catch (error) {
    console.error('Error creating escalation:', error)
    return NextResponse.json({ error: 'Failed to create escalation' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'HR', 'OPERATIONS_HEAD', 'OM'] })
