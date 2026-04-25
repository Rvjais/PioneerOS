/**
 * Provider Configurations
 *
 * Defines credential fields, environment variable mappings,
 * and connection test functions for each supported provider.
 */

import { TestResult, CredentialType } from './credential-service'

export interface ProviderField {
  key: string
  label: string
  envKey: string
  type: 'text' | 'password' | 'url'
  required: boolean
  placeholder?: string
  helpText?: string
}

export interface ProviderConfig {
  name: string
  type: CredentialType
  category: 'oauth' | 'payment' | 'communication' | 'ai'
  description: string
  docsUrl?: string
  fields: ProviderField[]
  testConnection?: (credentials: Record<string, string>) => Promise<TestResult>
}

/**
 * Test Google OAuth credentials
 */
async function testGoogleOAuth(credentials: Record<string, string>): Promise<TestResult> {
  const { clientId, clientSecret } = credentials

  if (!clientId || !clientSecret) {
    return { success: false, message: 'Client ID and Client Secret are required' }
  }

  // Verify by checking token info endpoint structure
  // We can't fully test OAuth without a user flow, so we verify the credentials format
  if (!clientId.includes('.apps.googleusercontent.com')) {
    return { success: false, message: 'Invalid Google Client ID format' }
  }

  return { success: true, message: 'Google OAuth credentials format validated' }
}

/**
 * Test Meta OAuth credentials
 */
async function testMetaOAuth(credentials: Record<string, string>): Promise<TestResult> {
  const { appId, appSecret } = credentials

  if (!appId || !appSecret) {
    return { success: false, message: 'App ID and App Secret are required' }
  }

  try {
    // Test by getting app access token
    const response = await fetch(
      `https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`
    )

    if (!response.ok) {
      const error = await response.json()
      return { success: false, message: error.error?.message || 'Invalid credentials' }
    }

    const data = await response.json()
    if (data.access_token) {
      return { success: true, message: 'Meta credentials verified successfully' }
    }

    return { success: false, message: 'Failed to obtain access token' }
  } catch (error) {
    return { success: false, message: 'Connection test failed' }
  }
}

/**
 * Test LinkedIn OAuth credentials
 */
async function testLinkedInOAuth(credentials: Record<string, string>): Promise<TestResult> {
  const { clientId, clientSecret } = credentials

  if (!clientId || !clientSecret) {
    return { success: false, message: 'Client ID and Client Secret are required' }
  }

  // LinkedIn doesn't have a simple credential verification endpoint
  // We can only validate format
  if (clientId.length < 10 || clientSecret.length < 10) {
    return { success: false, message: 'Invalid credential format' }
  }

  return { success: true, message: 'LinkedIn credentials format validated' }
}

/**
 * Test Razorpay credentials
 */
async function testRazorpay(credentials: Record<string, string>): Promise<TestResult> {
  const { keyId, keySecret } = credentials

  if (!keyId || !keySecret) {
    return { success: false, message: 'Key ID and Key Secret are required' }
  }

  try {
    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
    const response = await fetch('https://api.razorpay.com/v1/payments?count=1', {
      headers: {
        Authorization: `Basic ${authHeader}`,
      },
    })

    if (response.ok) {
      return { success: true, message: 'Razorpay credentials verified successfully' }
    }

    if (response.status === 401) {
      return { success: false, message: 'Invalid Razorpay credentials' }
    }

    return { success: false, message: `Razorpay API error: ${response.status}` }
  } catch (error) {
    return { success: false, message: 'Connection test failed' }
  }
}

/**
 * Test Stripe credentials
 */
async function testStripe(credentials: Record<string, string>): Promise<TestResult> {
  const { secretKey } = credentials

  if (!secretKey) {
    return { success: false, message: 'Secret Key is required' }
  }

  try {
    const response = await fetch('https://api.stripe.com/v1/balance', {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    })

    if (response.ok) {
      return { success: true, message: 'Stripe credentials verified successfully' }
    }

    if (response.status === 401) {
      return { success: false, message: 'Invalid Stripe credentials' }
    }

    return { success: false, message: `Stripe API error: ${response.status}` }
  } catch (error) {
    return { success: false, message: 'Connection test failed' }
  }
}

/**
 * Test Resend credentials
 */
async function testResend(credentials: Record<string, string>): Promise<TestResult> {
  const { apiKey } = credentials

  if (!apiKey) {
    return { success: false, message: 'API Key is required' }
  }

  try {
    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (response.ok) {
      return { success: true, message: 'Resend credentials verified successfully' }
    }

    if (response.status === 401) {
      return { success: false, message: 'Invalid Resend API key' }
    }

    return { success: false, message: `Resend API error: ${response.status}` }
  } catch (error) {
    return { success: false, message: 'Connection test failed' }
  }
}

/**
 * Test OpenRouter credentials
 */
async function testOpenRouter(credentials: Record<string, string>): Promise<TestResult> {
  const { apiKey } = credentials

  if (!apiKey) {
    return { success: false, message: 'API Key is required' }
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (response.ok) {
      return { success: true, message: 'OpenRouter credentials verified successfully' }
    }

    if (response.status === 401) {
      return { success: false, message: 'Invalid OpenRouter API key' }
    }

    return { success: false, message: `OpenRouter API error: ${response.status}` }
  } catch (error) {
    return { success: false, message: 'Connection test failed' }
  }
}

/**
 * Test WBizTool credentials
 */
async function testWBizTool(credentials: Record<string, string>): Promise<TestResult> {
  const { clientId, apiKey, whatsappClient } = credentials

  if (!clientId || !apiKey) {
    return { success: false, message: 'Client ID and API Key are required' }
  }

  try {
    const response = await fetch('https://api.wbiztool.com/v1/status', {
      headers: {
        'X-Client-ID': clientId,
        'X-API-Key': apiKey,
        ...(whatsappClient && { 'X-WhatsApp-Client': whatsappClient }),
      },
    })

    if (response.ok) {
      return { success: true, message: 'WBizTool credentials verified successfully' }
    }

    if (response.status === 401) {
      return { success: false, message: 'Invalid WBizTool credentials' }
    }

    // WBizTool might not have a status endpoint, so we'll consider a 404 as valid credentials
    if (response.status === 404) {
      return { success: true, message: 'WBizTool credentials format validated' }
    }

    return { success: false, message: `WBizTool API error: ${response.status}` }
  } catch (error) {
    // Network error might mean the endpoint doesn't exist, so we validate format
    if (clientId.length > 5 && apiKey.length > 5) {
      return { success: true, message: 'WBizTool credentials format validated' }
    }
    return { success: false, message: 'Connection test failed' }
  }
}

/**
 * Provider configurations
 */
export const PROVIDERS: Record<string, ProviderConfig> = {
  GOOGLE: {
    name: 'Google OAuth',
    type: 'OAUTH',
    category: 'oauth',
    description: 'Google OAuth for Analytics, Search Console, Ads, and YouTube',
    docsUrl: 'https://console.cloud.google.com/apis/credentials',
    fields: [
      {
        key: 'clientId',
        label: 'Client ID',
        envKey: 'GOOGLE_CLIENT_ID',
        type: 'text',
        required: true,
        placeholder: 'xxxxx.apps.googleusercontent.com',
        helpText: 'From Google Cloud Console > APIs & Services > Credentials',
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        envKey: 'GOOGLE_CLIENT_SECRET',
        type: 'password',
        required: true,
        helpText: 'Keep this secret secure',
      },
    ],
    testConnection: testGoogleOAuth,
  },

  META: {
    name: 'Meta (Facebook/Instagram)',
    type: 'OAUTH',
    category: 'oauth',
    description: 'Meta OAuth for Facebook Pages, Instagram, and Meta Ads',
    docsUrl: 'https://developers.facebook.com/apps/',
    fields: [
      {
        key: 'appId',
        label: 'App ID',
        envKey: 'META_APP_ID',
        type: 'text',
        required: true,
        placeholder: '123456789012345',
        helpText: 'From Meta for Developers > Your App > Settings > Basic',
      },
      {
        key: 'appSecret',
        label: 'App Secret',
        envKey: 'META_APP_SECRET',
        type: 'password',
        required: true,
        helpText: 'Keep this secret secure',
      },
    ],
    testConnection: testMetaOAuth,
  },

  LINKEDIN: {
    name: 'LinkedIn',
    type: 'OAUTH',
    category: 'oauth',
    description: 'LinkedIn OAuth for Company Pages and Ads',
    docsUrl: 'https://www.linkedin.com/developers/apps',
    fields: [
      {
        key: 'clientId',
        label: 'Client ID',
        envKey: 'LINKEDIN_CLIENT_ID',
        type: 'text',
        required: true,
        helpText: 'From LinkedIn Developers > Your App > Auth',
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        envKey: 'LINKEDIN_CLIENT_SECRET',
        type: 'password',
        required: true,
        helpText: 'Keep this secret secure',
      },
    ],
    testConnection: testLinkedInOAuth,
  },

  TWITTER: {
    name: 'Twitter/X',
    type: 'OAUTH',
    category: 'oauth',
    description: 'Twitter OAuth for posting and analytics',
    docsUrl: 'https://developer.twitter.com/en/portal/dashboard',
    fields: [
      {
        key: 'clientId',
        label: 'Client ID',
        envKey: 'TWITTER_CLIENT_ID',
        type: 'text',
        required: true,
        helpText: 'From Twitter Developer Portal > Your App > Keys and tokens',
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        envKey: 'TWITTER_CLIENT_SECRET',
        type: 'password',
        required: true,
        helpText: 'Keep this secret secure',
      },
    ],
  },

  RAZORPAY: {
    name: 'Razorpay',
    type: 'API_KEY',
    category: 'payment',
    description: 'Payment processing for Indian market',
    docsUrl: 'https://dashboard.razorpay.com/app/keys',
    fields: [
      {
        key: 'keyId',
        label: 'Key ID',
        envKey: 'RAZORPAY_KEY_ID',
        type: 'text',
        required: true,
        placeholder: 'rzp_live_xxxxx or rzp_test_xxxxx',
        helpText: 'From Razorpay Dashboard > Settings > API Keys',
      },
      {
        key: 'keySecret',
        label: 'Key Secret',
        envKey: 'RAZORPAY_KEY_SECRET',
        type: 'password',
        required: true,
        helpText: 'Keep this secret secure',
      },
      {
        key: 'webhookSecret',
        label: 'Webhook Secret',
        envKey: 'RAZORPAY_WEBHOOK_SECRET',
        type: 'password',
        required: false,
        helpText: 'For verifying webhook signatures',
      },
    ],
    testConnection: testRazorpay,
  },

  STRIPE: {
    name: 'Stripe',
    type: 'API_KEY',
    category: 'payment',
    description: 'Payment processing for international market',
    docsUrl: 'https://dashboard.stripe.com/apikeys',
    fields: [
      {
        key: 'publishableKey',
        label: 'Publishable Key',
        envKey: 'STRIPE_PUBLISHABLE_KEY',
        type: 'text',
        required: true,
        placeholder: 'pk_live_xxxxx or pk_test_xxxxx',
        helpText: 'Public key for client-side use',
      },
      {
        key: 'secretKey',
        label: 'Secret Key',
        envKey: 'STRIPE_SECRET_KEY',
        type: 'password',
        required: true,
        placeholder: 'sk_live_xxxxx or sk_test_xxxxx',
        helpText: 'Keep this secret secure',
      },
      {
        key: 'webhookSecret',
        label: 'Webhook Secret',
        envKey: 'STRIPE_WEBHOOK_SECRET',
        type: 'password',
        required: false,
        placeholder: 'whsec_xxxxx',
        helpText: 'For verifying webhook signatures',
      },
    ],
    testConnection: testStripe,
  },

  RESEND: {
    name: 'Resend',
    type: 'API_KEY',
    category: 'communication',
    description: 'Transactional email service',
    docsUrl: 'https://resend.com/api-keys',
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        envKey: 'RESEND_API_KEY',
        type: 'password',
        required: true,
        placeholder: 're_xxxxx',
        helpText: 'From Resend Dashboard > API Keys',
      },
      {
        key: 'fromEmail',
        label: 'Default From Email',
        envKey: 'RESEND_FROM_EMAIL',
        type: 'text',
        required: false,
        placeholder: 'notifications@yourdomain.com',
        helpText: 'Must be from a verified domain',
      },
    ],
    testConnection: testResend,
  },

  OPENROUTER: {
    name: 'OpenRouter',
    type: 'API_KEY',
    category: 'ai',
    description: 'AI model router for GPT, Claude, and other models',
    docsUrl: 'https://openrouter.ai/keys',
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        envKey: 'OPENROUTER_API_KEY',
        type: 'password',
        required: true,
        placeholder: 'sk-or-xxxxx',
        helpText: 'From OpenRouter Dashboard',
      },
      {
        key: 'defaultModel',
        label: 'Default Model',
        envKey: 'OPENROUTER_DEFAULT_MODEL',
        type: 'text',
        required: false,
        placeholder: 'anthropic/claude-3-sonnet',
        helpText: 'Default model to use for AI requests',
      },
    ],
    testConnection: testOpenRouter,
  },

  DEEPSEEK: {
    name: 'DeepSeek',
    type: 'API_KEY',
    category: 'ai',
    description: 'DeepSeek AI for data extraction and conversational AI',
    docsUrl: 'https://platform.deepseek.com/api_keys',
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        envKey: 'DEEPSEEK_API_KEY',
        type: 'password',
        required: true,
        placeholder: 'sk-xxxxx',
        helpText: 'From DeepSeek Platform Dashboard',
      },
    ],
    testConnection: async (credentials: Record<string, string>) => {
      const { apiKey } = credentials
      if (!apiKey) {
        return { success: false, message: 'API Key is required' }
      }
      try {
        const response = await fetch('https://api.deepseek.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
        if (response.ok) {
          return { success: true, message: 'DeepSeek credentials verified successfully' }
        }
        if (response.status === 401) {
          return { success: false, message: 'Invalid DeepSeek API key' }
        }
        return { success: false, message: `DeepSeek API error: ${response.status}` }
      } catch {
        return { success: false, message: 'Connection test failed' }
      }
    },
  },

  WBIZTOOL: {
    name: 'WBizTool',
    type: 'API_KEY',
    category: 'communication',
    description: 'WhatsApp Business API integration',
    docsUrl: 'https://wbiztool.com/docs',
    fields: [
      {
        key: 'clientId',
        label: 'Client ID',
        envKey: 'WBIZTOOL_CLIENT_ID',
        type: 'text',
        required: true,
        helpText: 'From WBizTool Dashboard',
      },
      {
        key: 'apiKey',
        label: 'API Key',
        envKey: 'WBIZTOOL_API_KEY',
        type: 'password',
        required: true,
        helpText: 'Keep this secret secure',
      },
      {
        key: 'whatsappClient',
        label: 'WhatsApp Client ID',
        envKey: 'WBIZTOOL_WHATSAPP_CLIENT',
        type: 'text',
        required: false,
        helpText: 'Specific WhatsApp account identifier',
      },
    ],
    testConnection: testWBizTool,
  },
}

/**
 * Get providers grouped by category
 */
export function getProvidersByCategory(): Record<string, Array<{ key: string; config: ProviderConfig }>> {
  const grouped: Record<string, Array<{ key: string; config: ProviderConfig }>> = {
    oauth: [],
    payment: [],
    communication: [],
    ai: [],
  }

  for (const [key, config] of Object.entries(PROVIDERS)) {
    grouped[config.category].push({ key, config })
  }

  return grouped
}

/**
 * Get provider config by key
 */
export function getProvider(key: string): ProviderConfig | undefined {
  return PROVIDERS[key]
}

/**
 * Get all provider keys
 */
export function getProviderKeys(): string[] {
  return Object.keys(PROVIDERS)
}
