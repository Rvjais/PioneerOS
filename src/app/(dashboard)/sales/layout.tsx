import { requirePageAuth, SALES_ACCESS } from '@/server/auth/pageAuth'

export default async function SalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side RBAC enforcement (SUPER_ADMIN, MANAGER, SALES)
  await requirePageAuth(SALES_ACCESS)

  // Sidebar is handled by UnifiedSidebar in root DashboardLayout — no duplicate here
  return <>{children}</>
}
