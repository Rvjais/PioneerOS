'use client'

import { useState } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/client/components/ui/Modal'

export default function FeedbackSection() {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'GENERAL',
    rating: 5,
    message: '',
  })
  const [savingFeedback, setSavingFeedback] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)

  const handleSubmitFeedback = async () => {
    if (!feedbackForm.message.trim()) return
    setSavingFeedback(true)
    try {
      const res = await fetch('/api/client-portal/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackForm),
      })
      if (res.ok) {
        setFeedbackSuccess(true)
        setShowFeedbackModal(false)
        setFeedbackForm({ type: 'GENERAL', rating: 5, message: '' })
        setTimeout(() => setFeedbackSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setSavingFeedback(false)
    }
  }

  return (
    <>
      <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Share Your Feedback</h3>
            <p className="text-sm text-slate-400 mt-1">
              We value your feedback! Help us improve our services by sharing your thoughts, suggestions, or reporting any issues.
            </p>
            {feedbackSuccess && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-200 rounded-lg flex items-center gap-2 text-green-400 text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Thank you for your feedback! We&apos;ll review it shortly.
              </div>
            )}
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Share Feedback
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Share Your Feedback"
        size="lg"
      >
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Feedback Type</label>
              <select
                value={feedbackForm.type}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, type: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ colorScheme: 'dark' }}
              >
                <option value="GENERAL" className="bg-slate-800 text-white">General Feedback</option>
                <option value="SERVICE_QUALITY" className="bg-slate-800 text-white">Service Quality</option>
                <option value="DELIVERABLES" className="bg-slate-800 text-white">Deliverables</option>
                <option value="COMMUNICATION" className="bg-slate-800 text-white">Communication</option>
                <option value="SUGGESTION" className="bg-slate-800 text-white">Suggestion</option>
                <option value="ISSUE" className="bg-slate-800 text-white">Report an Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                    className="p-1 transition-colors"
                  >
                    <svg
                      className={`w-8 h-8 ${star <= feedbackForm.rating ? 'text-amber-400' : 'text-slate-300'}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Your Message</label>
              <textarea
                value={feedbackForm.message}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                rows={4}
                placeholder="Tell us about your experience or share your suggestions..."
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            onClick={() => setShowFeedbackModal(false)}
            className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800/50 rounded-lg hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitFeedback}
            disabled={savingFeedback || !feedbackForm.message.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {savingFeedback && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Submit Feedback
          </button>
        </ModalFooter>
      </Modal>
    </>
  )
}
