import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'
import { logAdminAction } from '@/server/services/adminAudit'

const updateSettingsSchema = z.object({
  settings: z.record(z.string(), z.unknown()),
})

// Default settings that will be seeded if not present
const DEFAULT_SETTINGS = [
  // General
  { key: 'company_name', value: 'Branding Pioneers', category: 'general', description: 'Company display name' },
  { key: 'timezone', value: 'Asia/Kolkata', category: 'general', description: 'System timezone' },
  { key: 'date_format', value: 'DD/MM/YYYY', category: 'general', description: 'Date display format' },
  { key: 'fiscal_year_start', value: 'April', category: 'general', description: 'Fiscal year start month' },

  // Notifications
  { key: 'email_notifications', value: 'true', category: 'notifications', description: 'Enable email notifications' },
  { key: 'whatsapp_notifications', value: 'true', category: 'notifications', description: 'Enable WhatsApp notifications' },
  { key: 'task_reminders', value: 'true', category: 'notifications', description: 'Enable task reminder notifications' },
  { key: 'daily_digest', value: 'false', category: 'notifications', description: 'Send daily digest emails' },

  // Attendance
  { key: 'work_start_time', value: '09:00', category: 'attendance', description: 'Standard work start time' },
  { key: 'work_end_time', value: '18:00', category: 'attendance', description: 'Standard work end time' },
  { key: 'late_threshold_mins', value: '15', category: 'attendance', description: 'Minutes after which marked late' },
  { key: 'auto_checkout', value: 'true', category: 'attendance', description: 'Auto checkout at end of day' },

  // Meetings
  { key: 'huddle_time', value: '11:00', category: 'meetings', description: 'Daily huddle time' },
  { key: 'tactical_deadline', value: '3', category: 'meetings', description: 'Tactical submission deadline (day of week)' },
  { key: 'mom_required', value: 'true', category: 'meetings', description: 'Require MoM for online meetings' },
  { key: 'auto_reminders', value: 'true', category: 'meetings', description: 'Auto send meeting reminders' },

  // Security
  { key: 'session_timeout', value: '24', category: 'security', description: 'Session timeout in hours' },
  { key: 'require_2fa', value: 'false', category: 'security', description: 'Require 2FA for admins' },
  { key: 'ip_whitelist', value: 'false', category: 'security', description: 'Enable IP whitelist' },
  { key: 'audit_logging', value: 'true', category: 'security', description: 'Enable audit logging' },

  // Integrations
  { key: 'whatsapp_enabled', value: 'true', category: 'integrations', description: 'WhatsApp integration' },
  { key: 'google_calendar', value: 'false', category: 'integrations', description: 'Google Calendar sync' },
  { key: 'slack_enabled', value: 'false', category: 'integrations', description: 'Slack integration' },
  { key: 'ai_suggestions', value: 'true', category: 'integrations', description: 'AI-powered suggestions' },
]

// GET - Fetch all settings
export const GET = withAuth(async () => {
  try {
    // Get all settings from DB
    let settings = await prisma.systemSetting.findMany({
      orderBy: { category: 'asc' }
    })

    // If no settings exist, seed defaults
    if (settings.length === 0) {
      await prisma.systemSetting.createMany({
        data: DEFAULT_SETTINGS
      })
      settings = await prisma.systemSetting.findMany({
        orderBy: { category: 'asc' }
      })
    }

    // Convert to key-value map
    const settingsMap: Record<string, string | boolean> = {}
    settings.forEach(s => {
      // Parse boolean strings
      if (s.value === 'true') settingsMap[s.key] = true
      else if (s.value === 'false') settingsMap[s.key] = false
      else settingsMap[s.key] = s.value
    })

    return NextResponse.json({ settings: settingsMap })
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN'] })

// POST - Update settings
export const POST = withAuth(async (req, { user }) => {
  try {
    const raw = await req.json()
    const parsed = updateSettingsSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { settings } = parsed.data

    // Validate keys against known settings to prevent arbitrary key injection
    const validKeys = DEFAULT_SETTINGS.map(s => s.key)
    for (const key of Object.keys(settings)) {
      if (!validKeys.includes(key)) {
        return NextResponse.json({ error: 'Unknown setting: ' + key }, { status: 400 })
      }
    }

    // Update each setting
    const updates = Object.entries(settings).map(([key, value]) => {
      const stringValue = typeof value === 'boolean' ? String(value) : String(value)
      return prisma.systemSetting.upsert({
        where: { key },
        update: {
          value: stringValue,
          updatedBy: user.id
        },
        create: {
          key,
          value: stringValue,
          category: getCategoryForKey(key),
          updatedBy: user.id
        }
      })
    })

    await Promise.all(updates)

    // Audit log
    const changedKeys = Object.keys(settings).join(', ')
    await logAdminAction({
      userId: user.id,
      action: 'SETTINGS_UPDATE',
      title: 'System Settings Updated',
      message: `Changed settings: ${changedKeys}`,
      link: '/admin/settings',
    })

    return NextResponse.json({ success: true, message: 'Settings saved successfully' })
  } catch (error) {
    console.error('Failed to save settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN'] })

// Helper to determine category from key
function getCategoryForKey(key: string): string {
  if (key.includes('notification') || key.includes('reminder') || key.includes('digest')) return 'notifications'
  if (key.includes('attendance') || key.includes('work_') || key.includes('checkout') || key.includes('late')) return 'attendance'
  if (key.includes('meeting') || key.includes('huddle') || key.includes('tactical') || key.includes('mom')) return 'meetings'
  if (key.includes('session') || key.includes('2fa') || key.includes('ip_') || key.includes('audit')) return 'security'
  if (key.includes('enabled') || key.includes('calendar') || key.includes('slack') || key.includes('ai_')) return 'integrations'
  return 'general'
}
