import { prisma } from '@/server/db/prisma'
import { VerificationsList } from './VerificationsList'

async function getPendingVerifications() {
  return prisma.user.findMany({
    where: { profileCompletionStatus: 'PENDING_HR' },
    include: { profile: true },
    orderBy: { updatedAt: 'desc' },
  })
}

async function getVerifiedToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return prisma.user.count({
    where: {
      profileCompletionStatus: 'VERIFIED',
      hrVerifiedAt: { gte: today },
    },
  })
}

export default async function HRVerificationsPage() {
  const [pendingUsers, verifiedTodayCount] = await Promise.all([
    getPendingVerifications(),
    getVerifiedToday(),
  ])

  const pendingCount = pendingUsers.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Employee Verifications</h1>
        <p className="text-slate-300 mt-1">Review and verify employee profile submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pendingCount}</p>
              <p className="text-sm text-slate-300">Pending Verifications</p>
            </div>
          </div>
        </div>

        <div className="glass-card border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{verifiedTodayCount}</p>
              <p className="text-sm text-slate-300">Verified Today</p>
            </div>
          </div>
        </div>

        <div className="glass-card border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">~1 day</p>
              <p className="text-sm text-slate-300">Avg. Processing Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Verifications List */}
      <div className="glass-card border border-white/10 rounded-xl">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Pending Verifications</h2>
        </div>

        {pendingCount === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-medium text-white">All caught up!</h3>
            <p className="text-slate-300 mt-1">No pending verifications at the moment.</p>
          </div>
        ) : (
          <VerificationsList users={pendingUsers.map(user => ({
            id: user.id,
            empId: user.empId,
            firstName: user.firstName,
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone,
            department: user.department,
            joiningDate: user.joiningDate.toISOString(),
            dateOfBirth: user.dateOfBirth?.toISOString() || '',
            bloodGroup: user.bloodGroup || '',
            address: user.address || '',
            profile: user.profile ? {
              emergencyContactName: user.profile.emergencyContactName || '',
              emergencyContactPhone: user.profile.emergencyContactPhone || '',
              panCard: user.profile.panCard || '',
              aadhaar: user.profile.aadhaar || '',
              panCardUrl: user.profile.panCardUrl || '',
              aadhaarUrl: user.profile.aadhaarUrl || '',
              bankDetailsUrl: user.profile.bankDetailsUrl || '',
              educationCertUrl: user.profile.educationCertUrl || '',
              linkedIn: user.profile.linkedIn || '',
              skills: user.profile.skills || '',
              bio: user.profile.bio || '',
              completionPercentage: user.profile.completionPercentage,
            } : null,
            updatedAt: user.updatedAt.toISOString(),
          }))} />
        )}
      </div>
    </div>
  )
}
