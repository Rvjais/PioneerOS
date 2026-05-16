import { type NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'

const FINANCE_PERFORMANCE_ROLES = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'OPERATIONS_HEAD']

type Period = 'week' | 'month' | 'quarter'

export const GET = withAuth(async (_req: NextRequest, { user }) => {
  const { searchParams } = new URL(_req.url)
  const period = (searchParams.get('period') ?? 'month') as Period

  const multiplier = period === 'week' ? 1 : period === 'month' ? 4 : 12

  const history = [
    { period: 'Period 1', collections: 45000 * multiplier, invoices: 120, collectionRate: 87.5 },
    { period: 'Period 2', collections: 52000 * multiplier, invoices: 135, collectionRate: 89.2 },
    { period: 'Period 3', collections: 48000 * multiplier, invoices: 128, collectionRate: 88.1 },
    { period: 'Period 4', collections: 61000 * multiplier, invoices: 142, collectionRate: 91.4 },
    { period: 'Period 5', collections: 58000 * multiplier, invoices: 138, collectionRate: 90.7 },
  ]

  const latest = history[history.length - 1]

  return NextResponse.json({
    metrics: {
      totalCollections: latest.collections,
      totalInvoices: latest.invoices,
      avgCollectionRate: latest.collectionRate,
      efficiency: 92.3,
    },
    history,
  })
}, { roles: FINANCE_PERFORMANCE_ROLES })