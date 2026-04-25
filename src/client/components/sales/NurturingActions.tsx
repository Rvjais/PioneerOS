'use client'

import { useState } from 'react'

interface NurturingActionsProps {
  leadId: string
  onActionCreated?: () => void
}

const NURTURING_ACTIONS = [
  { type: 'EBOOK', label: 'Share eBook', icon: '📚', description: 'Share a relevant eBook or guide' },
  { type: 'CASE_STUDY', label: 'Share Case Study', icon: '📊', description: 'Share a success story' },
  { type: 'VIDEO', label: 'Share Video', icon: '🎬', description: 'Share a YouTube video or testimonial' },
  { type: 'TESTIMONIAL', label: 'Share Testimonial', icon: '⭐', description: 'Share a client testimonial' },
  { type: 'WEBSITE_EXAMPLE', label: 'Share Website Example', icon: '🌐', description: 'Share a portfolio website' },
  { type: 'INDUSTRY_INSIGHTS', label: 'Industry Insights', icon: '💡', description: 'Share industry trends/insights' },
  { type: 'FREE_CONSULTATION', label: 'Free Consultation Offer', icon: '🎁', description: 'Offer a free strategy session' },
  { type: 'WHATSAPP', label: 'WhatsApp Message', icon: '💬', description: 'Log a WhatsApp interaction' },
  { type: 'EMAIL', label: 'Email Sent', icon: '📧', description: 'Log an email sent' },
  { type: 'CALL', label: 'Phone Call', icon: '📞', description: 'Log a phone call' },
]

const CHANNELS = ['WHATSAPP', 'EMAIL', 'LINKEDIN', 'PHONE']

export function NurturingActions({ leadId, onActionCreated }: NurturingActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<typeof NURTURING_ACTIONS[0] | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    contentTitle: '',
    contentUrl: '',
    notes: '',
    channel: 'WHATSAPP',
    response: '',
  })

  const handleActionSelect = (action: typeof NURTURING_ACTIONS[0]) => {
    setSelectedAction(action)
    setFormData({
      contentTitle: '',
      contentUrl: '',
      notes: '',
      channel: 'WHATSAPP',
      response: '',
    })
  }

  const handleSubmit = async () => {
    if (!selectedAction) return

    setLoading(true)
    try {
      const res = await fetch(`/api/sales/leads/${leadId}/nurture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: selectedAction.type,
          ...formData,
        }),
      })

      if (res.ok) {
        setIsOpen(false)
        setSelectedAction(null)
        setFormData({
          contentTitle: '',
          contentUrl: '',
          notes: '',
          channel: 'WHATSAPP',
          response: '',
        })
        onActionCreated?.()
      }
    } catch (error) {
      console.error('Failed to create nurturing action:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        Add Nurturing Action
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="glass-card rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold text-white">
                {selectedAction ? selectedAction.label : 'Select Nurturing Action'}
              </h3>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setSelectedAction(null)
                }}
                className="text-slate-400 hover:text-slate-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {!selectedAction ? (
                <div className="grid grid-cols-2 gap-3">
                  {NURTURING_ACTIONS.map(action => (
                    <button
                      key={action.type}
                      onClick={() => handleActionSelect(action)}
                      className="p-4 rounded-lg border border-white/10 hover:border-orange-300 hover:bg-orange-50 text-left transition-all"
                    >
                      <span className="text-2xl">{action.icon}</span>
                      <p className="font-medium text-white mt-2">{action.label}</p>
                      <p className="text-xs text-slate-400 mt-1">{action.description}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <span className="text-2xl">{selectedAction.icon}</span>
                    <div>
                      <p className="font-medium text-white">{selectedAction.label}</p>
                      <p className="text-sm text-slate-400">{selectedAction.description}</p>
                    </div>
                  </div>

                  {['EBOOK', 'CASE_STUDY', 'VIDEO', 'TESTIMONIAL', 'WEBSITE_EXAMPLE', 'INDUSTRY_INSIGHTS'].includes(selectedAction.type) && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">
                          Content Title
                        </label>
                        <input
                          type="text"
                          value={formData.contentTitle}
                          onChange={(e) => setFormData({ ...formData, contentTitle: e.target.value })}
                          placeholder="E.g., Healthcare Marketing Guide 2024"
                          className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">
                          Content URL *
                        </label>
                        <input
                          type="url"
                          value={formData.contentUrl}
                          onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                          placeholder="https://..."
                          className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      Channel
                    </label>
                    <div className="flex gap-2">
                      {CHANNELS.map(ch => (
                        <button
                          key={ch}
                          onClick={() => setFormData({ ...formData, channel: ch })}
                          className={`px-3 py-2 text-sm rounded-lg border ${
                            formData.channel === ch
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-white/10 text-slate-300 hover:bg-slate-900/40'
                          }`}
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any notes about this interaction..."
                      rows={3}
                      className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      Lead Response (optional)
                    </label>
                    <textarea
                      value={formData.response}
                      onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                      placeholder="How did the lead respond?"
                      rows={2}
                      className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {selectedAction && (
              <div className="p-4 border-t border-white/10 flex justify-between">
                <button
                  onClick={() => setSelectedAction(null)}
                  className="px-4 py-2 text-slate-300 hover:text-white"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:bg-white/20 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Action'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
