import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/server/db/prisma'

export default async function BlendedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  // Blended users must have multiple departments
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      customRoles: {
        include: { customRole: true },
      },
    },
  })

  if (!user) redirect('/login')

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

  // If user doesn't have multiple departments, redirect
  if (departments.length <= 1) {
    const primaryDept = user.department?.toLowerCase() || '/'
    redirect(`/${primaryDept}`)
  }

  // Sidebar is handled by UnifiedSidebar in root DashboardLayout
  return <>{children}</>
}
