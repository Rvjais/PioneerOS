import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

// SEO client detail - redirect to main client page
export default async function SeoClientDetailPage({ params }: PageProps) {
  const { id } = await params
  redirect(`/clients/${id}`)
}
