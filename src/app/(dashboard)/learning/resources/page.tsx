'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { learningResources, learningCategories, youtubeChannels, recommendedBooks } from '@/shared/constants/learningResources'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

interface Comment {
  id: string
  resourceId: string
  content: string
  rating: number | null
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string | null
    department: string
  }
}

export default function LearningResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'english' | 'hindi'>('all')
  const [showPaidOnly, setShowPaidOnly] = useState<boolean | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedResource, setExpandedResource] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [newComment, setNewComment] = useState({ content: '', rating: 0 })
  const [loadingComments, setLoadingComments] = useState<string | null>(null)
  const [submittingComment, setSubmittingComment] = useState(false)

  const filteredResources = learningResources.filter(resource => {
    const matchesCategory = !selectedCategory || resource.category === selectedCategory
    const matchesType = !selectedType || resource.type === selectedType
    const matchesLanguage = selectedLanguage === 'all' || resource.language === selectedLanguage
    const matchesPaid = showPaidOnly === null || resource.isPaid === showPaidOnly
    const matchesSearch = !searchTerm ||
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesType && matchesLanguage && matchesPaid && matchesSearch
  })

  const filteredChannels = youtubeChannels.filter(channel =>
    selectedLanguage === 'all' || channel.language === selectedLanguage
  )

  const loadComments = async (resourceId: string) => {
    if (comments[resourceId]) return

    setLoadingComments(resourceId)
    try {
      const res = await fetch(`/api/learning/comments?resourceId=${resourceId}`)
      if (res.ok) {
        const data = await res.json()
        setComments(prev => ({ ...prev, [resourceId]: data }))
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoadingComments(null)
    }
  }

  const handleExpandResource = async (resourceId: string) => {
    if (expandedResource === resourceId) {
      setExpandedResource(null)
    } else {
      setExpandedResource(resourceId)
      await loadComments(resourceId)
    }
  }

  const handleSubmitComment = async (resourceId: string) => {
    if (!newComment.content.trim()) return

    setSubmittingComment(true)
    try {
      const res = await fetch('/api/learning/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId,
          content: newComment.content,
          rating: newComment.rating || null,
        }),
      })

      if (res.ok) {
        const comment = await res.json()
        setComments(prev => ({
          ...prev,
          [resourceId]: [comment, ...(prev[resourceId] || [])],
        }))
        setNewComment({ content: '', rating: 0 })
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'beginner':
        return <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">Beginner</span>
      case 'intermediate':
        return <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">Intermediate</span>
      case 'advanced':
        return <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">Advanced</span>
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    const iconClass = "w-5 h-5"
    switch (type) {
      case 'youtube':
        return <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
      case 'course':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
      case 'article':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      case 'tool':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      case 'book':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
      default:
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
    }
  }

  const getLanguageIcon = (language: string) => {
    const iconClass = "w-5 h-5"
    switch (language) {
      case 'hindi':
        return <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-orange-600 bg-orange-500/20 rounded">HI</span>
      case 'english':
        return <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-blue-400 bg-blue-500/20 rounded">EN</span>
      case 'both':
        return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Learning Resources</h1>
            <p className="text-purple-100">Curated courses, channels, and materials to level up your skills</p>
          </div>
          <Link
            href="/learning"
            className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >
            Log Learning Hours →
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-purple-400">{learningResources.length}</p>
          <p className="text-sm text-slate-400">Total Resources</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-green-400">{learningResources.filter(r => !r.isPaid).length}</p>
          <p className="text-sm text-slate-400">Free Resources</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-orange-600">{learningResources.filter(r => r.language === 'hindi').length}</p>
          <p className="text-sm text-slate-400">Hindi Resources</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-red-400">{youtubeChannels.length}</p>
          <p className="text-sm text-slate-400">YouTube Channels</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-amber-400">{recommendedBooks.length}</p>
          <p className="text-sm text-slate-400">Recommended Books</p>
        </div>
      </div>

      {/* Language Filter - Prominent */}
      <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl border border-orange-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Select Language / भाषा चुनें</h3>
            <p className="text-sm text-slate-400">Filter resources by your preferred language</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedLanguage('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                selectedLanguage === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'glass-card text-slate-300 hover:bg-slate-800/50 border border-white/10'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
              All
            </button>
            <button
              onClick={() => setSelectedLanguage('english')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                selectedLanguage === 'english'
                  ? 'bg-blue-600 text-white'
                  : 'glass-card text-slate-300 hover:bg-blue-500/10 border border-white/10'
              }`}
            >
              <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded ${selectedLanguage === 'english' ? 'bg-white/20 backdrop-blur-sm text-white' : 'bg-blue-500/20 text-blue-400'}`}>EN</span>
              English
            </button>
            <button
              onClick={() => setSelectedLanguage('hindi')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                selectedLanguage === 'hindi'
                  ? 'bg-orange-600 text-white'
                  : 'glass-card text-slate-300 hover:bg-orange-500/10 border border-white/10'
              }`}
            >
              <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded ${selectedLanguage === 'hindi' ? 'bg-white/20 backdrop-blur-sm text-white' : 'bg-orange-500/20 text-orange-400'}`}>HI</span>
              हिंदी
            </button>
          </div>
        </div>
      </div>

      {/* YouTube Channels */}
      <div className="glass-card rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Recommended YouTube Channels
          {selectedLanguage !== 'all' && (
            <span className="text-sm font-normal text-slate-400 ml-2">
              ({selectedLanguage === 'hindi' ? 'हिंदी' : 'English'})
            </span>
          )}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredChannels.map((channel, index) => (
            <a
              key={channel.name}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                channel.language === 'hindi'
                  ? 'bg-orange-500/10 hover:bg-orange-500/20'
                  : 'bg-red-500/10 hover:bg-red-500/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                channel.language === 'hindi' ? 'bg-orange-600' : 'bg-red-600'
              }`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate flex items-center gap-1">
                  {channel.name} {getLanguageIcon(channel.language)}
                </p>
                <p className="text-xs text-slate-400 truncate">{channel.focus}</p>
                <p className={`text-xs ${channel.language === 'hindi' ? 'text-orange-600' : 'text-red-400'}`}>
                  {channel.subscribers}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search resources, topics, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                !selectedCategory
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
              }`}
            >
              All Categories
            </button>
            {learningCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Type & Price Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                !selectedType
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
              }`}
            >
              All Types
            </button>
            {['course', 'youtube', 'article', 'tool'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
                  selectedType === type
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
                }`}
              >
                {getTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
            <div className="border-l border-white/10 mx-2" />
            <button
              onClick={() => setShowPaidOnly(showPaidOnly === false ? null : false)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showPaidOnly === false
                  ? 'bg-green-600 text-white'
                  : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
              }`}
            >
              Free Only
            </button>
            <button
              onClick={() => setShowPaidOnly(showPaidOnly === true ? null : true)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showPaidOnly === true
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
              }`}
            >
              Paid Only
            </button>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map(resource => (
          <div
            key={resource.id}
            className={`glass-card rounded-xl border transition-all ${
              expandedResource === resource.id
                ? 'border-purple-300 shadow-none col-span-full'
                : 'border-white/10 hover:border-purple-300 hover:shadow-none'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 text-slate-300">
                  {getTypeIcon(resource.type)}
                  <span className="text-xs text-slate-400">{resource.platform}</span>
                  {getLanguageIcon(resource.language)}
                </div>
                <div className="flex items-center gap-2">
                  {getLevelBadge(resource.level)}
                  {resource.isPaid ? (
                    <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">{resource.price}</span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">Free</span>
                  )}
                </div>
              </div>

              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <h3 className="font-medium text-slate-900 mb-1 hover:text-purple-400">{resource.title}</h3>
                <p className="text-sm text-slate-400 mb-3 line-clamp-2">{resource.description}</p>
              </a>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{resource.category}</span>
                {resource.duration && (
                  <span className="text-purple-400">{resource.duration}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mt-3">
                {resource.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-0.5 text-xs bg-slate-800/50 text-slate-400 rounded">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Comments Toggle */}
              <button
                onClick={() => handleExpandResource(resource.id)}
                className="mt-3 w-full py-2 text-sm text-purple-400 hover:text-purple-400 flex items-center justify-center gap-2 border-t border-white/5 pt-3"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {expandedResource === resource.id ? 'Hide Comments' : 'View Comments'}
                {comments[resource.id]?.length > 0 && ` (${comments[resource.id].length})`}
              </button>
            </div>

            {/* Expanded Comments Section */}
            {expandedResource === resource.id && (
              <div className="border-t border-white/5 p-4 bg-slate-900/40">
                {/* Add Comment Form */}
                <div className="mb-4">
                  <h4 className="font-medium text-slate-200 mb-2">Share your experience</h4>
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setNewComment(prev => ({ ...prev, rating: star }))}
                        className={`text-xl ${newComment.rating >= star ? 'text-yellow-400' : 'text-slate-300'}`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-sm text-slate-400 ml-2">
                      {newComment.rating > 0 ? `${newComment.rating}/5` : 'Rate this resource'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment.content}
                      onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write a comment or review..."
                      className="flex-1 px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={() => handleSubmitComment(resource.id)}
                      disabled={submittingComment || !newComment.content.trim()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {submittingComment ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-3">
                  {loadingComments === resource.id ? (
                    <p className="text-center text-slate-400 py-4">Loading comments...</p>
                  ) : comments[resource.id]?.length > 0 ? (
                    comments[resource.id].map(comment => (
                      <div key={comment.id} className="glass-card rounded-lg p-3 border border-white/10">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <UserAvatar user={{ id: comment.user.id || comment.id, firstName: comment.user.firstName, lastName: comment.user.lastName }} size="sm" showPreview={false} />
                            <div>
                              <p className="font-medium text-white text-sm">
                                {comment.user.firstName} {comment.user.lastName || ''}
                              </p>
                              <p className="text-xs text-slate-400">{comment.user.department}</p>
                            </div>
                          </div>
                          {comment.rating && (
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map(star => (
                                <span
                                  key={star}
                                  className={`text-sm ${comment.rating && comment.rating >= star ? 'text-yellow-400' : 'text-slate-200'}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-slate-300">{comment.content}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(comment.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 py-4">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No resources found matching your filters</p>
        </div>
      )}

      {/* Recommended Books */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recommended Reading</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedBooks.map((book, index) => (
            <div key={book.title} className="glass-card rounded-lg p-4 border border-amber-100">
              <div className="text-amber-400 mb-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h3 className="font-medium text-slate-900">{book.title}</h3>
              <p className="text-sm text-slate-600">by {book.author}</p>
              <p className="text-xs text-slate-600 mt-2">{book.description}</p>
              <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">
                {book.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Resource */}
      <div className="bg-slate-800 rounded-xl p-6 text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Know a Great Resource?</h3>
        <p className="text-slate-300 mb-4">Help your teammates by suggesting new learning materials</p>
        <button className="px-6 py-3 bg-white text-slate-900 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-sm">
          Suggest a Resource
        </button>
      </div>
    </div>
  )
}
