import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const customTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  category: z.string().min(1).max(50),
  responsibleRole: z.string().min(1).max(50),
  dueHours: z.number().int().min(1).max(168),
  assignedTo: z.string().optional(),
})

const createDay0Schema = z.object({
  userId: z.string().min(1, 'userId is required'),
  useTemplates: z.boolean().default(true),
  customTasks: z.array(customTaskSchema).default([]),
})

// Default Day 0 task templates
const DAY0_TEMPLATES = [
  // HR Tasks
  { title: 'Complete employee documentation', description: 'Collect ID proof, PAN, Aadhaar, bank details', category: 'HR', responsibleRole: 'HR', dueHours: 2 },
  { title: 'HR orientation session', description: 'Cover policies, leave rules, attendance, working hours', category: 'HR', responsibleRole: 'HR', dueHours: 4 },
  { title: 'NDA signing', description: 'Get NDA signed and filed', category: 'HR', responsibleRole: 'HR', dueHours: 2 },
  { title: 'Biometric registration', description: 'Register fingerprint for attendance', category: 'HR', responsibleRole: 'HR', dueHours: 1 },

  // IT Tasks
  { title: 'Create email account', description: 'Setup company email with standard signature', category: 'IT', responsibleRole: 'IT_ADMIN', dueHours: 1 },
  { title: 'Slack workspace invite', description: 'Add to relevant channels', category: 'IT', responsibleRole: 'IT_ADMIN', dueHours: 1 },
  { title: 'System access setup', description: 'Create accounts for required systems', category: 'IT', responsibleRole: 'IT_ADMIN', dueHours: 2 },
  { title: 'Device allocation', description: 'Assign laptop/desktop with necessary software', category: 'IT', responsibleRole: 'IT_ADMIN', dueHours: 2 },

  // Department Tasks
  { title: 'Team introduction', description: 'Introduce to team members and key stakeholders', category: 'DEPARTMENT', responsibleRole: 'MANAGER', dueHours: 2 },
  { title: 'Department orientation', description: 'Overview of department processes and tools', category: 'DEPARTMENT', responsibleRole: 'MANAGER', dueHours: 4 },
  { title: 'First task assignment', description: 'Assign initial task with clear expectations', category: 'DEPARTMENT', responsibleRole: 'MANAGER', dueHours: 6 },

  // Buddy Tasks
  { title: 'Buddy introduction', description: 'Meet assigned buddy, exchange contact info', category: 'BUDDY', responsibleRole: 'BUDDY', dueHours: 1 },
  { title: 'Office tour', description: 'Show around office, facilities, lunch area', category: 'BUDDY', responsibleRole: 'BUDDY', dueHours: 1 },
  { title: 'Team lunch', description: 'First lunch with team', category: 'BUDDY', responsibleRole: 'BUDDY', dueHours: 4 },
]

// GET: Fetch Day 0 tasks for a user or templates
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const templates = searchParams.get('templates') === 'true'

    if (templates) {
      // Return task templates
      const dbTemplates = await prisma.day0Task.findMany({
        where: { isTemplate: true },
        orderBy: [
          { category: 'asc' },
          { dueHours: 'asc' }
        ]
      })

      // If no templates in DB, return defaults
      if (dbTemplates.length === 0) {
        return NextResponse.json({ templates: DAY0_TEMPLATES })
      }

      return NextResponse.json({ templates: dbTemplates })
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Authorization: only HR, MANAGER, SUPER_ADMIN, or the user themselves can view tasks
    if (userId !== user.id) {
      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true, department: true }
      })
      const isAuthorized = currentUser &&
        (['SUPER_ADMIN', 'HR', 'MANAGER'].includes(currentUser.role ?? '') || currentUser.department === 'HR')
      if (!isAuthorized) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Get tasks for specific user
    const tasks = await prisma.day0Task.findMany({
      where: { userId },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { dueHours: 'asc' }
      ]
    })

    // Calculate progress
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'COMPLETED').length
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0

    // Group by category
    const byCategory = tasks.reduce((acc, task) => {
      if (!acc[task.category]) acc[task.category] = []
      acc[task.category].push(task)
      return acc
    }, {} as Record<string, typeof tasks>)

    return NextResponse.json({ tasks, progress, byCategory, total, completed })
  } catch (error) {
    console.error('Error fetching Day 0 tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
})

// POST: Create Day 0 tasks for a new employee
export const POST = withAuth(async (req, { user }) => {
  try {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only HR, MANAGER, or SUPER_ADMIN can create Day 0 tasks
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, department: true }
    })

    const isAuthorized = currentUser &&
      (['SUPER_ADMIN', 'HR', 'MANAGER'].includes(currentUser.role ?? '') || currentUser.department === 'HR')

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = createDay0Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { userId, useTemplates, customTasks } = parsed.data

    // Check if tasks already exist for this user
    const existing = await prisma.day0Task.findMany({
      where: { userId }
    })

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Day 0 tasks already exist for this user' }, { status: 400 })
    }

    // Get the new employee's details
    const employee = await prisma.user.findUnique({
      where: { id: userId },
      select: { department: true, buddyId: true }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Get potential assignees
    const assignees = await prisma.user.findMany({
      where: {
        OR: [
          { department: 'HR', role: { in: ['HR', 'MANAGER', 'SUPER_ADMIN'] } },
          { department: employee.department, role: 'MANAGER' },
          { id: employee.buddyId || '' }
        ],
        deletedAt: null,
      },
      select: { id: true, role: true, department: true }
    })

    const hrUser = assignees.find(a => a.department === 'HR')
    const manager = assignees.find(a => a.department === employee.department && a.role === 'MANAGER')
    const buddy = employee.buddyId ? assignees.find(a => a.id === employee.buddyId) : null

    // Create tasks
    const tasksToCreate: Array<{
      title: string
      description: string
      category: string
      responsibleRole: string
      dueHours: number
      userId: string
      assignedTo: string | null
      status: string
    }> = []

    if (useTemplates) {
      for (const template of DAY0_TEMPLATES) {
        let assignedTo: string | null = null

        if (template.responsibleRole === 'HR') assignedTo = hrUser?.id || null
        else if (template.responsibleRole === 'MANAGER') assignedTo = manager?.id || null
        else if (template.responsibleRole === 'BUDDY') assignedTo = buddy?.id || null
        else if (template.responsibleRole === 'IT_ADMIN') assignedTo = hrUser?.id || null // IT tasks assigned to HR for now

        tasksToCreate.push({
          title: template.title,
          description: template.description,
          category: template.category,
          responsibleRole: template.responsibleRole,
          dueHours: template.dueHours,
          userId,
          assignedTo,
          status: 'PENDING'
        })
      }
    }

    // Add custom tasks (already validated by Zod schema)
    for (const task of customTasks) {
      tasksToCreate.push({
        title: task.title,
        description: task.description,
        category: task.category,
        responsibleRole: task.responsibleRole,
        dueHours: task.dueHours,
        userId,
        assignedTo: task.assignedTo || null,
        status: 'PENDING'
      })
    }

    // Create all tasks
    await prisma.day0Task.createMany({
      data: tasksToCreate
    })

    // Fetch created tasks
    const tasks = await prisma.day0Task.findMany({
      where: { userId },
      include: {
        assignee: true
      }
    })

    // Notify assignees
    const assigneeIds = [...new Set(tasks.map(t => t.assignedTo).filter(Boolean))]
    for (const assigneeId of assigneeIds) {
      if (!assigneeId) continue
      const assigneeTasks = tasks.filter(t => t.assignedTo === assigneeId)

      await prisma.notification.create({
        data: {
          userId: assigneeId,
          type: 'DAY0_TASK',
          title: 'New Employee Onboarding Tasks',
          message: `You have ${assigneeTasks.length} Day 0 tasks assigned for a new employee.`,
          link: `/hr/onboarding/${userId}`
        }
      })
    }

    return NextResponse.json({ tasks, message: `Created ${tasks.length} Day 0 tasks` })
  } catch (error) {
    console.error('Error creating Day 0 tasks:', error)
    return NextResponse.json({ error: 'Failed to create tasks' }, { status: 500 })
  }
})
