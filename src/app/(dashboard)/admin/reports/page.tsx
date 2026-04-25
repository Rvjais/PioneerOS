import { Metadata } from 'next'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import { redirect } from 'next/navigation'
import { ReportBuilderClient } from './ReportBuilderClient'

export const metadata: Metadata = {
  title: 'Report Builder | Pioneer OS',
  description: 'Generate and export custom reports',
}

export default async function ReportBuilderPage() {
  const auth = await requireAuth({ roles: ['SUPER_ADMIN', 'MANAGER'] })
  if (isAuthError(auth)) redirect('/login')

  return <ReportBuilderClient />
}
