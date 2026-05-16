import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async () => {
  const achievements = [
    {
      id: '1',
      title: 'First Client',
      description: 'Add your first client to the system',
      icon: 'user-plus',
      category: 'milestone' as const,
      earnedAt: '2024-01-15T10:30:00Z',
      progress: null,
      target: null,
      rarity: 'common' as const
    },
    {
      id: '2',
      title: 'Invoice Master',
      description: 'Create 100 invoices',
      icon: 'file-text',
      category: 'collections' as const,
      earnedAt: '2024-03-20T14:00:00Z',
      progress: null,
      target: null,
      rarity: 'rare' as const
    },
    {
      id: '3',
      title: 'Speed Demon',
      description: 'Complete 10 tasks in under an hour',
      icon: 'zap',
      category: 'efficiency' as const,
      earnedAt: null,
      progress: 7,
      target: 10,
      rarity: 'epic' as const
    },
    {
      id: '4',
      title: 'Early Bird',
      description: 'Log in before 7am for 7 consecutive days',
      icon: 'sunrise',
      category: 'special' as const,
      earnedAt: null,
      progress: 5,
      target: 7,
      rarity: 'rare' as const
    },
    {
      id: '5',
      title: 'Team Player',
      description: 'Add 5 team members to your workspace',
      icon: 'users',
      category: 'milestone' as const,
      earnedAt: '2024-02-10T09:15:00Z',
      progress: null,
      target: null,
      rarity: 'common' as const
    },
    {
      id: '6',
      title: 'Legendary Dedication',
      description: 'Maintain a 90% task completion rate for 30 days',
      icon: 'trophy',
      category: 'special' as const,
      earnedAt: null,
      progress: 18,
      target: 30,
      rarity: 'legendary' as const
    }
  ]

  return Response.json({ achievements })
})