'use client'

import { useState, useEffect } from 'react'

interface Quote {
  id: string
  text: string
  author: string
}

interface InspirationWidgetProps {
  quotes: Quote[]
}

export function InspirationWidget({ quotes }: InspirationWidgetProps) {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null)

  useEffect(() => {
    if (quotes.length > 0) {
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)])
    }
  }, [quotes])

  const refreshQuote = () => {
    if (quotes.length > 0) {
      const newQuote = quotes[Math.floor(Math.random() * quotes.length)]
      setCurrentQuote(newQuote)
    }
  }

  if (!currentQuote) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-none shadow-blue-500/20">
      <div className="flex items-start justify-between mb-4">
        <svg className="w-8 h-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <button
          onClick={refreshQuote}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          title="New quote"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      <blockquote className="text-lg font-medium mb-3 leading-relaxed">
        "{currentQuote.text}"
      </blockquote>
      <p className="text-blue-100 text-sm">— {currentQuote.author}</p>
    </div>
  )
}
