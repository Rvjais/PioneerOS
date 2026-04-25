'use client'

// @ts-nocheck — TODO: Add `name` prop to all form fields (requires refactor of FormComponents usage)
// Embeddable Support Request form (minimal UI for iframes)
// Usage: <iframe src="https://app.brandingpioneers.in/embed/support" />
// Params: ?theme=dark|light&source=website&clientId=xxx

import { useState, useEffect, useRef, Suspense } from 'react'
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

const ISSUE_TYPES = [
  { value: 'bug', label: 'Bug / Error', emoji: '🐛' },
  { value: 'feature', label: 'Feature Request', emoji: '✨' },
  { value: 'content', label: 'Content Update', emoji: '📝' },
  { value: 'access', label: 'Access Issue', emoji: '🔐' },
  { value: 'performance', label: 'Performance', emoji: '⚡' },
  { value: 'design', label: 'Design Change', emoji: '🎨' },
  { value: 'other', label: 'Other', emoji: '📋' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low', emoji: '🟢' },
  { value: 'medium', label: 'Medium', emoji: '🟡' },
  { value: 'high', label: 'High', emoji: '🟠' },
  { value: 'critical', label: 'Critical', emoji: '🔴' },
]

export default function EmbedSupportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1120]" />}>
      <EmbedSupportContent />
    </Suspense>
  )
}

function EmbedSupportContent() {
  const searchParams = useSearchParams()
  const themeParam = searchParams.get('theme') as FormTheme | null
  const theme: FormTheme = themeParam === 'light' ? 'light' : 'embed'
  const source = searchParams.get('source') || 'embed'
  const clientId = searchParams.get('clientId') || ''

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    issueType: '',
    priority: 'medium',
    subject: '',
    description: '',
    pageUrl: '',
    screenshot: null as File | null,
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
  }, [success])

  // Auto-fill page URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Try to get referrer URL
      const referrer = document.referrer
      if (referrer) {
        setForm(prev => ({ ...prev, pageUrl: referrer }))
      }
    }
  }, [])

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleFileChange = (file: File | null) => {
    updateField('screenshot', file)
  }

  const canSubmit = () => {
    return form.name && form.email && form.issueType && form.subject && form.description
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // Create form data for file upload
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('email', form.email)
      formData.append('phone', form.phone)
      formData.append('issueType', form.issueType)
      formData.append('priority', form.priority)
      formData.append('subject', form.subject)
      formData.append('description', form.description)
      formData.append('pageUrl', form.pageUrl)
      formData.append('source', source)
      if (clientId) formData.append('clientId', clientId)
      if (form.screenshot) {
        formData.append('screenshot', form.screenshot)
      }

      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      const data = await res.json()
      setTicketId(data.ticketId || 'Generated')
      setSuccess(true)

      // Notify parent window
      window.parent?.postMessage({
        type: 'FORM_SUBMITTED',
        formType: 'support',
        data: { ticketId: data.ticketId },
      }, '*')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <FormLayout theme={theme} title="Support">
        <SuccessScreen
          title="Support Ticket Created!"
          message={`Your ticket ${ticketId ? `#${ticketId}` : ''} has been submitted. We'll get back to you within 24 hours.`}
          theme={theme}
          primaryAction={{
            label: 'Submit Another',
            onClick: () => {
              setSuccess(false)
              setForm({
                name: '',
                email: '',
                phone: '',
                issueType: '',
                priority: 'medium',
                subject: '',
                description: '',
                pageUrl: '',
                screenshot: null,
              })
            },
          }}
        />
      </FormLayout>
    )
  }

  return (
    <FormLayout theme={theme} title="Support Request">
      <FormCard title="Support Request" description="Tell us how we can help">
        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <TextInput
            name="contact-name"
            label="Your Name"
            value={form.name}
            onChange={(v: string) => updateField('name', v)}
            placeholder="John Doe"
            required
          />
          <TextInput
            name="contact-email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(v: string) => updateField('email', v)}
            placeholder="john@company.com"
            required
          />
        </div>

        <div className="mb-4">
          <TextInput
            name="contact-phone"
            label="Phone (Optional)"
            type="tel"
            value={form.phone}
            onChange={(v: string) => updateField('phone', v)}
            placeholder="+91 98765 43210"
          />
        </div>

        {/* Issue Type & Priority */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <SingleSelect
            name="issueType"
            label="Issue Type"
            options={ISSUE_TYPES}
            value={form.issueType}
            onChange={(v: string) => updateField('issueType', v)}
            required
          />
          <SingleSelect
            name="priority"
            label="Priority"
            options={PRIORITIES}
            value={form.priority}
            onChange={(v: string) => updateField('priority', v)}
          />
        </div>

        {/* Subject */}
        <div className="mb-4">
          <TextInput
            name="subject"
            label="Subject"
            value={form.subject}
            onChange={(v: string) => updateField('subject', v)}
            placeholder="Brief summary of the issue"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <Textarea
            name="description"
            label="Description"
            value={form.description}
            onChange={(v: string) => updateField('description', v)}
            placeholder="Please describe the issue in detail. Include steps to reproduce if applicable."
            rows={4}
            required
          />
        </div>

        {/* Page URL */}
        <div className="mb-4">
          <TextInput
            name="pageUrl"
            label="Page URL (if applicable)"
            type="url"
            value={form.pageUrl}
            onChange={(v: string) => updateField('pageUrl', v)}
            placeholder="https://example.com/page"
          />
        </div>

        {/* Screenshot Upload */}
        <div className="mb-6">
          <FileUpload
            name="screenshot"
            label="Screenshot (Optional)"
            accept="image/*"
            onChange={handleFileChange}
            helper="Upload a screenshot to help us understand the issue"
          />
          {form.screenshot && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-emerald-400">✓</span>
              <span className="text-slate-300">{form.screenshot.name}</span>
              <button
                type="button"
                onClick={() => updateField('screenshot', null)}
                className="text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <FormButtons
          onNext={handleSubmit}
          nextLabel={loading ? 'Submitting...' : 'Submit Ticket'}
          disabled={!canSubmit() || loading}
          showBack={false}
        />
      </FormCard>
    </FormLayout>
  )
}
