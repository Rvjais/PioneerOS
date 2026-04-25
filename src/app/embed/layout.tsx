import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Branding Pioneers',
  description: 'Embeddable forms',
  // Prevent indexing of embed pages
  robots: 'noindex, nofollow',
}

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Simple wrapper - no sidebar, no header, just clean forms
  return <>{children}</>
}
