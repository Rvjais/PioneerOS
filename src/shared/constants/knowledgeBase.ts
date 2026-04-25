/**
 * AI Knowledge Base System
 *
 * Provides intelligent search and Q&A for policies, app features, and company information
 */

import { policyChapters } from './policyContent'

// Common FAQ entries with keywords for matching
export const faqEntries = [
  {
    id: 'working-hours',
    question: 'What are the office working hours?',
    answer: 'Regular working hours are 10:30 AM to 7:30 PM. You must complete 8 working hours (tracked via MyZen) before leaving. The daily Operations huddle is at 11:00 AM sharp.',
    keywords: ['working hours', 'office hours', 'time', 'schedule', 'when', 'start', 'end', 'clock', 'punch'],
    category: 'Office',
  },
  {
    id: 'leave-policy',
    question: 'How do I apply for leave?',
    answer: 'Apply for leave through the HR Portal in the app. Submit your request at least 2 days in advance for planned leave. Emergency leave requires manager approval. Interns have limited leave options (emergency medical only).',
    keywords: ['leave', 'vacation', 'time off', 'holiday', 'apply', 'request', 'day off', 'absent'],
    category: 'HR',
  },
  {
    id: 'salary-slip',
    question: 'How can I download my salary slip?',
    answer: 'Access your salary slips through Razorpay Payroll Portal. Go to your Profile > Razorpay section, or log in directly to Razorpay with your registered email. Salary is processed by the 7th of each month.',
    keywords: ['salary', 'slip', 'payslip', 'pay', 'download', 'razorpay', 'payment', 'income'],
    category: 'Finance',
  },
  {
    id: 'rbc-bonus',
    question: 'What is RBC (Retention Bonus)?',
    answer: 'RBC is our Retention Bonus program. 8% of your salary is held monthly and accumulated. Multiplier policy: 1x for 0-2 years tenure, 2x after completing 2 years, and 4x after completing 4 years. Early exit may result in forfeiture. Check your RBC balance in Finance > RBC Tracking.',
    keywords: ['rbc', 'retention', 'bonus', 'accumulated', 'held', 'year', 'complete', 'multiplier'],
    category: 'Finance',
  },
  {
    id: 'probation',
    question: 'How long is the probation period?',
    answer: 'The probation period is 90 days (3 months). The first 3 weeks are an "Intensive Compatibility Phase." You\'ll have weekly check-ins with your manager. If targets are not met, there may be a 3-week extension with specific improvement goals.',
    keywords: ['probation', 'trial', 'new', 'joining', 'period', 'confirmation', 'permanent'],
    category: 'HR',
  },
  {
    id: 'dress-code',
    question: 'What is the dress code?',
    answer: 'Business or Smart Casual is required. Permitted: Collared T-shirts, formal jeans, shirts, trousers, ethnic wear. Prohibited: Shorts, round-neck T-shirts, flip-flops. Violation may result in a ₹100 charity fine or ₹200 salary deduction.',
    keywords: ['dress', 'code', 'wear', 'clothes', 'attire', 'shirt', 'formal', 'casual'],
    category: 'Office',
  },
  {
    id: 'biometric',
    question: 'How does the biometric system work?',
    answer: 'Your fingerprint is enrolled in the office biometric machine on Day 0. It links to Razorpay for automatic salary calculation. You must complete 8 working hours daily. MyZen also tracks your active hours on your laptop.',
    keywords: ['biometric', 'fingerprint', 'punch', 'clock', 'attendance', 'myzen', 'track'],
    category: 'Tech',
  },
  {
    id: 'daily-huddle',
    question: 'What is the daily Operations huddle?',
    answer: 'The daily Operations huddle is at 11:00 AM sharp. Join with camera on, prepared with: yesterday\'s achievements, today\'s #1 priority goal, and any roadblocks. Duration is 15-30 minutes. Late arrival is penalized.',
    keywords: ['huddle', 'meeting', 'daily', 'operations', '11', 'morning', 'standup', 'sync'],
    category: 'Meetings',
  },
  {
    id: 'appraisal',
    question: 'When is my appraisal?',
    answer: 'Annual appraisals are triggered 12 months after your joining date. However, you must complete 72 learning hours (6h/month) to be eligible. If learning hours are insufficient, your appraisal is postponed by 30 days. Check your appraisal status in HR > My Appraisal.',
    keywords: ['appraisal', 'review', 'performance', 'annual', 'increment', 'salary', 'hike', 'raise'],
    category: 'HR',
  },
  {
    id: 'learning-hours',
    question: 'What are mandatory learning hours?',
    answer: 'You must complete 6 hours of learning per month (72 hours/year). Log your learning in the app with video/course links. Learning hours are tracked and affect your appraisal eligibility. Free time should be used for mandatory learning, not idling.',
    keywords: ['learning', 'hours', 'training', 'course', 'study', 'mandatory', 'education'],
    category: 'Development',
  },
  {
    id: 'buddy-system',
    question: 'What is the Buddy system?',
    answer: 'Each new joiner is assigned a "Buddy" - an experienced team member who guides you through your first week. Your buddy helps with tool setup, answers questions, and ensures smooth integration. Contact your buddy for any onboarding questions.',
    keywords: ['buddy', 'mentor', 'guide', 'new', 'joiner', 'help', 'support'],
    category: 'Onboarding',
  },
  {
    id: 'nda',
    question: 'What is the NDA I signed?',
    answer: 'The Non-Disclosure Agreement (NDA) protects client confidentiality. You cannot share client information, strategies, data, or any confidential business information with anyone outside the company. Violation is a serious offense.',
    keywords: ['nda', 'confidential', 'disclosure', 'agreement', 'secret', 'private', 'client'],
    category: 'Legal',
  },
  {
    id: 'charity-fine',
    question: 'What are charity fines?',
    answer: 'Minor violations result in charity fines (donated to charity): Littering ₹100, Swearing ₹100, Dress code ₹100, Disturbing others ₹500. Repeated violations lead to salary deductions (double the charity amount).',
    keywords: ['fine', 'charity', 'penalty', 'violation', 'deduction', 'rule', 'break'],
    category: 'Office',
  },
  {
    id: 'pioneer-os',
    question: 'How do I use Pioneer OS for tasks?',
    answer: 'Pioneer OS is our unified workspace for task management. Update your tasks daily - the rule is "if it isn\'t in the tracker, it didn\'t happen." Not updating for 2 days may result in salary delay. Access your tasks through the Tasks section in Pioneer OS.',
    keywords: ['pioneer', 'os', 'task', 'project', 'management', 'tracker', 'update', 'daily', 'workspace'],
    category: 'Tech',
  },
  {
    id: 'wfh',
    question: 'Can I work from home?',
    answer: 'WFH requests require prior manager approval. Submit requests through the Leave module with type "WFH". WFH is not a regular option and is granted based on valid reasons. MyZen still tracks your active hours during WFH.',
    keywords: ['wfh', 'work from home', 'remote', 'home', 'office', 'hybrid'],
    category: 'HR',
  },
  {
    id: 'expenses',
    question: 'How do I submit expense claims?',
    answer: 'Submit expense claims through the Finance > Expenses section. Attach receipts, select category, and add description. Claims are reviewed by the accounts team. Reimbursements are processed with your next salary.',
    keywords: ['expense', 'claim', 'reimbursement', 'receipt', 'money', 'spend', 'cost'],
    category: 'Finance',
  },
  {
    id: 'clients',
    question: 'How do I see my assigned clients?',
    answer: 'View your assigned clients in Workspace > Clients. The Agency Mastersheet shows all client allocations. Your profile shows which clients you\'re the account manager or team member for. Study client information in the client detail page.',
    keywords: ['client', 'assigned', 'account', 'project', 'work', 'my', 'list'],
    category: 'Work',
  },
  {
    id: 'meetings',
    question: 'How do I schedule meetings?',
    answer: 'Use the Meetings section to schedule internal or client meetings. Add participants, set date/time, add agenda. For client calls, ensure business casual attire and camera on. Meeting notes (MOM) should be recorded for important calls.',
    keywords: ['meeting', 'schedule', 'calendar', 'call', 'video', 'conference', 'invite'],
    category: 'Meetings',
  },
  {
    id: 'issues',
    question: 'How do I report issues?',
    answer: 'Report client issues or internal problems through Issues section. Select severity (Low to Critical), assign to relevant person, and track resolution. Critical issues should also be escalated via WhatsApp to your manager.',
    keywords: ['issue', 'problem', 'report', 'escalate', 'help', 'support', 'bug', 'error'],
    category: 'Work',
  },
  {
    id: 'notifications',
    question: 'How do I manage notifications?',
    answer: 'View all notifications in the bell icon at the top. Important notifications include task assignments, meeting reminders, approvals, and announcements. WhatsApp is used for urgent updates that need immediate attention.',
    keywords: ['notification', 'alert', 'message', 'update', 'reminder', 'bell'],
    category: 'App',
  },
]

// Category icons for display
export const categoryIcons: Record<string, string> = {
  Office: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  HR: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  Finance: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  Tech: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  Meetings: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  Development: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  Onboarding: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
  Legal: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  Work: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  App: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
}

/**
 * Search knowledge base with query
 */
export function searchKnowledgeBase(query: string): {
  faqs: Array<(typeof faqEntries)[0] & { score: number }>
  policies: Array<(typeof policyChapters)[0] & { score: number }>
  bestMatch: ((typeof faqEntries)[0] & { score: number }) | null
} {
  const normalizedQuery = query.toLowerCase().trim()
  const queryWords = normalizedQuery.split(/\s+/)

  // Score FAQs
  const scoredFaqs = faqEntries.map(faq => {
    let score = 0

    // Check keyword matches
    faq.keywords.forEach(keyword => {
      if (normalizedQuery.includes(keyword.toLowerCase())) {
        score += 10
      }
      queryWords.forEach(word => {
        if (keyword.toLowerCase().includes(word) || word.includes(keyword.toLowerCase())) {
          score += 5
        }
      })
    })

    // Check question text match
    if (faq.question.toLowerCase().includes(normalizedQuery)) {
      score += 20
    }
    queryWords.forEach(word => {
      if (faq.question.toLowerCase().includes(word)) {
        score += 3
      }
    })

    // Check answer text match
    queryWords.forEach(word => {
      if (faq.answer.toLowerCase().includes(word)) {
        score += 1
      }
    })

    return { ...faq, score }
  })

  // Sort by score
  const sortedFaqs = scoredFaqs.sort((a, b) => b.score - a.score)
  const matchingFaqs = sortedFaqs.filter(faq => faq.score > 0)

  // Score policies
  const scoredPolicies = policyChapters.map(policy => {
    let score = 0

    queryWords.forEach(word => {
      if (policy.title.toLowerCase().includes(word)) score += 10
      if (policy.subtitle.toLowerCase().includes(word)) score += 5
      if (policy.content.toLowerCase().includes(word)) score += 1
    })

    return { ...policy, score }
  })

  const sortedPolicies = scoredPolicies.sort((a, b) => b.score - a.score)
  const matchingPolicies = sortedPolicies.filter(p => p.score > 0)

  return {
    faqs: matchingFaqs.slice(0, 5),
    policies: matchingPolicies.slice(0, 3),
    bestMatch: matchingFaqs.length > 0 && matchingFaqs[0].score > 5 ? matchingFaqs[0] : null,
  }
}

/**
 * Get FAQ by category
 */
export function getFaqsByCategory(category: string): typeof faqEntries {
  if (category === 'All') return faqEntries
  return faqEntries.filter(faq => faq.category === category)
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  return ['All', ...new Set(faqEntries.map(faq => faq.category))]
}

/**
 * Generate a natural language response for a question
 */
export function generateResponse(query: string): {
  answer: string
  confidence: 'high' | 'medium' | 'low'
  relatedFaqs: Array<(typeof faqEntries)[0] & { score: number }>
  relatedPolicies: Array<(typeof policyChapters)[0] & { score: number }>
  source?: string
} {
  const results = searchKnowledgeBase(query)

  if (results.bestMatch && results.bestMatch.score > 15) {
    return {
      answer: results.bestMatch.answer,
      confidence: 'high',
      relatedFaqs: results.faqs.slice(1, 4),
      relatedPolicies: results.policies,
      source: results.bestMatch.category,
    }
  }

  if (results.faqs.length > 0) {
    // Combine top FAQ answers if no perfect match
    const topFaqs = results.faqs.slice(0, 2)
    const combinedAnswer = topFaqs.map(f => f.answer).join('\n\n')

    return {
      answer: combinedAnswer || 'I found some related information. Please check the related FAQs and policies below.',
      confidence: 'medium',
      relatedFaqs: results.faqs,
      relatedPolicies: results.policies,
    }
  }

  // No good matches - suggest browsing
  return {
    answer: 'I couldn\'t find a specific answer to your question. Please try rephrasing or browse the FAQs by category. You can also check the Policies section for detailed information.',
    confidence: 'low',
    relatedFaqs: faqEntries.slice(0, 5).map(f => ({ ...f, score: 0 })), // Show popular FAQs
    relatedPolicies: policyChapters.slice(0, 3).map(p => ({ ...p, score: 0 })),
  }
}
