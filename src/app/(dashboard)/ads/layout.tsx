import { requirePageAuth, ADS_ACCESS } from '@/server/auth/pageAuth'

export default async function AdsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requirePageAuth(ADS_ACCESS)

  // Sidebar is handled by UnifiedSidebar in root DashboardLayout
  return <>{children}</>
}
