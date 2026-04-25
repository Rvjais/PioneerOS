'use client'

import { useState, ReactNode } from 'react'
import { policyChapters } from '@/shared/constants/policyContent'
import Link from 'next/link'
import {
  Rocket, Clock, Laptop, Target, Building2, Phone, Shield,
  Timer, Calendar, Home, Wallet, Gift, TrendingUp, BarChart3,
  Gamepad2, Lock, AlertTriangle, Plane, HandMetal, GraduationCap,
  Monitor, BookOpen, FileText
} from 'lucide-react'

// Category icons and colors
const categoryConfig: { [key: number]: { icon: ReactNode; color: string; bgColor: string } } = {
  1: { icon: <Rocket className="w-5 h-5" />, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  2: { icon: <Clock className="w-5 h-5" />, color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  3: { icon: <Laptop className="w-5 h-5" />, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  4: { icon: <Target className="w-5 h-5" />, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  5: { icon: <Building2 className="w-5 h-5" />, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  6: { icon: <Phone className="w-5 h-5" />, color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' },
  7: { icon: <Shield className="w-5 h-5" />, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  8: { icon: <Timer className="w-5 h-5" />, color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  9: { icon: <Calendar className="w-5 h-5" />, color: 'text-teal-400', bgColor: 'bg-teal-500/20' },
  10: { icon: <Home className="w-5 h-5" />, color: 'text-violet-400', bgColor: 'bg-violet-500/20' },
  11: { icon: <Wallet className="w-5 h-5" />, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  12: { icon: <Gift className="w-5 h-5" />, color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  13: { icon: <TrendingUp className="w-5 h-5" />, color: 'text-lime-400', bgColor: 'bg-lime-500/20' },
  14: { icon: <BarChart3 className="w-5 h-5" />, color: 'text-sky-400', bgColor: 'bg-sky-500/20' },
  15: { icon: <Gamepad2 className="w-5 h-5" />, color: 'text-fuchsia-400', bgColor: 'bg-fuchsia-500/20' },
  16: { icon: <Lock className="w-5 h-5" />, color: 'text-rose-400', bgColor: 'bg-rose-500/20' },
  17: { icon: <AlertTriangle className="w-5 h-5" />, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  18: { icon: <Plane className="w-5 h-5" />, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  19: { icon: <HandMetal className="w-5 h-5" />, color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  20: { icon: <GraduationCap className="w-5 h-5" />, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  21: { icon: <Monitor className="w-5 h-5" />, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
}

const defaultIcon = <FileText className="w-5 h-5" />

export default function PoliciesPage() {
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'reader' | 'grid'>('reader')

  const currentChapter = policyChapters.find(c => c.id === selectedChapter)

  const filteredChapters = policyChapters.filter(chapter =>
    chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chapter.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chapter.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderContent = (content: string) => {
    const lines = content.split('\n')
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-semibold text-slate-900 mt-6 mb-3">{line.replace('### ', '')}</h3>
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold text-slate-900 mt-8 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
          {line.replace('## ', '')}
        </h2>
      }

      // Tables
      if (line.startsWith('|')) {
        const cells = line.split('|').filter(c => c.trim())
        const isHeader = lines[index + 1]?.includes('---')
        const isDivider = line.includes('---')

        if (isDivider) return null

        return (
          <div key={index} className={`grid gap-2 py-2 px-3 ${isHeader ? 'bg-slate-100 rounded-t-lg font-semibold text-slate-900' : 'bg-slate-50 border-b border-slate-200'}`}
               style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}>
            {cells.map((cell, i) => (
              <span key={i} className={isHeader ? 'text-slate-700' : 'text-slate-600'}>{cell.trim()}</span>
            ))}
          </div>
        )
      }

      // Bullet points
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="ml-6 text-slate-600 list-none flex items-start gap-2 mb-1">
            <span className="text-blue-500 mt-1.5">•</span>
            <span>{formatInlineStyles(line.replace('- ', ''))}</span>
          </li>
        )
      }

      // Numbered lists
      const numberedMatch = line.match(/^(\d+)\.\s(.+)/)
      if (numberedMatch) {
        return (
          <li key={index} className="ml-6 text-slate-600 list-none flex items-start gap-3 mb-2">
            <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-sm font-semibold shrink-0">
              {numberedMatch[1]}
            </span>
            <span>{formatInlineStyles(numberedMatch[2])}</span>
          </li>
        )
      }

      // Empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-3" />
      }

      // Horizontal rule
      if (line.trim() === '---') {
        return <hr key={index} className="border-slate-200 my-6" />
      }

      // Regular paragraphs with bold formatting
      return <p key={index} className="text-slate-600 mb-2 leading-relaxed">{formatInlineStyles(line)}</p>
    })
  }

  const formatInlineStyles = (text: string) => {
    if (text.includes('**')) {
      const parts = text.split(/\*\*(.+?)\*\*/)
      return parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i} className="font-semibold text-slate-900">{part}</strong> : part
      )
    }
    return text
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTItNCAwLTQgMiAyIDQgMiA0IDIgMiA0IDIgNC0yIDAtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm backdrop-blur flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Company Policy Guidebook</h1>
                <p className="text-indigo-100">Complete guide to working at Branding Pioneers with Pioneer OS</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-white/20 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => setViewMode('reader')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'reader' ? 'bg-white shadow-sm border border-indigo-100' : 'text-white/90 border border-transparent hover:bg-white/10'
                }`}
                style={viewMode === 'reader' ? { color: '#4338ca' } : {}}
              >
                Reader
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm border border-indigo-100' : 'text-white/90 border border-transparent hover:bg-white/10'
                }`}
                style={viewMode === 'grid' ? { color: '#4338ca' } : {}}
              >
                Overview
              </button>
            </div>
            <Link
              href="/policies/employee-agreement"
              className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg text-sm font-medium transition-colors text-white/90 backdrop-blur"
            >
              Employee Agreement
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="text-3xl font-bold text-slate-900">{policyChapters.length}</div>
          <div className="text-sm font-medium text-slate-600">Chapters</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="text-3xl font-bold text-slate-900">8</div>
          <div className="text-sm font-medium text-slate-600">Core Areas</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="text-3xl font-bold text-slate-900">2026</div>
          <div className="text-sm font-medium text-slate-600">Updated For</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="text-3xl font-bold text-emerald-600">Active</div>
          <div className="text-sm font-medium text-slate-600">Status</div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        // Grid View
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {policyChapters.map((chapter) => {
            const config = categoryConfig[chapter.id] || { icon: defaultIcon, color: 'text-slate-400', bgColor: 'bg-slate-900/20' }
            return (
              <button
                key={chapter.id}
                onClick={() => {
                  setSelectedChapter(chapter.id)
                  setViewMode('reader')
                }}
                className="bg-white rounded-xl border border-slate-200 p-4 text-left hover:border-indigo-200 hover:shadow-md transition-all group"
              >
                <div className={`w-10 h-10 ${config.bgColor.replace('slate-900/20', 'indigo-100')} rounded-lg flex items-center justify-center mb-3 ${config.color.replace('slate-400', 'indigo-600')}`}>
                  {config.icon}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-500">Chapter {chapter.id}</span>
                </div>
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {chapter.title}
                </h3>
                <p className="text-sm text-slate-600 mt-1 line-clamp-1">{chapter.subtitle}</p>
              </button>
            )
          })}
        </div>
      ) : (
        // Reader View
        <div className="flex gap-6">
          {/* Sidebar - Chapter Navigation */}
          <div className="w-80 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-6">
              <div className="mb-4">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search policies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
                {(searchTerm ? filteredChapters : policyChapters).map((chapter) => {
                  const config = categoryConfig[chapter.id] || { icon: defaultIcon, color: 'text-slate-400', bgColor: 'bg-slate-900/20' }
                  return (
                    <button
                      key={chapter.id}
                      onClick={() => setSelectedChapter(chapter.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedChapter === chapter.id
                          ? 'bg-indigo-50 border border-indigo-200 shadow-sm'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`${config.color}`}>{config.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${
                              selectedChapter === chapter.id ? 'text-indigo-400' : 'text-slate-400'
                            }`}>
                              {String(chapter.id).padStart(2, '0')}
                            </span>
                          </div>
                          <p className={`text-sm font-medium truncate ${
                            selectedChapter === chapter.id ? 'text-indigo-800' : 'text-slate-600'
                          }`}>
                            {chapter.title}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{chapter.subtitle}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8">
              {currentChapter && (
                <>
                  <div className="mb-6 pb-6 border-b border-slate-200">
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-12 h-12 ${categoryConfig[currentChapter.id]?.bgColor?.replace('slate-900/20','indigo-100') || 'bg-indigo-100'} rounded-xl flex items-center justify-center ${categoryConfig[currentChapter.id]?.color?.replace('slate-400','indigo-600') || 'text-indigo-600'}`}>
                        {categoryConfig[currentChapter.id]?.icon || defaultIcon}
                      </div>
                      <div>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full border border-indigo-200">
                          Chapter {currentChapter.id} of {policyChapters.length}
                        </span>
                      </div>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">{currentChapter.title}</h1>
                    <p className="text-slate-600 font-medium mt-1">{currentChapter.subtitle}</p>
                  </div>

                  <div className="prose prose-slate max-w-none">
                    {renderContent(currentChapter.content)}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                    <button
                      onClick={() => setSelectedChapter(Math.max(1, selectedChapter - 1))}
                      disabled={selectedChapter === 1}
                      className="flex items-center gap-2 px-4 py-2 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous Chapter
                    </button>
                    <div className="flex items-center gap-1">
                      {policyChapters.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedChapter(i + 1)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            selectedChapter === i + 1 ? 'bg-indigo-600' : 'bg-slate-300 hover:bg-slate-400'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setSelectedChapter(Math.min(policyChapters.length, selectedChapter + 1))}
                      disabled={selectedChapter === policyChapters.length}
                      className="flex items-center gap-2 px-4 py-2 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next Chapter
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Quick Links */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <Link
                href="/policies/employee-agreement"
                className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 hover:border-blue-500/50 hover:bg-slate-800 transition-all group"
              >
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">Employee Agreement</h3>
                <p className="text-sm text-slate-400 mt-1">NDA & Employment Bond</p>
              </Link>

              <Link
                href="/training"
                className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 hover:border-purple-500/50 hover:bg-slate-800 transition-all group"
              >
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-medium text-white group-hover:text-purple-400 transition-colors">Learning Portal</h3>
                <p className="text-sm text-slate-400 mt-1">Training & Resources</p>
              </Link>

              <Link
                href="/tools"
                className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 hover:border-green-500/50 hover:bg-slate-800 transition-all group"
              >
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-medium text-white group-hover:text-green-400 transition-colors">SaaS Tools</h3>
                <p className="text-sm text-slate-400 mt-1">Company Tools & Logins</p>
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
      `}</style>
    </div>
  )
}
