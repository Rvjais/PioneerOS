import { requirePageAuth, HR_ACCESS } from '@/server/auth/pageAuth'

export default async function HRLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side RBAC enforcement (SUPER_ADMIN, MANAGER, HR)
  await requirePageAuth(HR_ACCESS)

  // Sidebar is handled by UnifiedSidebar in root DashboardLayout — no duplicate here
  return <>{children}</>
}
