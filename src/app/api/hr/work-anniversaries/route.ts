import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET: Fetch upcoming work anniversaries
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30')

    const today = new Date()
    const todayMonth = today.getMonth() + 1
    const todayDay = today.getDate()

    // Get all active employees
    const employees = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        department: true,
        joiningDate: true,
        workAnniversaries: {
          orderBy: { yearsCompleted: 'desc' },
          take: 1
        }
      }
    })

    // Calculate upcoming anniversaries
    const upcoming: Array<{
      userId: string;
      name: string;
      department: string;
      joiningDate: Date;
      anniversaryDate: Date;
      yearsCompleting: number;
      daysUntil: number;
      celebrated: boolean;
    }> = []

    for (const emp of employees) {
      if (!emp.joiningDate) continue

      const joiningDate = new Date(emp.joiningDate)
      const joiningMonth = joiningDate.getMonth() + 1
      const joiningDay = joiningDate.getDate()

      // Calculate years since joining
      const yearsCompleted = today.getFullYear() - joiningDate.getFullYear()

      // Calculate this year's anniversary date
      const anniversaryThisYear = new Date(today.getFullYear(), joiningMonth - 1, joiningDay)

      // If anniversary has passed this year, calculate next year's
      let anniversaryDate = anniversaryThisYear
      let yearsCompleting = yearsCompleted

      if (anniversaryThisYear < today) {
        anniversaryDate = new Date(today.getFullYear() + 1, joiningMonth - 1, joiningDay)
        yearsCompleting = yearsCompleted + 1
      }

      // Calculate days until anniversary
      const daysUntil = Math.ceil((anniversaryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // Only include if within the requested days range
      if (daysUntil <= days && daysUntil >= 0) {
        // Check if already celebrated
        const lastCelebration = emp.workAnniversaries[0]
        const celebrated = lastCelebration?.yearsCompleted === yearsCompleting && lastCelebration?.celebrated

        upcoming.push({
          userId: emp.id,
          name: `${emp.firstName} ${emp.lastName || ''}`.trim(),
          department: emp.department,
          joiningDate: emp.joiningDate,
          anniversaryDate,
          yearsCompleting,
          daysUntil,
          celebrated: celebrated || false
        })
      }
    }

    // Sort by days until anniversary
    upcoming.sort((a, b) => a.daysUntil - b.daysUntil)

    // Get milestone stats
    const stats = {
      total: upcoming.length,
      today: upcoming.filter(u => u.daysUntil === 0).length,
      thisWeek: upcoming.filter(u => u.daysUntil <= 7).length,
      milestones: {
        oneYear: upcoming.filter(u => u.yearsCompleting === 1).length,
        twoYears: upcoming.filter(u => u.yearsCompleting === 2).length,
        threeYears: upcoming.filter(u => u.yearsCompleting === 3).length,
        fiveYearsPlus: upcoming.filter(u => u.yearsCompleting >= 5).length,
      }
    }

    return NextResponse.json({ upcoming, stats })
  } catch (error) {
    console.error('Error fetching work anniversaries:', error)
    return NextResponse.json({ error: 'Failed to fetch work anniversaries' }, { status: 500 })
  }
})

// POST: Mark anniversary as celebrated
export const POST = withAuth(async (req, { user }) => {
  try {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      userId,
      yearsCompleted,
      celebrationNotes,
      giftGiven
    } = body

    if (!userId || !yearsCompleted) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the employee's joining date
    const employee = await prisma.user.findUnique({
      where: { id: userId },
      select: { joiningDate: true, firstName: true }
    })

    if (!employee?.joiningDate) {
      return NextResponse.json({ error: 'Employee joining date not found' }, { status: 400 })
    }

    // Calculate anniversary date
    const joiningDate = new Date(employee.joiningDate)
    const anniversaryDate = new Date(
      joiningDate.getFullYear() + yearsCompleted,
      joiningDate.getMonth(),
      joiningDate.getDate()
    )

    // Create or update the reminder
    const reminder = await prisma.workAnniversaryReminder.upsert({
      where: {
        userId_yearsCompleted: {
          userId,
          yearsCompleted
        }
      },
      update: {
        celebrated: true,
        celebrationNotes,
        giftGiven
      },
      create: {
        userId,
        anniversaryDate,
        yearsCompleted,
        reminderSent: true,
        reminderSentAt: new Date(),
        celebrated: true,
        celebrationNotes,
        giftGiven
      }
    })

    // Notify the employee
    await prisma.notification.create({
      data: {
        userId,
        type: 'WORK_ANNIVERSARY',
        title: `Happy ${yearsCompleted} Year Anniversary!`,
        message: `Congratulations on completing ${yearsCompleted} year${yearsCompleted > 1 ? 's' : ''} with us!`,
        link: '/profile'
      }
    })

    return NextResponse.json({ reminder })
  } catch (error) {
    console.error('Error marking anniversary:', error)
    return NextResponse.json({ error: 'Failed to mark anniversary' }, { status: 500 })
  }
})
