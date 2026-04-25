'use client'

import { useRef, useState } from 'react'
// Removed server action import to avoid stale action ID caching

export function CreatePostForm() {
    const formRef = useRef<HTMLFormElement>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [postType, setPostType] = useState('POST')
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const content = formData.get('content') as string

        setIsSubmitting(true)
        setErrorMsg(null)

        try {
            const res = await fetch('/api/network/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, type: postType })
            })

            const data = await res.json().catch(() => null)

            if (!res.ok || data?.error) {
                setErrorMsg(data?.error || `Server Error ${res.status}: Failed to create post`)
            } else {
                formRef.current?.reset()
                setPostType('POST')
                // Force refresh to show new post and bypass any Next.js caching
                window.location.reload()
            }
        } catch (e: any) {
            setErrorMsg(e.message || 'Unknown network error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="glass-card rounded-2xl border border-white/10 p-5">
            <h3 className="font-semibold text-white mb-4">Share Something</h3>
            {errorMsg && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm overflow-x-auto whitespace-pre-wrap">
                    <p className="font-bold mb-1">Upload Error:</p>
                    {errorMsg}
                </div>
            )}
            <form ref={formRef} onSubmit={handleSubmit}>
                <textarea
                    name="content"
                    placeholder="What's on your mind?"
                    required
                    className="w-full p-3 border border-white/10 rounded-xl text-sm text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                />
                <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setPostType('WIN')}
                            className={`p-2 rounded-lg transition-colors ${postType === 'WIN' ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:text-orange-500 hover:bg-slate-800/50'}`}
                            title="Add Milestone / Win"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => setPostType('IDEA')}
                            className={`p-2 rounded-lg transition-colors ${postType === 'IDEA' ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-400 hover:text-yellow-500 hover:bg-slate-800/50'}`}
                            title="Share Idea"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => setPostType('ANNOUNCEMENT')}
                            className={`p-2 rounded-lg transition-colors ${postType === 'ANNOUNCEMENT' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-blue-500 hover:bg-slate-800/50'}`}
                            title="Make Announcement"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    )
}
