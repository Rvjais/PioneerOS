'use client'

import { motion } from 'framer-motion'
import {
  CheckCircle, IndianRupee, Calendar, Clock, FileText,
  Building2, MapPin, Briefcase,
} from 'lucide-react'
import { GlassCard } from './ui'
import { formatCurrency, formatDate } from './types'
import type { OnboardingData } from './types'

interface Step2Props {
  data: OnboardingData
  onComplete: () => void
}

export default function Step2ReviewOffer({ data, onComplete }: Step2Props) {
  const annualCTC = data.offer.salary * 12

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Review Your Offer</h2>
        <p className="text-gray-500">Please review the offer details below carefully.</p>
      </div>

      <GlassCard className="p-6 space-y-6">
        <div className="text-center pb-6 border-b border-gray-200">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{data.offer.position}</h3>
          <p className="text-orange-600 font-medium">{data.offer.department}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <IndianRupee className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Monthly CTC</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(data.offer.salary)}</p>
              <p className="text-xs text-gray-500">Annual: {formatCurrency(annualCTC)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Joining Date</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(data.offer.joiningDate)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Probation Period</p>
              <p className="text-lg font-bold text-gray-900">{data.offer.probationMonths} Months</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Bond Duration</p>
              <p className="text-lg font-bold text-gray-900">{data.offer.bondDurationMonths} Months</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Employment Type</p>
              <p className="text-lg font-bold text-gray-900">{data.offer.employmentType.replace(/_/g, ' ')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Company</p>
              <p className="text-lg font-bold text-gray-900">{data.entity.name}</p>
            </div>
          </div>
        </div>

        {/* Salary Breakdown */}
        <div className="pt-5 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Salary Breakdown (Estimated)</h4>
          <div className="space-y-2">
            {[
              { label: 'Basic Salary (50%)', value: formatCurrency(data.offer.salary * 0.5) },
              { label: 'HRA (20%)', value: formatCurrency(data.offer.salary * 0.2) },
              { label: 'Special Allowance (20%)', value: formatCurrency(data.offer.salary * 0.2) },
              { label: 'Other Allowances (10%)', value: formatCurrency(data.offer.salary * 0.1) },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.label}</span>
                <span className="text-gray-900 font-medium">{item.value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200">
              <span className="text-orange-600">Total Monthly CTC</span>
              <span className="text-orange-600">{formatCurrency(data.offer.salary)}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onComplete}
        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-2xl shadow-sm transition-all duration-300 flex items-center justify-center gap-3"
      >
        <CheckCircle className="w-6 h-6" />
        I Accept This Offer
      </motion.button>
    </div>
  )
}
