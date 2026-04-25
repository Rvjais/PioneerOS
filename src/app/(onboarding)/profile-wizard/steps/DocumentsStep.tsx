'use client'

import { FileUpload } from '@/client/components/ui/FileUpload'

interface Props {
  data: {
    panCard: string
    aadhaar: string
    panCardUrl: string
    aadhaarUrl: string
    bankDetailsUrl: string
    educationCertUrl: string
  }
  onChange: (data: Partial<Props['data']>) => void
}

export function DocumentsStep({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-medium text-blue-900">Document Guidelines</h4>
            <p className="text-sm text-blue-400 mt-1">
              Upload clear photos or scans of your documents. Supported formats: JPG, PNG, PDF (max 10MB each). All documents are only accessible to HR.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            PAN Card Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.panCard}
            onChange={(e) => onChange({ panCard: e.target.value.toUpperCase() })}
            className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors uppercase"
            placeholder="XXXXX0000X"
            maxLength={10}
            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Aadhaar Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.aadhaar}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 12)
              onChange({ aadhaar: value })
            }}
            className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="XXXX XXXX XXXX"
            maxLength={12}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUpload
          label="PAN Card Copy *"
          value={data.panCardUrl}
          onChange={(url) => onChange({ panCardUrl: url })}
          folder="pioneer-os/documents"
          accept="image/jpeg,image/png,application/pdf"
          hint="Upload a clear scan or photo of your PAN card"
        />

        <FileUpload
          label="Aadhaar Card Copy *"
          value={data.aadhaarUrl}
          onChange={(url) => onChange({ aadhaarUrl: url })}
          folder="pioneer-os/documents"
          accept="image/jpeg,image/png,application/pdf"
          hint="Upload a clear scan or photo of your Aadhaar card"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUpload
          label="Bank Details (Passbook/Cancelled Cheque) *"
          value={data.bankDetailsUrl}
          onChange={(url) => onChange({ bankDetailsUrl: url })}
          folder="pioneer-os/documents"
          accept="image/jpeg,image/png,application/pdf"
          hint="Upload a passbook front page or cancelled cheque"
        />

        <FileUpload
          label="Education Certificate (Highest)"
          value={data.educationCertUrl}
          onChange={(url) => onChange({ educationCertUrl: url })}
          folder="pioneer-os/documents"
          accept="image/jpeg,image/png,application/pdf"
          hint="Upload your highest education certificate"
        />
      </div>
    </div>
  )
}
