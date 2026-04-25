import { Metadata } from 'next'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import { redirect } from 'next/navigation'
import { TemplatesPage } from './TemplatesPage'

export const metadata: Metadata = {
  title: 'WhatsApp Templates | Pioneer OS',
  description: 'Manage WhatsApp message templates',
}

export default async function Page() {
  const auth = await requireAuth()
  if (isAuthError(auth)) redirect('/login')

  return <TemplatesPage />
}
