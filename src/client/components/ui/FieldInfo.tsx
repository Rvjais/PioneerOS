'use client'

import { useState } from 'react'

interface FieldInfoProps {
  /** What this field is for and what to enter */
  description: string
  /** Example value (shown in monospace) */
  example?: string
  /** Where to find this information */
  source?: string
  /** Is this field required? */
  required?: boolean
}

/**
 * FieldInfo - Info button that appears next to form labels
 *
 * Hover/click to see:
 * - What to enter in the field
 * - Example value
 * - Where to find the information
 *
 * Usage:
 *   <label>Client Name <FieldInfo description="..." example="Acme Corp" /></label>
 */
export default function FieldInfo({ description, example, source, required }: FieldInfoProps) {
  const [show, setShow] = useState(false)

  return (
    <span
      className="relative inline-flex ml-1.5 align-middle"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); setShow(!show) }}
        className="w-4 h-4 rounded-full bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 flex items-center justify-center text-[10px] font-bold cursor-help border border-blue-500/25 transition-colors"
        aria-label="Field information"
      >
        i
      </button>

      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 animate-in fade-in slide-in-from-bottom-1 duration-150">
          <span className="block bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-3 text-left">
            {/* Description */}
            <span className="block text-xs text-slate-200 leading-relaxed mb-1.5">
              {description}
            </span>

            {/* Example */}
            {example && (
              <span className="block text-[11px] text-slate-400 mb-1">
                <span className="text-green-400 font-medium">Example: </span>
                <span className="font-mono bg-slate-700/50 px-1.5 py-0.5 rounded">{example}</span>
              </span>
            )}

            {/* Source */}
            {source && (
              <span className="block text-[11px] text-slate-500">
                <span className="text-amber-400 font-medium">Where to find: </span>
                {source}
              </span>
            )}

            {/* Required indicator */}
            {required && (
              <span className="block text-[10px] text-red-400 mt-1 font-medium">* Required field</span>
            )}

            {/* Arrow */}
            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-800" />
          </span>
        </span>
      )}
    </span>
  )
}

/**
 * FormLabel with integrated FieldInfo
 *
 * Usage:
 *   <FormLabelWithInfo label="Client Name" description="..." required />
 */
export function FormLabelWithInfo({
  label,
  description,
  example,
  source,
  required,
  htmlFor,
  className = '',
}: FieldInfoProps & { label: string; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={`text-sm font-medium text-slate-200 flex items-center gap-0.5 ${className}`}>
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
      <FieldInfo description={description} example={example} source={source} required={required} />
    </label>
  )
}
