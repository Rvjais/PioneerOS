import { requirePageAuth, SEO_ACCESS } from '@/server/auth/pageAuth'

export default async function SeoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requirePageAuth(SEO_ACCESS)

  // Sidebar is handled by UnifiedSidebar in root DashboardLayout
  return <>{children}</>
}
