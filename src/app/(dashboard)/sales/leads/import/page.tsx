'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

interface ParsedLead {
  companyName: string
  contactName: string
  contactEmail?: string
  contactPhone?: string
  source?: string
  value?: string | number
  leadPriority?: string
  pipeline?: string
  notes?: string
}

const COLUMN_OPTIONS = [
  { value: 'companyName', label: 'Company Name *' },
  { value: 'contactName', label: 'Contact Name *' },
  { value: 'contactEmail', label: 'Email' },
  { value: 'contactPhone', label: 'Phone' },
  { value: 'source', label: 'Source' },
  { value: 'value', label: 'Deal Value' },
  { value: 'leadPriority', label: 'Priority (HOT/WARM/COLD)' },
  { value: 'pipeline', label: 'Pipeline' },
  { value: 'notes', label: 'Notes' },
  { value: '_skip', label: '-- Skip this column --' },
]

export default function LeadImportPage() {
  const [step, setStep] = useState<'upload' | 'map' | 'preview' | 'result'>('upload')
  const [rawRows, setRawRows] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<number, string>>({})
  const [parsedLeads, setParsedLeads] = useState<ParsedLead[]>([])
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: Array<{ row: number; error: string }>; total: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function parseCSV(text: string): string[][] {
    const lines = text.split(/\r?\n/).filter(l => l.trim())
    return lines.map(line => {
      const result: string[] = []
      let current = ''
      let inQuotes = false
      for (const char of line) {
        if (char === '"') { inQuotes = !inQuotes }
        else if (char === ',' && !inQuotes) { result.push(current.trim()); current = '' }
        else { current += char }
      }
      result.push(current.trim())
      return result
    })
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast.error('Please upload a CSV file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const rows = parseCSV(text)
      if (rows.length < 2) {
        toast.error('File must have a header row and at least one data row')
        return
      }
      setHeaders(rows[0])
      setRawRows(rows.slice(1))

      // Auto-map columns by header name
      const autoMap: Record<number, string> = {}
      rows[0].forEach((header, index) => {
        const h = header.toLowerCase().replace(/[^a-z]/g, '')
        if (h.includes('company') || h.includes('business')) autoMap[index] = 'companyName'
        else if (h.includes('contact') && h.includes('name') || h === 'name' || h === 'fullname') autoMap[index] = 'contactName'
        else if (h.includes('email') || h.includes('mail')) autoMap[index] = 'contactEmail'
        else if (h.includes('phone') || h.includes('mobile') || h.includes('tel')) autoMap[index] = 'contactPhone'
        else if (h.includes('source') || h.includes('channel')) autoMap[index] = 'source'
        else if (h.includes('value') || h.includes('deal') || h.includes('amount') || h.includes('budget')) autoMap[index] = 'value'
        else if (h.includes('priority')) autoMap[index] = 'leadPriority'
        else if (h.includes('pipeline')) autoMap[index] = 'pipeline'
        else if (h.includes('note') || h.includes('comment') || h.includes('remark')) autoMap[index] = 'notes'
      })
      setColumnMapping(autoMap)
      setStep('map')
    }
    reader.readAsText(file)
  }

  function handleMapConfirm() {
    // Validate required fields are mapped
    const mappedFields = Object.values(columnMapping)
    if (!mappedFields.includes('companyName')) {
      toast.error('Company Name column must be mapped')
      return
    }
    if (!mappedFields.includes('contactName')) {
      toast.error('Contact Name column must be mapped')
      return
    }

    // Parse rows using mapping
    const leads: ParsedLead[] = rawRows.map(row => {
      const lead: Record<string, string> = {}
      Object.entries(columnMapping).forEach(([colIndex, field]) => {
        if (field !== '_skip') {
          lead[field] = row[parseInt(colIndex)] || ''
        }
      })
      // Record<string,string> doesn't overlap with ParsedLead due to optional fields
      return lead as unknown as ParsedLead
    }).filter(l => l.companyName && l.contactName)

    setParsedLeads(leads)
    setStep('preview')
  }

  async function handleImport() {
    setImporting(true)
    try {
      const res = await fetch('/api/sales/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: parsedLeads, skipDuplicates }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Import failed')
      setResult(data)
      setStep('result')
      toast.success(`${data.imported} leads imported successfully`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/sales/leads" className="text-slate-400 hover:text-white text-sm">Leads</Link>
            <span className="text-slate-600">/</span>
            <span className="text-white text-sm">Bulk Import</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Import Leads</h1>
          <p className="text-slate-400 mt-1">Upload a CSV file to bulk import leads</p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-4">
        {['Upload', 'Map Columns', 'Preview', 'Done'].map((label, i) => {
          const stepNames = ['upload', 'map', 'preview', 'result']
          const currentIndex = stepNames.indexOf(step)
          const isActive = i === currentIndex
          const isDone = i < currentIndex
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isDone ? 'bg-green-500 text-white' : isActive ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {isDone ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${isActive ? 'text-white' : 'text-slate-400'}`}>{label}</span>
              {i < 3 && <div className="w-8 h-px bg-slate-700 mx-2" />}
            </div>
          )
        })}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 rounded-xl p-12 cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-all"
          >
            <svg className="w-12 h-12 mx-auto text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-white font-medium mb-2">Click to upload CSV file</p>
            <p className="text-slate-400 text-sm">CSV with headers: Company Name, Contact Name, Email, Phone, Source, Value, Priority</p>
          </div>

          <div className="mt-6 text-left max-w-md mx-auto">
            <p className="text-sm text-slate-400 font-medium mb-2">Expected CSV format:</p>
            <pre className="text-xs text-slate-500 bg-slate-900/50 rounded-lg p-3 overflow-x-auto">
{`Company Name,Contact Name,Email,Phone,Source,Value,Priority
HealthFirst Clinic,Dr. Sharma,dr@health.com,9876543210,REFERRAL,50000,HOT
MediCare Plus,Rahul Verma,rahul@medicare.in,9812345678,WEBSITE,30000,WARM`}
            </pre>
          </div>
        </div>
      )}

      {/* Step 2: Column Mapping */}
      {step === 'map' && (
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Map CSV Columns</h2>
          <p className="text-sm text-slate-400 mb-6">Match your CSV columns to lead fields. Fields marked * are required.</p>

          <div className="space-y-3">
            {headers.map((header, index) => (
              <div key={header} className="flex items-center gap-4">
                <div className="w-48 text-sm text-slate-300 font-mono truncate">{header}</div>
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <select
                  value={columnMapping[index] || '_skip'}
                  onChange={e => setColumnMapping({ ...columnMapping, [index]: e.target.value })}
                  className="flex-1 px-3 py-2 border border-white/10 rounded-lg text-white bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {COLUMN_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <span className="text-xs text-slate-500 w-32 truncate">
                  e.g. {rawRows[0]?.[index] || '-'}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep('upload')} className="px-4 py-2 border border-white/10 text-slate-200 rounded-lg hover:bg-slate-800">
              Back
            </button>
            <button onClick={handleMapConfirm} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              Continue to Preview
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 'preview' && (
        <div className="space-y-4">
          <div className="glass-card rounded-xl border border-white/10 p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{parsedLeads.length} leads ready to import</p>
              <p className="text-sm text-slate-400">{rawRows.length - parsedLeads.length} rows skipped (missing required fields)</p>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={e => setSkipDuplicates(e.target.checked)}
                className="rounded border-white/20"
              />
              <span className="text-sm text-slate-300">Skip duplicate emails</span>
            </label>
          </div>

          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-900">
                  <tr className="border-b border-white/10">
                    <th className="text-left p-3 text-xs text-slate-400">#</th>
                    <th className="text-left p-3 text-xs text-slate-400">Company</th>
                    <th className="text-left p-3 text-xs text-slate-400">Contact</th>
                    <th className="text-left p-3 text-xs text-slate-400">Email</th>
                    <th className="text-left p-3 text-xs text-slate-400">Phone</th>
                    <th className="text-left p-3 text-xs text-slate-400">Source</th>
                    <th className="text-left p-3 text-xs text-slate-400">Value</th>
                    <th className="text-left p-3 text-xs text-slate-400">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {parsedLeads.slice(0, 50).map((lead, i) => (
                    <tr key={`lead-${lead.companyName}-${i}`} className="hover:bg-slate-900/40">
                      <td className="p-3 text-slate-500">{i + 1}</td>
                      <td className="p-3 text-white">{lead.companyName}</td>
                      <td className="p-3 text-slate-300">{lead.contactName}</td>
                      <td className="p-3 text-slate-300">{lead.contactEmail || '-'}</td>
                      <td className="p-3 text-slate-300">{lead.contactPhone || '-'}</td>
                      <td className="p-3 text-slate-300">{lead.source || 'BULK_IMPORT'}</td>
                      <td className="p-3 text-slate-300">{lead.value || '-'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          lead.leadPriority === 'HOT' ? 'bg-red-500/10 text-red-400' :
                          lead.leadPriority === 'COLD' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {lead.leadPriority || 'WARM'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedLeads.length > 50 && (
                <p className="p-3 text-center text-slate-400 text-sm">Showing first 50 of {parsedLeads.length} rows</p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('map')} className="px-4 py-2 border border-white/10 text-slate-200 rounded-lg hover:bg-slate-800">
              Back
            </button>
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {importing ? 'Importing...' : `Import ${parsedLeads.length} Leads`}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 'result' && result && (
        <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Import Complete</h2>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-6 mb-6">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <p className="text-2xl font-bold text-green-400">{result.imported}</p>
              <p className="text-xs text-slate-400">Imported</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <p className="text-2xl font-bold text-yellow-400">{result.skipped}</p>
              <p className="text-xs text-slate-400">Duplicates Skipped</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-xl">
              <p className="text-2xl font-bold text-red-400">{result.errors.length}</p>
              <p className="text-xs text-slate-400">Errors</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="text-left max-w-md mx-auto mb-6">
              <p className="text-sm text-red-400 mb-2">Errors:</p>
              <div className="max-h-32 overflow-y-auto text-xs text-slate-400 bg-slate-900/50 rounded-lg p-3">
                {result.errors.map((err, i) => (
                  <p key={`err-${err.row}`}>Row {err.row}: {err.error}</p>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Link href="/sales/leads" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              View All Leads
            </Link>
            <button
              onClick={() => { setStep('upload'); setResult(null); setRawRows([]); setHeaders([]); setParsedLeads([]) }}
              className="px-4 py-2 border border-white/10 text-slate-200 rounded-lg hover:bg-slate-800"
            >
              Import More
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
