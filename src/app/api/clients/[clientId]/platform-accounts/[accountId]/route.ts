import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { checkClientAccess } from '@/server/services/clientAccess'
import { z } from 'zod'
import {
  getAccount,
  updateAccount,
  deleteAccount,
  ACCESS_TYPES,
  SYNC_STATUSES,
  AccessType,
  SyncStatus,
} from '@/server/reporting/platform-accounts'

// Validation schema for updating a platform account
const updateAccountSchema = z.object({
  accountName: z.string().min(1).max(200).optional(),
  accessType: z.enum(ACCESS_TYPES).optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  lastSyncStatus: z.enum(SYNC_STATUSES).optional(),
  syncError: z.string().nullable().optional(),
})

// GET - Get a single platform account
export const GET = withAuth(async (req, { user, params }) => {
  const { clientId, accountId } = params || {}
  if (!clientId || !accountId) {
    return NextResponse.json({ error: 'Client ID and Account ID required' }, { status: 400 })
  }

  // Check authorization
  const access = await checkClientAccess(user, clientId)
  if (!access.canView) {
    return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
  }

  try {
    const account = await getAccount(accountId)

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Verify account belongs to this client
    if (account.clientId !== clientId) {
      return NextResponse.json({ error: 'Account not found for this client' }, { status: 404 })
    }

    return NextResponse.json({ account })
  } catch (error) {
    console.error('Error fetching platform account:', error)
    return NextResponse.json(
      { error: 'Failed to fetch platform account' },
      { status: 500 }
    )
  }
})

// PATCH - Update a platform account
export const PATCH = withAuth(async (req, { user, params }) => {
  const { clientId, accountId } = params || {}
  if (!clientId || !accountId) {
    return NextResponse.json({ error: 'Client ID and Account ID required' }, { status: 400 })
  }

  // Check authorization
  const access = await checkClientAccess(user, clientId)
  if (!access.canModify) {
    return NextResponse.json(
      { error: 'You do not have permission to modify this client' },
      { status: 403 }
    )
  }

  // Verify account belongs to this client
  const existingAccount = await getAccount(accountId)
  if (!existingAccount || existingAccount.clientId !== clientId) {
    return NextResponse.json({ error: 'Account not found for this client' }, { status: 404 })
  }

  // Parse and validate body
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validation = updateAccountSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  try {
    const account = await updateAccount(accountId, {
      accountName: validation.data.accountName,
      accessType: validation.data.accessType as AccessType | undefined,
      isActive: validation.data.isActive,
      metadata: validation.data.metadata as Record<string, unknown> | undefined,
      lastSyncStatus: validation.data.lastSyncStatus as SyncStatus | undefined,
      syncError: validation.data.syncError,
    })

    return NextResponse.json({ account })
  } catch (error) {
    console.error('Error updating platform account:', error)
    return NextResponse.json(
      { error: 'Failed to update platform account' },
      { status: 500 }
    )
  }
})

// DELETE - Delete a platform account and its metrics
export const DELETE = withAuth(async (req, { user, params }) => {
  const { clientId, accountId } = params || {}
  if (!clientId || !accountId) {
    return NextResponse.json({ error: 'Client ID and Account ID required' }, { status: 400 })
  }

  // Check authorization
  const access = await checkClientAccess(user, clientId)
  if (!access.canModify) {
    return NextResponse.json(
      { error: 'You do not have permission to modify this client' },
      { status: 403 }
    )
  }

  // Verify account belongs to this client
  const existingAccount = await getAccount(accountId)
  if (!existingAccount || existingAccount.clientId !== clientId) {
    return NextResponse.json({ error: 'Account not found for this client' }, { status: 404 })
  }

  try {
    const result = await deleteAccount(accountId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error deleting platform account:', error)
    return NextResponse.json(
      { error: 'Failed to delete platform account' },
      { status: 500 }
    )
  }
})
