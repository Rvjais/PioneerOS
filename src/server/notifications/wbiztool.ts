/**
 * WBizTool WhatsApp API Integration
 *
 * This service handles sending WhatsApp messages via WBizTool API
 */

import { getCredentialsWithFallback } from '@/server/api-credentials'

const WBIZTOOL_BASE_URL = 'https://wbiztool.com/api/v1'

// Cached credentials - lazy loaded with TTL
let cachedConfig: {
  clientId: number
  apiKey: string
  whatsappClient: number
} | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

async function getWBizToolConfig() {
  if (cachedConfig && (Date.now() - cacheTimestamp < CACHE_TTL_MS)) return cachedConfig

  const credentials = await getCredentialsWithFallback('WBIZTOOL')

  cachedConfig = {
    clientId: parseInt(credentials.clientId || process.env.WBIZTOOL_CLIENT_ID || '0'),
    apiKey: credentials.apiKey || process.env.WBIZTOOL_API_KEY || '',
    whatsappClient: parseInt(credentials.whatsappClient || process.env.WBIZTOOL_WHATSAPP_CLIENT || '0'),
  }
  cacheTimestamp = Date.now()

  return cachedConfig
}

/**
 * Check if WBizTool credentials are configured
 */
export async function isWBizToolConfigured(): Promise<boolean> {
  const config = await getWBizToolConfig()
  return !!(
    config.clientId > 0 &&
    config.apiKey &&
    config.whatsappClient > 0
  )
}

/**
 * Validate credentials before making API call
 */
async function validateCredentials(): Promise<void> {
  const configured = await isWBizToolConfigured()
  if (!configured) {
    throw new Error(
      'WBizTool credentials not configured. Configure them in Admin > API Management or set WBIZTOOL_CLIENT_ID, WBIZTOOL_API_KEY, and WBIZTOOL_WHATSAPP_CLIENT in environment variables.'
    )
  }
}

export type MessageType = 'text' | 'image' | 'file'

interface BaseMessagePayload {
  client_id: number
  api_key: string
  whatsapp_client: number
  msg_type: 0 | 1 | 2
  msg: string
  expire_after_seconds?: number
  webhook?: string
}

interface PhoneMessagePayload extends BaseMessagePayload {
  phone: string
  country_code: string
}

interface GroupMessagePayload extends BaseMessagePayload {
  group_name: string
}

interface ImagePayload {
  img_url: string
}

interface FilePayload {
  file_url: string
  file_name: string
}

interface WBizToolResponse {
  status: 0 | 1
  message: string
  msg_id?: number
}

interface SendMessageOptions {
  message: string
  phone?: string
  countryCode?: string
  groupName?: string
  imageUrl?: string
  fileUrl?: string
  fileName?: string
  expireAfterSeconds?: number
  webhook?: string
}

function toFormBody(payload: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) {
      params.append(key, String(value))
    }
  }

  return params.toString()
}

async function parseWBizToolResponse(response: Response): Promise<WBizToolResponse> {
  const responseText = await response.text()

  try {
    const data = JSON.parse(responseText) as WBizToolResponse
    if (!response.ok) {
      return {
        status: 0,
        message: data.message || `HTTP ${response.status}`,
      }
    }
    return data
  } catch {
    return {
      status: 0,
      message: responseText || `HTTP ${response.status}`,
    }
  }
}

/**
 * Parse phone number to remove country code prefix
 */
function parsePhone(phone: string): { phone: string; countryCode: string } {
  // Remove any spaces, dashes, or plus signs
  let cleaned = phone.replace(/[\s\-\+]/g, '')

  // Default to India
  let countryCode = '91'

  // If starts with country code, extract it
  if (cleaned.startsWith('91') && cleaned.length > 10) {
    countryCode = '91'
    cleaned = cleaned.slice(2)
  } else if (cleaned.startsWith('1') && cleaned.length > 10) {
    countryCode = '1'
    cleaned = cleaned.slice(1)
  } else if (cleaned.startsWith('44') && cleaned.length > 10) {
    countryCode = '44'
    cleaned = cleaned.slice(2)
  }

  return { phone: cleaned, countryCode }
}

/**
 * Send a WhatsApp message to a phone number
 */
export async function sendWhatsAppMessage(options: SendMessageOptions): Promise<WBizToolResponse> {
  const { message, phone, countryCode, imageUrl, fileUrl, fileName, expireAfterSeconds, webhook } = options

  // Validate credentials before attempting to send
  await validateCredentials()

  if (!phone) {
    throw new Error('Phone number is required for sending message to phone')
  }

  const config = await getWBizToolConfig()
  const parsed = parsePhone(phone)

  // Determine message type
  let msgType: 0 | 1 | 2 = 0 // Default to text
  if (imageUrl) {
    msgType = 1
  } else if (fileUrl) {
    msgType = 2
  }

  const payload: PhoneMessagePayload & Partial<ImagePayload & FilePayload> = {
    client_id: config.clientId,
    api_key: config.apiKey,
    whatsapp_client: config.whatsappClient,
    msg_type: msgType,
    msg: message,
    phone: parsed.phone,
    country_code: countryCode || parsed.countryCode,
  }

  // Add image URL if present
  if (imageUrl) {
    payload.img_url = imageUrl
  }

  // Add file URL and name if present
  if (fileUrl && fileName) {
    payload.file_url = fileUrl
    payload.file_name = fileName
  }

  // Add optional parameters
  if (expireAfterSeconds) {
    payload.expire_after_seconds = expireAfterSeconds
  }
  if (webhook) {
    payload.webhook = webhook
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(`${WBIZTOOL_BASE_URL}/send_msg/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: toFormBody(payload),
      signal: controller.signal,
    })

    return await parseWBizToolResponse(response)
  } catch (error) {
    console.error('WBizTool API Error:', error)
    return {
      status: 0,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Send a WhatsApp message to a group
 */
export async function sendWhatsAppGroupMessage(options: Omit<SendMessageOptions, 'phone' | 'countryCode'> & { groupName: string }): Promise<WBizToolResponse> {
  const { message, groupName, imageUrl, fileUrl, fileName, expireAfterSeconds, webhook } = options

  // Validate credentials before attempting to send
  await validateCredentials()

  const config = await getWBizToolConfig()

  // Determine message type
  let msgType: 0 | 1 | 2 = 0
  if (imageUrl) {
    msgType = 1
  } else if (fileUrl) {
    msgType = 2
  }

  const payload: GroupMessagePayload & Partial<ImagePayload & FilePayload> = {
    client_id: config.clientId,
    api_key: config.apiKey,
    whatsapp_client: config.whatsappClient,
    msg_type: msgType,
    msg: message,
    group_name: groupName,
  }

  if (imageUrl) {
    payload.img_url = imageUrl
  }

  if (fileUrl && fileName) {
    payload.file_url = fileUrl
    payload.file_name = fileName
  }

  if (expireAfterSeconds) {
    payload.expire_after_seconds = expireAfterSeconds
  }
  if (webhook) {
    payload.webhook = webhook
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(`${WBIZTOOL_BASE_URL}/send_msg/group/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: toFormBody(payload),
      signal: controller.signal,
    })

    return await parseWBizToolResponse(response)
  } catch (error) {
    console.error('WBizTool Group API Error:', error)
    return {
      status: 0,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Notification templates
 */
export const NotificationTemplates = {
  // Client notifications
  welcomeClient: (clientName: string, companyName: string) =>
    `Hello ${clientName}!\n\nWelcome to ${companyName}! We're excited to have you on board.\n\nOur team will reach out to you shortly to discuss your requirements.\n\nBest regards,\nTeam Branding Pioneers`,

  onboardingLink: (clientName: string, link: string) =>
    `Hi ${clientName}!\n\nPlease complete your onboarding by filling out this form:\n${link}\n\nThis will help us understand your business better and deliver excellent results.\n\nThank you!`,

  paymentReminder: (clientName: string, amount: number, dueDate: string) =>
    `Hi ${clientName},\n\nThis is a friendly reminder that your payment of ₹${amount.toLocaleString('en-IN')} is due on ${dueDate}.\n\nPlease ensure timely payment to avoid any service interruption.\n\nThank you!`,

  invoiceSent: (clientName: string, invoiceNumber: string, amount: number) =>
    `Hi ${clientName},\n\nYour proforma invoice ${invoiceNumber} for ₹${amount.toLocaleString('en-IN')} has been generated.\n\nPlease review and process the payment at your earliest convenience.\n\nThank you!`,

  reportReady: (clientName: string, reportType: string, month: string) =>
    `Hi ${clientName},\n\nYour ${reportType} report for ${month} is ready!\n\nYou can view it in your client portal or we'll send it to your email shortly.\n\nBest regards,\nTeam Branding Pioneers`,

  meetingReminder: (clientName: string, meetingTime: string, meetingLink?: string) =>
    `Hi ${clientName},\n\nReminder: Your meeting is scheduled for ${meetingTime}.\n${meetingLink ? `\nJoin here: ${meetingLink}` : ''}\n\nLooking forward to speaking with you!`,

  // Employee notifications
  taskAssigned: (employeeName: string, taskTitle: string, clientName: string) =>
    `Hi ${employeeName},\n\nYou have been assigned a new task:\n\n*${taskTitle}*\nClient: ${clientName}\n\nPlease check the task details in your dashboard.`,

  leaveApproved: (employeeName: string, leaveType: string, dates: string) =>
    `Hi ${employeeName},\n\nYour ${leaveType} leave request for ${dates} has been approved.\n\nEnjoy your time off!`,

  leaveRejected: (employeeName: string, leaveType: string, reason?: string) =>
    `Hi ${employeeName},\n\nYour ${leaveType} leave request has been declined.${reason ? `\n\nReason: ${reason}` : ''}\n\nPlease contact HR for more details.`,

  attendanceAlert: (employeeName: string) =>
    `Hi ${employeeName},\n\nWe noticed you haven't punched in today. Please ensure you mark your attendance.\n\nIf you're on leave, please ignore this message.`,

  salaryProcessed: (employeeName: string, month: string, amount: number) =>
    `Hi ${employeeName},\n\nYour salary for ${month} (₹${amount.toLocaleString('en-IN')}) has been processed.\n\nPlease check your bank account.\n\nBest regards,\nHR Team`,
}

/**
 * Send notification to client
 */
export async function notifyClient(
  phone: string,
  template: keyof typeof NotificationTemplates,
  ...args: any[]
): Promise<WBizToolResponse> {
  const templateFn = NotificationTemplates[template] as (...args: any[]) => string
  const message = templateFn(...args)

  return sendWhatsAppMessage({
    phone,
    message,
  })
}

/**
 * Send bulk notifications
 */
export async function sendBulkNotifications(
  recipients: Array<{ phone: string; message: string }>,
  delayMs: number = 1000
): Promise<Array<{ phone: string; result: WBizToolResponse }>> {
  const results: Array<{ phone: string; result: WBizToolResponse }> = []

  for (const recipient of recipients) {
    const result = await sendWhatsAppMessage({
      phone: recipient.phone,
      message: recipient.message,
    })
    results.push({ phone: recipient.phone, result })

    // Add delay between messages to avoid rate limiting
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return results
}
