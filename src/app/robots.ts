import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://app.brandingpioneers.in'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/privacy', '/terms'],
        disallow: ['/api/', '/admin/', '/portal/', '/embed/', '/client-portal/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
