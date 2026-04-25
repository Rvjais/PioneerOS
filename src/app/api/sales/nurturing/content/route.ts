import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'

// Pre-configured content library - stored in code for simplicity
// In future, this can be moved to database
const DEFAULT_CONTENT = [
  // eBooks
  {
    id: 'ebook-1',
    title: 'Healthcare Marketing Guide 2024',
    type: 'EBOOK',
    url: 'https://drive.google.com/healthcare-guide',
    description: 'Complete guide to digital marketing for healthcare providers',
    category: 'HEALTHCARE',
    isActive: true,
  },
  {
    id: 'ebook-2',
    title: 'Social Media Marketing Playbook',
    type: 'EBOOK',
    url: 'https://drive.google.com/social-playbook',
    description: 'Step-by-step social media strategy',
    category: 'GENERAL',
    isActive: true,
  },
  // Case Studies
  {
    id: 'case-1',
    title: 'Apollo Clinics - 3X Lead Growth',
    type: 'CASE_STUDY',
    url: 'https://brandingpioneers.com/case-studies/apollo',
    description: 'How we helped Apollo achieve 300% lead growth',
    category: 'HEALTHCARE',
    isActive: true,
  },
  {
    id: 'case-2',
    title: 'CloudKitch - E-commerce Success',
    type: 'CASE_STUDY',
    url: 'https://brandingpioneers.com/case-studies/cloudkitch',
    description: 'E-commerce transformation story',
    category: 'ECOMMERCE',
    isActive: true,
  },
  // Videos
  {
    id: 'video-1',
    title: 'Client Success Stories Compilation',
    type: 'VIDEO',
    url: 'https://youtube.com/watch?v=success-stories',
    description: 'Our clients share their experience',
    category: 'GENERAL',
    isActive: true,
  },
  {
    id: 'video-2',
    title: 'Healthcare Digital Marketing Trends',
    type: 'VIDEO',
    url: 'https://youtube.com/watch?v=healthcare-trends',
    description: 'Latest trends in healthcare marketing',
    category: 'HEALTHCARE',
    isActive: true,
  },
  // Testimonials
  {
    id: 'testimonial-1',
    title: 'Dr. Sharma - Clinic Growth Story',
    type: 'TESTIMONIAL',
    url: 'https://brandingpioneers.com/testimonials/dr-sharma',
    description: 'Video testimonial from Dr. Sharma',
    category: 'HEALTHCARE',
    isActive: true,
  },
  // Website Examples
  {
    id: 'website-1',
    title: 'Skin & You Clinic Website',
    type: 'WEBSITE_EXAMPLE',
    url: 'https://skinandyouclinic.com',
    description: 'Modern healthcare website design',
    category: 'HEALTHCARE',
    isActive: true,
  },
  {
    id: 'website-2',
    title: 'TechFlow SaaS Website',
    type: 'WEBSITE_EXAMPLE',
    url: 'https://techflow.io',
    description: 'SaaS product website',
    category: 'SAAS',
    isActive: true,
  },
]

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only sales team can access nurturing content
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES']
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')

    let content = DEFAULT_CONTENT

    // Filter by type if provided
    if (type) {
      content = content.filter(c => c.type === type)
    }

    // Filter by category if provided
    if (category) {
      content = content.filter(c => c.category === category)
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error('Failed to fetch nurturing content:', error)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}
