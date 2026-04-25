import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async (req, { user, params }) => {
  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const actionType = searchParams.get('actionType')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500)

    const dateFilter: { gte?: Date; lte?: Date } = {}
    if (from) dateFilter.gte = new Date(from)
    if (to) dateFilter.lte = new Date(to + 'T23:59:59.999Z')

    // Fetch notifications as system activity trail
    const notificationWhere: Record<string, unknown> = {}
    if (Object.keys(dateFilter).length) notificationWhere.createdAt = dateFilter
    if (actionType && actionType !== 'ALL') notificationWhere.type = actionType

    const [notifications, impersonationSessions, recentUsers, loginSessions] = await Promise.all([
      prisma.notification.findMany({
        where: notificationWhere,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, empId: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.impersonationSession.findMany({
        where: Object.keys(dateFilter).length ? { startedAt: dateFilter } : undefined,
        orderBy: { startedAt: 'desc' },
        take: 50,
      }),
      prisma.user.findMany({
        where: {
          status: 'ACTIVE',
          ...(Object.keys(dateFilter).length ? { updatedAt: dateFilter } : {}),
        },
        select: {
          id: true,
          empId: true,
          firstName: true,
          lastName: true,
          joiningDate: true,
          profileCompletionStatus: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 30,
      }),
      prisma.loginSession.findMany({
        where: Object.keys(dateFilter).length ? { loginAt: dateFilter } : undefined,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, empId: true } },
        },
        orderBy: { loginAt: 'desc' },
        take: 100,
      }),
    ])

    // Combine into unified audit entries
    type AuditEntry = {
      id: string
      timestamp: string
      user: string
      action: string
      details: string
      category: string
    }

    const entries: AuditEntry[] = []

    // Notifications as activity entries
    for (const n of notifications) {
      entries.push({
        id: n.id,
        timestamp: n.createdAt.toISOString(),
        user: n.user ? `${n.user.firstName} ${n.user.lastName || ''}`.trim() : 'System',
        action: n.type,
        details: `${n.title} — ${n.message}`,
        category: 'NOTIFICATION',
      })
    }

    // Impersonation sessions
    for (const s of impersonationSessions) {
      entries.push({
        id: s.id,
        timestamp: s.startedAt.toISOString(),
        user: `Admin (${s.adminId})`,
        action: 'IMPERSONATION',
        details: `Impersonated user ${s.targetUserId}${s.reason ? ` — ${s.reason}` : ''}${s.endedAt ? ' (ended)' : ' (active)'}`,
        category: 'SECURITY',
      })
    }

    // Login sessions
    if (!actionType || actionType === 'ALL' || actionType === 'LOGIN' || actionType === 'LOGOUT') {
      for (const s of loginSessions) {
        const userName = s.user ? `${s.user.firstName} ${s.user.lastName || ''}`.trim() : 'Unknown'
        entries.push({
          id: s.id,
          timestamp: s.loginAt.toISOString(),
          user: userName,
          action: 'LOGIN',
          details: `${s.browser || 'Unknown browser'} on ${s.os || 'Unknown OS'} (${s.ipAddress || 'unknown IP'})`,
          category: 'AUTH',
        })
        if (s.logoutAt) {
          const durationMins = Math.round((s.logoutAt.getTime() - s.loginAt.getTime()) / 1000 / 60)
          entries.push({
            id: `${s.id}-logout`,
            timestamp: s.logoutAt.toISOString(),
            user: userName,
            action: 'LOGOUT',
            details: `Session lasted ${durationMins} minutes`,
            category: 'AUTH',
          })
        }
      }
    }

    // Recent profile updates / onboarding completions
    if (!actionType || actionType === 'ALL' || actionType === 'USER_UPDATE') {
      for (const u of recentUsers) {
        if (u.profileCompletionStatus === 'VERIFIED') {
          entries.push({
            id: `user-${u.id}`,
            timestamp: u.updatedAt.toISOString(),
            user: `${u.firstName} ${u.lastName || ''}`.trim(),
            action: 'USER_UPDATE',
            details: `Profile verified / onboarding complete (${u.empId})`,
            category: 'ONBOARDING',
          })
        }
      }
    }

    // Sort by timestamp desc
    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Get distinct action types for filter dropdown
    const actionTypes = [...new Set(entries.map(e => e.action))]

    return NextResponse.json({
      entries: entries.slice(0, limit),
      actionTypes,
      total: entries.length,
    })
  } catch (error) {
    console.error('Failed to fetch audit log:', error)
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN'] })
