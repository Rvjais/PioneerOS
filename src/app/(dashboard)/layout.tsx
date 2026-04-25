import { UnifiedSidebar } from './UnifiedSidebar'
import { DashboardHeader } from '@/client/components/layout/DashboardHeader'
import { ImpersonationBanner } from '@/client/components/layout/ImpersonationBanner'
import { MeetingBlocker } from '@/client/components/meetings/MeetingBlocker'
import { MobileNavProvider } from '@/client/components/layout/MobileNavContext'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/server/db/prisma'
import { unstable_cache } from 'next/cache'
import { cookies, headers } from 'next/headers'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Require authentication for all dashboard routes
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  // Check if user needs to complete profile onboarding (cached for 60s to avoid DB hit on every navigation)
  const getUserProfile = unstable_cache(
    async (userId: string) => prisma.user.findUnique({
      where: { id: userId },
      select: { profileCompletionStatus: true, role: true },
    }),
    ['user-profile-status'],
    { revalidate: 60, tags: ['user-profile'] }
  )

  const user = await getUserProfile(session.user.id)

  // Profile completion is optional — users can fill details from /profile anytime
  // No forced redirects to profile-wizard or pending-verification

  // Check for viewAs param in cookies (set when admin clicks "Access Dashboard")
  const cookieStore = await cookies()
  const viewAsUserId = cookieStore.get('viewAsUserId')?.value || undefined

  return (
    <MeetingBlocker>
      <MobileNavProvider>
      <div className="relative min-h-screen bg-[#f1f5f9]">
      <div className="relative w-full min-h-screen flex flex-col">
        <ImpersonationBanner />
        <DashboardHeader showHamburger={true} />

        <div className="flex flex-1">
          <div className="w-72 shrink-0 sticky top-[73px] self-start h-[calc(100vh-73px)] overflow-hidden">
            <UnifiedSidebar viewAsUserId={viewAsUserId} />
          </div>
          <main className="flex-1 min-w-0 min-h-[calc(100vh-73px)] p-6 text-slate-900 flex flex-col">
            <div className="animate-fade-in-up flex-1 w-full h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
    </MobileNavProvider>
    </MeetingBlocker>
  )
}
