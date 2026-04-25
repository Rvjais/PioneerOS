/**
 * MyZen Biometric Integration
 *
 * Handles syncing attendance data from MyZen biometric system
 * and Razorpay payroll integration
 */

import { prisma } from '@/server/db/prisma'

/**
 * Sync attendance data from MyZen for a specific date range
 */
export async function syncMyZenAttendance(startDate: Date, endDate: Date): Promise<{
  synced: number
  errors: string[]
}> {
  const errors: string[] = []
  let synced = 0

  try {
    // In production, this would call the actual MyZen API
    // For now, we'll check existing biometric records

    // Get all users with biometric enabled
    const biometricUsers = await prisma.user.findMany({
      where: {
        profile: {
          biometricPunch: true,
        },
      },
      select: {
        id: true,
      },
      take: 200, // Limit for performance
    })

    // For each day in the range
    const current = new Date(startDate)
    while (current <= endDate) {
      const dayStart = new Date(current)
      dayStart.setHours(0, 0, 0, 0)

      for (const user of biometricUsers) {
        // Check if attendance record exists
        const existing = await prisma.attendance.findFirst({
          where: {
            userId: user.id,
            date: {
              gte: dayStart,
              lt: new Date(dayStart.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        })

        if (!existing) {
          // Check if it's a weekend
          const dayOfWeek = current.getDay()
          if (dayOfWeek !== 0 && dayOfWeek !== 6 && current < new Date()) {
            // Create absent record for past working days without attendance
            await prisma.attendance.create({
              data: {
                userId: user.id,
                date: new Date(dayStart),
                status: 'ABSENT',
                biometricPunch: false,
              },
            })
            synced++
          }
        }
      }

      current.setDate(current.getDate() + 1)
    }

    return { synced, errors }
  } catch (error) {
    errors.push(`Sync error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return { synced, errors }
  }
}

/**
 * Check and update Razorpay linked status for users
 */
export async function syncRazorpayStatus(): Promise<{
  updated: number
  errors: string[]
}> {
  const errors: string[] = []
  let updated = 0

  try {
    // In production, this would call Razorpay API to check linked status
    // For now, we just return current status
    return { updated, errors }
  } catch (error) {
    errors.push(`Razorpay sync error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return { updated, errors }
  }
}
