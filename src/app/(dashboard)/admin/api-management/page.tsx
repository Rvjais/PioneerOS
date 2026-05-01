import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { ApiManagementDashboard } from './ApiManagementDashboard'

export default async function ApiManagementPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  if (session.user.role !== 'SUPER_ADMIN') {
    redirect('/')
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">API Management</h1>
        <p className="text-slate-400 mt-1">
          Manage API credentials, OAuth connections, and service accounts
        </p>
      </div>

      <ApiManagementDashboard />
    </div>
  )
}
