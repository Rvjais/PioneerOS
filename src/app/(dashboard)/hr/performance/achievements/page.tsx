'use client'

import { useState, useEffect } from 'react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'RECRUITMENT' | 'ONBOARDING' | 'ENGAGEMENT' | 'COMPLIANCE' | 'SPECIAL'
  earnedAt: string | null
  progress?: number
  target?: number
}

const ACHIEVEMENTS: Achievement[] = [
  // Recruitment Achievements
  { id: '1', title: 'First Hire', description: 'Successfully hire your first candidate', icon: '🎯', category: 'RECRUITMENT', earnedAt: '2024-01-15', progress: 1, target: 1 },
  { id: '2', title: 'Talent Scout', description: 'Hire 10 candidates', icon: '🔍', category: 'RECRUITMENT', earnedAt: '2024-02-20', progress: 10, target: 10 },
  { id: '3', title: 'Hiring Machine', description: 'Hire 25 candidates', icon: '🚀', category: 'RECRUITMENT', earnedAt: null, progress: 18, target: 25 },
  { id: '4', title: 'Speed Recruiter', description: 'Close a position in under 15 days', icon: '⚡', category: 'RECRUITMENT', earnedAt: '2024-03-01', progress: 1, target: 1 },

  // Onboarding Achievements
  { id: '5', title: 'Warm Welcome', description: 'Complete 5 onboardings with 100% satisfaction', icon: '👋', category: 'ONBOARDING', earnedAt: '2024-02-10', progress: 5, target: 5 },
  { id: '6', title: 'Onboarding Pro', description: 'Complete 20 onboardings', icon: '🏆', category: 'ONBOARDING', earnedAt: null, progress: 12, target: 20 },
  { id: '7', title: 'Zero Day Gap', description: 'Complete onboarding before employee&apos;s first day', icon: '⭐', category: 'ONBOARDING', earnedAt: null, progress: 3, target: 5 },

  // Engagement Achievements
  { id: '8', title: 'Party Planner', description: 'Organize 10 team activities', icon: '🎉', category: 'ENGAGEMENT', earnedAt: '2024-02-28', progress: 10, target: 10 },
  { id: '9', title: 'Culture Champion', description: 'Achieve 90% employee satisfaction', icon: '💪', category: 'ENGAGEMENT', earnedAt: null, progress: 78, target: 90 },
  { id: '10', title: 'Feedback Master', description: 'Conduct 50 employee check-ins', icon: '💬', category: 'ENGAGEMENT', earnedAt: null, progress: 32, target: 50 },

  // Compliance Achievements
  { id: '11', title: 'Compliance Hero', description: '100% policy compliance for 6 months', icon: '🛡️', category: 'COMPLIANCE', earnedAt: '2024-03-01', progress: 6, target: 6 },
  { id: '12', title: 'Document Master', description: 'Verify 100 employee documents', icon: '📋', category: 'COMPLIANCE', earnedAt: null, progress: 75, target: 100 },

  // Special Achievements
  { id: '13', title: 'Perfect Week', description: 'Close all tasks for 5 consecutive days', icon: '🌟', category: 'SPECIAL', earnedAt: null, progress: 3, target: 5 },
  { id: '14', title: 'HR Superstar', description: 'Earn all recruitment badges', icon: '👑', category: 'SPECIAL', earnedAt: null, progress: 3, target: 4 },
  { id: '15', title: 'Team Player', description: 'Help 10 colleagues with their tasks', icon: '🤝', category: 'SPECIAL', earnedAt: '2024-02-15', progress: 10, target: 10 },
]

export default function HRAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')

  useEffect(() => {
    setAchievements(ACHIEVEMENTS)
  }, [])

  const earnedCount = achievements.filter(a => a.earnedAt).length
  const totalCount = achievements.length

  const filteredAchievements = activeCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === activeCategory)

  const earnedAchievements = filteredAchievements.filter(a => a.earnedAt)
  const unearnedAchievements = filteredAchievements.filter(a => !a.earnedAt)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="text-purple-100">Your HR accomplishments and badges</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-3xl font-bold">{earnedCount}</p>
            <p className="text-xs text-purple-100">Earned</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-3xl font-bold">{totalCount - earnedCount}</p>
            <p className="text-xs text-purple-100">Remaining</p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'RECRUITMENT', label: 'Recruitment' },
          { id: 'ONBOARDING', label: 'Onboarding' },
          { id: 'ENGAGEMENT', label: 'Engagement' },
          { id: 'COMPLIANCE', label: 'Compliance' },
          { id: 'SPECIAL', label: 'Special' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'bg-purple-500 text-white'
                : 'glass-card text-slate-300 border border-white/10 hover:bg-slate-900/40'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <div>
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <span className="text-xl">🏅</span> Earned Achievements
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {earnedAchievements.map(achievement => (
              <div
                key={achievement.id}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl">
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{achievement.title}</p>
                    <p className="text-sm text-slate-400">{achievement.description}</p>
                    <p className="text-xs text-purple-400 mt-1">
                      Earned {new Date(achievement.earnedAt!).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unearned Achievements */}
      {unearnedAchievements.length > 0 && (
        <div>
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <span className="text-xl">🎯</span> In Progress
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {unearnedAchievements.map(achievement => {
              const progress = achievement.progress && achievement.target
                ? (achievement.progress / achievement.target) * 100
                : 0
              return (
                <div
                  key={achievement.id}
                  className="glass-card rounded-xl border border-white/10 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center text-2xl grayscale opacity-50">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{achievement.title}</p>
                      <p className="text-sm text-slate-400">{achievement.description}</p>
                      {achievement.progress !== undefined && achievement.target !== undefined && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress} / {achievement.target}</span>
                          </div>
                          <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-400 rounded-full"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Motivation */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="text-5xl">🚀</div>
          <div>
            <h3 className="font-bold text-lg">Keep Going!</h3>
            <p className="text-indigo-100">
              You&apos;re {totalCount - earnedCount} achievements away from unlocking them all.
              Focus on your daily activities and the achievements will follow!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
