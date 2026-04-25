import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { ImpersonationBanner } from '@/client/components/layout/ImpersonationBanner'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Parent dashboard layout already redirects to /login if no session,
  // but guard here too for defense-in-depth.
  if (!session) redirect('/login')

  // Check if user is impersonating — if so, verify the original role
  const isImpersonating = session.user.isImpersonating
  const roleToCheck = isImpersonating ? session.user.originalRole : session.user.role

  if (roleToCheck !== 'SUPER_ADMIN') redirect('/dashboard')

  return (
    <>
      <ImpersonationBanner />
      {children}
    </>
  )
}
