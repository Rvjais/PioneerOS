'use client'

import { useState } from 'react'
import InfoTip from '@/client/components/ui/InfoTip'

interface Field {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'date' | 'number' | 'select'
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
  tooltip?: string
}

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  fields: Field[]
  onSubmit: (data: Record<string, string>) => Promise<void>
  submitLabel?: string
}

export function QuickAddModal({
  isOpen,
  onClose,
  title,
  fields,
  onSubmit,
  submitLabel = 'Add',
}: QuickAddModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    fields.forEach((field) => {
      if (field.required && !formData[field.name]?.trim()) {
        errors[field.name] = `${field.label} is required`
      }
    })
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      await onSubmit(formData)
      setFormData({})
      setFieldErrors({})
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px'
    }} suppressHydrationWarning>
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        padding: '24px',
        width: '100%',
        maxWidth: '32rem',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 700 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              color: '#94a3b8'
            }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {fields.map((field) => (
            <div key={field.name}>
              <label style={{ display: 'block', color: 'white', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                {field.label}
                {field.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                {field.tooltip && <InfoTip text={field.tooltip} />}
              </label>

              {field.type === 'select' ? (
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, [field.name]: e.target.value })
                    if (fieldErrors[field.name]) {
                      setFieldErrors({ ...fieldErrors, [field.name]: '' })
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: '#334155',
                    border: `1px solid ${fieldErrors[field.name] ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="" style={{ backgroundColor: '#1e293b' }}>Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value} style={{ backgroundColor: '#1e293b' }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, [field.name]: e.target.value })
                    if (fieldErrors[field.name]) {
                      setFieldErrors({ ...fieldErrors, [field.name]: '' })
                    }
                  }}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: '#334155',
                    border: `1px solid ${fieldErrors[field.name] ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              )}
              {fieldErrors[field.name] && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{fieldErrors[field.name]}</p>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#334155',
                color: 'white',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '12px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              {loading ? 'Adding...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


// Pre-configured modals for common use cases
export const EMPLOYEE_FIELDS: Field[] = [
  { name: 'firstName', label: 'First Name', type: 'text', required: true, tooltip: 'Legal first name as on government ID. Used for payroll and official documents.' },
  { name: 'lastName', label: 'Last Name', type: 'text', tooltip: 'Legal last name / surname as on ID.' },
  { name: 'email', label: 'Email', type: 'email', tooltip: 'Personal email for sending offer letter and login credentials.' },
  { name: 'phone', label: 'Phone', type: 'tel', required: true, tooltip: 'WhatsApp-enabled mobile number with country code for team communication.' },
  {
    name: 'department',
    label: 'Department',
    type: 'select',
    required: true,
    tooltip: 'Primary department - determines sidebar navigation, KPIs, and daily activities.',
    options: [
      { value: 'OPERATIONS', label: 'Operations' },
      { value: 'HR', label: 'HR' },
      { value: 'SEO', label: 'SEO' },
      { value: 'SOCIAL', label: 'Social Media' },
      { value: 'ADS', label: 'Paid Ads' },
      { value: 'WEB', label: 'Web Development' },
      { value: 'ACCOUNTS', label: 'Accounts' },
      { value: 'SALES', label: 'Sales' },
    ],
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    required: true,
    tooltip: 'System role controlling what features and data they can access.',
    options: [
      { value: 'EMPLOYEE', label: 'Employee' },
      { value: 'MANAGER', label: 'Manager' },
      { value: 'FREELANCER', label: 'Freelancer' },
      { value: 'INTERN', label: 'Intern' },
      { value: 'SALES', label: 'Sales' },
      { value: 'ACCOUNTS', label: 'Accounts' },
    ],
  },
  { name: 'joiningDate', label: 'Joining Date', type: 'date', required: true, tooltip: 'First day of employment. Probation, tenure, and appraisal eligibility calculated from this.' },
  { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', tooltip: 'For birthday celebrations and age verification.' },
]

export const CLIENT_FIELDS: Field[] = [
  { name: 'name', label: 'Client/Company Name', type: 'text', required: true, tooltip: 'Full business name as it appears on letterhead. Used on invoices and SLA.' },
  { name: 'contactName', label: 'Contact Person', type: 'text', tooltip: 'Primary point of contact who receives all communications.' },
  { name: 'contactEmail', label: 'Contact Email', type: 'email', tooltip: 'Official email for invoices, reports, and portal access.' },
  { name: 'contactPhone', label: 'Contact Phone', type: 'tel', tooltip: 'WhatsApp-enabled number for quick communication and reminders.' },
  {
    name: 'industry',
    label: 'Industry',
    type: 'select',
    tooltip: 'Business sector - helps team tailor strategy and communication.',
    options: [
      { value: 'Healthcare', label: 'Healthcare' },
      { value: 'Technology', label: 'Technology' },
      { value: 'Education', label: 'Education' },
      { value: 'Finance', label: 'Finance' },
      { value: 'Lifestyle', label: 'Lifestyle' },
      { value: 'Ecommerce', label: 'E-commerce' },
      { value: 'RealEstate', label: 'Real Estate' },
      { value: 'Other', label: 'Other' },
    ],
  },
  {
    name: 'tier',
    label: 'Tier',
    type: 'select',
    required: true,
    tooltip: 'Service tier based on budget. STANDARD: ₹25-75K, PREMIUM: ₹75-150K, ENTERPRISE: ₹150K+.',
    options: [
      { value: 'STANDARD', label: 'Standard (₹25k)' },
      { value: 'PREMIUM', label: 'Premium (₹50k)' },
      { value: 'ENTERPRISE', label: 'Enterprise (₹100k+)' },
    ],
  },
  { name: 'monthlyFee', label: 'Monthly Fee (₹)', type: 'number', placeholder: '50000', tooltip: 'Exact monthly fee excluding GST. Must match signed contract.' },
  { name: 'websiteUrl', label: 'Website URL', type: 'text', placeholder: 'example.com', tooltip: 'Current website URL for SEO audits and analytics setup.' },
  { name: 'gstNumber', label: 'GST Number', type: 'text', tooltip: '15-character GSTIN for tax-compliant invoices. Format: 22AAAAA0000A1Z5.' },
]
