import { requirePageAuth, FINANCE_ACCESS } from '@/server/auth/pageAuth'

export default async function FinanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requirePageAuth(FINANCE_ACCESS)

  // Sidebar is handled by UnifiedSidebar in root DashboardLayout
  return <>{children}</>
}
