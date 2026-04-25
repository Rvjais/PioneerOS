'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'collections' | 'efficiency' | 'milestone' | 'special'
  earnedAt?: string
  progress?: number
  target?: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const rarityColors = {
  common: 'from-slate-500 to-slate-400 border-slate-500/30',
  rare: 'from-blue-500 to-blue-400 border-blue-500/30',
  epic: 'from-purple-500 to-purple-400 border-purple-500/30',
  legendary: 'from-amber-500 to-yellow-400 border-amber-500/30'
}

const categoryIcons = {
  collections: '💰',
  efficiency: '⚡',
  milestone: '🎯',
  special: '✨'
}

export default function AccountsAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all')

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const res = await fetch('/api/accounts/achievements')
      if (res.ok) {
        const data = await res.json()
        setAchievements(data.achievements || [])
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const earnedAchievements = achievements.filter(a => a.earnedAt)
  const lockedAchievements = achievements.filter(a => !a.earnedAt)

  const filteredAchievements = filter === 'all'
    ? achievements
    : filter === 'earned'
      ? earnedAchievements
      : lockedAchievements

  const stats = {
    total: achievements.length,
    earned: earnedAchievements.length,
    common: earnedAchievements.filter(a => a.rarity === 'common').length,
    rare: earnedAchievements.filter(a => a.rarity === 'rare').length,
    epic: earnedAchievements.filter(a => a.rarity === 'epic').length,
    legendary: earnedAchievements.filter(a => a.rarity === 'legendary').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Achievements</h1>
            <InfoTooltip
              title="Accounts Achievements"
              steps={[
                'Earn achievements for excellent performance',
                'Track progress on locked achievements',
                'Collect rare and legendary badges',
                'Show off your accomplishments'
              ]}
              tips={[
                'Focus on daily tasks to unlock achievements',
                'Legendary achievements require consistent excellence'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Recognition for outstanding collections work</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-emerald-400 text-sm">Earned</p>
          <p className="text-3xl font-bold text-white">{stats.earned}/{stats.total}</p>
        </div>
        <div className="bg-slate-900/10 border border-slate-500/30 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Common</p>
          <p className="text-2xl font-bold text-slate-300">{stats.common}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-400 text-sm">Rare</p>
          <p className="text-2xl font-bold text-blue-300">{stats.rare}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <p className="text-purple-400 text-sm">Epic</p>
          <p className="text-2xl font-bold text-purple-300">{stats.epic}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 md:col-span-2">
          <p className="text-amber-400 text-sm">Legendary</p>
          <p className="text-2xl font-bold text-amber-300">{stats.legendary}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'earned', 'locked'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-emerald-600 text-white'
                : 'bg-white/5 backdrop-blur-sm text-slate-400 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'earned' && ` (${stats.earned})`}
            {f === 'locked' && ` (${stats.total - stats.earned})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* Achievements Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map(achievement => {
              const isEarned = !!achievement.earnedAt
              const progress = achievement.progress && achievement.target
                ? Math.round((achievement.progress / achievement.target) * 100)
                : 0

              return (
                <div
                  key={achievement.id}
                  className={`relative border rounded-xl p-4 transition-all ${
                    isEarned
                      ? `bg-gradient-to-br ${rarityColors[achievement.rarity]} bg-opacity-20`
                      : 'bg-white/5 backdrop-blur-sm border-white/10 opacity-60'
                  }`}
                >
                  {/* Rarity Badge */}
                  <span className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                    achievement.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-400' :
                    achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                    achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-900/20 text-slate-400'
                  }`}>
                    {achievement.rarity}
                  </span>

                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                      isEarned ? 'bg-white/20 backdrop-blur-sm' : 'bg-white/5 backdrop-blur-sm grayscale'
                    }`}>
                      {achievement.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{categoryIcons[achievement.category]}</span>
                        <h3 className={`font-medium ${isEarned ? 'text-white' : 'text-slate-400'}`}>
                          {achievement.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{achievement.description}</p>

                      {isEarned ? (
                        <p className="text-xs text-emerald-400 mt-2">
                          Earned {formatDateDDMMYYYY(achievement.earnedAt!)}
                        </p>
                      ) : achievement.progress !== undefined && achievement.target ? (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.target}</span>
                          </div>
                          <div className="h-1.5 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 mt-2">Locked</p>
                      )}
                    </div>
                  </div>

                  {isEarned && (
                    <div className="absolute -top-1 -right-1">
                      <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              No achievements found in this category
            </div>
          )}

          {/* Achievement Categories */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Achievement Categories</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <span className="text-2xl">{categoryIcons.collections}</span>
                <p className="font-medium text-white mt-2">Collections</p>
                <p className="text-sm text-slate-400">Achievements for collecting payments</p>
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <span className="text-2xl">{categoryIcons.efficiency}</span>
                <p className="font-medium text-white mt-2">Efficiency</p>
                <p className="text-sm text-slate-400">Speed and accuracy achievements</p>
              </div>
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <span className="text-2xl">{categoryIcons.milestone}</span>
                <p className="font-medium text-white mt-2">Milestones</p>
                <p className="text-sm text-slate-400">Career milestone achievements</p>
              </div>
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <span className="text-2xl">{categoryIcons.special}</span>
                <p className="font-medium text-white mt-2">Special</p>
                <p className="text-sm text-slate-400">Limited-time and special events</p>
              </div>
            </div>
          </div>

          {/* Recent Achievements Section */}
          {earnedAchievements.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">Recently Earned</h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {earnedAchievements
                  .sort((a, b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime())
                  .slice(0, 5)
                  .map(achievement => (
                    <div
                      key={achievement.id}
                      className="flex-shrink-0 w-48 p-3 bg-white/5 backdrop-blur-sm rounded-xl"
                    >
                      <div className="text-2xl mb-2">{achievement.icon}</div>
                      <p className="font-medium text-white text-sm">{achievement.title}</p>
                      <p className="text-xs text-emerald-400">
                        {formatDateDDMMYYYY(achievement.earnedAt!)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
