'use client'

import { useState, useCallback } from 'react'
import WebcamCapture from './WebcamCapture'

interface KYCVerificationProps {
  onComplete: (data: { selfieImage: string; panNumber: string; aadhaarNumber: string }) => void
  initialPan?: string
  initialAadhaar?: string
}

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const AADHAAR_REGEX = /^\d{12}$/

function formatAadhaar(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 12)
  if (digits.length <= 4) return digits
  if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`
}

function stripAadhaar(formatted: string): string {
  return formatted.replace(/\D/g, '')
}

function CheckIcon() {
  return (
    <svg
      className="h-5 w-5 text-green-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

export default function KYCVerification({
  onComplete,
  initialPan = '',
  initialAadhaar = '',
}: KYCVerificationProps) {
  const [selfieImage, setSelfieImage] = useState<string | null>(null)
  const [panNumber, setPanNumber] = useState(initialPan.toUpperCase())
  const [aadhaarDisplay, setAadhaarDisplay] = useState(
    initialAadhaar ? formatAadhaar(initialAadhaar) : ''
  )

  const aadhaarRaw = stripAadhaar(aadhaarDisplay)
  const isPanValid = PAN_REGEX.test(panNumber)
  const isAadhaarValid = AADHAAR_REGEX.test(aadhaarRaw)
  const canSubmit = selfieImage !== null && isPanValid && isAadhaarValid

  const handleCapture = useCallback((imageData: string) => {
    setSelfieImage(imageData)
  }, [])

  const handlePanChange = (value: string) => {
    // Only allow alphanumeric, auto-uppercase, max 10 chars
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10)
    setPanNumber(cleaned)
  }

  const handleAadhaarChange = (value: string) => {
    // Strip to digits, reformat
    const digits = value.replace(/\D/g, '').slice(0, 12)
    setAadhaarDisplay(formatAadhaar(digits))
  }

  const handleSubmit = () => {
    if (!canSubmit || !selfieImage) return
    onComplete({
      selfieImage,
      panNumber,
      aadhaarNumber: aadhaarRaw,
    })
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8 rounded-xl bg-slate-900 p-6 text-white">
      <div>
        <h2 className="text-lg font-semibold text-white">Identity Verification</h2>
        <p className="mt-1 text-sm text-slate-400">
          Complete KYC by providing a selfie and your document details.
        </p>
      </div>

      {/* Step 1: Selfie */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-slate-300">Step 1 &mdash; Selfie</h3>
        {selfieImage ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-green-500">
              <img
                src={selfieImage}
                alt="Captured selfie"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-1.5 text-green-400 text-sm">
              <CheckIcon />
              <span>Photo captured</span>
            </div>
            <button
              type="button"
              onClick={() => setSelfieImage(null)}
              className="text-xs text-slate-400 hover:text-white underline transition-colors"
            >
              Retake photo
            </button>
          </div>
        ) : (
          <WebcamCapture onCapture={handleCapture} />
        )}
      </section>

      {/* Step 2: PAN */}
      <section className="space-y-2">
        <h3 className="text-sm font-medium text-slate-300">Step 2 &mdash; PAN Card Number</h3>
        <div className="relative">
          <input
            type="text"
            value={panNumber}
            onChange={(e) => handlePanChange(e.target.value)}
            placeholder="ABCDE1234F"
            maxLength={10}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 pr-10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          {isPanValid && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckIcon />
            </span>
          )}
        </div>
        {panNumber.length > 0 && !isPanValid && (
          <p className="text-xs text-slate-500">
            Format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
          </p>
        )}
      </section>

      {/* Step 3: Aadhaar */}
      <section className="space-y-2">
        <h3 className="text-sm font-medium text-slate-300">Step 3 &mdash; Aadhaar Number</h3>
        <div className="relative">
          <input
            type="text"
            value={aadhaarDisplay}
            onChange={(e) => handleAadhaarChange(e.target.value)}
            placeholder="1234-5678-9012"
            maxLength={14}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 pr-10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          {isAadhaarValid && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckIcon />
            </span>
          )}
        </div>
        {aadhaarRaw.length > 0 && !isAadhaarValid && (
          <p className="text-xs text-slate-500">Enter 12-digit Aadhaar number</p>
        )}
      </section>

      {/* Submit */}
      <button
        type="button"
        disabled={!canSubmit}
        onClick={handleSubmit}
        className={`w-full rounded-lg px-5 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
          canSubmit
            ? 'bg-blue-600 hover:bg-blue-500 text-white focus:ring-blue-500'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        Complete Verification
      </button>
    </div>
  )
}
