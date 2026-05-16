import { withAuth } from '@/server/auth/withAuth'
import { NextResponse } from 'next/server'

export const GET = withAuth(async () => {
  const templates = [
    {
      id: 'tpl_001',
      name: 'Welcome Message',
      content: 'Hello {{1}}! Welcome to our platform. Your verification code is {{2}}.',
      status: 'active' as const,
      usageCount: 12540
    },
    {
      id: 'tpl_002',
      name: 'Order Confirmation',
      content: 'Your order #{{1}} has been confirmed. Estimated delivery: {{2}} business days.',
      status: 'active' as const,
      usageCount: 8930
    },
    {
      id: 'tpl_003',
      name: 'Payment Reminder',
      content: 'Reminder: Payment of ${{1}} is due on {{2}}. Please complete your payment to avoid late fees.',
      status: 'pending' as const,
      usageCount: 0
    },
    {
      id: 'tpl_004',
      name: 'Appointment Reminder',
      content: 'Hi {{1}}, this is a reminder about your appointment on {{2}} at {{3}}. Reply CONFIRM to confirm or RESCHEDULE to reschedule.',
      status: 'rejected' as const,
      usageCount: 0
    }
  ]

  return NextResponse.json({ templates })
})
