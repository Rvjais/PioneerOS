import { NextResponse } from 'next/server'
import { getAuthUrl } from '@/server/integrations/google-drive'
import { withAuth } from '@/server/auth/withAuth'

// GET: Generate OAuth URL and redirect user to Google
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authUrl = getAuthUrl(user.id)

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Error generating Google auth URL:', error)
    return NextResponse.json({ error: 'Failed to initiate Google Drive connection' }, { status: 500 })
  }
})
