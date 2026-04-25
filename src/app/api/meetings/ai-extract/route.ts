import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { safeJsonParse } from '@/shared/utils/safeJson'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const aiExtractSchema = z.object({
  sessionId: z.string().max(100).optional(),
  clientId: z.string().max(100).optional(),
  clientName: z.string().max(200).optional(),
  department: z.string().max(100).optional(),
  userInput: z.string().max(10000).optional().default(''),
  inputType: z.enum(['text', 'image']),
  imageBase64: z.string().max(5_000_000).optional(),
})

// AI API configuration — supports DeepSeek with local fallback
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''

/**
 * Local number extraction — works without any API
 * Parses structured text like "Organic Traffic: 15,000" or "leads 45"
 */
function extractNumbersLocally(text: string, requiredFields: string[]): Record<string, number> {
  const extracted: Record<string, number> = {}
  const lines = text.split(/[\n,;]+/)

  // Field aliases for matching
  const aliases: Record<string, string[]> = {
    organicTraffic: ['organic traffic', 'organic', 'traffic', 'visitors'],
    leads: ['leads', 'lead', 'enquiries', 'inquiries'],
    gbpCalls: ['gbp calls', 'calls', 'phone calls', 'google calls'],
    gbpDirections: ['gbp directions', 'directions', 'map directions'],
    keywordsTop10: ['keywords', 'top 10', 'ranked keywords', 'keywords ranked'],
    backlinksBuilt: ['backlinks', 'links built', 'link building'],
    adSpend: ['ad spend', 'spend', 'budget spent', 'ad budget'],
    impressions: ['impressions', 'views', 'ad views'],
    clicks: ['clicks', 'ad clicks'],
    conversions: ['conversions', 'converted'],
    costPerLead: ['cpl', 'cost per lead', 'cost/lead'],
    roas: ['roas', 'return on ad spend'],
    postsPublished: ['posts', 'posts published', 'published'],
    followers: ['followers', 'follower count'],
    engagement: ['engagement', 'engagement rate', 'er'],
    reachTotal: ['reach', 'total reach'],
    videoViews: ['video views', 'views', 'reels views'],
    pagesBuilt: ['pages', 'pages built', 'pages completed'],
    bugsFixed: ['bugs', 'bugs fixed', 'issues fixed'],
    pageSpeed: ['page speed', 'speed score', 'lighthouse'],
    bounceRate: ['bounce rate', 'bounce'],
  }

  for (const line of lines) {
    const lower = line.toLowerCase().trim()
    if (!lower) continue

    // Extract number from line
    const numMatch = lower.match(/[\d,]+\.?\d*/)
    if (!numMatch) continue

    let value = parseFloat(numMatch[0].replace(/,/g, ''))
    // Check for K/L/Cr as standalone suffixes adjacent to the number
    const suffixMatch = lower.match(/[\d,]+\.?\d*\s*(k|l|lakh|lakhs|cr|crore)\b/i)
    if (suffixMatch) {
      const suffix = suffixMatch[1].toLowerCase()
      if (suffix === 'k' && value < 1000) value *= 1000
      else if ((suffix === 'l' || suffix === 'lakh' || suffix === 'lakhs') && value < 100000) value *= 100000
      else if ((suffix === 'cr' || suffix === 'crore') && value < 10000000) value *= 10000000
    }

    // Match to fields
    for (const field of requiredFields) {
      if (extracted[field] !== undefined) continue
      const fieldAliases = aliases[field] || [field.replace(/([A-Z])/g, ' $1').toLowerCase()]
      for (const alias of fieldAliases) {
        if (lower.includes(alias)) {
          extracted[field] = value
          break
        }
      }
    }
  }

  return extracted
}

interface ExtractionRequest {
  sessionId?: string
  clientId?: string
  clientName?: string
  department?: string
  userInput: string
  inputType: 'text' | 'image'
  imageBase64?: string
}

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

// Define required fields by department
const REQUIRED_FIELDS_BY_DEPARTMENT: Record<string, string[]> = {
  SEO: [
    'organicTraffic',
    'leads',
    'gbpCalls',
    'gbpDirections',
    'keywordsTop10',
    'backlinksBuilt'
  ],
  ADS: [
    'adSpend',
    'impressions',
    'clicks',
    'leads',
    'conversions',
    'costPerLead',
    'roas'
  ],
  SOCIAL: [
    'postsPublished',
    'followers',
    'engagement',
    'reachTotal',
    'videoViews'
  ],
  WEB: [
    'pagesBuilt',
    'bugsFixed',
    'pageSpeed',
    'bounceRate'
  ]
}

// Call DeepSeek API
async function callDeepSeek(messages: DeepSeekMessage[]): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('AI service not configured. Please set DEEPSEEK_API_KEY in environment variables.')
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      max_tokens: 1024,
      temperature: 0.3
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('DeepSeek API error:', errorText)

    // Parse specific error messages
    try {
      const errorData = JSON.parse(errorText)
      if (errorData?.error?.message?.includes('Insufficient Balance')) {
        throw new Error('AI service balance exhausted. Please contact admin to top up the DeepSeek account.')
      }
    } catch (parseErr) {
      if (parseErr instanceof Error && parseErr.message.includes('AI service')) throw parseErr
    }

    throw new Error(`AI service error (${response.status}). Please try again or enter data manually.`)
  }

  const data: DeepSeekResponse = await response.json()
  return data.choices[0]?.message?.content || ''
}

// POST - Extract data using DeepSeek AI
export const POST = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const parsed = aiExtractSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const {
      sessionId,
      clientId,
      clientName,
      department,
      userInput,
      inputType,
      imageBase64
    } = parsed.data

    if (!userInput && !imageBase64) {
      return NextResponse.json(
        { error: 'Please provide text or image input' },
        { status: 400 }
      )
    }

    // Get or create extraction session
    let extractionSession
    if (sessionId) {
      extractionSession = await prisma.aIExtractionSession.findUnique({
        where: { id: sessionId }
      })
    }

    if (!extractionSession) {
      extractionSession = await prisma.aIExtractionSession.create({
        data: {
          userId: user.id,
          targetType: 'TACTICAL_MEETING',
          clientId,
          messages: '[]',
          status: 'IN_PROGRESS'
        }
      })
    }

    // Parse existing conversation
    const conversationHistory = safeJsonParse<{ role: string; content: string }[]>(extractionSession.messages, [])
    const existingData = safeJsonParse<Record<string, unknown>>(extractionSession.extractedData, {})

    // Get required fields
    const requiredFields = REQUIRED_FIELDS_BY_DEPARTMENT[department || 'SOCIAL'] || []
    const missingFields = requiredFields.filter(f => !existingData[f])

    // Build system prompt
    const systemPrompt = `You are a data extraction assistant for a digital marketing agency.
Your job is to extract metrics from text data or descriptions provided by users.

Current context:
- Client: ${clientName || 'Unknown'}
- Department: ${department || 'Marketing'}
- Required metrics: ${requiredFields.join(', ')}
- Already extracted: ${Object.keys(existingData).join(', ') || 'None'}
- Still needed: ${missingFields.join(', ') || 'All data collected'}

Instructions:
1. Extract any visible metrics from the user's input
2. Map values to the correct field names
3. If data is unclear, ask clarifying questions
4. If you can't find a required metric, ask the user to provide it
5. Be conversational and helpful

You MUST respond in this exact JSON format (no other text):
{
  "extractedData": {
    "fieldName": value
  },
  "confidence": "high",
  "message": "Friendly message to user",
  "questions": ["Any clarifying questions"],
  "completed": false
}

Important rules for extracting numbers:
- Numbers should be numeric, not strings (e.g., 1500 not "1500")
- Percentages should be decimals (e.g., 4.5 for 4.5%)
- Currency values should be numbers without symbols (e.g., 50000 not "₹50,000")
- If you see "K" suffix, multiply by 1000 (e.g., 1.5K = 1500)
- If you see "L" or "Lakh", multiply by 100000 (e.g., 1L = 100000)
- If you see "Cr" or "Crore", multiply by 10000000`

    // Build messages for DeepSeek
    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt }
    ]

    // Add conversation history
    for (const msg of conversationHistory.slice(-8)) {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })
    }

    // Add current user input
    let userContent: string
    if (inputType === 'image' && imageBase64) {
      // DeepSeek chat doesn't support vision — guide user to paste numbers
      if (userInput) {
        // User provided text description of the screenshot
        userContent = `The user uploaded a screenshot and described it as: "${userInput}"\n\nPlease extract all metrics from this description and map them to the required fields.`
      } else {
        // No description — return helpful message without calling API
        return NextResponse.json({
          message: 'I cannot read screenshots directly. Please type or paste the numbers from the screenshot. For example:\n\n"Organic traffic: 15,000\nLeads: 45\nGBP calls: 120\nKeywords in top 10: 25"',
          extractedData: existingData,
          missingFields,
          status: 'NEED_TEXT',
          sessionId: extractionSession.id,
        })
      }
    } else {
      userContent = userInput
    }

    messages.push({ role: 'user', content: userContent })

    // Step 1: Try local extraction first (always works, no API needed)
    const localExtracted = extractNumbersLocally(userContent, requiredFields)
    const localExtractedCount = Object.keys(localExtracted).length

    // Step 2: Try DeepSeek API for better extraction (optional)
    let aiExtracted: Record<string, unknown> = {}
    let aiMessage = ''
    let aiConfidence = 'low'

    if (DEEPSEEK_API_KEY && localExtractedCount < requiredFields.length) {
      try {
        const assistantMessage = await callDeepSeek(messages)
        const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          aiExtracted = parsed.extractedData || {}
          aiMessage = parsed.message || ''
          aiConfidence = parsed.confidence || 'medium'
        } else {
          aiMessage = assistantMessage
        }
      } catch (aiErr) {
        // DeepSeek failed (no balance, network, etc.) — continue with local extraction
        console.warn('AI extraction failed, using local:', aiErr instanceof Error ? aiErr.message : 'Unknown')
      }
    }

    // Merge: local extraction + AI extraction + existing data
    const parsedResponse = {
      extractedData: { ...localExtracted, ...aiExtracted },
      confidence: localExtractedCount > 0 ? (aiConfidence !== 'low' ? 'high' : 'medium') : aiConfidence,
      message: aiMessage || (localExtractedCount > 0
        ? `Extracted ${localExtractedCount} values. ${requiredFields.length - localExtractedCount - Object.keys(aiExtracted).length} fields remaining.`
        : 'Could not extract numbers. Please provide data in format: "metric name: value" (one per line)'),
      questions: [],
      completed: false,
    }

    const mergedData = {
      ...existingData,
      ...parsedResponse.extractedData
    }

    // Update conversation history
    conversationHistory.push({
      role: 'user',
      content: userInput
    })
    conversationHistory.push({
      role: 'assistant',
      content: parsedResponse.message
    })

    // Check if all required fields are filled
    const stillMissing = requiredFields.filter(f => !mergedData[f])
    const isComplete = stillMissing.length === 0 || parsedResponse.completed

    await prisma.aIExtractionSession.update({
      where: { id: extractionSession.id },
      data: {
        messages: JSON.stringify(conversationHistory),
        extractedData: JSON.stringify(mergedData),
        confidence: parsedResponse.confidence === 'high' ? 0.9 :
          parsedResponse.confidence === 'medium' ? 0.7 : 0.5,
        status: isComplete ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: isComplete ? new Date() : null
      }
    })

    return NextResponse.json({
      sessionId: extractionSession.id,
      extractedData: mergedData,
      confidence: parsedResponse.confidence,
      message: parsedResponse.message,
      questions: parsedResponse.questions || [],
      missingFields: stillMissing,
      completed: isComplete,
      conversationHistory
    })
  } catch (error) {
    console.error('AI extraction failed:', error)
    return NextResponse.json(
      { error: 'Failed to extract data. Please try again.' },
      { status: 500 }
    )
  }
})

// GET - Get extraction session details
export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    if (sessionId) {
      const extractionSession = await prisma.aIExtractionSession.findUnique({
        where: { id: sessionId },
        include: { client: { select: { id: true, name: true } } }
      })

      if (!extractionSession || extractionSession.userId !== user.id) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }

      return NextResponse.json({
        ...extractionSession,
        messages: JSON.parse(extractionSession.messages || '[]'),
        extractedData: JSON.parse(extractionSession.extractedData || '{}')
      })
    }

    // Get recent sessions
    const sessions = await prisma.aIExtractionSession.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      sessions: sessions.map(s => ({
        ...s,
        messages: JSON.parse(s.messages || '[]'),
        extractedData: JSON.parse(s.extractedData || '{}')
      }))
    })
  } catch (error) {
    console.error('Failed to get extraction session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
