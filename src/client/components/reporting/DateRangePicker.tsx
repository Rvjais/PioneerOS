'use client'

import { useState } from 'react'

type Preset = 'today' | '7d' | '30d' | '90d' | 'custom'

interface Props {
  value: Preset
  customFrom?: string
  customTo?: string
  onChange: (preset: Preset, from?: string, to?: string) => void
  compareEnabled?: boolean
  onCompareChange?: (enabled: boolean) => void
}

const PRESETS = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
  { key: 'custom', label: 'Custom' },
] as const

export default function DateRangePicker({
  value,
  customFrom,
  customTo,
  onChange,
  compareEnabled = false,
  onCompareChange,
}: Props) {
  const [showCustom, setShowCustom] = useState(value === 'custom')
  const [tempFrom, setTempFrom] = useState(customFrom || '')
  const [tempTo, setTempTo] = useState(customTo || '')

  const handlePresetClick = (preset: Preset) => {
    if (preset === 'custom') {
      setShowCustom(true)
    } else {
      setShowCustom(false)
      onChange(preset)
    }
  }

  const handleCustomApply = () => {
    if (tempFrom && tempTo) {
      onChange('custom', tempFrom, tempTo)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* Preset buttons */}
      <div className="flex bg-slate-800 rounded-lg p-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.key}
            onClick={() => handlePresetClick(preset.key)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              value === preset.key
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom date inputs */}
      {showCustom && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={tempFrom}
            onChange={(e) => setTempFrom(e.target.value)}
            className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={tempTo}
            onChange={(e) => setTempTo(e.target.value)}
            className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCustomApply}
            disabled={!tempFrom || !tempTo}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
          >
            Apply
          </button>
        </div>
      )}

      {/* Compare toggle */}
      {onCompareChange && (
        <label className="flex items-center gap-2 ml-4 cursor-pointer">
          <input
            type="checkbox"
            checked={compareEnabled}
            onChange={(e) => onCompareChange(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-400 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-400">Compare to previous</span>
        </label>
      )}
    </div>
  )
}
