/**
 * SERVER-SIDE CelebrationsCard (async Server Component)
 * Fetches data directly via Prisma. Use this in Server Components for better performance.
 *
 * NOTE: There's also a CLIENT-SIDE version at components/dashboard/CelebrationsCard.tsx
 * for use in Client Components that cannot import async server components.
 */

import { prisma } from '@/server/db/prisma'

export async function CelebrationsCard() {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfWeek = new Date(startOfToday)
    endOfWeek.setDate(endOfWeek.getDate() + 7)

    // Get all active users with DOB and joining date
    const users = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            dateOfBirth: true,
            joiningDate: true,
        },
    })

    const todayMonth = now.getMonth()
    const todayDate = now.getDate()

    // Find upcoming birthdays (next 7 days)
    const birthdays = users
        .filter(u => u.dateOfBirth)
        .map(u => {
            const dob = new Date(u.dateOfBirth!)
            const thisYearBday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate())
            if (thisYearBday < startOfToday) thisYearBday.setFullYear(now.getFullYear() + 1)
            const isToday = dob.getMonth() === todayMonth && dob.getDate() === todayDate
            return {
                id: u.id,
                name: `${u.firstName} ${u.lastName || ''}`.trim(),
                department: u.department,
                date: thisYearBday,
                isToday,
                type: 'birthday' as const,
            }
        })
        .filter(b => b.date >= startOfToday && b.date < endOfWeek)
        .sort((a, b) => a.date.getTime() - b.date.getTime())

    // Find upcoming work anniversaries (next 7 days)
    const anniversaries = users
        .map(u => {
            const joined = new Date(u.joiningDate)
            const years = now.getFullYear() - joined.getFullYear()
            if (years < 1) return null
            const thisYearAnniv = new Date(now.getFullYear(), joined.getMonth(), joined.getDate())
            if (thisYearAnniv < startOfToday) thisYearAnniv.setFullYear(now.getFullYear() + 1)
            const isToday = joined.getMonth() === todayMonth && joined.getDate() === todayDate
            return {
                id: u.id,
                name: `${u.firstName} ${u.lastName || ''}`.trim(),
                department: u.department,
                date: thisYearAnniv,
                years,
                isToday,
                type: 'anniversary' as const,
            }
        })
        .filter((a): a is NonNullable<typeof a> => a !== null && a.date >= startOfToday && a.date < endOfWeek)
        .sort((a, b) => a.date.getTime() - b.date.getTime())

    if (birthdays.length === 0 && anniversaries.length === 0) return null

    return (
        <div className="glass-card rounded-xl border border-white/10 p-6">
            <h2 className="font-semibold text-white mb-4">Celebrations This Week</h2>
            <div className="space-y-3">
                {birthdays.map(b => (
                    <div key={`bday-${b.id}`} className={`flex items-center gap-3 p-3 rounded-lg border ${b.isToday ? 'bg-pink-500/10 border-pink-500/20' : 'bg-white/5 border-white/5'}`}>
                        <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A1.75 1.75 0 003 15.546V12a9 9 0 0118 0v3.546zM12 3v2m-6.364.636L7.05 7.05M21 12h-2M5 12H3m3.343-5.657L4.93 4.93" /></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{b.name}</p>
                            <p className="text-xs text-slate-400">{b.department}</p>
                        </div>
                        <div className="text-right">
                            {b.isToday ? (
                                <span className="text-xs font-bold text-pink-600 bg-pink-100 px-2 py-1 rounded">Today!</span>
                            ) : (
                                <span className="text-xs text-slate-400">
                                    {b.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                            )}
                        </div>
                    </div>
                ))}

                {anniversaries.map(a => (
                    <div key={`anniv-${a.id}`} className={`flex items-center gap-3 p-3 rounded-lg border ${a.isToday ? 'bg-blue-500/10 border-blue-500/20' : 'bg-white/5 border-white/5'}`}>
                        <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{a.name}</p>
                            <p className="text-xs text-slate-400">{a.years} year{a.years > 1 ? 's' : ''} - {a.department}</p>
                        </div>
                        <div className="text-right">
                            {a.isToday ? (
                                <span className="text-xs font-bold text-blue-400 bg-blue-500/20 px-2 py-1 rounded">Today!</span>
                            ) : (
                                <span className="text-xs text-slate-400">
                                    {a.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
