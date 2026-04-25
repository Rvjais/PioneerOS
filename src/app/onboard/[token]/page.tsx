import { prisma } from '@/server/db/prisma'
import { notFound, redirect } from 'next/navigation'
import { OnboardingForm } from './OnboardingForm'

async function getClient(token: string) {
  return prisma.client.findUnique({
    where: { onboardingToken: token },
  })
}

export default async function ClientOnboardingPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const client = await getClient(token)

  if (!client) {
    notFound()
  }

  // If already completed, redirect to success
  if (client.onboardingStatus === 'COMPLETED') {
    redirect('/onboard/success')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
      <div className="relative min-h-screen flex flex-col">
        <header className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-white font-semibold text-xl">Pioneer Intelligence</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <OnboardingForm
            token={token}
            client={{
              id: client.id,
              name: client.name,
              contactName: client.contactName || '',
              contactEmail: client.contactEmail || '',
              contactPhone: client.contactPhone || '',
              websiteUrl: client.websiteUrl || '',
              businessType: client.businessType || '',
              industry: client.industry || '',
              onboardingStatus: client.onboardingStatus,
            }}
          />
        </main>
      </div>
    </div>
  )
}
