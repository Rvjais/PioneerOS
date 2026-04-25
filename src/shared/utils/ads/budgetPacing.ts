/**
 * Budget pacing calculations for ad spend monitoring.
 * Compares actual spend against allocated budget to determine pacing status.
 */

export type PacingStatus = 'ON_TRACK' | 'UNDERSPEND' | 'OVERSPEND'

export interface PacingResult {
  status: PacingStatus
  expectedSpend: number
  actualSpend: number
  variance: number
  dailyTarget: number
  projectedMonthEnd: number
}

export interface SpendAlert {
  level: 'INFO' | 'WARNING' | 'CRITICAL'
  message: string
}

/**
 * Calculate budget pacing status based on current spend vs expected spend.
 *
 * @param allocated - Total monthly budget allocated
 * @param spent - Amount spent so far this month
 * @param dayOfMonth - Current day of the month (1-based)
 * @param daysInMonth - Total days in the current month
 */
export function calculatePacingStatus(
  allocated: number,
  spent: number,
  dayOfMonth: number,
  daysInMonth: number
): PacingResult {
  const dailyTarget = allocated / daysInMonth
  const expectedSpend = dailyTarget * dayOfMonth
  const variance = expectedSpend > 0 ? ((spent - expectedSpend) / expectedSpend) * 100 : 0
  const projectedMonthEnd = dayOfMonth > 0 ? (spent / dayOfMonth) * daysInMonth : 0

  let status: PacingStatus = 'ON_TRACK'
  if (variance > 10) status = 'OVERSPEND'
  else if (variance < -15) status = 'UNDERSPEND'

  return {
    status,
    expectedSpend,
    actualSpend: spent,
    variance,
    dailyTarget,
    projectedMonthEnd,
  }
}

/**
 * Get a spend alert based on how much of the budget has been utilized.
 * Returns null if spend is below 75% (no alert needed).
 *
 * @param allocated - Total monthly budget allocated
 * @param spent - Amount spent so far
 */
export function getSpendAlert(allocated: number, spent: number): SpendAlert | null {
  if (allocated <= 0) return null

  const percentage = (spent / allocated) * 100

  if (percentage >= 110) {
    return {
      level: 'CRITICAL',
      message: `Budget exceeded by ${(percentage - 100).toFixed(1)}%`,
    }
  }

  if (percentage >= 90) {
    return {
      level: 'WARNING',
      message: `Budget ${percentage.toFixed(1)}% utilized`,
    }
  }

  if (percentage >= 75) {
    return {
      level: 'INFO',
      message: `Budget ${percentage.toFixed(1)}% utilized`,
    }
  }

  return null
}
