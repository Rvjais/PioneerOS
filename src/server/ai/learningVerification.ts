/**
 * AI-Powered Learning Verification
 *
 * Generates practical tasks based on learning topics and evaluates user responses.
 * Uses OpenRouter for AI capabilities.
 */

import { getCredentialsWithFallback } from '@/server/api-credentials'

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const MODEL = 'meta-llama/llama-3.2-3b-instruct:free'

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Lazy-loaded API key
let cachedApiKey: string | null = null

async function getApiKey(): Promise<string> {
  if (cachedApiKey) return cachedApiKey
  const credentials = await getCredentialsWithFallback('OPENROUTER')
  cachedApiKey = credentials.apiKey || process.env.OPENROUTER_API_KEY || ''
  return cachedApiKey
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
      'X-Title': 'Pioneer OS Learning',
    },
    body: JSON.stringify({
      model: MODEL,
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

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

export interface PracticalTask {
  taskPrompt: string
  taskType: 'PRACTICAL' | 'REFLECTION' | 'QUIZ'
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  hints?: string[]
  expectedOutcome?: string
}

export interface TaskEvaluation {
  score: number // 0-100
  feedback: string
  strengths: string[]
  improvements: string[]
  isVerified: boolean
}

export interface MonthlyAuditSummary {
  summary: string
  keyTopicsLearned: string[]
  recommendations: string[]
  overallVerdict: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'CONCERNING'
  averageScore: number
}

/**
 * Generate a practical task based on the learning topic and resource
 */
export async function generatePracticalTask(
  topic: string,
  resourceTitle: string,
  minutesWatched: number
): Promise<PracticalTask> {
  const systemPrompt = `You are a learning verification assistant. Generate a practical task/exercise to verify that someone actually learned from the content they watched.

The task should be:
- Practical and hands-on (not just theory questions)
- Appropriate for the time spent learning (${minutesWatched} minutes)
- Something that can be described in text (no actual file creation needed)
- Verifiable through their written response

Respond with ONLY valid JSON in this exact format:
{
  "taskPrompt": "The practical task description (2-4 sentences, be specific)",
  "taskType": "PRACTICAL",
  "difficulty": "MEDIUM",
  "hints": ["Optional hint 1", "Optional hint 2"],
  "expectedOutcome": "Brief description of what a good response should include"
}

NO explanation or markdown - just the JSON object.`

  const userPrompt = `Generate a practical verification task for someone who watched:
Topic: ${topic || 'General Learning'}
Resource: "${resourceTitle}"
Duration: ${minutesWatched} minutes

The task should test if they actually understood and can apply what they learned.`

  try {
    const response = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], 400)

    // Parse JSON response
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim()
    const task = JSON.parse(cleanResponse)

    return {
      taskPrompt: task.taskPrompt || 'Describe what you learned and how you would apply it in a real scenario.',
      taskType: task.taskType || 'PRACTICAL',
      difficulty: task.difficulty || 'MEDIUM',
      hints: Array.isArray(task.hints) ? task.hints : [],
      expectedOutcome: task.expectedOutcome,
    }
  } catch (error) {
    console.error('Failed to generate task:', error)
    // Fallback task
    return {
      taskPrompt: `Based on "${resourceTitle}" about ${topic || 'this topic'}, describe one key concept you learned and provide a practical example of how you would apply it in your daily work.`,
      taskType: 'PRACTICAL',
      difficulty: 'MEDIUM',
      hints: ['Focus on practical application', 'Give specific examples'],
      expectedOutcome: 'A clear explanation with a real-world example',
    }
  }
}

/**
 * Evaluate user's response to a practical task
 */
export async function evaluateResponse(
  taskPrompt: string,
  topic: string,
  resourceTitle: string,
  userResponse: string
): Promise<TaskEvaluation> {
  if (!userResponse || userResponse.trim().length < 20) {
    return {
      score: 0,
      feedback: 'Response is too short. Please provide a more detailed answer.',
      strengths: [],
      improvements: ['Provide more detail', 'Include specific examples'],
      isVerified: false,
    }
  }

  const systemPrompt = `You are a learning verification evaluator. Assess if the user's response demonstrates genuine understanding of the topic they claimed to learn.

Evaluation criteria:
1. Relevance - Does the response address the task?
2. Understanding - Does it show comprehension of the topic?
3. Application - Does it demonstrate practical knowledge?
4. Effort - Is it a thoughtful, genuine response?

Be fair but maintain standards. A score of 60+ means verified.

Respond with ONLY valid JSON in this exact format:
{
  "score": 75,
  "feedback": "Brief overall feedback (1-2 sentences)",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Area for improvement 1"],
  "isVerified": true
}

NO explanation or markdown - just the JSON object.`

  const userPrompt = `Evaluate this learning verification response:

Topic: ${topic || 'General Learning'}
Resource: "${resourceTitle}"
Task: "${taskPrompt}"

User's Response:
"${userResponse}"

Assess if this demonstrates genuine learning.`

  try {
    const response = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], 400)

    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim()
    const evaluation = JSON.parse(cleanResponse)

    const score = typeof evaluation.score === 'number' ? Math.min(100, Math.max(0, evaluation.score)) : 50

    return {
      score,
      feedback: evaluation.feedback || 'Response evaluated.',
      strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
      improvements: Array.isArray(evaluation.improvements) ? evaluation.improvements : [],
      isVerified: score >= 60,
    }
  } catch (error) {
    console.error('Failed to evaluate response:', error)
    // Fallback evaluation based on response length and keywords
    const responseLength = userResponse.trim().length
    const hasExamples = /example|instance|case|scenario/i.test(userResponse)
    const hasApplication = /apply|use|implement|practice/i.test(userResponse)

    let score = 50
    if (responseLength > 200) score += 15
    if (responseLength > 400) score += 10
    if (hasExamples) score += 10
    if (hasApplication) score += 10

    return {
      score: Math.min(score, 85),
      feedback: 'Response received. Your answer has been recorded.',
      strengths: responseLength > 200 ? ['Detailed response'] : [],
      improvements: responseLength < 200 ? ['Consider adding more detail'] : [],
      isVerified: score >= 60,
    }
  }
}

/**
 * Generate a monthly learning audit summary
 */
export async function generateMonthlyAudit(
  learningEntries: Array<{
    topic: string | null
    resourceTitle: string
    minutesWatched: number
    verificationScore?: number | null
  }>,
  monthLabel: string
): Promise<MonthlyAuditSummary> {
  if (learningEntries.length === 0) {
    return {
      summary: 'No learning entries recorded for this month.',
      keyTopicsLearned: [],
      recommendations: ['Start logging your learning to build consistency'],
      overallVerdict: 'CONCERNING',
      averageScore: 0,
    }
  }

  const totalMinutes = learningEntries.reduce((sum, e) => sum + e.minutesWatched, 0)
  const verifiedEntries = learningEntries.filter(e => e.verificationScore && e.verificationScore >= 60)
  const avgScore = verifiedEntries.length > 0
    ? verifiedEntries.reduce((sum, e) => sum + (e.verificationScore || 0), 0) / verifiedEntries.length
    : 0

  const topics = [...new Set(learningEntries.map(e => e.topic).filter(Boolean))]
  const resourceList = learningEntries.map(e => `- ${e.resourceTitle} (${e.topic || 'General'}): ${e.minutesWatched} min`).join('\n')

  const systemPrompt = `You are a learning coach providing a monthly audit summary. Be encouraging but honest.

Respond with ONLY valid JSON:
{
  "summary": "2-3 sentence summary of the month's learning",
  "keyTopicsLearned": ["Topic 1", "Topic 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "overallVerdict": "GOOD"
}

Verdicts: EXCELLENT (8+ hours, high scores), GOOD (6+ hours, decent effort), NEEDS_IMPROVEMENT (<6 hours), CONCERNING (minimal or no effort)

NO markdown, just JSON.`

  const userPrompt = `Generate monthly learning audit for ${monthLabel}:

Total learning time: ${Math.round(totalMinutes / 60 * 10) / 10} hours
Entries: ${learningEntries.length}
Verified entries: ${verifiedEntries.length}
Average verification score: ${Math.round(avgScore)}%

Resources studied:
${resourceList}

Topics covered: ${topics.join(', ') || 'Various'}`

  try {
    const response = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], 500)

    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim()
    const audit = JSON.parse(cleanResponse)

    return {
      summary: audit.summary || `You logged ${learningEntries.length} learning entries totaling ${Math.round(totalMinutes / 60)} hours.`,
      keyTopicsLearned: Array.isArray(audit.keyTopicsLearned) ? audit.keyTopicsLearned : topics,
      recommendations: Array.isArray(audit.recommendations) ? audit.recommendations : [],
      overallVerdict: ['EXCELLENT', 'GOOD', 'NEEDS_IMPROVEMENT', 'CONCERNING'].includes(audit.overallVerdict)
        ? audit.overallVerdict
        : (totalMinutes >= 360 ? 'GOOD' : 'NEEDS_IMPROVEMENT'),
      averageScore: avgScore,
    }
  } catch (error) {
    console.error('Failed to generate audit:', error)
    // Fallback audit
    const verdict = totalMinutes >= 480 ? 'EXCELLENT'
      : totalMinutes >= 360 ? 'GOOD'
      : totalMinutes >= 180 ? 'NEEDS_IMPROVEMENT'
      : 'CONCERNING'

    return {
      summary: `You completed ${learningEntries.length} learning entries totaling ${Math.round(totalMinutes / 60)} hours in ${monthLabel}.`,
      keyTopicsLearned: topics.slice(0, 5) as string[],
      recommendations: totalMinutes < 360
        ? ['Increase learning time to meet the 6-hour monthly requirement']
        : ['Keep up the good work', 'Consider diversifying your learning topics'],
      overallVerdict: verdict,
      averageScore: avgScore,
    }
  }
}

/**
 * Ask the learner what they learned (reflection prompt)
 */
export async function generateReflectionPrompt(
  topic: string,
  resourceTitle: string
): Promise<string> {
  const prompts = [
    `After learning about "${resourceTitle}", what was the most valuable insight you gained? How do you plan to apply it?`,
    `Thinking back on your study of ${topic || resourceTitle}, what concept challenged your previous understanding? How did it change your perspective?`,
    `Based on "${resourceTitle}", describe one technique or approach you learned that you can immediately use in your work.`,
    `What was the key takeaway from "${resourceTitle}"? Give a specific example of how you would implement this knowledge.`,
  ]

  return prompts[Math.floor(Math.random() * prompts.length)]
}
