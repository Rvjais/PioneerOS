import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

// Projects are client-based - redirect to client detail page
export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params
  redirect(`/clients/${id}`)
}
