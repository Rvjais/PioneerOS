import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import { cache, cacheInvalidators } from '@/server/cache'

/**
 * GET /api/admin/cache
 * Get cache statistics
 */
export async function GET() {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const stats = await cache.getStats()

    return NextResponse.json({
      ...stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to get cache stats:', error)
    return NextResponse.json(
      { error: 'Failed to get cache stats' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/cache
 * Clear cache
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { searchParams } = new URL(request.url)
    const target = searchParams.get('target') || 'all'

    switch (target) {
      case 'dashboard':
        await cacheInvalidators.onDashboardInvalidate()
        break
      case 'users':
        await cache.delPattern('user:*')
        break
      case 'clients':
        await cache.delPattern('client*')
        break
      case 'reports':
        await cache.delPattern('report*')
        break
      case 'all':
      default:
        await cacheInvalidators.onFullInvalidate()
    }

    return NextResponse.json({
      success: true,
      message: `Cache cleared: ${target}`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to clear cache:', error)
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}
