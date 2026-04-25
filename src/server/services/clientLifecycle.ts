import { prisma } from '@/server/db/prisma'

export type LifecycleStage = 'LEAD' | 'WON' | 'ONBOARDING' | 'ACTIVE' | 'RETENTION' | 'AT_RISK' | 'CHURNED'

interface ChurnOptions {
  clientId: string
  reason?: string
  notes?: string
  triggeredBy: string // User ID
}

/**
 * Handle all cascading operations when a client churns.
 * - Cancel pending tasks
 * - Mark team assignments as inactive
 * - Archive pending deliverables
 * - Create lifecycle event
 */
export async function handleClientChurn(options: ChurnOptions): Promise<void> {
  const { clientId, reason, notes, triggeredBy } = options

  // Get the client's current stage for the lifecycle event
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { lifecycleStage: true, name: true }
  })

  if (!client) {
    throw new Error('Client not found')
  }

  const now = new Date()

  await prisma.$transaction(async (tx) => {
    // 1. Create lifecycle event
    await tx.clientLifecycleEvent.create({
      data: {
        clientId,
        fromStage: client.lifecycleStage,
        toStage: 'CHURNED',
        reason: reason || 'Client churned',
        notes,
        triggeredBy,
      }
    })

    // 2. Cancel pending/in-progress daily tasks due to client churn.
    // Uses BREAKDOWN status with CLIENT_CHURNED reason so reports can
    // distinguish churn-related cancellations from actual task failures.
    await tx.dailyTask.updateMany({
      where: {
        clientId,
        status: { in: ['PLANNED', 'IN_PROGRESS'] }
      },
      data: {
        status: 'BREAKDOWN',
        isBreakdown: false, // Not an execution failure — client churned
        breakdownReason: 'CLIENT_CHURNED',
        completedAt: now,
      }
    })

    // 3. Team assignments are implicitly inactive when client is CHURNED
    // We keep the assignments to enable easy reactivation later
    // The client's lifecycleStage = 'CHURNED' is the source of truth

    // 4. Mark pending deliverables as requiring revision (client churned)
    // Note: Using REVISION_REQUIRED with reviewNotes since there's no ARCHIVED status
    await tx.clientDeliverable.updateMany({
      where: {
        clientId,
        status: { in: ['PENDING', 'SUBMITTED'] }
      },
      data: {
        status: 'REVISION_REQUIRED',
        reviewNotes: 'Client churned - deliverable archived',
        reviewedAt: now,
      }
    })

    // 5. Reject draft/submitted work entries (client churned)
    await tx.workEntry.updateMany({
      where: {
        clientId,
        status: { in: ['DRAFT', 'SUBMITTED'] }
      },
      data: {
        status: 'REJECTED',
        rejectionNote: 'Client churned - work entry archived'
      }
    })

    // 6. Mark pending invoices as cancelled
    await tx.invoice.updateMany({
      where: {
        clientId,
        status: { in: ['DRAFT', 'SENT'] }
      },
      data: {
        status: 'CANCELLED',
        notes: 'Auto-cancelled: Client churned'
      }
    })
  })
}

/**
 * Handle client reactivation from churned state.
 * - Create lifecycle event
 * - Restore team members (optional)
 */
export async function handleClientReactivation(
  clientId: string,
  newStage: LifecycleStage,
  triggeredBy: string
): Promise<void> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { lifecycleStage: true }
  })

  if (!client) {
    throw new Error('Client not found')
  }

  await prisma.clientLifecycleEvent.create({
    data: {
      clientId,
      fromStage: client.lifecycleStage,
      toStage: newStage,
      reason: 'Client reactivated',
      triggeredBy,
    }
  })
}

/**
 * Create a lifecycle event for any stage transition.
 */
export async function createLifecycleEvent(
  clientId: string,
  fromStage: string | null,
  toStage: LifecycleStage,
  triggeredBy: string,
  reason?: string
): Promise<void> {
  await prisma.clientLifecycleEvent.create({
    data: {
      clientId,
      fromStage,
      toStage,
      reason,
      triggeredBy,
    }
  })
}
