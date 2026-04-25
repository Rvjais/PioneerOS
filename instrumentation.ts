/**
 * Next.js Instrumentation
 *
 * This file runs once when the server starts.
 * Used to initialize Sentry integrations.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  const isDev = process.env.NODE_ENV === 'development'

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only validate env in production (dev may have missing optional vars)
    if (!isDev) {
      await import('./src/server/env')
      await import('./sentry.server.config')
    }

    console.log('[Instrumentation] Server starting...')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    if (!isDev) {
      await import('./sentry.edge.config')
    }
  }
}

// Sentry request error handler — dynamically imported to avoid Turbopack parse errors in dev
export async function onRequestError(
  ...args: Parameters<typeof import('@sentry/nextjs').captureRequestError>
) {
  const { captureRequestError } = await import('@sentry/nextjs')
  return captureRequestError(...args)
}
