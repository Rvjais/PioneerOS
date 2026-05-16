import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'

export default async function WebStyleGuidesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Style Guides</h1>
          <p className="text-slate-500 mt-1">Brand guidelines and design systems</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          + New Guide
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['Apollo Hospitals Brand Kit', 'MedPlus Digital System', 'WellnessHub Typography'].map(guide => (
          <div key={guide} className="glass-card p-6 rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors cursor-pointer bg-white dark:bg-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{guide}</h3>
              <span className="px-2 py-1 text-xs font-medium rounded bg-green-500/20 text-green-400">Active</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Complete brand guidelines including typography, color palette, logo usage, and UI components.</p>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500" />
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700" />
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200" />
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ml-auto border border-white/10">Aa</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
