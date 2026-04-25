import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

// Validation schema for task creation
const TaskSchema = z.object({
  clientId: z.string().nullable().optional(),
  clientName: z.string().nullable().optional(), // Custom client name when not in dropdown
  activityType: z.string().min(1, 'Activity type is required'),
  description: z.string().min(1, 'Description is required'),
  plannedStartTime: z.string().nullable().optional(),
  plannedHours: z.number().positive('Hours must be positive').max(24, 'Hours cannot exceed 24'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  notes: z.string().optional(),
  deadline: z.string().nullable().optional(),
  deliverable: z.string().optional(),
  remarks: z.string().optional(),
  leadId: z.string().nullable().optional(),
  departmentTarget: z.string().optional(),
  employeeTargetId: z.string().optional(),
  candidateTargetId: z.string().optional(),
  accountsTaskType: z.string().optional(),
  complianceType: z.string().optional(),
  paymentReceivedDate: z.string().optional(),
})

const CreateTaskRequestSchema = z.object({
  date: z.string().optional(),
  task: TaskSchema,
  assignToId: z.string().optional(), // For task delegation - creates task in another user's plan
})

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const dateStr = searchParams.get('date')
    // Support viewAs for admins viewing another user's plan
    const viewAsUserId = searchParams.get('viewAsUserId')

    // Admins can view as other users; otherwise use own userId
    const effectiveUserId = viewAsUserId &&
      ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(user.role)
      ? viewAsUserId
      : user.id

    const date = dateStr ? new Date(dateStr) : new Date()
    date.setHours(0, 0, 0, 0)

    const plan = await prisma.dailyTaskPlan.findUnique({
      where: {
        userId_date: {
          userId: effectiveUserId,
          date,
        },
      },
      include: {
        tasks: {
          include: {
            client: { select: { id: true, name: true, tier: true } },
            allocatedBy: { select: { id: true, firstName: true, lastName: true } },
            lead: { select: { id: true, companyName: true, contactName: true, stage: true } },
          },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    })

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Failed to fetch daily plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()

    // Validate request body with Zod
    const parseResult = CreateTaskRequestSchema.safeParse(body)
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]
      return NextResponse.json(
        { error: firstError.message || 'Invalid task data' },
        { status: 400 }
      )
    }

    const { date: dateStr, task, assignToId } = parseResult.data

    // Support viewAs for admins creating tasks in another user's plan
    // Also respect assignToId for task delegation
    const effectiveUserId = assignToId || user.id

    // Get user's department for role-based validation
    const dbUser = await prisma.user.findUnique({
      where: { id: effectiveUserId },
      select: { department: true },
    })

    // Department-based validation for clientId
    if (dbUser?.department === 'HR' && task.clientId) {
      return NextResponse.json(
        { error: 'HR tasks cannot be assigned to clients. Use department target instead.' },
        { status: 400 }
      )
    }

    // ACCOUNTS: CLIENT_INVOICE and CLIENT_PAYMENT require clientId
    if (dbUser?.department === 'ACCOUNTS') {
      const clientRequiredTasks = ['CLIENT_INVOICE', 'CLIENT_PAYMENT']
      if (clientRequiredTasks.includes(task.accountsTaskType || '') && !task.clientId) {
        return NextResponse.json(
          { error: `${task.accountsTaskType} tasks require a client to be selected.` },
          { status: 400 }
        )
      }
    }

    const date = dateStr ? new Date(dateStr) : new Date()
    date.setHours(0, 0, 0, 0)

    // #54 Content capacity validation: check if the user has capacity for more tasks.
    // The User model has a `capacity` field (monthly task capacity, default 50).
    // Warn if over capacity but still allow task creation.
    const userWithCapacity = await prisma.user.findUnique({
      where: { id: effectiveUserId },
      select: { capacity: true, firstName: true },
    })

    const activeTaskCount = await prisma.dailyTask.count({
      where: {
        plan: { userId: effectiveUserId },
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
    })

    let capacityWarning: string | null = null
    if (userWithCapacity?.capacity && activeTaskCount >= userWithCapacity.capacity) {
      capacityWarning = `You currently have ${activeTaskCount} active tasks, which meets or exceeds your capacity of ${userWithCapacity.capacity}. Task will still be created.`
    }

    const isMonday = date.getDay() === 1

    // Get or create the daily plan for the effective user
    let plan = await prisma.dailyTaskPlan.findUnique({
      where: {
        userId_date: {
          userId: effectiveUserId,
          date,
        },
      },
    })

    if (!plan) {
      plan = await prisma.dailyTaskPlan.create({
        data: {
          userId: effectiveUserId,
          date,
          isWeeklyPlan: isMonday,
        },
      })
    }

    // Parse planned start time
    let plannedStartTime: Date | null = null
    if (task.plannedStartTime) {
      const [hours, minutes] = task.plannedStartTime.split(':').map(Number)
      plannedStartTime = new Date(date)
      plannedStartTime.setHours(hours, minutes, 0, 0)
    }

    // Get current task count for sort order
    const taskCount = await prisma.dailyTask.count({
      where: { planId: plan.id },
    })

    // Parse deadline if provided
    // NOTE: Deadlines are not enforced (auto-closed) by design. Tasks may need to
    // remain open past their deadline for tracking and accountability purposes.
    const deadline = task.deadline ? new Date(task.deadline) : null

    // Create the task
    const newTask = await prisma.dailyTask.create({
      data: {
        planId: plan.id,
        clientId: task.clientId || null,
        clientName: task.clientName || null, // Custom client name when not in dropdown
        activityType: task.activityType,
        description: task.description,
        plannedStartTime,
        plannedHours: task.plannedHours || 1,
        priority: task.priority || 'MEDIUM',
        notes: task.notes || null,
        deadline,
        deliverable: task.deliverable || null,
        remarks: task.remarks || null,
        sortOrder: taskCount,
        // Sales: Lead reference
        leadId: task.leadId || null,
        // HR: Department/Employee target
        departmentTarget: task.departmentTarget || null,
        employeeTargetId: task.employeeTargetId || null,
        candidateTargetId: task.candidateTargetId || null,
        // Accounts: Task categorization
        accountsTaskType: task.accountsTaskType || null,
        complianceType: task.complianceType || null,
        paymentReceivedDate: task.paymentReceivedDate ? new Date(task.paymentReceivedDate) : null,
      },
      include: {
        client: { select: { id: true, name: true, tier: true } },
        allocatedBy: { select: { id: true, firstName: true, lastName: true } },
        lead: { select: { id: true, companyName: true, contactName: true } },
      },
    })

    // Update total planned hours
    await prisma.dailyTaskPlan.update({
      where: { id: plan.id },
      data: {
        totalPlannedHours: {
          increment: task.plannedHours || 1,
        },
      },
    })

    // Return updated plan
    const updatedPlan = await prisma.dailyTaskPlan.findUnique({
      where: { id: plan.id },
      include: {
        tasks: {
          include: {
            client: { select: { id: true, name: true, tier: true } },
            allocatedBy: { select: { id: true, firstName: true, lastName: true } },
            lead: { select: { id: true, companyName: true, contactName: true, stage: true } },
          },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    })

    return NextResponse.json({
      plan: updatedPlan,
      task: newTask,
      ...(capacityWarning ? { capacityWarning } : {}),
    })
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
