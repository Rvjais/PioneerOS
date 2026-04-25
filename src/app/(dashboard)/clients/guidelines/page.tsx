import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { GuidelinesClient } from './GuidelinesClient'

// Department to tips mapping
const DEPARTMENT_TIPS_MAPPING: Record<string, string[]> = {
  WEB: ['Web Development'],
  SEO: ['SEO'],
  SOCIAL: ['Social Media & Design'],
  ADS: ['Performance Marketing (Ads)'],
  ACCOUNTS: ['Accounts & Billing'],
  OPERATIONS: ['Web Development', 'Social Media & Design', 'Performance Marketing (Ads)', 'SEO', 'Accounts & Billing'],
}

export default async function GuidelinesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userRole = session.user.role as string
  const userDept = session.user.department as string

  // HR shouldn't access client guidelines
  if (userDept === 'HR' && !['SUPER_ADMIN', 'MANAGER'].includes(userRole)) {
    redirect('/hr')
  }

  // SALES shouldn't access client guidelines (they have CRM)
  if (userDept === 'SALES' && !['SUPER_ADMIN', 'MANAGER'].includes(userRole)) {
    redirect('/sales')
  }

  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(userRole)

  // Get which department tips to show
  const allowedTipsDepartments = isManager
    ? ['Web Development', 'Social Media & Design', 'Performance Marketing (Ads)', 'SEO', 'Accounts & Billing']
    : DEPARTMENT_TIPS_MAPPING[userDept] || []

  return <GuidelinesClient allowedTipsDepartments={allowedTipsDepartments} />
}
