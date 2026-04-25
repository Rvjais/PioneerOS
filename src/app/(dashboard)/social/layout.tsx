import { requirePageAuth, SOCIAL_ACCESS } from '@/server/auth/pageAuth'

export default async function SocialLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requirePageAuth(SOCIAL_ACCESS)

  // Sidebar is handled by UnifiedSidebar in root DashboardLayout
  return <>{children}</>
}
