'use client'

import { useState, useEffect, use } from 'react'
import { formatDateTimeIST } from '@/shared/utils/cn'
import Link from 'next/link'
import InfoTip from '@/client/components/ui/InfoTip'
import { toast } from 'sonner'

interface Author {
  type: 'client' | 'team'
  id: string
  name: string
}

interface FeedbackReply {
  id: string
  feedbackType: string
  message: string
  screenshotUrl: string | null
  status: string
  createdAt: string
  author: Author | null
}

interface Feedback {
  id: string
  feedbackType: string
  message: string
  screenshotUrl: string | null
  status: string
  createdAt: string
  resolvedAt: string | null
  author: Author | null
  replies: FeedbackReply[]
}

interface PageData {
  page: {
    id: string
    pageName: string
    pageSlug: string
    pageUrl: string | null
    pageType: string
    description: string | null
    status: string
    order: number
    wireframeUrl: string | null
    designUrl: string | null
    previewUrl: string | null
  }
  feedback: Feedback[]
  feedbackCount: number
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PLANNED: { label: 'Planned', color: 'text-slate-300', bg: 'bg-slate-800/50' },
  IN_DESIGN: { label: 'In Design', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  IN_DEVELOPMENT: { label: 'In Development', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  REVIEW: { label: 'Review', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  APPROVED: { label: 'Approved', color: 'text-green-400', bg: 'bg-green-500/20' },
  LIVE: { label: 'Live', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
}

const feedbackTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
  COMMENT: { label: 'Comment', color: 'text-slate-300', bg: 'bg-slate-800/50' },
  CHANGE_REQUEST: { label: 'Change Request', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  APPROVAL: { label: 'Approval', color: 'text-green-400', bg: 'bg-green-500/20' },
  QUESTION: { label: 'Question', color: 'text-blue-400', bg: 'bg-blue-500/20' },
}

export default function PageDetailPage({ params }: { params: Promise<{ pageId: string }> }) {
  const resolvedParams = use(params)
  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbackType, setFeedbackType] = useState<string>('COMMENT')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState('')

  useEffect(() => {
    fetchPageData()
  }, [resolvedParams.pageId])

  const fetchPageData = async () => {
    try {
      const res = await fetch(`/api/web-portal/sitemap/${resolvedParams.pageId}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setData(data)
    } catch (error) {
      console.error('Failed to fetch page:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/web-portal/sitemap/${resolvedParams.pageId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackType,
          message: message.trim(),
        }),
      })

      if (res.ok) {
        setMessage('')
        setShowFeedbackForm(false)
        fetchPageData()
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      toast.error('Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyMessage.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/web-portal/sitemap/${resolvedParams.pageId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackType: 'COMMENT',
          message: replyMessage.trim(),
          parentId,
        }),
      })

      if (res.ok) {
        setReplyMessage('')
        setReplyingTo(null)
        fetchPageData()
      }
    } catch (error) {
      console.error('Failed to submit reply:', error)
      toast.error('Failed to submit reply')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-white">Page not found</h2>
        <Link href="/portal/web/sitemap" className="text-teal-600 hover:underline mt-2 inline-block">
          Back to sitemap
        </Link>
      </div>
    )
  }

  const { page, feedback } = data

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/portal/web" className="text-slate-400 hover:text-teal-600">Dashboard</Link>
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <Link href="/portal/web/sitemap" className="text-slate-400 hover:text-teal-600">Website Pages</Link>
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-white font-medium">{page.pageName}</span>
      </div>

      {/* Page Header */}
      <div className="glass-card rounded-xl border border-white/10 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{page.pageName}</h1>
              <span className={`text-sm px-3 py-1 rounded-full ${statusConfig[page.status]?.bg} ${statusConfig[page.status]?.color}`}>
                {statusConfig[page.status]?.label || page.status}
              </span>
            </div>
            <p className="text-slate-400 mt-2">{page.pageSlug}</p>
            {page.description && (
              <p className="text-slate-300 mt-3">{page.description}</p>
            )}
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-2">
            {page.wireframeUrl && (
              <a
                href={page.wireframeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 text-slate-200 rounded-lg hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Wireframe
              </a>
            )}
            {page.designUrl && (
              <a
                href={page.designUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Design
              </a>
            )}
            {page.previewUrl && (
              <a
                href={page.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </a>
            )}
            {page.pageUrl && (
              <a
                href={page.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Live Page
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="glass-card rounded-xl border border-white/10">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Feedback & Comments ({feedback.length})
            </h2>
            <button
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Feedback
            </button>
          </div>

          {/* Feedback Form */}
          {showFeedbackForm && (
            <form onSubmit={handleSubmitFeedback} className="mt-4 p-4 bg-slate-900/40 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Feedback Type <InfoTip text="COMMENT = general feedback, CHANGE REQUEST = what you want changed, APPROVAL = looks good, QUESTION = need clarification." />
                </label>
                <div className="flex gap-2">
                  {Object.entries(feedbackTypeConfig).map(([type, config]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFeedbackType(type)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        feedbackType === type
                          ? `${config.bg} ${config.color} border-current`
                          : 'glass-card border-white/10 text-slate-300 hover:bg-slate-900/40'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Message <InfoTip text="Be specific about the page, section, and desired outcome. Include what you see vs what you expect." type="action" />
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your feedback, questions, or change requests..."
                  className="w-full px-4 py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackForm(false)}
                  className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Feedback List */}
        <div className="divide-y divide-white/10">
          {feedback.length > 0 ? (
            feedback.map((item) => (
              <div key={item.id} className="p-6">
                {/* Main Feedback */}
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.author?.type === 'team' ? 'bg-teal-100' : 'bg-slate-800/50'
                  }`}>
                    <span className={`text-sm font-medium ${
                      item.author?.type === 'team' ? 'text-teal-600' : 'text-slate-300'
                    }`}>
                      {item.author?.name.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">
                        {item.author?.name || 'Unknown'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${feedbackTypeConfig[item.feedbackType]?.bg} ${feedbackTypeConfig[item.feedbackType]?.color}`}>
                        {feedbackTypeConfig[item.feedbackType]?.label || item.feedbackType}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' :
                        item.status === 'ACKNOWLEDGED' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-slate-300 whitespace-pre-wrap">{item.message}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-slate-400">
                        {formatDateTimeIST(item.createdAt)}
                      </span>
                      <button
                        onClick={() => setReplyingTo(replyingTo === item.id ? null : item.id)}
                        className="text-xs text-teal-600 hover:underline"
                      >
                        Reply
                      </button>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === item.id && (
                      <div className="mt-4 pl-4 border-l-2 border-white/10">
                        <textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Write a reply..."
                          className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => {
                              setReplyingTo(null)
                              setReplyMessage('')
                            }}
                            className="px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800/50 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSubmitReply(item.id)}
                            disabled={submitting || !replyMessage.trim()}
                            className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                          >
                            {submitting ? 'Sending...' : 'Send Reply'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {item.replies.length > 0 && (
                      <div className="mt-4 space-y-4 pl-4 border-l-2 border-white/10">
                        {item.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              reply.author?.type === 'team' ? 'bg-teal-100' : 'bg-slate-800/50'
                            }`}>
                              <span className={`text-xs font-medium ${
                                reply.author?.type === 'team' ? 'text-teal-600' : 'text-slate-300'
                              }`}>
                                {reply.author?.name.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-white">
                                  {reply.author?.name || 'Unknown'}
                                </span>
                                {reply.author?.type === 'team' && (
                                  <span className="text-xs text-teal-600">Team</span>
                                )}
                              </div>
                              <p className="text-sm text-slate-300">{reply.message}</p>
                              <span className="text-xs text-slate-400">
                                {formatDateTimeIST(reply.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium text-white mb-1">No feedback yet</h3>
              <p className="text-slate-400">Be the first to share your thoughts on this page</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
