import { prisma } from '@/server/db/prisma'

interface ChecklistItem {
  exitProcessId: string
  category: string
  item: string
  responsibleRole: string
  status: string
  isCompleted: boolean
}

const EXIT_CHECKLIST_TEMPLATE: Omit<ChecklistItem, 'exitProcessId'>[] = [
  // HR Category
  { category: 'HR', item: 'Collect resignation letter', responsibleRole: 'HR', status: 'PENDING', isCompleted: false },
  { category: 'HR', item: 'Update employee status to INACTIVE', responsibleRole: 'HR', status: 'PENDING', isCompleted: false },
  { category: 'HR', item: 'Calculate leave encashment', responsibleRole: 'HR', status: 'PENDING', isCompleted: false },
  { category: 'HR', item: 'Initiate F&F settlement', responsibleRole: 'HR', status: 'PENDING', isCompleted: false },
  { category: 'HR', item: 'Generate experience letter', responsibleRole: 'HR', status: 'PENDING', isCompleted: false },
  { category: 'HR', item: 'Generate relieving letter', responsibleRole: 'HR', status: 'PENDING', isCompleted: false },
  { category: 'HR', item: 'Conduct exit interview', responsibleRole: 'HR', status: 'PENDING', isCompleted: false },
  { category: 'HR', item: 'Update records in system', responsibleRole: 'HR', status: 'PENDING', isCompleted: false },

  // IT/ACCESS Category
  { category: 'IT_ACCESS', item: 'Revoke email access', responsibleRole: 'IT', status: 'PENDING', isCompleted: false },
  { category: 'IT_ACCESS', item: 'Revoke Pioneer OS access', responsibleRole: 'IT', status: 'PENDING', isCompleted: false },
  { category: 'IT_ACCESS', item: 'Revoke Google Workspace access', responsibleRole: 'IT', status: 'PENDING', isCompleted: false },
  { category: 'IT_ACCESS', item: 'Revoke social media access', responsibleRole: 'IT', status: 'PENDING', isCompleted: false },
  { category: 'IT_ACCESS', item: 'Remove from WhatsApp groups', responsibleRole: 'IT', status: 'PENDING', isCompleted: false },
  { category: 'IT_ACCESS', item: 'Collect laptop/devices', responsibleRole: 'IT', status: 'PENDING', isCompleted: false },

  // DEPARTMENT Category
  { category: 'DEPARTMENT', item: 'Knowledge transfer documentation', responsibleRole: 'MANAGER', status: 'PENDING', isCompleted: false },
  { category: 'DEPARTMENT', item: 'Handover client accounts', responsibleRole: 'MANAGER', status: 'PENDING', isCompleted: false },
  { category: 'DEPARTMENT', item: 'Update client team assignments', responsibleRole: 'MANAGER', status: 'PENDING', isCompleted: false },
  { category: 'DEPARTMENT', item: 'Transfer ongoing tasks', responsibleRole: 'MANAGER', status: 'PENDING', isCompleted: false },
  { category: 'DEPARTMENT', item: 'Share passwords/credentials', responsibleRole: 'MANAGER', status: 'PENDING', isCompleted: false },

  // FINANCE Category
  { category: 'FINANCE', item: 'Clear pending reimbursements', responsibleRole: 'FINANCE', status: 'PENDING', isCompleted: false },
  { category: 'FINANCE', item: 'Recover salary advance (if any)', responsibleRole: 'FINANCE', status: 'PENDING', isCompleted: false },
  { category: 'FINANCE', item: 'Process final salary', responsibleRole: 'FINANCE', status: 'PENDING', isCompleted: false },
  { category: 'FINANCE', item: 'Issue Form 16', responsibleRole: 'FINANCE', status: 'PENDING', isCompleted: false },
]

/**
 * Generates exit checklist items for a given exit process.
 * Creates all standard checklist items across HR, IT/Access, Department, and Finance categories.
 */
export async function generateExitChecklist(
  exitProcessId: string,
  userId: string,
  department: string
) {
  // Use transaction to prevent race condition (duplicate checklists)
  return await prisma.$transaction(async (tx) => {
    // Check if checklist already exists
    const existing = await tx.exitChecklist.findFirst({
      where: { exitProcessId },
    })

    if (existing) {
      throw new Error('Checklist already exists for this exit process')
    }

    // Create all checklist items
    const checklistData = EXIT_CHECKLIST_TEMPLATE.map((item) => ({
      exitProcessId,
      category: item.category,
      item: item.item,
      responsibleRole: item.responsibleRole,
      status: 'PENDING',
      isCompleted: false,
    }))

    await tx.exitChecklist.createMany({
      data: checklistData,
    })

    // Return the created checklist
    const checklist = await tx.exitChecklist.findMany({
      where: { exitProcessId },
      orderBy: { category: 'asc' },
    })

    return checklist
  })
}

/**
 * Checks if all checklist items are completed and auto-advances exit process status.
 * When all items are COMPLETED, advances the exit process to CLEARANCE status.
 */
export async function checkAndAdvanceExitStatus(exitProcessId: string) {
  return await prisma.$transaction(async (tx) => {
    const checklist = await tx.exitChecklist.findMany({
      where: { exitProcessId },
    })

    if (checklist.length === 0) return null

    const allCompleted = checklist.every((item) => item.status === 'COMPLETED')

    if (allCompleted) {
      // Get exit process with user info for deactivation
      const exitProcess = await tx.exitProcess.findUnique({
        where: { id: exitProcessId },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
      })

      if (!exitProcess) return null

      // Update exit to COMPLETED
      const updated = await tx.exitProcess.update({
        where: { id: exitProcessId },
        data: { status: 'COMPLETED' },
      })

      // Deactivate the user account
      await tx.user.update({
        where: { id: exitProcess.userId },
        data: {
          status: 'INACTIVE',
          deactivatedAt: new Date(),
        },
      }).catch(() => { /* user may already be deactivated */ })

      // Cancel all active HR pipeline tasks for the exiting employee
      await tx.hRPipelineTask.updateMany({
        where: {
          userId: exitProcess.userId,
          status: { in: ['PLANNED', 'IN_PROGRESS', 'BLOCKED'] },
        },
        data: {
          status: 'CANCELLED',
          notes: 'Auto-cancelled: Employee has exited the organization',
        },
      })

      // Notify HR
      const hrUsers = await tx.user.findMany({
        where: { OR: [{ role: 'HR' }, { role: 'SUPER_ADMIN' }], status: 'ACTIVE', deletedAt: null },
        select: { id: true },
      })

      if (hrUsers.length > 0) {
        await tx.notification.createMany({
          data: hrUsers.map(hr => ({
            userId: hr.id,
            type: 'EXIT_COMPLETED',
            title: 'Exit Process Auto-Completed',
            message: `Exit checklist completed for ${exitProcess.user.firstName} ${exitProcess.user.lastName || ''}. Account has been deactivated. ${exitProcess.userId ? ' Active tasks have been cancelled.' : ''}`,
            link: '/hr/exit',
            priority: 'HIGH',
          })),
        })
      }

      return updated
    }

    // If at least one item is in progress, ensure status is IN_PROGRESS
    const hasInProgress = checklist.some(
      (item) => item.status === 'IN_PROGRESS' || item.status === 'COMPLETED'
    )

    if (hasInProgress) {
      const exitProcess = await tx.exitProcess.findUnique({
        where: { id: exitProcessId },
      })

      if (exitProcess && exitProcess.status === 'INITIATED') {
        await tx.exitProcess.update({
          where: { id: exitProcessId },
          data: { status: 'IN_PROGRESS' },
        })
      }
    }

    return null
  })
}

/**
 * Creates notifications for HR, Manager, and IT when an exit process is initiated.
 */
export async function createExitNotifications(
  exitProcessId: string,
  employeeName: string,
  department: string
) {
  try {
    // Find HR users, managers, and IT users to notify
    const usersToNotify = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        role: { in: ['HR', 'MANAGER', 'SUPER_ADMIN'] },
      },
      select: { id: true, role: true },
    })

    const notifications = usersToNotify.map((user) => ({
      userId: user.id,
      type: 'GENERAL',
      title: 'Exit Process Initiated',
      message: `Exit process has been initiated for ${employeeName} (${department}). Please review and complete your assigned checklist items.`,
      link: '/hr/exit',
      priority: 'HIGH',
    }))

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      })
    }
  } catch (error) {
    console.error(`Failed to create exit notifications for ${employeeName}:`, error)
    // Don't throw - notification failure shouldn't block the exit process
  }
}

export const CHECKLIST_CATEGORIES: Record<string, { label: string; iconType: string }> = {
  HR: { label: 'HR Documentation', iconType: 'clipboard' },
  IT_ACCESS: { label: 'IT & Access', iconType: 'lock' },
  DEPARTMENT: { label: 'Department Handover', iconType: 'book' },
  FINANCE: { label: 'Finance Clearance', iconType: 'currency' },
}
