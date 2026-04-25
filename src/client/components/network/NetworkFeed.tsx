'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

interface Post {
  id: string
  type: string
  content: string
  isPinned: boolean
  createdAt: Date
  user: {
    id: string
    firstName: string
    lastName: string | null
    department: string
    role?: string
    email?: string | null
    profile?: { profilePicture: string | null } | null
  }
  _count: {
    comments: number
    likes: number
  }
  likes: { userId: string }[]
  comments?: {
    id: string
    content: string
    createdAt: Date
    user: {
      id: string
      firstName: string
      lastName: string | null
      profile?: { profilePicture: string | null } | null
    }
  }[]
}

interface NetworkFeedProps {
  posts: Post[]
  currentUserId: string
}

const typeIcons: Record<string, React.ReactNode> = {
  POST: <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  ANNOUNCEMENT: <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
  WIN: <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  IDEA: <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
}

export function NetworkFeed({ posts, currentUserId }: NetworkFeedProps) {
  const [filter, setFilter] = useState('ALL')
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null)

  const filteredPosts = filter === 'ALL' ? posts : posts.filter(p => p.type === filter)

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch('/api/network/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })
      if (res.ok) window.location.reload()
    } catch (e) {
      console.error('Failed to toggle like', e)
    }
  }

  const handleComment = async (e: React.FormEvent<HTMLFormElement>, postId: string) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const content = formData.get('content') as string
    if (!content.trim()) return

    try {
      const res = await fetch('/api/network/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content }),
      })
      if (res.ok) {
        setActiveCommentId(null)
        window.location.reload()
      }
    } catch (e) {
      console.error('Failed to post comment', e)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['ALL', 'POST', 'WIN', 'ANNOUNCEMENT', 'IDEA'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${filter === type
              ? 'bg-blue-600 text-white'
              : 'glass-card border border-white/10 text-slate-300 hover:bg-slate-900/40'
              }`}
          >
            {type === 'ALL' ? 'All Posts' : type.charAt(0) + type.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="glass-card rounded-2xl border border-white/10 p-8 text-center text-slate-400">
            No posts yet. Be the first to share something!
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isLiked = post.likes.some(l => l.userId === currentUserId)
            return (
              <div key={post.id} className={`glass-card rounded-2xl border border-white/10 overflow-hidden ${post.isPinned ? 'ring-2 ring-blue-200' : ''}`}>
                {post.isPinned && (
                  <div className="px-5 py-2 bg-blue-500/10 border-b border-blue-100 text-xs text-blue-400 font-medium flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    Pinned
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <UserAvatar user={post.user} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/team/${post.user.id}`} className="hover:underline">
                          <p className="font-semibold text-white">
                            {post.user.firstName} {post.user.lastName || ''}
                          </p>
                        </Link>
                        <span className="text-xs text-slate-400">{post.user.department}</span>
                        <span title={post.type} className="ml-1">{typeIcons[post.type]}</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{formatTime(post.createdAt)}</p>
                      <p className="text-slate-200 whitespace-pre-wrap">{post.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 text-sm ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'} transition-colors`}
                    >
                      <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      <span>{post._count.likes}</span>
                    </button>
                    <button
                      onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)}
                      className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <svg className="w-5 h-5 fill-none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      <span>{post._count.comments} comments</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-green-400 transition-colors ml-auto">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {(activeCommentId === post.id || (post.comments && post.comments.length > 0)) && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                      {post.comments?.map(comment => (
                        <div key={comment.id} className="flex gap-3 text-sm">
                          <UserAvatar user={comment.user} size="sm" />
                          <div className="flex-1 bg-slate-900/40 rounded-xl rounded-tl-none p-3 border border-white/5">
                            <div className="flex justify-between items-baseline mb-1">
                              <Link href={`/team/${comment.user.id}`} className="hover:underline">
                                <p className="font-semibold text-white">{comment.user.firstName} {comment.user.lastName || ''}</p>
                              </Link>
                              <span className="text-[10px] text-slate-400">{formatTime(comment.createdAt)}</span>
                            </div>
                            <p className="text-slate-300">{comment.content}</p>
                          </div>
                        </div>
                      ))}

                      {activeCommentId === post.id && (
                        <form
                          onSubmit={(e) => handleComment(e, post.id)}
                          className="flex gap-2"
                        >
                          <input
                            name="content"
                            type="text"
                            required
                            placeholder="Write a comment..."
                            className="flex-1 text-sm text-white bg-slate-900/40 border border-white/10 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                            Reply
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
