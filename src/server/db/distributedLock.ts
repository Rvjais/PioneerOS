/**
 * Simple Distributed Lock using Database
 * Prevents duplicate execution of scheduled tasks across multiple instances
 *
 * Compatible with both SQLite and PostgreSQL via Prisma API
 */

import { prisma } from '@/server/db/prisma'
import crypto from 'crypto'

interface LockResult {
  acquired: boolean
  lockId?: string
}

/**
 * Acquire a distributed lock
 * Uses Prisma API for database-agnostic date comparisons
 */
export async function acquireLock(
  lockName: string,
  ttlSeconds: number = 60
): Promise<LockResult> {
  const lockId = `${lockName}_${Date.now()}_${crypto.randomUUID()}`
  const now = new Date()
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000)

  try {
    // Clean up expired locks for this name first, then atomically try to create.
    // The unique constraint on lockName ensures only one active lock exists.
    await prisma.distributedLock.deleteMany({
      where: {
        lockName,
        expiresAt: { lt: now },
      },
    })

    // Atomic create -- if lockName unique constraint fails, another process holds the lock
    await prisma.distributedLock.create({
      data: {
        id: lockId,
        lockName,
        acquiredAt: now,
        expiresAt,
      },
    })

    return { acquired: true, lockId }
  } catch (error) {
    // Unique constraint violation means another process holds the lock -- this is expected
    const message = error instanceof Error ? error.message : ''
    if (!message.includes('Unique constraint')) {
      console.error('Failed to acquire lock:', error)
    }
    return { acquired: false }
  }
}

/**
 * Extend a lock's TTL (heartbeat)
 * Call periodically during long-running jobs to prevent the lock from expiring
 */
export async function extendLock(lockId: string, ttlSeconds: number): Promise<boolean> {
  try {
    await prisma.distributedLock.update({
      where: { id: lockId },
      data: { expiresAt: new Date(Date.now() + ttlSeconds * 1000) },
    })
    return true
  } catch (error) {
    console.error('Failed to extend lock:', error)
    return false
  }
}

/**
 * Start a periodic heartbeat that extends the lock TTL
 * Returns a stop function to clear the interval
 */
export function startLockHeartbeat(
  lockId: string,
  ttlSeconds: number,
  intervalSeconds?: number
): () => void {
  // Refresh at half the TTL interval to ensure lock doesn't expire
  const refreshInterval = (intervalSeconds || Math.max(Math.floor(ttlSeconds / 2), 10)) * 1000

  const interval = setInterval(async () => {
    const extended = await extendLock(lockId, ttlSeconds)
    if (!extended) {
      console.error(`[Lock] Failed to extend lock ${lockId} — job may overlap`)
    }
  }, refreshInterval)

  // Prevent interval from keeping the process alive
  if (interval && typeof interval === 'object' && 'unref' in interval) {
    interval.unref()
  }

  return () => clearInterval(interval)
}

/**
 * Release a distributed lock
 */
export async function releaseLock(lockId: string): Promise<void> {
  try {
    await prisma.distributedLock.delete({
      where: { id: lockId },
    })
  } catch (error) {
    console.error('Failed to release lock:', error)
  }
}

/**
 * Clean up expired locks
 */
export async function cleanupExpiredLocks(): Promise<number> {
  try {
    const result = await prisma.distributedLock.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    })
    return result.count
  } catch (error) {
    console.error('Failed to cleanup expired locks:', error)
    return 0
  }
}

/**
 * Execute a function with a distributed lock and automatic heartbeat
 * Returns null if lock couldn't be acquired
 */
export async function withLock<T>(
  lockName: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T | null> {
  const { acquired, lockId } = await acquireLock(lockName, ttlSeconds)

  if (!acquired) {
    return null
  }

  // Start heartbeat to keep lock alive during execution
  const stopHeartbeat = startLockHeartbeat(lockId!, ttlSeconds)

  try {
    return await fn()
  } finally {
    stopHeartbeat()
    if (lockId) {
      await releaseLock(lockId)
    }
  }
}
