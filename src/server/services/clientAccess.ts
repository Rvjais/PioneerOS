/**
 * Client Access Control Utilities
 * Centralized authorization checks for client data access
 */

import { prisma } from '@/server/db/prisma'
import { AuthenticatedUser } from '@/server/auth/withAuth'

// Roles that can access all clients
const ADMIN_ROLES = ['SUPER_ADMIN', 'MANAGER']

// Roles that can see financial data
export const FINANCIAL_ROLES = ['SUPER_ADMIN', 'ACCOUNTS', 'MANAGER']

// Roles that can modify client data
export const CLIENT_MODIFY_ROLES = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS']

// Roles that can delete clients
export const CLIENT_DELETE_ROLES = ['SUPER_ADMIN']

// Fields that only admins can update
export const ADMIN_ONLY_FIELDS = [
  'tier',
  'monthlyFee',
  'pendingAmount',
  'healthScore',
  'healthStatus',
]

// Allowlist of fields that can be updated (deny-by-default)
const BASE_UPDATE_FIELDS = new Set([
  'name',
  'brandName',
  'contactName',
  'contactEmail',
  'contactPhone',
  'whatsapp',
  'address',
  'city',
  'state',
  'pincode',
  'gstNumber',
  'panNumber',
  'notes',
  'websiteUrl',
  'industry',
  'businessType',
  'logoUrl',
  'facebookUrl',
  'instagramUrl',
  'linkedinUrl',
  'twitterUrl',
  'youtubeUrl',
  'competitor1',
  'competitor2',
  'competitor3',
  'targetAudience',
  'brandAssets',
  'selectedServices',
  'contentTypes',
  'credentials',
  'primaryGoal',
  'contractLength',
  'referralSource',
  'concernedPerson',
  'concernedPersonPhone',
])

// Additional fields editable by roles with modify access
const MODIFY_ROLE_FIELDS = new Set([
  'status',
  'lifecycleStage',
  'onboardingStatus',
  'priority',
  'services',
  'platform',
  'clientType',
  'isWebTeamClient',
  'webProjectStatus',
  'webProjectStartDate',
  'webProjectEndDate',
  'webProjectNotes',
  'websiteType',
  'techStack',
  'serviceSegment',
  'billingType',
  'billingAmount',
  'parentClientId',
  'linkedClientId',
  'clientSegment',
  'startDate',
  'endDate',
  'progress',
  'projectStatus',
  'projectPriority',
  'monthlyBudget',
  'paymentStatus',
  'paymentDueDay',
  'invoiceDayOfMonth',
  'invoiceStatus',
  'currentPaymentStatus',
  'bankAccount',
  'advanceAmount',
  'reminderFrequency',
  'paymentTerms',
  'customPaymentDays',
  'preferredContact',
  'haltReminders',
  'accountsNotes',
  'isLost',
  'lostReason',
  'stoppedServices',
  'upsellPotential',
  'entityType',
  'poNumber',
  'accountManagerId',
  'slaSigned',
  'slaSignedAt',
  'slaDocumentUrl',
  'sowSigned',
  'sowSignedAt',
  'sowDocumentUrl',
  'initialPaymentConfirmed',
  'initialPaymentDate',
  'welcomeMessageSent',
  'onboardingFormCompleted',
])

/**
 * Check if user can access a specific client's data
 * Returns detailed access information
 */
export async function checkClientAccess(
  user: AuthenticatedUser,
  clientId: string
): Promise<{
  canView: boolean
  canModify: boolean
  canDelete: boolean
  canSeeFinancials: boolean
  accessReason: string
}> {
  // Super admin and admin can access everything
  if (ADMIN_ROLES.includes(user.role)) {
    return {
      canView: true,
      canModify: CLIENT_MODIFY_ROLES.includes(user.role),
      canDelete: CLIENT_DELETE_ROLES.includes(user.role),
      canSeeFinancials: true,
      accessReason: 'admin_role',
    }
  }

  // Check if user is on the client's team
  const teamMember = await prisma.clientTeamMember.findFirst({
    where: {
      clientId,
      userId: user.id,
    },
  })

  if (teamMember) {
    const isAccountManager = teamMember.role === 'ACCOUNT_MANAGER'
    return {
      canView: true,
      canModify: isAccountManager || teamMember.isPrimary,
      canDelete: false, // Team members can never delete
      canSeeFinancials: isAccountManager || FINANCIAL_ROLES.includes(user.role),
      accessReason: 'team_member',
    }
  }

  // Check if user is the account manager (via client record)
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { accountManagerId: true },
  })

  if (client?.accountManagerId === user.id) {
    return {
      canView: true,
      canModify: true,
      canDelete: false,
      canSeeFinancials: true,
      accessReason: 'account_manager',
    }
  }

  // Accounts department can view all clients for billing
  if (user.role === 'ACCOUNTS' || user.department === 'ACCOUNTS') {
    return {
      canView: true,
      canModify: false,
      canDelete: false,
      canSeeFinancials: true,
      accessReason: 'accounts_department',
    }
  }

  // Operations department can view all clients
  if (user.role === 'OPERATIONS_HEAD' || user.department === 'OPERATIONS') {
    return {
      canView: true,
      canModify: true,
      canDelete: false,
      canSeeFinancials: true,
      accessReason: 'operations_department',
    }
  }

  // Sales can view clients they are assigned to via team membership
  // (Lead conversion check removed - Lead model doesn't track convertedClientId)

  // No access
  return {
    canView: false,
    canModify: false,
    canDelete: false,
    canSeeFinancials: false,
    accessReason: 'no_access',
  }
}

/**
 * Quick check if user can view a client
 */
export async function canViewClient(
  user: AuthenticatedUser,
  clientId: string
): Promise<boolean> {
  const access = await checkClientAccess(user, clientId)
  return access.canView
}

/**
 * Quick check if user can modify a client
 */
export async function canModifyClient(
  user: AuthenticatedUser,
  clientId: string
): Promise<boolean> {
  const access = await checkClientAccess(user, clientId)
  return access.canModify
}

/**
 * Filter update data using an allowlist (deny-by-default).
 * Only explicitly permitted fields pass through — new schema fields
 * are blocked until added to the allowlist.
 */
export function filterUpdateData(
  data: Record<string, unknown>,
  user: AuthenticatedUser
): Record<string, unknown> {
  const filtered: Record<string, unknown> = {}
  const isAdmin = ADMIN_ROLES.includes(user.role)
  const canModify = CLIENT_MODIFY_ROLES.includes(user.role)

  for (const [key, value] of Object.entries(data)) {
    // Admin-only fields
    if (ADMIN_ONLY_FIELDS.includes(key)) {
      if (isAdmin) filtered[key] = value
      continue
    }

    // Modify-role fields (SUPER_ADMIN, MANAGER, ACCOUNTS)
    if (MODIFY_ROLE_FIELDS.has(key)) {
      if (canModify || isAdmin) filtered[key] = value
      continue
    }

    // Base fields — anyone with update access can set these
    if (BASE_UPDATE_FIELDS.has(key)) {
      filtered[key] = value
    }

    // Everything else is silently dropped (deny-by-default)
  }

  return filtered
}

/**
 * Allowed fields for client updates by role.
 * Derives from the same allowlists used by filterUpdateData.
 */
export function getAllowedUpdateFields(user: AuthenticatedUser): string[] {
  const fields = [...BASE_UPDATE_FIELDS]

  if (CLIENT_MODIFY_ROLES.includes(user.role) || ADMIN_ROLES.includes(user.role)) {
    fields.push(...MODIFY_ROLE_FIELDS)
  }

  if (ADMIN_ROLES.includes(user.role)) {
    fields.push(...ADMIN_ONLY_FIELDS)
  }

  return fields
}
