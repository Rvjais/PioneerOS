'use client'
import { useState, useEffect } from 'react'

interface PageGuideProps {
  title: string
  description: string
  steps?: { label: string; description: string }[]
  pageKey: string // unique per page, used to track if user has seen it
}

export default function PageGuide({ title, description, steps, pageKey }: PageGuideProps) {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    const seen = localStorage.getItem(`guide-${pageKey}`)
    if (!seen) setDismissed(false)
  }, [pageKey])

  const dismiss = () => {
    localStorage.setItem(`guide-${pageKey}`, 'true')
    setDismissed(true)
  }

  if (dismissed) return (
    <button onClick={() => setDismissed(false)} title="Page guide"
      className="fixed bottom-6 right-6 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg hover:bg-orange-600 transition z-30">
      ?
    </button>
  )

  return (
    <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-5 relative">
      <button onClick={dismiss} className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 text-sm">✕ Dismiss</button>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold shrink-0">?</div>
        <div>
          <h3 className="text-slate-900 font-semibold text-lg mb-1">{title}</h3>
          <p className="text-slate-600 text-sm mb-3">{description}</p>
          {steps && steps.length > 0 && (
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={step.label} className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold shrink-0 mt-0.5">{i+1}</span>
                  <div>
                    <span className="text-slate-900 font-medium">{step.label}</span>
                    <span className="text-slate-500 ml-1">— {step.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
