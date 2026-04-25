/**
 * Prisma Encryption Middleware & Helpers
 *
 * Provides automatic encryption/decryption for sensitive fields
 */

import { encrypt, decrypt, isEncrypted, SENSITIVE_FIELDS, SALARY_FIELDS, canViewSalaryData } from '@/server/security/encryption'

// Define which models have which sensitive fields
const MODEL_SENSITIVE_FIELDS: Record<string, readonly string[]> = {
  Profile: SENSITIVE_FIELDS.profile,
  Client: SENSITIVE_FIELDS.client,
  FreelancerProfile: SENSITIVE_FIELDS.freelancerProfile,
  VendorOnboarding: SENSITIVE_FIELDS.vendorOnboarding,
  EntityBankAccount: SENSITIVE_FIELDS.entityBankAccount,
  EntityPaymentGateway: SENSITIVE_FIELDS.entityPaymentGateway,
  CompanyEntity: SENSITIVE_FIELDS.companyEntity,
}

/**
 * Encrypt sensitive fields in data before saving
 */
export function encryptModelData<T extends Record<string, unknown>>(
  modelName: string,
  data: T
): T {
  const fields = MODEL_SENSITIVE_FIELDS[modelName]
  if (!fields || !data) return data

  const result = { ...data }

  for (const field of fields) {
    const value = result[field as keyof T]
    if (typeof value === 'string' && value && !isEncrypted(value)) {
      ;(result as Record<string, unknown>)[field] = encrypt(value)
    }
  }

  return result as T
}

/**
 * Decrypt sensitive fields in data after reading
 */
export function decryptModelData<T extends Record<string, unknown>>(
  modelName: string,
  data: T
): T {
  const fields = MODEL_SENSITIVE_FIELDS[modelName]
  if (!fields || !data) return data

  const result = { ...data }

  for (const field of fields) {
    const value = result[field as keyof T]
    if (typeof value === 'string' && value && isEncrypted(value)) {
      ;(result as Record<string, unknown>)[field] = decrypt(value)
    }
  }

  return result
}

/**
 * Decrypt an array of records
 */
export function decryptModelArray<T extends Record<string, unknown>>(
  modelName: string,
  data: T[]
): T[] {
  if (!data || !Array.isArray(data)) return data
  return data.map(item => decryptModelData(modelName, item))
}

/**
 * Safe encryption wrapper - won't throw errors
 */
export function safeEncrypt(value: string | null | undefined): string | null | undefined {
  if (!value) return value
  try {
    if (isEncrypted(value)) return value
    return encrypt(value)
  } catch {
    return value
  }
}

/**
 * Safe decryption wrapper - won't throw errors
 */
export function safeDecrypt(value: string | null | undefined): string | null | undefined {
  if (!value) return value
  try {
    return decrypt(value)
  } catch {
    return null
  }
}

/**
 * Helper to encrypt profile data before save
 */
export function encryptProfileData(data: Record<string, unknown>): Record<string, unknown> {
  return encryptModelData('Profile', data)
}

/**
 * Helper to decrypt profile data after read
 */
export function decryptProfileData<T extends Record<string, unknown>>(data: T): T {
  return decryptModelData('Profile', data)
}

/**
 * Helper to encrypt client data before save
 */
export function encryptClientData(data: Record<string, unknown>): Record<string, unknown> {
  return encryptModelData('Client', data)
}

/**
 * Helper to decrypt client data after read
 */
export function decryptClientData<T extends Record<string, unknown>>(data: T): T {
  return decryptModelData('Client', data)
}

/**
 * Helper to encrypt freelancer profile data
 */
export function encryptFreelancerData(data: Record<string, unknown>): Record<string, unknown> {
  return encryptModelData('FreelancerProfile', data)
}

/**
 * Helper to decrypt freelancer profile data
 */
export function decryptFreelancerData<T extends Record<string, unknown>>(data: T): T {
  return decryptModelData('FreelancerProfile', data)
}

/**
 * Helper to encrypt vendor data
 */
export function encryptVendorData(data: Record<string, unknown>): Record<string, unknown> {
  return encryptModelData('VendorOnboarding', data)
}

/**
 * Helper to decrypt vendor data
 */
export function decryptVendorData<T extends Record<string, unknown>>(data: T): T {
  return decryptModelData('VendorOnboarding', data)
}

/**
 * Helper to encrypt bank account data
 */
export function encryptBankAccountData(data: Record<string, unknown>): Record<string, unknown> {
  return encryptModelData('EntityBankAccount', data)
}

/**
 * Helper to decrypt bank account data
 */
export function decryptBankAccountData<T extends Record<string, unknown>>(data: T): T {
  return decryptModelData('EntityBankAccount', data)
}

/**
 * Helper to encrypt payment gateway credentials
 */
export function encryptPaymentGatewayData(data: Record<string, unknown>): Record<string, unknown> {
  return encryptModelData('EntityPaymentGateway', data)
}

/**
 * Helper to decrypt payment gateway credentials
 */
export function decryptPaymentGatewayData<T extends Record<string, unknown>>(data: T): T {
  return decryptModelData('EntityPaymentGateway', data)
}

/**
 * Helper to encrypt company entity data
 */
export function encryptCompanyEntityData(data: Record<string, unknown>): Record<string, unknown> {
  return encryptModelData('CompanyEntity', data)
}

/**
 * Helper to decrypt company entity data
 */
export function decryptCompanyEntityData<T extends Record<string, unknown>>(data: T): T {
  return decryptModelData('CompanyEntity', data)
}

/**
 * Check if a specific field should be encrypted for a model
 */
export function shouldEncryptField(modelName: string, fieldName: string): boolean {
  const fields = MODEL_SENSITIVE_FIELDS[modelName]
  return fields?.includes(fieldName) ?? false
}

/**
 * Get all sensitive fields for a model
 */
export function getSensitiveFields(modelName: string): readonly string[] {
  return MODEL_SENSITIVE_FIELDS[modelName] || []
}

/**
 * Encrypt/decrypt nested relations
 */
export function processNestedData<T extends Record<string, unknown>>(
  data: T,
  operation: 'encrypt' | 'decrypt'
): T {
  if (!data || typeof data !== 'object') return data

  const result = { ...data } as Record<string, unknown>
  const processor = operation === 'encrypt' ? encryptModelData : decryptModelData

  // Process known relation patterns
  const relationMappings: Record<string, string> = {
    profile: 'Profile',
    client: 'Client',
    freelancerProfile: 'FreelancerProfile',
    vendorOnboarding: 'VendorOnboarding',
    bankAccounts: 'EntityBankAccount',
    paymentGateways: 'EntityPaymentGateway',
    entity: 'CompanyEntity',
  }

  for (const [key, modelName] of Object.entries(relationMappings)) {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        result[key] = (result[key] as Record<string, unknown>[]).map((item) => processor(modelName, item))
      } else if (typeof result[key] === 'object') {
        result[key] = processor(modelName, result[key] as Record<string, unknown>)
      }
    }
  }

  return result as T
}

// ============================================
// SALARY DATA PROTECTION
// ============================================

// Model to salary field mapping
const MODEL_SALARY_FIELDS: Record<string, readonly string[]> = {
  Candidate: SALARY_FIELDS.candidate,
  InternProfile: SALARY_FIELDS.internProfile,
  FreelancerProfile: SALARY_FIELDS.freelancerProfile,
  FreelancerWorkReport: SALARY_FIELDS.freelancerWorkReport,
  FreelancerPayment: SALARY_FIELDS.freelancerPayment,
  DepartmentBaseline: SALARY_FIELDS.departmentBaseline,
  FnFSettlement: SALARY_FIELDS.fnfSettlement,
  FnFLineItem: SALARY_FIELDS.fnfLineItem,
  IncentivePayout: SALARY_FIELDS.incentivePayout,
  RBCAccrual: SALARY_FIELDS.rbcAccrual,
  RBCPayout: SALARY_FIELDS.rbcPayout,
}

/**
 * Filter salary fields from data based on user authorization
 */
export function filterSalaryDataFromModel<T extends Record<string, unknown>>(
  modelName: string,
  data: T,
  authorized: boolean
): T {
  if (authorized) return data

  const fields = MODEL_SALARY_FIELDS[modelName]
  if (!fields || !data) return data

  const result = { ...data } as Record<string, unknown>
  for (const field of fields) {
    if (result[field] !== undefined) {
      result[field] = null
    }
  }
  return result as T
}

/**
 * Filter salary fields from an array of records
 */
export function filterSalaryDataFromArray<T extends Record<string, unknown>>(
  modelName: string,
  data: T[],
  authorized: boolean
): T[] {
  if (authorized || !data || !Array.isArray(data)) return data
  return data.map(item => filterSalaryDataFromModel(modelName, item, authorized))
}

/**
 * Check if user can view salary data based on role/department
 */
export { canViewSalaryData }

/**
 * Hide appraisal sensitive fields from employee (manager rating, increment, etc.)
 */
export function filterAppraisalForEmployee<T extends Record<string, unknown>>(
  appraisal: T,
  isOwner: boolean,
  isHR: boolean
): T {
  // HR can see everything
  if (isHR) return appraisal

  // If viewing own appraisal, hide manager-provided sensitive data
  if (isOwner && appraisal.status !== 'COMPLETED') {
    // Hide manager-only fields until appraisal is completed
    return {
      ...appraisal,
      managerRating: null,
      finalRating: null,
      incrementRecommendation: null,
      promotionRecommendation: null,
    }
  }

  return appraisal
}

/**
 * Check if user can view another user's salary/financial data
 */
export function canViewUserSalary(
  viewerRole: string,
  viewerDepartment: string | undefined,
  viewerId: string,
  targetUserId: string
): boolean {
  // User can always view their own data
  if (viewerId === targetUserId) return true

  // Check if viewer has HR/Finance access
  return canViewSalaryData(viewerRole, viewerDepartment)
}
