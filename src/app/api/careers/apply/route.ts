import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { checkRateLimit } from '@/server/security/rateLimit'
import { z } from 'zod'

const CareerApplicationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters').max(15, 'Phone must be 15 characters or less').optional(),
  position: z.string().min(1, 'Position is required').max(100, 'Position must be 100 characters or less'),
  department: z.string().min(1, 'Department is required').max(100),
  resumeUrl: z.string().url().max(500).optional().nullable(),
  portfolio: z.string().url().max(500).optional().nullable(),
  linkedIn: z.string().url().max(500).optional().nullable(),
  source: z.enum(['linkedin', 'naukri', 'indeed', 'referral', 'website', 'social', 'other']).optional(),
  referredBy: z.string().max(100).optional().nullable(),
  totalExperience: z.string().max(10).optional(),
  experienceLevel: z.enum(['fresher', 'junior', 'mid', 'senior', 'lead']).optional(),
  noticePeriod: z.enum(['immediate', '15_days', '30_days', '60_days', '90_days']).optional(),
  expectedSalary: z.string().max(50).optional(),
  city: z.string().max(100).optional(),
  employmentType: z.string().max(50).optional(),
  currentCompany: z.string().max(100).optional(),
  currentRole: z.string().max(100).optional(),
  currentSalary: z.string().max(50).optional(),
  skills: z.union([z.string().max(1000), z.array(z.string().max(100))]).optional(),
  whyJoin: z.string().max(2000).optional(),
  coverLetter: z.string().max(5000).optional(),
  availability: z.string().max(200).optional(),
})

export async function POST(req: NextRequest) {
  try {
    // SECURITY FIX: Rate limiting - 5 applications per hour per IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
               req.headers.get('x-real-ip') ||
               'unknown'

    const rateLimit = await checkRateLimit(`careers:${ip}`, {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000, // 1 hour
    })

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many applications. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfter || 3600) }
        }
      )
    }

    const rawBody = await req.json()
    const parseResult = CareerApplicationSchema.safeParse(rawBody)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const data = parseResult.data

    // Map source values to database format
    const sourceMap: Record<string, string> = {
      'linkedin': 'LINKEDIN',
      'naukri': 'NAUKRI',
      'indeed': 'INDEED',
      'referral': 'REFERRAL',
      'website': 'CAREERS_PAGE',
      'social': 'SOCIAL_MEDIA',
      'other': 'DIRECT',
    }

    // Parse experience years
    const experienceYears = parseFloat(data.totalExperience ?? '') ||
      (data.experienceLevel === 'fresher' ? 0 :
       data.experienceLevel === 'junior' ? 1 :
       data.experienceLevel === 'mid' ? 3 :
       data.experienceLevel === 'senior' ? 5 : 7)

    // Parse notice period to days
    const noticePeriodDays =
      data.noticePeriod === 'immediate' ? 0 :
      data.noticePeriod === '15_days' ? 15 :
      data.noticePeriod === '30_days' ? 30 :
      data.noticePeriod === '60_days' ? 60 :
      data.noticePeriod === '90_days' ? 90 : 30

    // Parse salary (extract number from string like "5 LPA" or "50000")
    const parseSalary = (salary: string): number | null => {
      if (!salary) return null
      const cleaned = salary.replace(/[^0-9.]/g, '')
      const num = parseFloat(cleaned)
      if (isNaN(num)) return null
      // If it's likely LPA (small number), convert to annual
      return num < 100 ? num * 100000 : num * 12 // Assume monthly if > 100
    }

    // Create the candidate
    const candidate = await prisma.candidate.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        position: data.position,
        department: data.department,
        resumeUrl: data.resumeUrl || null,
        portfolioUrl: data.portfolio || null,
        linkedInUrl: data.linkedIn || null,
        source: sourceMap[data.source ?? ''] || 'CAREERS_PAGE',
        referredBy: data.referredBy || null,
        status: 'APPLICATION',
        currentStage: 'APPLIED',
        experience: experienceYears,
        noticePeriod: noticePeriodDays,
        expectedSalary: parseSalary(data.expectedSalary ?? ''),
        notes: JSON.stringify({
          city: data.city,
          employmentType: data.employmentType,
          experienceLevel: data.experienceLevel,
          currentCompany: data.currentCompany,
          currentRole: data.currentRole,
          currentSalary: data.currentSalary,
          skills: data.skills,
          whyJoin: data.whyJoin,
          coverLetter: data.coverLetter,
          availability: data.availability,
          submittedAt: new Date().toISOString(),
          formVersion: 'v3',
        }),
      }
    })

    // Create notification for HR
    const hrUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'HR' },
          { department: 'HR' },
          { role: 'SUPER_ADMIN' },
        ],
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true }
    })

    if (hrUsers.length > 0) {
      await prisma.notification.createMany({
        data: hrUsers.map(user => ({
          userId: user.id,
          type: 'NEW_APPLICATION',
          title: 'New Job Application',
          message: `${data.name} applied for ${data.position.replace(/_/g, ' ')} (${data.department})`,
          link: `/hiring`,
        }))
      })
    }

    return NextResponse.json({
      success: true,
      applicationId: candidate.id,
      message: 'Application submitted successfully'
    })
  } catch (error) {
    console.error('Career application error:', error)
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    )
  }
}
