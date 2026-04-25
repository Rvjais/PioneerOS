'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, Users, RefreshCw, Mail, Phone } from 'lucide-react'

interface Step5Props {
  data: {
    token: string
    client: { name: string; email: string }
    entity: { name: string }
  }
  onRefresh: () => void
}

export default function Step5AwaitingActivation({ data, onRefresh }: Step5Props) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      onRefresh()
    }, 30000)

    return () => clearInterval(interval)
  }, [onRefresh])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-white/10">
      <div className="p-8 text-center">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <Clock className="w-10 h-10 text-amber-400" />
          </motion.div>
        </motion.div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Awaiting Portal Activation
        </h2>
        <p className="text-gray-300 max-w-md mx-auto mb-8">
          Thank you for completing the onboarding! Our team is reviewing your details
          and will activate your portal shortly.
        </p>

        {/* Progress Steps */}
        <div className="max-w-sm mx-auto mb-8">
          <div className="space-y-4">
            {[
              { label: 'Onboarding Completed', completed: true },
              { label: 'Team Review', completed: false, inProgress: true },
              { label: 'Account Manager Assignment', completed: false },
              { label: 'Portal Activation', completed: false },
            ].map((step, index) => (
              <div key={step.label} className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed
                      ? 'bg-green-500'
                      : step.inProgress
                      ? 'bg-yellow-500'
                      : 'bg-white/10'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : step.inProgress ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw className="w-4 h-4 text-white" />
                    </motion.div>
                  ) : (
                    <span className="text-sm text-gray-400">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    step.completed
                      ? 'text-green-400 font-medium'
                      : step.inProgress
                      ? 'text-amber-400 font-medium'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-orange-500/10 rounded-xl p-6 text-left max-w-md mx-auto mb-6 border border-orange-500/20">
          <h3 className="text-sm font-semibold text-orange-400 mb-3 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            What happens next?
          </h3>
          <ul className="space-y-2 text-sm text-orange-400">
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-orange-500" />
              Our team will review your onboarding details
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-orange-500" />
              An Account Manager will be assigned to you
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-orange-500" />
              You&apos;ll receive portal login credentials via email
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-orange-500" />
              A kickoff meeting will be scheduled
            </li>
          </ul>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center px-4 py-2 text-gray-300 border border-white/20 rounded-lg hover:bg-gray-900/40 mb-8"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Check Status
        </button>

        {/* Contact Info */}
        <div className="border-t border-white/10 pt-6">
          <p className="text-sm text-gray-400 mb-3">
            Have questions? Contact us:
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <a
              href={`mailto:accounts@${data.entity.name.toLowerCase().replace(/\s/g, '')}.in`}
              className="flex items-center text-orange-400 hover:text-orange-400"
            >
              <Mail className="w-4 h-4 mr-1" />
              Email Support
            </a>
            <a
              href={`tel:${encodeURI('+91 98765 43210')}`}
              className="flex items-center text-orange-400 hover:text-orange-400"
            >
              <Phone className="w-4 h-4 mr-1" />
              Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
