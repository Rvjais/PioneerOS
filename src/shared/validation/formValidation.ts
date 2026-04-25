import { z } from 'zod'

// ============================================
// SHARED VALIDATION SCHEMAS
// ============================================

// Phone number validation for Indian format
const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const phoneSchema = z.string()
  .regex(phoneRegex, 'Enter a valid Indian phone number (10 digits starting with 6-9)')
  .or(z.literal(''))

export const emailSchema = z.string()
  .regex(emailRegex, 'Enter a valid email address')

export const urlSchema = z.string()
  .url('Enter a valid URL (e.g., https://example.com)')
  .or(z.literal(''))

// ============================================
// CLIENT ONBOARDING VALIDATION
// ============================================

// Step 1: Welcome/Basic Info
export const onboardingStep1Schema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters'),
  contactEmail: emailSchema,
  contactPhone: z.string().regex(phoneRegex, 'Enter a valid phone number'),
  whatsapp: phoneSchema.optional(),
  industry: z.string().min(1, 'Please select an industry'),
})

// Step 2: Services
export const onboardingStep2Schema = z.object({
  services: z.array(z.string()).min(1, 'Please select at least one service'),
})

// Step 3: Social Media
export const onboardingStep3Schema = z.object({
  social_platforms: z.array(z.string()).optional(),
  social_contentCreation: z.string().optional(),
  social_postFrequency: z.string().optional(),
  social_approvalRequired: z.string().optional(),
}).refine(
  (data) => {
    // If social media is selected as a service, platforms should be selected
    return true // Can add conditional validation here
  },
  { message: 'Please select at least one social platform' }
)

// Step 5: Ads & Budget
export const onboardingStep5Schema = z.object({
  ads_platforms: z.array(z.string()).optional(),
  ads_monthlyBudget: z.string().optional(),
  ads_objective: z.string().optional(),
}).refine(
  (data) => {
    // If ads platforms are selected, budget should be provided
    if (data.ads_platforms && data.ads_platforms.length > 0) {
      return data.ads_monthlyBudget !== ''
    }
    return true
  },
  { message: 'Please specify your monthly ad budget', path: ['ads_monthlyBudget'] }
)

// Step 7: Business Details
export const onboardingStep7Schema = z.object({
  biz_targetAudience: z.string().min(1, 'Please select target audience'),
  biz_usp: z.string().min(10, 'Please describe what makes your business unique (min 10 characters)'),
  biz_brandVoice: z.string().min(1, 'Please select brand voice'),
})

// Step 9: Communication
export const onboardingStep9Schema = z.object({
  comm_primary: z.string().min(1, 'Please select primary communication method'),
  comm_meetingFrequency: z.string().min(1, 'Please select meeting frequency'),
  comm_reportFrequency: z.string().min(1, 'Please select report frequency'),
})

// Step 10: Acknowledgments
export const onboardingStep10Schema = z.object({
  ack_accurateInfo: z.boolean().refine(val => val === true, { message: 'You must confirm information accuracy' }),
  ack_communicationPolicy: z.boolean().refine(val => val === true, { message: 'You must accept communication policy' }),
  ack_revisionPolicy: z.boolean().refine(val => val === true, { message: 'You must accept revision policy' }),
})

// ============================================
// TOKEN-BASED ONBOARDING VALIDATION
// ============================================

export const tokenOnboardingStep1Schema = z.object({
  contactName: z.string().min(2, 'Name must be at least 2 characters'),
  contactEmail: emailSchema,
  contactPhone: z.string().regex(phoneRegex, 'Enter a valid phone number'),
  whatsappNumber: phoneSchema.optional(),
  preferredCommunication: z.array(z.string()).min(1, 'Select at least one communication method'),
})

export const tokenOnboardingStep2Schema = z.object({
  businessType: z.string().min(1, 'Please select business type'),
  specializations: z.array(z.string()).optional(),
  yearsInBusiness: z.string().optional(),
})

export const tokenOnboardingStep3Schema = z.object({
  servicesInterested: z.array(z.string()).min(1, 'Select at least one service'),
  primaryGoal: z.string().min(1, 'Please select primary goal'),
  targetAudience: z.array(z.string()).min(1, 'Select at least one target audience'),
  monthlyBudget: z.string().min(1, 'Please select budget range'),
})

export const tokenOnboardingStep5Schema = z.object({
  termsAccepted: z.boolean().refine(val => val === true, { message: 'You must accept the terms' }),
  ndaAccepted: z.boolean().refine(val => val === true, { message: 'You must accept the NDA' }),
})

// ============================================
// CREDENTIAL FORM VALIDATION
// ============================================

export const credentialSchema = z.object({
  platform: z.string().min(1, 'Platform name is required'),
  category: z.enum(['PLATFORM', 'SOCIAL', 'HOSTING', 'ANALYTICS', 'ADS', 'OTHER']),
  username: z.string().optional(),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  password: z.string().optional(),
  url: urlSchema.optional(),
  apiKey: z.string().optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
})

// ============================================
// PROFILE FORM VALIDATION
// ============================================

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  phone: phoneSchema.optional(),
})

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// ============================================
// SUPPORT TICKET VALIDATION
// ============================================

export const supportTicketSchema = z.object({
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject cannot exceed 200 characters'),
  message: z.string()
    .min(20, 'Please provide more details (minimum 20 characters)')
    .max(2000, 'Message cannot exceed 2000 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  type: z.enum(['REQUEST', 'ISSUE', 'FEEDBACK']).optional(),
})

// ============================================
// HELPER FUNCTIONS
// ============================================

export type ValidationError = {
  field: string
  message: string
}

export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errors: ValidationError[] = result.error.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
  }))

  return { success: false, errors }
}

export function getFieldError(errors: ValidationError[], field: string): string | undefined {
  return errors.find(e => e.field === field)?.message
}

export function hasFieldError(errors: ValidationError[], field: string): boolean {
  return errors.some(e => e.field === field)
}

// ============================================
// FORM FIELD TYPES
// ============================================

export interface FormFieldConfig {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'url' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'chips'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string; description?: string }[]
  helpText?: string
  validation?: z.ZodType
  conditional?: {
    field: string
    value: string | string[] | boolean
  }
}

// ============================================
// REAL-TIME VALIDATION HOOKS
// ============================================

export function createFieldValidator<T extends z.ZodType>(schema: T) {
  return (value: unknown): string | null => {
    const result = schema.safeParse(value)
    if (result.success) return null
    return result.error.issues[0]?.message || 'Invalid value'
  }
}

// Pre-built validators for common fields
export const validators = {
  email: createFieldValidator(emailSchema),
  phone: createFieldValidator(z.string().regex(phoneRegex, 'Enter a valid phone number')),
  url: createFieldValidator(urlSchema),
  required: createFieldValidator(z.string().min(1, 'This field is required')),
  minLength: (min: number) => createFieldValidator(z.string().min(min, `Minimum ${min} characters required`)),
  maxLength: (max: number) => createFieldValidator(z.string().max(max, `Maximum ${max} characters allowed`)),
}
