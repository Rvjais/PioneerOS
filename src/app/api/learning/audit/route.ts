import { NextRequest, NextResponse } from 'next/server'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { prisma } from '@/server/db/prisma'
import { generateMonthlyAudit } from '@/server/ai/learningVerification'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const auditSchema = z.object({
  month: z.string().optional(),
})

// POST - Generate or regenerate monthly audit
export const POST = withAuth(async (req, { user, params }) => {
  try {
const raw = await req.json()
    const parsed = auditSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { month } = parsed.data

    // Parse month
    let targetMonth: Date
    if (month) {
      targetMonth = new Date(month)
    } else {
      // Default to current month
      const now = new Date()
      targetMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Normalize to first of month
    targetMonth.setDate(1)
    targetMonth.setHours(0, 0, 0, 0)

    const monthEnd = new Date(targetMonth)
    monthEnd.setMonth(monthEnd.getMonth() + 1)

    // Get all learning logs for the month
    const learningLogs = await prisma.learningLog.findMany({
      where: {
        userId: user.id,
        month: {
          gte: targetMonth,
          lt: monthEnd
        }
      },
      include: {
        verification: {
          select: {
            aiScore: true,
            isVerified: true
          }
        }
      }
    })

    // Format for audit generation
    const entries = learningLogs.map(log => ({
      topic: log.topic,
      resourceTitle: log.resourceTitle,
      minutesWatched: log.minutesWatched,
      verificationScore: log.verification?.aiScore
    }))

    const monthLabel = formatDateDDMMYYYY(targetMonth)

    // Generate AI audit
    const auditResult = await generateMonthlyAudit(entries, monthLabel)

    // Calculate stats
    const totalMinutes = entries.reduce((sum, e) => sum + e.minutesWatched, 0)
    const verifiedEntries = entries.filter(e => e.verificationScore && e.verificationScore >= 60).length

    // Upsert audit record
    const audit = await prisma.learningAudit.upsert({
      where: {
        userId_month: {
          userId: user.id,
          month: targetMonth
        }
      },
      update: {
        totalEntries: entries.length,
        totalMinutes,
        verifiedEntries,
        averageScore: auditResult.averageScore,
        aiSummary: auditResult.summary,
        aiRecommendations: auditResult.recommendations.join('\n'),
        overallVerdict: auditResult.overallVerdict,
        auditedAt: new Date()
      },
      create: {
        userId: user.id,
        month: targetMonth,
        totalEntries: entries.length,
        totalMinutes,
        verifiedEntries,
        averageScore: auditResult.averageScore,
        aiSummary: auditResult.summary,
        aiRecommendations: auditResult.recommendations.join('\n'),
        overallVerdict: auditResult.overallVerdict,
      }
    })

    return NextResponse.json({
      success: true,
      audit: {
        id: audit.id,
        month: monthLabel,
        monthDate: targetMonth.toISOString(),
        totalEntries: audit.totalEntries,
        totalMinutes: audit.totalMinutes,
        totalHours: Math.round(audit.totalMinutes / 60 * 10) / 10,
        verifiedEntries: audit.verifiedEntries,
        averageScore: audit.averageScore,
        summary: audit.aiSummary,
        recommendations: audit.aiRecommendations?.split('\n').filter(Boolean) || [],
        verdict: audit.overallVerdict,
        keyTopicsLearned: auditResult.keyTopicsLearned,
        auditedAt: audit.auditedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Failed to generate audit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// GET - Get audit history
export const GET = withAuth(async (req, { user, params }) => {
  try {
const searchParams = req.nextUrl.searchParams
    const month = searchParams.get('month')

    if (month) {
      // Get specific month audit
      const targetMonth = new Date(month)
      targetMonth.setDate(1)
      targetMonth.setHours(0, 0, 0, 0)

      const audit = await prisma.learningAudit.findUnique({
        where: {
          userId_month: {
            userId: user.id,
            month: targetMonth
          }
        }
      })

      if (!audit) {
        return NextResponse.json({ audit: null })
      }

      return NextResponse.json({
        audit: {
          id: audit.id,
          month: formatDateDDMMYYYY(targetMonth),
          monthDate: targetMonth.toISOString(),
          totalEntries: audit.totalEntries,
          totalMinutes: audit.totalMinutes,
          totalHours: Math.round(audit.totalMinutes / 60 * 10) / 10,
          verifiedEntries: audit.verifiedEntries,
          averageScore: audit.averageScore,
          summary: audit.aiSummary,
          recommendations: audit.aiRecommendations?.split('\n').filter(Boolean) || [],
          verdict: audit.overallVerdict,
          auditedAt: audit.auditedAt.toISOString()
        }
      })
    }

    // Get all audits for last 12 months
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const audits = await prisma.learningAudit.findMany({
      where: {
        userId: user.id,
        month: {
          gte: twelveMonthsAgo
        }
      },
      orderBy: { month: 'desc' }
    })

    return NextResponse.json({
      audits: audits.map(audit => ({
        id: audit.id,
        month: formatDateDDMMYYYY(audit.month),
        monthDate: audit.month.toISOString(),
        totalEntries: audit.totalEntries,
        totalMinutes: audit.totalMinutes,
        totalHours: Math.round(audit.totalMinutes / 60 * 10) / 10,
        verifiedEntries: audit.verifiedEntries,
        averageScore: audit.averageScore,
        verdict: audit.overallVerdict,
        auditedAt: audit.auditedAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Failed to get audits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
