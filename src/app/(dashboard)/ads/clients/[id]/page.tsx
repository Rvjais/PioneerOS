import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

// Ads client detail - redirect to main client page
export default async function AdsClientDetailPage({ params }: PageProps) {
  const { id } = await params
  redirect(`/clients/${id}`)
}
