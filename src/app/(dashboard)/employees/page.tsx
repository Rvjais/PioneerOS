import { unstable_noStore as noStore } from 'next/cache'
import prisma from '@/server/db/prisma'
import { Card } from '@/client/components/ui'
import { ExportEmployeesButton, EmployeesListClient } from './EmployeesClient'
import PageGuide from '@/client/components/ui/PageGuide'
import { requirePageAuth, MANAGEMENT_ACCESS } from '@/server/auth/pageAuth'

async function getEmployees() {
  return prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      empId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      department: true,
      status: true,
      employeeType: true,
      joiningDate: true,
      profile: {
        select: { ndaSigned: true, profilePicture: true }
      },
      rbcPot: {
        select: { totalAccrued: true }
      },
    },
    orderBy: { joiningDate: 'desc' }
  })
}


export default async function EmployeesPage() {
  await requirePageAuth(MANAGEMENT_ACCESS)
  noStore()
  const employees = await getEmployees()

  const stats = {
    total: employees.length,
    permanent: employees.filter(e => e.status === 'PERMANENT').length,
    probation: employees.filter(e => e.status === 'PROBATION').length,
    ndaPending: employees.filter(e => !e.profile?.ndaSigned).length,
  }

  return (
    <div className="space-y-6">
      <PageGuide
        pageKey="employees"
        title="Employees"
        description="View employee directory with department details and status."
        steps={[
          { label: 'Browse team members', description: 'Filter by department or search by ID' },
          { label: 'Check verification status', description: 'Monitor NDA signing and onboarding completion' },
          { label: 'Export data', description: 'Download employee list as CSV' },
        ]}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="text-slate-400 mt-1">Manage team members and verification status</p>
        </div>
        <ExportEmployeesButton
          employees={JSON.parse(JSON.stringify(employees.map(e => ({
            empId: e.empId,
            department: e.department,
            status: e.status,
            role: e.role,
            joiningDate: e.joiningDate,
          }))))}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-400">Total Employees</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-400">Permanent</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{stats.permanent}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-400">Probation</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.probation}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-400">NDA Pending</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{stats.ndaPending}</p>
        </Card>
      </div>

      {/* Employee List */}
      <Card>
        <EmployeesListClient
          employees={JSON.parse(JSON.stringify(employees.map(e => ({
            id: e.id,
            empId: e.empId,
            department: e.department,
            status: e.status,
            role: e.role,
            joiningDate: e.joiningDate,
            profile: e.profile ? { ndaSigned: e.profile.ndaSigned } : null,
            rbcPot: e.rbcPot ? { totalAccrued: e.rbcPot.totalAccrued } : null,
          }))))}
        />
      </Card>
    </div>
  )
}
