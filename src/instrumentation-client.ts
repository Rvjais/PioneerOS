import * as Sentry from "@sentry/nextjs";

// Skip Sentry entirely in development for faster page loads
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],

    // Performance Monitoring
    tracesSampleRate: 0.1,

    // Distributed tracing
    tracePropagationTargets: [/^https:\/\/.*\.brandingpioneers\./],

    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

// Required for navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
