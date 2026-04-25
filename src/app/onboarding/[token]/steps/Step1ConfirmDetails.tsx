'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, Mail, Phone, MapPin, FileCheck, Loader2, Sparkles, ArrowRight,
  Plus, Minus, Send, CheckCircle, Clock, AlertCircle, Package
} from 'lucide-react'
import PageGuide from '@/client/components/ui/PageGuide'
import InfoTip from '@/client/components/ui/InfoTip'
import SectionLabel from '@/client/components/ui/SectionLabel'

interface ServiceChangeRequest {
  id: string
  type: string
  serviceName: string
  status: string
  annexureNumber: string | null
  reason: string | null
  createdAt: string
}

interface Step1Props {
  data: {
    token: string
    client: {
      name: string
      email: string
      phone: string
      company: string
      gst: string
      address: string
      city: string
      state: string
      pincode: string
    }
    services: Array<{ serviceId: string; name: string; price?: number }>
    basePrice: number
    totalPrice: number
    advanceAmount: number
    contractDuration: string | null
    allowServiceModification?: boolean
  }
  onComplete: (newData?: object) => void
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
]

export default function Step1ConfirmDetails({ data, onComplete }: Step1Props) {
  const [formData, setFormData] = useState({
    clientName: data.client.name,
    clientEmail: data.client.email,
    clientPhone: data.client.phone,
    clientCompany: data.client.company,
    clientGst: data.client.gst,
    clientAddress: data.client.address,
    clientCity: data.client.city,
    clientState: data.client.state,
    clientPincode: data.client.pincode,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Service change request state
  const [changeRequests, setChangeRequests] = useState<ServiceChangeRequest[]>([])
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestType, setRequestType] = useState<'ADD_SERVICE' | 'REMOVE_SERVICE'>('ADD_SERVICE')
  const [requestServiceName, setRequestServiceName] = useState('')
  const [requestReason, setRequestReason] = useState('')
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState('')
  const [requestError, setRequestError] = useState('')

  // Load existing change requests on mount
  useEffect(() => {
    fetch(`/api/onboarding/${data.token}/service-change-request`)
      .then(res => res.json())
      .then(result => {
        if (result.requests) setChangeRequests(result.requests)
      })
      .catch(() => {})
  }, [data.token])

  const handleServiceChangeRequest = async () => {
    if (!requestServiceName.trim()) {
      setRequestError('Please enter a service name')
      return
    }
    setIsSubmittingRequest(true)
    setRequestError('')
    setRequestSuccess('')
    try {
      const res = await fetch(`/api/onboarding/${data.token}/service-change-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: requestType,
          serviceName: requestServiceName.trim(),
          reason: requestReason.trim() || undefined,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to submit request')
      setRequestSuccess(`Request submitted! Reference: ${result.changeRequest.annexureNumber}`)
      setChangeRequests(prev => [{
        id: result.changeRequest.id,
        type: result.changeRequest.type,
        serviceName: result.changeRequest.serviceName,
        status: result.changeRequest.status,
        annexureNumber: result.changeRequest.annexureNumber,
        reason: requestReason.trim() || null,
        createdAt: new Date().toISOString(),
      }, ...prev])
      setRequestServiceName('')
      setRequestReason('')
      setShowRequestForm(false)
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDuration = (duration: string | null) => {
    switch (duration) {
      case '3_MONTHS': return '3 Months'
      case '6_MONTHS': return '6 Months'
      case '12_MONTHS': return '12 Months'
      case '24_MONTHS': return '24 Months'
      default: return '12 Months'
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.clientName.trim()) newErrors.clientName = 'Company name is required'
    if (!formData.clientEmail.trim()) newErrors.clientEmail = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) newErrors.clientEmail = 'Invalid email format'
    if (!formData.clientPhone.trim()) newErrors.clientPhone = 'Phone is required'
    else if (formData.clientPhone.replace(/\D/g, '').length < 10) newErrors.clientPhone = 'Invalid phone number'
    if (!formData.clientCompany.trim()) newErrors.clientCompany = 'Contact name is required'
    if (!formData.clientAddress.trim()) newErrors.clientAddress = 'Address is required'
    if (!formData.clientCity.trim()) newErrors.clientCity = 'City is required'
    if (!formData.clientState.trim()) newErrors.clientState = 'State is required'

    // GST validation (if provided)
    if (formData.clientGst && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.clientGst)) {
      newErrors.clientGst = 'Invalid GST number format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    // Trim all string values before submission
    const trimmedData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
    )
    setFormData(prev => ({ ...prev, ...trimmedData }))

    try {
      const res = await fetch(`/api/onboarding/${data.token}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trimmedData),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to confirm details')
      }

      onComplete({
        client: {
          name: formData.clientName,
          email: formData.clientEmail,
          phone: formData.clientPhone,
          company: formData.clientCompany,
          gst: formData.clientGst,
          address: formData.clientAddress,
          city: formData.clientCity,
          state: formData.clientState,
          pincode: formData.clientPincode,
        },
      })
    } catch (error) {
      console.error('Error:', error)
      setErrors({ form: error instanceof Error ? error.message : 'Something went wrong' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClasses = (hasError: boolean) => `
    w-full px-4 py-3 bg-slate-800/50 border rounded-xl
    text-white placeholder-slate-500
    focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500
    transition-all duration-200
    ${hasError ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700 hover:border-slate-600'}
  `

  return (
    <div className="space-y-6">
      <PageGuide
        title="Confirm Your Details"
        description="Confirm your business details. These will be used in your SLA and invoice."
        pageKey="onboarding-step1"
      />

      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-600/10 rounded-2xl border border-white/10 p-6"
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Welcome to Your Onboarding</h2>
            <p className="mt-1 text-slate-400">
              Let's start by confirming your company details. This information will be used for your account and invoices.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Engagement Summary */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Engagement Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-700/30 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{data.services.length}</p>
            <p className="text-xs text-slate-500 mt-1">Services</p>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{formatDuration(data.contractDuration).split(' ')[0]}</p>
            <p className="text-xs text-slate-500 mt-1">Months</p>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {formatCurrency(data.totalPrice)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Total Value</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl p-4 text-center border border-orange-500/20">
            <p className="text-2xl font-bold text-orange-400">{formatCurrency(data.advanceAmount)}</p>
            <p className="text-xs text-slate-400 mt-1">Due Now</p>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Services Included</h3>
              <p className="text-sm text-slate-500">Your selected service package</p>
            </div>
          </div>
          {data.allowServiceModification !== false && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowRequestForm(!showRequestForm); setRequestSuccess(''); setRequestError('') }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-xl hover:bg-cyan-500/20 transition-all"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Request Change
            </motion.button>
          )}
        </div>

        {/* Current services */}
        <div className="space-y-2 mb-4">
          {data.services.map((service, idx) => (
            <div
              key={service.name}
              className="flex items-center justify-between px-4 py-3 bg-slate-700/30 rounded-xl border border-white/5"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm font-medium text-white">{service.name}</span>
              </div>
              {service.price !== undefined && service.price > 0 && (
                <span className="text-sm text-slate-400">
                  {formatCurrency(service.price)}/mo
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Request success/error messages */}
        {requestSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {requestSuccess}
          </motion.div>
        )}
        {requestError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {requestError}
          </motion.div>
        )}

        {/* Change request form */}
        {showRequestForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-cyan-500/20 bg-cyan-500/5 rounded-xl p-4 space-y-4"
          >
            <h4 className="text-sm font-semibold text-cyan-400">Request Service Change</h4>

            {/* Type selection */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRequestType('ADD_SERVICE')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  requestType === 'ADD_SERVICE'
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Service
              </button>
              <button
                type="button"
                onClick={() => setRequestType('REMOVE_SERVICE')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  requestType === 'REMOVE_SERVICE'
                    ? 'bg-red-500/20 border-red-500/30 text-red-400'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Minus className="w-4 h-4" />
                Remove Service
              </button>
            </div>

            {/* Service name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Service Name <span className="text-red-400">*</span>
                <InfoTip text="The service you want to add or remove from your package." type="action" />
              </label>
              <input
                type="text"
                value={requestServiceName}
                onChange={e => setRequestServiceName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                placeholder={requestType === 'ADD_SERVICE' ? 'e.g., Video Production, Google Ads' : 'e.g., SEO, Content Writing'}
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Reason / Notes <span className="text-slate-500">(Optional)</span>
                <InfoTip text="Brief explanation for the change. Helps us process faster." type="action" />
              </label>
              <textarea
                value={requestReason}
                onChange={e => setRequestReason(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                placeholder="Tell us why you'd like this change..."
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowRequestForm(false); setRequestError('') }}
                className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                type="button"
                disabled={isSubmittingRequest}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleServiceChangeRequest}
                className="inline-flex items-center px-5 py-2.5 bg-cyan-600 text-white text-sm font-semibold rounded-xl hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmittingRequest ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Request
                  </>
                )}
              </motion.button>
            </div>

            <p className="text-xs text-slate-500">
              Your request will be reviewed by our team. Pricing and SLA will be updated accordingly for subsequent months.
            </p>
          </motion.div>
        )}

        {/* Existing change requests */}
        {changeRequests.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Requests</h4>
            {changeRequests.map(req => (
              <div
                key={req.id}
                className="flex items-center justify-between px-4 py-3 bg-slate-700/20 rounded-xl border border-white/5"
              >
                <div className="flex items-center space-x-3">
                  {req.type === 'ADD_SERVICE' ? (
                    <Plus className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Minus className="w-4 h-4 text-red-400" />
                  )}
                  <div>
                    <span className="text-sm font-medium text-white">{req.serviceName}</span>
                    {req.annexureNumber && (
                      <span className="ml-2 text-xs text-slate-500">({req.annexureNumber})</span>
                    )}
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                  req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                  req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                  req.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                  req.status === 'IMPLEMENTED' ? 'bg-cyan-500/10 text-cyan-400' :
                  'bg-slate-500/10 text-slate-400'
                }`}>
                  {req.status === 'PENDING' && <Clock className="w-3 h-3" />}
                  {req.status === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form */}
      <SectionLabel title="Your Details" type="action" description="Please review and update as needed" />
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.form && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm"
          >
            {errors.form}
          </motion.div>
        )}

        {/* Company Information */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Company Information</h3>
              <p className="text-sm text-slate-500">Your business details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Company / Brand Name <span className="text-red-400">*</span>
                <InfoTip text="This name will appear on your SLA and invoices" type="action" />
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                className={inputClasses(!!errors.clientName)}
                placeholder="Enter company name"
              />
              {errors.clientName && <p className="mt-1.5 text-sm text-red-400">{errors.clientName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                GST Number <span className="text-slate-500">(Optional)</span>
                <InfoTip text="Required for GST invoicing. Format: 22AAAAA0000A1Z5" type="action" />
              </label>
              <input
                type="text"
                value={formData.clientGst}
                onChange={e => setFormData({ ...formData, clientGst: e.target.value.toUpperCase() })}
                className={inputClasses(!!errors.clientGst)}
                placeholder="22AAAAA0000A1Z5"
              />
              {errors.clientGst && <p className="mt-1.5 text-sm text-red-400">{errors.clientGst}</p>}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Contact Information</h3>
              <p className="text-sm text-slate-500">Primary contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Contact Person <span className="text-red-400">*</span>
                <InfoTip text="Primary person we'll communicate with about your account." type="action" />
              </label>
              <input
                type="text"
                value={formData.clientCompany}
                onChange={e => setFormData({ ...formData, clientCompany: e.target.value })}
                className={inputClasses(!!errors.clientCompany)}
                placeholder="Enter contact name"
              />
              {errors.clientCompany && <p className="mt-1.5 text-sm text-red-400">{errors.clientCompany}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address <span className="text-red-400">*</span>
                <InfoTip text="Used for all official communications and portal login" type="action" />
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
                className={inputClasses(!!errors.clientEmail)}
                placeholder="email@company.com"
              />
              {errors.clientEmail && <p className="mt-1.5 text-sm text-red-400">{errors.clientEmail}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number <span className="text-red-400">*</span>
                <InfoTip text="WhatsApp-enabled number. We'll send project updates and reminders here." type="action" />
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-700 bg-slate-800 text-slate-400 text-sm">
                  <Phone className="w-4 h-4 mr-2" />
                  +91
                </span>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={e => setFormData({ ...formData, clientPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className={`${inputClasses(!!errors.clientPhone)} rounded-l-none`}
                  placeholder="9876543210"
                />
              </div>
              {errors.clientPhone && <p className="mt-1.5 text-sm text-red-400">{errors.clientPhone}</p>}
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Billing Address</h3>
              <p className="text-sm text-slate-500">For invoicing purposes</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Street Address <span className="text-red-400">*</span>
                <InfoTip text="Registered business address for invoicing and SLA documents." type="action" />
              </label>
              <textarea
                value={formData.clientAddress}
                onChange={e => setFormData({ ...formData, clientAddress: e.target.value })}
                rows={2}
                className={inputClasses(!!errors.clientAddress)}
                placeholder="Enter full address"
              />
              {errors.clientAddress && <p className="mt-1.5 text-sm text-red-400">{errors.clientAddress}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  City <span className="text-red-400">*</span>
                  <InfoTip text="City of your registered business address." type="action" />
                </label>
                <input
                  type="text"
                  value={formData.clientCity}
                  onChange={e => setFormData({ ...formData, clientCity: e.target.value })}
                  className={inputClasses(!!errors.clientCity)}
                  placeholder="City"
                />
                {errors.clientCity && <p className="mt-1.5 text-sm text-red-400">{errors.clientCity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  State <span className="text-red-400">*</span>
                  <InfoTip text="State where your business is registered." type="action" />
                </label>
                <select
                  value={formData.clientState}
                  onChange={e => setFormData({ ...formData, clientState: e.target.value })}
                  className={inputClasses(!!errors.clientState)}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.clientState && <p className="mt-1.5 text-sm text-red-400">{errors.clientState}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  PIN Code
                  <InfoTip text="6-digit postal code of your business address." type="action" />
                </label>
                <input
                  type="text"
                  value={formData.clientPincode}
                  onChange={e => setFormData({ ...formData, clientPincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className={inputClasses(false)}
                  placeholder="110001"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <FileCheck className="w-5 h-5 mr-2" />
                Confirm & Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  )
}
