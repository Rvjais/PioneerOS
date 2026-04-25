'use client'

import { useState, useEffect, useRef } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, CheckCircle, Loader2, Download, ChevronDown, ChevronUp,
  Shield, PenTool, ArrowRight, Sparkles, Clock, FileCheck, RotateCcw
} from 'lucide-react'
import { downloadSLAPDF } from '@/server/pdf/sla-generator'
import InfoTip from '@/client/components/ui/InfoTip'

interface Step2Props {
  data: {
    token: string
    client: {
      name: string
      company: string
      email: string
      phone?: string
      gst?: string
      address?: string
      city?: string
      state?: string
      pincode?: string
    }
    entity: {
      name: string
      legalName: string
      address?: string
      gstin?: string
    }
    services: Array<{ serviceId: string; name: string }>
    totalPrice: number
    advanceAmount?: number
    contractDuration: string | null
    paymentTerms?: string | null
    sla: {
      accepted: boolean
      acceptedAt: string | null
      signerName: string | null
    }
  }
  onComplete: (newData?: object) => void
}

export default function Step2SignSLA({ data, onComplete }: Step2Props) {
  const [slaContent, setSlaContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [signerName, setSignerName] = useState(data.client.company || '')
  const [signerDesignation, setSignerDesignation] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [signatureMode, setSignatureMode] = useState<'type' | 'draw'>('type')

  // Canvas for drawing signature
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    fetchSLA()
  }, [])

  // Initialize canvas
  useEffect(() => {
    if (signatureMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.strokeStyle = '#1e40af'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
      }
    }
  }, [signatureMode])

  const fetchSLA = async () => {
    try {
      const res = await fetch(`/api/onboarding/${data.token}/sla`)
      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to fetch SLA')
      }

      setSlaContent(result.slaContent)
    } catch (err) {
      console.error('Error fetching SLA:', err)
      setError(err instanceof Error ? err.message : 'Failed to load SLA')
    } finally {
      setIsLoading(false)
    }
  }

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    setHasSignature(true)

    const rect = canvas.getBoundingClientRect()
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
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

  const getSignatureData = (): string | null => {
    if (signatureMode === 'type') {
      return signerName
    } else {
      const canvas = canvasRef.current
      if (!canvas || !hasSignature) return null
      return canvas.toDataURL('image/png')
    }
  }

  const handleDownloadPDF = async () => {
    const agreementDate = data.sla.acceptedAt
      ? formatDateDDMMYYYY(data.sla.acceptedAt)
      : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

    const formatDuration = (duration: string | null) => {
      switch (duration) {
        case '3_MONTHS': return '3 Months'
        case '6_MONTHS': return '6 Months'
        case '12_MONTHS': return '12 Months'
        case '24_MONTHS': return '24 Months'
        default: return '12 Months'
      }
    }

    const pdfData = {
      // Agreement Details
      agreementNumber: `SLA-${data.token.substring(0, 8).toUpperCase()}-${new Date().getFullYear()}`,
      agreementDate,

      // Service Provider
      providerName: data.entity.name,
      providerLegalName: data.entity.legalName,
      providerAddress: data.entity.address || '750, Udyog Vihar, Third Floor, Gurgaon, Haryana - 122016',
      providerGSTIN: data.entity.gstin || '06AAICA5555L1ZP',
      providerDirector: 'Arush Thapar',
      providerDirectorTitle: 'Director',

      // Client
      clientName: data.client.name,
      clientContactPerson: data.client.company || data.client.name,
      clientDesignation: signerDesignation || 'Authorized Signatory',
      clientAddress: data.client.address || 'Address provided during onboarding',
      clientCity: data.client.city || 'City',
      clientState: data.client.state || 'State',
      clientPincode: data.client.pincode || '',
      clientGSTIN: data.client.gst || 'Not Provided',
      clientEmail: data.client.email,
      clientPhone: data.client.phone || 'Phone provided during onboarding',

      // Contract Details
      services: data.services.map(s => ({ name: s.name })),
      contractValue: data.totalPrice,
      contractDuration: formatDuration(data.contractDuration),
      paymentTerms: data.paymentTerms || '100% Advance',
      advanceAmount: data.advanceAmount || data.totalPrice,

      // SLA Content
      slaContent,

      // Signature Details
      signerName: data.sla.signerName || signerName || 'Not yet signed',
      signerDesignation: signerDesignation || 'Authorized Signatory',
      signatureData: signatureMode === 'draw' && hasSignature ? canvasRef.current?.toDataURL('image/png') : undefined,
      signatureType: signatureMode,
      signedDate: agreementDate,
    }

    const filename = `SLA-${data.client.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
    downloadSLAPDF(pdfData, filename)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const signatureData = getSignatureData()

    if (!signerName.trim()) {
      setError('Signer name is required')
      return
    }

    if (signatureMode === 'draw' && !hasSignature) {
      setError('Please draw your signature')
      return
    }

    if (!agreedToTerms) {
      setError('You must agree to the terms')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/onboarding/${data.token}/sla`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signerName,
          signerDesignation,
          agreedToTerms,
          signatureData,
          signatureType: signatureMode,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to sign SLA')
      }

      onComplete({
        sla: {
          accepted: true,
          acceptedAt: new Date().toISOString(),
          signerName,
        },
        invoice: {
          generated: true,
          number: result.invoice?.number,
        },
      })
    } catch (err) {
      console.error('Error signing SLA:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign SLA')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Already signed
  if (data.sla.accepted) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-emerald-500/20 to-green-500/10 rounded-2xl border border-emerald-500/30 p-8"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>

            <h3 className="text-2xl font-bold text-white mb-2">Agreement Signed!</h3>
            <p className="text-emerald-300/80">
              The Service Level Agreement has been successfully signed and recorded.
            </p>

            <div className="mt-6 bg-slate-800/50 rounded-xl p-4 inline-block">
              <div className="flex items-center space-x-3 text-sm">
                <PenTool className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400">Signed by</span>
                <span className="font-semibold text-white">{data.sla.signerName}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm mt-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400">On</span>
                <span className="font-semibold text-white">
                  {data.sla.acceptedAt && new Date(data.sla.acceptedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center space-x-4">
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Copy
              </button>
              <motion.button
                onClick={() => onComplete()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
              >
                Continue to Payment
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-white/10 p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-orange-500/20 rounded-full" />
          </div>
          <p className="text-slate-400 mt-4">Loading agreement...</p>
        </div>
      </div>
    )
  }

  const inputClasses = `
    w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl
    text-white placeholder-slate-500
    focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500
    transition-all duration-200 hover:border-slate-600
  `

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-600/10 rounded-2xl border border-white/10 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Service Level Agreement</h2>
              <p className="mt-1 text-slate-400">
                Review the terms and sign digitally to proceed with your onboarding.
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center px-4 py-2 bg-slate-700/50 text-slate-300 rounded-xl border border-slate-600 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Agreement Details Summary */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Agreement Details
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Service Provider</p>
            <p className="font-medium text-white mt-1">{data.entity.name}</p>
          </div>
          <div>
            <p className="text-slate-500">Client</p>
            <p className="font-medium text-white mt-1">{data.client.name}</p>
          </div>
          <div>
            <p className="text-slate-500">Contract Value</p>
            <p className="font-medium text-emerald-400 mt-1">{formatCurrency(data.totalPrice)}</p>
          </div>
          <div>
            <p className="text-slate-500">Duration</p>
            <p className="font-medium text-white mt-1">
              {data.contractDuration?.replace(/_/g, ' ').replace('MONTHS', ' Months') || '12 Months'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SLA Content */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-800/50">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">Terms & Conditions</span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-orange-400 hover:text-orange-300 flex items-center"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Expand
                </>
              )}
            </button>
          </div>

          <div
            className={`relative overflow-hidden transition-all duration-300 ${
              isExpanded ? 'max-h-[500px]' : 'max-h-[200px]'
            }`}
          >
            <div className="p-6 overflow-y-auto max-h-[500px]">
              <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans leading-relaxed">
                {slaContent}
              </pre>
            </div>
            {!isExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-800 to-transparent pointer-events-none" />
            )}
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Digital Signature Section */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
            <div className="flex items-center space-x-2">
              <PenTool className="w-5 h-5 text-orange-400" />
              <h3 className="font-semibold text-white">Digital Signature</h3>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Sign electronically to confirm your agreement
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Signer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Legal Name <span className="text-red-400">*</span>
                  <InfoTip text="Name of the person authorized to sign on behalf of the company." type="action" />
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={e => setSignerName(e.target.value)}
                  className={inputClasses}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Designation <span className="text-slate-500">(Optional)</span>
                  <InfoTip text="Your title/position at the company (e.g., Director, CEO, Marketing Head)." type="action" />
                </label>
                <input
                  type="text"
                  value={signerDesignation}
                  onChange={e => setSignerDesignation(e.target.value)}
                  className={inputClasses}
                  placeholder="e.g., Director, CEO, Manager"
                />
              </div>
            </div>

            {/* Signature Mode Toggle */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Signature Method
                <InfoTip text="Type your name as signature, or draw it with mouse/finger." type="action" />
              </label>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setSignatureMode('type')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                    signatureMode === 'type'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span className="font-medium">Type Signature</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSignatureMode('draw')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                    signatureMode === 'draw'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span className="font-medium">Draw Signature</span>
                </button>
              </div>
            </div>

            {/* Signature Area */}
            <AnimatePresence mode="wait">
              {signatureMode === 'type' ? (
                <motion.div
                  key="type"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-xl p-6 text-center"
                >
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                    Signature Preview
                  </p>
                  <div className="border-b-2 border-slate-300 pb-3 mb-3 min-h-[60px] flex items-end justify-center">
                    {signerName && (
                      <p
                        className="text-3xl text-slate-800"
                        style={{ fontFamily: 'cursive, "Brush Script MT", "Segoe Script"' }}
                      >
                        {signerName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
                    <span>{signerDesignation || 'Authorized Signatory'}</span>
                    <span>•</span>
                    <span>{new Date().toLocaleDateString('en-IN')}</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="draw"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className="bg-white rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 text-center">
                      Draw Your Signature Below
                    </p>
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={150}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full border-2 border-dashed border-slate-300 rounded-lg cursor-crosshair touch-none"
                      style={{ touchAction: 'none' }}
                    />
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                      <span>{signerDesignation || 'Authorized Signatory'} • {new Date().toLocaleDateString('en-IN')}</span>
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="flex items-center text-red-500 hover:text-red-400"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Clear
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Agreement Checkbox */}
            <label className="flex items-start space-x-4 cursor-pointer group">
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-6 h-6 border-2 border-slate-600 rounded-lg bg-slate-800 peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all group-hover:border-slate-500">
                  {agreedToTerms && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center justify-center h-full"
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
              </div>
              <span className="text-sm text-slate-300 leading-relaxed">
                I, <strong className="text-white">{signerName || '[Your Name]'}</strong>, hereby confirm
                that I have read, understood, and agree to all terms and conditions in this Service Level
                Agreement. I am authorized to sign on behalf of <strong className="text-white">{data.client.name}</strong>.
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-slate-500 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-amber-400" />
            A confirmation email will be sent to {data.client.email}
          </p>

          <motion.button
            type="submit"
            disabled={isSubmitting || !agreedToTerms || !signerName.trim() || (signatureMode === 'draw' && !hasSignature)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing Agreement...
              </>
            ) : (
              <>
                <FileCheck className="w-5 h-5 mr-2" />
                Sign & Accept Agreement
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  )
}
