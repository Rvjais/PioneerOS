/**
 * Money Calculation Utilities
 * Uses Decimal.js to avoid floating-point precision errors
 *
 * IMPORTANT: All money values should be calculated using these utilities
 * to prevent precision loss (e.g., 0.1 + 0.2 = 0.30000000000000004)
 */

import Decimal from 'decimal.js'

// Configure Decimal.js for financial calculations
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
})

/**
 * Create a Decimal from a number or string
 */
export function toDecimal(value: number | string | null | undefined): Decimal {
  if (value === null || value === undefined) {
    return new Decimal(0)
  }
  return new Decimal(value)
}

/**
 * Add two money values safely
 */
export function addMoney(a: number | string, b: number | string): number {
  return toDecimal(a).plus(toDecimal(b)).toNumber()
}

/**
 * Subtract money values safely (a - b)
 */
export function subtractMoney(a: number | string, b: number | string): number {
  return toDecimal(a).minus(toDecimal(b)).toNumber()
}

/**
 * Multiply money by a factor safely
 */
export function multiplyMoney(amount: number | string, factor: number | string): number {
  return toDecimal(amount).times(toDecimal(factor)).toNumber()
}

/**
 * Divide money safely (amount / divisor)
 */
export function divideMoney(amount: number | string, divisor: number | string): number {
  const divisorDecimal = toDecimal(divisor)
  if (divisorDecimal.isZero()) {
    return 0
  }
  return toDecimal(amount).dividedBy(divisorDecimal).toNumber()
}

/**
 * Calculate percentage of an amount
 * e.g., calculatePercentage(1000, 18) = 180 (18% of 1000)
 */
export function calculatePercentage(amount: number | string, percentage: number | string): number {
  return toDecimal(amount).times(toDecimal(percentage)).dividedBy(100).toNumber()
}

/**
 * Round money to 2 decimal places
 */
export function roundMoney(amount: number | string): number {
  return toDecimal(amount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()
}

/**
 * Compare two money values
 * Returns: -1 if a < b, 0 if a == b, 1 if a > b
 */
export function compareMoney(a: number | string, b: number | string): number {
  return toDecimal(a).comparedTo(toDecimal(b))
}

/**
 * Check if two money values are equal (within floating point tolerance)
 */
export function isMoneyEqual(a: number | string, b: number | string): boolean {
  return toDecimal(a).equals(toDecimal(b))
}

/**
 * Calculate TDS (Tax Deducted at Source)
 */
export function calculateTDS(grossAmount: number | string, tdsPercentage: number | string): number {
  return roundMoney(calculatePercentage(grossAmount, tdsPercentage))
}

/**
 * Calculate net amount after TDS
 */
export function calculateNetAmount(grossAmount: number | string, tdsAmount: number | string): number {
  return roundMoney(subtractMoney(grossAmount, tdsAmount))
}

/**
 * Calculate GST amount
 */
export function calculateGST(amount: number | string, gstPercentage: number | string = 18): number {
  return roundMoney(calculatePercentage(amount, gstPercentage))
}

/**
 * Calculate total with GST
 */
export function calculateTotalWithGST(amount: number | string, gstPercentage: number | string = 18): number {
  const gst = calculateGST(amount, gstPercentage)
  return roundMoney(addMoney(amount, gst))
}

/**
 * Parse money from user input (handles comma-separated strings)
 */
export function parseMoney(input: string | number | null | undefined): number {
  if (input === null || input === undefined || input === '') {
    return 0
  }
  if (typeof input === 'number') {
    return roundMoney(input)
  }
  // Remove commas and parse
  const cleaned = input.replace(/,/g, '').trim()
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : roundMoney(parsed)
}

/**
 * Format money for display (Indian Rupee format)
 */
export function formatMoney(amount: number | string, includeSymbol: boolean = true): string {
  const num = roundMoney(toDecimal(amount).toNumber())
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
  return includeSymbol ? `₹${formatted}` : formatted
}
