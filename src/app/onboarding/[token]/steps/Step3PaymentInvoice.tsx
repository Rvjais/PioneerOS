'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard, Building2, Smartphone, CheckCircle, Loader2, Copy, Check,
  Clock, FileText, Download, RefreshCw, ArrowRight, Sparkles, QrCode
} from 'lucide-react'
import InfoTip from '@/client/components/ui/InfoTip'

interface Step3Props {
  data: {
    token: string
    client: { name: string; email: string }
    entity: {
      name: string
      legalName: string
      bank: {
        name: string
        account: string
        ifsc: string
        branch: string
        upi?: string
      }
    }
    invoice: {
      generated: boolean
      number: string | null
    }
    payment: {
      confirmed: boolean
      method: string | null
      reference: string | null
    }
    totalPrice: number
    advanceAmount: number
    gstAmount: number
    gstPercentage: number
    basePrice: number
  }
  onComplete: (newData?: object) => void
  onRefresh: () => void
}

type PaymentMethod = 'BANK_TRANSFER' | 'UPI' | 'CHEQUE'

export default function Step3PaymentInvoice({ data, onComplete, onRefresh }: Step3Props) {
  const [invoiceData, setInvoiceData] = useState<{
    invoice: Record<string, unknown>
    formatted: Record<string, string>
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('BANK_TRANSFER')
  const [transactionRef, setTransactionRef] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchInvoice()
  }, [])

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/onboarding/${data.token}/invoice`)
      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to fetch invoice')
      }

      setInvoiceData(result)
    } catch (err) {
      console.error('Error fetching invoice:', err)
      setError(err instanceof Error ? err.message : 'Failed to load invoice')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleSubmitPayment = async () => {
    if (!transactionRef.trim()) {
      setError('Please enter the transaction reference number')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/onboarding/${data.token}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: selectedMethod,
          transactionReference: transactionRef,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit payment')
      }

      setIsSubmitted(true)
    } catch (err) {
      console.error('Error submitting payment:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkipToAccountSetup = () => {
    // Allow user to proceed to account setup without waiting for payment confirmation
    onComplete({
      payment: {
        ...data.payment,
        // Mark as pending - accounts team will confirm later
      },
    })
  }

  // Payment confirmed - show success
  if (data.payment.confirmed) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-50 rounded-2xl border border-emerald-200 p-8"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Confirmed!</h3>
            <p className="text-gray-600">
              Your payment has been verified successfully.
            </p>

            <div className="mt-6 bg-white rounded-xl p-4 inline-block border border-gray-200">
              <div className="text-sm text-gray-600">
                Method: <span className="text-gray-900 font-medium">{data.payment.method}</span>
                <span className="mx-2">•</span>
                Reference: <span className="text-gray-900 font-medium">{data.payment.reference}</span>
              </div>
            </div>

            <motion.button
              onClick={() => onComplete()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all"
            >
              Continue to Account Setup
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Payment submitted - awaiting confirmation
  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 rounded-2xl border border-amber-200 p-8"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Clock className="w-10 h-10 text-white" />
            </motion.div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Submitted!</h3>
            <p className="text-gray-600">
              Our accounts team will verify your payment shortly.
            </p>

            <div className="mt-6 bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600">
                Reference: <span className="text-gray-900 font-medium">{transactionRef}</span>
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center space-x-4">
              <button
                onClick={() => onRefresh()}
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Status
              </button>
              <motion.button
                onClick={handleSkipToAccountSetup}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all"
              >
                Continue to Account Setup
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              You can proceed while we verify your payment
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-gray-100 rounded-2xl border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
          <p className="text-gray-600 mt-4">Loading invoice...</p>
        </div>
      </div>
    )
  }

  const { bank } = data.entity

  return (
    <div className="space-y-6">
      {/* Invoice Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Proforma Invoice</h2>
              <p className="text-sm text-gray-500">
                {data.invoice.number || 'PI-PENDING'}
              </p>
            </div>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>
        </div>

        <div className="p-6">
          {/* Amount Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-100 rounded-xl p-4">
              <p className="text-sm text-gray-500">Subtotal</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(data.basePrice)}</p>
            </div>
            <div className="bg-gray-100 rounded-xl p-4">
              <p className="text-sm text-gray-500">GST ({data.gstPercentage || 18}%)</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(data.gstAmount)}</p>
            </div>
            <div className="bg-gray-100 rounded-xl p-4">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(data.totalPrice)}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <p className="text-sm text-emerald-600">Amount Due</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(data.advanceAmount)}</p>
            </div>
          </div>

          {/* Parties */}
          <div className="flex justify-between text-sm bg-gray-50 rounded-xl p-4">
            <div>
              <p className="text-gray-500">From</p>
              <p className="font-medium text-gray-900 mt-1">{data.entity.legalName}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Bill To</p>
              <p className="font-medium text-gray-900 mt-1">{data.client.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Make Payment</h2>
              <p className="text-sm text-gray-500">Select your preferred payment method <InfoTip text="Choose how you'll make the advance payment. Bank transfer is recommended." type="action" /></p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Payment Method Tabs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building2, desc: 'NEFT/RTGS/IMPS' },
              { id: 'UPI', label: 'UPI', icon: QrCode, desc: 'Google Pay, PhonePe' },
              { id: 'CHEQUE', label: 'Cheque', icon: FileText, desc: 'Bank Cheque' },
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id as PaymentMethod)}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  selectedMethod === method.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                {selectedMethod === method.id && (
                  <motion.div
                    layoutId="activeMethod"
                    className="absolute inset-0 bg-orange-50 rounded-xl"
                  />
                )}
                <div className="relative flex flex-col items-center">
                  <method.icon className={`w-6 h-6 mb-2 ${
                    selectedMethod === method.id ? 'text-orange-500' : 'text-gray-400'
                  }`} />
                  <span className={`font-medium ${
                    selectedMethod === method.id ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {method.label}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">{method.desc}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Bank Transfer Details */}
          <AnimatePresence mode="wait">
            {selectedMethod === 'BANK_TRANSFER' && (
              <motion.div
                key="bank"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gray-50 rounded-xl p-6 space-y-4"
              >
                <h3 className="font-medium text-gray-900 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-orange-500" />
                  Bank Account Details
                </h3>

                <div className="grid gap-3">
                  {[
                    { label: 'Bank Name', value: bank.name, key: 'bank' },
                    { label: 'Account Number', value: bank.account, key: 'account' },
                    { label: 'IFSC Code', value: bank.ifsc, key: 'ifsc' },
                    { label: 'Branch', value: bank.branch, key: 'branch' },
                    { label: 'Beneficiary', value: data.entity.legalName, key: 'beneficiary' },
                  ].map(item => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200"
                    >
                      <div>
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="font-medium text-gray-900 mt-0.5">{item.value}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(item.value, item.key)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {copiedField === item.key ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-600 flex items-center">
                  Transfer {formatCurrency(data.advanceAmount)} and enter the UTR number below
                </p>
              </motion.div>
            )}

            {selectedMethod === 'UPI' && (
              <motion.div
                key="upi"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gray-50 rounded-xl p-6 space-y-4"
              >
                <h3 className="font-medium text-gray-900 flex items-center">
                  <QrCode className="w-5 h-5 mr-2 text-orange-500" />
                  UPI Payment
                </h3>

                {bank.upi ? (
                  <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">UPI ID</p>
                      <p className="font-medium text-gray-900 text-lg mt-0.5">{bank.upi}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bank.upi!, 'upi')}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {copiedField === 'upi' ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-600">UPI payment not available. Please use bank transfer.</p>
                )}

                <p className="text-sm text-gray-600">
                  Pay {formatCurrency(data.advanceAmount)} via any UPI app
                </p>
              </motion.div>
            )}

            {selectedMethod === 'CHEQUE' && (
              <motion.div
                key="cheque"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gray-50 rounded-xl p-6 space-y-4"
              >
                <h3 className="font-medium text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-emerald-600" />
                  Cheque Payment
                </h3>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Make cheque payable to:</p>
                  <p className="font-semibold text-gray-900 text-lg">{data.entity.legalName}</p>
                </div>

                <p className="text-sm text-gray-600">
                  Amount: {formatCurrency(data.advanceAmount)} | Enter the cheque number below
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transaction Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Reference / UTR Number <span className="text-red-500">*</span>
              <InfoTip text="UTR number (bank transfer), transaction ID (UPI), or cheque number. Helps us verify payment faster." type="action" />
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={e => setTransactionRef(e.target.value)}
              placeholder={
                selectedMethod === 'UPI'
                  ? 'Enter UPI Reference Number'
                  : selectedMethod === 'CHEQUE'
                  ? 'Enter Cheque Number'
                  : 'Enter UTR Number'
              }
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all hover:border-gray-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={handleSkipToAccountSetup}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip for now →
            </button>

            <motion.button
              onClick={handleSubmitPayment}
              disabled={isSubmitting || !transactionRef.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Submit Payment Info
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
