import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// Activity type to KPI field mapping for auto-population
const ACTIVITY_TO_KPI_MAP: Record<string, string> = {
  // Design activities
  'STATIC_POST': 'staticPosts',
  'static_post': 'staticPosts',
  'CAROUSEL': 'carousels',
  'carousel_design': 'carousels',
  'STORY': 'stories',
  'story_design': 'stories',
  'REEL': 'reels',
  'reel_editing': 'reels',
  'THUMBNAIL': 'thumbnails',
  'BANNER': 'banners',
  'banner_ad': 'banners',
  'REVISION': 'revisions',
  'graphic_revision': 'revisions',
  // Video editing activities
  'REEL_EDITING': 'reelsEdited',
  'YOUTUBE_VIDEO': 'youtubeVideos',
  'youtube_video': 'youtubeVideos',
  'SHORTS': 'youtubeShorts',
  'youtube_shorts': 'youtubeShorts',
  'MOTION_GRAPHICS': 'motionGraphics',
  'motion_graphics': 'motionGraphics',
  'GIF': 'gifs',
  'gif_creation': 'gifs',
  'ANIMATION': 'animations',
  'video_revision': 'videoRevisions',
  'VIDEO_REVISION': 'videoRevisions',
}

// Get the month range for a given date
function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || user.id
    const month = searchParams.get('month') // Format: YYYY-MM
    const department = searchParams.get('department')

    // Security: Only allow querying for self unless SUPER_ADMIN/MANAGER
    const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(user.role)
    if (userId !== user.id && !isManager) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Parse month or use previous month (reporting month)
    let targetDate: Date
    if (month) {
      const [year, monthNum] = month.split('-').map(Number)
      targetDate = new Date(year, monthNum - 1, 1)
    } else {
      // Default to previous month (reporting month for tactical)
      const now = new Date()
      targetDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    }

    const { start, end } = getMonthRange(targetDate)

    // Get user's department if not provided
    let userDept = department
    if (!userDept) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { department: true },
      })
      userDept = user?.department || ''
    }

    // Fetch completed daily tasks for the user in the given month
    // DailyTask is nested under DailyTaskPlan, so we query through plan
    const tasks = await prisma.dailyTask.findMany({
      where: {
        plan: {
          userId,
          date: {
            gte: start,
            lte: end,
          },
        },
        status: 'COMPLETED',
      },
      select: {
        activityType: true,
        actualHours: true,
        clientId: true,
        client: {
          select: { id: true, name: true },
        },
      },
    })

    // Aggregate tasks by activity type
    const aggregatedKpis: Record<string, number> = {}
    const clientBreakdown: Record<string, Record<string, number>> = {}

    for (const task of tasks) {
      const kpiField = ACTIVITY_TO_KPI_MAP[task.activityType]
      if (kpiField) {
        // Each task counts as 1 deliverable
        aggregatedKpis[kpiField] = (aggregatedKpis[kpiField] || 0) + 1

        // Track by client
        if (task.clientId && task.client) {
          if (!clientBreakdown[task.clientId]) {
            clientBreakdown[task.clientId] = {}
          }
          clientBreakdown[task.clientId][kpiField] =
            (clientBreakdown[task.clientId][kpiField] || 0) + 1
        }
      }
    }

    // Calculate totals
    if (userDept === 'DESIGN' || userDept === 'GRAPHIC_DESIGNER') {
      aggregatedKpis.totalDeliverables =
        (aggregatedKpis.staticPosts || 0) +
        (aggregatedKpis.carousels || 0) +
        (aggregatedKpis.stories || 0) +
        (aggregatedKpis.reels || 0) +
        (aggregatedKpis.thumbnails || 0) +
        (aggregatedKpis.banners || 0)
    }

    if (userDept === 'VIDEO_EDITING' || userDept === 'VIDEO_EDITOR') {
      aggregatedKpis.totalVideos =
        (aggregatedKpis.reelsEdited || 0) +
        (aggregatedKpis.youtubeVideos || 0) +
        (aggregatedKpis.youtubeShorts || 0) +
        (aggregatedKpis.motionGraphics || 0) +
        (aggregatedKpis.gifs || 0) +
        (aggregatedKpis.animations || 0)
    }

    // Get previous month data for comparison
    const prevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, 1)
    const { start: prevStart, end: prevEnd } = getMonthRange(prevMonth)

    const prevTasks = await prisma.dailyTask.findMany({
      where: {
        plan: {
          userId,
          date: {
            gte: prevStart,
            lte: prevEnd,
          },
        },
        status: 'COMPLETED',
      },
      select: {
        activityType: true,
      },
    })

    const prevAggregated: Record<string, number> = {}
    for (const task of prevTasks) {
      const kpiField = ACTIVITY_TO_KPI_MAP[task.activityType]
      if (kpiField) {
        prevAggregated[kpiField] = (prevAggregated[kpiField] || 0) + 1
      }
    }

    // Calculate previous totals
    if (userDept === 'DESIGN' || userDept === 'GRAPHIC_DESIGNER') {
      prevAggregated.totalDeliverables =
        (prevAggregated.staticPosts || 0) +
        (prevAggregated.carousels || 0) +
        (prevAggregated.stories || 0) +
        (prevAggregated.reels || 0) +
        (prevAggregated.thumbnails || 0) +
        (prevAggregated.banners || 0)
    }

    if (userDept === 'VIDEO_EDITING' || userDept === 'VIDEO_EDITOR') {
      prevAggregated.totalVideos =
        (prevAggregated.reelsEdited || 0) +
        (prevAggregated.youtubeVideos || 0) +
        (prevAggregated.youtubeShorts || 0) +
        (prevAggregated.motionGraphics || 0) +
        (prevAggregated.gifs || 0) +
        (prevAggregated.animations || 0)
    }

    return NextResponse.json({
      month: targetDate.toISOString(),
      department: userDept,
      kpis: aggregatedKpis,
      previousMonth: prevAggregated,
      clientBreakdown,
      tasksCount: tasks.length,
      autoPopulated: true,
    })
  } catch (error) {
    console.error('Failed to auto-populate tactical KPIs:', error)
    return NextResponse.json(
      { error: 'Failed to auto-populate KPIs' },
      { status: 500 }
    )
  }
})
