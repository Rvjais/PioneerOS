'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function EmployeeAgreementPage() {
  const [hasRead, setHasRead] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [signature, setSignature] = useState('')
  const [signatureDate] = useState(new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }))
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.strokeStyle = '#1e40af'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const handleSubmit = async () => {
    if (!agreed || !hasSignature || !signature) {
      toast.error('Please complete all required fields')
      return
    }
    // Submit agreement
    toast.success('Agreement signed successfully!')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/policies" className="text-sm text-blue-400 hover:underline mb-2 inline-block">
            &larr; Back to Policies
          </Link>
          <h1 className="text-2xl font-bold text-white">Employee Agreement</h1>
          <p className="text-slate-400">Non-Disclosure Agreement & Employment Bond</p>
        </div>
      </div>

      {/* Agreement Content */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-slate-900/40">
          <h2 className="text-lg font-semibold text-white">Employment Agreement & NDA</h2>
          <p className="text-sm text-slate-400">Please read carefully before signing</p>
        </div>

        <div
          className="p-6 max-h-[500px] overflow-y-auto prose prose-slate prose-sm"
          onScroll={(e) => {
            const target = e.target as HTMLDivElement
            if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50) {
              setHasRead(true)
            }
          }}
        >
          <h3>EMPLOYMENT AGREEMENT</h3>
          <p>This Employment Agreement (&quot;Agreement&quot;) is entered into as of the date of digital signature below, by and between:</p>

          <p><strong>BrandPioneer Media Pvt. Ltd.</strong> (hereinafter referred to as &quot;Company&quot;), and the undersigned employee (hereinafter referred to as &quot;Employee&quot;).</p>

          <h4>1. EMPLOYMENT TERMS</h4>
          <p>The Employee agrees to be employed by the Company on the terms and conditions set forth in this Agreement and the Company&apos;s policies and procedures manual.</p>

          <h4>2. PROBATION PERIOD</h4>
          <p>The Employee shall serve a probation period of three (3) months from the date of joining. During this period:</p>
          <ul>
            <li>Either party may terminate employment with one (1) week&apos;s notice</li>
            <li>Performance reviews will be conducted at 30, 60, and 90 days</li>
            <li>Benefits may be limited as per company policy</li>
          </ul>

          <h4>3. CONFIDENTIALITY (NDA)</h4>
          <p>The Employee agrees to maintain strict confidentiality regarding:</p>
          <ul>
            <li>Client information, strategies, and business data</li>
            <li>Company trade secrets and proprietary information</li>
            <li>Internal processes, methodologies, and systems</li>
            <li>Financial information and business plans</li>
            <li>Employee and vendor information</li>
          </ul>
          <p>This confidentiality obligation survives the termination of employment and continues for a period of two (2) years thereafter.</p>

          <h4>4. INTELLECTUAL PROPERTY</h4>
          <p>All work product created by the Employee during employment shall be the sole property of the Company. This includes but is not limited to:</p>
          <ul>
            <li>Creative content, designs, and marketing materials</li>
            <li>Software code and technical documentation</li>
            <li>Strategies, frameworks, and methodologies</li>
            <li>Client deliverables and presentations</li>
          </ul>

          <h4>5. NON-COMPETE CLAUSE</h4>
          <p>During employment and for six (6) months following termination, the Employee agrees not to:</p>
          <ul>
            <li>Directly solicit or service any client of the Company</li>
            <li>Recruit or solicit any employee of the Company</li>
            <li>Engage in activities that directly compete with the Company&apos;s business</li>
          </ul>

          <h4>6. EMPLOYMENT BOND</h4>
          <p>The Employee agrees to serve the Company for a minimum period of twelve (12) months from the date of joining. In the event of early termination by the Employee:</p>
          <ul>
            <li>Within 6 months: Employee shall pay Rs. 50,000 as recovery for training and onboarding costs</li>
            <li>Between 6-12 months: Employee shall pay a prorated amount based on remaining tenure</li>
          </ul>
          <p>This bond may be waived at the Company&apos;s discretion based on circumstances.</p>

          <h4>7. TERMINATION</h4>
          <p>Either party may terminate employment by providing:</p>
          <ul>
            <li>During probation: One (1) week&apos;s notice</li>
            <li>After confirmation: One (1) month&apos;s notice, or payment in lieu thereof</li>
          </ul>

          <h4>8. CONDUCT & COMPLIANCE</h4>
          <p>The Employee agrees to:</p>
          <ul>
            <li>Adhere to all company policies as outlined in the Employee Guidebook</li>
            <li>Maintain professional conduct at all times</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Report any violations or concerns through proper channels</li>
          </ul>

          <h4>9. SOCIAL MEDIA POLICY</h4>
          <p>The Employee shall not post or share any content that:</p>
          <ul>
            <li>Discloses confidential company or client information</li>
            <li>Damages the reputation of the Company or its clients</li>
            <li>Violates any applicable laws or professional standards</li>
          </ul>

          <h4>10. DISPUTE RESOLUTION</h4>
          <p>Any disputes arising from this Agreement shall be resolved through arbitration in Vadodara, Gujarat, in accordance with the Arbitration and Conciliation Act, 1996.</p>

          <h4>11. GOVERNING LAW</h4>
          <p>This Agreement shall be governed by the laws of India and the courts of Vadodara shall have exclusive jurisdiction.</p>

          <div className="mt-8 p-4 bg-amber-500/10 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800"><strong>ACKNOWLEDGMENT:</strong> By signing below, I acknowledge that I have read, understood, and agree to be bound by the terms and conditions of this Employment Agreement, including the Non-Disclosure Agreement and Employment Bond provisions.</p>
          </div>
        </div>

        {!hasRead && (
          <div className="p-4 bg-blue-500/10 border-t border-blue-100 text-center">
            <p className="text-sm text-blue-400">Please scroll through the entire agreement to continue</p>
          </div>
        )}
      </div>

      {/* Signature Section */}
      {hasRead && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white">Sign Agreement</h3>

          {/* Agreement Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 text-indigo-600 rounded border-white/20 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-300">
              I have read and understood the Employment Agreement, including the NDA and Employment Bond provisions.
              I agree to be bound by these terms and conditions.
            </span>
          </label>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Full Legal Name (as per official documents)
            </label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Signature Canvas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-200">
                Digital Signature
              </label>
              <button
                onClick={clearSignature}
                className="text-sm text-red-400 hover:underline"
              >
                Clear
              </button>
            </div>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-2 bg-slate-900/40">
              <canvas
                ref={canvasRef}
                width={600}
                height={150}
                className="w-full glass-card rounded cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Sign using your mouse or trackpad</p>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Date</label>
            <input
              type="text"
              value={signatureDate}
              readOnly
              className="w-full px-4 py-2 border border-white/10 rounded-lg bg-slate-900/40 text-slate-300"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <p className="text-sm text-slate-400">
              This signature is legally binding
            </p>
            <button
              onClick={handleSubmit}
              disabled={!agreed || !hasSignature || !signature}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sign & Submit Agreement
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
