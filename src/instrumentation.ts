/**
 * Next.js Instrumentation
 *
 * This file runs once when the server starts.
 * Used to initialize Sentry integrations.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // TEMPORARILY DISABLED FOR LOCAL TESTING
  if (process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true') {
    await import('./instrumentation-client')
  }
  console.log('[Instrumentation] Server starting (dev mode)...')
}

// Sentry request error handler — disabled for local testing
export async function onRequestError(err: Error, request: Request) {
  console.error('[Instrumentation] Request error:', err.message)
}
