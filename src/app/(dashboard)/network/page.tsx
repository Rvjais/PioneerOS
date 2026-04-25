import prisma from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { NetworkFeed } from '@/client/components/network/NetworkFeed'
import { CreatePostForm } from '@/client/components/network/CreatePostForm'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'

async function getPosts() {
  return prisma.post.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          department: true,
          role: true,
          email: true,
          profile: { select: { profilePicture: true } }
        }
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profile: { select: { profilePicture: true } }
            }
          }
        }
      },
      likes: true,
      _count: { select: { comments: true, likes: true } }
    },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    take: 20
  })
}

const getTeamGroups = unstable_cache(async () => {
  // Get department-based groups with member counts
  const departments = await prisma.user.groupBy({
    by: ['department'],
    _count: { _all: true },
    where: {
      status: 'ACTIVE',
      department: { notIn: ['', 'null'] }
    }
  })

  const departmentColors: Record<string, string> = {
    SEO: 'from-teal-500 to-cyan-600',
    ADS: 'from-orange-500 to-red-600',
    SOCIAL: 'from-pink-500 to-rose-600',
    WEB: 'from-blue-500 to-indigo-600',
    HR: 'from-purple-500 to-violet-600',
    ACCOUNTS: 'from-green-500 to-emerald-600',
    SALES: 'from-amber-500 to-orange-600',
    OPERATIONS: 'from-slate-500 to-slate-700',
  }

  const departmentLabels: Record<string, string> = {
    SEO: 'SEO Team',
    ADS: 'Ads Team',
    SOCIAL: 'Social Media',
    WEB: 'Web Dev',
    HR: 'HR Team',
    ACCOUNTS: 'Accounts',
    SALES: 'Sales Team',
    OPERATIONS: 'Operations',
  }

  const departmentSlugs: Record<string, string> = {
    SEO: 'team-seo',
    ADS: 'team-ads',
    SOCIAL: 'team-social',
    WEB: 'team-web',
    HR: 'team-hr',
    ACCOUNTS: 'team-accounts',
    SALES: 'team-sales',
    OPERATIONS: 'team-operations',
  }

  return departments
    .filter(d => d.department && d._count && d._count._all > 0)
    .map(d => ({
      id: d.department!,
      name: departmentLabels[d.department!] || d.department!,
      color: departmentColors[d.department!] || 'from-slate-500 to-slate-600',
      memberCount: d._count?._all || 0,
      slug: departmentSlugs[d.department!] || `team-${d.department!.toLowerCase()}`,
    }))
    .sort((a, b) => b.memberCount - a.memberCount)
}, ['network-team-groups'], { revalidate: 3600 })

const getTrendingTags = unstable_cache(async () => {
  // Get posts from last 7 days and extract hashtags
  const recentPosts = await prisma.post.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    },
    select: { content: true }
  })

  // Extract and count hashtags
  const tagCounts: Record<string, number> = {}
  recentPosts.forEach(post => {
    const hashtags = post.content.match(/#\w+/g) || []
    hashtags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  // Sort by count and take top 5
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }))
}, ['network-trending-tags'], { revalidate: 3600 })

export default async function NetworkPage() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const [posts, teamGroups, trendingTags] = await Promise.all([
      getPosts(),
      getTeamGroups(),
      getTrendingTags(),
    ])

    return (
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Agency Network</h1>
          <p className="text-slate-400 mt-1">Connect with your team, share wins, and stay updated</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <NetworkFeed posts={posts} currentUserId={session.user.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Post */}
            <CreatePostForm />

            {/* Team Groups */}
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-semibold text-white">Team Groups</h3>
                <Link href="/mash" className="text-xs text-blue-400 hover:underline">
                  View All
                </Link>
              </div>
              <div className="divide-y divide-white/10">
                {teamGroups.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-sm">
                    No team groups available
                  </div>
                ) : (
                  teamGroups.slice(0, 5).map((group) => (
                    <Link
                      key={group.id}
                      href={`/mash?channel=${group.slug}`}
                      className="w-full flex items-center gap-3 p-4 hover:bg-slate-900/40 transition-colors text-left"
                    >
                      <div className={`w-10 h-10 bg-gradient-to-br ${group.color} rounded-lg flex items-center justify-center text-white font-medium`}>
                        {group.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-white">{group.name}</p>
                        <p className="text-xs text-slate-400">{group.memberCount} members</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Trending */}
            <div className="glass-card rounded-2xl border border-white/10 p-5">
              <h3 className="font-semibold text-white mb-4">Trending</h3>
              <div className="space-y-3">
                {trendingTags.length === 0 ? (
                  <p className="text-sm text-slate-400">No trending topics yet</p>
                ) : (
                  trendingTags.map(({ tag, count }) => (
                    <div key={tag} className="flex items-center justify-between">
                      <span className="text-blue-400 text-sm font-medium">{tag}</span>
                      <span className="text-xs text-slate-400">{count} posts</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error: any) {
    return (
      <div className="p-8 mt-10 mx-auto max-w-4xl bg-red-900/50 border border-red-500 rounded-2xl text-white whitespace-pre-wrap font-mono text-sm overflow-x-auto shadow-[0_0_40px_rgba(239,68,68,0.2)]">
        <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          SSR Rendering Crash Detected
        </h2>
        <p className="mb-2 font-semibold">Error Message:</p>
        <p className="text-red-200 bg-red-950/50 p-4 rounded-lg mb-4">{error.message}</p>

        {error.stack && (
          <>
            <p className="font-semibold mb-2">Stack Trace:</p>
            <p className="text-slate-300 bg-slate-900/80 p-4 rounded-lg text-xs leading-relaxed">{error.stack}</p>
          </>
        )}
      </div>
    )
  }
}
