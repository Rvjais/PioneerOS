import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/server/db/prisma'
import { Breadcrumb } from '@/client/components/ui/Breadcrumb'
import { WebProjectForm } from './WebProjectForm'

async function getClients() {
  return prisma.client.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
    take: 100,
  })
}

async function getEmployees() {
  return prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { role: { in: ['WEB_DEVELOPER', 'WEB_DESIGNER', 'QA_TESTER', 'CONTENT_WRITER'] } },
        { department: 'WEB' },
      ],
    },
    select: { id: true, firstName: true, lastName: true, role: true },
    orderBy: { firstName: 'asc' },
    take: 50,
  })
}

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const [clients, employees] = await Promise.all([getClients(), getEmployees()])

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Web Team', href: '/web' },
          { label: 'Projects', href: '/web/projects' },
          { label: 'New Project', href: '/web/projects/new' },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Web Project</h1>
        <p className="text-slate-500 mt-1">Create a new web development project</p>
      </div>

      <WebProjectForm clients={clients} employees={employees} userId={session.user.id} />
    </div>
  )
}
