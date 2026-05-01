import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')

  if (session.user.role !== 'SUPER_ADMIN') redirect('/dashboard')

  return <>{children}</>
}