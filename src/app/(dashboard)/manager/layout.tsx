import { requirePageAuth, MANAGER_ACCESS } from '@/server/auth/pageAuth'

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requirePageAuth(MANAGER_ACCESS)

  // Sidebar is handled by UnifiedSidebar in root DashboardLayout
  return <>{children}</>
}
