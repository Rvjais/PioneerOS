// OpenRouter AI Integration
// Uses free models for message enhancement and sentiment analysis

import { getCredentialsWithFallback } from '@/server/api-credentials'

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

// Lazy-loaded API key from database with .env fallback
let cachedApiKey: string | null = null

async function getApiKey(): Promise<string> {
  if (cachedApiKey) return cachedApiKey
  const credentials = await getCredentialsWithFallback('OPENROUTER')
  cachedApiKey = credentials.apiKey || process.env.OPENROUTER_API_KEY || ''
  return cachedApiKey
}

// Free models available on OpenRouter
const FREE_MODEL = 'meta-llama/llama-3.2-3b-instruct:free'

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

async function callOpenRouter(
  messages: OpenRouterMessage[],
  maxTokens: number = 500
): Promise<string> {
  const apiKey = await getApiKey()

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://pioneer-os.vercel.app',
      'X-Title': 'Pioneer OS',
    },
    body: JSON.stringify({
      model: FREE_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('OpenRouter error:', error)
    throw new Error('Failed to call AI service')
  }

  const data: OpenRouterResponse = await response.json()
  return data.choices[0]?.message?.content || ''
}

export type MessageTone = 'professional' | 'friendly' | 'concise'

const TONE_INSTRUCTIONS: Record<MessageTone, string> = {
  professional: `- Use formal, business-appropriate language
- Maintain a respectful and courteous tone
- Be clear and structured
- Avoid casual expressions or slang`,
  friendly: `- Use warm and approachable language
- Include a personal touch where appropriate
- Be conversational but still professional
- Use positive language and expressions`,
  concise: `- Be brief and to the point
- Remove unnecessary words and phrases
- Focus on key information only
- Use short sentences`,
}

/**
 * Enhance a message - fix grammar, improve clarity, apply selected tone
 */
export async function enhanceMessage(
  originalMessage: string,
  context?: { clientName?: string; department?: string; tone?: MessageTone }
): Promise<string> {
  const tone = context?.tone || 'professional'
  const toneInstructions = TONE_INSTRUCTIONS[tone]

  const systemPrompt = `You are a professional business communication assistant. Your task is to improve the given message with a ${tone} tone:
- Fix any grammar or spelling errors
- Make it clear and well-structured
- Keep the original meaning and intent
${toneInstructions}
${context?.clientName ? `This message is for a client named ${context.clientName}.` : ''}
${context?.department ? `This is from the ${context.department} department.` : ''}

IMPORTANT: Return ONLY the improved message, nothing else. No explanations, no quotes, just the improved text.`

  const messages: OpenRouterMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: originalMessage },
  ]

  return callOpenRouter(messages, 300)
}

/**
 * Analyze sentiment of a conversation or message
 */
export interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
  score: number // -1 to 1
  urgency: 'low' | 'medium' | 'high'
  summary: string
  clientNeeds: string[]
  suggestedAction?: string
}

export async function analyzeConversationSentiment(
  messages: Array<{ direction: string; content: string; createdAt: string }>,
  clientName?: string
): Promise<SentimentAnalysis> {
  // Format conversation for analysis
  const conversationText = messages
    .slice(-20) // Last 20 messages
    .map(m => `${m.direction === 'INBOUND' ? 'Client' : 'Team'}: ${m.content}`)
    .join('\n')

  const systemPrompt = `You are an expert at analyzing business communication sentiment. Analyze the following conversation and provide a JSON response with:
- sentiment: "positive", "neutral", "negative", or "mixed"
- score: a number from -1 (very negative) to 1 (very positive)
- urgency: "low", "medium", or "high" based on how quickly this needs attention
- summary: a brief 1-2 sentence summary of the client's current state
- clientNeeds: an array of strings listing what the client wants or needs
- suggestedAction: a brief suggestion for next steps (optional)

${clientName ? `The client's name is ${clientName}.` : ''}

IMPORTANT: Respond with ONLY valid JSON, no markdown, no code blocks, just the JSON object.`

  const messages_: OpenRouterMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: conversationText || 'No conversation history available.' },
  ]

  try {
    const response = await callOpenRouter(messages_, 400)

    // Parse JSON response
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim()
    const analysis = JSON.parse(cleanResponse)

    return {
      sentiment: analysis.sentiment || 'neutral',
      score: typeof analysis.score === 'number' ? analysis.score : 0,
      urgency: analysis.urgency || 'low',
      summary: analysis.summary || 'No analysis available',
      clientNeeds: Array.isArray(analysis.clientNeeds) ? analysis.clientNeeds : [],
      suggestedAction: analysis.suggestedAction,
    }
  } catch (error) {
    console.error('Failed to parse sentiment analysis:', error)
    return {
      sentiment: 'neutral',
      score: 0,
      urgency: 'low',
      summary: 'Unable to analyze conversation',
      clientNeeds: [],
    }
  }
}

/**
 * Summarize a conversation with action items and mood analysis
 */
export interface ConversationSummary {
  summary: string
  keyPoints: string[]
  actionItems: string[]
  mood: 'positive' | 'neutral' | 'negative' | 'frustrated' | 'satisfied' | 'concerned'
  topics: string[]
  followUpSuggestion?: string
}

export async function summarizeConversation(
  messages: Array<{ body: string; fromMe: boolean; timestamp: string }>,
  context?: { chatName?: string; isGroup?: boolean }
): Promise<ConversationSummary> {
  // Format messages for analysis
  const conversationText = messages
    .map(m => `${m.fromMe ? 'You' : (context?.chatName || 'Client')}: ${m.body}`)
    .join('\n')

  const systemPrompt = `You are an expert at summarizing business conversations. Analyze the following WhatsApp conversation and provide a comprehensive summary.

${context?.isGroup ? 'This is a group conversation.' : ''}
${context?.chatName ? `The contact/group name is: ${context.chatName}` : ''}

Provide a JSON response with:
- summary: A concise 2-3 sentence summary of the conversation
- keyPoints: Array of 3-5 key points discussed
- actionItems: Array of specific action items or follow-ups needed (empty array if none)
- mood: The client's overall mood - one of: "positive", "neutral", "negative", "frustrated", "satisfied", "concerned"
- topics: Array of main topics discussed (e.g., "pricing", "delivery", "support")
- followUpSuggestion: Optional suggestion for next steps

IMPORTANT: Respond with ONLY valid JSON, no markdown, no code blocks, just the JSON object.`

  const aiMessages: OpenRouterMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: conversationText || 'No conversation history available.' },
  ]

  try {
    const response = await callOpenRouter(aiMessages, 600)
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim()
    const result = JSON.parse(cleanResponse)

    return {
      summary: result.summary || 'Unable to generate summary',
      keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : [],
      actionItems: Array.isArray(result.actionItems) ? result.actionItems : [],
      mood: result.mood || 'neutral',
      topics: Array.isArray(result.topics) ? result.topics : [],
      followUpSuggestion: result.followUpSuggestion,
    }
  } catch (error) {
    console.error('Failed to summarize conversation:', error)
    return {
      summary: 'Unable to generate summary at this time.',
      keyPoints: [],
      actionItems: [],
      mood: 'neutral',
      topics: [],
    }
  }
}

/**
 * Generate a quick reply suggestion based on context
 */
export async function suggestReply(
  lastClientMessage: string,
  context?: { clientName?: string; previousReplies?: string[] }
): Promise<string[]> {
  const systemPrompt = `You are a helpful business communication assistant. Based on the client's message, suggest 3 short, professional reply options.

${context?.clientName ? `The client's name is ${context.clientName}.` : ''}

IMPORTANT: Return ONLY a JSON array of 3 strings, each being a potential reply. No explanations, just the JSON array.
Example: ["Thanks for reaching out! I'll look into this right away.", "Got it, let me check and get back to you.", "Understood. I'll have an update for you shortly."]`

  const messages: OpenRouterMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: lastClientMessage },
  ]

  try {
    const response = await callOpenRouter(messages, 300)
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim()
    const suggestions = JSON.parse(cleanResponse)
    return Array.isArray(suggestions) ? suggestions.slice(0, 3) : []
  } catch (error) {
    console.error('Failed to generate reply suggestions:', error)
    return []
  }
}
