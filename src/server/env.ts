import { z } from 'zod'

const isProduction = process.env.NODE_ENV === 'production'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_SECRET: z.string().min(10, 'NEXTAUTH_SECRET must be at least 10 characters')
    .refine(val => val !== 'your-super-secret-key-change-in-production', 'NEXTAUTH_SECRET must be changed from default'),
  NEXTAUTH_URL: z.string().url().optional()
    .refine(val => {
      if (process.env.NODE_ENV === 'production') {
        return !!val && val.startsWith('https://')
      }
      return true
    }, 'NEXTAUTH_URL must be set and use HTTPS in production'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  ENCRYPTION_KEY: z.string().optional()
    .refine(val => !isProduction || (val && val.length >= 32), 'ENCRYPTION_KEY must be at least 32 characters in production'),
  ENCRYPTION_SALT: z.string().optional()
    .refine(val => !isProduction || (val && val.length >= 16), 'ENCRYPTION_SALT must be at least 16 characters in production'),
  OAUTH_ENCRYPTION_SECRET: z.string().optional()
    .refine(val => !isProduction || !!val, 'OAUTH_ENCRYPTION_SECRET is required in production'),
  OAUTH_ENCRYPTION_SALT: z.string().optional()
    .refine(val => !isProduction || !!val, 'OAUTH_ENCRYPTION_SALT is required in production'),
  REAUTH_SECRET: z.string().optional()
    .refine(val => !isProduction || !!val, 'REAUTH_SECRET is required in production'),
  RESEND_API_KEY: z.string().optional()
    .refine(val => !isProduction || !!val, 'RESEND_API_KEY is required in production'),
  CRON_SECRET: z.string().optional()
    .refine(val => !isProduction || !!val, 'CRON_SECRET is required in production'),
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  REDIS_URL: z.string().optional()
    .refine(val => !isProduction || !!val, 'REDIS_URL is required in production'),
  CLOUDINARY_CLOUD_NAME: z.string().optional()
    .refine(val => !isProduction || !!val, 'CLOUDINARY_CLOUD_NAME is required in production'),
  CLOUDINARY_API_KEY: z.string().optional()
    .refine(val => !isProduction || !!val, 'CLOUDINARY_API_KEY is required in production'),
  CLOUDINARY_API_SECRET: z.string().optional()
    .refine(val => !isProduction || !!val, 'CLOUDINARY_API_SECRET is required in production'),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export const env = envSchema.parse(process.env)
