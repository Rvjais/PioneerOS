'use client'

import { useState } from 'react'
import Link from 'next/link'
import InfoTip from '@/client/components/ui/InfoTip'
import { BRAND } from '@/shared/constants/constants'

export default function WebSupportPage() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/client-portal/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `[Website] ${subject.trim()}`,
          message: message.trim(),
          priority,
          category: 'WEBSITE',
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        setSubject('')
        setMessage('')
      }
    } catch (error) {
      console.error('Failed to submit ticket:', error)
      setError('Failed to submit ticket. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/portal/web" className="text-slate-400 hover:text-teal-600">Dashboard</Link>
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-white font-medium">Website Support</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Website Support</h1>
        <p className="text-slate-400 mt-1">Get help with your website project</p>
      </div>

      {/* Quick Help */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-5">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="font-semibold text-white">Page Feedback</h3>
          <p className="text-sm text-slate-400 mt-1">
            Leave feedback directly on your website pages
          </p>
          <Link href="/portal/web/sitemap" className="text-sm text-teal-600 hover:underline mt-3 inline-block">
            Go to Sitemap
          </Link>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-5">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-white">Documentation</h3>
          <p className="text-sm text-slate-400 mt-1">
            Access guides and documentation for your website
          </p>
          <Link href="/portal/documents" className="text-sm text-teal-600 hover:underline mt-3 inline-block">
            View Documents
          </Link>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-5">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-white">Schedule a Call</h3>
          <p className="text-sm text-slate-400 mt-1">
            Book a call to discuss your project in detail
          </p>
          <Link href="/portal/meetings" className="text-sm text-teal-600 hover:underline mt-3 inline-block">
            Schedule Meeting
          </Link>
        </div>
      </div>

      {/* Submit Ticket */}
      <div className="glass-card rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Submit a Support Request</h2>

        {submitted ? (
          <div className="bg-green-500/10 border border-green-200 rounded-lg p-4 text-center">
            <svg className="w-12 h-12 mx-auto text-green-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="font-semibold text-green-900">Ticket Submitted!</h3>
            <p className="text-green-400 mt-1">Our team will respond to your request shortly.</p>
            <p className="text-sm text-green-300 mt-2">Your request has been logged. Check your email for confirmation.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 text-green-400 underline"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Subject * <InfoTip text="What's wrong? Include the page URL, what you see vs what you expect." type="action" />
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Priority <InfoTip text="HIGH = feature broken or site down, MEDIUM = visual issue, LOW = minor or cosmetic." />
              </label>
              <div className="flex gap-2">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      priority === p
                        ? p === 'HIGH'
                          ? 'bg-red-500/20 text-red-400 border-2 border-red-300'
                          : p === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-400 border-2 border-amber-300'
                          : 'bg-green-500/20 text-green-400 border-2 border-green-300'
                        : 'bg-slate-800/50 text-slate-300 border-2 border-transparent'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Message * <InfoTip text="Describe in detail. Be specific about the page, section, and desired outcome." type="action" />
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or request in detail..."
                rows={5}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                maxLength={5000}
              />
              <p className="text-xs text-slate-500 mt-1 text-right">{message.length}/5000</p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !subject.trim() || !message.trim()}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Contact Info */}
      <div className="bg-slate-900/40 rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Other Ways to Reach Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 glass-card rounded-lg flex items-center justify-center border border-white/10">
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="text-sm text-slate-400">Email</span>
              <p className="font-medium text-white">{BRAND.supportEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 glass-card rounded-lg flex items-center justify-center border border-white/10">
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <span className="text-sm text-slate-400">WhatsApp</span>
              <a
                href={`https://wa.me/${BRAND.supportPhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white hover:text-teal-400 transition-colors"
              >
                {BRAND.supportPhone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
