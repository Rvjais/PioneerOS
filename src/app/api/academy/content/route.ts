import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const updateProgressSchema = z.object({
  trainingId: z.string().min(1, 'Training ID is required'),
  progress: z.number().min(0).max(100).optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional(),
})

export const GET = withAuth(async (req, { user, params }) => {
  try {
// Fetch all trainings with user's progress
    const trainings = await prisma.training.findMany({
      include: {
        userTrainings: {
          where: {
            userId: user.id,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform trainings into academy content format
    const content = trainings.map(training => {
      const userProgress = training.userTrainings[0]
      return {
        id: training.id,
        title: training.title,
        description: training.description || '',
        contentType: mapTrainingType(training.type),
        category: mapDepartmentToCategory(training.department),
        estimatedMinutes: (training.duration || 1) * 60,
        mandatory: training.isRequired,
        isKtContent: false,
        tags: training.department ? [training.department.toLowerCase()] : [],
        completedByUser: userProgress?.status === 'COMPLETED',
        progress: userProgress?.progress || 0,
      }
    })

    // Group content by category
    const contentByCategory: Record<string, { items: typeof content }> = {
      day0: { items: [] },
      toolMastery: { items: [] },
      deptSops: { items: [] },
      compliance: { items: [] },
      kt: { items: [] },
    }

    content.forEach(item => {
      const category = item.category || 'deptSops'
      if (contentByCategory[category]) {
        contentByCategory[category].items.push(item)
      } else {
        contentByCategory.deptSops.items.push(item)
      }
    })

    // Calculate stats
    const allItems = content
    const completedCount = allItems.filter(i => i.completedByUser).length
    const mandatoryCount = allItems.filter(i => i.mandatory).length
    const completedMandatory = allItems.filter(i => i.mandatory && i.completedByUser).length
    const totalMinutes = allItems.filter(i => i.completedByUser).reduce((sum, i) => sum + i.estimatedMinutes, 0)

    return NextResponse.json({
      content: contentByCategory,
      stats: {
        total: allItems.length,
        completed: completedCount,
        mandatory: mandatoryCount,
        completedMandatory,
        totalMinutes,
      },
    })
  } catch (error) {
    console.error('Failed to fetch academy content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

function mapTrainingType(type: string): string {
  switch (type) {
    case 'COURSE':
      return 'interactive'
    case 'WORKSHOP':
      return 'video'
    case 'CERTIFICATION':
      return 'document'
    default:
      return 'video'
  }
}

function mapDepartmentToCategory(department: string | null): string {
  if (!department) return 'deptSops'

  const dept = department.toUpperCase()
  if (dept === 'ONBOARDING' || dept === 'HR') return 'day0'
  if (dept === 'COMPLIANCE' || dept === 'LEGAL') return 'compliance'
  if (dept === 'KT' || dept === 'KNOWLEDGE') return 'kt'
  return 'deptSops'
}

export const POST = withAuth(async (req, { user, params }) => {
  try {
const data = await req.json()
    const parsed = updateProgressSchema.safeParse(data)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const { trainingId, progress, status } = parsed.data

    // Upsert user training progress
    const userTraining = await prisma.userTraining.upsert({
      where: {
        userId_trainingId: {
          userId: user.id,
          trainingId,
        },
      },
      update: {
        progress: progress || 0,
        status: status || (progress === 100 ? 'COMPLETED' : 'IN_PROGRESS'),
        completedAt: progress === 100 ? new Date() : null,
      },
      create: {
        userId: user.id,
        trainingId,
        progress: progress || 0,
        status: status || 'IN_PROGRESS',
        startedAt: new Date(),
        completedAt: progress === 100 ? new Date() : null,
      },
    })

    return NextResponse.json({ userTraining })
  } catch (error) {
    console.error('Failed to update training progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
