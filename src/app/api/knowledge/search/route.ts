import { NextRequest, NextResponse } from 'next/server'
import { generateResponse, searchKnowledgeBase } from '@/shared/constants/knowledgeBase'
import { policyChapters } from '@/shared/constants/policyContent'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async (req, { user, params }) => {
  try {
    // SECURITY FIX: Require authentication - internal policies should not be public
const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
    }

    const response = generateResponse(query)

    // Format FAQs for response
    const faqs = response.relatedFaqs.map(faq => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      keywords: faq.keywords,
      category: faq.category,
    }))

    // Format policies for response
    const policies = response.relatedPolicies.map(policy => ({
      id: policy.id,
      title: policy.title,
      subtitle: policy.subtitle,
      contentPreview: policy.content.substring(0, 200) + '...',
    }))

    return NextResponse.json({
      answer: response.answer,
      confidence: response.confidence,
      faqs,
      policies,
      source: response.source || null,
    })
  } catch (error) {
    console.error('Knowledge search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
})
