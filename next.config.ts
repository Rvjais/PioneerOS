import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Standalone output: bundles only the required node_modules into .next/standalone/
  // This lets the VPS run `node server.js` with NO npm install — much lower RAM/disk usage
  output: 'standalone',
  // TypeScript checking enabled to catch errors at build time
  typescript: {
    ignoreBuildErrors: false,
  },
  // External packages for server-side (heavy Node.js libs)
  serverExternalPackages: [
    'sharp',
    'googleapis',
    'jspdf',
    'jspdf-autotable',
    'xlsx',
  ],
  // Optimize images for low RAM usage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "media.licdn.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      // External profile pictures / logos
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.gravatar.com",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      // WhatsApp/Business tool images
      {
        protocol: "https",
        hostname: "*.wbiztool.com",
      },
      {
        protocol: "https",
        hostname: "wbiztool.com",
      },
    ],
    // Optimize image formats
    formats: ['image/avif', 'image/webp'],
    // Fewer device sizes = less unique image variants to process and cache
    deviceSizes: [640, 1200, 1920],
    imageSizes: [32, 64, 128, 256],
    // Cache compiled images for 7 days to minimize repeated sharp processing on VPS
    minimumCacheTTL: 604800, // 7 days
  },
  // Reduce memory usage by limiting page buffer
  // For dev: keep compiled pages longer to avoid re-compilation on tab switches
  // For production VPS: these don't apply (only affects dev server)
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 60 seconds — default, prevents constant recompilation
    pagesBufferLength: 1, // Minimize memory usage by keeping only 1 page in buffer
  },
  // Enable compression for smaller responses
  compress: true,
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // Experimental features for better performance
  experimental: {
    // Optimize package imports for smaller bundles
    optimizePackageImports: ['recharts', 'date-fns', 'lucide-react', 'framer-motion', 'zod'],
    // Limit concurrency to 1 to save memory on build (prevents OOM/Killed errors)
    staticGenerationMaxConcurrency: 1,
  },
  // Security headers + iframe embedding for /embed routes
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    const cspValue = isDev 
      ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; worker-src 'self' blob:; connect-src 'self' http://localhost:* https://localhost:* ws://localhost:* wss://localhost:* https://*.brandingpioneers.in https://*.brandingpioneers.com https://*.supabase.co https://*.sentry.io https://wbiztool.com; frame-ancestors 'none'"
      : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; worker-src 'self' blob:; connect-src 'self' http://localhost:* https://localhost:* ws://localhost:* wss://localhost:* https://*.brandingpioneers.in https://*.brandingpioneers.com https://*.supabase.co https://*.sentry.io https://wbiztool.com; frame-ancestors 'none'";

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '0' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: cspValue },
        ],
      },
      {
        source: '/embed/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://brandingpioneers.in https://www.brandingpioneers.in https://brandingpioneers.com https://www.brandingpioneers.com" },
        ],
      },
    ];
  },
  // Consolidated redirects (removed separate page files)
  async redirects() {
    return [
      {
        source: '/innovation',
        destination: '/ideas',
        permanent: true,
      },
      {
        source: '/daily-tracker',
        destination: '/tasks/daily',
        permanent: true,
      },
      {
        source: '/expenses',
        destination: '/finance/expenses',
        permanent: true,
      },
      {
        source: '/employee-onboarding/v2',
        destination: '/hr/employee-onboarding',
        permanent: true,
      },
      {
        source: '/employee-onboarding/v3',
        destination: '/hr/employee-onboarding',
        permanent: true,
      },
      {
        source: '/client-onboarding/v2',
        destination: '/accounts/onboarding/create',
        permanent: true,
      },
      {
        source: '/client-onboarding/v3',
        destination: '/accounts/onboarding/create',
        permanent: true,
      },
      {
        source: '/accounts/payment-onboarding',
        destination: '/accounts/onboarding/create',
        permanent: true,
      },
      {
        source: '/accounts/client-onboarding',
        destination: '/accounts/onboarding',
        permanent: true,
      },
      {
        source: '/design/print',
        destination: '/social/print-designing?category=PRINT',
        permanent: false,
      },
      {
        source: '/design/digital',
        destination: '/social/print-designing?category=DIGITAL',
        permanent: false,
      },
      {
        source: '/design/branding',
        destination: '/social/print-designing?category=BRANDING',
        permanent: false,
      },
      {
        source: '/design/thumbnails',
        destination: '/social/print-designing?category=SOCIAL',
        permanent: false,
      },
      {
        source: '/design/delivered',
        destination: '/design/requests?status=DELIVERED',
        permanent: false,
      },
      {
        source: '/design/approvals',
        destination: '/design/requests?status=APPROVED',
        permanent: false,
      },
      {
        source: '/design/requests/pending',
        destination: '/design/requests?status=PENDING',
        permanent: false,
      },
      {
        source: '/design/requests/in-progress',
        destination: '/design/requests?status=IN_DESIGN',
        permanent: false,
      },
      {
        source: '/design/daily-planner',
        destination: '/design/calendar',
        permanent: false,
      },
      {
        source: '/design/metrics',
        destination: '/design',
        permanent: false,
      },
      {
        source: '/design/metrics/turnaround',
        destination: '/design',
        permanent: false,
      },
    ];
  },
};

// Optimization: Allow bypassing heavy wrappers during build to save memory
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';
const shouldSkipSentry = process.env.SKIP_SENTRY === 'true';
const shouldSkipPWA = process.env.SKIP_PWA === 'true';

let finalConfig = nextConfig;

if (!shouldSkipPWA && process.env.NODE_ENV === 'production') {
  finalConfig = withPWA(finalConfig);
}

if (!shouldSkipSentry && process.env.NODE_ENV === 'production') {
  finalConfig = withSentryConfig(finalConfig, {
    sourcemaps: {
      deleteSourcemapsAfterUpload: true,
    },
    silent: !process.env.CI,
    tunnelRoute: "/monitoring",
  });
}

export default finalConfig;
