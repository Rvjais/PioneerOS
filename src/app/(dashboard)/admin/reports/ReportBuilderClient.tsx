'use client'

import { useState } from 'react'
import { Card, CardHeader, CardContent } from '@/client/components/ui'

type ReportCategory = 'SALES' | 'HR' | 'ACCOUNTS' | 'SEO' | 'ADS' | 'SOCIAL'
type ReportType = 'TACTICAL' | 'STRATEGIC' | 'OPERATIONS' | 'PERFORMANCE' | 'FINANCIAL'
type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json'
type DatePreset = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter' | 'custom'

const CATEGORIES: { value: ReportCategory; label: string; description: string }[] = [
  { value: 'SALES', label: 'Sales', description: 'Lead tracking, conversions, pipeline' },
  { value: 'HR', label: 'Human Resources', description: 'Employee data, attendance, performance' },
  { value: 'ACCOUNTS', label: 'Accounts', description: 'Invoices, payments, financial reports' },
  { value: 'SEO', label: 'SEO', description: 'Search rankings, traffic, keywords' },
  { value: 'ADS', label: 'Ads', description: 'Ad performance, spend, ROI' },
  { value: 'SOCIAL', label: 'Social Media', description: 'Engagement, followers, content' },
]

const REPORT_TYPES: { value: ReportType; label: string; description: string }[] = [
  { value: 'OPERATIONS', label: 'Operations', description: 'Daily operational metrics' },
  { value: 'TACTICAL', label: 'Tactical', description: 'Weekly tactical insights' },
  { value: 'STRATEGIC', label: 'Strategic', description: 'Monthly strategic overview' },
  { value: 'PERFORMANCE', label: 'Performance', description: 'KPI and performance analysis' },
  { value: 'FINANCIAL', label: 'Financial', description: 'Revenue and cost analysis' },
]

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'last_quarter', label: 'Last Quarter' },
  { value: 'custom', label: 'Custom Range' },
]

const EXPORT_FORMATS: { value: ExportFormat; label: string; icon: string; description: string }[] = [
  { value: 'excel', label: 'Excel', icon: '📊', description: 'Microsoft Excel format (.xls)' },
  { value: 'csv', label: 'CSV', icon: '📄', description: 'Comma-separated values' },
  { value: 'pdf', label: 'PDF/Print', icon: '📑', description: 'Print-ready HTML format' },
  { value: 'json', label: 'JSON', icon: '{ }', description: 'Raw data format' },
]

export function ReportBuilderClient() {
  const [category, setCategory] = useState<ReportCategory | ''>('')
  const [reportType, setReportType] = useState<ReportType | ''>('')
  const [datePreset, setDatePreset] = useState<DatePreset>('this_month')
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')
  const [format, setFormat] = useState<ExportFormat>('excel')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!category || !reportType) {
      setError('Please select a category and report type')
      return
    }

    if (datePreset === 'custom' && (!customDateFrom || !customDateTo)) {
      setError('Please select custom date range')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          reportType,
          datePreset: datePreset !== 'custom' ? datePreset : undefined,
          dateFrom: datePreset === 'custom' ? customDateFrom : undefined,
          dateTo: datePreset === 'custom' ? customDateTo : undefined,
          format,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate report')
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `report.${format === 'excel' ? 'xls' : format}`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/)
        if (match) filename = match[1]
      }

      // Download the file
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Report Builder</h1>
        <p className="text-slate-400 mt-1">Generate and export custom reports</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 text-red-400 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Step 1: Select Category */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center">
                1
              </span>
              <h3 className="font-semibold text-white">Select Category</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    category === cat.value
                      ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20'
                      : 'border-white/10 hover:border-white/20 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="font-medium text-white">{cat.label}</div>
                  <div className="text-xs text-slate-400 mt-1">{cat.description}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Select Report Type */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center">
                2
              </span>
              <h3 className="font-semibold text-white">Select Report Type</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {REPORT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setReportType(type.value)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    reportType === type.value
                      ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20'
                      : 'border-white/10 hover:border-white/20 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-white">{type.label}</span>
                      <span className="text-sm text-slate-400 ml-2">{type.description}</span>
                    </div>
                    {reportType === type.value && (
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Date Range */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center">
                3
              </span>
              <h3 className="font-semibold text-white">Date Range</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {DATE_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setDatePreset(preset.value)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      datePreset === preset.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800/50 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {datePreset === 'custom' && (
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">From</label>
                    <input
                      type="date"
                      value={customDateFrom}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">To</label>
                    <input
                      type="date"
                      value={customDateTo}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Export Format */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center">
                4
              </span>
              <h3 className="font-semibold text-white">Export Format</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {EXPORT_FORMATS.map((fmt) => (
                <button
                  key={fmt.value}
                  onClick={() => setFormat(fmt.value)}
                  className={`p-4 rounded-lg border text-center transition-all ${
                    format === fmt.value
                      ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20'
                      : 'border-white/10 hover:border-white/20 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="text-2xl mb-1">{fmt.icon}</div>
                  <div className="font-medium text-white">{fmt.label}</div>
                  <div className="text-xs text-slate-400 mt-1">{fmt.description}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !category || !reportType}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Generate & Download Report
            </>
          )}
        </button>
      </div>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-white">Quick Reports</h3>
          <p className="text-sm text-slate-400">One-click access to commonly used reports</p>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Monthly Sales Summary', category: 'SALES', type: 'STRATEGIC', preset: 'this_month' },
              { name: 'Weekly HR Operations', category: 'HR', type: 'OPERATIONS', preset: 'this_week' },
              { name: 'Invoice Report', category: 'ACCOUNTS', type: 'FINANCIAL', preset: 'this_month' },
              { name: 'Ad Performance', category: 'ADS', type: 'PERFORMANCE', preset: 'last_week' },
            ].map((quick, idx) => (
              <button
                key={quick.name}
                onClick={() => {
                  setCategory(quick.category as ReportCategory)
                  setReportType(quick.type as ReportType)
                  setDatePreset(quick.preset as DatePreset)
                }}
                className="p-4 rounded-lg border border-white/10 hover:border-blue-300 hover:bg-blue-500/10 transition-all text-left"
              >
                <div className="text-sm font-medium text-white">{quick.name}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {quick.category} • {quick.type}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
