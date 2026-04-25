'use client'

// Embeddable Bug Report form (minimal UI for iframes)
// Usage: <iframe src="https://app.brandingpioneers.in/embed/bug-report" />
// Params: ?theme=dark|light&source=website&projectId=xxx

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  FormLayout,
  FormCard,
  TextInput,
  Textarea,
  SingleSelect,
  FormButtons,
  SuccessScreen,
  FileUpload,
  type FormTheme,
} from '@/client/components/forms/FormComponents'

const BUG_TYPES = [
  { value: 'visual', label: 'Visual / UI Bug', emoji: '👁️' },
  { value: 'functional', label: 'Functional Bug', emoji: '⚙️' },
  { value: 'performance', label: 'Performance Issue', emoji: '🐌' },
  { value: 'crash', label: 'Crash / Error', emoji: '💥' },
  { value: 'security', label: 'Security Concern', emoji: '🔒' },
  { value: 'mobile', label: 'Mobile Issue', emoji: '📱' },
  { value: 'other', label: 'Other', emoji: '📋' },
]

const SEVERITIES = [
  { value: 'cosmetic', label: 'Cosmetic', emoji: '🎨', description: 'Minor visual issue' },
  { value: 'minor', label: 'Minor', emoji: '🟢', description: 'Feature works with workaround' },
  { value: 'major', label: 'Major', emoji: '🟡', description: 'Feature partially broken' },
  { value: 'critical', label: 'Critical', emoji: '🔴', description: 'Feature completely broken' },
  { value: 'blocker', label: 'Blocker', emoji: '⛔', description: 'Blocks all work' },
]

const BROWSERS = [
  { value: 'chrome', label: 'Chrome', emoji: '🟡' },
  { value: 'firefox', label: 'Firefox', emoji: '🟠' },
  { value: 'safari', label: 'Safari', emoji: '🔵' },
  { value: 'edge', label: 'Edge', emoji: '🔷' },
  { value: 'mobile_chrome', label: 'Mobile Chrome', emoji: '📱' },
  { value: 'mobile_safari', label: 'Mobile Safari', emoji: '📱' },
  { value: 'other', label: 'Other', emoji: '🌐' },
]

const DEVICES = [
  { value: 'desktop_windows', label: 'Windows Desktop', emoji: '🪟' },
  { value: 'desktop_mac', label: 'Mac Desktop', emoji: '🍎' },
  { value: 'iphone', label: 'iPhone', emoji: '📱' },
  { value: 'android', label: 'Android', emoji: '🤖' },
  { value: 'ipad', label: 'iPad', emoji: '📱' },
  { value: 'other', label: 'Other', emoji: '💻' },
]

export default function EmbedBugReportPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <EmbedBugReportContent />
    </Suspense>
  )
}

function EmbedBugReportContent() {
  const searchParams = useSearchParams()
  const themeParam = searchParams.get('theme') as FormTheme | null
  const theme: FormTheme = themeParam === 'light' ? 'light' : 'embed'
  const source = searchParams.get('source') || 'embed'
  const projectId = searchParams.get('projectId') || ''

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [bugId, setBugId] = useState('')

  const [form, setForm] = useState({
    // Reporter info
    name: '',
    email: '',
    // Bug details
    bugType: '',
    severity: 'minor',
    title: '',
    pageUrl: '',
    // Environment
    browser: '',
    device: '',
    // Reproduction
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    // Attachments
    screenshots: [] as File[],
  })

  // Send height to parent for auto-resize
  useEffect(() => {
    const sendHeight = () => {
      const height = document.body.scrollHeight
      window.parent?.postMessage({ type: 'EMBED_RESIZE', height }, process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
    }
    sendHeight()
    const observer = new ResizeObserver(sendHeight)
    observer.observe(document.body)
    return () => observer.disconnect()
  }, [step, success])

  // Auto-detect browser and device
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase()

      // Detect browser
      let browser = 'other'
      if (ua.includes('chrome') && !ua.includes('edg')) browser = ua.includes('mobile') ? 'mobile_chrome' : 'chrome'
      else if (ua.includes('firefox')) browser = 'firefox'
      else if (ua.includes('safari') && !ua.includes('chrome')) browser = ua.includes('mobile') ? 'mobile_safari' : 'safari'
      else if (ua.includes('edg')) browser = 'edge'

      // Detect device
      let device = 'other'
      if (ua.includes('iphone')) device = 'iphone'
      else if (ua.includes('ipad')) device = 'ipad'
      else if (ua.includes('android')) device = 'android'
      else if (ua.includes('mac')) device = 'desktop_mac'
      else if (ua.includes('windows')) device = 'desktop_windows'

      setForm(prev => ({ ...prev, browser, device, pageUrl: document.referrer || '' }))
    }
  }, [])

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleFileChange = (file: File | null) => {
    if (file) {
      updateField('screenshots', [...form.screenshots, file].slice(0, 5))
    }
  }

  const removeFile = (index: number) => {
    updateField('screenshots', form.screenshots.filter((_, i) => i !== index))
  }

  const canProceed = () => {
    if (step === 1) {
      return form.name && form.email && form.bugType && form.title
    }
    if (step === 2) {
      return form.stepsToReproduce && form.actualBehavior
    }
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('email', form.email)
      formData.append('bugType', form.bugType)
      formData.append('severity', form.severity)
      formData.append('title', form.title)
      formData.append('pageUrl', form.pageUrl)
      formData.append('browser', form.browser)
      formData.append('device', form.device)
      formData.append('stepsToReproduce', form.stepsToReproduce)
      formData.append('expectedBehavior', form.expectedBehavior)
      formData.append('actualBehavior', form.actualBehavior)
      formData.append('source', source)
      if (projectId) formData.append('projectId', projectId)

      form.screenshots.forEach((file, index) => {
        formData.append(`screenshot_${index}`, file)
      })

      const res = await fetch('/api/bugs', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      const data = await res.json()
      setBugId(data.bugId || 'Generated')
      setSuccess(true)

      // Notify parent window
      window.parent?.postMessage({
        type: 'FORM_SUBMITTED',
        formType: 'bug-report',
        data: { bugId: data.bugId },
      }, '*')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <FormLayout theme={theme} title="Bug Report" showHeader={false}>
        <SuccessScreen
          title="Bug Report Submitted!"
          message={`Thank you for reporting this issue${bugId ? ` (Bug #${bugId})` : ''}. Our development team will investigate and fix it as soon as possible.`}
          theme={theme}
          primaryAction={{
            label: 'Report Another Bug',
            onClick: () => {
              setSuccess(false)
              setStep(1)
              setForm({
                name: '',
                email: '',
                bugType: '',
                severity: 'minor',
                title: '',
                pageUrl: '',
                browser: '',
                device: '',
                stepsToReproduce: '',
                expectedBehavior: '',
                actualBehavior: '',
                screenshots: [],
              })
            }
          }}
        />
      </FormLayout>
    )
  }

  return (
    <FormLayout theme={theme} title="Bug Report" showHeader={false}>
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`flex items-center ${s < 2 ? 'flex-1' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                step >= s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {s}
            </div>
            {s < 2 && (
              <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-indigo-500' : 'bg-slate-700'}`} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <FormCard
          title="Bug Details"
          description="Tell us about the issue"
        >
          {/* Reporter Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <TextInput
              name="reporter-name"
              label="Your Name"
              value={form.name}
              onChange={(v: string) => updateField('name', v)}
              placeholder="John Doe"
              required
            />
            <TextInput
              name="reporter-email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(v: string) => updateField('email', v)}
              placeholder="john@company.com"
              required
            />
          </div>

          {/* Bug Type & Severity */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <SingleSelect
              name="bugType"
              label="Bug Type"
              options={BUG_TYPES}
              value={form.bugType}
              onChange={(v: string) => updateField('bugType', v)}
              required
            />
            <SingleSelect
              name="severity"
              label="Severity"
              options={SEVERITIES}
              value={form.severity}
              onChange={(v: string) => updateField('severity', v)}
            />
          </div>

          {/* Bug Title */}
          <div className="mb-4">
            <TextInput
              name="bug-title"
              label="Bug Title"
              value={form.title}
              onChange={(v: string) => updateField('title', v)}
              placeholder="Brief summary of the bug"
              required
            />
          </div>

          {/* Page URL */}
          <div className="mb-4">
            <TextInput
              name="pageUrl"
              label="Page URL where bug occurred"
              type="url"
              value={form.pageUrl}
              onChange={(v: string) => updateField('pageUrl', v)}
              placeholder="https://example.com/page"
            />
          </div>

          {/* Browser & Device */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <SingleSelect
              name="browser"
              label="Browser"
              options={BROWSERS}
              value={form.browser}
              onChange={(v: string) => updateField('browser', v)}
            />
            <SingleSelect
              name="device"
              label="Device"
              options={DEVICES}
              value={form.device}
              onChange={(v: string) => updateField('device', v)}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <FormButtons
            onNext={() => setStep(2)}
            nextLabel="Continue"
            disabled={!canProceed()}
            showBack={false}
          />
        </FormCard>
      )}

      {step === 2 && (
        <FormCard
          title="Reproduction Steps"
          description="Help us understand and fix the bug"
        >
          {/* Steps to Reproduce */}
          <div className="mb-4">
            <Textarea
              name="stepsToReproduce"
              label="Steps to Reproduce"
              value={form.stepsToReproduce}
              onChange={(v: string) => updateField('stepsToReproduce', v)}
              placeholder="1. Go to page X&#10;2. Click on button Y&#10;3. Observe the issue"
              rows={4}
              required
            />
          </div>

          {/* Expected vs Actual */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Textarea
              name="expectedBehavior"
              label="Expected Behavior"
              value={form.expectedBehavior}
              onChange={(v: string) => updateField('expectedBehavior', v)}
              placeholder="What should happen?"
              rows={3}
            />
            <Textarea
              name="actualBehavior"
              label="Actual Behavior"
              value={form.actualBehavior}
              onChange={(v: string) => updateField('actualBehavior', v)}
              placeholder="What actually happens?"
              rows={3}
              required
            />
          </div>

          {/* Screenshots */}
          <div className="mb-6">
            <FileUpload
              name="screenshots"
              label="Screenshots (Optional, max 5)"
              accept="image/*"
              onChange={handleFileChange}
              helper="Upload screenshots or screen recordings to help us understand the bug"
            />
            {form.screenshots.length > 0 && (
              <div className="mt-3 space-y-2">
                {form.screenshots.map((file, index) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-emerald-400">✓</span>
                      <span className="text-slate-300 truncate max-w-[200px]">{file.name}</span>
                      <span className="text-slate-500 text-xs">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <FormButtons
            onBack={() => setStep(1)}
            onNext={handleSubmit}
            nextLabel={loading ? 'Submitting...' : 'Submit Bug Report'}
            disabled={!canProceed() || loading}
          />
        </FormCard>
      )}
    </FormLayout>
  )
}
