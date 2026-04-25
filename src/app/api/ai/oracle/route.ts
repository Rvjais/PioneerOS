import { NextRequest, NextResponse } from 'next/server'
import guidebook from '@/shared/constants/guidebook.json'
import { withAuth } from '@/server/auth/withAuth'

interface Section {
  id: string
  title: string
  content: string
}

interface Chapter {
  id: number
  title: string
  sections: Section[]
}

interface FAQ {
  question: string
  answer: string
  chapterRef: string
}

interface SearchResult {
  chapter: number
  chapterTitle: string
  section: string
  content: string
  score: number
}

// Simple keyword-based search
function searchGuidebook(query: string): SearchResult[] {
  const results: SearchResult[] = []
  const queryLower = query.toLowerCase()
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2)

  // Search FAQs first (highest priority)
  for (const faq of guidebook.faqs as FAQ[]) {
    const questionLower = faq.question.toLowerCase()
    const answerLower = faq.answer.toLowerCase()

    let score = 0
    for (const word of queryWords) {
      if (questionLower.includes(word)) score += 3
      if (answerLower.includes(word)) score += 1
    }

    if (score > 0) {
      results.push({
        chapter: parseInt(faq.chapterRef.split('.')[0]),
        chapterTitle: 'FAQ',
        section: faq.question,
        content: faq.answer,
        score: score + 5,
      })
    }
  }

  // Search chapters and sections
  for (const chapter of guidebook.chapters as Chapter[]) {
    for (const section of chapter.sections) {
      const sectionTitleLower = section.title.toLowerCase()
      const contentLower = section.content.toLowerCase()

      let score = 0
      for (const word of queryWords) {
        if (sectionTitleLower.includes(word)) score += 2
        if (contentLower.includes(word)) score += 1
      }

      if (score > 0) {
        results.push({
          chapter: chapter.id,
          chapterTitle: chapter.title,
          section: section.title,
          content: section.content,
          score,
        })
      }
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 3)
}

function generateResponse(query: string, results: SearchResult[]): {
  answer: string
  citations: { chapter: number; section: string; excerpt: string }[]
} {
  if (results.length === 0) {
    return {
      answer: "I couldn't find specific information about that in the Company Guidebook. Please contact HR or your manager for assistance.",
      citations: [],
    }
  }

  const topResult = results[0]
  let answer = topResult.content

  if (results.length > 1 && results[1].score > 2) {
    answer += `\n\nRelated: ${results[1].content.substring(0, 150)}...`
  }

  const citations = results.map(r => ({
    chapter: r.chapter,
    section: r.chapterTitle === 'FAQ' ? 'FAQ' : `${r.chapterTitle} - ${r.section}`,
    excerpt: r.content.substring(0, 80) + '...',
  }))

  return { answer, citations }
}

export const POST = withAuth(async (req, { user, params }) => {
  try {
    // SECURITY FIX: Require authentication - internal guidebook should not be public
const body = await req.json()
    const { query } = body

    if (!query) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 })
    }

    const searchResults = searchGuidebook(query)
    const { answer, citations } = generateResponse(query, searchResults)

    return NextResponse.json({
      answer,
      citations,
      confidence: searchResults.length > 0 ? Math.min(searchResults[0].score / 10, 1) : 0,
    })
  } catch (error) {
    console.error('Oracle error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
