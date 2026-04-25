/**
 * Client Status & Lifecycle Utilities
 *
 * The Client model has a lifecycle-based status system:
 * - lifecycleStage: The primary field (LEAD -> WON -> ONBOARDING -> ACTIVE -> RETENTION -> AT_RISK -> CHURNED)
 * - status: Derived from lifecycleStage for backward compatibility
 * - isLost: Derived flag (true when lifecycleStage is CHURNED)
 *
 * Always use these utilities when updating client status to maintain consistency.
 */

export type LifecycleStage =
  | 'LEAD'
  | 'WON'
  | 'ONBOARDING'
  | 'ACTIVE'
  | 'RETENTION'
  | 'AT_RISK'
  | 'CHURNED'

export type ClientStatus = 'ACTIVE' | 'LOST' | 'ON_HOLD' | 'ONBOARDING'

export const LIFECYCLE_STAGES: LifecycleStage[] = [
  'LEAD',
  'WON',
  'ONBOARDING',
  'ACTIVE',
  'RETENTION',
  'AT_RISK',
  'CHURNED',
]

export const ACTIVE_LIFECYCLE_STAGES: LifecycleStage[] = [
  'WON',
  'ONBOARDING',
  'ACTIVE',
  'RETENTION',
]

export const AT_RISK_LIFECYCLE_STAGES: LifecycleStage[] = ['AT_RISK']

export const CHURNED_LIFECYCLE_STAGES: LifecycleStage[] = ['CHURNED']

/**
 * Derive client status from lifecycle stage
 * This ensures status and lifecycleStage are always in sync
 */
export function statusFromLifecycle(lifecycleStage: string): ClientStatus {
  switch (lifecycleStage) {
    case 'ACTIVE':
    case 'RETENTION':
      return 'ACTIVE'
    case 'AT_RISK':
      return 'ON_HOLD'
    case 'CHURNED':
      return 'LOST'
    case 'LEAD':
    case 'WON':
    case 'ONBOARDING':
    default:
      return 'ONBOARDING'
  }
}

/**
 * Check if client is considered "lost" based on lifecycle stage
 */
export function isClientLost(lifecycleStage: string): boolean {
  return lifecycleStage === 'CHURNED'
}

/**
 * Check if client is at risk
 */
export function isClientAtRisk(lifecycleStage: string): boolean {
  return lifecycleStage === 'AT_RISK'
}

/**
 * Check if client is actively being serviced
 */
export function isClientActive(lifecycleStage: string): boolean {
  return ['ACTIVE', 'RETENTION'].includes(lifecycleStage)
}

/**
 * Get update data for client lifecycle change
 * Use this when updating a client's lifecycle stage to ensure all related fields are updated
 */
export function getLifecycleUpdateData(newStage: LifecycleStage) {
  return {
    lifecycleStage: newStage,
    status: statusFromLifecycle(newStage),
    isLost: isClientLost(newStage),
  }
}

/**
 * Lifecycle stage colors for UI
 */
export const LIFECYCLE_STAGE_COLORS: Record<LifecycleStage, { bg: string; text: string }> = {
  LEAD: { bg: 'bg-slate-100', text: 'text-slate-700' },
  WON: { bg: 'bg-green-100', text: 'text-green-700' },
  ONBOARDING: { bg: 'bg-blue-100', text: 'text-blue-700' },
  ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  RETENTION: { bg: 'bg-purple-100', text: 'text-purple-700' },
  AT_RISK: { bg: 'bg-amber-100', text: 'text-amber-700' },
  CHURNED: { bg: 'bg-red-100', text: 'text-red-700' },
}

/**
 * Lifecycle stage labels for display
 */
export const LIFECYCLE_STAGE_LABELS: Record<LifecycleStage, string> = {
  LEAD: 'Lead',
  WON: 'Won',
  ONBOARDING: 'Onboarding',
  ACTIVE: 'Active',
  RETENTION: 'Retention',
  AT_RISK: 'At Risk',
  CHURNED: 'Churned',
}
