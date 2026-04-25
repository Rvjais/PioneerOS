/**
 * SaaS Tools Library
 *
 * This module provides access to company SaaS tools.
 * Credentials are stored securely in the database and fetched via API.
 *
 * IMPORTANT: Never hardcode credentials in source code.
 * All tool credentials have been migrated to the database.
 */

export type SaasTool = {
  id: string
  name: string
  category: string
  description: string | null
  url: string
  loginType: 'team' | 'subaccount' | 'whitelabel' | 'free'
  email?: string
  password?: string
  notes?: string | null
}

export type SaasToolsResponse = {
  tools: SaasTool[]
  categories: string[]
  canViewCredentials: boolean
}

export const saasToolCategories = [
  'Website Builders',
  'Forms & Surveys',
  'Chatbots & AI',
  'CRM & Sales',
  'Social Media',
  'SEO Tools',
  'Design & Media',
  'Video & Animation',
  'Email & Marketing',
  'Analytics',
  'Collaboration',
  'Content & Writing',
  'Hosting & Storage',
  'Ads & PPC',
  'Automation',
  'Chrome Extensions',
]

/**
 * Fetch SaaS tools from the API
 * Credentials are only returned for authorized users (SUPER_ADMIN, MANAGER)
 */
export async function fetchSaasTools(category?: string): Promise<SaasToolsResponse> {
  const params = new URLSearchParams()
  if (category) {
    params.set('category', category)
  }

  const response = await fetch(`/api/saas-tools?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch SaaS tools')
  }

  return response.json()
}

/**
 * Fetch a single SaaS tool by ID
 */
export async function fetchSaasTool(id: string): Promise<{ tool: SaasTool; canViewCredentials: boolean }> {
  const response = await fetch(`/api/saas-tools/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch SaaS tool')
  }

  return response.json()
}

/**
 * Create a new SaaS tool (admin only)
 */
export async function createSaasTool(
  tool: Omit<SaasTool, 'id'>
): Promise<{ tool: SaasTool }> {
  const response = await fetch('/api/saas-tools', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tool),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create SaaS tool')
  }

  return response.json()
}

/**
 * Update a SaaS tool (admin only)
 */
export async function updateSaasTool(
  id: string,
  updates: Partial<SaasTool>
): Promise<{ tool: SaasTool }> {
  const response = await fetch(`/api/saas-tools/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update SaaS tool')
  }

  return response.json()
}

/**
 * Delete a SaaS tool (admin only, soft delete)
 */
export async function deleteSaasTool(id: string): Promise<void> {
  const response = await fetch(`/api/saas-tools/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete SaaS tool')
  }
}

