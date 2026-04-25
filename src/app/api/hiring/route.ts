import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const candidateCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  email: z.string().email('Invalid email address').max(200),
  phone: z.string().max(20, 'Phone must be 20 characters or less').optional().nullable(),
  position: z.string().min(1, 'Position is required').max(200),
  department: z.string().min(1, 'Department is required').max(100),
  resumeUrl: z.string().url('Invalid resume URL').max(1000).optional().nullable().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid portfolio URL').max(1000).optional().nullable().or(z.literal('')),
  linkedInUrl: z.string().url('Invalid LinkedIn URL').max(500).optional().nullable().or(z.literal('')),
  source: z.string().max(100).optional().nullable(),
  status: z.enum(['APPLICATION', 'SCREENING', 'INTERVIEW', 'ASSESSMENT', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN']).optional().default('APPLICATION'),
  experience: z.union([
    z.number().int().min(0, 'Experience cannot be negative').max(60, 'Experience seems too high'),
    z.string().refine((val) => { const n = parseInt(val); return !isNaN(n) && n >= 0 && n <= 60; }, { message: 'Experience must be a valid number between 0 and 60' }),
  ]).optional().nullable(),
  notes: z.string().max(2000, 'Notes must be 2000 characters or less').optional().nullable(),
})

export const GET = withAuth(async (req, { user, params }) => {
  try {
// SECURITY FIX: Only HR and Admins can view candidates
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'HR']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Candidate data requires HR access' }, { status: 403 })
    }

    const candidates = await prisma.candidate.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(candidates)
  } catch (error) {
    console.error('Failed to get candidates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = withAuth(async (req, { user, params }) => {
  try {
// SECURITY FIX: Only HR and Admins can add candidates
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'HR']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Adding candidates requires HR access' }, { status: 403 })
    }

    const body = await req.json()
    const result = candidateCreateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const data = result.data

    const candidate = await prisma.candidate.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        position: data.position,
        department: data.department,
        resumeUrl: data.resumeUrl || null,
        portfolioUrl: data.portfolioUrl || null,
        linkedInUrl: data.linkedInUrl || null,
        source: data.source || null,
        status: data.status || 'APPLICATION',
        experience: data.experience ? parseInt(String(data.experience)) : null,
        notes: data.notes || null,
      },
    })

    return NextResponse.json(candidate)
  } catch (error) {
    console.error('Failed to create candidate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
