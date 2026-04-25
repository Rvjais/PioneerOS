import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

// Validation schema for candidate creation
const createCandidateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(20).optional().nullable(),
  position: z.string().min(1).max(200),
  department: z.enum(['WEB', 'SOCIAL', 'ADS', 'SEO', 'HR', 'ACCOUNTS', 'SALES', 'OPERATIONS']),
  source: z.string().optional().nullable(),
  experience: z.number().min(0).max(50).optional().nullable(),
  expectedSalary: z.number().min(0).optional().nullable(),
  noticePeriod: z.number().min(0).max(365).optional().nullable(),
  resumeUrl: z.string().url().optional().nullable().or(z.literal('')),
  portfolioUrl: z.string().url().optional().nullable().or(z.literal('')),
  linkedInUrl: z.string().url().optional().nullable().or(z.literal('')),
  notes: z.string().max(5000).optional().nullable(),
})

// Roles that can manage candidates
const HR_ROLES = ['SUPER_ADMIN', 'MANAGER', 'HR']

export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const department = searchParams.get('department')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (department) where.department = department

    const candidates = await prisma.candidate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedManager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    })

    return NextResponse.json(candidates)
  } catch (error: unknown) {
    console.error('Error fetching candidates:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch candidates'
    return NextResponse.json({ error: message }, { status: 500 })
  }
})

export const POST = withAuth(async (req, { user, params }) => {
  try {
// Check if user has HR permissions
    const userRole = user.role as string
    const userDepartment = user.department as string
    const canManageCandidates = HR_ROLES.includes(userRole) || userDepartment === 'HR'

    if (!canManageCandidates) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const rawData = await req.json()

    // Validate input
    const validation = createCandidateSchema.safeParse(rawData)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors
      }, { status: 400 })
    }

    const data = validation.data

    // Check if candidate with same email already exists
    const existingCandidate = await prisma.candidate.findFirst({
      where: { email: data.email }
    })

    if (existingCandidate) {
      return NextResponse.json({
        error: 'A candidate with this email already exists',
      }, { status: 409 })
    }

    // Create candidate
    const candidate = await prisma.candidate.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        position: data.position,
        department: data.department,
        source: data.source || null,
        experience: data.experience ?? null,
        expectedSalary: data.expectedSalary ?? null,
        noticePeriod: data.noticePeriod ?? null,
        resumeUrl: data.resumeUrl || null,
        portfolioUrl: data.portfolioUrl || null,
        linkedInUrl: data.linkedInUrl || null,
        notes: data.notes || null,
        status: 'APPLICATION',
        currentStage: 'APPLIED',
      }
    })

    return NextResponse.json({
      success: true,
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
      }
    })
  } catch (error: unknown) {
    console.error('Error creating candidate:', error)
    const message = error instanceof Error ? error.message : 'Failed to create candidate'
    return NextResponse.json({ error: message }, { status: 500 })
  }
})
