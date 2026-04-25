/**
 * Admin data masking utilities
 * Centralized masking functions for sensitive entity data
 */

import { maskSensitive, maskBankAccount } from '@/server/security/encryption'

// Type definitions for company entity data
export interface BankAccountData {
  id: string
  accountNumber: string
  ifscCode?: string | null
  swiftCode?: string | null
  routingNumber?: string | null
  [key: string]: unknown
}

export interface PaymentGatewayData {
  id: string
  apiKeyId?: string | null
  apiKeySecret?: string | null
  webhookSecret?: string | null
  merchantId?: string | null
  [key: string]: unknown
}

export interface CompanyEntityData {
  id: string
  gstNumber?: string | null
  panNumber?: string | null
  cinNumber?: string | null
  tanNumber?: string | null
  einNumber?: string | null
  bankAccounts?: BankAccountData[]
  paymentGateways?: PaymentGatewayData[]
  [key: string]: unknown
}

/**
 * Mask sensitive entity data for display
 * @param entity - The company entity data to mask
 * @param showFull - Whether to show full unmasked data (super admin only)
 */
export function maskEntityData<T extends CompanyEntityData>(
  entity: T,
  showFull = false
): T {
  if (showFull) return entity

  return {
    ...entity,
    gstNumber: entity.gstNumber ? maskSensitive(entity.gstNumber, 4) : null,
    panNumber: entity.panNumber ? maskSensitive(entity.panNumber, 4) : null,
    cinNumber: entity.cinNumber ? maskSensitive(entity.cinNumber, 4) : null,
    tanNumber: entity.tanNumber ? maskSensitive(entity.tanNumber, 4) : null,
    einNumber: entity.einNumber ? maskSensitive(entity.einNumber, 4) : null,
    bankAccounts: entity.bankAccounts?.map((account) => ({
      ...account,
      accountNumber: maskBankAccount(account.accountNumber),
      ifscCode: account.ifscCode ? maskSensitive(account.ifscCode, 4) : null,
      swiftCode: account.swiftCode ? maskSensitive(account.swiftCode, 4) : null,
      routingNumber: account.routingNumber ? maskSensitive(account.routingNumber, 4) : null,
    })),
    paymentGateways: entity.paymentGateways?.map((gateway) => ({
      ...gateway,
      apiKeyId: gateway.apiKeyId ? maskSensitive(gateway.apiKeyId, 4) : null,
      apiKeySecret: gateway.apiKeySecret ? '********' : null,
      webhookSecret: gateway.webhookSecret ? '********' : null,
      merchantId: gateway.merchantId ? maskSensitive(gateway.merchantId, 4) : null,
    })),
  }
}

/**
 * Mask an array of entities
 */
export function maskEntities<T extends CompanyEntityData>(
  entities: T[],
  showFull = false
): T[] {
  return entities.map(entity => maskEntityData(entity, showFull))
}
