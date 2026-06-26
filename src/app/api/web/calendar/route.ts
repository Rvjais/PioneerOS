/**
 * Web Calendar API - Aggregates events from tasks, meetings, and web projects
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'

export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const month = parseInt(searchParams.get('month') || new Date().getMonth().toString())
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    // Calculate date range for the month
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59)

    // Fetch events from multiple sources in parallel
    const allResults = await Promise.all([
      // Tasks with deadlines in web/development departments
      prisma.task.findMany({
        where: {
          dueDate: {
            gte: startDate,
            lte: endDate,
          },
          department: { in: ['WEB', 'DEVELOPMENT', 'DESIGN'] },
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          department: true,
          client: { select: { name: true } },
          assignee: { select: { firstName: true, lastName: true } },
        },
      }),

      // Meetings for web team
      prisma.meeting.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          title: true,
          date: true,
        },
      }),

      // Web project milestones
      prisma.webProject.findMany({
        where: {
          status: { in: ['IN_PROGRESS', 'PIPELINE'] },
          OR: [
            { startDate: { lte: endDate, gte: startDate } },
            { dueDate: { lte: endDate, gte: startDate } },
          ],
        },
        select: {
          id: true,
          name: true,
          startDate: true,
          dueDate: true,
          client: { select: { name: true } },
        },
      }),
    ])

    const tasks: any[] = allResults[0]
    const meetings: any[] = allResults[1]
    const webProjects: any[] = allResults[2]

    // Transform and combine events
    const events: Array<{
      id: string
      title: string
      type: string
      date: string
      time?: string
      projectName?: string
      assigneeName?: string
    }> = []

    // Add task events (deadlines)
    tasks.forEach((task: any) => {
      if (task.dueDate) {
        events.push({
          id: `task-${task.id}`,
          title: task.title,
          type: 'DEADLINE',
          date: task.dueDate.toISOString().split('T')[0],
          projectName: task.client?.name,
          assigneeName: task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName || ''}`.trim() : undefined,
        })
      }
    })

    // Add meeting events
    meetings.forEach((meeting: any) => {
      events.push({
        id: `meeting-${meeting.id}`,
        title: meeting.title,
        type: 'MEETING',
        date: meeting.date.toISOString().split('T')[0],
        time: meeting.date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      })
    })

    // Add project start/end dates
    webProjects.forEach((project: any) => {
      if (project.startDate) {
        events.push({
          id: `project-start-${project.id}`,
          title: `Project Start: ${project.name}`,
          type: 'DEVELOPMENT',
          date: new Date(project.startDate).toISOString().split('T')[0],
          projectName: project.client?.name,
        })
      }
      if (project.dueDate) {
        events.push({
          id: `project-due-${project.id}`,
          title: `Project Due: ${project.name}`,
          type: 'DEADLINE',
          date: new Date(project.dueDate).toISOString().split('T')[0],
          projectName: project.client?.name,
        })
      }
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Failed to fetch web calendar events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
})