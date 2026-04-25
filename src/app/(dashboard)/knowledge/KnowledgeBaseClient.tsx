'use client'

import { useState, useEffect } from 'react'
import PageGuide from '@/client/components/ui/PageGuide'

interface FAQ {
  id: string
  question: string
  answer: string
  keywords: string[]
  category: string
}

interface Policy {
  id: number
  title: string
  subtitle: string
  contentPreview: string
}

interface Props {
  faqs: FAQ[]
  policies: Policy[]
  categories: string[]
  categoryIcons: Record<string, string>
}

export function KnowledgeBaseClient({ faqs, policies, categories, categoryIcons }: Props) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchResults, setSearchResults] = useState<{ answer?: string; confidence?: string; source?: string; faqs?: typeof faqs; policies?: typeof policies } | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  // Search when query changes
  useEffect(() => {
    if (query.length < 2) {
      setSearchResults(null)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/knowledge/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSearchResults(data)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const filteredFaqs = selectedCategory === 'All'
    ? faqs
    : faqs.filter(f => f.category === selectedCategory)

  const displayFaqs = (searchResults?.faqs?.length ?? 0) > 0 ? searchResults!.faqs! : filteredFaqs

  return (
    <div className="space-y-6">
      <PageGuide
        pageKey="knowledge"
        title="Knowledge Base"
        description="Find answers to common questions about policies, tools, and processes."
        steps={[
          { label: 'Search FAQ', description: 'Type a question to find instant answers from the knowledge base' },
          { label: 'Browse by category', description: 'Filter FAQs by topic categories like HR, IT, or Finance' },
          { label: 'Find SOPs and policies', description: 'Access standard operating procedures and company policies' },
        ]}
      />

      {/* Search Bar */}
      <div className="glass-card border border-white/10 rounded-xl p-6">
        <div className="relative">
          <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question... (e.g., 'What are the working hours?', 'How do I apply for leave?')"
            className="w-full pl-12 pr-4 py-3 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>

        {/* Quick Suggestions */}
        {!query && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-slate-400">Quick questions:</span>
            {['Working hours', 'Leave policy', 'Salary slip', 'Appraisal', 'Dress code'].map(suggestion => (
              <button
                key={suggestion}
                onClick={() => setQuery(suggestion)}
                className="px-3 py-1 text-sm bg-slate-800/50 hover:bg-white/10 rounded-full text-slate-300 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AI Answer Box */}
      {searchResults?.answer && (
        <div className={`glass-card border rounded-xl p-6 ${
          searchResults.confidence === 'high' ? 'border-green-200' :
          searchResults.confidence === 'medium' ? 'border-blue-200' :
          'border-amber-200'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              searchResults.confidence === 'high' ? 'bg-green-500/20' :
              searchResults.confidence === 'medium' ? 'bg-blue-500/20' :
              'bg-amber-500/20'
            }`}>
              <svg className={`w-5 h-5 ${
                searchResults.confidence === 'high' ? 'text-green-400' :
                searchResults.confidence === 'medium' ? 'text-blue-400' :
                'text-amber-400'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-white">Answer</h3>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                  searchResults.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
                  searchResults.confidence === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {searchResults.confidence === 'high' ? 'Best Match' :
                   searchResults.confidence === 'medium' ? 'Related' : 'Suggestions'}
                </span>
                {searchResults.source && (
                  <span className="px-2 py-0.5 text-xs bg-slate-800/50 text-slate-300 rounded">
                    {searchResults.source}
                  </span>
                )}
              </div>
              <p className="text-slate-200 whitespace-pre-line">{searchResults.answer}</p>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      {!searchResults && (
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'glass-card border border-white/10 text-slate-300 hover:bg-slate-900/40'
              }`}
            >
              {category !== 'All' && categoryIcons[category] && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={categoryIcons[category]} />
                </svg>
              )}
              {category}
            </button>
          ))}
        </div>
      )}

      {/* FAQ List */}
      <div className="glass-card border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">
            {searchResults ? `Search Results (${displayFaqs.length})` : `FAQs - ${selectedCategory}`}
          </h2>
        </div>
        <div className="divide-y divide-white/10">
          {displayFaqs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No FAQs found for this category
            </div>
          ) : (
            displayFaqs.map((faq: FAQ) => (
              <div key={faq.id} className="p-4">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full flex items-start justify-between text-left gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-white">{faq.question}</p>
                      <span className="text-xs text-slate-400 mt-1">{faq.category}</span>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${expandedFaq === faq.id ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === faq.id && (
                  <div className="mt-3 ml-11 p-4 bg-slate-900/40 rounded-lg">
                    <p className="text-sm text-slate-200 whitespace-pre-line">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Related Policies */}
      {((searchResults?.policies?.length ?? 0) > 0 || !searchResults) && (
        <div className="glass-card border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">
              {searchResults ? 'Related Policies' : 'Policy Handbook'}
            </h2>
          </div>
          <div className="divide-y divide-white/10">
            {(searchResults?.policies || policies).slice(0, 5).map((policy: Policy) => (
              <a
                key={policy.id}
                href={`/policies#chapter-${policy.id}`}
                className="block p-4 hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-400">{policy.id}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{policy.title}</p>
                    <p className="text-sm text-slate-400">{policy.subtitle}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
          <a
            href="/policies"
            className="block p-4 text-center text-sm font-medium text-blue-400 hover:bg-blue-500/10 border-t border-white/10"
          >
            View Full Policy Handbook
          </a>
        </div>
      )}

      {/* Help Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Can't find what you're looking for?</h3>
            <p className="text-white/80 mt-1">
              Contact HR on WhatsApp or raise a support ticket through the Issues section.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="/issues"
                className="px-4 py-2 glass-card text-blue-400 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Raise Support Ticket
              </a>
              <a
                href="/hr"
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
              >
                Contact HR
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
