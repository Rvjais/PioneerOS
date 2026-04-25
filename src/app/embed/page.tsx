'use client'

// Index page showing all available embeds with iframe code snippets
import { useState } from 'react'

const EMBEDS = [
  {
    name: 'Career Application Form',
    path: '/embed/careers',
    description: 'Job application form for candidates',
    color: 'blue',
    params: ['dept=WEB', 'dept=SOCIAL', 'dept=ADS'],
  },
  {
    name: 'RFP / Quote Request',
    path: '/embed/rfp',
    description: 'Request for proposal form for prospects',
    color: 'orange',
    params: [],
  },
  {
    name: 'Client Onboarding',
    path: '/embed/welcome',
    description: 'Onboarding form for new clients',
    color: 'purple',
    params: [],
  },
]

export default function EmbedIndexPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.brandingpioneers.in'

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Embeddable Forms</h1>
          <p className="text-slate-400">Copy the iframe code to embed these forms on your website</p>
        </div>

        <div className="space-y-6">
          {EMBEDS.map((embed, index) => {
            const iframeCode = `<iframe
  src="${baseUrl}${embed.path}"
  width="100%"
  height="700"
  frameborder="0"
  style="border: none; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
</iframe>`

            return (
              <div key={embed.path} className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">{embed.name}</h2>
                      <p className="text-slate-400 text-sm mt-1">{embed.description}</p>
                    </div>
                    <a
                      href={embed.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 bg-${embed.color}-500 text-white rounded-lg text-sm font-medium hover:bg-${embed.color}-600 transition-colors`}
                    >
                      Preview
                    </a>
                  </div>
                  {embed.params.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs text-slate-400">Optional params:</span>
                      {embed.params.map(param => (
                        <code key={param} className="px-2 py-0.5 bg-slate-900 text-slate-400 rounded text-xs">
                          ?{param}
                        </code>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-400">iframe Code</span>
                    <button
                      onClick={() => copyToClipboard(iframeCode, index)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                    >
                      {copiedIndex === index ? (
                        <>
                          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy Code
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                    <code className="text-sm text-green-400 whitespace-pre">{iframeCode}</code>
                  </pre>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 inline-block">
            <h3 className="text-white font-semibold mb-2">JavaScript Events</h3>
            <p className="text-slate-400 text-sm mb-4">Listen for form submissions in your parent page:</p>
            <pre className="bg-slate-900 rounded-lg p-4 text-left overflow-x-auto">
              <code className="text-sm text-amber-400">{`window.addEventListener('message', (e) => {
  if (e.data.type === 'CAREER_FORM_SUBMITTED') {
  }
  if (e.data.type === 'RFP_FORM_SUBMITTED') {
  }
  if (e.data.type === 'CLIENT_ONBOARDING_SUBMITTED') {
  }
})`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
