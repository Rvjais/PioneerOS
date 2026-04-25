import { Metadata } from 'next'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import { redirect } from 'next/navigation'
import { CampaignsPage } from './CampaignsPage'

export const metadata: Metadata = {
  title: 'WhatsApp Campaigns | Pioneer OS',
  description: 'Manage bulk WhatsApp messaging campaigns',
}

export default async function Page() {
  const auth = await requireAuth({ roles: ['SUPER_ADMIN', 'MANAGER'] })
  if (isAuthError(auth)) redirect('/login')

  return <CampaignsPage />
}
