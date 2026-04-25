'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getTermOfTheDay, getQuoteOfTheDay, GLOSSARY_TERMS } from '@/shared/constants/glossary'

const CATEGORY_COLORS: Record<string, string> = {
  healthcare: 'text-red-400 bg-red-500/10',
  marketing: 'text-purple-400 bg-purple-500/10',
  seo: 'text-green-400 bg-green-500/10',
  ads: 'text-amber-400 bg-amber-500/10',
  social: 'text-pink-400 bg-pink-500/10',
  web: 'text-blue-400 bg-blue-500/10',
  analytics: 'text-cyan-400 bg-cyan-500/10',
}

export function DailyLearning() {
  const todayTerm = getTermOfTheDay()
  const todayQuote = getQuoteOfTheDay()
  const [showMore, setShowMore] = useState(false)

  // Get 2 bonus random terms (different from today's)
  const day = new Date().getDate()
  const bonusTerms = [
    GLOSSARY_TERMS[(day * 7 + 3) % GLOSSARY_TERMS.length],
    GLOSSARY_TERMS[(day * 13 + 11) % GLOSSARY_TERMS.length],
  ].filter(t => t.term !== todayTerm.term)

  return (
    <div className="bg-slate-900/40 rounded-xl border border-white/5 overflow-hidden">
      {/* Quote */}
      <div className="p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-white/5">
        <p className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-1">Daily Inspiration</p>
        <p className="text-sm leading-relaxed">&ldquo;{todayQuote.text}&rdquo;</p>
        <p className="text-xs text-slate-500 mt-1">— {todayQuote.author}</p>
      </div>

      {/* Term of the Day */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-green-400 uppercase tracking-wider">Term of the Day</p>
          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${CATEGORY_COLORS[todayTerm.category] || ''}`}>
            {todayTerm.category}
          </span>
        </div>
        <h4 className="font-bold text-base">{todayTerm.term}</h4>
        <p className="text-sm text-slate-300 mt-1 leading-relaxed">{todayTerm.definition}</p>
        {todayTerm.example && (
          <p className="text-xs text-slate-400 mt-2 italic border-l-2 border-green-500/30 pl-2">{todayTerm.example}</p>
        )}

        {/* Bonus terms */}
        {showMore && (
          <div className="mt-3 pt-3 border-t border-white/5 space-y-3">
            {bonusTerms.map(t => (
              <div key={t.term}>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{t.term}</span>
                  <span className={`px-1 py-0.5 text-[9px] rounded ${CATEGORY_COLORS[t.category] || ''}`}>{t.category}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{t.definition}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {showMore ? 'Show less' : 'Learn 2 more terms'}
          </button>
          <Link href="/glossary" className="text-xs text-slate-500 hover:text-slate-300">
            Full glossary &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
