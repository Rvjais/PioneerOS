'use client'

import { useState } from 'react'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface EmailTemplate {
  id: string
  name: string
  category: string
  subject: string
  body: string
  variables: string[]
}

const templates: EmailTemplate[] = [
  {
    id: 'inv-email-1',
    name: 'Invoice Email',
    category: 'Invoice',
    subject: 'Invoice #{{invoice_number}} for {{month}} {{year}} - Pioneer Media',
    body: `Dear {{client_name}},

I hope this email finds you well.

Please find attached your invoice #{{invoice_number}} for the month of {{month}} {{year}}.

Invoice Details:
- Invoice Number: {{invoice_number}}
- Amount: Rs. {{amount}}
- Due Date: {{due_date}}
- Services: {{services}}

Payment Methods:
1. Bank Transfer:
   Bank: HDFC Bank
   Account Name: Pioneer Media Pvt Ltd
   Account Number: 50200012345678
   IFSC Code: HDFC0001234

2. UPI: pioneer@hdfcbank

3. Online Payment: {{payment_link}}

Please ensure payment is made by the due date to avoid any service disruption.

If you have any questions regarding this invoice, please don't hesitate to reach out.

Thank you for your continued partnership!

Best regards,
{{sender_name}}
Accounts Team
Pioneer Media Pvt Ltd
accounts@pioneermedia.in | +91 98765 43210`,
    variables: ['client_name', 'invoice_number', 'month', 'year', 'amount', 'due_date', 'services', 'payment_link', 'sender_name']
  },
  {
    id: 'inv-email-2',
    name: 'Payment Reminder Email',
    category: 'Invoice',
    subject: 'Friendly Reminder: Payment Due for Invoice #{{invoice_number}}',
    body: `Dear {{client_name}},

This is a friendly reminder that payment for the following invoice is due:

Invoice Number: {{invoice_number}}
Amount Due: Rs. {{amount}}
Due Date: {{due_date}}

If you have already made the payment, please disregard this email and accept our thanks.

For your convenience, you can make the payment using the link below:
{{payment_link}}

If you have any questions or need assistance, please feel free to contact us.

Best regards,
{{sender_name}}
Accounts Team
Pioneer Media`,
    variables: ['client_name', 'invoice_number', 'amount', 'due_date', 'payment_link', 'sender_name']
  },
  {
    id: 'inv-email-3',
    name: 'Overdue Notice',
    category: 'Invoice',
    subject: 'URGENT: Overdue Payment - Invoice #{{invoice_number}}',
    body: `Dear {{client_name}},

We are writing to bring to your attention that payment for the following invoice is now overdue:

Invoice Number: {{invoice_number}}
Amount Due: Rs. {{amount}}
Original Due Date: {{due_date}}
Days Overdue: {{days_overdue}}

We kindly request immediate attention to this matter to avoid any interruption to your services.

If there are any issues preventing payment, please contact us immediately so we can discuss a resolution.

Payment can be made via:
- Bank Transfer (details on invoice)
- Online: {{payment_link}}

We value our business relationship and look forward to resolving this matter promptly.

Best regards,
{{sender_name}}
Accounts Manager
Pioneer Media`,
    variables: ['client_name', 'invoice_number', 'amount', 'due_date', 'days_overdue', 'payment_link', 'sender_name']
  },
  {
    id: 'pay-email-1',
    name: 'Payment Confirmation',
    category: 'Payment',
    subject: 'Payment Received - Thank You! (Invoice #{{invoice_number}})',
    body: `Dear {{client_name}},

We are pleased to confirm receipt of your payment. Thank you!

Payment Details:
- Amount Received: Rs. {{amount}}
- Payment Date: {{payment_date}}
- Reference Number: {{reference}}
- Invoice Number: {{invoice_number}}

Your account is now up to date. An official receipt has been attached to this email for your records.

Thank you for your prompt payment and continued trust in Pioneer Media.

Best regards,
{{sender_name}}
Accounts Team
Pioneer Media`,
    variables: ['client_name', 'amount', 'payment_date', 'reference', 'invoice_number', 'sender_name']
  },
  {
    id: 'renewal-email-1',
    name: 'Contract Renewal Reminder',
    category: 'Contract',
    subject: 'Contract Renewal Notice - {{client_name}}',
    body: `Dear {{client_name}},

We hope you've had a great experience working with Pioneer Media over the past year!

This is to inform you that your current contract is scheduled to expire on {{expiry_date}}.

Current Contract Details:
- Services: {{services}}
- Monthly Value: Rs. {{monthly_value}}
- Contract Period: {{contract_period}}

To ensure uninterrupted services, we recommend initiating the renewal process at the earliest.

Our team has prepared a renewal proposal with some exciting options for you. Would you be available for a brief call this week to discuss?

Please let us know your preferred time, and we'll schedule a meeting.

Looking forward to continuing our partnership!

Best regards,
{{sender_name}}
Accounts Manager
Pioneer Media`,
    variables: ['client_name', 'expiry_date', 'services', 'monthly_value', 'contract_period', 'sender_name']
  },
  {
    id: 'welcome-email-1',
    name: 'Welcome Email',
    category: 'Onboarding',
    subject: 'Welcome to Pioneer Media - Next Steps',
    body: `Dear {{client_name}},

Welcome to the Pioneer Media family! We're thrilled to have you on board.

Your dedicated account team:
- Account Manager: {{account_manager}}
- Project Lead: {{project_lead}}
- Support Email: accounts@pioneermedia.in

Next Steps:
1. Contract Review & Signing - Please review and sign the attached contract
2. Payment Setup - Complete your initial payment to activate services
3. Onboarding Call - We'll schedule a call to align on goals and timelines

Important Links:
- Client Portal: {{portal_link}}
- Service Agreement: Attached
- Payment Link: {{payment_link}}

If you have any questions during the onboarding process, please don't hesitate to reach out.

We're excited to start this journey together!

Best regards,
{{sender_name}}
Pioneer Media`,
    variables: ['client_name', 'account_manager', 'project_lead', 'portal_link', 'payment_link', 'sender_name']
  }
]

const categories = ['All', 'Invoice', 'Payment', 'Contract', 'Onboarding']

export default function EmailTemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({})

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category === selectedCategory)

  const copyTemplate = (template: EmailTemplate, type: 'subject' | 'body' | 'both') => {
    let text = ''
    if (type === 'subject') text = template.subject
    else if (type === 'body') text = template.body
    else text = `Subject: ${template.subject}\n\n${template.body}`

    navigator.clipboard.writeText(text)
    setCopiedId(`${template.id}-${type}`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getPreviewText = (text: string, variables: string[]) => {
    let preview = text
    variables.forEach(variable => {
      const value = previewValues[variable] || `{{${variable}}}`
      preview = preview.replace(new RegExp(`{{${variable}}}`, 'g'), value)
    })
    return preview
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Email Templates</h1>
            <InfoTooltip
              title="Email Templates"
              steps={[
                'Standard email templates for accounts',
                'Copy subject and body separately or together',
                'Fill in variables before sending',
                'Maintain professional communication'
              ]}
              tips={[
                'Always personalize before sending',
                'Attach relevant documents'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Professional email templates for Accounts team</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-white/5 backdrop-blur-sm text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Templates List */}
        <div className="space-y-4">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`bg-white/5 backdrop-blur-sm border rounded-xl p-4 cursor-pointer transition-all ${
                selectedTemplate?.id === template.id
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-white">{template.name}</h3>
                <span className="text-xs px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full text-slate-400">
                  {template.category}
                </span>
              </div>
              <p className="text-sm text-blue-400 mb-2">{template.subject}</p>
              <p className="text-sm text-slate-400 line-clamp-2">{template.body}</p>
            </div>
          ))}
        </div>

        {/* Preview Panel */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden sticky top-6 max-h-[80vh] overflow-y-auto">
          {selectedTemplate ? (
            <>
              <div className="p-4 border-b border-white/10 sticky top-0 bg-slate-900/95 backdrop-blur">
                <h3 className="font-bold text-white">{selectedTemplate.name}</h3>
                <p className="text-sm text-slate-400">{selectedTemplate.category}</p>
              </div>

              {/* Variables Input */}
              <div className="p-4 border-b border-white/10 bg-black/20">
                <p className="text-sm text-slate-400 mb-3">Fill in variables:</p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTemplate.variables.map(variable => (
                    <input
                      key={variable}
                      type="text"
                      placeholder={variable.replace(/_/g, ' ')}
                      value={previewValues[variable] || ''}
                      onChange={e => setPreviewValues(prev => ({ ...prev, [variable]: e.target.value }))}
                      className="px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Subject:</span>
                    <button
                      onClick={() => copyTemplate(selectedTemplate, 'subject')}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        copiedId === `${selectedTemplate.id}-subject`
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/10 backdrop-blur-sm text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      {copiedId === `${selectedTemplate.id}-subject` ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-blue-300 text-sm">
                      {getPreviewText(selectedTemplate.subject, selectedTemplate.variables)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Body:</span>
                    <button
                      onClick={() => copyTemplate(selectedTemplate, 'body')}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        copiedId === `${selectedTemplate.id}-body`
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/10 backdrop-blur-sm text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      {copiedId === `${selectedTemplate.id}-body` ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">
                      {getPreviewText(selectedTemplate.body, selectedTemplate.variables)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => copyTemplate(selectedTemplate, 'both')}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    copiedId === `${selectedTemplate.id}-both`
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {copiedId === `${selectedTemplate.id}-both` ? 'Copied!' : 'Copy Full Email'}
                </button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <p>Select a template to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
