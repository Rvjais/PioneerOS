import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TEMPORARILY DISABLED FOR LOCAL TESTING
  // const session = await getServerSession(authOptions)
  // if (session?.user) {
  //   redirect('/dashboard')
  // }

  return (
    <div className="min-h-screen bg-slate-950">
      {children}
    </div>
  )
}
