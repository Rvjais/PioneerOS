'use client'

import { useState, useRef } from 'react'

interface AIDataEntryModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: string
  clientName: string
  department: string
  onDataExtracted: (data: Record<string, unknown>) => void
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ExtractionResult {
  sessionId: string
  extractedData: Record<string, unknown>
  confidence: string
  message: string
  questions: string[]
  missingFields: string[]
  completed: boolean
}

export function AIDataEntryModal({
  isOpen,
  onClose,
  clientId,
  clientName,
  department,
  onDataExtracted
}: AIDataEntryModalProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [extractedData, setExtractedData] = useState<Record<string, unknown>>({})
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getScreenshotGuide = () => {
    switch (department) {
      case 'SEO':
        return [
          { platform: 'Google Search Console', what: 'Performance tab - Total clicks, impressions' },
          { platform: 'Google Analytics', what: 'Acquisition > Organic Search' },
          { platform: 'Google Business Profile', what: 'Insights - Calls, Directions, Website clicks' }
        ]
      case 'ADS':
        return [
          { platform: 'Meta Ads Manager', what: 'Campaign summary - Spend, Results, CPC' },
          { platform: 'Google Ads', what: 'Campaign overview - Spend, Clicks, Conversions' }
        ]
      case 'SOCIAL':
        return [
          { platform: 'Instagram Insights', what: 'Accounts reached, Followers, Engagement' },
          { platform: 'Meta Business Suite', what: 'Content performance, Post reach' }
        ]
      default:
        return [
          { platform: 'Analytics Dashboard', what: 'Relevant metrics for your work' }
        ]
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const res = await fetch('/api/meetings/ai-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          clientId,
          clientName,
          department,
          userInput: userMessage,
          inputType: 'text'
        })
      })

      const data: ExtractionResult = await res.json()

      if (res.ok) {
        setSessionId(data.sessionId)
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
        setExtractedData(data.extractedData)
        setMissingFields(data.missingFields)
        setIsComplete(data.completed)
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I had trouble processing that. Could you try again?'
        }])
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Something went wrong. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: `[Uploaded screenshot: ${file.name}]` }])

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          resolve(result.split(',')[1]) // Remove data:image/... prefix
        }
        reader.readAsDataURL(file)
      })

      const res = await fetch('/api/meetings/ai-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          clientId,
          clientName,
          department,
          userInput: 'Please extract the metrics from this screenshot.',
          inputType: 'image',
          imageBase64: base64
        })
      })

      const data: ExtractionResult = await res.json()

      if (res.ok) {
        setSessionId(data.sessionId)
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
        setExtractedData(data.extractedData)
        setMissingFields(data.missingFields)
        setIsComplete(data.completed)
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I had trouble reading that screenshot. Could you try a clearer image?'
        }])
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Failed to process the image. Please try again.'
      }])
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUseData = () => {
    onDataExtracted(extractedData)
    onClose()
  }

  const handleReset = () => {
    setSessionId(null)
    setMessages([])
    setInput('')
    setExtractedData({})
    setMissingFields([])
    setIsComplete(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/10">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </span>
              AI Data Entry
            </h2>
            <p className="text-sm text-slate-400 mt-1">{clientName} - {department}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Initial Guide */}
          {messages.length === 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-sm text-blue-400 font-medium mb-3">
                I&apos;ll help you fill in the metrics. You can:
              </p>
              <ul className="text-sm text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Upload screenshots from your analytics dashboards
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Copy-paste raw data from reports
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Just tell me the numbers and I&apos;ll fill them in
                </li>
              </ul>

              <div className="mt-4 pt-4 border-t border-blue-500/20">
                <p className="text-xs text-slate-400 font-medium mb-2">Recommended screenshots for {department}:</p>
                <div className="space-y-1">
                  {getScreenshotGuide().map((guide, i) => (
                    <p key={guide.platform} className="text-xs text-slate-500">
                      <span className="text-slate-400">{guide.platform}:</span> {guide.what}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((message, i) => (
            <div
              key={`msg-${i}`}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-4 py-2 ${message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-200'
                  }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 rounded-xl px-4 py-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm">Processing...</span>
                </div>
              </div>
            </div>
          )}

          {/* Extracted Data Preview */}
          {Object.keys(extractedData).length > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-emerald-400">Extracted Data</p>
                {isComplete && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded">
                    Complete
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(extractedData).map(([key, value]) => (
                  <div key={key} className="bg-slate-900/50 rounded-lg p-2">
                    <p className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-sm font-medium text-white">{String(value)}</p>
                  </div>
                ))}
              </div>
              {missingFields.length > 0 && !isComplete && (
                <p className="mt-3 text-xs text-amber-400">
                  Still need: {missingFields.join(', ')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-50"
              title="Upload screenshot"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste data or type metrics..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>

          {/* Action Buttons */}
          {Object.keys(extractedData).length > 0 && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleUseData}
                className="flex-1 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
              >
                Use This Data
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-slate-400 text-sm hover:text-white hover:bg-white/10 rounded-lg"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
