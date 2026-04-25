/**
 * HR module configuration constants.
 * Centralizes magic numbers that were previously scattered across HR business logic.
 */

// Appraisal settings
export const APPRAISAL_LEARNING_HOURS_REQUIRED = 72 // 6 hours/month * 12 months
export const APPRAISAL_LEARNING_HOURS_MONTHLY = 6
export const APPRAISAL_POSTPONE_DAYS = 30
export const APPRAISAL_COMPLETION_DAYS = 7

// Termination / notice period
export const DEFAULT_NOTICE_PERIOD_DAYS = 30
export const DEFAULT_PROBATION_MONTHS = 3
export const MAX_PROBATION_MONTHS = 24
export const MAX_NOTICE_PERIOD_DAYS = 180

// Attendance
export const LATE_THRESHOLD_TIME = '11:05'

// FnF / Financial
export const TDS_PERCENTAGE = 10
export const DEFAULT_MONTHLY_SALARY = 30000

// SLA
export const GST_PERCENTAGE = 18
export const LATE_PAYMENT_INTEREST_MONTHLY = 1.5
export const ANNUAL_RETAINER_INCREASE_PERCENTAGE = 10
export const DEFAULT_CONTRACT_DURATION_MONTHS = 12

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 50
export const MAX_PAGE_SIZE = 200
export const DASHBOARD_ITEM_LIMIT = 5
