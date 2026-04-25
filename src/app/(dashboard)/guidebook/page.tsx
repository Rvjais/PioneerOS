import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const GUIDEBOOK_SECTIONS = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: '🚀',
    description: 'Welcome to Branding Pioneers - everything you need to know',
    items: [
      { name: 'Company Overview', href: '/knowledge', description: 'Learn about our mission and values' },
      { name: 'Your First Week', href: '/hr/onboarding-checklist', description: 'Complete your onboarding tasks' },
      { name: 'Team Directory', href: '/directory', description: 'Meet your colleagues' },
    ],
  },
  {
    id: 'policies',
    title: 'Company Policies',
    icon: '📋',
    description: 'Important policies and guidelines',
    items: [
      { name: 'Leave Policy', href: '/hr/leave', description: 'Understand leave types and balances' },
      { name: 'Attendance Policy', href: '/hr/attendance', description: 'Check-in/out requirements' },
      { name: 'Code of Conduct', href: '/knowledge', description: 'Professional behavior guidelines' },
    ],
  },
  {
    id: 'client-work',
    title: 'Client Work',
    icon: '💼',
    description: 'How we work with clients',
    items: [
      { name: 'Client Guidelines', href: '/clients/guidelines', description: 'Communication standards' },
      { name: 'Communication Charter', href: '/clients/communication', description: 'Response time SLAs' },
      { name: 'Client Lifecycle', href: '/clients/lifecycle', description: 'From onboarding to success' },
    ],
  },
  {
    id: 'tools',
    title: 'Tools & Resources',
    icon: '🛠️',
    description: 'Software and resources you need',
    items: [
      { name: 'Daily Planner', href: '/tasks/daily', description: 'Plan and track your tasks' },
      { name: 'MASH Chat', href: '/mash', description: 'Team communication hub' },
      { name: 'WhatsApp Hub', href: '/whatsapp', description: 'Client communication' },
    ],
  },
  {
    id: 'growth',
    title: 'Career Growth',
    icon: '📈',
    description: 'Your path to success',
    items: [
      { name: 'Performance Goals', href: '/performance/goals', description: 'Set and track goals' },
      { name: 'Training Resources', href: '/training', description: 'Learning and development' },
      { name: 'Appraisals', href: '/hr/appraisals/self', description: 'Self-assessment' },
    ],
  },
  {
    id: 'support',
    title: 'Getting Help',
    icon: '🆘',
    description: 'When you need assistance',
    items: [
      { name: 'Report an Issue', href: '/issues', description: 'Technical or operational issues' },
      { name: 'HR Support', href: '/hr', description: 'HR-related queries' },
      { name: 'Knowledge Base', href: '/knowledge', description: 'FAQs and documentation' },
    ],
  },
]

export default async function GuidebookPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white">Pioneer Guidebook</h1>
        <p className="text-purple-100 mt-1">
          Your comprehensive guide to working at Pioneer Digitech
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-4">
        <Link
          href="/hr/onboarding-checklist"
          className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-purple-500 transition-colors"
        >
          <span className="text-2xl">✅</span>
          <h3 className="font-medium text-white mt-2">Onboarding Checklist</h3>
          <p className="text-xs text-slate-400">Complete your setup</p>
        </Link>
        <Link
          href="/knowledge"
          className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-purple-500 transition-colors"
        >
          <span className="text-2xl">📚</span>
          <h3 className="font-medium text-white mt-2">Knowledge Base</h3>
          <p className="text-xs text-slate-400">FAQs and policies</p>
        </Link>
        <Link
          href="/training"
          className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-purple-500 transition-colors"
        >
          <span className="text-2xl">🎓</span>
          <h3 className="font-medium text-white mt-2">Training</h3>
          <p className="text-xs text-slate-400">Learn and grow</p>
        </Link>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GUIDEBOOK_SECTIONS.map(section => (
          <div
            key={section.id}
            className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-700 flex items-center gap-3">
              <span className="text-2xl">{section.icon}</span>
              <div>
                <h2 className="font-semibold text-white">{section.title}</h2>
                <p className="text-xs text-slate-400">{section.description}</p>
              </div>
            </div>
            <div className="divide-y divide-slate-700/50">
              {section.items.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-5 py-3 hover:bg-slate-700/30 transition-colors"
                >
                  <p className="text-white font-medium">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Help Section */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Need More Help?</h3>
        <p className="text-slate-400 mb-4">
          Can&apos;t find what you&apos;re looking for? Reach out to your manager or HR.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/mash"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Ask on MASH
          </Link>
          <Link
            href="/hr"
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            Contact HR
          </Link>
        </div>
      </div>
    </div>
  )
}
