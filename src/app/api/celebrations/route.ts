import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET: Fetch upcoming birthdays and work anniversaries for dashboard celebrations
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all active employees with DOB and joining date
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
        dateOfBirth: true,
        profile: {
          select: { profilePicture: true }
        },
      }
    })

    const celebrations: Array<{
      userId: string
      name: string
      department: string
      type: 'birthday' | 'anniversary'
      date: Date
      displayDate: string
      daysUntil: number
      isToday: boolean
      details?: string
      profilePhoto?: string | null
    }> = []

    for (const emp of employees) {
      const name = `${emp.firstName} ${emp.lastName || ''}`.trim()

      // Check for birthdays
      if (emp.dateOfBirth) {
        const dob = new Date(emp.dateOfBirth)
        const birthdayThisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate())

        let birthdayDate = birthdayThisYear
        if (birthdayThisYear < today) {
          birthdayDate = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate())
        }

        const daysUntilBirthday = Math.ceil((birthdayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntilBirthday <= days && daysUntilBirthday >= 0) {
          celebrations.push({
            userId: emp.id,
            name,
            department: emp.department,
            type: 'birthday',
            date: birthdayDate,
            displayDate: birthdayDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            daysUntil: daysUntilBirthday,
            isToday: daysUntilBirthday === 0,
            profilePhoto: emp.profile?.profilePicture,
          })
        }
      }

      // Check for work anniversaries
      if (emp.joiningDate) {
        const joiningDate = new Date(emp.joiningDate)
        const yearsCompleted = today.getFullYear() - joiningDate.getFullYear()
        const anniversaryThisYear = new Date(today.getFullYear(), joiningDate.getMonth(), joiningDate.getDate())

        let anniversaryDate = anniversaryThisYear
        let yearsCompleting = yearsCompleted

        if (anniversaryThisYear < today) {
          anniversaryDate = new Date(today.getFullYear() + 1, joiningDate.getMonth(), joiningDate.getDate())
          yearsCompleting = yearsCompleted + 1
        }

        // Only show anniversaries for 1+ years
        if (yearsCompleting >= 1) {
          const daysUntilAnniversary = Math.ceil((anniversaryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          if (daysUntilAnniversary <= days && daysUntilAnniversary >= 0) {
            celebrations.push({
              userId: emp.id,
              name,
              department: emp.department,
              type: 'anniversary',
              date: anniversaryDate,
              displayDate: anniversaryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
              daysUntil: daysUntilAnniversary,
              isToday: daysUntilAnniversary === 0,
              details: `${yearsCompleting} year${yearsCompleting > 1 ? 's' : ''}`,
              profilePhoto: emp.profile?.profilePicture,
            })
          }
        }
      }
    }

    // Sort by days until celebration, then by type (birthdays first)
    celebrations.sort((a, b) => {
      if (a.daysUntil !== b.daysUntil) return a.daysUntil - b.daysUntil
      return a.type === 'birthday' ? -1 : 1
    })

    // Get stats
    const stats = {
      total: celebrations.length,
      today: celebrations.filter(c => c.isToday).length,
      thisWeek: celebrations.filter(c => c.daysUntil <= 7).length,
      birthdays: celebrations.filter(c => c.type === 'birthday').length,
      anniversaries: celebrations.filter(c => c.type === 'anniversary').length,
    }

    // Separate today's celebrations
    const todayCelebrations = celebrations.filter(c => c.isToday)
    const upcomingCelebrations = celebrations.filter(c => !c.isToday)

    return NextResponse.json({
      today: todayCelebrations,
      upcoming: upcomingCelebrations,
      stats,
    })
  } catch (error) {
    console.error('Error fetching celebrations:', error)
    return NextResponse.json({ error: 'Failed to fetch celebrations' }, { status: 500 })
  }
})
