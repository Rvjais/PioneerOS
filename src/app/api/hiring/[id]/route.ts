import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const updateCandidateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  position: z.string().max(200).optional(),
  department: z.string().max(100).optional(),
  resumeUrl: z.string().url().or(z.literal('')).optional(),
  portfolioUrl: z.string().url().or(z.literal('')).optional(),
  linkedInUrl: z.string().url().or(z.literal('')).optional(),
  source: z.string().max(200).optional(),
  status: z.string().max(50).optional(),
  currentStage: z.string().max(50).optional(),
  experience: z.union([z.string(), z.number()]).optional().nullable(),
  notes: z.string().max(5000).optional(),
  testTaskScore: z.union([z.string(), z.number()]).optional().nullable(),
  interviewFeedback: z.string().max(5000).optional(),
})

export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!
    const candidate = await prisma.candidate.findUnique({
      where: { id },
    })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    return NextResponse.json(candidate)
  } catch (error) {
    console.error('Failed to get candidate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!
    const body = await req.json()
    const parsed = updateCandidateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const validatedData = parsed.data

    // Build update data from provided fields
    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'name',
      'email',
      'phone',
      'position',
      'department',
      'resumeUrl',
      'portfolioUrl',
      'linkedInUrl',
      'source',
      'status',
      'currentStage',
      'experience',
      'notes',
      'testTaskScore',
      'interviewFeedback',
    ] as const

    for (const field of allowedFields) {
      if (validatedData[field] !== undefined) {
        if (field === 'experience' && validatedData[field] !== null) {
          updateData[field] = parseInt(String(validatedData[field]))
        } else if (field === 'testTaskScore' && validatedData[field] !== null) {
          updateData[field] = parseFloat(String(validatedData[field]))
        } else {
          updateData[field] = validatedData[field]
        }
      }
    }

    const candidate = await prisma.candidate.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(candidate)
  } catch (error) {
    console.error('Failed to update candidate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // Check if user is HR or admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, department: true },
    })

    const canDelete = dbUser?.role === 'SUPER_ADMIN' || dbUser?.role === 'MANAGER' || dbUser?.department === 'HR'
    if (!canDelete) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = await routeParams!

    await prisma.candidate.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete candidate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
