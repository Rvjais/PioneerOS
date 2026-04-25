'use client'

import { useState, useMemo } from 'react'
import { GLOSSARY_TERMS, getTermOfTheDay, getQuoteOfTheDay } from '@/shared/constants/glossary'

const CATEGORY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  healthcare: { label: 'Healthcare', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  marketing: { label: 'Marketing', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  seo: { label: 'SEO', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  ads: { label: 'Ads', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  social: { label: 'Social Media', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  web: { label: 'Web / CRO', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  analytics: { label: 'Analytics', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
}

export default function GlossaryPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null)

  const todayTerm = getTermOfTheDay()
  const todayQuote = getQuoteOfTheDay()

  const filtered = useMemo(() => {
    return GLOSSARY_TERMS.filter(t => {
      const matchesSearch = !search || t.term.toLowerCase().includes(search.toLowerCase()) || t.definition.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !activeCategory || t.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [search, activeCategory])

  const grouped = useMemo(() => {
    const groups: Record<string, typeof GLOSSARY_TERMS> = {}
    for (const term of filtered) {
      const letter = term.term[0].toUpperCase()
      if (!groups[letter]) groups[letter] = []
      groups[letter].push(term)
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  return (
    <div className="space-y-6">
      {/* Header with Quote + Term of the Day */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Motivational Quote */}
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/20 p-6">
          <p className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-3">Quote of the Day</p>
          <p className="text-lg text-white font-medium leading-relaxed">&ldquo;{todayQuote.text}&rdquo;</p>
          <p className="text-sm text-slate-400 mt-3">— {todayQuote.author}</p>
        </div>

        {/* Term of the Day */}
        <div className="bg-gradient-to-br from-green-600/20 to-teal-600/20 rounded-xl border border-green-500/20 p-6">
          <p className="text-xs font-medium text-green-400 uppercase tracking-wider mb-3">Term of the Day</p>
          <h3 className="text-xl font-bold text-white mb-2">{todayTerm.term}</h3>
          <p className="text-slate-300 text-sm leading-relaxed">{todayTerm.definition}</p>
          {todayTerm.example && (
            <p className="text-xs text-slate-400 mt-3 italic">{todayTerm.example}</p>
          )}
          <span className={`inline-block mt-3 px-2 py-0.5 text-xs font-medium rounded border ${CATEGORY_LABELS[todayTerm.category].bg} ${CATEGORY_LABELS[todayTerm.category].color}`}>
            {CATEGORY_LABELS[todayTerm.category].label}
          </span>
        </div>
      </div>

      {/* Title + Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Healthcare Marketing Glossary</h1>
          <p className="text-sm text-slate-400 mt-1">{GLOSSARY_TERMS.length} terms across healthcare, marketing, SEO, ads, social, web & analytics</p>
        </div>
        <input
          type="text"
          placeholder="Search terms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 w-full sm:w-72 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!activeCategory ? 'bg-white/10 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
        >
          All ({GLOSSARY_TERMS.length})
        </button>
        {Object.entries(CATEGORY_LABELS).map(([key, { label, color }]) => {
          const count = GLOSSARY_TERMS.filter(t => t.category === key).length
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(activeCategory === key ? null : key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeCategory === key ? 'bg-white/10 text-white' : `bg-slate-900 ${color} hover:bg-white/5`}`}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Glossary Terms */}
      {grouped.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No terms match your search.</div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([letter, terms]) => (
            <div key={letter}>
              <div className="sticky top-0 z-10 bg-[#0B0E14]/90 backdrop-blur-sm py-2">
                <span className="text-2xl font-bold text-blue-500">{letter}</span>
                <span className="text-xs text-slate-500 ml-2">{terms.length} term{terms.length > 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-1">
                {terms.map(term => (
                  <button
                    key={term.term}
                    onClick={() => setExpandedTerm(expandedTerm === term.term ? null : term.term)}
                    className="w-full text-left p-4 bg-slate-900/40 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">{term.term}</span>
                          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded border ${CATEGORY_LABELS[term.category].bg} ${CATEGORY_LABELS[term.category].color}`}>
                            {CATEGORY_LABELS[term.category].label}
                          </span>
                        </div>
                        <p className={`text-sm text-slate-300 ${expandedTerm === term.term ? '' : 'line-clamp-1'}`}>
                          {term.definition}
                        </p>
                        {expandedTerm === term.term && term.example && (
                          <p className="text-xs text-slate-400 mt-2 italic border-l-2 border-blue-500/30 pl-3">
                            {term.example}
                          </p>
                        )}
                      </div>
                      <span className="text-slate-600 text-sm shrink-0">{expandedTerm === term.term ? '−' : '+'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
