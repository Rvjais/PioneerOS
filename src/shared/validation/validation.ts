import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

// ============================================
// COMMON VALIDATION SCHEMAS
// ============================================

// ID schemas
export const cuidSchema = z.string().cuid()
export const uuidSchema = z.string().uuid()
export const idSchema = z.string().min(1, 'ID is required')

// Contact info
export const emailSchema = z.string().email('Invalid email address')
export const phoneSchema = z.string().regex(/^[+]?[\d\s-]{10,15}$/, 'Invalid phone number')
export const urlSchema = z.string().url('Invalid URL').optional().or(z.literal(''))

// Text fields
export const nameSchema = z.string().min(1, 'Name is required').max(100, 'Name too long')
export const descriptionSchema = z.string().max(5000, 'Description too long').optional()
export const notesSchema = z.string().max(10000, 'Notes too long').optional()

// Dates
export const dateStringSchema = z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
export const futureDateSchema = z.string().refine(
  (val) => new Date(val) > new Date(),
  'Date must be in the future'
)

// Numbers
export const positiveIntSchema = z.number().int().positive()
export const amountSchema = z.number().min(0, 'Amount cannot be negative')
export const percentageSchema = z.number().min(0).max(100)

// Enums
export const statusSchema = z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'COMPLETED', 'CANCELLED'])
export const prioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
export const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'REVISION', 'COMPLETED', 'CANCELLED'])
export const taskTypeSchema = z.enum(['TASK', 'RECURRING', 'SUBTASK', 'PROJECT'])

// ============================================
// COMMON REQUEST SCHEMAS
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const searchSchema = z.object({
  search: z.string().max(200).optional(),
  status: z.string().optional(),
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
})

// ============================================
// DOMAIN-SPECIFIC SCHEMAS
// ============================================

// Client schemas
export const createClientSchema = z.object({
  name: nameSchema,
  brandName: z.string().max(100).optional(),
  contactName: nameSchema.optional(),
  contactEmail: emailSchema.optional(),
  contactPhone: phoneSchema.optional(),
  industry: z.string().max(50).optional(),
  businessType: z.enum(['B2B', 'B2C', 'D2C', 'B2B2C']).optional(),
  tier: z.enum(['STARTER', 'STANDARD', 'PREMIUM', 'ENTERPRISE']).optional(),
  monthlyFee: amountSchema.optional(),
  services: z.array(z.string()).optional(),
  notes: notesSchema,
})

export const updateClientSchema = createClientSchema.partial()

// Task schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000, 'Description must be 2000 characters or less').optional(),
  department: z.string().min(1, 'Department is required'),
  priority: prioritySchema.optional().default('MEDIUM'),
  status: taskStatusSchema.optional().default('TODO'),
  dueDate: dateStringSchema.optional().refine(
    (val) => !val || !isNaN(Date.parse(val)),
    { message: 'Invalid due date format' }
  ),
  startDate: dateStringSchema.optional(),
  assigneeId: idSchema.optional(),
  reviewerId: idSchema.optional(),
  clientId: idSchema.optional(),
  type: taskTypeSchema.optional().default('TASK'),
  estimatedHours: z.number().positive().optional(),
  startTimer: z.boolean().optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
})

export const updateTaskSchema = createTaskSchema.partial()

// Invoice schemas
export const createInvoiceSchema = z.object({
  clientId: idSchema,
  amount: amountSchema,
  tax: amountSchema.optional().default(0),
  dueDate: dateStringSchema,
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: positiveIntSchema,
    rate: amountSchema,
  })).min(1, 'At least one line item required'),
  notes: notesSchema,
})

// Meeting schemas
export const createMeetingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: descriptionSchema,
  date: dateStringSchema,
  duration: z.number().int().min(5).max(480).optional(), // 5 min to 8 hours
  location: z.string().max(500).optional(),
  isOnline: z.boolean().optional().default(true),
  clientId: idSchema.optional(),
  participantIds: z.array(idSchema).optional(),
})

// Client team member schemas
export const teamMemberRoleSchema = z.enum([
  'ACCOUNT_MANAGER',
  'PROJECT_MANAGER',
  'DESIGNER',
  'DEVELOPER',
  'SEO_SPECIALIST',
  'CONTENT_WRITER',
  'ADS_MANAGER',
  'SOCIAL_MEDIA',
  'VIDEO_EDITOR',
  'SUPPORT',
])

export const addTeamMemberSchema = z.object({
  userId: idSchema,
  role: teamMemberRoleSchema,
  isPrimary: z.boolean().optional().default(false),
})

// WhatsApp message schemas
export const indianPhoneSchema = z.string()
  .transform(val => val.replace(/[\s-]/g, '').replace(/^\+91/, '').replace(/^91/, ''))
  .refine(val => /^[6-9]\d{9}$/.test(val), 'Invalid Indian phone number')

export const sendWhatsAppMessageSchema = z.object({
  accountId: idSchema,
  phoneNumber: z.string().min(10, 'Phone number required'),
  content: z.string().min(1, 'Message content required').max(4096, 'Message too long'),
  mediaUrl: urlSchema.optional(),
  mediaType: z.enum(['image', 'video', 'audio', 'document']).optional(),
})

// RFP/Lead schemas
export const createRfpSchema = z.object({
  leadId: idSchema.optional(),
  companyName: z.string().max(200).optional(),
  contactName: z.string().max(100).optional(),
  contactEmail: emailSchema,
  contactPhone: phoneSchema.optional(),
  pipeline: z.enum(['BRANDING_PIONEERS', 'PROPERTY_JEEVES', 'OTHER']).optional().default('BRANDING_PIONEERS'),
})

// Work entry schemas
export const createWorkEntrySchema = z.object({
  clientId: idSchema.optional(),
  date: dateStringSchema.optional(),
  category: z.string().min(1, 'Category required'),
  deliverableType: z.string().min(1, 'Deliverable type required'),
  quantity: z.number().int().positive().optional().default(1),
  metrics: z.record(z.string(), z.unknown()).optional(),
  resultSummary: z.string().max(1000).optional(),
  resultMetrics: z.record(z.string(), z.unknown()).optional(),
  hoursSpent: z.number().min(0).max(24).optional(),
  description: descriptionSchema,
  notes: notesSchema,
  qualityScore: z.number().min(1).max(10).optional(),
  revisionCount: z.number().int().min(0).optional(),
  turnaroundHours: z.number().min(0).optional(),
  deliverableUrl: urlSchema,
})

// Client property schemas
export const createPropertySchema = z.object({
  type: z.enum(['WEBSITE', 'SOCIAL', 'GMB', 'ANALYTICS', 'ADS', 'OTHER']),
  platform: z.string().max(50).optional(),
  name: z.string().min(1).max(100),
  url: urlSchema,
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional().default('ACTIVE'),
  notes: notesSchema,
})

// ============================================
// VALIDATION UTILITIES
// ============================================

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError }

/**
 * Validate data against a Zod schema
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

/**
 * Parse and validate request body
 */
export async function validateBody<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await req.json()
    return validate(schema, body)
  } catch {
    return {
      success: false,
      error: new z.ZodError([{
        code: 'custom',
        message: 'Invalid JSON body',
        path: [],
      }]),
    }
  }
}

/**
 * Parse and validate query params
 */
export function validateQuery<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  const { searchParams } = new URL(req.url)
  const params = Object.fromEntries(searchParams.entries())
  return validate(schema, params)
}

/**
 * Format Zod errors for API response
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {}

  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root'
    if (!errors[path]) {
      errors[path] = []
    }
    errors[path].push(issue.message)
  }

  return errors
}

/**
 * Create validation error response
 */
export function validationError(error: z.ZodError): NextResponse {
  return NextResponse.json(
    {
      error: 'Validation failed',
      details: formatZodErrors(error),
    },
    { status: 400 }
  )
}

/**
 * Middleware to validate request body
 *
 * Usage:
 * ```ts
 * export const POST = withValidation(createClientSchema, async (req, { data }) => {
 *   // data is validated and typed
 *   const client = await prisma.client.create({ data })
 *   return NextResponse.json(client)
 * })
 * ```
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (
    req: NextRequest,
    context: { data: T; params?: Record<string, string> }
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest, routeContext?: { params?: Promise<Record<string, string>> }) => {
    const result = await validateBody(req, schema)

    if (!result.success) {
      return validationError(result.error)
    }

    const params = routeContext?.params ? await routeContext.params : undefined
    return handler(req, { data: result.data, params })
  }
}

// ============================================
// SANITIZATION HELPERS
// ============================================

/**
 * Sanitize string to prevent XSS
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Sanitize object values recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v =>
        typeof v === 'string' ? sanitizeString(v) : v
      )
    } else if (value !== null && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized as T
}
