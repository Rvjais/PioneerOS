import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import { migrateFromEnv } from '@/server/api-credentials'

// POST - Migrate credentials from .env to database
export async function POST() {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const result = await migrateFromEnv(auth.user.id)

    return NextResponse.json({
      message: 'Migration completed',
      migrated: result.migrated,
      skipped: result.skipped,
      errors: result.errors,
    })
  } catch (error) {
    console.error('Failed to migrate credentials:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
