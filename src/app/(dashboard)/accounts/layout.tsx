import { requirePageAuth, ACCOUNTS_ACCESS } from '@/server/auth/pageAuth'

export default async function AccountsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side RBAC enforcement (SUPER_ADMIN, MANAGER, ACCOUNTS)
  await requirePageAuth(ACCOUNTS_ACCESS)

  // Sidebar is handled by UnifiedSidebar in root DashboardLayout — no duplicate here
  return <>{children}</>
}
