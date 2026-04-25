import { requirePageAuth, WEB_ACCESS } from '@/server/auth/pageAuth'

export default async function WebLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requirePageAuth(WEB_ACCESS)

  // Sidebar is handled by UnifiedSidebar in root DashboardLayout
  return <>{children}</>
}
