import { prisma } from '@/server/db/prisma'
import { notFound } from 'next/navigation'
import PlatformDashboard from '@/client/components/reporting/PlatformDashboard'

interface Props {
  params: Promise<{ clientId: string }>
}

export default async function MetaSocialDashboardPage({ params }: Props) {
  const { clientId } = await params

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true },
  })

  if (!client) {
    notFound()
  }

  return (
    <PlatformDashboard
      clientId={clientId}
      clientName={client.name}
      platform="Meta Social"
      platformKey="META_SOCIAL"
    />
  )
}
