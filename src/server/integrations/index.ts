// Platform Integrations - Main exports

// Types
export * from './types'

// OAuth Configuration
export {
  getOAuthConfig,
  getAuthorizationUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  GOOGLE_SCOPES,
  META_SCOPES,
  LINKEDIN_SCOPES,
} from './oauth-config'

// Encryption
export {
  encrypt,
  decrypt,
  generateOAuthState,
  parseOAuthState,
} from './encryption'

// Connection Management
export {
  createConnection,
  getConnectionTokens,
  discoverAccounts,
  getClientConnections,
  disconnectPlatform,
  getConnectionStatus,
} from './connection-service'

// Data Sync
export {
  syncConnectionMetrics,
  syncAllConnections,
  getClientMetrics,
  getClientMetricsSummary,
} from './sync-service'

// Platform Clients
export { GoogleAnalyticsClient, GoogleSearchConsoleClient } from './google/client'
export { MetaClient } from './meta/client'
