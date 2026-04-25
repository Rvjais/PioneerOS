/**
 * Service Account Mappings
 *
 * Maps platform services to the designated business accounts
 * that should receive delegated access from clients.
 *
 * When a client grants OAuth access, we use their credentials
 * to add these accounts as authorized users (where applicable).
 */

export interface ServiceAccountConfig {
  email: string
  name: string
  description: string
}

export interface ServiceAccountMapping {
  platform: string
  services: string[]
  account: ServiceAccountConfig
}

/**
 * Service account mappings for each platform/service type
 */
export const SERVICE_ACCOUNTS: ServiceAccountMapping[] = [
  // SEO Services - Analytics & Search Console
  {
    platform: 'GOOGLE',
    services: ['GOOGLE_ANALYTICS', 'GOOGLE_SEARCH_CONSOLE'],
    account: {
      email: 'seowithbp@gmail.com',
      name: 'Branding Pioneers SEO',
      description: 'SEO team access for Analytics and Search Console',
    },
  },
  // YouTube
  {
    platform: 'GOOGLE',
    services: ['GOOGLE_YOUTUBE'],
    account: {
      email: 'ytwithbp@gmail.com',
      name: 'Branding Pioneers YouTube',
      description: 'YouTube team access for channel management',
    },
  },
  // Google Ads
  {
    platform: 'GOOGLE',
    services: ['GOOGLE_ADS'],
    account: {
      email: 'ppcwithbp@gmail.com',
      name: 'Branding Pioneers PPC',
      description: 'Ads team access for Google Ads management',
    },
  },
  // Meta (Facebook, Instagram)
  {
    platform: 'META',
    services: ['META_PAGE', 'META_AD_ACCOUNT', 'META_INSTAGRAM'],
    account: {
      email: 'arush.thapar@yahoo.com',
      name: 'Branding Pioneers Meta',
      description: 'Social team access for Meta platforms',
    },
  },
  // LinkedIn
  {
    platform: 'LINKEDIN',
    services: ['LINKEDIN_PAGE'],
    account: {
      email: 'arush.thapar@yahoo.com',
      name: 'Branding Pioneers LinkedIn',
      description: 'Social team access for LinkedIn',
    },
  },
]

/**
 * Get the service account for a specific platform and service
 */
export function getServiceAccount(
  platform: string,
  service?: string
): ServiceAccountConfig | null {
  const mapping = SERVICE_ACCOUNTS.find((m) => {
    if (m.platform !== platform) return false
    if (service && !m.services.includes(service)) return false
    return true
  })

  return mapping?.account || null
}

/**
 * Get all service accounts for a platform
 */
export function getServiceAccountsForPlatform(
  platform: string
): ServiceAccountMapping[] {
  return SERVICE_ACCOUNTS.filter((m) => m.platform === platform)
}

/**
 * Get the email to add for access delegation
 */
export function getAccessDelegationEmail(
  platform: string,
  service: string
): string | null {
  const account = getServiceAccount(platform, service)
  return account?.email || null
}

/**
 * Instructions for clients on how to grant access
 */
export const ACCESS_INSTRUCTIONS = {
  GOOGLE_ANALYTICS: {
    title: 'Google Analytics Access',
    steps: [
      'Go to Google Analytics Admin',
      'Click "Account Access Management"',
      'Click "+ Add users"',
      'Enter email: seowithbp@gmail.com',
      'Select "Analyst" or "Viewer" role',
      'Click "Add"',
    ],
    targetEmail: 'seowithbp@gmail.com',
  },
  GOOGLE_SEARCH_CONSOLE: {
    title: 'Search Console Access',
    steps: [
      'Go to Google Search Console',
      'Select your property',
      'Go to Settings → Users and permissions',
      'Click "Add user"',
      'Enter email: seowithbp@gmail.com',
      'Select "Full" permission',
      'Click "Add"',
    ],
    targetEmail: 'seowithbp@gmail.com',
  },
  GOOGLE_YOUTUBE: {
    title: 'YouTube Channel Access',
    steps: [
      'Go to YouTube Studio',
      'Click Settings (gear icon)',
      'Go to Permissions',
      'Click "Invite"',
      'Enter email: ytwithbp@gmail.com',
      'Select "Manager" role',
      'Click "Done"',
    ],
    targetEmail: 'ytwithbp@gmail.com',
  },
  GOOGLE_ADS: {
    title: 'Google Ads Access',
    steps: [
      'Go to Google Ads',
      'Click "Admin" → "Access and security"',
      'Click "+ Add users"',
      'Enter email: ppcwithbp@gmail.com',
      'Select "Standard" access level',
      'Click "Send invitation"',
    ],
    targetEmail: 'ppcwithbp@gmail.com',
  },
  META_PAGE: {
    title: 'Facebook Page Access',
    steps: [
      'Go to your Facebook Page',
      'Click "Settings" → "Page roles" (or "New Pages Experience" → "Settings" → "Page access")',
      'Click "Add New Page Role"',
      'Enter email: arush.thapar@yahoo.com',
      'Select "Admin" or "Editor" role',
      'Click "Add"',
    ],
    targetEmail: 'arush.thapar@yahoo.com',
  },
  META_AD_ACCOUNT: {
    title: 'Meta Ads Access',
    steps: [
      'Go to Meta Business Suite',
      'Click "Settings" → "People"',
      'Click "Add People"',
      'Enter email: arush.thapar@yahoo.com',
      'Select the ad account and assign "Manage campaigns"',
      'Click "Invite"',
    ],
    targetEmail: 'arush.thapar@yahoo.com',
  },
  META_INSTAGRAM: {
    title: 'Instagram Access',
    steps: [
      'Ensure Instagram is connected to Facebook Page',
      'Go to Meta Business Suite → Settings → Instagram accounts',
      'Click "Add People"',
      'Enter email: arush.thapar@yahoo.com',
      'Select permissions',
      'Click "Invite"',
    ],
    targetEmail: 'arush.thapar@yahoo.com',
  },
  LINKEDIN_PAGE: {
    title: 'LinkedIn Page Access',
    steps: [
      'Go to your LinkedIn Company Page',
      'Click "Admin tools" → "Manage admins"',
      'Click "Add admin"',
      'Search for: arush.thapar@yahoo.com',
      'Select "Super admin" or "Content admin" role',
      'Click "Save"',
    ],
    targetEmail: 'arush.thapar@yahoo.com',
  },
}

export default SERVICE_ACCOUNTS
