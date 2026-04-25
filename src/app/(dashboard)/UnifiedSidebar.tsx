/**
 * UnifiedSidebar — picks the right navigation based on user's role.
 * Each department user ALWAYS sees their own sidebar, regardless of which route they're on.
 * Users without a department-specific nav see DashboardNav.
 *
 * When viewAs param is provided, renders the sidebar for that user's role/department
 * instead of the current admin's sidebar (allows admin to preview any user's view).
 */
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { DashboardNav } from '@/client/components/layout/DashboardNav'
import { HRNav } from '@/client/components/layout/HRNav'
import { AccountsNav } from '@/client/components/layout/AccountsNav'
import { SalesNav } from '@/client/components/layout/SalesNav'
import { SeoNav } from '@/client/components/layout/SeoNav'
import { WebNav } from '@/client/components/layout/WebNav'
import { AdsNav } from '@/client/components/layout/AdsNav'
import { SocialNav } from '@/client/components/layout/SocialNav'
import { DesignNav } from '@/client/components/layout/DesignNav'
import { ManagerNav } from '@/client/components/layout/ManagerNav'
import { BlendedNav } from '@/client/components/layout/BlendedNav'
import { prisma } from '@/server/db/prisma'

// Roles that get department-specific sidebars
const HR_ROLES = ['HR']
const ACCOUNTS_ROLES = ['ACCOUNTS']
const SALES_ROLES = ['SALES']
const SEO_ROLES = ['SEO']
const WEB_ROLES = ['WEB_MANAGER']
const ADS_ROLES = ['ADS']
const SOCIAL_ROLES = ['SOCIAL']
const DESIGN_ROLES = ['DESIGNER', 'DESIGN_LEAD']
const MANAGER_ROLES = ['MANAGER', 'OPERATIONS_HEAD']

// Fetch user data by ID (used when viewAs param is present)
async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { customRoles: { include: { customRole: true } } },
  })
}

export async function UnifiedSidebar({ viewAsUserId }: { viewAsUserId?: string }) {
  const session = await getServerSession(authOptions)
  if (!session) return null

  // Determine which user's role/department to use
  let role: string
  let department: string

  if (viewAsUserId) {
    // Admin is viewing as another user - fetch that user's data
    const viewedUser = await getUserById(viewAsUserId)
    if (viewedUser) {
      role = viewedUser.role
      department = viewedUser.department || ''
    } else {
      role = session.user.role as string
      department = session.user.department as string
    }
  } else {
    role = session.user.role as string
    department = session.user.department as string
  }

  // HR
  if (HR_ROLES.includes(role) || department === 'HR') {
    return <HRNav />
  }

  // Accounts
  if (ACCOUNTS_ROLES.includes(role) || department === 'ACCOUNTS') {
    return <AccountsNav />
  }

  // Sales
  if (SALES_ROLES.includes(role) || department === 'SALES') {
    return <SalesNav />
  }

  // SEO
  if (SEO_ROLES.includes(role) || department === 'SEO') {
    return <SeoNav />
  }

  // Web
  if (WEB_ROLES.includes(role) || department === 'WEB') {
    return <WebNav userRole={role} />
  }

  // Ads
  if (ADS_ROLES.includes(role) || department === 'ADS') {
    return <AdsNav />
  }

  // Social
  if (SOCIAL_ROLES.includes(role) || department === 'SOCIAL') {
    return <SocialNav />
  }

  // Design
  if (DESIGN_ROLES.includes(role) || department === 'DESIGN') {
    return <DesignNav />
  }

  // Manager / Operations Head
  if (MANAGER_ROLES.includes(role)) {
    return <ManagerNav />
  }

  // Blended users (multiple departments) — get their departments
  if (role === 'OM' || role === 'BLENDED_USER') {
    const user = await prisma.user.findUnique({
      where: { id: viewAsUserId || session.user.id },
      include: { customRoles: { include: { customRole: true } } },
    })
    if (user) {
      const departments: string[] = []
      if (user.department) departments.push(user.department)
      for (const ucr of user.customRoles) {
        try {
          const depts = JSON.parse(ucr.customRole.departments || '[]')
          depts.forEach((d: string) => {
            if (!departments.includes(d)) departments.push(d)
          })
        } catch {}
      }
      if (departments.length > 1) {
        return <BlendedNav departments={departments} />
      }
    }
  }

  // Default: DashboardNav for EMPLOYEE, FREELANCER, INTERN, SUPER_ADMIN, etc.
  return <DashboardNav />
}
