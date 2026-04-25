'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/client/components/ui'
import Link from 'next/link'

type ContentType = 'video' | 'text' | 'document' | 'interactive' | 'checklist'
type Category = 'day0' | 'toolMastery' | 'deptSops' | 'compliance' | 'kt'

interface AcademyContent {
  id: string
  title: string
  description: string
  contentType: ContentType
  category: Category
  thumbnail?: string
  estimatedMinutes: number
  mandatory: boolean
  isKtContent: boolean
  tags: string[]
  completedByUser: boolean
  progress?: number
}

// Default content as fallback when database is empty
const defaultContentByCategory: Record<Category, { title: string; description: string; gradient: string; items: AcademyContent[] }> = {
  day0: {
    title: 'Day 0 Preparation',
    description: 'Essential onboarding content for new Pioneers',
    gradient: 'from-purple-600 to-blue-600',
    items: [
      { id: 'd1', title: 'Welcome to Pioneer', description: 'Company culture, values, and your journey begins', contentType: 'video', category: 'day0', estimatedMinutes: 15, mandatory: true, isKtContent: false, tags: ['onboarding'], completedByUser: false, progress: 0 },
      { id: 'd2', title: 'NDA & Policy Charter', description: 'Understanding your legal obligations', contentType: 'document', category: 'day0', estimatedMinutes: 30, mandatory: true, isKtContent: false, tags: ['legal', 'compliance'], completedByUser: false, progress: 0 },
      { id: 'd3', title: 'Biometric & Attendance Setup', description: 'Setting up your daily punch-in system', contentType: 'checklist', category: 'day0', estimatedMinutes: 10, mandatory: true, isKtContent: false, tags: ['setup'], completedByUser: false, progress: 0 },
      { id: 'd4', title: 'Your First Week Guide', description: 'What to expect in your first 7 days', contentType: 'interactive', category: 'day0', estimatedMinutes: 20, mandatory: true, isKtContent: false, tags: ['onboarding'], completedByUser: false, progress: 0 },
      { id: 'd5', title: 'Meet Your Team', description: 'Department introductions and key contacts', contentType: 'video', category: 'day0', estimatedMinutes: 25, mandatory: false, isKtContent: false, tags: ['team'], completedByUser: false },
    ],
  },
  toolMastery: {
    title: 'Tool Mastery',
    description: 'Master the Pioneer tech stack',
    gradient: 'from-green-600 to-teal-600',
    items: [
      { id: 't1', title: 'AIFILMZ Complete Guide', description: 'AI video generation for healthcare marketing', contentType: 'video', category: 'toolMastery', estimatedMinutes: 45, mandatory: false, isKtContent: false, tags: ['aifilmz', 'video'], completedByUser: false },
      { id: 't2', title: 'AITELZ Setup & Training', description: 'Configure AI telephone receptionist', contentType: 'interactive', category: 'toolMastery', estimatedMinutes: 60, mandatory: false, isKtContent: false, tags: ['aitelz', 'ai'], completedByUser: false, progress: 0 },
      { id: 't3', title: 'WACRS WhatsApp CRM', description: 'Patient communication automation', contentType: 'video', category: 'toolMastery', estimatedMinutes: 35, mandatory: false, isKtContent: false, tags: ['wacrs', 'whatsapp'], completedByUser: false },
      { id: 't4', title: 'ReviewMagnet Mastery', description: 'Automated review collection system', contentType: 'video', category: 'toolMastery', estimatedMinutes: 25, mandatory: false, isKtContent: false, tags: ['reviews'], completedByUser: false, progress: 0 },
      { id: 't5', title: 'RAIN CRM Deep Dive', description: 'Lead management and patient journeys', contentType: 'interactive', category: 'toolMastery', estimatedMinutes: 50, mandatory: false, isKtContent: false, tags: ['rain', 'crm'], completedByUser: false },
    ],
  },
  deptSops: {
    title: 'Department SOPs',
    description: 'Standard operating procedures by team',
    gradient: 'from-orange-600 to-red-600',
    items: [
      { id: 's1', title: 'Web Dev Standards', description: 'Code quality, deployment, and review process', contentType: 'document', category: 'deptSops', estimatedMinutes: 40, mandatory: false, isKtContent: false, tags: ['web', 'coding'], completedByUser: false },
      { id: 's2', title: 'SEO Best Practices 2024', description: 'Algorithm updates and ranking strategies', contentType: 'document', category: 'deptSops', estimatedMinutes: 55, mandatory: false, isKtContent: false, tags: ['seo'], completedByUser: false },
      { id: 's3', title: 'Paid Ads Compliance', description: 'Healthcare advertising regulations', contentType: 'video', category: 'deptSops', estimatedMinutes: 30, mandatory: true, isKtContent: false, tags: ['ads', 'compliance'], completedByUser: false },
      { id: 's4', title: 'Social Media Playbook', description: 'Content guidelines and engagement rules', contentType: 'document', category: 'deptSops', estimatedMinutes: 35, mandatory: false, isKtContent: false, tags: ['social'], completedByUser: false, progress: 0 },
      { id: 's5', title: 'Client Communication Protocol', description: 'How to communicate with clients professionally', contentType: 'checklist', category: 'deptSops', estimatedMinutes: 20, mandatory: true, isKtContent: false, tags: ['clients'], completedByUser: false },
    ],
  },
  compliance: {
    title: 'Compliance & Policies',
    description: 'Mandatory compliance training',
    gradient: 'from-red-600 to-pink-600',
    items: [
      { id: 'c1', title: 'POSH Training', description: 'Prevention of Sexual Harassment guidelines', contentType: 'video', category: 'compliance', estimatedMinutes: 45, mandatory: true, isKtContent: false, tags: ['posh', 'hr'], completedByUser: false, progress: 0 },
      { id: 'c2', title: 'Data Privacy & HIPAA', description: 'Handling patient data responsibly', contentType: 'interactive', category: 'compliance', estimatedMinutes: 40, mandatory: true, isKtContent: false, tags: ['privacy', 'hipaa'], completedByUser: false },
      { id: 'c3', title: 'Conflict of Interest', description: 'Understanding and avoiding conflicts', contentType: 'document', category: 'compliance', estimatedMinutes: 20, mandatory: true, isKtContent: false, tags: ['ethics'], completedByUser: false },
      { id: 'c4', title: 'Information Security', description: 'Protecting company and client data', contentType: 'checklist', category: 'compliance', estimatedMinutes: 25, mandatory: true, isKtContent: false, tags: ['security'], completedByUser: false },
    ],
  },
  kt: {
    title: 'Knowledge Transfer',
    description: 'Learn from departing team members',
    gradient: 'from-blue-600 to-indigo-600',
    items: [
      { id: 'k1', title: 'Facebook Ads Setup - Ravi', description: 'Healthcare lead gen campaign setup process', contentType: 'video', category: 'kt', estimatedMinutes: 40, mandatory: false, isKtContent: true, tags: ['ads', 'facebook'], completedByUser: false },
      { id: 'k2', title: 'HealthFirst Account - Priya', description: 'Complete client history and preferences', contentType: 'video', category: 'kt', estimatedMinutes: 35, mandatory: false, isKtContent: true, tags: ['client', 'handover'], completedByUser: false },
      { id: 'k3', title: 'SEO Workflow - Amit', description: 'Monthly SEO reporting automation', contentType: 'document', category: 'kt', estimatedMinutes: 30, mandatory: false, isKtContent: true, tags: ['seo', 'automation'], completedByUser: false },
    ],
  },
}

const contentTypeIcons: Record<ContentType, React.JSX.Element> = {
  video: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>,
  text: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  document: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  interactive: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>,
  checklist: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
}

const typeLabels: Record<ContentType, string> = {
  video: 'Video',
  text: 'Article',
  document: 'PDF',
  interactive: 'Interactive',
  checklist: 'Checklist',
}

function ContentRow({ category, data }: { category: Category; data: typeof defaultContentByCategory[Category] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="relative group">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="text-xl font-semibold text-white">{data.title}</h2>
          <p className="text-sm text-slate-400">{data.description}</p>
        </div>
        <button
          onClick={() => {
            scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
          }}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View All →
        </button>
      </div>

      {/* Scroll Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 mt-4 -translate-y-1/2 z-10 w-10 h-10 bg-slate-900/90 border border-slate-700 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-800"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 mt-4 -translate-y-1/2 z-10 w-10 h-10 bg-slate-900/90 border border-slate-700 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-800"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {data.items.map((item) => (
          <ContentCard key={item.id} item={item} gradient={data.gradient} />
        ))}
      </div>
    </div>
  )
}

function ContentCard({ item, gradient }: { item: AcademyContent; gradient: string }) {
  return (
    <div className="flex-shrink-0 w-72 group/card cursor-pointer">
      <div className="relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all hover:scale-[1.02] hover:shadow-none">
        {/* Thumbnail */}
        <div className={`relative h-40 bg-gradient-to-br ${gradient}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm backdrop-blur rounded-full flex items-center justify-center group-hover/card:scale-110 transition-transform">
              <div className="text-white scale-150">
                {contentTypeIcons[item.contentType]}
              </div>
            </div>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
            {item.estimatedMinutes} min
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {item.mandatory && (
              <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs font-medium rounded">
                Required
              </span>
            )}
            {item.isKtContent && (
              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded">
                KT
              </span>
            )}
          </div>

          {/* Completion Check */}
          {item.completedByUser && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          {/* Progress Bar */}
          {item.progress !== undefined && item.progress > 0 && item.progress < 100 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              {contentTypeIcons[item.contentType]}
              {typeLabels[item.contentType]}
            </span>
          </div>
          <h3 className="font-medium text-white text-sm line-clamp-2 mb-1">
            {item.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AcademyPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [contentByCategory, setContentByCategory] = useState(defaultContentByCategory)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    mandatory: 0,
    completedMandatory: 0,
    totalMinutes: 0,
  })

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/academy/content')
        if (res.ok) {
          const data = await res.json()

          // Check if we have any content from the database
          const hasDbContent = Object.values(data.content as Record<string, { items: AcademyContent[] }>).some(
            cat => cat.items && cat.items.length > 0
          )

          if (hasDbContent) {
            // Merge database content with default metadata
            const mergedContent = { ...defaultContentByCategory }
            Object.keys(data.content).forEach(key => {
              const category = key as Category
              if (mergedContent[category] && data.content[category].items.length > 0) {
                mergedContent[category] = {
                  ...mergedContent[category],
                  items: data.content[category].items,
                }
              }
            })
            setContentByCategory(mergedContent)
            setStats(data.stats)
          } else {
            // Use default content, calculate stats from it
            const allItems = Object.values(defaultContentByCategory).flatMap(c => c.items)
            setStats({
              total: allItems.length,
              completed: allItems.filter(i => i.completedByUser).length,
              mandatory: allItems.filter(i => i.mandatory).length,
              completedMandatory: allItems.filter(i => i.mandatory && i.completedByUser).length,
              totalMinutes: allItems.filter(i => i.completedByUser).reduce((sum, i) => sum + i.estimatedMinutes, 0),
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch academy content:', error)
        // Fall back to default content
        const allItems = Object.values(defaultContentByCategory).flatMap(c => c.items)
        setStats({
          total: allItems.length,
          completed: allItems.filter(i => i.completedByUser).length,
          mandatory: allItems.filter(i => i.mandatory).length,
          completedMandatory: allItems.filter(i => i.mandatory && i.completedByUser).length,
          totalMinutes: allItems.filter(i => i.completedByUser).reduce((sum, i) => sum + i.estimatedMinutes, 0),
        })
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [])

  // Calculate stats from current content
  const allItems = Object.values(contentByCategory).flatMap(c => c.items)
  const completedCount = stats.completed || allItems.filter(i => i.completedByUser).length
  const mandatoryCount = stats.mandatory || allItems.filter(i => i.mandatory).length
  const completedMandatory = stats.completedMandatory || allItems.filter(i => i.mandatory && i.completedByUser).length
  const totalMinutes = stats.totalMinutes || allItems.filter(i => i.completedByUser).reduce((sum, i) => sum + i.estimatedMinutes, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 -mx-4 md:-mx-6">
      {/* Hero Section */}
      <div className="relative px-4 md:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 p-8">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Pioneer Academy</h1>
              <p className="text-blue-200 max-w-lg">
                Your learning hub for mastering the Pioneer way. Complete mandatory training, explore tool guides, and grow your expertise.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/learning"
                className="px-6 py-3 glass-card text-white font-medium rounded-lg hover:bg-blue-500/10 transition-colors"
              >
                Log Learning Hours
              </Link>
              <button className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/20 transition-colors backdrop-blur">
                My Progress
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800">
            <p className="text-sm text-slate-400">Completed</p>
            <p className="text-2xl font-bold text-white mt-1">{completedCount}/{allItems.length}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800">
            <p className="text-sm text-slate-400">Mandatory</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{completedMandatory}/{mandatoryCount}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800">
            <p className="text-sm text-slate-400">Hours Learned</p>
            <p className="text-2xl font-bold text-purple-400 mt-1">{(totalMinutes / 60).toFixed(1)}h</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800">
            <p className="text-sm text-slate-400">Monthly Target</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${Math.min((totalMinutes / 60 / 6) * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm text-white font-medium">6h</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 md:px-6">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, tutorials, guides..."
            className="w-full px-4 py-3 pl-12 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Content Rows - Netflix Style */}
      <div className="space-y-10 px-4 md:px-6">
        {(Object.entries(contentByCategory) as [Category, typeof contentByCategory[Category]][]).map(([category, data]) => (
          <ContentRow key={category} category={category} data={data} />
        ))}
      </div>

      {/* Continue Watching Section */}
      <div className="px-4 md:px-6 pb-8">
        <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Continue Where You Left Off</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {allItems
              .filter(i => i.progress && i.progress > 0 && i.progress < 100)
              .slice(0, 3)
              .map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                    <div className="text-white scale-125">
                      {contentTypeIcons[item.contentType]}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">{item.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
