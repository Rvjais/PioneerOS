/**
 * Soft Delete Utility
 *
 * This module provides utilities for implementing soft-delete pattern.
 * Soft delete marks records as deleted (via deletedAt timestamp) instead of
 * permanently removing them, preserving audit trail and enabling recovery.
 *
 * IMPLEMENTATION GUIDE:
 * ---------------------
 * 1. Add deletedAt field to models in schema.prisma:
 *    ```prisma
 *    model User {
 *      ...
 *      deletedAt DateTime?
 *      @@index([deletedAt])
 *    }
 *    ```
 *
 * 2. Run migration:
 *    ```bash
 *    npx prisma migrate dev --name add_soft_delete
 *    ```
 *
 * 3. Use these utilities in your code instead of prisma.model.delete()
 *
 * RECOMMENDED MODELS FOR SOFT DELETE:
 * - User (employee records, audit trail)
 * - Client (client history, financial records)
 * - Invoice (financial audit trail)
 * - Lead (sales history)
 * - Task (work history)
 */

import { prisma } from '@/server/db/prisma'

/** Minimal Prisma delegate interface for soft-delete operations */
interface PrismaDelegate {
  update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<unknown>
  findUnique(args: { where: { id: string }; select?: Record<string, boolean> }): Promise<Record<string, unknown> | null>
  delete(args: { where: { id: string } }): Promise<unknown>
  count(args: { where: Record<string, unknown> }): Promise<number>
}

/** Type-safe model access map for soft-delete operations */
const MODEL_MAP: Record<string, PrismaDelegate> = {
  user: prisma.user as unknown as PrismaDelegate,
  client: prisma.client as unknown as PrismaDelegate,
  invoice: prisma.invoice as unknown as PrismaDelegate,
  lead: prisma.lead as unknown as PrismaDelegate,
  task: prisma.task as unknown as PrismaDelegate,
}

/**
 * Soft delete a record by setting deletedAt timestamp
 */
export async function softDelete<T extends { id: string }>(
  model: 'user' | 'client' | 'invoice' | 'lead' | 'task',
  id: string,
  deletedBy?: string
): Promise<T> {
  const now = new Date()

  const prismaModel = MODEL_MAP[model]

  // Update with deletedAt
  // Note: This requires deletedAt field to exist on the model
  const result = await prismaModel.update({
    where: { id },
    data: {
      deletedAt: now,
      ...(deletedBy ? { deletedBy } : {}),
    },
  })

  return result as T
}

/**
 * Restore a soft-deleted record
 */
export async function restore<T extends { id: string }>(
  model: 'user' | 'client' | 'invoice' | 'lead' | 'task',
  id: string
): Promise<T> {
  const prismaModel = MODEL_MAP[model]

  const result = await prismaModel.update({
    where: { id },
    data: { deletedAt: null },
  })

  return result as T
}

/**
 * Create a where clause that excludes soft-deleted records
 */
export function notDeleted<T extends Record<string, unknown>>(
  where: T
): T & { deletedAt: null } {
  return {
    ...where,
    deletedAt: null,
  }
}

/**
 * Create a where clause that includes only soft-deleted records
 */
export function onlyDeleted<T extends Record<string, unknown>>(
  where: T
): T & { deletedAt: { not: null } } {
  return {
    ...where,
    deletedAt: { not: null },
  }
}

/**
 * Permanently delete a soft-deleted record (use with caution)
 * Only for use when truly necessary (e.g., GDPR right to be forgotten)
 */
export async function permanentDelete(
  model: 'user' | 'client' | 'invoice' | 'lead' | 'task',
  id: string
): Promise<void> {
  const prismaModel = MODEL_MAP[model]

  // First verify it's already soft-deleted
  const record = await prismaModel.findUnique({
    where: { id },
    select: { deletedAt: true },
  })

  if (!record?.deletedAt) {
    throw new Error('Cannot permanently delete a record that is not soft-deleted')
  }

  await prismaModel.delete({ where: { id } })
}

/**
 * Get soft-delete statistics for a model
 */
export async function getSoftDeleteStats(
  model: 'user' | 'client' | 'invoice' | 'lead' | 'task'
): Promise<{ active: number; deleted: number; total: number }> {
  const prismaModel = MODEL_MAP[model]

  const [active, deleted] = await Promise.all([
    prismaModel.count({ where: { deletedAt: null } }),
    prismaModel.count({ where: { deletedAt: { not: null } } }),
  ])

  return {
    active,
    deleted,
    total: active + deleted,
  }
}

/**
 * MIGRATION HELPER
 * Generate SQL to add deletedAt column to a table
 */
export function generateMigrationSQL(tableName: string): string {
  return `
-- Add soft delete column to ${tableName}
ALTER TABLE "${tableName}" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Create index for performance
CREATE INDEX "${tableName}_deletedAt_idx" ON "${tableName}"("deletedAt");

-- Optional: Add deletedBy column for audit
-- ALTER TABLE "${tableName}" ADD COLUMN "deletedBy" TEXT;
  `.trim()
}
