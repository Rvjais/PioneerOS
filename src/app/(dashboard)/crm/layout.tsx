import { requirePageAuth, SALES_ACCESS } from '@/server/auth/pageAuth'

export default async function CRMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Enforce sales/CRM access (SUPER_ADMIN, MANAGER, SALES)
  await requirePageAuth(SALES_ACCESS)

  return <>{children}</>
}
