'use client'

import { motion } from 'framer-motion'
import { Rocket, CheckCircle, ExternalLink, Mail, Phone, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Step6Props {
  data: {
    client: { name: string; email: string }
    entity: { name: string }
    services: Array<{ name: string }>
  }
}

export default function Step6Activated({ data }: Step6Props) {
  const [confetti, setConfetti] = useState<{ id: number; left: number; delay: number; color: string }[]>([])

  useEffect(() => {
    // Generate confetti on mount
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#22c55e']
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
    setConfetti(pieces)
  }, [])

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-white/10 relative overflow-hidden">
      {/* CSS Confetti */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="absolute w-3 h-3 pointer-events-none"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            backgroundColor: piece.color,
            animation: `confetti-fall 3s ease-in-out ${piece.delay}s infinite`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}

      <div className="p-8 text-center relative z-10">
        {/* Animated Rocket Icon */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.8, bounce: 0.4 }}
          className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-none"
        >
          <motion.div
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Rocket className="w-12 h-12 text-white" />
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white mb-2"
        >
          Welcome Aboard!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-300 max-w-md mx-auto mb-8"
        >
          Congratulations! Your portal has been activated and you&apos;re all set
          to start your journey with {data.entity.name}.
        </motion.p>

        {/* Success Checkmarks */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-sm mx-auto mb-8"
        >
          <div className="space-y-3">
            {[
              'Details Confirmed',
              'SLA Signed',
              'Payment Verified',
              'Account Setup Complete',
              'Portal Activated',
            ].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center space-x-3 bg-green-500/10 rounded-lg p-3"
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-400 font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-orange-500/10 rounded-xl p-6 max-w-md mx-auto mb-8 border border-orange-500/20"
        >
          <h3 className="text-sm font-semibold text-orange-400 mb-3">
            Services Activated
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {data.services.map(service => (
              <span
                key={service.name}
                className="px-3 py-1 bg-slate-800/50 rounded-full text-sm text-orange-400 border border-orange-500/20"
              >
                {service.name}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Portal Login Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mb-8"
        >
          <a
            href="/client-login"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 shadow-none hover:shadow-none transition-all"
          >
            Access Client Portal
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
          <p className="text-sm text-gray-400 mt-2">
            Login credentials have been sent to {data.client.email}
          </p>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="bg-gray-900/40 rounded-lg p-6 max-w-md mx-auto mb-6"
        >
          <h3 className="text-sm font-semibold text-gray-200 mb-4 flex items-center justify-center">
            <Calendar className="w-4 h-4 mr-2" />
            Next Steps
          </h3>
          <ul className="space-y-3 text-sm text-gray-300 text-left">
            <li className="flex items-start">
              <span className="w-6 h-6 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                1
              </span>
              <span>Your Account Manager will reach out within 24 hours</span>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                2
              </span>
              <span>A kickoff meeting will be scheduled to discuss strategy</span>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                3
              </span>
              <span>Work begins as per the agreed timeline</span>
            </li>
          </ul>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7 }}
          className="border-t border-white/10 pt-6"
        >
          <p className="text-sm text-gray-400 mb-3">
            Questions? We&apos;re here to help:
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <a
              href="mailto:support@brandingpioneers.in"
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
        </motion.div>
      </div>
    </div>
  )
}
