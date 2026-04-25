import { prisma } from '@/server/db/prisma'
import { requirePageAuth, HR_ACCESS } from '@/server/auth/pageAuth'
import { FnFClient } from './FnFClient'

async function getFnFData() {
  const settlements = await prisma.fnFSettlement.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          empId: true,
          department: true,
          email: true,
          joiningDate: true,
        },
      },
      exitProcess: {
        select: {
          id: true,
          type: true,
          noticeDate: true,
          lastWorkingDate: true,
          status: true,
        },
      },
      lineItems: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return settlements
}

async function getExitProcessesWithoutSettlement() {
  const exits = await prisma.exitProcess.findMany({
    where: {
      settlement: null,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          empId: true,
          department: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return exits
}

export default async function FnFPage() {
  const session = await requirePageAuth(HR_ACCESS)

  const [settlements, exitProcesses] = await Promise.all([
    getFnFData(),
    getExitProcessesWithoutSettlement(),
  ])

  return (
    <FnFClient
      initialSettlements={JSON.parse(JSON.stringify(settlements))}
      exitProcesses={JSON.parse(JSON.stringify(exitProcesses))}
      currentUserRole={session.user?.role || ''}
      currentUserName={session.user?.name || session.user?.email || ''}
    />
  )
}
